import React from 'react';
import { Sparkles, Paintbrush, X, Check, Copy } from 'lucide-react';

interface PathSelectionOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  svgD: string;
  onFillSelection: (color: string) => void;
  onStrokeSelection: (color: string, width: number) => void;
  onClearSelection: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
}

export const PathSelectionOverlay: React.FC<PathSelectionOverlayProps> = ({
  canvasWidth,
  canvasHeight,
  zoom,
  svgD,
  onFillSelection,
  onStrokeSelection,
  onClearSelection,
  language,
  darkMode,
}) => {
  const isAr = language === 'ar';

  return (
    <div className="absolute inset-0 pointer-events-none z-35">
      {/* SVG Canvas for Marching Ants animated selection line */}
      <svg
        className="w-full h-full absolute inset-0 overflow-visible"
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      >
        <style>
          {`
            @keyframes marchingAnts {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: 16; }
            }
            .marching-ants-white {
              stroke: #FFFFFF;
              stroke-width: ${Math.max(1, 1.5 / zoom)}px;
              fill: rgba(108, 77, 255, 0.08);
            }
            .marching-ants-black {
              stroke: #121A33;
              stroke-width: ${Math.max(1, 1.5 / zoom)}px;
              stroke-dasharray: 4 4;
              animation: marchingAnts 0.8s linear infinite;
              fill: none;
            }
          `}
        </style>
        {/* Base white line */}
        <path d={svgD} className="marching-ants-white" />
        {/* Animated black dashed marching ants */}
        <path d={svgD} className="marching-ants-black" />
      </svg>

      {/* Floating Selection Action Badge */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-850/95 backdrop-blur-md border border-purple-200/80 dark:border-purple-800/60 shadow-xl shadow-purple-900/10 z-40 text-xs text-slate-800 dark:text-slate-100 animate-in fade-in slide-in-from-bottom-3"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-1.5 font-bold text-[#6C4DFF] dark:text-[#2DD4BF] pe-2 border-e border-slate-200 dark:border-slate-700">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>{isAr ? 'تحديد نشط' : 'Active Selection'}</span>
        </div>

        {/* Fill Selection */}
        <button
          onClick={() => onFillSelection('#6C4DFF')}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C4DFF] dark:text-[#2DD4BF] hover:bg-purple-100 dark:hover:bg-purple-900/60 font-semibold transition-colors"
          title={isAr ? 'تعبئة داخل التحديد باللون' : 'Fill inside selection'}
        >
          <Paintbrush className="w-3 h-3" />
          <span>{isAr ? 'تعبئة' : 'Fill'}</span>
        </button>

        {/* Stroke Selection */}
        <button
          onClick={() => onStrokeSelection('#23B5D3', 3)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-[#23B5D3] hover:bg-cyan-100 dark:hover:bg-cyan-900/60 font-semibold transition-colors"
          title={isAr ? 'رسم إطار حول التحديد' : 'Stroke selection border'}
        >
          <span>{isAr ? 'رسم الحواف' : 'Stroke'}</span>
        </button>

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          className="flex items-center gap-1 px-2 py-1 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isAr ? 'إلغاء التحديد (Ctrl+D)' : 'Deselect (Ctrl+D)'}
        >
          <X className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isAr ? 'إلغاء' : 'Deselect'}</span>
        </button>
      </div>
    </div>
  );
};
