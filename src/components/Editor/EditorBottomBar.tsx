import React from 'react';
import { ZoomIn, ZoomOut, Maximize2, CheckCircle2, Layers } from 'lucide-react';
import { EditorState } from '../../types';

interface EditorBottomBarProps {
  state: EditorState;
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void;
  language: 'ar' | 'en';
}

export const EditorBottomBar: React.FC<EditorBottomBarProps> = ({
  state,
  onUpdateState,
  language,
}) => {
  const isAr = language === 'ar';
  const safeLayers = Array.isArray(state?.layers) ? state.layers : [];
  const selectedLayer = safeLayers.find((l) => l.id === state.selectedLayerId);

  const handleZoom = (factor: number) => {
    onUpdateState((prev) => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(5, Number((prev.zoom * factor).toFixed(2)))),
    }));
  };

  const handleResetZoom = () => {
    onUpdateState((prev) => ({
      ...prev,
      zoom: 1,
      pan: { x: 0, y: 0 },
    }));
  };

  const handleFitToScreen = () => {
    const container = document.getElementById('pixelora-canvas-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      const availW = Math.max(100, rect.width - 64);
      const availH = Math.max(100, rect.height - 64);
      const fitZoom = Math.min(availW / state.canvasWidth, availH / state.canvasHeight, 1.5);
      onUpdateState((prev) => ({
        ...prev,
        zoom: Math.max(0.1, Number(fitZoom.toFixed(2))),
        pan: { x: 0, y: 0 },
      }));
    } else {
      handleResetZoom();
    }
  };

  return (
    <footer
      id="editor-bottom-bar"
      className="h-10 bg-white dark:bg-slate-800 border-t border-slate-200/90 dark:border-slate-700 px-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none z-20 shadow-2xs"
    >
      {/* Left: Canvas Size & Selected layer stats */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 font-semibold text-slate-750 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
          <span>
            {state.canvasWidth} × {state.canvasHeight} px
          </span>
        </span>

        {selectedLayer && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>{isAr ? 'الطبقة:' : 'Layer:'}</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
              {selectedLayer.name}
            </span>
            <span className="font-mono text-slate-400">
              ({Math.round(selectedLayer.width)}×{Math.round(selectedLayer.height)} px)
            </span>
            {selectedLayer.type === 'image' && (
              <span className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] text-[10px] font-mono font-bold">
                Bitmap: {selectedLayer.bitmapWidth || Math.round(selectedLayer.width)}×{selectedLayer.bitmapHeight || Math.round(selectedLayer.height)}
              </span>
            )}
          </span>
        )}
      </div>

      {/* Center: Save status */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>{isAr ? 'تم الحفظ محليًا' : 'Saved Locally'}</span>
      </div>

      {/* Right: Zoom controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleZoom(0.85)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title={isAr ? 'تصغير الشاشة' : 'Zoom Out View'}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleResetZoom}
          className="px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-100/90 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200/80 dark:border-transparent transition-colors"
          title={isAr ? 'إعادة ضبط العرض 100%' : 'Reset Zoom (100%)'}
        >
          {Math.round(state.zoom * 100)}%
        </button>

        <button
          onClick={() => handleZoom(1.15)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title={isAr ? 'تكبير الشاشة' : 'Zoom In View'}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

        <button
          onClick={handleFitToScreen}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          title={isAr ? 'ملاءمة الشاشة وإعادة التمركز' : 'Fit Canvas to Screen'}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </footer>
  );
};
