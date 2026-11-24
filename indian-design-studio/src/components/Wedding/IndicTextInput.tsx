'use client';

import React, { useState } from 'react';
import { transliterateText } from '@/lib/transliterate';
import { Languages, Sparkles } from 'lucide-react';

interface IndicTextInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  hindiTypingEnabled: boolean;
  required?: boolean;
  multiline?: boolean;
}

export const IndicTextInput: React.FC<IndicTextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  hindiTypingEnabled,
  required = false,
  multiline = false,
}) => {
  const [isTranslating, setIsTranslating] = useState(false);

  // When user hits spacebar or finishes a word, transliterate if hindi typing is enabled
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!hindiTypingEnabled) return;

    if (e.key === ' ' || e.key === 'Enter') {
      const target = e.currentTarget;
      const currentVal = target.value;
      const cursor = target.selectionStart || currentVal.length;

      // Find the word before cursor
      const beforeCursor = currentVal.slice(0, cursor);
      const afterCursor = currentVal.slice(cursor);
      const match = beforeCursor.match(/([a-zA-Z]+)$/);

      if (match) {
        const englishWord = match[1];
        e.preventDefault();
        try {
          const hindiWord = await transliterateText(englishWord, 'hi');
          const newBefore = beforeCursor.slice(0, beforeCursor.length - englishWord.length) + hindiWord + ' ';
          onChange(newBefore + afterCursor);
        } catch {
          onChange(currentVal + ' ');
        }
      }
    }
  };

  const handleManualConvert = async () => {
    if (!value) return;
    setIsTranslating(true);
    try {
      const converted = await transliterateText(value, 'hi');
      onChange(converted);
    } catch {
      // fallback
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hindiTypingEnabled && (
          <button
            type="button"
            onClick={handleManualConvert}
            disabled={isTranslating}
            className="text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
            title="Convert full field to Hindi Devanagari"
          >
            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
            {isTranslating ? 'Converting...' : 'Convert to हिन्दी'}
          </button>
        )}
      </div>

      <div className="relative">
        {multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={2}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium text-slate-900"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white font-medium text-slate-900"
          />
        )}
        {hindiTypingEnabled && (
          <span className="absolute right-2.5 bottom-2.5 text-[9px] font-bold text-amber-800 bg-amber-100/90 px-1.5 py-0.5 rounded pointer-events-none">
            हिन्दी
          </span>
        )}
      </div>
    </div>
  );
};
