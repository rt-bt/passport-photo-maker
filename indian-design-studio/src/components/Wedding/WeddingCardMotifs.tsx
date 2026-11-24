'use client';

import React from 'react';

interface MotifProps {
  type: string;
  color: string;
  className?: string;
}

export const WeddingCardMotif: React.FC<MotifProps> = ({ type, color, className = 'w-10 h-10' }) => {
  switch (type) {
    case 'ganesh':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Ornate Lord Ganesha Vector Silhouette */}
          <path
            d="M50 12 C42 12 36 18 36 26 C36 32 40 37 46 39 C46 45 42 50 37 54 C32 58 26 62 26 70 C26 80 37 86 50 86 C63 86 74 80 74 70 C74 62 68 58 63 54 C58 50 54 45 54 39 C60 37 64 32 64 26 C64 18 58 12 50 12 Z"
            fill={color}
            opacity="0.9"
          />
          <circle cx="50" cy="22" r="3" fill="#ffffff" />
          <path d="M47 30 Q50 38 53 30" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          {/* Trunk curve */}
          <path
            d="M49 39 Q44 55 52 64 Q56 68 60 63"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tika / Trishul */}
          <path d="M50 14 L50 25 M45 18 L55 18" stroke="#ffffff" strokeWidth="2" />
        </svg>
      );

    case 'kalash':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Coconut on Top */}
          <ellipse cx="50" cy="25" rx="14" ry="16" fill={color} />
          {/* Mango Leaves */}
          <path d="M36 34 C30 22 42 16 48 24 Z" fill={color} opacity="0.8" />
          <path d="M64 34 C70 22 58 16 52 24 Z" fill={color} opacity="0.8" />
          <path d="M30 40 C20 34 32 25 40 35 Z" fill={color} opacity="0.7" />
          <path d="M70 40 C80 34 68 25 60 35 Z" fill={color} opacity="0.7" />
          {/* Pot Rim */}
          <rect x="36" y="38" width="28" height="6" rx="2" fill={color} />
          {/* Pot Body */}
          <path
            d="M36 44 C24 50 24 74 40 82 C44 84 56 84 60 82 C76 74 76 50 64 44 Z"
            fill={color}
          />
          {/* Swastik on Pot */}
          <path
            d="M46 54 L54 54 M50 50 L50 66 M54 54 L54 50 M46 54 L46 58 M50 50 L46 50 M50 66 L54 66"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );

    case 'bismillah':
      return (
        <div className="flex flex-col items-center">
          <div
            className="text-lg sm:text-2xl font-bold tracking-widest px-4 py-1 rounded-full border border-current opacity-90 font-serif"
            style={{ color }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        </div>
      );

    case 'khanda':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Central Double-edged Sword */}
          <path d="M50 10 L53 18 L53 72 L50 78 L47 72 L47 18 Z" fill={color} />
          {/* Chakar (Circle) */}
          <circle cx="50" cy="46" r="22" stroke={color} strokeWidth="6" fill="none" />
          {/* Left Kirpan */}
          <path
            d="M26 30 C18 46 22 66 40 76 C42 77 40 73 37 70 C24 60 22 44 30 32 Z"
            fill={color}
          />
          {/* Right Kirpan */}
          <path
            d="M74 30 C82 46 78 66 60 76 C58 77 60 73 63 70 C76 60 78 44 70 32 Z"
            fill={color}
          />
        </svg>
      );

    case 'peacock':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Peacock Feather Eye */}
          <path
            d="M50 14 C34 14 26 32 26 50 C26 68 38 84 50 88 C62 84 74 68 74 50 C74 32 66 14 50 14 Z"
            fill={color}
            opacity="0.85"
          />
          <ellipse cx="50" cy="48" rx="16" ry="22" fill="#083344" />
          <ellipse cx="50" cy="48" rx="10" ry="14" fill="#38bdf8" />
          <circle cx="50" cy="48" r="6" fill={color} />
          {/* Stem */}
          <path d="M50 88 L50 96" stroke={color} strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'shehnai':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Shehnai 1 */}
          <path d="M25 80 L70 25 L75 22 L78 28 L72 33 L28 85 Z" fill={color} />
          <circle cx="78" cy="22" r="5" fill={color} />
          <path d="M22 88 L32 78" stroke={color} strokeWidth="4" />
          {/* Shehnai 2 */}
          <path d="M75 80 L30 25 L25 22 L22 28 L28 33 L72 85 Z" fill={color} opacity="0.8" />
          <circle cx="22" cy="22" r="5" fill={color} />
          <path d="M78 88 L68 78" stroke={color} strokeWidth="4" />
        </svg>
      );

    case 'doli':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Pole */}
          <path d="M10 46 L90 46" stroke={color} strokeWidth="4" strokeLinecap="round" />
          {/* Dome */}
          <path d="M30 46 C30 30 70 30 70 46 Z" fill={color} />
          {/* Body */}
          <rect x="30" y="46" width="40" height="30" rx="3" fill={color} opacity="0.9" />
          {/* Window Curtain */}
          <rect x="40" y="52" width="20" height="18" rx="2" fill="#ffffff" opacity="0.8" />
          {/* Tassels */}
          <circle cx="34" cy="79" r="3" fill={color} />
          <circle cx="50" cy="79" r="3" fill={color} />
          <circle cx="66" cy="79" r="3" fill={color} />
        </svg>
      );

    case 'lotus':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Central Petal */}
          <path d="M50 20 C42 36 42 56 50 72 C58 56 58 36 50 20 Z" fill={color} />
          {/* Left Petals */}
          <path d="M50 36 C36 42 28 58 34 72 C42 66 48 54 50 36 Z" fill={color} opacity="0.85" />
          <path d="M46 50 C26 56 20 70 28 80 C38 78 44 68 46 50 Z" fill={color} opacity="0.7" />
          {/* Right Petals */}
          <path d="M50 36 C64 42 72 58 66 72 C58 66 52 54 50 36 Z" fill={color} opacity="0.85" />
          <path d="M54 50 C74 56 80 70 72 80 C62 78 56 68 54 50 Z" fill={color} opacity="0.7" />
          {/* Base Pad */}
          <ellipse cx="50" cy="76" rx="26" ry="6" fill={color} opacity="0.9" />
        </svg>
      );

    case 'temple':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Temple Shikhara/Gopuram Tier */}
          <path d="M50 15 L52 24 L48 24 Z" fill={color} />
          <path d="M44 24 L56 24 L54 36 L46 36 Z" fill={color} />
          <path d="M38 36 L62 36 L59 52 L41 52 Z" fill={color} opacity="0.9" />
          <path d="M32 52 L68 52 L65 70 L35 70 Z" fill={color} opacity="0.85" />
          {/* Sanctum Pillars */}
          <rect x="30" y="70" width="40" height="16" fill={color} />
          <rect x="44" y="74" width="12" height="12" rx="2" fill="#ffffff" opacity="0.8" />
        </svg>
      );

    case 'banana-leaf':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <path
            d="M50 15 C30 25 24 55 28 85 C34 75 42 70 50 85 C58 70 66 75 72 85 C76 55 70 25 50 15 Z"
            fill={color}
          />
          {/* Midrib line */}
          <path d="M50 15 L50 88" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'rings':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Interlocking Wedding Bands */}
          <circle cx="42" cy="50" r="18" stroke={color} strokeWidth="5" fill="none" />
          <circle cx="58" cy="50" r="18" stroke={color} strokeWidth="5" fill="none" />
          {/* Diamond on top */}
          <path d="M42 26 L46 32 L38 32 Z" fill="#ffffff" />
          <circle cx="42" cy="27" r="3" fill="#ffffff" />
        </svg>
      );

    case 'lantern':
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          {/* Top Hanging Ring */}
          <circle cx="50" cy="18" r="6" stroke={color} strokeWidth="3" fill="none" />
          {/* Dome Cap */}
          <path d="M38 32 C38 24 62 24 62 32 Z" fill={color} />
          {/* Glass Cage */}
          <path d="M38 32 L34 66 L66 66 L62 32 Z" stroke={color} strokeWidth="3" fill="none" />
          {/* Glowing Candle Flame */}
          <ellipse cx="50" cy="52" rx="4" ry="8" fill="#fde047" />
          {/* Bottom Stand */}
          <path d="M34 66 L50 80 L66 66 Z" fill={color} />
        </svg>
      );

    case 'om':
    default:
      return (
        <svg viewBox="0 0 100 100" fill="none" className={className}>
          <text
            x="50"
            y="65"
            textAnchor="middle"
            fontSize="54"
            fontWeight="bold"
            fill={color}
            fontFamily="Rozha One, serif"
          >
            ॐ
          </text>
        </svg>
      );
  }
};
