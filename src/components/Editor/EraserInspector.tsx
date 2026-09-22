import React from 'react';
import {
  Eraser,
  Paintbrush,
  Circle,
  Square,
  Sparkles,
  Sliders,
  RotateCcw,
  Trash2,
  Check,
  Feather,
  Zap,
  Layers,
  Lock,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { DrawingPath, Layer } from '../../types';

interface EraserInspectorProps {
  brushConfig: {
    size: number;
    color: string;
    opacity: number;
    hardness: number;
    tipShape: 'round' | 'square';
    tool: 'pen' | 'brush' | 'eraser';
  };
  setBrushConfig: React.Dispatch<
    React.SetStateAction<{
      size: number;
      color: string;
      opacity: number;
      hardness: number;
      tipShape: 'round' | 'square';
      tool: 'pen' | 'brush' | 'eraser';
    }>
  >;
  selectedLayer?: Layer | null;
  layers?: Layer[];
  onSelectLayer?: (id: string | null) => void;
  onClearDrawingLayer?: () => void;
  onResetEffectMask?: (layerId: string) => void;
  language: 'ar' | 'en';
  darkMode: boolean;
}

export const ERASER_PRESETS = [
  {
    nameAr: 'حواف حادة دقيقة',
    nameEn: 'Hard Precision',
    descAr: 'لمسح الحدود والتفاصيل الصغيرة بدقة 100%',
    size: 16,
    hardness: 1.0,
    opacity: 1.0,
    shape: 'round' as const,
  },
  {
    nameAr: 'ممحاة ناعمة مدمجة',
    nameEn: 'Soft Feather',
    descAr: 'حواف ضبابية ناعمة لدمج العناصر وتنعيم الحواف',
    size: 48,
    hardness: 0.2,
    opacity: 0.7,
    shape: 'round' as const,
  },
  {
    nameAr: 'ممحاة مربعة هندسية',
    nameEn: 'Square Eraser',
    descAr: 'رأس مربع للمسح الزاوي والمستقيم',
    size: 32,
    hardness: 1.0,
    opacity: 1.0,
    shape: 'square' as const,
  },
  {
    nameAr: 'مسح واسع سريع',
    nameEn: 'Large Area',
    descAr: 'لتفريغ المساحات الكبيرة بسرعة',
    size: 110,
    hardness: 0.8,
    opacity: 1.0,
    shape: 'round' as const,
  },
];

export const EraserInspector: React.FC<EraserInspectorProps> = ({
  brushConfig,
  setBrushConfig,
  selectedLayer,
  layers = [],
  onSelectLayer,
  onClearDrawingLayer,
  onResetEffectMask,
  language,
  darkMode,
}) => {
  const isAr = language === 'ar';
  const isEraser = brushConfig.tool === 'eraser';

  const eligibleLayers = layers.filter(
    (l) => l.type === 'image' || l.type === 'drawing' || l.type === 'effect'
  );

  return (
    <div className="space-y-4 text-xs select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <Eraser className="w-4 h-4 text-[#EF4444] dark:text-[#F87171]" />
          <span>{isAr ? 'أداة الممحاة الذكية' : 'Smart Eraser'}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold">
          {isAr ? 'عزل تلقائي للطبقات' : 'Layer-Aware'}
        </span>
      </div>

      {/* Target Layer Status Card */}
      <div className="rounded-xl border p-3 bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isAr ? 'الطبقة المستهدفة بالمسح' : 'Active Target Layer'}
          </span>
          {selectedLayer && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                selectedLayer.locked
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  : selectedLayer.type === 'image'
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                  : selectedLayer.type === 'drawing'
                  ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                  : selectedLayer.type === 'effect'
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {selectedLayer.type === 'effect'
                ? isAr
                  ? 'قناع تأثير'
                  : 'EFFECT MASK'
                : selectedLayer.type.toUpperCase()}
            </span>
          )}
        </div>

        {selectedLayer ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedLayer.locked
                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600'
                    : selectedLayer.type === 'image'
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600'
                    : selectedLayer.type === 'drawing'
                    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600'
                    : selectedLayer.type === 'effect'
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}
              >
                {selectedLayer.locked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : selectedLayer.type === 'image' ? (
                  <ImageIcon className="w-3.5 h-3.5" />
                ) : selectedLayer.type === 'effect' ? (
                  <Sliders className="w-3.5 h-3.5" />
                ) : (
                  <Paintbrush className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-800 dark:text-slate-100 truncate text-xs">
                  {selectedLayer.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {selectedLayer.locked
                    ? isAr
                      ? 'الطبقة مقفلة — قم بإلغاء القفل للمسح'
                      : 'Locked — unlock layer to erase'
                    : selectedLayer.type === 'image'
                    ? isAr
                      ? 'مسح بكسلات حقيقي بدون تشويه الطبقات الأخرى'
                      : 'Pixel-level erasing isolated to this image'
                    : selectedLayer.type === 'drawing'
                    ? isAr
                      ? 'مسح خطوط الرسم مع الحفاظ على شفافية المسار'
                      : 'Erasing drawing strokes non-destructively'
                    : selectedLayer.type === 'effect'
                    ? isAr
                      ? 'عزل وقناع غير إتلافي — مسح التأثير موضعياً وبقاء الصورة والتأثيرات الأخرى سليمة 100%'
                      : 'Non-destructive masking — locally erases this effect while preserving base image and other effects'
                    : isAr
                      ? 'طبقة متجهة — حولها لصورة للمسح النقطي'
                      : 'Vector layer — rasterize to erase pixels'}
                </div>
              </div>
            </div>

            {/* Reset Effect Mask Button if mask is applied */}
            {selectedLayer.type === 'effect' && selectedLayer.effectMask && onResetEffectMask && (
              <button
                type="button"
                onClick={() => onResetEffectMask(selectedLayer.id)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{isAr ? 'استعادة كامل التأثير (إزالة القناع)' : 'Restore Full Effect (Remove Mask)'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2 py-1">
            <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAr
                ? 'انقر على أي صورة أو رسمة في اللوحة للمسح عليها مباشرة.'
                : 'Click any image or drawing on the canvas to erase it directly.'}
            </div>
          </div>
        )}

        {/* Quick Target Switcher */}
        {eligibleLayers.length > 1 && onSelectLayer && (
          <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="text-[10px] text-slate-400 shrink-0">
              {isAr ? 'تبديل سريع:' : 'Quick Target:'}
            </span>
            {eligibleLayers.map((l) => (
              <button
                key={l.id}
                onClick={() => onSelectLayer(l.id)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold truncate max-w-[110px] transition-all shrink-0 ${
                  selectedLayer?.id === l.id
                    ? 'bg-red-500 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                }`}
                title={l.name}
              >
                {l.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live Tip Preview Display */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col items-center justify-center relative overflow-hidden border border-slate-800 shadow-inner">
        <div className="absolute top-2 right-2 text-[10px] text-slate-400 font-mono">
          {isAr ? 'معاينة رأس الممحاة' : 'Tip Preview'}
        </div>

        <div className="h-24 flex items-center justify-center">
          <div
            style={{
              width: `${Math.min(84, Math.max(12, brushConfig.size))}px`,
              height: `${Math.min(84, Math.max(12, brushConfig.size))}px`,
              borderRadius: brushConfig.tipShape === 'square' ? '4px' : '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.85)',
              boxShadow:
                brushConfig.hardness < 0.95
                  ? `0 0 ${Math.round((1 - brushConfig.hardness) * 24)}px rgba(239, 68, 68, 0.9)`
                  : 'none',
              opacity: brushConfig.opacity,
            }}
            className="transition-all duration-100 flex items-center justify-center"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
          </div>
        </div>

        <div className="flex items-center justify-between w-full pt-2 border-t border-slate-800 text-[10px] text-slate-300 font-mono">
          <span>{brushConfig.size}px</span>
          <span>
            {isAr ? 'النعومة' : 'Hardness'}: {Math.round(brushConfig.hardness * 100)}%
          </span>
          <span>
            {isAr ? 'القوة' : 'Flow'}: {Math.round(brushConfig.opacity * 100)}%
          </span>
        </div>
      </div>

      {/* 1. Size Slider & Quick Pills */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
          <span>{isAr ? 'حجم رأس الممحاة' : 'Eraser Size'}</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="2"
              max="250"
              value={brushConfig.size}
              onChange={(e) =>
                setBrushConfig((prev) => ({
                  ...prev,
                  size: Math.max(2, Math.min(250, Number(e.target.value) || 10)),
                }))
              }
              className="w-14 p-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-center font-mono font-bold text-xs"
            />
            <span className="text-[10px] text-slate-400 font-mono">px</span>
          </div>
        </div>

        <input
          type="range"
          min="2"
          max="200"
          value={brushConfig.size}
          onChange={(e) =>
            setBrushConfig((prev) => ({ ...prev, size: Number(e.target.value) }))
          }
          className="w-full accent-[#EF4444] cursor-pointer"
        />

        {/* Quick Size Pills */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pt-0.5">
          {[6, 14, 28, 56, 96, 140].map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => setBrushConfig((prev) => ({ ...prev, size: sz }))}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold transition-all ${
                brushConfig.size === sz
                  ? 'bg-[#EF4444] text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {sz}px
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hardness / Softness (نعومة الحواف) */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <Feather className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'نعومة الحواف (Hardness)' : 'Edge Hardness'}</span>
          </span>
          <span className="font-mono">{Math.round(brushConfig.hardness * 100)}%</span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={Math.round(brushConfig.hardness * 100)}
          onChange={(e) =>
            setBrushConfig((prev) => ({
              ...prev,
              hardness: Number(e.target.value) / 100,
            }))
          }
          className="w-full accent-[#EF4444] cursor-pointer"
        />

        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span>{isAr ? '0% حواف ريشية ناعمة' : 'Soft Feather'}</span>
          <span>{isAr ? '100% حواف حادة بالغة الدقة' : 'Crisp Hard'}</span>
        </div>
      </div>

      {/* 3. Strength / Opacity (قوة وتدفق المسح) */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>{isAr ? 'قوة المسح والتدفق (Strength / Flow)' : 'Eraser Flow'}</span>
          </span>
          <span className="font-mono">{Math.round(brushConfig.opacity * 100)}%</span>
        </div>

        <input
          type="range"
          min="5"
          max="100"
          value={Math.round(brushConfig.opacity * 100)}
          onChange={(e) =>
            setBrushConfig((prev) => ({
              ...prev,
              opacity: Number(e.target.value) / 100,
            }))
          }
          className="w-full accent-[#EF4444] cursor-pointer"
        />
      </div>

      {/* 4. Tip Shape (شكل رأس الممحاة) */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
        <span className="font-bold text-slate-700 dark:text-slate-300 block">
          {isAr ? 'شكل رأس الممحاة' : 'Eraser Tip Shape'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setBrushConfig((prev) => ({ ...prev, tipShape: 'round' }))}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
              brushConfig.tipShape !== 'square'
                ? 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444] shadow-xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Circle className="w-4 h-4 fill-current" />
            <span>{isAr ? 'رأس دائري (Round)' : 'Round Tip'}</span>
          </button>

          <button
            type="button"
            onClick={() => setBrushConfig((prev) => ({ ...prev, tipShape: 'square' }))}
            className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
              brushConfig.tipShape === 'square'
                ? 'border-[#EF4444] bg-[#EF4444]/10 text-[#EF4444] shadow-xs'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Square className="w-4 h-4 fill-current" />
            <span>{isAr ? 'رأس مربع (Square)' : 'Square Tip'}</span>
          </button>
        </div>
      </div>

      {/* 5. Eraser Quick Presets */}
      <div className="space-y-1.5">
        <span className="font-bold text-slate-700 dark:text-slate-300 block">
          {isAr ? 'نماذج ممحاة احترافية جاهزة' : 'Eraser Presets'}
        </span>
        <div className="grid grid-cols-2 gap-2">
          {ERASER_PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() =>
                setBrushConfig((prev) => ({
                  ...prev,
                  size: p.size,
                  hardness: p.hardness,
                  opacity: p.opacity,
                  tipShape: p.shape,
                  tool: 'eraser',
                }))
              }
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-[#EF4444] hover:bg-red-50/30 dark:hover:bg-red-950/20 text-right transition-all group"
            >
              <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#EF4444] text-[11px]">
                {isAr ? p.nameAr : p.nameEn}
              </div>
              <div className="text-[9px] text-slate-500 line-clamp-1 mt-0.5">
                {isAr ? p.descAr : p.nameEn}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Clear Drawing paths button */}
      {onClearDrawingLayer && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onClearDrawingLayer}
            className="w-full py-2 px-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'مسح كل خطوط الرسم والممحاة' : 'Clear All Eraser Strokes'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
