'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  Share2,
  Download,
  Sparkles,
  Edit3,
  Check,
  Languages,
  Phone
} from 'lucide-react';
import QRCode from 'qrcode';
import { WeddingFormData } from '@/types';
import { saveProject } from '@/lib/storage';
import jsPDF from 'jspdf';

export default function WeddingCardWizard() {
  const router = useRouter();

  // Selected Category / Subtype
  const [subType, setSubType] = useState<'hindu' | 'muslim' | 'sikh' | 'south-indian' | 'rajasthani' | 'haldi' | 'mehndi' | 'reception'>('hindu');
  const [language, setLanguage] = useState<'Hindi' | 'English'>('Hindi');

  // Form details
  const [formData, setFormData] = useState<WeddingFormData>({
    groomName: 'रोहन शर्मा',
    brideName: 'अनन्या वर्मा',
    groomParents: 'श्रीमती सुनीता एवं श्री राजेश शर्मा',
    brideParents: 'श्रीमती कविता एवं श्री मनोज वर्मा',
    weddingDate: '15 दिसंबर 2026',
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

  // Generate QR Code for Maps URL
  React.useEffect(() => {
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

  // Change subType and auto-update cultural headings
  const handleSubTypeChange = (type: any) => {
    setSubType(type);
    if (type === 'muslim') {
      handleChange('shlokaOrBismillah', 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ (Nikaah Mubarak)');
      if (language === 'Hindi') {
        handleChange('groomName', 'ज़ैद खान');
        handleChange('brideName', 'आयशा सिद्दीकी');
        handleChange('venueName', 'शाही नूर बैंक्वेट हॉल, लखनऊ');
      }
    } else if (type === 'sikh') {
      handleChange('shlokaOrBismillah', 'ੴ सतिगुरु प्रसादि (Anand Karaj)');
      if (language === 'Hindi') {
        handleChange('groomName', 'गुरप्रीत सिंह');
        handleChange('brideName', 'हरलीन कौर');
        handleChange('venueName', 'गुरुद्वारा श्री गुरु सिंह सभा, अमृतसर');
      }
    } else if (type === 'haldi') {
      handleChange('shlokaOrBismillah', '✨ शुभ हल्दी समारोह ✨');
      handleChange('weddingTime', 'प्रातः 11:00 बजे से');
    } else if (type === 'mehndi') {
      handleChange('shlokaOrBismillah', '🌿 रंगीलो मेहंदी उत्सव 🌿');
      handleChange('weddingTime', 'दोपहर 03:00 बजे से');
    } else if (type === 'reception') {
      handleChange('shlokaOrBismillah', '🥂 Grand Wedding Reception 🥂');
    } else {
      handleChange('shlokaOrBismillah', '॥ श्री गणेशाय नमः ॥');
    }
  };

  // Switch Language defaults
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
        shlokaOrBismillah: subType === 'muslim' ? 'Bismillah Calligraphy (Nikaah Ceremony)' : 'Cordially Invite You to the Wedding of',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        language: 'Hindi',
        groomName: 'रोहन शर्मा',
        brideName: 'अनन्या वर्मा',
        groomParents: 'श्रीमती सुनीता एवं श्री राजेश शर्मा',
        brideParents: 'श्रीमती कविता एवं श्री मनोज वर्मा',
        weddingDate: '15 दिसंबर 2026',
        weddingTime: 'सायं 07:00 बजे से',
        venueName: 'हवेली हेरिटेज पैलेस एवं लॉन्स',
        venueAddress: 'नियर राजापार्क चौराहा, जयपुर, राजस्थान',
        rsvpNames: 'समस्त शर्मा एवं वर्मा परिवार',
        shlokaOrBismillah: subType === 'muslim' ? 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ (निकाह मुबारक)' : '॥ श्री गणेशाय नमः ॥',
      }));
    }
  };

  // Open in Full Canvas Editor
  const handleOpenInEditor = () => {
    // Generate Fabric.js objects reflecting this customized card
    const isRedTheme = subType === 'hindu' || subType === 'rajasthani';
    const isYellowTheme = subType === 'haldi';
    const isGreenTheme = subType === 'mehndi' || subType === 'muslim';

    const bgColor = isYellowTheme ? '#fef08a' : isGreenTheme ? '#064e3b' : '#580816';
    const textColor = isYellowTheme ? '#78350f' : '#ffffff';
    const goldColor = isYellowTheme ? '#b45309' : '#fde047';

    const canvasData = {
      version: '5.3.0',
      objects: [
        {
          type: 'rect',
          left: 0,
          top: 0,
          width: 1200,
          height: 1800,
          fill: bgColor,
          selectable: false,
        },
        {
          type: 'rect',
          left: 40,
          top: 40,
          width: 1120,
          height: 1720,
          fill: 'transparent',
          stroke: '#d4af37',
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
          fill: goldColor,
          fontFamily: 'Noto Sans Devanagari',
          fontWeight: 'bold',
        },
        {
          type: 'i-text',
          text: formData.groomName,
          left: 600,
          top: 450,
          originX: 'center',
          fontSize: 56,
          fill: textColor,
          fontFamily: 'Rozha One',
          fontWeight: 'bold',
        },
        {
          type: 'i-text',
          text: `(${formData.groomParents})`,
          left: 600,
          top: 520,
          originX: 'center',
          fontSize: 24,
          fill: goldColor,
          fontFamily: 'Noto Sans Devanagari',
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
          fontSize: 56,
          fill: textColor,
          fontFamily: 'Rozha One',
          fontWeight: 'bold',
        },
        {
          type: 'i-text',
          text: `(${formData.brideParents})`,
          left: 600,
          top: 770,
          originX: 'center',
          fontSize: 24,
          fill: goldColor,
          fontFamily: 'Noto Sans Devanagari',
        },
        {
          type: 'i-text',
          text: `${formData.weddingDate} • ${formData.weddingTime}`,
          left: 600,
          top: 960,
          originX: 'center',
          fontSize: 32,
          fill: textColor,
          fontFamily: 'Poppins',
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
          fill: goldColor,
          fontFamily: 'Noto Sans Devanagari',
          lineHeight: 1.5,
        },
        {
          type: 'i-text',
          text: `RSVP: ${formData.rsvpNames}\nMo.: ${formData.rsvpPhone}`,
          left: 600,
          top: 1440,
          originX: 'center',
          textAlign: 'center',
          fontSize: 24,
          fill: textColor,
          fontFamily: 'Poppins',
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
        format: [140, 210], // 5.5 x 8.25 inches
      });

      // Background
      const isYellow = subType === 'haldi';
      const isGreen = subType === 'mehndi' || subType === 'muslim';
      if (isYellow) {
        doc.setFillColor(254, 240, 138);
      } else if (isGreen) {
        doc.setFillColor(6, 78, 59);
      } else {
        doc.setFillColor(88, 8, 22);
      }
      doc.rect(0, 0, 140, 210, 'F');

      // Border
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(1.5);
      doc.rect(6, 6, 128, 198);

      // Header
      doc.setTextColor(253, 224, 71);
      doc.setFontSize(14);
      doc.text(formData.shlokaOrBismillah || 'Shree Ganeshaya Namah', 70, 25, { align: 'center' });

      // Groom
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text(formData.groomName, 70, 52, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(254, 215, 170);
      doc.text(formData.groomParents, 70, 60, { align: 'center' });

      // Weds
      doc.setTextColor(251, 191, 36);
      doc.setFontSize(14);
      doc.text('Weds (संग)', 70, 72, { align: 'center' });

      // Bride
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text(formData.brideName, 70, 86, { align: 'center' });

      doc.setFontSize(10);
      doc.setTextColor(254, 215, 170);
      doc.text(formData.brideParents, 70, 94, { align: 'center' });

      // Date Time
      doc.setTextColor(253, 224, 71);
      doc.setFontSize(12);
      doc.text(`${formData.weddingDate} • ${formData.weddingTime}`, 70, 115, { align: 'center' });

      // Venue
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(formData.venueName, 70, 130, { align: 'center' });
      doc.setFontSize(9);
      doc.setTextColor(254, 240, 138);
      doc.text(formData.venueAddress, 70, 138, { align: 'center' });

      // QR Code if available
      if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', 55, 148, 30, 30);
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text('Scan for Google Maps Venue', 70, 182, { align: 'center' });
      }

      // RSVP
      doc.setFontSize(9);
      doc.setTextColor(254, 215, 170);
      doc.text(`RSVP: ${formData.rsvpNames} | Ph: ${formData.rsvpPhone}`, 70, 194, { align: 'center' });

      doc.save(`${formData.groomName}_${formData.brideName}_Invitation.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold mb-2">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          Indian Wedding Invitation Studio
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Create Royal Indian Wedding Cards
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Fill in the couple & ceremony details below to generate instant multi-faith wedding cards with live Google Maps venue QR code and WhatsApp sharing.
        </p>
      </div>

      {/* Faith & Theme selector tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {[
          { id: 'hindu', label: 'Hindu Royal' },
          { id: 'rajasthani', label: 'Rajasthani Heritage' },
          { id: 'haldi', label: 'Haldi Ceremony' },
          { id: 'mehndi', label: 'Mehndi Raat' },
          { id: 'muslim', label: 'Muslim Nikaah' },
          { id: 'sikh', label: 'Sikh Anand Karaj' },
          { id: 'south-indian', label: 'South Indian Vivaham' },
          { id: 'reception', label: 'Grand Reception' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleSubTypeChange(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
              subType === tab.id
                ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Form on Left, Live Card Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM PANEL (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-base text-slate-900">1. Couple & Family Details</h3>
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Groom's Name (वर का नाम)
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
                Bride's Name (वधू का नाम)
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

          <div className="border-t border-slate-100 pt-5">
            <h3 className="font-bold text-base text-slate-900 mb-4">2. Ceremony, Venue & Map</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Google Maps Location Link (for Auto QR Code)
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
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h3 className="font-bold text-base text-slate-900 mb-4">3. RSVP & Family Info</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          </div>

          {/* Action CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleOpenInEditor}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98"
            >
              <Edit3 className="w-4 h-4" />
              Open & Customize in Full Studio
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              {isExporting ? 'Generating PDF...' : 'Download Print PDF'}
            </button>
          </div>
        </div>

        {/* LIVE CARD PREVIEW PANEL (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Live Card Preview</span>
            <span className="text-amber-600 font-semibold">5" x 7.5" Ratio</span>
          </div>

          {/* Card Rendering Box */}
          <div
            className={`w-full aspect-[1/1.5] rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col justify-between text-center relative overflow-hidden transition-all duration-300 border-4 ${
              subType === 'haldi'
                ? 'bg-amber-100 border-amber-300 text-amber-950'
                : subType === 'mehndi' || subType === 'muslim'
                ? 'bg-emerald-950 border-amber-400 text-white'
                : 'bg-rose-950 border-amber-400 text-white'
            }`}
          >
            {/* Outer Decorative Line */}
            <div className="absolute inset-2.5 border border-amber-400/60 rounded-xl pointer-events-none" />
            <div className="absolute inset-4 border border-dashed border-amber-300/40 rounded-lg pointer-events-none" />

            {/* Header / Mantra */}
            <div className="relative z-10 pt-2">
              <p className="text-amber-300 font-rozha text-sm sm:text-base font-bold tracking-wide">
                {formData.shlokaOrBismillah}
              </p>
              <div className="w-24 h-0.5 bg-amber-400/80 mx-auto my-2" />
            </div>

            {/* Couple Names */}
            <div className="relative z-10 my-auto space-y-3">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-rozha tracking-wide drop-shadow-sm">
                  {formData.groomName}
                </h2>
                <p className="text-[11px] text-amber-200/90 mt-0.5">
                  ({formData.groomParents})
                </p>
              </div>

              <div className="text-amber-300 font-script text-2xl italic">
                संग (Weds)
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-rozha tracking-wide drop-shadow-sm">
                  {formData.brideName}
                </h2>
                <p className="text-[11px] text-amber-200/90 mt-0.5">
                  ({formData.brideParents})
                </p>
              </div>
            </div>

            {/* Date, Venue, QR & RSVP */}
            <div className="relative z-10 pt-2 space-y-2.5">
              <div className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide">
                {formData.weddingDate} • {formData.weddingTime}
              </div>

              <div className="bg-black/25 backdrop-blur-xs p-2.5 rounded-xl border border-amber-400/30 text-xs">
                <p className="font-semibold text-white">{formData.venueName}</p>
                <p className="text-[10px] text-amber-200/80">{formData.venueAddress}</p>
              </div>

              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="p-1 bg-white rounded-lg shadow-sm">
                    <img src={qrCodeDataUrl} alt="Venue Map QR" className="w-12 h-12" />
                  </div>
                  <span className="text-[10px] text-left text-amber-200 leading-tight">
                    Scan for Google<br />Maps Navigation
                  </span>
                </div>
              )}

              <p className="text-[10px] text-amber-200/90 pt-1">
                विनीत: {formData.rsvpNames} | Ph: {formData.rsvpPhone}
              </p>
            </div>
          </div>

          {/* Quick WhatsApp Share Button */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `🌸 Wedding Invitation 🌸\n\n${formData.groomName} Weds ${formData.brideName}\nDate: ${formData.weddingDate}\nVenue: ${formData.venueName}, ${formData.venueAddress}\n\nWe cordially invite you and your family!`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full mt-3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Invitation on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
