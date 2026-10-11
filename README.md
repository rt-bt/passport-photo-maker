# 📸 Passport Photo Maker

> **100% Client-Side, Privacy-First Passport Photo Creator, Background Remover, Compressor & Print Sheet Maker.**

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Vercel-success?style=for-the-badge&logo=vercel)](https://passport-photo-maker-henna.vercel.app/)

[![CI](https://github.com/rt-bt/passport-photo-maker/actions/workflows/ci.yml/badge.svg)](https://github.com/rt-bt/passport-photo-maker/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Privacy First](https://img.shields.io/badge/Privacy-100%25%20In--Browser-brightgreen.svg)](#privacy-first-architecture)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF)](https://vitejs.dev/)

🔗 **Live Website**: [https://passport-photo-maker-henna.vercel.app](https://passport-photo-maker-henna.vercel.app/)

**Passport Photo Maker** is a browser-only, open-source web application that converts any large photograph into standard passport photos, removes backgrounds using AI directly in the browser, compresses the file size to meet government portal limits (e.g. `< 20 KB`, `< 50 KB`), and arranges multiple copies into millimeter-accurate print sheets (A4, 4×6 inch, US Letter) with high-res PDF and image export.

---

## ✨ Features

### 1. 📤 Universal Upload & Preprocessing
- **Drag & Drop**, native file picker, or direct mobile camera capture.
- Supports **JPG, PNG, WEBP, and HEIC** (iPhone photos converted client-side via `heic2any`).
- Smoothly downscales high-megapixel images (10MB+ / 4000px+) in-memory to prevent browser lag.
- Automatic **EXIF rotation** normalization.

### 2. 🌍 Official Passport Size Presets (300 DPI)
- **India Passport / Visa**: 35 × 45 mm
- **India PAN Card**: 25 × 35 mm
- **India Aadhaar / Exam / SSC**: 35 × 35 mm
- **USA Passport / Visa / Green Card**: 2 × 2 inch (51 × 51 mm)
- **UK / Schengen / Australia**: 35 × 45 mm
- **Canada Passport**: 50 × 70 mm
- **China Visa**: 33 × 48 mm
- **Stamp Size**: 20 × 25 mm
- **Custom Size**: User enters dimensions in `mm`, `cm`, `inch`, or `px`.
- Live visual **face-position guide overlay** (crown 70–80%, eye level, and chin marker).

### 3. 🪄 In-Browser AI Background Removal & Replacement
- Powered by `@imgly/background-removal` running client-side with WebAssembly & ONNX.
- Background colors: **Pure White**, **Light Blue**, **Royal Blue**, **Sky Blue**, **Light Gray**, **Red**, **Yellow**, **Green**, and **Transparent (PNG)**.
- Custom hex color picker & soft gradient option.
- **Edge refinement (feathering)** slider to smooth flyaway hair edges.
- **Manual Erase / Restore Canvas Brush** with size slider and Undo/Redo to touch up any edge.
- **Before / After interactive split slider** for immediate verification.

### 4. 🎯 Precision Cropping & Face Alignment
- Smooth touch and mouse cropping with `react-easy-crop`.
- Rotate (90° steps and fine slider) and horizontal/vertical flip.
- One-click **Auto-Center Face** using MediaPipe Face Detection.
- Realtime **Face Compliance Checker**:
  - Missing face alert
  - Multiple faces detected
  - Head size out of 70%–80% range
  - Off-center warning

### 5. 🗜️ Target File Size Compression (Binary Search)
- Quick target presets: **< 20 KB** (Indian SSC/Govt portals), **< 50 KB** (PAN/Visa), **< 100 KB**, **< 200 KB**, or custom KB.
- Intelligent **binary search on JPEG/WEBP quality** with progressive gentle downscaling if required.
- Realtime comparison: original file size vs compressed size and pixel dimensions.
- Target DPI options: **150, 300 (standard), 600 DPI**.

### 6. 🖨️ Millimeter-Exact Print Sheet Maker
- Paper sizes: **A4 (210×297 mm)**, **4×6 inch (Photo Paper)**, **US Letter**, **5×7 inch**, **A5**, and **Legal**.
- Portrait and Landscape orientations.
- Auto-calculates **"Maximum photos that fit on this sheet"**.
- Custom copy selector (1 to Max) or one-click **"Fill Full Page"**.
- Custom margins (mm), spacing gaps (mm), border toggle, and **cut / crop marks**.
- Interactive live canvas preview.
- **Millimeter-exact PDF export** via `jsPDF` (100% scale, zero distortion).
- **High-resolution 300 DPI Sheet Image** download.
- Browser print with `@page` CSS and warning: *"Print at 100% / Actual size, not 'Fit to page'"*.

### 7. 🎁 Extra Form Utilities
- **Name & Date of Photo (DOP) Strip**: Standard candidate banner required for competitive exams (UPSC, NEET, SSC).
- **Signature Tool**: Upload signature photo, auto-extract dark ink strokes into transparent PNG, scale to 35 × 15 mm.
- **Batch Mode**: Upload multiple family/group photos, crop to preset, and download as a `.zip`.
- **Offline PWA**: Installable on desktop and mobile, runs offline after first load.
- **Bilingual (i18n)**: English and Hindi (`हिन्दी`).
- **Dark & Light Mode** with persistent local storage.

---

## 🔒 Privacy-First Architecture

Your photos **NEVER** leave your computer or phone. 
- All computer vision (MediaPipe) and neural network inferences (`@imgly/background-removal`) run **100% locally** in your browser using WebAssembly and WebGL.
- No analytics trackers or image upload servers exist in this repository.

---

## 🚀 Quickstart & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v20+
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/rt-bt/passport-photo-maker.git

# Navigate into the project directory
cd passport-photo-maker

# Install dependencies
npm install
```

### Run Locally (Development)
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Run Automated Tests
```bash
npm run test
```

### Build for Production
```bash
npm run build
```
The optimized client-side bundle will be output to the `dist/` directory.

---

## ➕ How to Add a New Passport Preset

All passport country dimensions, head height guidelines, and compliance rules are defined in a single file: [`src/lib/presets.ts`](src/lib/presets.ts).

To add a new country or document type, simply add an entry to the `PASSPORT_PRESETS` array:

```typescript
// src/lib/presets.ts
{
  id: 'jp-passport',
  name: 'Japan Passport',
  country: 'Japan',
  category: 'passport',
  widthMm: 35,
  heightMm: 45,
  headHeightMinPercent: 70, // 32mm to 36mm
  headHeightMaxPercent: 80,
  recommendedBgColor: '#FFFFFF',
  description: '35×45 mm, plain white or light background, head length 32-36 mm.',
  complianceNotes: [
    'Plain white or off-white background',
    'Neutral facial expression looking directly into camera',
    'Head length must be between 32 mm and 36 mm',
    'No head coverings unless for religious or medical reasons',
  ],
}
```
The app will automatically render your preset, calculate pixel dimensions at 300 DPI, configure the face guide overlay, and update the print sheet packing grid!

---

## 🌐 Deployment Instructions

Because the entire application is 100% static client-side JavaScript, it can be hosted on any static web host for **$0 / month**.

### 1. Deploy to Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```
*Build Command:* `npm run build`  
*Output Directory:* `dist`

### 2. Deploy to Netlify
1. Connect your GitHub repository to [Netlify](https://www.netlify.com/).
2. Set Build command: `npm run build`.
3. Set Publish directory: `dist`.
4. Deploy!

### 3. Deploy to GitHub Pages
Add the `base` parameter in `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/passport-photo-maker/',
  // ...
});
```
Then deploy via the official GitHub Actions Pages workflow:
```yaml
# In .github/workflows/deploy.yml
- name: Deploy to GitHub Pages
  uses: actions/deploy-pages@v4
```

---

## 📁 Repository Structure

```
passport-photo-maker/
├── .github/workflows/ci.yml       # Automated GitHub Actions test & build
├── public/
│   ├── favicon.svg                # Vector app logo
│   ├── manifest.webmanifest      # PWA Manifest
│   └── sw.js                     # Offline Service Worker
├── src/
│   ├── components/
│   │   ├── common/               # Button, Modal, Slider
│   │   ├── features/             # FaceGuideOverlay, BeforeAfterSlider, ManualEraserBrush, etc.
│   │   ├── layout/               # Header, Footer, Stepper, ThemeLanguageToggle
│   │   └── steps/                # Step 1 through Step 7 wizard views
│   ├── hooks/                    # useLocalStorage, useFaceDetection
│   ├── i18n/                     # en.json, hi.json, lightweight i18n context
│   ├── lib/
│   │   ├── presets.ts            # Country specifications & paper standards
│   │   ├── units.ts              # mm, inch, px conversions & DPI math
│   │   ├── sheetLayout.ts        # Pure grid layout calculation
│   │   ├── compression.ts        # Binary search quality compressor
│   │   ├── backgroundRemoval.ts  # @imgly WASM wrapper & composite
│   │   ├── faceDetection.ts      # MediaPipe FaceDetector & compliance rules
│   │   ├── imageFilters.ts       # Canvas filters & alpha feathering
│   │   ├── signature.ts          # Transparent signature extraction
│   │   └── pdfExport.ts          # jsPDF millimeter-exact sheet generator
│   ├── tests/                    # Vitest test suites (units, layout, compression, presets)
│   ├── types/                    # TypeScript interfaces
│   ├── App.tsx                   # Main wizard coordinator
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Tailwind directives & print styles
├── LICENSE                       # MIT License
└── package.json
```

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.
