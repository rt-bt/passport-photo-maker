import React from 'react';
import { PassportPreset } from '../../types';

interface FaceGuideOverlayProps {
  preset: PassportPreset;
  aspectRatio: number;
}

export const FaceGuideOverlay: React.FC<FaceGuideOverlayProps> = ({ preset }) => {
  // Head height standard: typically 70% to 80% (or min to max from preset)
  const minPercent = preset.headHeightMinPercent;
  const maxPercent = preset.headHeightMaxPercent;

  // Bottom of chin is roughly at 15-20% from bottom
  const chinBottomPercent = 18;
  const headTopPercent = chinBottomPercent + (minPercent + maxPercent) / 2;
  const eyesLevelPercent = chinBottomPercent + ((minPercent + maxPercent) / 2) * 0.6;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between overflow-hidden">
      {/* Outer framing border */}
      <div className="w-full h-full relative border-2 border-dashed border-blue-400/70">
        {/* Center vertical guideline */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2 bg-blue-400/40 border-r border-dashed border-blue-400/60" />

        {/* Head Top (Crown) line */}
        <div
          className="absolute left-0 right-0 border-b border-amber-400/80 shadow-xs flex items-center justify-between px-2"
          style={{ top: `${100 - headTopPercent}%` }}
        >
          <span className="text-[10px] font-semibold tracking-wider text-amber-500 bg-black/60 px-1 py-0.5 rounded shadow">
            HEAD CROWN (MAX)
          </span>
          <span className="text-[9px] font-mono text-amber-400 bg-black/60 px-1 py-0.5 rounded">
            {maxPercent}%
          </span>
        </div>

        {/* Eyes Level guideline */}
        <div
          className="absolute left-0 right-0 border-b border-cyan-400/80 shadow-xs flex items-center justify-between px-2"
          style={{ top: `${100 - eyesLevelPercent}%` }}
        >
          <span className="text-[10px] font-semibold tracking-wider text-cyan-400 bg-black/60 px-1 py-0.5 rounded shadow">
            EYES LINE
          </span>
          <div className="w-16 h-4 border-x border-cyan-400/60 mx-auto" />
        </div>

        {/* Chin line */}
        <div
          className="absolute left-0 right-0 border-b border-emerald-400/80 shadow-xs flex items-center justify-between px-2"
          style={{ bottom: `${chinBottomPercent}%` }}
        >
          <span className="text-[10px] font-semibold tracking-wider text-emerald-400 bg-black/60 px-1 py-0.5 rounded shadow">
            CHIN BASE
          </span>
          <span className="text-[9px] font-mono text-emerald-400 bg-black/60 px-1 py-0.5 rounded">
            {minPercent}%
          </span>
        </div>

        {/* Subtle Oval Head Contour in Center */}
        <div
          className="absolute left-1/2 -translate-x-1/2 border-2 border-blue-400/30 rounded-[50%/60%] pointer-events-none"
          style={{
            top: `${100 - headTopPercent}%`,
            bottom: `${chinBottomPercent}%`,
            width: '56%',
          }}
        />
      </div>
    </div>
  );
};
