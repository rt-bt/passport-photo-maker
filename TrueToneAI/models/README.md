# TrueTone AI — Pretrained Model Weights

This directory holds the verified, offline AI model weights specifically optimized for local execution on NVIDIA GeForce RTX 4080 (12GB VRAM).

### Installed Models:

1. **`ddcolor_paper_tiny.pth` (220 MB)**
   - **Architecture**: ConvNeXt-Tiny + Multi-Scale Dual Color Decoder
   - **Usage**: Primary colorization engine. Fast (under 450ms on RTX 4080), high realism, natural skin tones, and rich environmental colors without color bleeding.
   - **Reference**: ICCV 2023 DDColor: Dual-Decoder Colorization.

2. **`ddcolor_modelscope.pth` (911 MB)**
   - **Architecture**: ConvNeXt-Large Flagship + 256 Color Queries
   - **Usage**: Ultra quality mode. Maximum color fidelity, subtle historical gradients, and architectural texture preservation.

3. **`ColorizeArtistic_gen.pth` (255 MB)**
   - **Architecture**: ResNet34 U-Net + Spectral Normalization + Self-Attention
   - **Usage**: DeOldify alternative engine. Specialized for vintage archival photographs and rich artistic color transfer.

4. **`RealESRGAN_x4plus.pth` (67 MB)**
   - **Architecture**: RRDBNet (23 Residual-in-Residual Dense Blocks)
   - **Usage**: Optional 2x/4x super-resolution and fine grain reconstruction on GPU.

5. **`GFPGANv1.4.pth` (348 MB)**
   - **Architecture**: Generative Facial Prior GAN
   - **Usage**: Optional facial feature and iris detail reconstruction.

All models run 100% locally on your computer with complete privacy. No cloud services or paid APIs are used.
