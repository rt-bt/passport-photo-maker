import React from 'react';
import { Shield, Heart, Code } from 'lucide-react';
import { useI18n } from '../../i18n';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>
            <strong>{t('privacyBadge')}</strong> — All face processing, background removal, and compression occur locally inside your browser.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for open-source
          </span>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors"
          >
            <Code className="w-4 h-4" />
            MIT License
          </a>
        </div>
      </div>
    </footer>
  );
};
