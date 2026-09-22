import React from 'react';
import {
  Wand2,
  Paintbrush,
  Eraser,
  Sliders,
  RotateCcw,
  Check,
  X,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  AlertCircle,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';
import { Layer } from '../../../types';

interface RemoveObjectInspectorProps {
  brushSize: number;
  setBrushSize: (size: number) => void;
  hardness: number;
  setHardness: (hardness: number) => void;
  mode: 'add' | 'remove';
  setMode: (mode: 'add' | 'remove') => void;
  isPreviewing: boolean;
  onTogglePreview: () => void;
  onApply: () => void;
  onCancel: () => void;
  onClearMask: () => void;
  hasMask: boolean;
  isProcessing: boolean;
  selectedLayer?: Layer | null;
  layers?: Layer[];
  onSelectLayer?: (id: string | null) => void;
  language: 'ar' | 'en';
  darkMode: boolean;
}

export const REMOVE_OBJECT_PRESETS = [
  {
    nameAr: 'نصوص وشوائب دقيقة',
    nameEn: 'Text & Dust',
    descAr: 'لحذف الكلمات، الشوائب، والرموز الصغيرة',
    size: 18,
    hardness: 0.8,
  },
  {
    nameAr: 'شعارات وعناصر متوسطة',
    nameEn: 'Logos & Watermarks',
    descAr: 'لإزالة العلامات المائية والشعارات المتراكبة',
    size: 38,
    hardness: 0.5,
  },
  {
    nameAr: 'أشخاص وكائنات كبيرة',
    nameEn: 'Objects & People',
    descAr: 'لتحديد العناصر الأكبر مع دمج الحواف المحيطة',
    size: 80,
    hardness: 0.25,
  },
];

export const RemoveObjectInspector: React.FC<RemoveObjectInspectorProps> = ({
  brushSize,
  setBrushSize,
  hardness,
  setHardness,
  mode,
  setMode,
  isPreviewing,
  onTogglePreview,
  onApply,
  onCancel,
  onClearMask,
  hasMask,
  isProcessing,
  selectedLayer,
  layers = [],
  onSelectLayer,
  language,
  darkMode,
}) => {
  const isAr = language === 'ar';

  const isImageLayer = selectedLayer?.type === 'image';
  const isLocked = !!selectedLayer?.locked;
  const isReady = isImageLayer && !isLocked;

  const eligibleImageLayers = layers.filter((l) => l.type === 'image' && !l.locked);

  return (
    <div className="space-y-4 text-xs select-none" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#6338E8] to-[#4F8FE8] flex items-center justify-center text-white shadow-xs">
            <Wand2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm">{isAr ? 'أداة إزالة الكائن' : 'Remove Object Tool'}</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-[#6338E8] dark:text-[#20BFC4] font-bold border border-[#6338E8]/20">
          {isAr ? 'إعادة بناء ذكية' : 'Smart Inpaint'}
        </span>
      </div>

      {/* Target Layer Status Card */}
      <div className="rounded-xl border p-3 bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isAr ? 'الطبقة المستهدفة بالإزالة' : 'Target Layer'}
          </span>
          {selectedLayer && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                isLocked
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  : isImageLayer
                  ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
              }`}
            >
              {isLocked
                ? isAr ? 'مقفلة' : 'LOCKED'
                : isImageLayer
                ? isAr ? 'صورة نقطية' : 'IMAGE'
                : selectedLayer.type.toUpperCase()}
            </span>
          )}
        </div>

        {selectedLayer ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isLocked
                    ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600'
                    : isImageLayer
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600'
                    : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600'
                }`}
              >
                {isLocked ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : isImageLayer ? (
                  <ImageIcon className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-800 dark:text-slate-100 truncate text-xs">
                  {selectedLayer.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isLocked
                    ? isAr
                      ? 'الطبقة مقفلة — قم بإلغاء القفل لاستخدام أداة إزالة الكائن'
                      : 'Layer locked — unlock to remove objects'
                    : isImageLayer
                    ? isAr
                      ? `الأبعاد: ${Math.round(selectedLayer.width)}×${Math.round(selectedLayer.height)} بكسل (جاهزة للإزالة)`
                      : `Size: ${Math.round(selectedLayer.width)}×${Math.round(selectedLayer.height)}px (Ready)`
                    : isAr
                    ? 'تعمل أداة إزالة الكائن على طبقات الصور فقط. يرجى تحديد طبقة صورة قابلة للتعديل.'
                    : 'Remove Object works on raster/image content. Select an editable image layer.'}
                </div>
              </div>
            </div>

            {!isImageLayer && eligibleImageLayers.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] text-slate-500 block mb-1">
                  {isAr ? 'اختر طبقة صورة صالحة للعمل عليها:' : 'Select an editable image layer:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {eligibleImageLayers.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => onSelectLayer?.(layer.id)}
                      className="px-2 py-1 bg-white dark:bg-slate-700 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[#6338E8] dark:text-[#20BFC4] rounded-lg border border-slate-200 dark:border-slate-600 text-[10px] font-semibold transition-all"
                    >
                      {layer.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-2 text-slate-500 dark:text-slate-400">
            <AlertCircle className="w-5 h-5 mx-auto mb-1 text-amber-500 opacity-80" />
            <p className="text-[11px]">
              {isAr
                ? 'يرجى تحديد طبقة صورة في التصميم لتطبيق إزالة الكائن'
                : 'Please select an image layer to use the Remove Object tool'}
            </p>
          </div>
        )}
      </div>

      {/* Mode Selector: Add to Mask vs Remove from Mask */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          {isAr ? 'نمط قناع التحديد' : 'Selection Mask Mode'}
        </label>
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMode('add')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
              mode === 'add'
                ? 'bg-[#6338E8] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>{isAr ? 'تحديد كائن (+)' : 'Paint Object (+)'}</span>
          </button>
          <button
            onClick={() => setMode('remove')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
              mode === 'remove'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>{isAr ? 'مسح من القناع (-)' : 'Erase Mask (-)'}</span>
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          {isAr ? 'إعدادات جاهزة شائعة' : 'Common Task Presets'}
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {REMOVE_OBJECT_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setBrushSize(preset.size);
                setHardness(preset.hardness);
              }}
              className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                brushSize === preset.size
                  ? 'border-[#6338E8] bg-purple-50/70 dark:bg-purple-950/40 text-[#6338E8] dark:text-[#20BFC4] font-bold'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] font-bold block truncate w-full">
                {isAr ? preset.nameAr : preset.nameEn}
              </span>
              <span className="text-[9px] text-slate-500 opacity-80 mt-0.5">
                {preset.size}px
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Brush Size Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'حجم الفرشاة' : 'Brush Size'}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-mono">[{isAr ? 'اختصار: ] [' : 'Keys: [ ]'}]</span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[10px]">
              {brushSize}px
            </span>
          </div>
        </div>
        <input
          type="range"
          min="4"
          max="200"
          value={brushSize}
          onChange={(e) => setBrushSize(parseInt(e.target.value))}
          className="w-full accent-[#6338E8] dark:accent-[#20BFC4] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />
      </div>

      {/* Feather / Hardness Slider */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'تنعيم الحواف (Feather)' : 'Edge Feathering'}
          </span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-[10px]">
            {Math.round((1 - hardness) * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={1 - hardness}
          onChange={(e) => setHardness(1 - parseFloat(e.target.value))}
          className="w-full accent-[#6338E8] dark:accent-[#20BFC4] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[9px] text-slate-500 dark:text-slate-400">
          <span>{isAr ? 'حافة حادة (0%)' : 'Sharp (0%)'}</span>
          <span>{isAr ? 'دمج ناعم (100%)' : 'Ultra-Soft (100%)'}</span>
        </div>
      </div>

      {/* Action Buttons: Preview, Apply, Clear, Cancel */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
        {/* Preview Button */}
        <button
          onClick={onTogglePreview}
          disabled={!hasMask || !isReady || isProcessing}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
            isPreviewing
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
              : hasMask && isReady
              ? 'bg-purple-100 dark:bg-purple-950/60 text-[#6338E8] dark:text-[#20BFC4] border border-[#6338E8]/30 hover:bg-purple-200'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isAr ? 'جاري إعادة البناء...' : 'Reconstructing...'}</span>
            </>
          ) : isPreviewing ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>{isAr ? 'إخفاء المعاينة (العودة للقناع)' : 'Hide Preview (Show Mask)'}</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>{isAr ? 'معاينة النتيجة الذكية' : 'Preview Reconstructed Result'}</span>
            </>
          )}
        </button>

        {/* Apply & Cancel Primary Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onApply}
            disabled={!hasMask || !isReady || isProcessing}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold text-white transition-all shadow-xs ${
              hasMask && isReady && !isProcessing
                ? 'bg-gradient-to-r from-[#6338E8] to-[#4F8FE8] hover:from-[#522ac7] hover:to-[#3b7bd6] scale-[1.01]'
                : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-50'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'تطبيق الإزالة (Enter)' : 'Apply (Enter)'}</span>
          </button>

          <button
            onClick={onCancel}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
            <span>{isAr ? 'إلغاء (Esc)' : 'Cancel (Esc)'}</span>
          </button>
        </div>

        {/* Clear Mask */}
        {hasMask && (
          <button
            onClick={onClearMask}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg font-semibold text-[11px] transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'مسح قناع التحديد بالكامل' : 'Clear Entire Mask'}</span>
          </button>
        )}
      </div>

      {/* Difference from Eraser Note Card */}
      <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40 text-[10px] space-y-1 text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-1 text-[#6338E8] dark:text-[#20BFC4] font-bold">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          <span>{isAr ? 'الفرق بين الممحاة وإزالة الكائن:' : 'Remove Object vs. Eraser:'}</span>
        </div>
        <p className="leading-relaxed">
          {isAr
            ? 'الممحاة تقوم بتفريغ البكسلات وجعلها شفافة، بينما أداة إزالة الكائن تقوم بتحليل محيط الصورة وإعادة بناء الخلفية بسلاسة بدون ثقوب شفافة.'
            : 'Eraser cuts away pixels revealing transparency, while Remove Object analyzes surrounding textures and seamlessly reconstructs the background without transparent holes.'}
        </p>
      </div>
    </div>
  );
};
