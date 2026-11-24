# 🎨 Indian Design Studio – All-in-One Graphic Design SaaS Platform

An all-in-one graphic design and document creation platform inspired by Canva, built specifically for Indian users, Indian languages, wedding invitations, identity cards, printing presses, educational institutions, and businesses.

---

## 🚀 Key Modules & Architecture

### 1. 🖌️ Professional Canva-Style Editor (`/editor`)
- **Drag-and-Drop Canvas Engine**: Built on Fabric.js with multi-object selection, bounding boxes, rotation, alignment, zoom, and pan.
- **Left Sidebar**:
  - **Templates**: Instant one-click template loading.
  - **Elements & Shapes**: Rectangles, circles, triangles, stars, and divider lines.
  - **Text**: Heading, subheading, body, plus authentic Hindi typography presets (*"॥ शुभ विवाह आमंत्रण ॥"*, Ganesh shlokas).
  - **Desi Icons**: Royal Indian SVGs (Shree Ganesh Ji, Kalash, Mandalas, Peacock feather, Doli, Khanda, Bismillah).
  - **Uploads**: Image upload with local storage persistence.
  - **Color Palettes**: Indian royal palettes (Royal Crimson, Deep Maroon, Gold Leaf, Pure Saffron, Peacock Teal).
  - **QR Code & Barcode**: Google Maps venue navigation QR codes rendered live onto the canvas.
- **Top Toolbar**: Real-time project title editing, undo/redo history (30 steps), zoom controls (20% - 300%), grid alignment toggle, and save/export/share.
- **Right Sidebar Properties Inspector**:
  - Text: Font family (Poppins, Cinzel, Rozha One, Noto Sans Devanagari, Yatra One, Great Vibes), size, weight, italic, underline, alignment.
  - Shapes & Objects: Color picker, stroke width, opacity/transparency slider.
  - Layer Management: Bring to front, send to back, forward, backward.
  - Actions: Lock/unlock, duplicate (clone), and delete.
- **Export Formats**: PNG, JPG, Vector SVG, and **Print-Ready 300 DPI PDF with corner crop marks**.

---

### 2. 💍 Wedding Card Designer (`/wedding`)
- **Multi-Faith Categories**: Hindu Royal, Rajasthani Heritage, Haldi, Mehndi, Muslim Nikaah, Sikh Anand Karaj, South Indian Vivaham, and Grand Reception.
- **Auto-Population Form**: Bride, groom, parents, date, auspicious time, venue, and Google Maps URL.
- **Features**: Live card preview (5" x 7.5"), live venue Google Maps QR code, one-click WhatsApp sharing, and *"Open & Customize in Full Studio"* button.

---

### 3. 💳 ID Card Maker (`/id-cards`)
- **Standard CR80 PVC Specs**: 85.6mm x 54mm (Credit card ratio).
- **Categories**: School Student, College Pass, Corporate Employee, Hospital Staff, Visitor Pass.
- **Features**: Front & Back live flip view, photo upload, barcode generator (`jsbarcode`), QR verification code (`qrcode`).
- **Bulk CSV / Excel Batch Generator**: Upload CSV to automatically map student/employee records.
- **A4 Print Sheet**: Generates **10 ID cards per A4 page** with cutting guides and print-ready PDF export.
- **Legal Notice**: Organization verification and authorization disclosure.

---

### 4. 📢 Poster & Banner Maker (`/posters`)
- **Categories**: Festival Posters (Diwali, Eid, Holi, Ganesh Utsav), Coaching Institute IIT-JEE / NEET Admissions, Political Campaigns, and Restaurant Offers.
- **Hindi Typography Presets**: *महासेल धमाका (50% छूट)*, *हार्दिक बधाई एवं शुभकामनाएं*, *प्रवेश प्रारंभ*.

---

### 5. 💼 Business Design Studio (`/business`)
- **Visiting Card Maker**: Executive Gold & Matte Black 3.5" x 2" business cards with QR code.
- **Certificate Generator**: A4 landscape Certificate of Excellence with recipient name, date, and authorized signature.
- **GST Tax Invoice & Bill Book**: Standard Indian GST B2B/B2C invoice with CGST/SGST calculations.
- **Restaurant Menu Maker**: Multi-page dining menus.

---

### 6. 📸 Passport Photo Studio (`/photo-studio`)
- **Presets**: Indian Passport (35x45mm), Indian/US Visa (2" x 2"), Stamp size, and PAN Card (25x35mm).
- **Features**:
  - Background color changer (Pure White, Studio Light Blue, Soft Gray, Cream).
  - Studio image enhancement (Brightness, contrast, color saturation).
  - Face alignment guide (70-80% face area requirement).
  - **A4 Multi-Photo Sheet**: Prints **8, 16, or 32 photos** on 4x6" or A4 glossy photo paper with dashed cutting lines.

---

### 7. ✨ AI Design Studio & Hindi Copywriter (`/ai-studio`)
- **Gemini 1.5 Integration**: Secure backend endpoints (`/api/ai/design`, `/api/ai/writing`, `/api/ai/chat-edit`).
- **Prompt to Design**: Generates editable canvas definitions from natural language prompts.
- **Copywriter**: Generates creative wedding invitation wording, festival greetings, and Hindi advertisement copy.
- **Environment Key**: Reads `GEMINI_API_KEY` from `.env.local`.

---

### 8. 🎬 Digital Motion Video Maker (`/motion-invitations`)
- Sequential animated slides for WhatsApp stories and status.
- Music presets: Royal Shehnai & Dholak, Acoustic Sitar, Cinematic Symphony.
- Visual particle overlays (Golden Dust, Rose Petals, Starry Sky).

---

### 9. 🏪 Template Marketplace (`/templates`)
- Search by keyword, filter by category (Wedding, ID, Posters, Business), and language (Hindi, English, Bilingual).
- Preview and open directly into the canvas editor.

---

### 10. 📊 User & Admin Dashboards (`/dashboard` & `/admin`)
- **User Dashboard**: Saved designs, asset gallery, AI credit balance, duplicate, and delete.
- **Admin Panel**: MTD platform revenue, active user accounts, template manager, and credit allocations.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS + Custom Indian typography & theme system
- **Canvas Editor**: Fabric.js v5.3.0
- **Vector & Barcodes**: `jsbarcode`, `qrcode`
- **PDF Generation**: `jspdf` (300 DPI, CR80, A4 batch layouts) + `html2canvas`
- **AI Engine**: Google Gemini API integration

---

## 🏃 Running the Application

### Option 1: Double-Click Batch File
Run `start_indian_design_studio.bat` located in the root folder.

### Option 2: Terminal Command
```bash
cd indian-design-studio
npm run dev
```
Open **`http://localhost:3000`** in your browser.
