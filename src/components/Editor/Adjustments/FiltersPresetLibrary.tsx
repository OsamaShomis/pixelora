import React, { useState } from 'react';
import { Layer, LayerFilters } from '../../../types';
import {
  PRESET_CATEGORIES,
  LIGHTROOM_PRESETS,
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
  Sliders,
  SlidersHorizontal,
  Droplets,
  ShieldCheck,
  Focus,
  Scan,
  Shapes,
  BarChart2,
  Activity,
} from 'lucide-react';
import { isImageProcessingFilter } from '../../../utils/filterEngines';
import { getDefaultFilterParams } from '../../../data/imageProcessingFilters';

interface FiltersPresetLibraryProps {
  selectedLayer?: Layer;
  onUpdateFilters: (updater: (prev: LayerFilters) => LayerFilters) => void;
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

export const FiltersPresetLibrary: React.FC<FiltersPresetLibraryProps> = ({
  selectedLayer,
  onUpdateFilters,
  language,
}) => {
  const isAr = language === 'ar';
  const [activeCategory, setActiveCategory] = useState<PresetCategory['id']>('basic');

  if (!selectedLayer) {
    return (
      <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        <Sparkles className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {isAr ? 'يرجى تحديد طبقة لتطبيق الفلاتر والأنماط' : 'Select a layer to apply filter presets.'}
        </p>
      </div>
    );
  }

  const currentFilters = selectedLayer.filters || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    temperature: 0,
    tint: 0,
    exposure: 0,
    shadows: 0,
    highlights: 0,
    sharpness: 0,
    blur: 0,
    opacity: 100,
    presetFilter: 'none',
    presetIntensity: 100,
  };

  const activePresetId = currentFilters.presetFilter || 'none';
  const presetIntensity = currentFilters.presetIntensity ?? 100;

  const handleSelectPreset = (preset: FilterPreset) => {
    onUpdateFilters((prev) => ({
      ...prev,
      ...preset.filters,
      presetFilter: preset.id,
      presetIntensity: 100,
      presetParams: isImageProcessingFilter(preset.id)
        ? { ...(prev.presetParams || {}), ...(getDefaultFilterParams(preset.id) || {}) }
        : prev.presetParams,
    }));
  };

  const handleIntensityChange = (val: number) => {
    onUpdateFilters((prev) => ({
      ...prev,
      presetIntensity: val,
    }));
  };

  const handleResetFilters = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      temperature: 0,
      tint: 0,
      exposure: 0,
      shadows: 0,
      highlights: 0,
      whites: 0,
      blacks: 0,
      vibrance: 0,
      clarity: 0,
      texture: 0,
      dehaze: 0,
      presetFilter: 'none',
      presetIntensity: 100,
      bwEnabled: false,
    }));
  };

  const filteredPresets = LIGHTROOM_PRESETS.filter(
    (p) => p.category === activeCategory
  );

  return (
    <div className="space-y-4">
      {/* Header & Intensity Controller */}
      <div className="p-3.5 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200/80 dark:border-purple-800/40 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'مكتبة الفلاتر السينمائية والاحترافية' : 'Preset Filters Library'}</span>
          </span>
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[10px] font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isAr ? 'إعادة التعيين' : 'Reset'}</span>
          </button>
        </div>

        {/* Preset Intensity Slider */}
        <div className="space-y-1 pt-1 border-t border-purple-200/60 dark:border-purple-800/40">
          <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
            <span>{isAr ? 'شدة وتأثير الفلتر (Preset Amount)' : 'Preset Intensity'}</span>
            <span className="font-mono text-xs font-bold text-[#6C4DFF]">
              {presetIntensity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={presetIntensity}
            onChange={(e) => handleIntensityChange(Number(e.target.value))}
            className="w-full accent-[#6C4DFF]"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {PRESET_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat.id;
          const Icon = CATEGORY_ICONS[cat.iconName] || Sparkles;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold shrink-0 flex items-center gap-1.5 transition-all shadow-2xs ${
                isSelected
                  ? 'bg-[#6C4DFF] text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isAr ? cat.nameAr : cat.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* Presets Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filteredPresets.map((preset) => {
          const isSelected = activePresetId === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`p-3 rounded-2xl border text-start flex flex-col justify-between gap-2.5 transition-all shadow-2xs relative overflow-hidden group ${
                isSelected
                  ? 'border-[#6C4DFF] ring-2 ring-[#6C4DFF]/30 bg-purple-50/70 dark:bg-purple-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              {/* Color Gradient Preview Strip */}
              <div className="w-full h-12 rounded-xl bg-gradient-to-r overflow-hidden shadow-inner flex items-center justify-between p-2 relative">
                <div className={`absolute inset-0 bg-gradient-to-r ${preset.previewGradient}`} />
                {isSelected && (
                  <div className="relative z-10 w-6 h-6 rounded-full bg-white text-[#6C4DFF] flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#6C4DFF] transition-colors">
                  {isAr ? preset.nameAr : preset.nameEn}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {isAr ? preset.descriptionAr : preset.descriptionEn}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
