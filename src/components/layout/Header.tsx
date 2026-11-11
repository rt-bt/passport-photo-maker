import React, { useState, useEffect } from 'react';
import { Camera, ShieldCheck, Sparkles, Cpu, Zap, Layers } from 'lucide-react';
import { useI18n } from '../../i18n';
import { ThemeLanguageToggle } from './ThemeLanguageToggle';
import { checkGpuServerHealth } from '../../lib/gpuRestoration';
import { GpuServerStatus, AppMode } from '../../types';

interface HeaderProps {
  onOpenBatch?: () => void;
  onOpenGpuModal?: () => void;
  activeMode?: AppMode;
  onChangeMode?: (mode: AppMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBatch,
  onOpenGpuModal,
  activeMode = 'passport',
  onChangeMode,
}) => {
  const { t } = useI18n();
  const [gpuStatus, setGpuStatus] = useState<GpuServerStatus | null>(null);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      const status = await checkGpuServerHealth();
      if (active) setGpuStatus(status);
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                {t('appTitle')}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                100% Client-Side
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
              {t('appSubtitle')}
            </p>
          </div>
        </div>

        {/* Feature Mode Switcher Tabs */}
        {onChangeMode && (
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 shadow-inner">
            <button
              onClick={() => onChangeMode('passport')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'passport'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Passport Maker</span>
              <span className="sm:hidden">Passport</span>
            </button>
            <button
              onClick={() => onChangeMode('restoration')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeMode === 'restoration'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
              <span className="hidden sm:inline">AI Restoration Studio (2K–16K)</span>
              <span className="sm:hidden">AI Studio</span>
            </button>
          </div>
        )}

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenGpuModal && (
            <button
              onClick={onOpenGpuModal}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                gpuStatus?.online
                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
              }`}
              title={
                gpuStatus?.online
                  ? `${gpuStatus.gpuName || 'GPU'} AI Restoration Active (Click to open)`
                  : 'Local GPU AI Engine (Click to view setup)'
              }
            >
              {gpuStatus?.online ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-500" />
                  <span className="hidden sm:inline font-semibold">
                    {gpuStatus.gpuName
                      ? gpuStatus.gpuName.replace('NVIDIA GeForce ', '').replace(' Laptop GPU', '').replace(' Desktop GPU', '')
                      : 'GPU'}{' '}
                    Ready
                  </span>
                  <span className="sm:hidden font-semibold">GPU</span>
                </>
              ) : (
                <>
                  <Cpu className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">AI GPU</span>
                </>
              )}
            </button>
          )}

          {onOpenBatch && activeMode === 'passport' && (
            <button
              onClick={onOpenBatch}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors cursor-pointer"
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
