'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Sparkles,
  Printer,
  Edit3,
  Calendar,
  Tag,
  Megaphone,
  Check
} from 'lucide-react';
import { SAMPLE_TEMPLATES } from '@/lib/templatesData';
import { saveProject } from '@/lib/storage';

export default function PosterMaker() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeDimension, setActiveDimension] = useState<'a4' | 'flex' | 'square' | 'story'>('a4');

  const categories = [
    { id: 'all', label: 'All Posters' },
    { id: 'festival', label: 'Festivals (त्यौहार)' },
    { id: 'business', label: 'Business & Sale (ऑफर)' },
    { id: 'coaching', label: 'Coaching & School (प्रवेश)' },
    { id: 'political', label: 'Political & Social (शुभकामनाएं)' },
  ];

  // Poster items
  const posterTemplates = [
    {
      id: 'tpl-poster-diwali-sale',
      title: 'Grand Diwali Festival Dhamaka Sale',
      category: 'festival',
      language: 'Hindi',
      description: 'Festive Diwali banner with 50% discount badge and Diya decorations.',
      thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=600&q=80',
      badge: 'Bestseller',
    },
    {
      id: 'tpl-poster-coaching-admission',
      title: 'IIT-JEE & NEET Coaching Admission Open',
      category: 'coaching',
      language: 'English',
      description: 'High conversion educational admission poster with scholarship test banner.',
      thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
      badge: 'Popular',
    },
    {
      id: 'tpl-poster-political-greetings',
      title: 'Political & Youth Leader Birthday Greetings',
      category: 'political',
      language: 'Hindi',
      description: 'Dynamic Indian election & birthday greetings flex banner with leader portrait box.',
      thumbnail: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=600&q=80',
      badge: 'Flex Banner',
    },
    {
      id: 'tpl-poster-restaurant-dhamaka',
      title: 'Restaurant Grand Opening & 20% Off',
      category: 'business',
      language: 'Bilingual',
      description: 'Mouth-watering food banner with spicy Indian curry highlights.',
      thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80',
      badge: 'Hot Deal',
    },
  ];

  const filteredPosters = selectedCategory === 'all'
    ? posterTemplates
    : posterTemplates.filter((p) => p.category === selectedCategory);

  const handleOpenPosterInEditor = (posterId: string) => {
    const template = SAMPLE_TEMPLATES.find((t) => t.id === posterId) || SAMPLE_TEMPLATES[2];
    const newProject = saveProject({
      id: `proj_poster_${Date.now()}`,
      title: template.title,
      category: 'posters',
      width: template.width,
      height: template.height,
      thumbnail: template.thumbnail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [
        {
          id: 'page_1',
          name: 'Poster Canvas',
          canvasData: template.canvasData,
        },
      ],
    });

    router.push(`/editor?id=${newProject.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-semibold mb-2">
          <Megaphone className="w-3.5 h-3.5" />
          Indian Poster & Flex Banner Maker
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Design High-Impact Posters & Banners
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Create festival celebrations, coaching admissions, political campaign greetings, and business sales in Hindi and English.
        </p>
      </div>

      {/* Hindi Slogans Quick Bar */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold text-amber-900">
            Popular Hindi Slogans Ready to Insert:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {[
            'महासेल धमाका (50% छूट)',
            'हार्दिक बधाई एवं शुभकामनाएं',
            'प्रवेश प्रारंभ (Admission Open)',
            'शुभ दीपावली महापर्व',
            'सधन्यवाद आपका स्वागत है',
          ].map((slogan, i) => (
            <span
              key={i}
              className="text-xs bg-white text-amber-900 font-medium px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs"
            >
              {slogan}
            </span>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              selectedCategory === c.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Poster Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredPosters.map((poster) => (
          <div
            key={poster.id}
            className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                <img
                  src={poster.thumbnail}
                  alt={poster.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                  {poster.badge}
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500 text-white">
                  {poster.language}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                  {poster.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {poster.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <button
                onClick={() => handleOpenPosterInEditor(poster.id)}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all transform active:scale-98"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Customize Poster
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
