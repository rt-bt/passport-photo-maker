import base64
import io
import time
import cv2
import numpy as np
import torch
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

try:
    from server.engine import engine
except ImportError:
    from engine import engine

app = FastAPI(
    title="AI Image Restoration & Ultra Studio Engine",
    description="Studio-grade face & photo restoration, 3D depth shading, and 2K/4K/8K/16K super-resolution",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RestoreRequest(BaseModel):
    image: str = Field(..., description="Base64 encoded data URL or raw base64 image")
    upscale: int = Field(default=4, ge=2, le=4, description="Upscale multiplier (2 or 4)")
    target_res: str = Field(default="original", description="Target output tier: original, 2k, 4k, 8k, 16k")
    face_restore: bool = Field(default=True, description="Enable face detection & feature restoration")
    fidelity: float = Field(default=0.65, ge=0.0, le=1.0, description="Identity preservation balance")
    deblock: int = Field(default=40, ge=0, le=100, description="Anti-pixelation and JPEG de-blocking strength")
    depth_shading: int = Field(default=40, ge=0, le=100, description="3D depth shading & ambient contour")
    brightness_balance: int = Field(default=0, ge=-50, le=50, description="Exposure & highlight recovery")
    hdr_contrast: int = Field(default=35, ge=0, le=100, description="HDR micro-contrast & texture pop")
    color_warmth: int = Field(default=15, ge=-50, le=50, description="Skin warmth & color depth")
    eye_clarity: int = Field(default=30, ge=0, le=100, description="Iris depth & eye clarity")
    denoise: int = Field(default=20, ge=0, le=100, description="Noise reduction strength")
    sharpen: int = Field(default=30, ge=0, le=100, description="High-frequency detail sharpening")
    output_format: str = Field(default="jpeg", description="Output format: jpeg, png, webp")

def decode_base64_image(b64_str: str) -> np.ndarray:
    if ',' in b64_str:
        b64_str = b64_str.split(',', 1)[1]
    img_data = base64.b64decode(b64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img_bgr is None:
        raise ValueError("Invalid image data could not be decoded")
    return img_bgr

def encode_image_to_base64(img_bgr: np.ndarray, format_type: str = "jpeg", quality: int = 95) -> str:
    fmt = format_type.lower()
    if fmt == "png":
        encode_param = [int(cv2.IMWRITE_PNG_COMPRESSION), 4]
        ext = '.png'
        mime = 'image/png'
    elif fmt == "webp":
        encode_param = [int(cv2.IMWRITE_WEBP_QUALITY), 95]
        ext = '.webp'
        mime = 'image/webp'
    else:
        encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
        ext = '.jpg'
        mime = 'image/jpeg'

    success, buffer = cv2.imencode(ext, img_bgr, encode_param)
    if not success:
        raise ValueError(f"Failed to encode image to {fmt}")
    b64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:{mime};base64,{b64}"

@app.get("/status")
def get_status():
    cuda_avail = engine.device.type == 'cuda'
    vram_free_mb = 0
    vram_total_mb = engine.vram_total_mb

    if cuda_avail:
        try:
            free_bytes, total_bytes = torch.cuda.mem_get_info(0)
            vram_free_mb = round(free_bytes / (1024 * 1024), 1)
        except Exception:
            pass

    return {
        "status": "online",
        "gpu_name": engine.device_name,
        "cuda_available": cuda_avail,
        "vram_free_mb": vram_free_mb,
        "vram_total_mb": vram_total_mb,
        "performance_profile": engine.profile,
        "supported_tiers": ["original", "2k", "4k", "8k", "16k"],
        "models_loaded": ["GFPGANv1.4_FacePrior", "RealESRGAN_BackgroundUpsampler"],
        "version": "2.0.0"
    }

@app.post("/restore")
def restore_image(req: RestoreRequest):
    try:
        img_bgr = decode_base64_image(req.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image decoding failed: {e}")

    try:
        result = engine.process(
            img_bgr,
            upscale=req.upscale,
            target_res=req.target_res,
            face_restore=req.face_restore,
            fidelity=req.fidelity,
            deblock=req.deblock,
            depth_shading=req.depth_shading,
            brightness_balance=req.brightness_balance,
            hdr_contrast=req.hdr_contrast,
            color_warmth=req.color_warmth,
            eye_clarity=req.eye_clarity,
            denoise=req.denoise,
            sharpen=req.sharpen
        )

        output_data_url = encode_image_to_base64(result['image_bgr'], format_type=req.output_format)

        return {
            "success": True,
            "image": output_data_url,
            "processing_time_ms": result['processing_time_ms'],
            "original_width": result['original_width'],
            "original_height": result['original_height'],
            "enhanced_width": result['enhanced_width'],
            "enhanced_height": result['enhanced_height'],
            "target_res": result['target_res'],
            "faces_detected": result['faces_detected'],
            "gpu_used": result['gpu_used'],
            "performance_profile": result['performance_profile']
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"GPU restoration pipeline error: {e}")

if __name__ == "__main__":
    import uvicorn
    print(f"🚀 Starting Passport Photo & AI Studio Server on http://127.0.0.1:8000")
    print(f"⚡ Device: {engine.device_name} (Profile: {engine.profile})")
    uvicorn.run(app, host="127.0.0.1", port=8000)
