import React from 'react';
import {
  Upload,
  Crop,
  Layers,
  Sparkles,
  Sliders,
  Printer,
  Download,
  Check,
} from 'lucide-react';
import { useI18n } from '../../i18n';

interface StepperProps {
  currentStep: number;
  onSelectStep: (step: number) => void;
  maxReachedStep: number;
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  onSelectStep,
  maxReachedStep,
}) => {
  const { t } = useI18n();

  const steps = [
    { id: 1, name: t('steps.upload'), icon: Upload },
    { id: 2, name: t('steps.preset'), icon: Layers },
    { id: 3, name: t('steps.crop'), icon: Crop },
    { id: 4, name: t('steps.background'), icon: Sparkles },
    { id: 5, name: t('steps.adjust'), icon: Sliders },
    { id: 6, name: t('steps.print'), icon: Printer },
    { id: 7, name: t('steps.download'), icon: Download },
  ];

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-3 px-4 sm:px-6 shadow-xs overflow-x-auto">
      <div className="max-w-5xl mx-auto flex items-center justify-between min-w-[620px]">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = currentStep === step.id;
          const isDone = currentStep > step.id;
          const isClickable = step.id <= maxReachedStep;

          return (
            <React.Fragment key={step.id}>
              {/* Step item */}
              <button
                disabled={!isClickable}
                onClick={() => isClickable && onSelectStep(step.id)}
                className={`flex items-center gap-2 group transition-all cursor-pointer ${
                  !isClickable ? 'opacity-40 cursor-not-allowed' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900/50 shadow-md'
                      : isDone
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <span
                    className={`block text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : isDone
                        ? 'text-slate-900 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              </button>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                    currentStep > step.id
                      ? 'bg-emerald-500'
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};
