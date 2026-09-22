import React, { useState, useEffect, useMemo } from 'react';
import { Layer, LayerFilters, EffectType } from '../../../types';
import {
  LIGHTROOM_PRESETS,
  PRESET_CATEGORIES,
  FilterPreset,
  PresetCategory,
} from '../../../data/lightroomPresets';
import {
  Sparkles,
  Sun,
  Film,
  Clock,
  Contrast,
  Flame,
  Snowflake,
  User,
  Palette,
  Check,
  RotateCcw,
  Layers,
  Sliders,
  Eraser,
  Trash2,
  SlidersHorizontal,
  Droplets,
  ShieldCheck,
  Focus,
  Scan,
  Shapes,
  BarChart2,
  Activity,
} from 'lucide-react';
import { buildCanvasFilterString } from '../../../utils/compositeRenderer';
import { isImageProcessingFilter } from '../../../utils/filterEngines';
import { FILTER_PARAM_DEFS, getDefaultFilterParams } from '../../../data/imageProcessingFilters';

interface FilterLibraryPanelProps {
  selectedLayer?: Layer;
  layers?: Layer[];
  onUpdateFilters: (updater: (prev: LayerFilters) => LayerFilters) => void;
  onApplyEffect?: (effectType: EffectType, updater: (prev: LayerFilters) => LayerFilters) => void;
  onDiscardEffect?: (layerId: string) => void;
  onActivateEraser?: () => void;
  onResetEffectMask?: () => void;
  language: 'ar' | 'en';
}

const CATEGORY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Sun,
  Film,
  Clock,
  Contrast,
  Flame,
  Snowflake,
  User,
  Palette,
  SlidersHorizontal,
  Droplets,
  ShieldCheck,
  Focus,
  Scan,
  Shapes,
  BarChart2,
  Activity,
};

