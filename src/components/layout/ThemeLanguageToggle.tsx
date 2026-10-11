import React, { useState, useEffect } from 'react';
import { Sun, Moon, Globe } from 'lucide-react';
import { useI18n, Language } from '../../i18n';

export const ThemeLanguageToggle: React.FC = () => {
  const { lang, setLang } = useI18n();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ppm_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('ppm_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('ppm_theme', 'light');
    }
  }, [isDark]);

  return (
    <div className="flex items-center gap-2">
      {/* Language Switch */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
        <Globe className="w-3.5 h-3.5 text-slate-400 mx-1.5" />
        <button
          onClick={() => setLang('en')}
          className={`px-2 py-0.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            lang === 'en'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('hi')}
          className={`px-2 py-0.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
            lang === 'hi'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          हिन्दी
        </button>
      </div>

      {/* Dark / Light Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        aria-label="Toggle theme"
        className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
      >
        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
      </button>
    </div>
  );
};
