import React, { useState } from 'react';
import {
  PenTool,
  Sparkles,
  Paintbrush,
  Scissors,
  Check,
  RotateCcw,
  Trash2,
  Plus,
  Circle,
  Square,
  Sliders,
  Maximize2,
  Eye,
  Minus,
  RefreshCw,
  Crosshair,
  Shield,
} from 'lucide-react';
import { Layer, PathConfig, PathPoint } from '../../types';
import { UnifiedColorPicker } from '../common/UnifiedColorPicker';
import {
  calculateTangentHandles,
  reversePathPoints,
  centerPathPoints,
} from '../../utils/vectorPath';

interface PenInspectorProps {
  activePathLayer: Layer | null;
  onUpdatePathConfig: (config: PathConfig) => void;
  onConvertToSelection: () => void;
  onConvertToMask?: () => void;
  onNewPath: () => void;
  onDeleteLayer?: (layerId: string) => void;
  selectedPointId: string | null;
  setSelectedPointId: (id: string | null) => void;
  language: 'ar' | 'en';
  darkMode: boolean;
  isEyedropperActive?: boolean;
  onToggleEyedropper?: (target?: 'pen-stroke' | 'pen-fill') => void;
  eyedropperTarget?: string | null;
  recentColors?: string[];
  canvasWidth?: number;
  canvasHeight?: number;
}

