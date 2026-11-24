import React, { useState, useEffect } from 'react';
import {
  Palette,
  ExternalLink,
  Sparkles,
  Heart,
  CreditCard,
  FileText,
  Briefcase,
  Camera,
  Film,
  Layers,
  ArrowRight,
  Maximize2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';

interface IndianDesignStudioHubProps {
  currentPhotoUrl?: string | null;
  onBackToPassport?: () => void;
}

export const IndianDesignStudioHub: React.FC<IndianDesignStudioHubProps> = ({
  currentPhotoUrl,
  onBackToPassport,
}) => {
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [activeFrameUrl, setActiveFrameUrl] = useState<string>('http://localhost:3000');
  const [viewMode, setViewMode] = useState<'grid' | 'embedded'>('embedded');

  const modules = [
    {
      id: 'editor',
      title: 'Canva Drag-and-Drop Studio',
      path: '/editor',
      desc: 'Browser-based graphic design editor with Hindi fonts, Indian mandalas, layers & 300 DPI exports.',
      icon: Palette,
      color: 'from-amber-600 to-orange-600',
      tag: 'Canva Core',
    },
    {
      id: 'wedding',
      title: 'Indian Wedding Card Designer',
      path: '/wedding',
      desc: 'Hindu, Muslim, Sikh & Rajasthani royal cards with live Google Maps venue QR code & WhatsApp share.',
      icon: Heart,
      color: 'from-rose-600 to-amber-600',
      tag: 'Multi-Faith',
    },
    {
      id: 'id-cards',
      title: 'CR80 ID Card Maker (Batch A4)',
      path: '/id-cards',
      desc: 'School & Corporate PVC IDs with barcodes, QR verification, CSV batch import, and 10-per-sheet A4 PDF.',
      icon: CreditCard,
      color: 'from-blue-600 to-indigo-700',
      tag: 'PVC Printing',
    },
    {
      id: 'posters',
      title: 'Festival & Political Posters',
      path: '/posters',
      desc: 'Diwali Dhamaka, Coaching Institute admissions, political campaign greetings in Hindi & English.',
      icon: FileText,
      color: 'from-orange-500 to-amber-600',
      tag: 'Flex & Banners',
    },
    {
      id: 'business',
      title: 'Visiting Cards & GST Invoices',
      path: '/business',
      desc: 'Executive Gold & Matte Black business cards, Certificates of Excellence, and GST Tax Invoices.',
      icon: Briefcase,
      color: 'from-slate-700 to-zinc-900',
      tag: 'Commercial',
    },
    {
      id: 'photo-studio',
      title: 'Passport Photo 35x45mm Studio',
      path: '/photo-studio',
      desc: 'Indian passport & visa photo sizing, studio background color replacement, and 8/16/32 photo A4 prints.',
      icon: Camera,
      color: 'from-emerald-600 to-teal-700',
      tag: 'Multi-Print',
    },
    {
      id: 'ai-studio',
      title: 'Gemini AI Design & Copywriter',
      path: '/ai-studio',
      desc: 'Prompt-to-canvas generation, emotional Hindi wedding invitation wording, and advertising slogans.',
      icon: Sparkles,
      color: 'from-purple-600 to-indigo-600',
      tag: 'AI Powered',
    },
    {
      id: 'motion',
      title: 'Digital Animated Video Invitations',
      path: '/motion-invitations',
      desc: 'Animated multi-slide invitation videos with royal Shehnai & Sitar music for WhatsApp stories.',
      icon: Film,
      color: 'from-rose-600 to-purple-600',
      tag: 'Motion Video',
    },
  ];

  const checkServer = async () => {
    setIsChecking(true);
    try {
      const res = await fetch('http://localhost:3000', { mode: 'no-cors' });
      setServerOnline(true);
    } catch (e) {
      setServerOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkServer();
  }, []);

  const handleLaunchModule = (path: string) => {
    const url = `http://localhost:3000${path}`;
    setActiveFrameUrl(url);
    setViewMode('embedded');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs mb-2">
            <Palette className="w-3.5 h-3.5" />
            Dedicated Design Suite
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Indian Design Studio – SaaS Platform
          </h2>
          <p className="text-amber-100 text-xs sm:text-sm mt-1 max-w-xl">
            Integrated inside Passport Photo Maker. Design Indian wedding cards, school IDs, festival posters, visiting cards, and motion video invitations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* External Window Link */}
          <a
            href={activeFrameUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <span>Open in Full Tab</span>
            <ExternalLink className="w-4 h-4 text-amber-600" />
          </a>

          {/* View Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'embedded' ? 'grid' : 'embedded')}
            className="px-4 py-2.5 bg-black/25 hover:bg-black/35 text-white border border-white/20 text-xs font-bold rounded-xl backdrop-blur-xs transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>{viewMode === 'embedded' ? 'Show Module Cards' : 'Show Live Studio'}</span>
          </button>
        </div>
      </div>

      {/* Server Notice & Quick Launch Status */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                serverOnline === true
                  ? 'bg-emerald-500 animate-pulse'
                  : serverOnline === false
                  ? 'bg-amber-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-slate-800 dark:text-slate-200">
              Studio Server (http://localhost:3000):
            </span>
          </div>

          <span
            className={`font-semibold ${
              serverOnline === true
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {serverOnline === true
              ? 'Online & Connected'
              : 'Standby / Ready (Run start_indian_design_studio.bat)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={checkServer}
            disabled={isChecking}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
            Check Status
          </button>
        </div>
      </div>

      {/* MODULE TILES GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                onClick={() => handleLaunchModule(m.path)}
                className="group p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${m.color} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      {m.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                  <span>Open Studio</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EMBEDDED LIVE WORKSPACE (IFRAME VIEW) */}
      {viewMode === 'embedded' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden flex flex-col h-[800px]">
          {/* Sub-bar with quick studio tabs */}
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1">
              {[
                { label: 'Canva Editor', path: '/editor' },
                { label: 'Wedding Cards', path: '/wedding' },
                { label: 'ID Cards Maker', path: '/id-cards' },
                { label: 'Festival Posters', path: '/posters' },
                { label: 'Business Studio', path: '/business' },
                { label: 'Passport Studio', path: '/photo-studio' },
                { label: 'AI Design', path: '/ai-studio' },
                { label: 'Motion Video', path: '/motion-invitations' },
              ].map((link) => {
                const isSelected = activeFrameUrl === `http://localhost:3000${link.path}`;
                return (
                  <button
                    key={link.path}
                    onClick={() => setActiveFrameUrl(`http://localhost:3000${link.path}`)}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      isSelected
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={activeFrameUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 flex items-center gap-1"
                title="Open in new browser window"
              >
                <span>Full Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Live Studio Frame */}
          <div className="flex-1 w-full bg-slate-50 relative">
            <iframe
              src={activeFrameUrl}
              title="Indian Design Studio Live Workspace"
              className="w-full h-full border-0"
              allow="camera; microphone; clipboard-write; clipboard-read"
            />
          </div>
        </div>
      )}
    </div>
  );
};
