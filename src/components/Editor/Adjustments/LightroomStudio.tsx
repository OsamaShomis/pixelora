import React, { useState } from 'react';
import {
  Layer,
  LayerFilters,
  ToneCurves,
  HslMixer,
  ColorGrading,
  VignetteEffect,
  GrainEffect,
  SharpeningDetail,
  NoiseReductionDetail,
  ColorNoiseReductionDetail,
  BwMix,
  LensCorrections,
  GeometryTransform,
  AdjustmentMask,
  CameraProfile,
} from '../../../types';
import {
  Sun,
  Palette,
  Sparkles,
  Sliders,
  RotateCcw,
  Eye,
  Columns,
  Camera,
  Layers,
  Crop,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Wand2,
  SlidersHorizontal,
  Flame,
  Check,
} from 'lucide-react';
import { ToneCurveEditor } from './ToneCurveEditor';
import { HslMixerEditor } from './HslMixer';
import { ColorGradingWheel } from './ColorGradingWheel';
import { MaskingStudio } from './MaskingStudio';
import { BeforeAfterModal } from './BeforeAfterModal';
import {
  DEFAULT_TONE_CURVES,
  DEFAULT_HSL_MIXER,
  DEFAULT_COLOR_GRADING,
  DEFAULT_VIGNETTE,
  DEFAULT_GRAIN,
  DEFAULT_SHARPENING,
  DEFAULT_NOISE_REDUCTION,
  DEFAULT_COLOR_NOISE,
  DEFAULT_BW_MIX,
  DEFAULT_LENS_CORRECTIONS,
  DEFAULT_GEOMETRY,
  CAMERA_PROFILES,
} from '../../../data/lightroomPresets';

interface LightroomStudioProps {
  selectedLayer?: Layer;
  onUpdateFilters: (updater: (prev: LayerFilters) => LayerFilters) => void;
  language: 'ar' | 'en';
}

type AccordionSection =
  | 'profile'
  | 'light'
  | 'color'
  | 'hsl'
  | 'grading'
  | 'effects'
  | 'detail'
  | 'bw'
  | 'lens'
  | 'geometry'
  | 'masking';

