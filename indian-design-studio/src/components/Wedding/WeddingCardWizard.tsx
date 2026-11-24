'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  Share2,
  Download,
  Edit3,
  Check,
  Languages,
  Phone,
  Type,
  Palette,
  Layout,
  Sliders,
  Eye,
  Smartphone,
  Monitor
} from 'lucide-react';
import QRCode from 'qrcode';
import { WeddingFormData } from '@/types';
import { saveProject } from '@/lib/storage';
import jsPDF from 'jspdf';

// 9 Rich Indian Wedding Card Themes
export interface CardTheme {
  id: string;
  name: string;
  category: string;
  bgClass: string;
  bgColorHex: string;
  borderColorHex: string;
  borderStyle: string;
  textColorHex: string;
  goldColorHex: string;
  accentBgHex: string;
  description: string;
}

export const CARD_THEMES: CardTheme[] = [
  {
    id: 'royal-crimson',
    name: 'Royal Crimson Gold',
    category: 'Hindu / Royal',
    bgClass: 'bg-rose-950',
    bgColorHex: '#580816',
    borderColorHex: '#d4af37',
    borderStyle: 'border-amber-400',
    textColorHex: '#ffffff',
    goldColorHex: '#fde047',
    accentBgHex: '#3b040e',
    description: 'Deep royal crimson with rich gold foil borders and corners.',
  },
  {
    id: 'rajasthani-heritage',
    name: 'Rajasthani Jharokha',
    category: 'Heritage',
    bgClass: 'bg-red-950',
    bgColorHex: '#450a0a',
    borderColorHex: '#eab308',
    borderStyle: 'border-yellow-500',
    textColorHex: '#fffdf5',
    goldColorHex: '#facc15',
    accentBgHex: '#2b0505',
    description: 'Regal palace maroon with ornamental jharokha arch details.',
  },
  {
    id: 'ivory-silk',
    name: 'Ivory Silk & Classic Gold',
    category: 'Minimalist Luxury',
    bgClass: 'bg-amber-50',
    bgColorHex: '#fffdf5',
    borderColorHex: '#b45309',
    borderStyle: 'border-amber-600',
    textColorHex: '#1e293b',
    goldColorHex: '#b45309',
    accentBgHex: '#fef3c7',
    description: 'Sophisticated off-white ivory silk with antique gold accents.',
  },
  {
    id: 'haldi-marigold',
    name: 'Haldi Sunny Marigold',
    category: 'Haldi Function',
    bgClass: 'bg-amber-100',
    bgColorHex: '#fef08a',
    borderColorHex: '#ca8a04',
    borderStyle: 'border-yellow-600',
    textColorHex: '#451a03',
    goldColorHex: '#9a3412',
    accentBgHex: '#fde047',
    description: 'Auspicious sunny marigold yellow with lively festive vibe.',
  },
  {
    id: 'mehndi-emerald',
    name: 'Mehndi Botanical Emerald',
    category: 'Mehndi & Sangeet',
    bgClass: 'bg-emerald-950',
    bgColorHex: '#064e3b',
    borderColorHex: '#d4af37',
    borderStyle: 'border-emerald-400',
    textColorHex: '#ffffff',
    goldColorHex: '#fde047',
    accentBgHex: '#022c22',
    description: 'Lush dark emerald with golden henna vine borders.',
  },
  {
    id: 'peacock-teal',
    name: 'Peacock Teal Velvet',
    category: 'Modern Royal',
    bgClass: 'bg-cyan-950',
    bgColorHex: '#083344',
    borderColorHex: '#38bdf8',
    borderStyle: 'border-cyan-400',
    textColorHex: '#ffffff',
    goldColorHex: '#fde047',
    accentBgHex: '#041f2a',
    description: 'Majestic peacock feather cyan-navy with glittering gold accents.',
  },
  {
    id: 'muslim-nikaah',
    name: 'Muslim Nikaah Royal Arch',
    category: 'Muslim Nikaah',
    bgClass: 'bg-emerald-950',
    bgColorHex: '#064e3b',
    borderColorHex: '#facc15',
    borderStyle: 'border-yellow-400',
    textColorHex: '#ffffff',
    goldColorHex: '#fde047',
    accentBgHex: '#043427',
    description: 'Sacred deep green with Bismillah header and arch frame.',
  },
  {
    id: 'sikh-anand-karaj',
    name: 'Sikh Anand Karaj Saffron',
    category: 'Sikh Wedding',
    bgClass: 'bg-orange-950',
    bgColorHex: '#431407',
    borderColorHex: '#fb923c',
    borderStyle: 'border-orange-500',
    textColorHex: '#ffffff',
    goldColorHex: '#fed7aa',
    accentBgHex: '#270b04',
    description: 'Warm auspicious saffron-copper with Ek Onkar blessings.',
  },
  {
    id: 'sunset-blush',
    name: 'Rose Gold & Sunset Blush',
    category: 'Contemporary Chic',
    bgClass: 'bg-pink-950',
    bgColorHex: '#500724',
    borderColorHex: '#f43f5e',
    borderStyle: 'border-rose-400',
    textColorHex: '#ffffff',
    goldColorHex: '#fbcfe8',
    accentBgHex: '#370417',
    description: 'Trendy romantic blush pink with delicate rose-gold highlights.',
  },
];

