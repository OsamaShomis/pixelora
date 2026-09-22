import React, { useState, useRef } from 'react';
import { Layer, LayerFilters } from '../../../types';
import { X, Columns, Eye, SplitSquareVertical } from 'lucide-react';
import { ProcessedImageLayer } from '../ProcessedImageLayer';
import { DEFAULT_FILTERS } from '../../../data/sampleProjects';

interface BeforeAfterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLayer?: Layer;
  language: 'ar' | 'en';
}

export const BeforeAfterModal: React.FC<BeforeAfterModalProps> = ({
  isOpen = true,
  onClose,
  selectedLayer,
  language,
}) => {
  const isAr = language === 'ar';
  const [splitPos, setSplitPos] = useState(50); // 0..100%
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'sideBySide'>('split');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSplitFromMouse(e);
  };

  const updateSplitFromMouse = (e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateSplitFromMouse(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging && isOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isOpen]);

  if (!isOpen || !selectedLayer || !selectedLayer.source) return null;

  const displayLayer: Layer = isHoldingOriginal
    ? { ...selectedLayer, filters: { ...DEFAULT_FILTERS } }
    : selectedLayer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#6C4DFF]/20 flex items-center justify-center text-[#2DD4BF]">
              <Columns className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                {isAr ? 'مقارنة قبل وبعد (Before & After)' : 'Before & After Comparison'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {selectedLayer.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'split'
                    ? 'bg-[#6C4DFF] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>{isAr ? 'انقسام متحرك' : 'Split Slider'}</span>
              </button>
              <button
                onClick={() => setViewMode('sideBySide')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'sideBySide'
                    ? 'bg-[#6C4DFF] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{isAr ? 'جنباً إلى جنب' : 'Side by Side'}</span>
              </button>
            </div>

            {/* Hold to compare button */}
            <button
              onMouseDown={() => setIsHoldingOriginal(true)}
              onMouseUp={() => setIsHoldingOriginal(false)}
              onMouseLeave={() => setIsHoldingOriginal(false)}
              onTouchStart={() => setIsHoldingOriginal(true)}
              onTouchEnd={() => setIsHoldingOriginal(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all select-none ${
                isHoldingOriginal
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isAr ? 'اضغط مطولاً لرؤية الأصلي' : 'Hold to View Original'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div className="flex-1 p-6 flex items-center justify-center bg-slate-950 overflow-hidden select-none">
          {viewMode === 'split' ? (
            <div
              ref={containerRef}
              onMouseDown={handleContainerMouseDown}
              className="relative max-w-2xl max-h-[60vh] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-800 cursor-ew-resize select-none"
            >
              {/* Original Base Image (Left) */}
              <img
                src={selectedLayer.source}
                alt="Before"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-slate-300 border border-slate-700">
                {isAr ? 'قبل (Original)' : 'Before'}
              </div>

              {/* Edited Overlay Image with clipPath (Right) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{
                  clipPath: `inset(0 0 0 ${splitPos}%)`,
                }}
              >
                <ProcessedImageLayer
                  layer={displayLayer}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-[#6C4DFF]/90 backdrop-blur-md text-[10px] font-bold text-white shadow-md">
                  {isAr ? 'بعد (Edited)' : 'After'}
                </div>
              </div>

              {/* Split Line & Handle */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none -translate-x-1/2"
                style={{ left: `${splitPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg border-2 border-slate-900 text-[10px] font-bold">
                  ↔
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 w-full max-w-3xl max-h-[60vh]">
              {/* Before */}
              <div className="relative bg-slate-900 rounded-2xl p-2 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
                <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-slate-950/80 text-[10px] font-bold text-slate-300 border border-slate-700">
                  {isAr ? 'قبل (الأصلي)' : 'Before'}
                </span>
                <img
                  src={selectedLayer.source}
                  alt="Before"
                  className="max-h-[50vh] w-auto object-contain rounded-xl"
                />
              </div>

              {/* After */}
              <div className="relative bg-slate-900 rounded-2xl p-2 border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
                <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-[#6C4DFF] text-[10px] font-bold text-white shadow-md">
                  {isAr ? 'بعد (المُعالج)' : 'After'}
                </span>
                <div className="max-h-[50vh] w-full flex items-center justify-center">
                  <ProcessedImageLayer
                    layer={displayLayer}
                    className="max-h-[50vh] w-auto object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs text-slate-400">
          <span>{isAr ? 'اسحب الشريط لمقارنة الفروق الدقيقة' : 'Drag divider to inspect details'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            {isAr ? 'إغلاق المعاينة' : 'Close Preview'}
          </button>
        </div>
      </div>
    </div>
  );
};
