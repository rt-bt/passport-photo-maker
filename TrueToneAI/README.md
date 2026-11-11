# 🎨 TrueTone AI — Professional Black & White Photo Colorizer

**TrueTone AI** is a studio-grade, locally running desktop application designed specifically to transform vintage, black-and-white, and faded photographs into naturally colored, lifelike photographs.

Built for **Alienware m16 R1** with full hardware acceleration on **NVIDIA GeForce RTX 4080 Laptop GPU (12GB GDDR6 VRAM)**.

---

## 🌟 Key Features

- **Genuine Deep Learning Colorization**:
  - **DDColor (Dual-Decoder Colorization, ICCV 2023)**: Predicts plausible, context-aware colors for skin, hair, eyes, foliage, skies, architecture, and clothing.
  - **DeOldify (Artistic)**: Special mode for vintage archival photographs and historical mood.
- **100% Original Texture Preservation**:
  - Uses CIE $Lab$ color space separation.
  - The original high-resolution luminance ($L^*$) channel containing facial pores, beard strands, clothing weaves, wood grain, metal reflections, and original lighting is kept **100% untouched**.
  - **Zero waxy plastic blur**, zero artificial oversaturation.
- **Modern Desktop Interface (PySide6)**:
  - Inspired by Adobe Photoshop and Topaz Photo AI.
  - **Drag-and-Drop** photo loading.
  - **Interactive Before/After Split Comparison Slider**.
  - **Batch Processing Studio** with progress tracking and queue management.
  - **Archival Enhancements**: Noise reduction, scratch removal, micro-detail definition, and 2x/4x Real-ESRGAN upscaling.
- **NVIDIA RTX 4080 GPU Optimization**:
  - Dedicated CUDA 12.4 inference with FP16 / TF32 Tensor Core acceleration.
  - Sub-second inference (~440ms per photograph).
  - VRAM-aware memory management and adaptive tiling for high-resolution 4K/8K images.
  - 100% offline and private. Never uploads your photos to any external cloud or server.

---

## 💻 Hardware Compatibility

Optimized specifically for:
- **Laptop**: Alienware m16 R1
- **CPU**: AMD Ryzen 9 7845HX (12 Cores / 24 Threads)
- **GPU**: NVIDIA GeForce RTX 4080 Laptop GPU (12GB VRAM, Ada Lovelace sm_8.9)
- **RAM**: 32 GB DDR5
- **OS**: Windows 11 (64-bit)

---

## 🚀 Quick Launch

### One-Click Launch:
Double-click `launch.bat` in the `TrueToneAI` folder.

### Diagnostic Check:
To check NVIDIA GPU acceleration and VRAM:
```cmd
python scripts\gpu_check.py
```

### Manual Setup:
```cmd
call install.bat
```

---

## 📁 Project Architecture

```
TrueToneAI/
├── main.py                     # Desktop Application Entry Point
├── launch.bat                  # One-click Windows 11 Launcher
├── install.bat                 # Installation & GPU Verification Script
├── requirements.txt            # Python Dependencies
├── README.md                   # Documentation
│
├── app/                        # PySide6 Desktop GUI Suite
│   ├── main_window.py          # Main Window & Sidebar Navigation
│   ├── image_viewer.py         # Canvas with Drag-and-Drop & Zoom
│   ├── comparison_slider.py    # Interactive Before/After Split Slider
│   ├── settings_dialog.py      # Hardware Telemetry & Model Status
│   └── batch_processor.py      # Multi-image Batch Processing View
│
├── ai_engine/                  # Neural Inference Core
│   ├── gpu_manager.py          # RTX 4080 VRAM & Tiling Optimization
│   ├── colorizer.py            # Master 7-Step Colorization Pipeline
│   ├── ddcolor_engine.py       # DDColor Dual-Decoder Neural Engine
│   ├── deoldify_engine.py      # DeOldify Colorization Engine
│   ├── enhancement.py          # Noise, Scratch & Detail Enhancement
│   └── ddcolor_arch/           # Official DDColor Architecture
│
├── core/                       # IO & System Infrastructure
│   ├── image_loader.py         # Multi-format Loader (JPG, PNG, TIFF)
│   ├── image_exporter.py       # Safe Non-Destructive Exporter
│   ├── image_processor.py      # Async QThread Background Workers
│   └── model_manager.py        # Offline Model Caching & Verification
│
├── assets/                     # Icons & Styles
│   └── styles/
│       └── dark_theme.qss      # Photoshop-inspired Dark Theme
│
└── models/                     # Offline Pretrained Weights (Stored Locally)
    ├── ddcolor_paper_tiny.pth  # Standard / High DDColor Model (220 MB)
    ├── ddcolor_modelscope.pth  # Ultra Flagship DDColor Model (911 MB)
    ├── ColorizeArtistic_gen.pth# DeOldify Model (255 MB)
    └── RealESRGAN_x4plus.pth   # Real-ESRGAN Upscaler (67 MB)
```