// Available Fonts for Indian Weddings
export const FONT_OPTIONS = [
  { id: 'font-rozha', name: 'Rozha One', type: 'Traditional Hindi Serif', family: 'Rozha One' },
  { id: 'font-cinzel', name: 'Cinzel', type: 'Royal Classical Roman', family: 'Cinzel' },
  { id: 'font-script', name: 'Great Vibes', type: 'Romantic Calligraphy', family: 'Great Vibes' },
  { id: 'font-yatra', name: 'Yatra One', type: 'Festive Devanagari', family: 'Yatra One' },
  { id: 'font-playfair', name: 'Playfair Display', type: 'Luxury High-Fashion Serif', family: 'Playfair Display' },
  { id: 'font-kalam', name: 'Kalam', type: 'Artistic Hand-Lettered', family: 'Kalam' },
  { id: 'font-marcellus', name: 'Marcellus', type: 'Elegant Indian Royalty', family: 'Marcellus' },
  { id: 'font-tiro', name: 'Tiro Devanagari', type: 'Classical Sanskrit / Hindi', family: 'Tiro Devanagari Hindi' },
  { id: 'font-hindi', name: 'Noto Sans Devanagari', type: 'Clean Hindi Sans', family: 'Noto Sans Devanagari' },
  { id: 'font-poppins', name: 'Poppins', type: 'Clean Modern Sans', family: 'Poppins' },
];