export const LightroomStudio: React.FC<LightroomStudioProps> = ({
  selectedLayer,
  onUpdateFilters,
  language,
}) => {
  const isAr = language === 'ar';
  const [openSections, setOpenSections] = useState<Record<AccordionSection, boolean>>({
    profile: false,
    light: true,
    color: true,
    hsl: false,
    grading: false,
    effects: false,
    detail: false,
    bw: false,
    lens: false,
    geometry: false,
    masking: false,
  });

  const [isBeforeAfterOpen, setIsBeforeAfterOpen] = useState(false);

  if (!selectedLayer) {
    return (
      <div className="py-12 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        <Sliders className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {isAr ? 'يرجى تحديد طبقة لتطبيق تعديلات Lightroom' : 'Select a layer to adjust image settings.'}
        </p>
      </div>
    );
  }

  const filters = selectedLayer.filters || {
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

  const toggleSection = (section: AccordionSection) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Section Reset Handlers
  const resetAllAdjustments = () => {
    onUpdateFilters(() => ({
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
      sharpness: 0,
      blur: 0,
      opacity: 100,
      texture: 0,
      clarity: 0,
      dehaze: 0,
      toneCurves: DEFAULT_TONE_CURVES,
      hslMixer: DEFAULT_HSL_MIXER,
      colorGrading: DEFAULT_COLOR_GRADING,
      vignette: DEFAULT_VIGNETTE,
      grain: DEFAULT_GRAIN,
      sharpeningDetail: DEFAULT_SHARPENING,
      noiseReduction: DEFAULT_NOISE_REDUCTION,
      colorNoiseReduction: DEFAULT_COLOR_NOISE,
      bwEnabled: false,
      bwMix: DEFAULT_BW_MIX,
      lensCorrections: DEFAULT_LENS_CORRECTIONS,
      geometry: DEFAULT_GEOMETRY,
      masks: [],
      profile: 'adobe_color',
      presetFilter: 'none',
      presetIntensity: 100,
    }));
  };

  const resetLightSection = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      exposure: 0,
      brightness: 100,
      contrast: 100,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      toneCurves: DEFAULT_TONE_CURVES,
    }));
  };

  const resetColorSection = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      temperature: 0,
      tint: 0,
      vibrance: 0,
      saturation: 100,
      autoWhiteBalance: false,
    }));
  };

  const resetEffectsSection = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      texture: 0,
      clarity: 0,
      dehaze: 0,
      vignette: DEFAULT_VIGNETTE,
      grain: DEFAULT_GRAIN,
    }));
  };

  const resetDetailSection = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      sharpness: 0,
      blur: 0,
      sharpeningDetail: DEFAULT_SHARPENING,
      noiseReduction: DEFAULT_NOISE_REDUCTION,
      colorNoiseReduction: DEFAULT_COLOR_NOISE,
    }));
  };

  const resetLensSection = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      lensCorrections: DEFAULT_LENS_CORRECTIONS,
    }));
  };

  const resetGeometrySection = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      geometry: DEFAULT_GEOMETRY,
    }));
  };

  const applyAutoWhiteBalance = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      temperature: 8,
      tint: 4,
      vibrance: 12,
      autoWhiteBalance: true,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#6C4DFF]/15 via-purple-500/10 to-[#23B5D3]/15 border border-[#6C4DFF]/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#6C4DFF] text-white flex items-center justify-center shadow-md">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
              {isAr ? 'محرك تحسين الصور (Lightroom Studio)' : 'Lightroom Studio Pro'}
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {isAr ? 'تحكم متقدم بكسل تلو بكسل بدون فقدان الجودة' : 'Non-destructive 32-bit color pipeline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Before/After Modal Launcher */}
          {selectedLayer.type === 'image' && selectedLayer.source && (
            <button
              type="button"
              onClick={() => setIsBeforeAfterOpen(true)}
              className="p-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] border border-slate-200 dark:border-slate-700 text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all"
              title={isAr ? 'مقارنة قبل وبعد' : 'Before & After'}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>{isAr ? 'قبل/بعد' : 'B/A'}</span>
            </button>
          )}

          {/* Reset All */}
          <button
            type="button"
            onClick={resetAllAdjustments}
            className="p-1.5 px-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-500 border border-slate-200 dark:border-slate-700 text-[10px] font-bold flex items-center gap-1 shadow-2xs transition-all"
            title={isAr ? 'إعادة ضبط كافة التعديلات' : 'Reset All'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصفير' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* 1. CAMERA PROFILES */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('profile')}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'ملف الكاميرا الأساسي (Profile)' : 'Camera Profile'}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#6C4DFF] dark:text-[#2DD4BF]">
              {filters.profile || 'Adobe Color'}
            </span>
            {openSections.profile ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </div>
        </button>

        {openSections.profile && (
          <div className="p-3.5 pt-0 space-y-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2">
              {CAMERA_PROFILES.map((p) => {
                const isSelected = (filters.profile || 'adobe_color') === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onUpdateFilters((prev) => ({ ...prev, profile: p.id }))}
                    className={`p-2 rounded-xl border text-[10px] font-bold text-start transition-all ${
                      isSelected
                        ? 'border-[#6C4DFF] bg-[#6C4DFF]/15 text-[#6C4DFF] dark:text-[#2DD4BF]'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <p className="font-bold truncate">{isAr ? p.nameAr : p.nameEn}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. LIGHT SECTION */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('light')}
            className="flex-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>{isAr ? 'الإضاءة والسطوع (Light)' : 'Light & Exposure'}</span>
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetLightSection}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isAr ? 'إعادة ضبط الإضاءة' : 'Reset Light'}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => toggleSection('light')}
              className="p-1 text-slate-400"
            >
              {openSections.light ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.light && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            {/* Sliders Grid */}
            <div className="space-y-3 text-xs pt-2">
              {/* Exposure */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'التعريض (Exposure)' : 'Exposure'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {(filters.exposure || 0) > 0 ? `+${filters.exposure}` : filters.exposure || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.exposure || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, exposure: Number(e.target.value) }))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'التباين (Contrast)' : 'Contrast'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {filters.contrast ?? 100}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.contrast ?? 100}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, contrast: Number(e.target.value) }))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Highlights */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'المناطق الساطعة (Highlights)' : 'Highlights'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {(filters.highlights || 0) > 0 ? `+${filters.highlights}` : filters.highlights || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.highlights || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, highlights: Number(e.target.value) }))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Shadows */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'الظلال (Shadows)' : 'Shadows'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {(filters.shadows || 0) > 0 ? `+${filters.shadows}` : filters.shadows || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.shadows || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, shadows: Number(e.target.value) }))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Whites */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'الدرجات البيضاء (Whites)' : 'Whites'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {(filters.whites || 0) > 0 ? `+${filters.whites}` : filters.whites || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.whites || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, whites: Number(e.target.value) }))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Blacks */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'الدرجات السوداء (Blacks)' : 'Blacks'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {(filters.blacks || 0) > 0 ? `+${filters.blacks}` : filters.blacks || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.blacks || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, blacks: Number(e.target.value) }))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>
            </div>

            {/* Tone Curve Editor */}
            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-2">
                {isAr ? 'منحنى الإضاءة (Tone Curve - RGB & Channels)' : 'Tone Curve (Point Curve)'}
              </label>
              <ToneCurveEditor
                curves={filters.toneCurves || DEFAULT_TONE_CURVES}
                onChange={(tc) => onUpdateFilters((p) => ({ ...p, toneCurves: tc }))}
                language={language}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. COLOR & WHITE BALANCE */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('color')}
            className="flex-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-500" />
              <span>{isAr ? 'الألوان وتوازن البياض (Color & WB)' : 'Color & White Balance'}</span>
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetColorSection}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isAr ? 'إعادة ضبط الألوان' : 'Reset Color'}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => toggleSection('color')}
              className="p-1 text-slate-400"
            >
              {openSections.color ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.color && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            {/* Auto White Balance Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={applyAutoWhiteBalance}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'توازن أبيض تلقائي ذكي (Auto WB)' : 'Auto White Balance'}</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'درجة الحرارة (Temp - Blue/Yellow)' : 'Temperature'}</span>
                  <span className="font-mono text-xs font-bold text-amber-500">
                    {(filters.temperature || 0) > 0 ? `+${filters.temperature}` : filters.temperature || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.temperature || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, temperature: Number(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
              </div>

              {/* Tint */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'الصبغة (Tint - Green/Magenta)' : 'Tint'}</span>
                  <span className="font-mono text-xs font-bold text-fuchsia-500">
                    {(filters.tint || 0) > 0 ? `+${filters.tint}` : filters.tint || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.tint || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, tint: Number(e.target.value) }))}
                  className="w-full accent-fuchsia-500"
                />
              </div>

              {/* Vibrance */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'الحيوية والسطوع اللوني (Vibrance)' : 'Vibrance'}</span>
                  <span className="font-mono text-xs font-bold text-[#23B5D3]">
                    {(filters.vibrance || 0) > 0 ? `+${filters.vibrance}` : filters.vibrance || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.vibrance || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, vibrance: Number(e.target.value) }))}
                  className="w-full accent-[#23B5D3]"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'التشبع العام (Saturation)' : 'Saturation'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {filters.saturation ?? 100}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation ?? 100}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, saturation: Number(e.target.value) }))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. COLOR MIXER (HSL) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('hsl')}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <CircleDot className="w-4 h-4 text-cyan-500" />
            <span>{isAr ? 'مازج الألوان (Color Mixer - 8 Channels)' : 'Color Mixer (HSL)'}</span>
          </span>
          {openSections.hsl ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.hsl && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <HslMixerEditor
              mixer={filters.hslMixer || DEFAULT_HSL_MIXER}
              onChange={(m) => onUpdateFilters((p) => ({ ...p, hslMixer: m }))}
              language={language}
            />
          </div>
        )}
      </div>

      {/* 5. COLOR GRADING (3-WAY WHEELS) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('grading')}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{isAr ? 'التدرج اللوني السينمائي (Color Grading)' : 'Color Grading'}</span>
          </span>
          {openSections.grading ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.grading && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <ColorGradingWheel
              grading={filters.colorGrading || DEFAULT_COLOR_GRADING}
              onChange={(cg) => onUpdateFilters((p) => ({ ...p, colorGrading: cg }))}
              language={language}
            />
          </div>
        )}
      </div>

      {/* 6. EFFECTS (Texture, Clarity, Dehaze, Vignette, Grain) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('effects')}
            className="flex-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>{isAr ? 'التأثيرات والملمس (Effects & Vignette)' : 'Effects & Texture'}</span>
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetEffectsSection}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isAr ? 'إعادة ضبط التأثيرات' : 'Reset Effects'}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => toggleSection('effects')}
              className="p-1 text-slate-400"
            >
              {openSections.effects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.effects && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="space-y-3 text-xs pt-2">
              {/* Texture */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'الملمس والتفاصيل الدقيقة (Texture)' : 'Texture'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {(filters.texture || 0) > 0 ? `+${filters.texture}` : filters.texture || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.texture || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, texture: Number(e.target.value) }))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Clarity */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'الوضوح والتباين الموضعي (Clarity)' : 'Clarity'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {(filters.clarity || 0) > 0 ? `+${filters.clarity}` : filters.clarity || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.clarity || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, clarity: Number(e.target.value) }))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Dehaze */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'إزالة الضباب والبهتان (Dehaze)' : 'Dehaze'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {(filters.dehaze || 0) > 0 ? `+${filters.dehaze}` : filters.dehaze || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.dehaze || 0}
                  onChange={(e) => onUpdateFilters((p) => ({ ...p, dehaze: Number(e.target.value) }))}
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Vignette Group */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  {isAr ? 'تأطير الظلال (Vignette)' : 'Vignette'}
                </label>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">{isAr ? 'الشدة (Amount)' : 'Amount'}</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {filters.vignette?.amount ?? 0}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={filters.vignette?.amount ?? 0}
                    onChange={(e) =>
                      onUpdateFilters((p) => ({
                        ...p,
                        vignette: { ...(p.vignette || DEFAULT_VIGNETTE), amount: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-[#6C4DFF]"
                  />
                </div>
              </div>

              {/* Film Grain Group */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  {isAr ? 'حبيبات الفيلم السينمائي (Film Grain)' : 'Film Grain'}
                </label>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">{isAr ? 'الكمية (Amount)' : 'Amount'}</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {filters.grain?.amount ?? 0}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.grain?.amount ?? 0}
                    onChange={(e) =>
                      onUpdateFilters((p) => ({
                        ...p,
                        grain: { ...(p.grain || DEFAULT_GRAIN), amount: Number(e.target.value) },
                      }))
                    }
                    className="w-full accent-[#2DD4BF]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 7. DETAIL (Sharpening & Noise Reduction) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('detail')}
            className="flex-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-500" />
              <span>{isAr ? 'التفاصيل وتقليل الضوضاء (Detail & Sharpening)' : 'Detail & Sharpening'}</span>
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetDetailSection}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isAr ? 'إعادة ضبط التفاصيل' : 'Reset Detail'}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => toggleSection('detail')}
              className="p-1 text-slate-400"
            >
              {openSections.detail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.detail && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="space-y-3 text-xs pt-2">
              {/* Sharpening Amount */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'حدة الحواف (Sharpening Amount)' : 'Sharpening Amount'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {filters.sharpeningDetail?.amount ?? filters.sharpness ?? 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="150"
                  value={filters.sharpeningDetail?.amount ?? filters.sharpness ?? 0}
                  onChange={(e) =>
                    onUpdateFilters((p) => ({
                      ...p,
                      sharpness: Number(e.target.value),
                      sharpeningDetail: {
                        ...(p.sharpeningDetail || DEFAULT_SHARPENING),
                        amount: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Noise Reduction Luminance */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'تقليل تشويش الإضاءة (Luminance Noise Reduction)' : 'Noise Reduction (Luminance)'}</span>
                  <span className="font-mono text-xs font-bold text-[#23B5D3]">
                    {filters.noiseReduction?.luminance ?? 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.noiseReduction?.luminance ?? 0}
                  onChange={(e) =>
                    onUpdateFilters((p) => ({
                      ...p,
                      noiseReduction: {
                        ...(p.noiseReduction || DEFAULT_NOISE_REDUCTION),
                        luminance: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#23B5D3]"
                />
              </div>

              {/* Color Noise Reduction */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'تقليل التشويش اللوني (Color Noise Reduction)' : 'Color Noise Reduction'}</span>
                  <span className="font-mono text-xs font-bold text-[#2DD4BF]">
                    {filters.colorNoiseReduction?.amount ?? 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.colorNoiseReduction?.amount ?? 0}
                  onChange={(e) =>
                    onUpdateFilters((p) => ({
                      ...p,
                      colorNoiseReduction: {
                        ...(p.colorNoiseReduction || DEFAULT_COLOR_NOISE),
                        amount: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#2DD4BF]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 8. BLACK & WHITE MIX */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('bw')}
            className="flex-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-gradient-to-r from-black to-white border border-slate-300 dark:border-slate-600 inline-block" />
              <span>{isAr ? 'الأبيض والأسود المتقدم (B&W Channel Mix)' : 'Black & White Mix'}</span>
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            {/* Enable/Disable B&W Toggle */}
            <button
              type="button"
              onClick={() => onUpdateFilters((p) => ({ ...p, bwEnabled: !p.bwEnabled }))}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                filters.bwEnabled
                  ? 'border-[#6C4DFF] bg-[#6C4DFF] text-white'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              {filters.bwEnabled ? (isAr ? 'مفعل' : 'ON') : (isAr ? 'معطل' : 'OFF')}
            </button>
            <button
              type="button"
              onClick={() => toggleSection('bw')}
              className="p-1 text-slate-400"
            >
              {openSections.bw ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.bw && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="space-y-3 text-xs pt-2">
              {(
                [
                  { id: 'red', nameAr: 'الأحمر', color: '#ef4444' },
                  { id: 'orange', nameAr: 'البرتقالي', color: '#f97316' },
                  { id: 'yellow', nameAr: 'الأصفر', color: '#eab308' },
                  { id: 'green', nameAr: 'الأخضر', color: '#22c55e' },
                  { id: 'aqua', nameAr: 'السماوي', color: '#06b6d4' },
                  { id: 'blue', nameAr: 'الأزرق', color: '#3b82f6' },
                  { id: 'purple', nameAr: 'البنفسجي', color: '#a855f7' },
                  { id: 'magenta', nameAr: 'الماجنتا', color: '#ec4899' },
                ] as const
              ).map((ch) => {
                const bwMix = filters.bwMix || DEFAULT_BW_MIX;
                const val = bwMix[ch.id] ?? 50;
                return (
                  <div key={ch.id} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
                        <span>{isAr ? ch.nameAr : ch.id.toUpperCase()}</span>
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{val}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={val}
                      disabled={!filters.bwEnabled}
                      onChange={(e) =>
                        onUpdateFilters((p) => ({
                          ...p,
                          bwMix: { ...(p.bwMix || DEFAULT_BW_MIX), [ch.id]: Number(e.target.value) },
                        }))
                      }
                      className="w-full accent-slate-800 dark:accent-slate-200 disabled:opacity-40"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 9. LENS CORRECTIONS */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('lens')}
            className="flex-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-purple-500" />
              <span>{isAr ? 'تصحيح العدسة (Lens Corrections)' : 'Lens Corrections'}</span>
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetLensSection}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isAr ? 'إعادة ضبط العدسة' : 'Reset Lens'}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => toggleSection('lens')}
              className="p-1 text-slate-400"
            >
              {openSections.lens ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.lens && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="space-y-3 text-xs pt-2">
              {/* Chromatic Aberration Toggle */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'إزالة الانحراف اللوني (Remove Chromatic Aberration)' : 'Remove Chromatic Aberration'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateFilters((p) => ({
                      ...p,
                      lensCorrections: {
                        ...(p.lensCorrections || DEFAULT_LENS_CORRECTIONS),
                        chromaticAberration: !p.lensCorrections?.chromaticAberration,
                      },
                    }))
                  }
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    filters.lensCorrections?.chromaticAberration
                      ? 'bg-[#6C4DFF] text-white border-[#6C4DFF]'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {filters.lensCorrections?.chromaticAberration && <Check className="w-3 h-3" />}
                </button>
              </div>

              {/* Distortion */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'تشوه العدسة (Distortion)' : 'Distortion'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {filters.lensCorrections?.distortion || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.lensCorrections?.distortion || 0}
                  onChange={(e) =>
                    onUpdateFilters((p) => ({
                      ...p,
                      lensCorrections: {
                        ...(p.lensCorrections || DEFAULT_LENS_CORRECTIONS),
                        distortion: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Lens Vignette */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'تعويض إضاءة الأطراف (Lens Vignetting)' : 'Lens Vignetting'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {filters.lensCorrections?.vignette || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.lensCorrections?.vignette || 0}
                  onChange={(e) =>
                    onUpdateFilters((p) => ({
                      ...p,
                      lensCorrections: {
                        ...(p.lensCorrections || DEFAULT_LENS_CORRECTIONS),
                        vignette: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#6C4DFF]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 10. GEOMETRY & PERSPECTIVE TRANSFORM */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <button
            type="button"
            onClick={() => toggleSection('geometry')}
            className="flex-1 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200"
          >
            <span className="flex items-center gap-2">
              <Crop className="w-4 h-4 text-teal-500" />
              <span>{isAr ? 'الهندسة والمنظور (Geometry & Perspective)' : 'Geometry & Transform'}</span>
            </span>
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={resetGeometrySection}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              title={isAr ? 'إعادة ضبط المنظور' : 'Reset Geometry'}
            >
              <RotateCcw className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => toggleSection('geometry')}
              className="p-1 text-slate-400"
            >
              {openSections.geometry ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {openSections.geometry && (
          <div className="p-3.5 pt-0 space-y-3.5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="space-y-3 text-xs pt-2">
              {/* Vertical Perspective */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'المنظور الرأسي (Vertical)' : 'Vertical Perspective'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {filters.geometry?.perspectiveVertical || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.geometry?.perspectiveVertical || 0}
                  onChange={(e) =>
                    onUpdateFilters((p) => ({
                      ...p,
                      geometry: {
                        ...(p.geometry || DEFAULT_GEOMETRY),
                        perspectiveVertical: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Horizontal Perspective */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'المنظور الأفقي (Horizontal)' : 'Horizontal Perspective'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {filters.geometry?.perspectiveHorizontal || 0}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={filters.geometry?.perspectiveHorizontal || 0}
                  onChange={(e) =>
                    onUpdateFilters((p) => ({
                      ...p,
                      geometry: {
                        ...(p.geometry || DEFAULT_GEOMETRY),
                        perspectiveHorizontal: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#6C4DFF]"
                />
              </div>

              {/* Rotate */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300">
                  <span>{isAr ? 'ضبط زاوية الاستقامة (Rotate / Straighten)' : 'Straighten Angle'}</span>
                  <span className="font-mono text-xs font-bold text-[#6C4DFF]">
                    {filters.geometry?.rotate || 0}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={filters.geometry?.rotate || 0}
                  onChange={(e) =>
                    onUpdateFilters((p) => ({
                      ...p,
                      geometry: {
                        ...(p.geometry || DEFAULT_GEOMETRY),
                        rotate: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-[#6C4DFF]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 11. MASKING (LOCAL ADJUSTMENTS) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('masking')}
          className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-pink-500" />
            <span>{isAr ? 'الأقنعة والتعديل الموضعي (Masking)' : 'Masking Studio'}</span>
          </span>
          {openSections.masking ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {openSections.masking && (
          <div className="p-3.5 pt-0 border-t border-slate-100 dark:border-slate-800/80 pt-2">
            <MaskingStudio
              masks={filters.masks || []}
              onChange={(m) => onUpdateFilters((p) => ({ ...p, masks: m }))}
              language={language}
            />
          </div>
        )}
      </div>

      {/* Before / After Full Comparison Modal */}
      {isBeforeAfterOpen && selectedLayer && (
        <BeforeAfterModal
          isOpen={isBeforeAfterOpen}
          onClose={() => setIsBeforeAfterOpen(false)}
          selectedLayer={selectedLayer}
          language={language}
        />
      )}
    </div>
  );
};