export const PenInspector: React.FC<PenInspectorProps> = ({
  activePathLayer,
  onUpdatePathConfig,
  onConvertToSelection,
  onConvertToMask,
  onNewPath,
  onDeleteLayer,
  selectedPointId,
  setSelectedPointId,
  language,
  darkMode,
  isEyedropperActive = false,
  onToggleEyedropper,
  eyedropperTarget = null,
  recentColors = [],
  canvasWidth = 1080,
  canvasHeight = 1080,
}) => {
  const isAr = language === 'ar';
  const config = activePathLayer?.pathConfig;

  const [activeColorTab, setActiveColorTab] = useState<'stroke' | 'fill'>('stroke');

  if (!activePathLayer || !config) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-[#6C4DFF] dark:text-[#2DD4BF] flex items-center justify-center mb-3">
          <PenTool className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
          {isAr ? 'أداة القلم والمتجهات' : 'Pen Tool & Vectors'}
        </h3>
        <p className="text-xs max-w-xs leading-relaxed">
          {isAr
            ? 'انقر على لوحة العمل لبدء رسم مسار جديد. اسحب بعد النقر لإنشاء منحنيات بيزييه ناعمة.'
            : 'Click on the canvas to start a new vector path. Drag after clicking to create smooth Bézier curves.'}
        </p>
      </div>
    );
  }

  const points = config.points || [];
  const selectedIndex = points.findIndex((p) => p.id === selectedPointId);
  const selectedPoint = selectedIndex !== -1 ? points[selectedIndex] : null;

  // Toggle open/closed path
  const handleToggleClosed = () => {
    onUpdatePathConfig({
      ...config,
      closed: !config.closed,
    });
  };

  // Change point type (corner vs smooth)
  const handleChangePointType = (newType: 'corner' | 'smooth') => {
    if (!selectedPointId || selectedIndex === -1) return;
    const isClosed = !!config.closed;
    const tangents = newType === 'smooth'
      ? calculateTangentHandles(points, selectedIndex, isClosed)
      : { handleIn: null, handleOut: null };

    const updated = points.map((p, idx) => {
      if (idx !== selectedIndex) return p;
      return {
        ...p,
        type: newType,
        handleIn: tangents.handleIn,
        handleOut: tangents.handleOut,
      };
    });
    onUpdatePathConfig({
      ...config,
      points: updated,
    });
  };

  // Update selected point coordinate manually
  const handleUpdatePointCoord = (coord: 'x' | 'y', val: number) => {
    if (!selectedPointId || isNaN(val)) return;
    const updated = points.map((p) => {
      if (p.id !== selectedPointId) return p;
      return {
        ...p,
        [coord]: Math.round(val),
      };
    });
    onUpdatePathConfig({
      ...config,
      points: updated,
    });
  };

  // Delete selected point
  const handleDeletePoint = () => {
    if (!selectedPointId || points.length <= 1) return;
    const updated = points.filter((p) => p.id !== selectedPointId);
    onUpdatePathConfig({
      ...config,
      points: updated,
    });
    setSelectedPointId(updated[updated.length - 1]?.id || null);
  };

  // Reverse path direction
  const handleReversePath = () => {
    if (points.length < 2) return;
    const reversed = reversePathPoints(points);
    onUpdatePathConfig({
      ...config,
      points: reversed,
    });
  };

  // Center path on canvas
  const handleCenterPath = () => {
    if (points.length < 1) return;
    const centered = centerPathPoints(points, canvasWidth, canvasHeight);
    onUpdatePathConfig({
      ...config,
      points: centered,
    });
  };

  return (
    <div
      id="pixelora-pen-inspector"
      className="flex-1 overflow-y-auto scrollbar-none p-4 space-y-4 select-none text-xs text-slate-800 dark:text-slate-100"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* 1. Header & Path Status */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/60 dark:bg-slate-750 border border-purple-100 dark:border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C4DFF] to-[#23B5D3] flex items-center justify-center text-white shadow-2xs">
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{activePathLayer.name || (isAr ? 'مسار متجهات' : 'Vector Path')}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {config.closed
                ? isAr
                  ? `مسار مغلق (${points.length} نقاط)`
                  : `Closed Path (${points.length} points)`
                : isAr
                ? `مسار مفتوح (${points.length} نقاط)`
                : `Open Path (${points.length} points)`}
            </div>
          </div>
        </div>

        <button
          onClick={onNewPath}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] border border-slate-200 dark:border-slate-600 hover:bg-purple-50 font-bold transition-all active:scale-95 shadow-2xs"
          title={isAr ? 'بدء مسار متجهات جديد' : 'Start new path'}
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[11px]">{isAr ? 'جديد' : 'New'}</span>
        </button>
      </div>

      {/* 2. Contextual Primary Actions */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {isAr ? 'العمليات على المسار' : 'Path Output Actions'}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {/* Convert to Selection */}
          <button
            onClick={onConvertToSelection}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#6C4DFF] to-[#5538EE] hover:opacity-95 text-white font-bold transition-all active:scale-95 shadow-2xs"
            title={isAr ? 'تحويل المسار إلى تحديد نشط (Marching Ants)' : 'Convert path to active selection'}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحويل لتحديد' : 'To Selection'}</span>
          </button>

          {/* Toggle Closed / Open */}
          <button
            onClick={handleToggleClosed}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border font-bold transition-all active:scale-95 ${
              config.closed
                ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800 text-[#23B5D3]'
                : 'bg-slate-50 dark:bg-slate-750 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>{config.closed ? (isAr ? 'مسار مغلق' : 'Closed Path') : isAr ? 'إغلاق المسار' : 'Close Path'}</span>
          </button>
        </div>

        {/* Secondary path utility actions */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {onConvertToMask && (
            <button
              onClick={onConvertToMask}
              className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              title={isAr ? 'تحويل المسار إلى قناع طبقة' : 'Convert path to layer mask'}
            >
              <Shield className="w-3 h-3 text-[#6C4DFF]" />
              <span>{isAr ? 'قناع' : 'Mask'}</span>
            </button>
          )}

          <button
            onClick={handleReversePath}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            title={isAr ? 'عكس اتجاه نقاط المسار' : 'Reverse path direction'}
          >
            <RefreshCw className="w-3 h-3 text-[#23B5D3]" />
            <span>{isAr ? 'عكس' : 'Reverse'}</span>
          </button>

          <button
            onClick={handleCenterPath}
            className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-slate-50 dark:bg-slate-750 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            title={isAr ? 'محاذاة المسار لمنتصف مساحة العمل' : 'Center path on canvas'}
          >
            <Crosshair className="w-3 h-3 text-[#2DD4BF]" />
            <span>{isAr ? 'توسيط' : 'Center'}</span>
          </button>
        </div>
      </div>

      {/* 3. Selected Point Inspector */}
      {selectedPoint && (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/90 dark:border-slate-700 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#6C4DFF] animate-pulse" />
              <span>{isAr ? `نقطة الارتكاز #${selectedIndex + 1}` : `Anchor Point #${selectedIndex + 1}`}</span>
            </span>

            {/* Numerical coordinate inputs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-1.5 py-0.5">
                <span className="font-mono text-[10px] text-slate-400 font-bold">X</span>
                <input
                  type="number"
                  value={selectedPoint.x}
                  onChange={(e) => handleUpdatePointCoord('x', Number(e.target.value))}
                  className="w-12 bg-transparent text-[11px] font-mono font-bold text-slate-800 dark:text-white outline-none"
                />
              </div>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-1.5 py-0.5">
                <span className="font-mono text-[10px] text-slate-400 font-bold">Y</span>
                <input
                  type="number"
                  value={selectedPoint.y}
                  onChange={(e) => handleUpdatePointCoord('y', Number(e.target.value))}
                  className="w-12 bg-transparent text-[11px] font-mono font-bold text-slate-800 dark:text-white outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleChangePointType('corner')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all border ${
                selectedPoint.type === 'corner' || (!selectedPoint.handleIn && !selectedPoint.handleOut)
                  ? 'bg-purple-100 dark:bg-purple-900/60 border-[#6C4DFF] text-[#6C4DFF] dark:text-[#2DD4BF]'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'نقطة زاوية حادة' : 'Corner'}
            </button>
            <button
              onClick={() => handleChangePointType('smooth')}
              className={`flex-1 py-1.5 rounded-xl font-bold transition-all border ${
                selectedPoint.type === 'smooth' && (selectedPoint.handleIn || selectedPoint.handleOut)
                  ? 'bg-purple-100 dark:bg-purple-900/60 border-[#6C4DFF] text-[#6C4DFF] dark:text-[#2DD4BF]'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'منحنى بيزييه ناعم' : 'Smooth Curve'}
            </button>

            {points.length > 1 && (
              <button
                onClick={handleDeletePoint}
                className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 transition-colors"
                title={isAr ? 'حذف النقطة (Delete)' : 'Delete Point (Del)'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Stroke & Fill Settings with UnifiedColorPicker */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-750 border border-slate-200/90 dark:border-slate-700 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700 pb-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveColorTab('stroke')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                activeColorTab === 'stroke'
                  ? 'bg-[#6C4DFF] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              {isAr ? 'الإطار (Stroke)' : 'Stroke'}
            </button>
            <button
              onClick={() => setActiveColorTab('fill')}
              className={`px-3 py-1 rounded-xl font-bold transition-all ${
                activeColorTab === 'fill'
                  ? 'bg-[#6C4DFF] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
              }`}
            >
              {isAr ? 'التعبئة (Fill)' : 'Fill'}
            </button>
          </div>

          {/* Quick toggle transparent fill */}
          {activeColorTab === 'fill' && (
            <button
              onClick={() =>
                onUpdatePathConfig({
                  ...config,
                  fillColor: config.fillColor === 'transparent' ? '#6C4DFF' : 'transparent',
                })
              }
              className="text-[11px] font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline"
            >
              {config.fillColor === 'transparent'
                ? isAr
                  ? 'تفعيل التعبئة'
                  : 'Enable Fill'
                : isAr
                ? 'تفريغ'
                : 'Transparent'}
            </button>
          )}
        </div>

        {/* Color Picker for active tab */}
        {activeColorTab === 'stroke' ? (
          <div className="space-y-3">
            <UnifiedColorPicker
              color={config.strokeColor || '#6C4DFF'}
              onChangeColor={(newColor) => onUpdatePathConfig({ ...config, strokeColor: newColor })}
              supportGradient={false}
              recentColors={recentColors}
              isEyedropperActive={isEyedropperActive && eyedropperTarget === 'pen-stroke'}
              onTriggerEyedropper={() => onToggleEyedropper?.('pen-stroke')}
              language={language}
              label={isAr ? 'لون إطار المسار' : 'Stroke Color'}
            />

            {/* Stroke Width Slider */}
            <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-400">{isAr ? 'سُمك الخط' : 'Stroke Width'}</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{config.strokeWidth} px</span>
              </div>
              <input
                type="range"
                min={1}
                max={40}
                value={config.strokeWidth}
                onChange={(e) => onUpdatePathConfig({ ...config, strokeWidth: Number(e.target.value) })}
                className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {config.fillColor === 'transparent' ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-center space-y-2">
                <span className="text-xs text-slate-500">
                  {isAr ? 'التعبئة مفرغة حالياً' : 'Fill is currently transparent'}
                </span>
                <div>
                  <button
                    onClick={() => onUpdatePathConfig({ ...config, fillColor: '#6C4DFF' })}
                    className="px-3 py-1.5 rounded-xl bg-[#6C4DFF] text-white font-bold text-xs shadow-2xs hover:opacity-90"
                  >
                    {isAr ? 'تفعيل لون التعبئة' : 'Enable Fill Color'}
                  </button>
                </div>
              </div>
            ) : (
              <UnifiedColorPicker
                color={config.fillColor}
                onChangeColor={(newColor) => onUpdatePathConfig({ ...config, fillColor: newColor })}
                supportGradient={false}
                recentColors={recentColors}
                isEyedropperActive={isEyedropperActive && eyedropperTarget === 'pen-fill'}
                onTriggerEyedropper={() => onToggleEyedropper?.('pen-fill')}
                language={language}
                label={isAr ? 'لون التعبئة الداخلي' : 'Fill Color'}
              />
            )}
          </div>
        )}
      </div>

      {/* 5. Helpful Guide & Keyboard Tips */}
      <div className="p-3 rounded-2xl bg-purple-50/40 dark:bg-slate-750/50 border border-purple-100/60 dark:border-slate-700/60 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
        <div className="font-bold text-[#6C4DFF] dark:text-[#2DD4BF] flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'إرشادات المحترفين لأداة القلم' : 'Pro Pen Tips'}</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[10.5px] leading-relaxed">
          <li>{isAr ? 'انقر لوضع نقطة ارتكاز مستقيمة.' : 'Click to place a straight corner anchor point.'}</li>
          <li>{isAr ? 'انقر واسحب لرسم مقابض بيزييه ناعمة.' : 'Click & drag to create smooth Bézier curve handles.'}</li>
          <li>{isAr ? 'انقر على أول نقطة لإغلاق المسار تلقائياً.' : 'Click the first point to close the path automatically.'}</li>
          <li>{isAr ? 'اضغط Shift لسحب مستقيم أو محاذاة زوايا المقابض بـ 45°.' : 'Hold Shift for straight axis dragging or 45° handle angle snapping.'}</li>
          <li>{isAr ? 'اضغط Alt على المقبض لكسر التناظر المستقل.' : 'Hold Alt on handle to break symmetry independently.'}</li>
          <li>{isAr ? 'اضغط Alt+نقر على النقطة للتبديل بين زاوية حادة ومنحنى.' : 'Alt+Click anchor point to toggle Corner / Smooth curve.'}</li>
          <li>{isAr ? 'اضغط Del لحذف النقطة المحددة.' : 'Press Del / Backspace to delete selected point.'}</li>
        </ul>
      </div>
    </div>
  );
};

