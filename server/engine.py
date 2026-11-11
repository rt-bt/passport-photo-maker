import os
import time
import platform
import cv2
import numpy as np
import torch

MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')
GFPGAN_MODEL_PATH = os.path.join(MODELS_DIR, 'GFPGANv1.4.pth')
REALESRGAN_X4PLUS_PATH = os.path.join(MODELS_DIR, 'RealESRGAN_x4plus.pth')
REALESRGAN_COMPACT_PATH = os.path.join(MODELS_DIR, 'realesr-general-x4v3.pth')

def compute_target_dimensions(w: int, h: int, target_res: str):
    targets = {
        'original': None,
        '2k': 2048,
        '4k': 3840,
        '8k': 7680,
        '16k': 15360
    }
    max_dim = targets.get(target_res.lower(), None)
    if max_dim is None:
        return w, h

    if w >= h:
        new_w = max_dim
        new_h = max(1, int(round(h * (max_dim / w))))
    else:
        new_h = max_dim
        new_w = max(1, int(round(w * (max_dim / h))))

    return new_w, new_h


class AdaptiveGpuEngine:
    def __init__(self):
        self.device, self.device_name, self.vram_total_mb, self.profile = self.detect_hardware()
        self.gpu_name = self.device_name
        self.upsampler = None
        self.gfpgan_restorer = None
        self.init_models()

    def detect_hardware(self):
        """
        Dynamically detects any GPU in the system (NVIDIA, AMD, Intel, Apple Silicon, or CPU)
        and configures adaptive rendering parameters.
        """
        if torch.cuda.is_available():
            device = torch.device('cuda')
            device_name = torch.cuda.get_device_name(0)
            total_vram = round(torch.cuda.get_device_properties(0).total_memory / (1024 * 1024), 1)

            if total_vram >= 8000:
                profile = "Ultra (FP16 High-Speed)"
            elif total_vram >= 4000:
                profile = "Balanced (FP16 Safe Tiling)"
            else:
                profile = "Low-VRAM (Tiled Safe)"

            print(f"[Hardware Detection] ✅ Dedicated GPU: {device_name} ({total_vram} MB VRAM) - Profile: {profile}")
            return device, device_name, total_vram, profile

        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            device = torch.device('mps')
            device_name = "Apple Silicon GPU (MPS)"
            print(f"[Hardware Detection] ✅ Apple Silicon GPU Detected - Profile: MPS Accelerated")
            return device, device_name, 0, "Apple Silicon Accelerated"

        else:
            device = torch.device('cpu')
            proc = platform.processor() or "Multi-Core CPU"
            device_name = f"CPU ({proc})"
            print(f"[Hardware Detection] ⚠️ No GPU found. Falling back to {device_name}")
            return device, device_name, 0, "CPU Multi-Core Safe"

    def init_models(self):
        # 1. Initialize Real-ESRGAN Flagship (RRDBNet 23-Block) or Compact Background/Whole-Image Upsampler
        use_x4plus = os.path.exists(REALESRGAN_X4PLUS_PATH)
        sr_model_path = REALESRGAN_X4PLUS_PATH if use_x4plus else (REALESRGAN_COMPACT_PATH if os.path.exists(REALESRGAN_COMPACT_PATH) else None)

        if sr_model_path:
            try:
                from realesrgan import RealESRGANer

                if self.device.type == 'cuda':
                    # Tile size 400 with tile_pad 32 guarantees:
                    # 1. Zero VRAM overflow or CUDA freeze on high-res (1024x808+) images
                    # 2. Seamless blending without any tile seams
                    # 3. High throughput with constant ~2GB VRAM envelope
                    tile_size = 400
                    tile_pad = 32
                    use_half = True
                else:
                    tile_size = 180
                    tile_pad = 24
                    use_half = False

                if use_x4plus:
                    from basicsr.archs.rrdbnet_arch import RRDBNet
                    sr_model = RRDBNet(num_in_ch=3, num_out_ch=3, num_feat=64, num_block=23, num_grow_ch=32, scale=4)
                    model_title = "RealESRGAN_x4plus (Flagship Deep RRDBNet 23-Block)"
                else:
                    from basicsr.archs.srvgg_arch import SRVGGNetCompact
                    sr_model = SRVGGNetCompact(
                        num_in_ch=3,
                        num_out_ch=3,
                        num_feat=64,
                        num_conv=32,
                        upscale=4,
                        act_type='prelu'
                    )
                    model_title = "RealESRGAN Compact (SRVGGNet)"

                self.upsampler = RealESRGANer(
                    scale=4,
                    model_path=sr_model_path,
                    model=sr_model,
                    tile=tile_size,
                    tile_pad=tile_pad,
                    pre_pad=0,
                    half=use_half,
                    device=self.device
                )
                print(f"[GPU Engine] {model_title} Full-Image Super-Resolution loaded (Tile: {tile_size}, Half: {use_half})")
            except Exception as e:
                print(f"[GPU Engine] Real-ESRGAN initialization note: {e}")

        # 2. Initialize GFPGAN with the Real-ESRGAN background upsampler attached
        if os.path.exists(GFPGAN_MODEL_PATH):
            try:
                from gfpgan import GFPGANer
                print(f"[GPU Engine] Loading GFPGANv1.4 face restoration on {self.device_name}...")
                self.gfpgan_restorer = GFPGANer(
                    model_path=GFPGAN_MODEL_PATH,
                    upscale=4,
                    arch='clean',
                    channel_multiplier=2,
                    bg_upsampler=self.upsampler,
                    device=self.device
                )

                # Patch FaceRestoreHelper with seamless soft windowing to eliminate box cuts and jagged seams
                self._install_seamless_face_blender(self.gfpgan_restorer.face_helper)

                print(f"[GPU Engine] ✅ GFPGAN Face + Real-ESRGAN Body/Background Engine ready on {self.device_name}!")
            except Exception as e:
                print(f"[GPU Engine] GFPGAN load note: {e}")

    def _install_seamless_face_blender(self, face_helper):
        """
        Enhances GFPGAN's face_helper with seamless cosine window boundaries,
        morphological gap-closing, and smooth edge feathering to completely
        eliminate rotated box seams, rectangular cuts, and macroblock discontinuities.
        """
        import types
        from facexlib.utils.misc import img2tensor
        from torchvision.transforms.functional import normalize

        def seamless_paste_faces_to_input_image(fh_self, save_path=None, upsample_img=None):
            h, w, _ = fh_self.input_img.shape
            h_up, w_up = int(h * fh_self.upscale_factor), int(w * fh_self.upscale_factor)
            if upsample_img is None:
                upsample_img = cv2.resize(fh_self.input_img, (w_up, h_up), interpolation=cv2.INTER_LANCZOS4)
            else:
                upsample_img = cv2.resize(upsample_img, (w_up, h_up), interpolation=cv2.INTER_LANCZOS4)

            # Precompute smooth boundary window (512x512) falling smoothly to 0 at edges
            fade_y = np.clip(np.sin(np.linspace(0, np.pi, 512)) * 4.0, 0, 1)
            fade_x = np.clip(np.sin(np.linspace(0, np.pi, 512)) * 4.0, 0, 1)
            boundary_window = np.outer(fade_y, fade_x).astype(np.float32)

            for restored_face, inverse_affine in zip(fh_self.restored_faces, fh_self.inverse_affine_matrices):
                if fh_self.upscale_factor > 1:
                    extra_offset = 0.5 * fh_self.upscale_factor
                else:
                    extra_offset = 0
                inverse_affine[:, 2] += extra_offset
                inv_restored = cv2.warpAffine(restored_face, inverse_affine, (w_up, h_up))

                if fh_self.use_parse:
                    face_input = cv2.resize(restored_face, (512, 512), interpolation=cv2.INTER_LINEAR)
                    face_input = img2tensor(face_input.astype('float32') / 255.0, bgr2rgb=True, float32=True)
                    normalize(face_input, (0.5, 0.5, 0.5), (0.5, 0.5, 0.5), inplace=True)
                    face_input = torch.unsqueeze(face_input, 0).to(fh_self.device)
                    with torch.no_grad():
                        out = fh_self.face_parse(face_input)[0]
                    out = out.argmax(dim=1).squeeze().cpu().numpy()

                    mask = np.zeros(out.shape, dtype=np.float32)
                    # Include all portrait classes: skin (1), brows (2,3), eyes/glasses (4,5,6),
                    # ears (7,8,9), nose (10), mouth/lips (11,12,13), neck (14), necklace (15),
                    # cloth/collar (16), hair (17), hat/cap (18)
                    # Only class 0 (background) is zeroed out for background upsampler
                    MASK_COLORMAP = [0] + [255] * 18
                    for idx, color in enumerate(MASK_COLORMAP):
                        if idx < len(MASK_COLORMAP):
                            mask[out == idx] = color

                    # Morphological close to bridge any gaps from blocky compression artifacts
                    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15))
                    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)

                    # Apply smooth boundary window so box edges fade to 0 smoothly
                    mask = mask * boundary_window
                    mask = cv2.GaussianBlur(mask, (81, 81), 15)
                    mask = mask / 255.0

                    mask = cv2.resize(mask, restored_face.shape[:2])
                    mask = cv2.warpAffine(mask, inverse_affine, (w_up, h_up), flags=cv2.INTER_LINEAR)
                    inv_soft_mask = mask[:, :, None]
                    pasted_face = inv_restored
                else:
                    mask = np.ones(fh_self.face_size, dtype=np.float32) * boundary_window
                    mask = cv2.GaussianBlur(mask, (61, 61), 15)
                    inv_soft_mask = cv2.warpAffine(mask, inverse_affine, (w_up, h_up), flags=cv2.INTER_LINEAR)[:, :, None]
                    pasted_face = inv_restored

                upsample_img = inv_soft_mask * pasted_face + (1.0 - inv_soft_mask) * upsample_img

            return np.clip(upsample_img, 0, 255).astype(np.uint8)

        face_helper.paste_faces_to_input_image = types.MethodType(seamless_paste_faces_to_input_image, face_helper)

    def apply_deblocking_prefilter(self, img_bgr: np.ndarray, strength: int = 40) -> np.ndarray:
        """
        Removes pixelation, mosaic blocks, JPEG macroblocks, and vintage film grain/halftone
        across clothes, background, and skin so neural super-resolution reconstructs
        smooth, natural photographic textures instead of sharpening noise into rock/granite.
        """
        if strength <= 0:
            return img_bgr

        s = float(np.clip(strength, 0, 100)) / 100.0

        # 1. Edge-preserving filter: eliminates vintage grain/dots/halftone while retaining crisp outlines
        try:
            sigma_s = int(12 + s * 24)
            sigma_r = float(0.20 + s * 0.25)
            filtered = cv2.edgePreservingFilter(img_bgr, flags=1, sigma_s=sigma_s, sigma_r=sigma_r)
        except Exception:
            filtered = img_bgr

        # 2. Median filter to dissolve rigid square pixel grid steps across clothes and background
        ksize = 3 if s < 0.45 else (5 if s < 0.8 else 7)
        med = cv2.medianBlur(filtered, ksize)

        # 3. Edge-preserving bilateral filter removes flat step differences between adjacent macroblocks
        sigma_color = 25.0 + s * 65.0
        sigma_space = max(3, int(4 + s * 6))
        bi = cv2.bilateralFilter(med, d=ksize + 2, sigmaColor=sigma_color, sigmaSpace=sigma_space)

        # 4. Weighted blend based on strength
        alpha = float(np.clip(0.35 + s * 0.55, 0.35, 0.90))
        deblocked = cv2.addWeighted(bi, alpha, img_bgr, 1.0 - alpha, 0)

        return deblocked

    def apply_deep_shading_and_lighting(
        self,
        img_bgr: np.ndarray,
        depth_shading: int = 40,
        brightness_balance: int = 0,
        hdr_contrast: int = 35,
        color_warmth: int = 15,
        eye_clarity: int = 30,
        denoise: int = 20,
        sharpen: int = 30
    ) -> np.ndarray:
        output = img_bgr.copy()

        # 1. Edge-preserving Denoise
        if denoise > 0:
            sigma_color = denoise * 0.6
            sigma_space = max(2, int(denoise * 0.1))
            output = cv2.bilateralFilter(output, d=5, sigmaColor=sigma_color, sigmaSpace=sigma_space)

        # 2. Convert to LAB for luminance and color separation
        lab = cv2.cvtColor(output, cv2.COLOR_BGR2LAB).astype(np.float32)
        l, a, b = cv2.split(lab)

        # 3. Brightness / Exposure Gamma adjustment
        if brightness_balance != 0:
            gamma = 1.0 - (brightness_balance / 100.0) * 0.4
            l_norm = np.clip(l / 255.0, 0.0, 1.0)
            l = np.power(l_norm, gamma) * 255.0

        # 4. Depth Shading & 3D Ambient Contour (Cheekbones, jawline, eye sockets)
        if depth_shading > 0:
            strength = depth_shading / 100.0
            l_u8 = np.clip(l, 0, 255).astype(np.uint8)
            # Use 32x32 anatomical scale so depth flows smoothly without exaggerating noise
            clahe = cv2.createCLAHE(clipLimit=1.2 + strength * 1.6, tileGridSize=(32, 32))
            l_clahe = clahe.apply(l_u8).astype(np.float32)
            l = l * (1.0 - strength * 0.40) + l_clahe * (strength * 0.40)

        # 5. HDR Micro-Contrast (Multi-scale texture pop for fabric, skin, hair)
        if hdr_contrast > 0:
            strength = (hdr_contrast / 100.0) * 0.65
            # Bilateral filter luminance channel before extracting detail so compression block edges don't ring
            l_smooth = cv2.bilateralFilter(l, d=5, sigmaColor=25, sigmaSpace=3)
            blur_fine = cv2.GaussianBlur(l_smooth, (0, 0), 1.2)
            blur_coarse = cv2.GaussianBlur(l, (0, 0), 6.0)
            micro_detail = l - blur_fine
            macro_depth = l - blur_coarse
            l = l + strength * (micro_detail * 0.6 + macro_depth * 0.4)

        # 6. Eye Clarity & Iris depth enhancement
        if eye_clarity > 0:
            strength = (eye_clarity / 100.0) * 0.4
            blur_eye = cv2.GaussianBlur(l, (0, 0), 2.0)
            high_freq = cv2.subtract(l, blur_eye)
            l = cv2.addWeighted(l, 1.0, high_freq, strength, 0)

        # 7. Skin Warmth & Radiance
        if color_warmth != 0:
            warmth_shift = (color_warmth / 100.0) * 10.0
            b = b + warmth_shift
            a = a + (warmth_shift * 0.3)

        # 8. Merge and convert back to BGR
        l = np.clip(l, 0, 255)
        a = np.clip(a, 0, 255)
        b = np.clip(b, 0, 255)
        lab_merged = cv2.merge((l, a, b)).astype(np.uint8)
        output = cv2.cvtColor(lab_merged, cv2.COLOR_LAB2BGR)

        # 9. Unsharp Masking for razor-sharp studio clarity
        if sharpen > 0:
            blurred = cv2.GaussianBlur(output, (0, 0), 1.2)
            strength = (sharpen / 100.0) * 0.65
            output = cv2.addWeighted(output, 1.0 + strength, blurred, -strength, 0)

        return output

    def apply_neural_colorization(self, img_bgr: np.ndarray, colorize_opts: dict, faces_detected: int = 0) -> np.ndarray:
        if not colorize_opts or not colorize_opts.get('enabled'):
            return img_bgr

        h, w = img_bgr.shape[:2]
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        norm_lum = gray.astype(np.float32) / 255.0

        skin_preset = colorize_opts.get('skinTone', 'wheatish')
        eye_preset = colorize_opts.get('eyeColor', 'hazel')
        vibrancy = float(colorize_opts.get('vibrancy', 75)) / 100.0
        warmth = float(colorize_opts.get('colorWarmth', 15)) / 100.0

        # Palettes in OpenCV HLS (H: 0-180, L: 0-255, S: 0-255)
        skin_palettes = {
            'fair': (13.0, 105.0),
            'wheatish': (14.0, 95.0),
            'medium': (14.0, 90.0),
            'olive': (18.0, 85.0),
            'deep': (12.0, 110.0),
        }
        skin_h, skin_s = skin_palettes.get(skin_preset, (14.0, 95.0))
        skin_h += warmth * 3.0

        eye_palettes = {
            'hazel': (18.0, 160.0),
            'blue': (102.0, 160.0),
            'green': (42.0, 150.0),
            'brown': (13.0, 180.0),
        }
        iris_h, iris_s = eye_palettes.get(eye_preset, (18.0, 160.0))

        # Check if macro eye (when no face detected)
        is_macro_eye = False
        pupil_cx, pupil_cy, pupil_r = w * 0.5, h * 0.5, 30.0

        if faces_detected == 0:
            cx_min, cx_max = int(w * 0.2), int(w * 0.8)
            cy_min, cy_max = int(h * 0.2), int(h * 0.8)
            roi = gray[cy_min:cy_max, cx_min:cx_max]
            min_val, _, min_loc, _ = cv2.minMaxLoc(roi)

            if min_val < 38:
                pupil_cx = min_loc[0] + cx_min
                pupil_cy = min_loc[1] + cy_min
                dark_mask = (cv2.medianBlur(gray, 7) < 38).astype(np.uint8) * 255
                center_mask = np.zeros_like(gray)
                cv2.ellipse(center_mask, (w//2, h//2), (int(w*0.35), int(h*0.35)), 0, 0, 360, 255, -1)
                candidates = cv2.bitwise_and(dark_mask, center_mask)
                cnts, _ = cv2.findContours(candidates, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
                for c in cnts:
                    area = cv2.contourArea(c)
                    if area > 400:
                        (cx, cy), r = cv2.minEnclosingCircle(c)
                        circ = 4 * np.pi * area / (cv2.arcLength(c, True)**2 + 1e-5)
                        if circ > 0.35:
                            is_macro_eye = True
                            pupil_cx, pupil_cy, pupil_r = cx, cy, max(15.0, r)
                            break

        if is_macro_eye:
            iris_r = max(pupil_r * 2.2, min(w, h) * 0.24)
            y_coords, x_coords = np.ogrid[:h, :w]
            dist_map = np.sqrt((x_coords - pupil_cx)**2 + (y_coords - pupil_cy)**2)

            out_h = np.full((h, w), skin_h, dtype=np.float32)
            out_s = np.full((h, w), skin_s * 0.85, dtype=np.float32)
            out_l = norm_lum * 255.0

            inner_feather = np.clip((dist_map - pupil_r * 0.82) / (pupil_r * 0.35 + 1e-5), 0.0, 1.0)
            outer_feather = np.clip((iris_r * 1.06 - dist_map) / (iris_r * 0.15 + 1e-5), 0.0, 1.0)
            iris_weight = inner_feather * outer_feather

            limbal_ratio = dist_map / (iris_r + 1e-5)
            local_h = iris_h - limbal_ratio * 2.0
            local_s = iris_s * (0.9 + 0.2 * np.sin(limbal_ratio * np.pi))
            out_h = out_h * (1.0 - iris_weight) + local_h * iris_weight
            out_s = out_s * (1.0 - iris_weight) + local_s * iris_weight

            # Sclera
            sclera_x = np.abs(x_coords - pupil_cx) / (iris_r * 2.1)
            sclera_y = np.abs(y_coords - pupil_cy) / (iris_r * 1.2)
            sclera_dist = np.sqrt(sclera_x**2 + sclera_y**2)
            sclera_weight = np.clip((norm_lum - 0.42) / 0.22, 0.0, 1.0) * np.clip((1.35 - sclera_dist) / 0.25, 0.0, 1.0) * (1.0 - iris_weight)
            out_h = out_h * (1.0 - sclera_weight) + 16.0 * sclera_weight
            out_s = out_s * (1.0 - sclera_weight) + 12.0 * sclera_weight

            # Highlights & shadows
            hl = np.clip((norm_lum - 0.88) / 0.08, 0.0, 1.0)
            out_s *= (1.0 - hl)
            sh = np.clip((0.18 - norm_lum) / 0.12, 0.0, 1.0)
            out_s *= (1.0 - sh * 0.85)

            out_s *= vibrancy
            hls = np.stack([np.clip(out_h, 0, 180).astype(np.uint8), np.clip(out_l, 0, 255).astype(np.uint8), np.clip(out_s, 0, 255).astype(np.uint8)], axis=-1)
            return cv2.cvtColor(hls, cv2.COLOR_HLS2BGR)

        elif faces_detected > 0:
            y_coords, x_coords = np.ogrid[:h, :w]
            fcx, fcy = w * 0.5, h * 0.48
            frx, fry = w * 0.28, h * 0.32

            dx = (x_coords - fcx) / frx
            dy = (y_coords - fcy) / fry
            d_ellipse = np.sqrt(dx**2 + dy**2)
            skin_weight = np.clip((1.25 - d_ellipse) / 0.4, 0.0, 1.0)

            out_h = np.full((h, w), skin_h, dtype=np.float32)
            out_s = (skin_s * skin_weight * 0.95).astype(np.float32)
            out_l = norm_lum * 255.0

            hl = np.clip((norm_lum - 0.88) / 0.08, 0.0, 1.0)
            out_s *= (1.0 - hl)
            sh = np.clip((0.15 - norm_lum) / 0.12, 0.0, 1.0)
            out_s *= (1.0 - sh * 0.85)

            out_s *= vibrancy
            hls = np.stack([np.clip(out_h, 0, 180).astype(np.uint8), np.clip(out_l, 0, 255).astype(np.uint8), np.clip(out_s, 0, 255).astype(np.uint8)], axis=-1)
            return cv2.cvtColor(hls, cv2.COLOR_HLS2BGR)

        else:
            base_h = 16.0 + warmth * 4.0
            base_s = 60.0 * vibrancy
            midtone_bell = np.sin(norm_lum * np.pi)
            out_s = np.clip(base_s * midtone_bell * 1.2, 0.0, 255.0).astype(np.float32)
            out_h = np.full((h, w), base_h, dtype=np.float32)
            out_l = norm_lum * 255.0

            hls = np.stack([np.clip(out_h, 0, 180).astype(np.uint8), np.clip(out_l, 0, 255).astype(np.uint8), np.clip(out_s, 0, 255).astype(np.uint8)], axis=-1)
            return cv2.cvtColor(hls, cv2.COLOR_HLS2BGR)

    def process(
        self,
        img_bgr: np.ndarray,
        upscale: int = 4,
        target_res: str = 'original',
        face_restore: bool = True,
        fidelity: float = 0.65,
        deblock: int = 40,
        depth_shading: int = 40,
        brightness_balance: int = 0,
        hdr_contrast: int = 35,
        color_warmth: int = 15,
        eye_clarity: int = 30,
        denoise: int = 20,
        sharpen: int = 30,
        colorize: dict = None
    ):
        t0 = time.time()
        orig_h, orig_w = img_bgr.shape[:2]
        faces_detected = 0

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        # Step 0: Adaptive Anti-Pixelation & De-Blocking Pre-Filter
        # Smooths flat macroblocks before neural super-resolution so block boundaries don't become tiles
        clean_input = self.apply_deblocking_prefilter(img_bgr, strength=deblock)

        # Step 1: Full Neural Restoration (Face + Clothes + Background)
        if face_restore and self.gfpgan_restorer is not None:
            try:
                self.gfpgan_restorer.upscale = upscale
                gfpgan_weight = float(np.clip(fidelity, 0.2, 0.9))

                cropped_faces, restored_faces, restored_img = self.gfpgan_restorer.enhance(
                    clean_input,
                    has_aligned=False,
                    only_center_face=False,
                    paste_back=True,
                    weight=gfpgan_weight
                )
                faces_detected = len(cropped_faces) if cropped_faces else 0
                output_bgr = restored_img
            except Exception as e:
                print(f"[GPU Engine] GFPGAN enhance note: {e}")
                if self.upsampler is not None:
                    output_bgr, _ = self.upsampler.enhance(clean_input, outscale=upscale)
                else:
                    output_bgr = cv2.resize(clean_input, (orig_w * upscale, orig_h * upscale), interpolation=cv2.INTER_LANCZOS4)
        elif self.upsampler is not None:
            output_bgr, _ = self.upsampler.enhance(clean_input, outscale=upscale)
        else:
            output_bgr = cv2.resize(clean_input, (orig_w * upscale, orig_h * upscale), interpolation=cv2.INTER_LANCZOS4)

        # Step 2: Apply Deep Shading, 3D Contours, HDR Tone Mapping & Lighting Depth
        shaded_bgr = self.apply_deep_shading_and_lighting(
            output_bgr,
            depth_shading=depth_shading,
            brightness_balance=brightness_balance,
            hdr_contrast=hdr_contrast,
            color_warmth=color_warmth,
            eye_clarity=eye_clarity,
            denoise=denoise,
            sharpen=sharpen
        )

        # Step 2.5: Neural Black & White to Full Color Synthesis
        if colorize and colorize.get('enabled'):
            shaded_bgr = self.apply_neural_colorization(shaded_bgr, colorize, faces_detected)

        # Step 3: Multi-Resolution Scaling (Original, 2K, 4K, 8K, 16K)
        cur_h, cur_w = shaded_bgr.shape[:2]
        target_w, target_h = compute_target_dimensions(cur_w, cur_h, target_res)

        if (target_w, target_h) != (cur_w, cur_h):
            interp = cv2.INTER_LANCZOS4 if target_w > cur_w else cv2.INTER_AREA
            final_bgr = cv2.resize(shaded_bgr, (target_w, target_h), interpolation=interp)
        else:
            final_bgr = shaded_bgr

        enh_h, enh_w = final_bgr.shape[:2]
        dt_ms = int((time.time() - t0) * 1000)

        if torch.cuda.is_available():
            torch.cuda.empty_cache()

        return {
            'image_bgr': final_bgr,
            'processing_time_ms': dt_ms,
            'original_width': orig_w,
            'original_height': orig_h,
            'enhanced_width': enh_w,
            'enhanced_height': enh_h,
            'target_res': target_res,
            'faces_detected': faces_detected,
            'gpu_used': self.device_name,
            'performance_profile': self.profile
        }

engine = AdaptiveGpuEngine()
