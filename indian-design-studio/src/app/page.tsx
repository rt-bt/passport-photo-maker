'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  ArrowRight,
  Heart,
  CreditCard,
  FileText,
  Briefcase,
  Camera,
  Film,
  Layers,
  Crown,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Zap,
  Star,
  Users
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import PricingModal from '@/components/PricingModal';
import { SAMPLE_TEMPLATES } from '@/lib/templatesData';
import { saveProject } from '@/lib/storage';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const popularCategories = [
    { label: 'Wedding Cards', href: '/wedding', icon: Heart, count: '120+ Templates', color: 'from-rose-500 to-amber-600' },
    { label: 'ID Cards (CR80)', href: '/id-cards', icon: CreditCard, count: '60+ Templates', color: 'from-blue-600 to-indigo-700' },
    { label: 'Festival Posters', href: '/posters', icon: FileText, count: '90+ Templates', color: 'from-amber-500 to-orange-600' },
    { label: 'Visiting Cards', href: '/business', icon: Briefcase, count: '75+ Templates', color: 'from-slate-700 to-zinc-900' },
    { label: 'Passport Photo', href: '/photo-studio', icon: Camera, count: '35x45mm Studio', color: 'from-emerald-600 to-teal-700' },
    { label: 'Digital Invitations', href: '/motion-invitations', icon: Film, count: 'Motion Videos', color: 'from-purple-600 to-pink-600' },
  ];

  const handleUseTemplate = (tpl: any) => {
    const newProject = saveProject({
      id: `proj_${Date.now()}`,
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
          name: 'Front Page',
          canvasData: tpl.canvasData,
        },
      ],
    });
    router.push(`/editor?id=${newProject.id}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/templates?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/templates');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* 1. TOP NAVBAR */}
      <Navbar
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      <main className="flex-1">
        {/* 2. HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-amber-50/50 via-white to-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-semibold shadow-2xs mb-6">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>India’s Leading Design & Document SaaS Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-4xl mx-auto">
              Create Professional <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">Designs in Minutes</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-5 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Your All-in-One Indian Design Studio for Wedding Invitations, School & Corporate ID Cards, Festival Posters, Business Stationery, and AI Graphics.
            </p>

            {/* Large Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-lg rounded-2xl bg-white border border-slate-200 p-2">
                <Search className="w-5 h-5 text-slate-400 ml-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search 500+ templates: 'Royal Wedding', 'Diwali Poster', 'School ID Card'..."
                  className="w-full px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all shrink-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Hero Quick CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/editor"
                className="px-6 py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-98"
              >
                <span>Launch Canva Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/wedding"
                className="px-6 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                <span>Wedding Card Wizard</span>
              </Link>
            </div>

            {/* Design Previews Floating Cards Strip */}
            <div className="mt-14 max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              {SAMPLE_TEMPLATES.slice(0, 4).map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleUseTemplate(tpl)}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-500 transition-all cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-slate-100 overflow-hidden">
                    <img
                      src={tpl.thumbnail}
                      alt={tpl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                      {tpl.subcategory}
                    </span>
                    <h3 className="font-bold text-xs text-slate-800 truncate mt-0.5">
                      {tpl.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. POPULAR CATEGORIES */}
        <section className="py-16 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Popular Design Categories
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Specially tailored for Indian traditions, regional festivities, schools, and local businesses.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularCategories.map((cat, i) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={i}
                    href={cat.href}
                    className="group bg-slate-50 hover:bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-500 hover:shadow-lg transition-all text-center flex flex-col items-center justify-between"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                      {cat.label}
                    </h3>
                    <span className="text-[10px] text-slate-500 mt-1">{cat.count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. AI DESIGN GENERATOR BANNER */}
        <section className="py-16 bg-gradient-to-r from-slate-950 via-zinc-900 to-amber-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Live Gemini 1.5 Integration
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Design with AI in Hindi & English
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                  Type a prompt like <em>"Create a royal Rajasthani Hindu wedding invitation with maroon and gold foil and Ganesh shloka"</em>. Our intelligent assistant builds editable canvas objects instantly.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    href="/ai-studio"
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Try AI Design Studio
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  AI Capabilities
                </span>
                <ul className="text-xs text-slate-200 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Instant Hindi Wedding Shlokas & Invitation Copy</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Festival Advertisement Slogans & Offers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Natural Language Canvas Editing Commands</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Passport Photo Auto Face Framing & Background Change</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 5. COMMERCIAL PRINTING PRESS FEATURES */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-2">
                Built for Indian Print Shops & Creators
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                True 300 DPI Commercial Print Ready Output
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                We don't simply upscale low-resolution images. Our canvas vector engine produces razor-sharp PDF and SVG files with print bleed and crop marks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <Printer className="w-8 h-8 text-amber-600" />
                <h3 className="font-bold text-base text-slate-900">Batch ID Card Printing (A4 Sheets)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Import student records via CSV. Print 10 CR80 PVC identity cards per A4 sheet with cutting guides.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <Camera className="w-8 h-8 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">35x45mm Passport Photo Grid</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Produce 8, 16, or 32 passport photos with face alignment guides on 4x6" or A4 glossy paper in one click.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">Google Maps Venue QR Codes</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Guests scan the QR code printed on the card to open turn-by-turn navigation directly to your marriage hall.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. PRICING CTA SECTION */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
            <h2 className="text-3xl font-extrabold text-slate-900">
              Ready to Upgrade Your Design Studio?
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Start free today or unlock unlimited HD 300 DPI exports, AI design capabilities, and bulk printing with our affordable Indian plans.
            </p>
            <div className="pt-2 flex justify-center gap-4">
              <button
                onClick={() => setIsPricingOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs rounded-xl shadow-md hover:from-amber-700 hover:to-orange-700 transition-all flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-200" />
                View Plans & Pricing (Starting at ₹399/mo)
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />

      {/* MODALS */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  );
}
