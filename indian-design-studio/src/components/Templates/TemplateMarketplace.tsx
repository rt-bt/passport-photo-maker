'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Filter,
  Sparkles,
  Crown,
  Heart,
  Eye,
  Edit3,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_TEMPLATES } from '@/lib/templatesData';
import { DesignTemplate } from '@/types';
import { saveProject } from '@/lib/storage';

export default function TemplateMarketplace() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<DesignTemplate | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'wedding', label: 'Wedding Invitations' },
    { id: 'id-cards', label: 'ID Cards (CR80)' },
    { id: 'posters', label: 'Festival & Posters' },
    { id: 'business', label: 'Business & Stationery' },
  ];

  const languages = [
    { id: 'all', label: 'All Languages' },
    { id: 'Hindi', label: 'हिन्दी (Hindi)' },
    { id: 'English', label: 'English' },
    { id: 'Bilingual', label: 'Bilingual' },
  ];

  // Filter templates
  const filteredTemplates = SAMPLE_TEMPLATES.filter((tpl) => {
    const matchesSearch =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || tpl.category === selectedCategory;

    const matchesLanguage =
      selectedLanguage === 'all' || tpl.language === selectedLanguage;

    return matchesSearch && matchesCategory && matchesLanguage;
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleUseTemplate = (tpl: DesignTemplate) => {
    const newProject = saveProject({
      id: `proj_mkt_${Date.now()}`,
      title: tpl.title,
      category: tpl.category,
      width: tpl.width,
      height: tpl.height,
      thumbnail: tpl.thumbnail,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pages: [
        {
          id: 'page_1',
          name: 'Template Canvas',
          canvasData: tpl.canvasData,
        },
      ],
    });

    router.push(`/editor?id=${newProject.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold mb-2">
          <Layers className="w-3.5 h-3.5 text-amber-600" />
          500+ Indian Design Templates
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Searchable Template Marketplace
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Discover ready-to-use Indian wedding cards, festival sale posters, student ID passes, and business stationery. One-click open into the studio editor.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mb-8 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search templates (e.g. 'Royal Rajasthani Wedding', 'Diwali Dhamaka', 'Student ID Card', 'Gold Visiting Card')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === c.id
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500">Language:</span>
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLanguage(l.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedLanguage === l.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTemplates.map((tpl) => {
          const isFav = favorites.includes(tpl.id);
          return (
            <div
              key={tpl.id}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                  <img
                    src={tpl.thumbnail}
                    alt={tpl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {tpl.isPremium && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                      <Crown className="w-3 h-3" /> PRO
                    </span>
                  )}
                  <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                    {tpl.language}
                  </span>

                  <button
                    onClick={(e) => toggleFavorite(tpl.id, e)}
                    className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 text-slate-700 hover:text-rose-600 shadow-md transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600 text-rose-600' : ''}`} />
                  </button>
                </div>

                <div className="p-4">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                    {tpl.subcategory}
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {tpl.description}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => handleUseTemplate(tpl)}
                  className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all transform active:scale-98"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Use This Template
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-sm">
            No templates found matching your search. Try searching for "Wedding", "ID", or "Diwali".
          </p>
        </div>
      )}
    </div>
  );
}
