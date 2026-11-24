'use client';

import React, { useState } from 'react';
import {
  WEDDING_CALLIGRAPHY_COLLECTION,
  CalligraphyItem
} from '@/lib/weddingCalligraphyData';
import {
  Search,
  Sparkles,
  Copy,
  Check,
  X,
  Type,
  BookOpen,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface CalligraphyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCalligraphy: (item: CalligraphyItem) => void;
}

export const CalligraphyLibraryModal: React.FC<CalligraphyModalProps> = ({
  isOpen,
  onClose,
  onSelectCalligraphy,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: `सभी कैलीग्राफी (${WEDDING_CALLIGRAPHY_COLLECTION.length})` },
    { id: 'vivah', label: '॥ शुभ विवाह एवं परिणय ॥' },
    { id: 'ganesh', label: 'श्री गणेश एवं देव स्तुति' },
    { id: 'shloka', label: 'वैदिक संस्कृत श्लोक' },
    { id: 'invitation', label: 'सस्नेह निमंत्रण एवं स्वागत' },
    { id: 'balmanuhar', label: 'बाल मनुहार एवं शायरी' },
    { id: 'functions', label: 'हल्दी, मेहंदी, संगीत, बारात रस्में' },
    { id: 'rajasthani', label: 'खम्मा घणी (राजस्थानी)' },
    { id: 'gujarati', label: 'કંકોતરી (ગુજરાતી)' },
    { id: 'punjabi', label: 'ਅਨੰਦ ਕਾਰਜ (ਪੰਜਾਬੀ)' },
    { id: 'islamic', label: 'نکاح مبارک (عربی و اردو)' },
    { id: 'bengali', label: 'শুভ বিবাহ (বাঙালি)' },
    { id: 'south', label: 'சுப முகூர்த்தம் (South Indian)' },
    { id: 'swashes', label: 'अलंकृत बॉर्डर, डोली, शहनाई स्वाश' },
  ];

  const filteredItems = WEDDING_CALLIGRAPHY_COLLECTION.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subText && item.subText.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleCopy = (item: CalligraphyItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/30">
        {/* Header */}
        <div className="px-5 sm:px-8 py-4 sm:py-5 bg-linear-to-r from-amber-700 via-amber-800 to-orange-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center border border-amber-300/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-extrabold tracking-tight">
                भारतीय शादी कैलीग्राफी संग्रह (160+ Master Calligraphy)
              </h2>
              <p className="text-xs sm:text-sm text-amber-200/90 mt-0.5">
                शुभ विवाह, वैदिक श्लोक, बाल मनुहार, रस्में, राजस्थानी, गुजराती, पंजाबी, निकाह व अलंकृत स्वाश
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Filter bar & Search */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Box */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="कैलीग्राफी सर्च करें (e.g. शुभ विवाह, गणेश, श्लोक, बाल मनुहार, हल्दी, बिस्मिल्लाह)..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium"
              />
            </div>

            {/* Quick Count Badge */}
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold text-slate-600">
              <span className="bg-amber-100 text-amber-900 px-3 py-2 rounded-xl border border-amber-200">
                कुल उपलब्ध: {filteredItems.length} कैलीग्राफी
              </span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-amber-700 text-white font-bold shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calligraphy Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectCalligraphy(item);
                    onClose();
                  }}
                  className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-500 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Decorative corner tag */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                      {item.categoryLabel}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(item, e)}
                      className="p-1 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-md transition"
                      title="Copy text"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Main Calligraphic Text Display */}
                  <div className="my-2 p-3 bg-amber-50/40 border border-amber-100/80 rounded-xl text-center flex flex-col items-center justify-center min-h-[72px]">
                    <p
                      className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-amber-800 transition leading-snug"
                      style={{
                        fontFamily: item.fontFamily || 'Rozha One, serif',
                      }}
                    >
                      {item.text}
                    </p>
                  </div>

                  {/* Bottom info & Select Button */}
                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800 text-[11px] truncate max-w-[180px]">
                        {item.title}
                      </p>
                      {item.subText && (
                        <p className="text-[10px] text-slate-500 truncate max-w-[180px]">
                          {item.subText}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 group-hover:underline flex items-center gap-1">
                      लागू करें &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-500">
              <BookOpen className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-base font-bold text-slate-700">कोई कैलीग्राफी नहीं मिली</p>
              <p className="text-xs text-slate-500 mt-1">
                कृपया अन्य कीवर्ड खोजें या श्रेणी बदलें।
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <p className="text-xs text-slate-500">
            💡 किसी भी कैलीग्राफी कार्ड पर क्लिक करें — वह तुरंत आपके शादी कार्ड पर इंसर्ट हो जाएगी!
          </p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    </div>
  );
};
