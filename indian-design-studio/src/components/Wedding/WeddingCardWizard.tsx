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
  Monitor,
  Search,
  Sparkles,
  Keyboard,
  ChevronDown,
  ChevronUp,
  BookOpen
} from 'lucide-react';
import QRCode from 'qrcode';
import { WeddingFormData } from '@/types';
import { saveProject } from '@/lib/storage';
import jsPDF from 'jspdf';
import {
  WEDDING_THEMES_COLLECTION,
  DetailedCardTheme
} from './weddingThemesData';
import { IndicTextInput } from './IndicTextInput';
import { VirtualHindiKeyboard } from './VirtualHindiKeyboard';
import { WeddingCardMotif } from './WeddingCardMotifs';
import { WEDDING_PHRASE_BANK, transliterateText } from '@/lib/transliterate';
import { CalligraphyLibraryModal } from './CalligraphyLibraryModal';
import { CalligraphyItem } from '@/lib/weddingCalligraphyData';

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

  // Active theme & filter state
  const [selectedThemeId, setSelectedThemeId] = useState<string>('hindu-royal-crimson');
  const [cultureFilter, setCultureFilter] = useState<string>('All');
  const [themeSearch, setThemeSearch] = useState<string>('');

  // Fonts state
  const [coupleFont, setCoupleFont] = useState<string>('Rozha One');
  const [headerFont, setHeaderFont] = useState<string>('Rozha One');
  const [bodyFont, setBodyFont] = useState<string>('Noto Sans Devanagari');
  const [coupleFontSize, setCoupleFontSize] = useState<'normal' | 'large' | 'xl'>('large');

  // Hindi & Indic Typing state
  const [hindiTypingEnabled, setHindiTypingEnabled] = useState<boolean>(true);
  const [showKeyboard, setShowKeyboard] = useState<boolean>(false);
  const [showPhrases, setShowPhrases] = useState<boolean>(false);
  const [activePhraseCat, setActivePhraseCat] = useState<string>('All');
  const [isCalligraphyModalOpen, setIsCalligraphyModalOpen] = useState<boolean>(false);

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

  // Active theme object from 100+ collection
  const currentTheme =
    WEDDING_THEMES_COLLECTION.find((t) => t.id === selectedThemeId) ||
    WEDDING_THEMES_COLLECTION[0];

  // Filter themes based on cultural tab and search query
  const filteredThemes = WEDDING_THEMES_COLLECTION.filter((theme) => {
    const matchesCulture = cultureFilter === 'All' || theme.cultureTag === cultureFilter;
    const matchesSearch =
      theme.name.toLowerCase().includes(themeSearch.toLowerCase()) ||
      theme.culture.toLowerCase().includes(themeSearch.toLowerCase()) ||
      theme.description.toLowerCase().includes(themeSearch.toLowerCase());
    return matchesCulture && matchesSearch;
  });

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
  const handleSelectTheme = (theme: DetailedCardTheme) => {
    setSelectedThemeId(theme.id);
    handleChange('shlokaOrBismillah', theme.shlokaHeader);

    if (theme.cultureTag === 'Muslim') {
      setCoupleFont('Great Vibes');
      setHeaderFont('Cinzel');
    } else if (theme.cultureTag === 'Punjabi') {
      setCoupleFont('Yatra One');
      setHeaderFont('Yatra One');
    } else if (theme.cultureTag === 'Modern') {
      setCoupleFont('Playfair Display');
      setHeaderFont('Cinzel');
    } else if (theme.cultureTag === 'South') {
      setCoupleFont('Marcellus');
      setHeaderFont('Tiro Devanagari Hindi');
    } else if (theme.cultureTag === 'Bengali') {
      setCoupleFont('Rozha One');
      setHeaderFont('Rozha One');
    } else {
      setCoupleFont('Rozha One');
      setHeaderFont('Rozha One');
    }
  };

  // Switch Language Preset
  const handleLanguageToggle = (lang: 'Hindi' | 'English') => {
    setLanguage(lang);
    if (lang === 'English') {
      setHindiTypingEnabled(false);
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
        shlokaOrBismillah: currentTheme.cultureTag === 'Muslim'
          ? 'In the Name of Allah, the Most Beneficent'
          : 'Cordially Invite You to the Wedding of',
      }));
      setCoupleFont('Cinzel');
      setHeaderFont('Cinzel');
      setBodyFont('Poppins');
    } else {
      setHindiTypingEnabled(true);
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
        shlokaOrBismillah: currentTheme.shlokaHeader || '॥ श्री गणेशाय नमः ॥',
      }));
      setCoupleFont('Rozha One');
      setHeaderFont('Rozha One');
      setBodyFont('Noto Sans Devanagari');
    }
  };

  // Insert Phrase from Phrase Bank
  const handleInsertPhrase = (text: string) => {
    handleChange('shlokaOrBismillah', text);
  };

  // Select Calligraphy from 160+ Master Library
  const handleSelectCalligraphy = (item: CalligraphyItem) => {
    handleChange('shlokaOrBismillah', item.text);
    if (item.fontFamily) {
      setHeaderFont(item.fontFamily);
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
          fontSize: 32,
          fill: currentTheme.goldColorHex,
          fontFamily: 'Great Vibes',
        },
        {
          type: 'i-text',
          text: formData.brideName,
          left: 600,
          top: 720,
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
          top: 800,
          originX: 'center',
          fontSize: 24,
          fill: currentTheme.goldColorHex,
          fontFamily: bodyFont,
        },
        {
          type: 'i-text',
          text: `${formData.weddingDate}\n${formData.weddingTime}`,
          left: 600,
          top: 980,
          originX: 'center',
          textAlign: 'center',
          fontSize: 28,
          fill: currentTheme.goldColorHex,
          fontFamily: headerFont,
          fontWeight: 'bold',
          lineHeight: 1.4,
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

      // Parse hex color to rgb
      const hexToRgb = (hex: string) => {
        const bigint = parseInt(hex.replace('#', ''), 16);
        return {
          r: (bigint >> 16) & 255,
          g: (bigint >> 8) & 255,
          b: bigint & 255,
        };
      };

      const bgRgb = hexToRgb(currentTheme.bgColorHex);
      const borderRgb = hexToRgb(currentTheme.borderColorHex);
      const goldRgb = hexToRgb(currentTheme.goldColorHex);
      const textRgb = hexToRgb(currentTheme.textColorHex);

      doc.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
      doc.rect(0, 0, 140, 210, 'F');

      // Border
      doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
      doc.setLineWidth(1.5);
      doc.rect(6, 6, 128, 198);

      // Inner dashed border
      doc.setDrawColor(goldRgb.r, goldRgb.g, goldRgb.b);
      doc.setLineWidth(0.5);
      doc.rect(9, 9, 122, 192);

      // Header
      doc.setTextColor(goldRgb.r, goldRgb.g, goldRgb.b);
      doc.setFontSize(13);
      doc.text(formData.shlokaOrBismillah || 'Shree Ganeshaya Namah', 70, 25, { align: 'center' });

      // Groom
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      doc.setFontSize(22);
      doc.text(formData.groomName, 70, 52, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(goldRgb.r, goldRgb.g, goldRgb.b);
      doc.text(formData.groomParents, 70, 60, { align: 'center' });

      // Weds
      doc.setTextColor(217, 119, 6);
      doc.setFontSize(14);
      doc.text('Weds (संग)', 70, 72, { align: 'center' });

      // Bride
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      doc.setFontSize(22);
      doc.text(formData.brideName, 70, 86, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(goldRgb.r, goldRgb.g, goldRgb.b);
      doc.text(formData.brideParents, 70, 94, { align: 'center' });

      // Date Time
      doc.setTextColor(goldRgb.r, goldRgb.g, goldRgb.b);
      doc.setFontSize(11);
      doc.text(`${formData.weddingDate} • ${formData.weddingTime}`, 70, 115, { align: 'center' });

      // Venue
      doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
      doc.setFontSize(12);
      doc.text(formData.venueName, 70, 130, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(goldRgb.r, goldRgb.g, goldRgb.b);
      doc.text(formData.venueAddress, 70, 138, { align: 'center' });

      // QR Code
      if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', 55, 148, 30, 30);
        doc.setFontSize(8);
        doc.setTextColor(textRgb.r, textRgb.g, textRgb.b);
        doc.text('Scan for Google Maps Venue', 70, 182, { align: 'center' });
      }

      // RSVP
      doc.setFontSize(9);
      doc.setTextColor(goldRgb.r, goldRgb.g, goldRgb.b);
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
          Indian Wedding Card Studio (100+ Authentic Themes)
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Design Pure Indian Wedding Cards
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-2">
          108+ Culturally Rich Indian Wedding Card Themes, Hindi Transliteration Typing (Hinglish &rarr; हिन्दी), Auspicious Shlokas Bank & Instant 300 DPI PDF Exports.
        </p>
      </div>

      {/* MOBILE RESPONSIVE TAB SWITCHER */}
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
            <span>1. Edit Details & Theme</span>
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mobileTab === 'preview'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>2. View Live Card</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* LEFT COLUMN: CONTROLS & FORM */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            mobileTab === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* 1. MASSIVE 100+ THEME SELECTOR & CULTURAL FILTERS */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  1. Choose from 100+ Indian Wedding Themes
                </h3>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {filteredThemes.length} Themes Available
              </span>
            </div>

            {/* Cultural Tabs Filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs font-semibold">
              {[
                { id: 'All', label: 'All (108)' },
                { id: 'Hindu', label: '👑 Hindu Royal (15)' },
                { id: 'Rajasthani', label: '🏰 Rajasthani (12)' },
                { id: 'South', label: '🌴 South Indian (15)' },
                { id: 'Punjabi', label: '🌾 Punjabi & Sikh (12)' },
                { id: 'Bengali', label: '🪷 Bengali (12)' },
                { id: 'Muslim', label: '🕌 Muslim Nikaah (12)' },
                { id: 'Gujarati', label: '🦚 Gujarati Kankotri (12)' },
                { id: 'Modern', label: '✨ Modern Pastel (14)' },
                { id: 'Pre-Wedding', label: '🎉 Haldi & Mehndi (14)' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCultureFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                    cultureFilter === tab.id
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={themeSearch}
                onChange={(e) => setThemeSearch(e.target.value)}
                placeholder="Search by name, region, color (e.g. Haldi, Rajput, Bengali, Emerald, Kanchipuram)..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50"
              />
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {filteredThemes.map((theme) => {
                const isSelected = selectedThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme)}
                    className={`text-left p-3 rounded-xl border-2 transition-all relative overflow-hidden group flex flex-col justify-between ${
                      isSelected
                        ? 'border-amber-600 ring-2 ring-amber-500/20 bg-amber-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {/* Color Swatch Header */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-xs"
                        style={{ backgroundColor: theme.bgColorHex }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border border-black/10 shrink-0 shadow-xs"
                        style={{ backgroundColor: theme.borderColorHex }}
                      />
                      <span className="text-[10px] font-bold text-slate-500 truncate ml-auto">
                        {theme.cultureTag}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-xs text-slate-900 leading-tight group-hover:text-amber-700 transition">
                        {theme.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        {theme.culture}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-amber-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. TYPOGRAPHY & INDIC FONTS */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  2. Choose Wedding Typography & Fonts
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                Indian & Devanagari Fonts
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

            {/* Live font preview */}
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

          {/* 3. COUPLE & CEREMONY DETAILS FORM WITH HINDI TRANSLITERATION */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                3. Couple & Ceremony Details
              </h3>

              {/* HINDI TYPING MODE TOGGLE */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setHindiTypingEnabled(!hindiTypingEnabled)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    hindiTypingEnabled
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Enable real-time phonetic Hindi typing (e.g. rohan -> रोहन)"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    🇮🇳 हिन्दी टाइपिंग: {hindiTypingEnabled ? 'ON (Hinglish)' : 'OFF'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowKeyboard(!showKeyboard)}
                  className={`p-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                    showKeyboard
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title="Toggle Virtual On-Screen Devanagari Keyboard"
                >
                  <Keyboard className="w-4 h-4 text-amber-500" />
                </button>
              </div>
            </div>

            {/* Virtual On-screen Devanagari Keyboard Drawer */}
            <VirtualHindiKeyboard
              isOpen={showKeyboard}
              onClose={() => setShowKeyboard(false)}
              onInsertChar={(char) => {
                // append to active field (e.g. shloka or groomName)
                handleChange('shlokaOrBismillah', (formData.shlokaOrBismillah || '') + char);
              }}
            />

            {/* 160+ WEDDING CALLIGRAPHY MASTER STATION */}
            <div className="bg-linear-to-r from-amber-50 via-orange-50 to-amber-100/70 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-extrabold text-amber-950">
                      भारतीय शादी कैलीग्राफी संग्रह (160+ Master Calligraphy)
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      शुभ विवाह, वैदिक श्लोक, बाल मनुहार, रस्में, राजस्थानी, गुजराती, पंजाबी, निकाह व स्वाश
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCalligraphyModalOpen(true)}
                  className="px-4 py-2 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 shrink-0"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>लाइब्रेरी खोलें (160+) &rarr;</span>
                </button>
              </div>

              {/* Quick Category Shortcut Pills */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                  त्वरित श्रेणियां (Quick Categories):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '🪷 शुभ विवाह (25)', text: '॥ शुभ विवाह ॥' },
                    { label: '🕉️ श्री गणेश (20)', text: '॥ श्री गणेशाय नमः ॥' },
                    { label: '📜 वैदिक श्लोक (20)', text: 'मंगलम् भगवान विष्णुः मंगलम् गरुडध्वजः। मंगलम् पुण्डरीकाक्षः मंगलाय तनो हरिः॥' },
                    { label: '💌 बाल मनुहार (15)', text: 'चाचा-चाची की शादी में, रसगुल्ले की मिठास में। जलूल-जलूल पधारना हमारी आस में! - समस्त नन्हे-मुन्ने' },
                    { label: '👑 राजस्थानी (12)', text: '॥ खम्मा घणी - पधारो म्हारे देस ॥' },
                    { label: '🦚 गुजराती કંકોતરી (12)', text: '॥ શ્રી ગણેશાય નમઃ ॥ કંકુછાંટણાં' },
                    { label: '☬ ਪੰਜਾਬੀ ਅਨੰਦ ਕਾਰਜ (12)', text: 'ੴ ਸਤਿਗੁਰ ਪ੍ਰਸਾਦਿ ॥ ਲਾਵਾਂ ਫੇਰੇ ॥' },
                    { label: '🕌 نکاح مبارک (12)', text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (Nikaah Ceremony)' },
                    { label: '⚜️ अलंकृत स्वाश (20)', text: '꧁༺ शुभ विवाह ༻꧂' },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleInsertPhrase(chip.text)}
                      className="text-[11px] font-semibold bg-white hover:bg-amber-100 text-amber-950 border border-amber-300/80 px-2.5 py-1 rounded-lg transition shadow-2xs text-left"
                      title={chip.text}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calligraphy Library Modal Component */}
            <CalligraphyLibraryModal
              isOpen={isCalligraphyModalOpen}
              onClose={() => setIsCalligraphyModalOpen(false)}
              onSelectCalligraphy={handleSelectCalligraphy}
            />

            {/* Auspicious Shloka / Header */}
            <IndicTextInput
              label="Auspicious Header / Mantra (मांगलिक श्लोक या बिस्मिल्लाह)"
              value={formData.shlokaOrBismillah || ''}
              onChange={(val) => handleChange('shlokaOrBismillah', val)}
              placeholder="॥ श्री गणेशाय नमः ॥"
              hindiTypingEnabled={hindiTypingEnabled}
            />

            {/* Couple names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IndicTextInput
                label="Groom Name (वर का नाम)"
                value={formData.groomName}
                onChange={(val) => handleChange('groomName', val)}
                placeholder="रोहन शर्मा"
                hindiTypingEnabled={hindiTypingEnabled}
                required
              />
              <IndicTextInput
                label="Bride Name (वधू का नाम)"
                value={formData.brideName}
                onChange={(val) => handleChange('brideName', val)}
                placeholder="अनन्या वर्मा"
                hindiTypingEnabled={hindiTypingEnabled}
                required
              />
              <IndicTextInput
                label="Groom's Parents (वर पक्ष माता-पिता)"
                value={formData.groomParents}
                onChange={(val) => handleChange('groomParents', val)}
                placeholder="श्रीमती सुनीता एवं श्री राजेश शर्मा"
                hindiTypingEnabled={hindiTypingEnabled}
              />
              <IndicTextInput
                label="Bride's Parents (वधू पक्ष माता-पिता)"
                value={formData.brideParents}
                onChange={(val) => handleChange('brideParents', val)}
                placeholder="श्रीमती कविता एवं श्री मनोज वर्मा"
                hindiTypingEnabled={hindiTypingEnabled}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <IndicTextInput
                label="Wedding Date (शुभ विवाह दिनांक)"
                value={formData.weddingDate}
                onChange={(val) => handleChange('weddingDate', val)}
                placeholder="रविवार, 15 दिसंबर 2026"
                hindiTypingEnabled={hindiTypingEnabled}
              />
              <IndicTextInput
                label="Wedding Time (शुभ मुहूर्त समय)"
                value={formData.weddingTime}
                onChange={(val) => handleChange('weddingTime', val)}
                placeholder="सायं 07:00 बजे से"
                hindiTypingEnabled={hindiTypingEnabled}
              />
            </div>

            {/* Venue Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <IndicTextInput
                  label="Venue Name (विवाह स्थल / मैरिज गार्डन)"
                  value={formData.venueName}
                  onChange={(val) => handleChange('venueName', val)}
                  placeholder="हवेली हेरिटेज पैलेस एवं लॉन्स"
                  hindiTypingEnabled={hindiTypingEnabled}
                />
              </div>

              <div className="sm:col-span-2">
                <IndicTextInput
                  label="Venue Full Address (पता)"
                  value={formData.venueAddress}
                  onChange={(val) => handleChange('venueAddress', val)}
                  placeholder="नियर राजापार्क चौराहा, जयपुर, राजस्थान"
                  hindiTypingEnabled={hindiTypingEnabled}
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
                <IndicTextInput
                  label="RSVP Names (विनीत / दर्शनाभिलाषी)"
                  value={formData.rsvpNames}
                  onChange={(val) => handleChange('rsvpNames', val)}
                  placeholder="समस्त शर्मा एवं वर्मा परिवार"
                  hindiTypingEnabled={hindiTypingEnabled}
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

        {/* RIGHT COLUMN: LIVE CARD PREVIEW WITH MOTIFS & BORDERS */}
        <div
          className={`lg:col-span-5 lg:sticky lg:top-24 space-y-4 ${
            mobileTab === 'form' ? 'hidden lg:block' : 'block'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-amber-600" />
              Live Interactive Preview ({currentTheme.cultureTag})
            </span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-mono text-[10px]">
              5" × 7.5" Ratio
            </span>
          </div>

          {/* THE WEDDING CARD CANVAS CONTAINER */}
          <div
            className={`w-full aspect-[1/1.5] rounded-3xl shadow-2xl p-5 sm:p-7 flex flex-col justify-between text-center relative overflow-hidden transition-all duration-300 border-4 ${
              currentTheme.borderStyle === 'jharokha-arch'
                ? 'rounded-t-[80px]'
                : currentTheme.borderStyle === 'mughal-arch'
                ? 'rounded-t-[100px]'
                : ''
            }`}
            style={{
              backgroundColor: currentTheme.bgColorHex,
              color: currentTheme.textColorHex,
              borderColor: currentTheme.borderColorHex,
            }}
          >
            {/* Outer Decorative Gold Borders */}
            <div
              className={`absolute inset-2 sm:inset-3 border rounded-2xl pointer-events-none opacity-80 ${
                currentTheme.borderStyle === 'jharokha-arch'
                  ? 'rounded-t-[72px]'
                  : currentTheme.borderStyle === 'mughal-arch'
                  ? 'rounded-t-[92px]'
                  : ''
              }`}
              style={{ borderColor: currentTheme.borderColorHex }}
            />
            <div
              className="absolute inset-3.5 sm:inset-5 border border-dashed rounded-xl pointer-events-none opacity-50"
              style={{ borderColor: currentTheme.goldColorHex }}
            />

            {/* Auspicious Motif (Ganesh, Kalash, Bismillah, Khanda, Peacock, Lotus, etc.) */}
            <div className="relative z-10 pt-1 sm:pt-2 flex flex-col items-center">
              <div className="mb-1">
                <WeddingCardMotif
                  type={currentTheme.motif}
                  color={currentTheme.goldColorHex}
                  className="w-10 h-10 sm:w-12 sm:h-12"
                />
              </div>

              {/* Mantra / Header */}
              <p
                className="text-xs sm:text-sm font-bold tracking-wide leading-snug drop-shadow-xs max-w-xs"
                style={{
                  fontFamily: headerFont,
                  color: currentTheme.goldColorHex,
                }}
              >
                {formData.shlokaOrBismillah}
              </p>
              <div
                className="w-20 sm:w-28 h-0.5 mx-auto my-1.5 opacity-80"
                style={{ backgroundColor: currentTheme.borderColorHex }}
              />
            </div>

            {/* Couple Names Section with Selected Custom Font */}
            <div className="relative z-10 my-auto space-y-1.5 sm:space-y-2.5">
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
            <div className="relative z-10 pt-1 space-y-1.5">
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
                    <img src={qrCodeDataUrl} alt="Venue QR" className="w-10 sm:w-11 h-10 sm:h-11" />
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

          {/* Action CTAs */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleOpenInEditor}
              className="w-full py-3 px-4 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Customize in Canva Drag-and-Drop Studio &rarr;</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
              </button>

              <button
                onClick={() => {
                  const text = `Wedding Invitation of ${formData.groomName} & ${formData.brideName} on ${formData.weddingDate}. Venue: ${formData.venueName}.`;
                  window.open(
                    `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
                    '_blank'
                  );
                }}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