export default function WeddingCardWizard() {
  const router = useRouter();

  // Active theme & fonts state
  const [selectedThemeId, setSelectedThemeId] = useState<string>('royal-crimson');
  const [coupleFont, setCoupleFont] = useState<string>('Rozha One');
  const [headerFont, setHeaderFont] = useState<string>('Rozha One');
  const [bodyFont, setBodyFont] = useState<string>('Noto Sans Devanagari');
  const [coupleFontSize, setCoupleFontSize] = useState<'normal' | 'large' | 'xl'>('large');

  // Mobile layout switcher: 'form' | 'preview'
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  // Form details
  const [language, setLanguage] = useState<'Hindi' | 'English'>('Hindi');
  const [formData, setFormData] = useState<WeddingFormData>({
    groomName: 'रोहन शर्मा',
    brideName: 'अनन्या वर्मा',
    groomParents: 'श्रीमती सुनीता एवं श्री राजेश शर्मा',
    brideParents: 'श्रीमती कविता एवं श्री मनोज वर्मा',
    weddingDate: 'रविवार, 15 दिसंबर 2026',
    weddingTime: 'सायं 07:00 बजे से',
    venueName: 'हवेली हेरिटेज पैलेस एवं लॉन्स',
    venueAddress: 'नियर राजापार्क चौराहा, जयपुर, राजस्थान',
    googleMapsUrl: 'https://maps.google.com/?q=Jaipur+Palace',
    rsvpNames: 'समस्त शर्मा एवं वर्मा परिवार',
    rsvpPhone: '+91 98765 43210',
    subType: 'hindu',
    language: 'Hindi',
    shlokaOrBismillah: '॥ श्री गणेशाय नमः ॥',
  });

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Active theme object
  const currentTheme = CARD_THEMES.find((t) => t.id === selectedThemeId) || CARD_THEMES[0];

  // Generate QR Code for Maps URL
  useEffect(() => {
    if (formData.googleMapsUrl) {
      QRCode.toDataURL(formData.googleMapsUrl, { width: 140, margin: 1 })
        .then(setQrCodeDataUrl)
        .catch(console.error);
    }
  }, [formData.googleMapsUrl]);

  // Handle Form Change
  const handleChange = (field: keyof WeddingFormData, val: string) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Switch Theme Preset
  const handleSelectTheme = (theme: CardTheme) => {
    setSelectedThemeId(theme.id);
    if (theme.id === 'muslim-nikaah') {
      handleChange('shlokaOrBismillah', 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ (Nikaah Ceremony)');
      setCoupleFont('Great Vibes');
    } else if (theme.id === 'sikh-anand-karaj') {
      handleChange('shlokaOrBismillah', 'ੴ सतिगुरु प्रसादि (Anand Karaj)');
      setCoupleFont('Yatra One');
    } else if (theme.id === 'haldi-marigold') {
      handleChange('shlokaOrBismillah', '✨ शुभ हल्दी समारोह ✨');
      setCoupleFont('Rozha One');
    } else if (theme.id === 'mehndi-emerald') {
      handleChange('shlokaOrBismillah', '🌿 रंगीलो मेहंदी उत्सव 🌿');
      setCoupleFont('Kalam');
    } else if (theme.id === 'ivory-silk') {
      setCoupleFont('Cinzel');
    } else {
      handleChange('shlokaOrBismillah', '॥ श्री गणेशाय नमः ॥');
      setCoupleFont('Rozha One');
    }
  };

  // Switch Language
  const handleLanguageToggle = (lang: 'Hindi' | 'English') => {
    setLanguage(lang);
    if (lang === 'English') {
      setFormData((prev) => ({
        ...prev,
        language: 'English',
        groomName: 'Rohan Sharma',
        brideName: 'Ananya Verma',
        groomParents: 'Mrs. Sunita & Mr. Rajesh Sharma',
        brideParents: 'Mrs. Kavita & Mr. Manoj Verma',
        weddingDate: 'Sunday, 15th December 2026',
        weddingTime: '07:00 PM Onwards',
        venueName: 'Haveli Heritage Palace & Lawns',
        venueAddress: 'Near Raja Park, Jaipur, Rajasthan',
        rsvpNames: 'Sharma & Verma Family',
        shlokaOrBismillah: selectedThemeId === 'muslim-nikaah' ? 'Bismillah Calligraphy (Nikaah Ceremony)' : 'Cordially Invite You to the Wedding of',
      }));
      setCoupleFont('Cinzel');
      setHeaderFont('Cinzel');
      setBodyFont('Poppins');
    } else {
      setFormData((prev) => ({
        ...prev,
        language: 'Hindi',
        groomName: 'रोहन शर्मा',
        brideName: 'अनन्या वर्मा',
        groomParents: 'श्रीमती सुनीता एवं श्री राजेश शर्मा',
        brideParents: 'श्रीमती कविता एवं श्री मनोज वर्मा',
        weddingDate: 'रविवार, 15 दिसंबर 2026',
        weddingTime: 'सायं 07:00 बजे से',
        venueName: 'हवेली हेरिटेज पैलेस एवं लॉन्स',
        venueAddress: 'नियर राजापार्क चौराहा, जयपुर, राजस्थान',
        rsvpNames: 'समस्त शर्मा एवं वर्मा परिवार',
        shlokaOrBismillah: selectedThemeId === 'muslim-nikaah' ? 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ (निकाह मुबारक)' : '॥ श्री गणेशाय नमः ॥',
      }));
      setCoupleFont('Rozha One');
      setHeaderFont('Rozha One');
      setBodyFont('Noto Sans Devanagari');
    }
  };

  // Open in Full Canvas Studio
  const handleOpenInEditor = () => {
    const canvasData = {
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 1200,
          height: 1800,
          fill: currentTheme.bgColorHex,
          selectable: false,
        },
        {
          type: 'rect',
          left: 40,
          top: 40,
          width: 1120,
          height: 1720,
          fill: 'transparent',
          stroke: currentTheme.borderColorHex,
          strokeWidth: 4,
          selectable: false,
        },
        {
          type: 'i-text',
          text: formData.shlokaOrBismillah || '॥ श्री गणेशाय नमः ॥',
          left: 600,
          top: 180,
          originX: 'center',
          fontSize: 36,
          fill: currentTheme.goldColorHex,
          fontFamily: headerFont,
          fontWeight: 'bold',
        },
        {
          type: 'i-text',
          text: formData.groomName,
          left: 600,
          top: 450,
          originX: 'center',
          fontSize: coupleFontSize === 'xl' ? 68 : coupleFontSize === 'large' ? 56 : 46,
          fill: currentTheme.textColorHex,
          fontFamily: coupleFont,
          fontWeight: 'bold',
        },
        {
          type: 'i-text',
          text: `(${formData.groomParents})`,
          left: 600,
          top: 530,
          originX: 'center',
          fontSize: 24,
          fill: currentTheme.goldColorHex,
          fontFamily: bodyFont,
        },
        {
          type: 'i-text',
          text: 'संग (Weds)',
          left: 600,
          top: 610,
          originX: 'center',
          fontSize: 34,
          fill: '#f59e0b',
          fontFamily: 'Great Vibes',
        },
        {
          type: 'i-text',
          text: formData.brideName,
          left: 600,
          top: 700,
          originX: 'center',
          fontSize: coupleFontSize === 'xl' ? 68 : coupleFontSize === 'large' ? 56 : 46,
          fill: currentTheme.textColorHex,
          fontFamily: coupleFont,
          fontWeight: 'bold',
        },
        {
          type: 'i-text',
          text: `(${formData.brideParents})`,
          left: 600,
          top: 780,
          originX: 'center',
          fontSize: 24,
          fill: currentTheme.goldColorHex,
          fontFamily: bodyFont,
        },
        {
          type: 'i-text',
          text: `${formData.weddingDate} • ${formData.weddingTime}`,
          left: 600,
          top: 960,
          originX: 'center',
          fontSize: 32,
          fill: currentTheme.textColorHex,
          fontFamily: bodyFont,
          fontWeight: 'bold',
        },
        {
          type: 'i-text',
          text: `${formData.venueName}\n${formData.venueAddress}`,
          left: 600,
          top: 1140,
          originX: 'center',
          textAlign: 'center',
          fontSize: 26,
          fill: currentTheme.goldColorHex,
          fontFamily: bodyFont,
          lineHeight: 1.5,
        },
        {
          type: 'i-text',
          text: `विनीत: ${formData.rsvpNames}\nMo.: ${formData.rsvpPhone}`,
          left: 600,
          top: 1440,
          originX: 'center',
          textAlign: 'center',
          fontSize: 24,
          fill: currentTheme.textColorHex,
          fontFamily: bodyFont,
          lineHeight: 1.5,
        },
      ],
    };

    const newProject = saveProject({
      id: `proj_wedding_${Date.now()}`,
      title: `${formData.groomName} & ${formData.brideName} Vivah Card`,
      category: 'wedding',
      width: 1200,
      height: 1800,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [
        {
          id: 'page_1',
          name: 'Front Invitation',
          canvasData,
        },
      ],
    });

    router.push(`/editor?id=${newProject.id}`);
  };

  // Instant PDF Download
  const handleDownloadPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [140, 210],
      });

      // Background
      const isIvory = currentTheme.id === 'ivory-silk';
      const isHaldi = currentTheme.id === 'haldi-marigold';

      if (isIvory) doc.setFillColor(255, 253, 245);
      else if (isHaldi) doc.setFillColor(254, 240, 138);
      else doc.setFillColor(88, 8, 22);

      doc.rect(0, 0, 140, 210, 'F');

      // Border
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(1.5);
      doc.rect(6, 6, 128, 198);

      // Header
      doc.setTextColor(isIvory ? 180 : 253, isIvory ? 83 : 224, isIvory ? 9 : 71);
      doc.setFontSize(13);
      doc.text(formData.shlokaOrBismillah || 'Shree Ganeshaya Namah', 70, 25, { align: 'center' });

      // Groom
      doc.setTextColor(isIvory ? 30 : 255, isIvory ? 41 : 255, isIvory ? 59 : 255);
      doc.setFontSize(22);
      doc.text(formData.groomName, 70, 52, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(isIvory ? 120 : 254, isIvory ? 53 : 215, isIvory ? 15 : 170);
      doc.text(formData.groomParents, 70, 60, { align: 'center' });

      // Weds
      doc.setTextColor(217, 119, 6);
      doc.setFontSize(14);
      doc.text('Weds (संग)', 70, 72, { align: 'center' });

      // Bride
      doc.setTextColor(isIvory ? 30 : 255, isIvory ? 41 : 255, isIvory ? 59 : 255);
      doc.setFontSize(22);
      doc.text(formData.brideName, 70, 86, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(isIvory ? 120 : 254, isIvory ? 53 : 215, isIvory ? 15 : 170);
      doc.text(formData.brideParents, 70, 94, { align: 'center' });

      // Date Time
      doc.setTextColor(isIvory ? 180 : 253, isIvory ? 83 : 224, isIvory ? 9 : 71);
      doc.setFontSize(11);
      doc.text(`${formData.weddingDate} • ${formData.weddingTime}`, 70, 115, { align: 'center' });

      // Venue
      doc.setTextColor(isIvory ? 30 : 255, isIvory ? 41 : 255, isIvory ? 59 : 255);
      doc.setFontSize(12);
      doc.text(formData.venueName, 70, 130, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(isIvory ? 100 : 254, isIvory ? 100 : 240, isIvory ? 100 : 138);
      doc.text(formData.venueAddress, 70, 138, { align: 'center' });

      // QR Code
      if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', 55, 148, 30, 30);
        doc.setFontSize(8);
        doc.setTextColor(isIvory ? 50 : 255, isIvory ? 50 : 255, isIvory ? 50 : 255);
        doc.text('Scan for Google Maps Venue', 70, 182, { align: 'center' });
      }

      // RSVP
      doc.setFontSize(9);
      doc.setTextColor(isIvory ? 120 : 254, isIvory ? 53 : 215, isIvory ? 15 : 170);
      doc.text(`RSVP: ${formData.rsvpNames} | Ph: ${formData.rsvpPhone}`, 70, 194, { align: 'center' });

      doc.save(`${formData.groomName}_${formData.brideName}_Invitation.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold mb-2 border border-rose-200">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          Indian Wedding Card Studio
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Create Royal Indian Wedding Cards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          Choose card themes, customize Indian typography & fonts, auto-fill details, and generate instant print-ready cards with Google Maps QR codes.
        </p>
      </div>

      {/* MOBILE RESPONSIVE TAB SWITCHER (Visible on Mobile & Tablets < 1024px) */}
      <div className="flex lg:hidden justify-center mb-6 sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md py-2 border-b border-slate-200">
        <div className="bg-slate-200 p-1 rounded-xl flex items-center gap-1 shadow-inner w-full max-w-sm">
          <button
            onClick={() => setMobileTab('form')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'form'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 text-amber-600" />
            <span>Edit Details & Font</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'preview'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-rose-600" />
            <span>View Live Card</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS & FORM (7 cols on desktop, hidden on mobile if preview tab active) */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            mobileTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* 1. CARD DESIGN / THEME SELECTOR */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  1. Choose Card Design & Theme
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {CARD_THEMES.length} Royal Themes
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CARD_THEMES.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme)}
                    className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/40 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: theme.bgColorHex }}
                      />
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {theme.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {theme.category}
                    </span>
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-amber-600 rounded-full flex items-center justify-center text-white">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. FONT & TYPOGRAPHY SELECTOR */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  2. Choose Wedding Typography & Fonts
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Indian & English Fonts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Couple Name Font */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Couple Name Font
                </label>
                <select
                  value={coupleFont}
                  onChange={(e) => setCoupleFont(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.family}>
                      {f.name} ({f.type.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* Header/Mantra Font */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mantra / Header Font
                </label>
                <select
                  value={headerFont}
                  onChange={(e) => setHeaderFont(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                >
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.family}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Couple Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Couple Name Size
                </label>
                <div className="flex rounded-lg border border-slate-300 overflow-hidden">
                  {(['normal', 'large', 'xl'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setCoupleFontSize(s)}
                      className={`flex-1 py-1.5 text-xs font-bold uppercase transition-colors ${
                        coupleFontSize === s
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live font preview pills */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Active Font Preview:
              </span>
              <span
                className="text-sm font-bold text-amber-900 bg-white px-2.5 py-1 rounded border border-amber-200"
                style={{ fontFamily: coupleFont }}
              >
                {formData.groomName} & {formData.brideName}
              </span>
            </div>
          </div>

          {/* 3. COUPLE & CEREMONY DETAILS FORM */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                3. Couple & Ceremony Details
              </h3>
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                <button
                  onClick={() => handleLanguageToggle('Hindi')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    language === 'Hindi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => handleLanguageToggle('English')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    language === 'English' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Auspicious Shloka / Blessing */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Auspicious Header / Mantra (मांगलिक श्लोक)
              </label>
              <input
                type="text"
                value={formData.shlokaOrBismillah || ''}
                onChange={(e) => handleChange('shlokaOrBismillah', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            {/* Couple names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Groom Name (वर का नाम)
                </label>
                <input
                  type="text"
                  value={formData.groomName}
                  onChange={(e) => handleChange('groomName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bride Name (वधू का नाम)
                </label>
                <input
                  type="text"
                  value={formData.brideName}
                  onChange={(e) => handleChange('brideName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Groom's Parents (वर पक्ष माता-पिता)
                </label>
                <input
                  type="text"
                  value={formData.groomParents}
                  onChange={(e) => handleChange('groomParents', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bride's Parents (वधू पक्ष माता-पिता)
                </label>
                <input
                  type="text"
                  value={formData.brideParents}
                  onChange={(e) => handleChange('brideParents', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Date, Venue & Maps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wedding Date (तिथि)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.weddingDate}
                    onChange={(e) => handleChange('weddingDate', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Wedding Time (शुभ मुहूर्त)
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.weddingTime}
                    onChange={(e) => handleChange('weddingTime', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Venue Name (स्थल का नाम)
                </label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => handleChange('venueName', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Venue Full Address (पता)
                </label>
                <input
                  type="text"
                  value={formData.venueAddress}
                  onChange={(e) => handleChange('venueAddress', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Maps Venue Link (Generates Auto QR Code on Card)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.googleMapsUrl}
                    onChange={(e) => handleChange('googleMapsUrl', e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  RSVP Names (विनीत / दर्शनाभिलाषी)
                </label>
                <input
                  type="text"
                  value={formData.rsvpNames}
                  onChange={(e) => handleChange('rsvpNames', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone (मो.)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={formData.rsvpPhone}
                    onChange={(e) => handleChange('rsvpPhone', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mobile View Switcher CTA */}
            <div className="pt-2 lg:hidden">
              <button
                onClick={() => setMobileTab('preview')}
                className="w-full py-2.5 px-4 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4 text-amber-400" />
                <span>See Live Card Preview &rarr;</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE CARD PREVIEW (5 cols on desktop, full width on mobile) */}
        <div
          className={`lg:col-span-5 lg:sticky lg:top-24 space-y-4 ${
            mobileTab === 'form' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              Live Interactive Preview
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono text-[10px]">
              5" × 7.5" Ratio
            </span>
          </div>

          {/* THE WEDDING CARD CANVAS CONTAINER */}
          <div
            className={`w-full aspect-[1/1.5] rounded-3xl shadow-2xl p-5 sm:p-7 flex flex-col justify-between text-center relative overflow-hidden transition-all duration-300 border-4 ${currentTheme.borderStyle}`}
            style={{
              backgroundColor: currentTheme.bgColorHex,
              color: currentTheme.textColorHex,
            }}
          >
            {/* Outer Decorative Gold Borders */}
            <div
              className="absolute inset-2 sm:inset-3 border rounded-2xl pointer-events-none opacity-80"
              style={{ borderColor: currentTheme.borderColorHex }}
            />
            <div
              className="absolute inset-3.5 sm:inset-5 border border-dashed rounded-xl pointer-events-none opacity-50"
              style={{ borderColor: currentTheme.goldColorHex }}
            />

            {/* Top Ornamental Mantra */}
            <div className="relative z-10 pt-1 sm:pt-2">
              <p
                className="text-xs sm:text-base font-bold tracking-wide leading-snug drop-shadow-xs"
                style={{
                  fontFamily: headerFont,
                  color: currentTheme.goldColorHex,
                }}
              >
                {formData.shlokaOrBismillah}
              </p>
              <div
                className="w-20 sm:w-28 h-0.5 mx-auto my-2 opacity-80"
                style={{ backgroundColor: currentTheme.borderColorHex }}
              />
            </div>

            {/* Couple Names Section with Selected Custom Font */}
            <div className="relative z-10 my-auto space-y-2 sm:space-y-3">
              <div>
                <h2
                  className={`font-bold tracking-wide drop-shadow-sm leading-tight ${
                    coupleFontSize === 'xl'
                      ? 'text-2xl sm:text-4xl'
                      : coupleFontSize === 'large'
                      ? 'text-xl sm:text-3xl'
                      : 'text-lg sm:text-2xl'
                  }`}
                  style={{
                    fontFamily: coupleFont,
                    color: currentTheme.textColorHex,
                  }}
                >
                  {formData.groomName}
                </h2>
                <p
                  className="text-[10px] sm:text-xs opacity-90 mt-0.5 font-medium"
                  style={{ color: currentTheme.goldColorHex }}
                >
                  ({formData.groomParents})
                </p>
              </div>

              <div
                className="text-xl sm:text-2xl italic font-script"
                style={{ color: currentTheme.goldColorHex }}
              >
                संग (Weds)
              </div>

              <div>
                <h2
                  className={`font-bold tracking-wide drop-shadow-sm leading-tight ${
                    coupleFontSize === 'xl'
                      ? 'text-2xl sm:text-4xl'
                      : coupleFontSize === 'large'
                      ? 'text-xl sm:text-3xl'
                      : 'text-lg sm:text-2xl'
                  }`}
                  style={{
                    fontFamily: coupleFont,
                    color: currentTheme.textColorHex,
                  }}
                >
                  {formData.brideName}
                </h2>
                <p
                  className="text-[10px] sm:text-xs opacity-90 mt-0.5 font-medium"
                  style={{ color: currentTheme.goldColorHex }}
                >
                  ({formData.brideParents})
                </p>
              </div>
            </div>

            {/* Ceremony Date, Venue & QR Navigation */}
            <div className="relative z-10 pt-2 space-y-2">
              <div
                className="text-xs sm:text-sm font-bold tracking-wide"
                style={{ color: currentTheme.goldColorHex }}
              >
                {formData.weddingDate} • {formData.weddingTime}
              </div>

              <div
                className="p-2 sm:p-2.5 rounded-xl border backdrop-blur-xs text-xs"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.22)',
                  borderColor: currentTheme.borderColorHex,
                }}
              >
                <p
                  className="font-bold text-xs sm:text-sm"
                  style={{ color: currentTheme.textColorHex }}
                >
                  {formData.venueName}
                </p>
                <p
                  className="text-[10px] opacity-85 mt-0.5"
                  style={{ color: currentTheme.goldColorHex }}
                >
                  {formData.venueAddress}
                </p>
              </div>

              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="flex items-center justify-center gap-2 pt-0.5">
                  <div className="p-1 bg-white rounded-lg shadow-sm shrink-0">
                    <img src={qrCodeDataUrl} alt="Venue QR" className="w-10 sm:w-12 h-10 sm:h-12" />
                  </div>
                  <span
                    className="text-[9px] sm:text-[10px] text-left leading-tight"
                    style={{ color: currentTheme.goldColorHex }}
                  >
                    Scan QR for Google<br />Maps Venue Navigation
                  </span>
                </div>
              )}

              <p
                className="text-[9px] sm:text-[10px] opacity-90 pt-0.5"
                style={{ color: currentTheme.goldColorHex }}
              >
                विनीत: {formData.rsvpNames} | Mo: {formData.rsvpPhone}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-1">
            <button
              onClick={handleOpenInEditor}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <Edit3 className="w-4 h-4" />
              <span>Customize in Canva Drag-and-Drop Studio</span>
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `🌸 Wedding Invitation 🌸\n\n${formData.groomName} Weds ${formData.brideName}\nDate: ${formData.weddingDate}\nVenue: ${formData.venueName}, ${formData.venueAddress}\n\nWe cordially invite you and your family!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>

            {/* Mobile: Return to Edit form button */}
            <button
              onClick={() => setMobileTab('form')}
              className="lg:hidden w-full py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg text-center"
            >
              &larr; Back to Edit Form & Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
