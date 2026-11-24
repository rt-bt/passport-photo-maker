'use client';

import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface VirtualHindiKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertChar: (char: string) => void;
}

const SWAR = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ऋ', 'ए', 'ऐ', 'ओ', 'औ', 'अं', 'अः'];
const MATRAS = ['ा', 'ि', 'ी', 'ु', 'ू', 'ृ', 'े', 'ै', 'ो', 'ौ', 'ं', 'ँ', 'ः', '्'];
const VYANJAN = [
  'क', 'ख', 'ग', 'घ', 'ङ',
  'च', 'छ', 'ज', 'झ', 'ञ',
  'ट', 'ठ', 'ड', 'ढ', 'ण',
  'त', 'थ', 'द', 'ध', 'न',
  'प', 'फ', 'ब', 'भ', 'म',
  'य', 'र', 'ल', 'व',
  'श', 'ष', 'स', 'ह',
  'क्ष', 'त्र', 'ज्ञ', 'श्र',
  '।', '॥', 'ॐ', '०', '१', '२', '३', '४', '५', '६', '७', '८', '९'
];

export const VirtualHindiKeyboard: React.FC<VirtualHindiKeyboardProps> = ({
  isOpen,
  onClose,
  onInsertChar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-slate-900/95 text-white p-4 rounded-2xl border border-amber-500/30 shadow-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-bold text-amber-300">
            हिन्दी कीबोर्ड (Click to Insert Devanagari Letters)
          </h4>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Swar */}
      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
          स्वर (Vowels):
        </span>
        <div className="flex flex-wrap gap-1">
          {SWAR.map((char) => (
            <button
              key={char}
              onClick={() => onInsertChar(char)}
              className="w-7 h-7 bg-slate-800 hover:bg-amber-600 text-amber-200 hover:text-white font-bold text-xs rounded transition flex items-center justify-center border border-slate-700"
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* Matras */}
      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
          मात्राएं (Matras):
        </span>
        <div className="flex flex-wrap gap-1">
          {MATRAS.map((char, idx) => (
            <button
              key={idx}
              onClick={() => onInsertChar(char)}
              className="w-7 h-7 bg-amber-950/80 hover:bg-amber-600 text-amber-300 hover:text-white font-bold text-xs rounded transition flex items-center justify-center border border-amber-700/50"
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* Vyanjan */}
      <div>
        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
          व्यंजन एवं अंक (Consonants & Symbols):
        </span>
        <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto pr-1">
          {VYANJAN.map((char) => (
            <button
              key={char}
              onClick={() => onInsertChar(char)}
              className="w-7 h-7 bg-slate-800 hover:bg-amber-600 text-slate-100 hover:text-white font-bold text-xs rounded transition flex items-center justify-center border border-slate-700"
            >
              {char}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