export const FilterLibraryPanel: React.FC<FilterLibraryPanelProps> = ({
  selectedLayer,
  layers,
  onUpdateFilters,
  onApplyEffect,
  onDiscardEffect,
  onActivateEraser,
  onResetEffectMask,
  language,
}) => {
  const isAr = language === 'ar';
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [thumbSrc, setThumbSrc] = useState<string | null>(null);

  // Generate a downscaled 80px thumbnail for efficient live preview rendering
  useEffect(() => {
    const effectiveSource =
      selectedLayer?.type === 'image' && selectedLayer.source
        ? selectedLayer.source
        : layers?.slice().reverse().find((l) => l.type === 'image' && l.source)?.source;

    if (effectiveSource) {
      let isMounted = true;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (!isMounted) return;
        try {
          const sz = 80;
          const c = document.createElement('canvas');
          c.width = sz;
          c.height = sz;
          const ctx = c.getContext('2d');
          if (ctx) {
            // Center-crop to square
            const minDim = Math.min(img.naturalWidth, img.naturalHeight);
            const sx = (img.naturalWidth - minDim) / 2;
            const sy = (img.naturalHeight - minDim) / 2;
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, sz, sz);
            setThumbSrc(c.toDataURL('image/jpeg', 0.8));
          }
        } catch {
          setThumbSrc(effectiveSource);
        }
      };
      img.onerror = () => {
        if (isMounted) setThumbSrc(effectiveSource);
      };
      img.src = effectiveSource;

      return () => {
        isMounted = false;
      };
    } else {
      setThumbSrc(null);
    }
  }, [selectedLayer?.type, selectedLayer?.source, layers]);

  // Compute CSS filter for each preset
  const presetCssMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of LIGHTROOM_PRESETS) {
      if (p.id === 'original') {
        map[p.id] = 'none';
      } else {
        map[p.id] = buildCanvasFilterString({
          brightness: 100,
          contrast: 100,
          saturation: 100,
          temperature: 0,
          tint: 0,
          sharpness: 0,
          blur: 0,
          opacity: 100,
          ...p.filters,
          presetFilter: 'none',
          presetIntensity: 100,
        });
      }
    }
    return map;
  }, []);

  if (!selectedLayer) {
    return (
      <div className="py-12 px-4 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        <Sparkles className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {isAr ? 'لم يتم تحديد طبقة' : 'No Layer Selected'}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {isAr
            ? 'يرجى تحديد طبقة لتطبيق الفلاتر والأنماط البصرية.'
            : 'Select a layer on the canvas to apply filter presets.'}
        </p>
      </div>
    );
  }

  const currentFilters: LayerFilters = selectedLayer.filters || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    presetFilter: 'none',
    presetIntensity: 100,
  };

  const activePresetId = currentFilters.presetFilter || 'none';
  const presetIntensity = currentFilters.presetIntensity ?? 100;
  const isFilterActive = activePresetId !== 'none' && activePresetId !== 'original';

  // Categories list starting with 'All'
  const categories = [
    { id: 'all', nameAr: 'الكل', nameEn: 'All', iconName: 'Sparkles' },
    ...PRESET_CATEGORIES,
  ];

  // Filter presets based on category
  const filteredPresets = LIGHTROOM_PRESETS.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  // Select preset: automatically creates/updates the corresponding Effect Layer
  const handleSelectPreset = (preset: FilterPreset) => {
    if (preset.id === 'original' || preset.id === 'none') {
      if (selectedLayer?.type === 'effect' && onDiscardEffect) {
        onDiscardEffect(selectedLayer.id);
        return;
      }
      if (onApplyEffect) {
        onApplyEffect('filter', (prev) => ({
          ...prev,
          presetFilter: 'none',
          presetIntensity: 100,
        }));
      } else {
        onUpdateFilters((prev) => ({
          ...prev,
          presetFilter: 'none',
          presetIntensity: 100,
        }));
      }
      return;
    }

    const newParams = isImageProcessingFilter(preset.id)
      ? getDefaultFilterParams(preset.id)
      : undefined;

    if (onApplyEffect) {
      onApplyEffect('filter', (prev) => ({
        ...prev,
        ...preset.filters,
        presetFilter: preset.id,
        presetIntensity: prev.presetIntensity !== undefined ? prev.presetIntensity : 100,
        presetParams: newParams ? { ...(prev.presetParams || {}), ...newParams } : prev.presetParams,
      }));
    } else {
      onUpdateFilters((prev) => ({
        ...prev,
        ...preset.filters,
        presetFilter: preset.id,
        presetIntensity: prev.presetIntensity !== undefined ? prev.presetIntensity : 100,
        presetParams: newParams ? { ...(prev.presetParams || {}), ...newParams } : prev.presetParams,
      }));
    }
  };

  // Change intensity of selected filter
  const handleIntensityChange = (val: number) => {
    if (onApplyEffect) {
      onApplyEffect('filter', (prev) => ({
        ...prev,
        presetIntensity: val,
      }));
    } else {
      onUpdateFilters((prev) => ({
        ...prev,
        presetIntensity: val,
      }));
    }
  };

  // Reset filter: removes presetFilter and restores intensity
  const handleResetFilters = () => {
    if (selectedLayer?.type === 'effect' && onDiscardEffect) {
      onDiscardEffect(selectedLayer.id);
      return;
    }
    if (onApplyEffect) {
      onApplyEffect('filter', (prev) => ({
        ...prev,
        presetFilter: 'none',
        presetIntensity: 100,
      }));
    } else {
      onUpdateFilters((prev) => ({
        ...prev,
        presetFilter: 'none',
        presetIntensity: 100,
      }));
    }
  };

  return (
    <div className="space-y-4" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Effect Layer Banner / Add Filter Layer Action */}
      {selectedLayer.type === 'effect' && (
        <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-100 truncate">
                {selectedLayer.name}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 shrink-0">
              {isAr ? 'طبقة فلتر مستقلة' : 'Filter Layer'}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            {onActivateEraser && (
              <button
                type="button"
                onClick={onActivateEraser}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>{isAr ? 'مسح بالممحاة الذكية' : 'Mask with Smart Eraser'}</span>
              </button>
            )}

            {selectedLayer.effectMask && onResetEffectMask && (
              <button
                type="button"
                onClick={onResetEffectMask}
                className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 text-xs font-semibold hover:bg-amber-200 transition-colors"
                title={isAr ? 'استعادة كامل الفلتر وإزالة القناع' : 'Restore full filter (clear mask)'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isAr ? 'إلغاء القناع' : 'Reset Mask'}</span>
              </button>
            )}

            {onDiscardEffect && (
              <button
                type="button"
                onClick={() => onDiscardEffect(selectedLayer.id)}
                className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-white dark:bg-slate-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs font-semibold transition-colors"
                title={isAr ? 'حذف طبقة الفلتر والتراجع عنه' : 'Discard filter layer'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'إلغاء الفلتر' : 'Discard'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {selectedLayer.type !== 'effect' && (
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'مكتبة الفلاتر الفوتوغرافية' : 'Photographic Presets'}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {isAr ? 'ينشئ طبقة فلتر غير مدمرة تلقائياً' : 'Auto creates non-destructive layer'}
          </span>
        </div>
      )}

      {/* Category Pills Slider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const Icon =
            cat.id === 'all'
              ? Sparkles
              : CATEGORY_ICONS[cat.iconName] || Sparkles;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-2xs ${
                isSelected
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isAr ? cat.nameAr : cat.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* Compact 3-Column Visual Filter Grid */}
      <div className="grid grid-cols-3 gap-2">
        {filteredPresets.map((preset) => {
          const isSelected =
            activePresetId === preset.id ||
            (preset.id === 'original' && activePresetId === 'none');

          const cssFilter = presetCssMap[preset.id] || 'none';

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`group flex flex-col items-center p-1.5 rounded-xl border transition-all cursor-pointer relative text-center ${
                isSelected
                  ? 'border-[#6C4DFF] dark:border-[#2DD4BF] ring-2 ring-[#6C4DFF]/30 dark:ring-[#2DD4BF]/30 bg-purple-50/50 dark:bg-purple-950/30'
                  : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-2xs">
                {thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt={preset.nameEn}
                    style={{ filter: cssFilter }}
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-200 group-hover:scale-105"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-tr ${preset.previewGradient}`}
                  />
                )}

                {/* Active Checkmark Badge */}
                {isSelected && (
                  <div className="absolute top-1 right-1 rtl:right-auto rtl:left-1 w-4 h-4 rounded-full bg-[#6C4DFF] dark:bg-[#2DD4BF] text-white dark:text-slate-950 flex items-center justify-center shadow-md">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Filter Name */}
              <span
                className={`text-[11px] font-medium leading-tight truncate w-full mt-1.5 transition-colors ${
                  isSelected
                    ? 'text-[#6C4DFF] dark:text-[#2DD4BF] font-bold'
                    : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                }`}
              >
                {isAr ? preset.nameAr : preset.nameEn}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Intensity Slider */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'شدة الفلتر' : 'Filter Intensity'}</span>
          </div>
          <span className="font-mono font-bold text-xs text-[#6C4DFF] dark:text-[#2DD4BF] bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-md">
            {presetIntensity}%
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={presetIntensity}
          onChange={(e) => handleIntensityChange(Number(e.target.value))}
          disabled={!isFilterActive}
          className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF] disabled:opacity-40 disabled:cursor-not-allowed"
        />

        {/* Optional Custom Parameters for Image Processing Filters */}
        {isFilterActive &&
          isImageProcessingFilter(activePresetId) &&
          FILTER_PARAM_DEFS[activePresetId] && (
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
              {FILTER_PARAM_DEFS[activePresetId].map((paramDef) => {
                const currentVal =
                  currentFilters.presetParams?.[paramDef.key] !== undefined
                    ? currentFilters.presetParams[paramDef.key]
                    : paramDef.defaultValue;

                const updateParam = (val: any) => {
                  const updater = (prev: LayerFilters) => ({
                    ...prev,
                    presetParams: {
                      ...(prev.presetParams || {}),
                      [paramDef.key]: val,
                    },
                  });
                  if (onApplyEffect) {
                    onApplyEffect('filter', updater);
                  } else {
                    onUpdateFilters(updater);
                  }
                };

                if (paramDef.type === 'boolean') {
                  return (
                    <div key={paramDef.key} className="flex items-center justify-between text-[11px]">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {isAr ? paramDef.labelAr : paramDef.labelEn}
                      </span>
                      <input
                        type="checkbox"
                        checked={!!currentVal}
                        onChange={(e) => updateParam(e.target.checked)}
                        className="rounded border-slate-300 dark:border-slate-700 text-[#6C4DFF] focus:ring-[#6C4DFF] cursor-pointer"
                      />
                    </div>
                  );
                }

                return (
                  <div key={paramDef.key} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {isAr ? paramDef.labelAr : paramDef.labelEn}
                      </span>
                      <span className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
                        {currentVal}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={paramDef.min}
                      max={paramDef.max}
                      step={paramDef.step}
                      value={currentVal}
                      onChange={(e) => updateParam(Number(e.target.value))}
                      className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
                    />
                  </div>
                );
              })}
            </div>
          )}
      </div>

      {/* Reset Filter Button */}
      <button
        type="button"
        onClick={handleResetFilters}
        disabled={!isFilterActive}
        className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>{isAr ? 'إعادة تعيين الفلتر' : 'Reset Filter'}</span>
      </button>
    </div>
  );
};
