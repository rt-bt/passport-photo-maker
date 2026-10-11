import React from 'react';
import { Camera, ShieldCheck, Sparkles } from 'lucide-react';
import { useI18n } from '../../i18n';
import { ThemeLanguageToggle } from './ThemeLanguageToggle';

interface HeaderProps {
  onOpenBatch?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBatch }) => {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {t('appTitle')}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                100% Client-Side
              </span>
            </div>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {onOpenBatch && (
            <button
              onClick={onOpenBatch}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t('extra.batch')}
            </button>
          )}
          <ThemeLanguageToggle />
        </div>
      </div>
    </header>
  );
};
