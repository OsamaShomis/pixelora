import React, { useState } from 'react';
import {
  Layer,
  LayerFilters,
  ToneCurves,
  HslMixer,
  ColorGrading,
  VignetteEffect,
  GrainEffect,
  EffectType,
} from '../../../types';
import {
  Sun,
  Palette,
  RotateCcw,
  Eye,
  Columns,
  Flame,
  Droplets,
  ChevronDown,
  ChevronUp,
  Wand2,
  Sliders,
  Focus,
  Film,
  SlidersHorizontal,
  Sparkles,
  Eraser,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import {
  DEFAULT_TONE_CURVES,
  DEFAULT_HSL_MIXER,
  DEFAULT_COLOR_GRADING,
  DEFAULT_GRAIN,
} from '../../../data/lightroomPresets';
import { DEFAULT_FILTERS } from '../../../data/sampleProjects';
import { getEffectTypeForField } from '../../../utils/effectLayers';
import { ToneCurveEditor } from './ToneCurveEditor';
import { HslMixerEditor } from './HslMixer';
import { ColorGradingWheel } from './ColorGradingWheel';
import { BeforeAfterModal } from './BeforeAfterModal';

interface ManualAdjustmentsPanelProps {
  selectedLayer?: Layer;
  layers?: Layer[];
  onUpdateFilters: (updater: (prev: LayerFilters) => LayerFilters) => void;
  onApplyEffect?: (effectType: EffectType, updater: (prev: LayerFilters) => LayerFilters) => void;
  onDiscardEffect?: (layerId: string) => void;
  onActivateEraser?: () => void;
  onResetEffectMask?: () => void;
  language: 'ar' | 'en';
}

export type AccordionSection =
  | 'basic'
  | 'color'
  | 'detail'
  | 'hsl'
  | 'curves'
  | 'grading'
  | 'effects';

export const ManualAdjustmentsPanel: React.FC<ManualAdjustmentsPanelProps> = ({
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
  const [isCommitted, setIsCommitted] = useState(false);

  // State for collapsible accordion sections
  const [openSections, setOpenSections] = useState<Record<AccordionSection, boolean>>({
    basic: true,
    color: false,
    detail: false,
    hsl: false,
    curves: false,
    grading: false,
    effects: false,
  });

  // Interactive Before/After modals and hold-original states
  const [showBeforeAfterModal, setShowBeforeAfterModal] = useState(false);
  const [isHoldingOriginal, setIsHoldingOriginal] = useState(false);
  const [originalFiltersBackup, setOriginalFiltersBackup] = useState<LayerFilters | null>(null);

  const toggleSection = (sec: AccordionSection) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  if (!selectedLayer) {
    return (
      <div className="py-12 px-4 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
        <SlidersHorizontal className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          {isAr ? 'لم يتم تحديد طبقة' : 'No Layer Selected'}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          {isAr
            ? 'يرجى تحديد صورة أو طبقة من اللوحة لإجراء التعديلات والتحسينات اليدوية.'
            : 'Select an image layer on the canvas to adjust lighting, colors, curves, and details.'}
        </p>
      </div>
    );
  }

  // Non-destructive architecture: If selectedLayer is an effect layer, reflect its filters;
  // if it is an image layer, display neutral baseline so moving any slider automatically spawns an Effect Layer!
  const filters: LayerFilters =
    selectedLayer.type === 'effect'
      ? selectedLayer.filters || DEFAULT_FILTERS
      : { ...DEFAULT_FILTERS };

  // Single-field updater: automatically isolates effect and creates/updates the corresponding Effect Layer
  const updateField = (key: keyof LayerFilters, val: any) => {
    setIsCommitted(false);
    const effectType = getEffectTypeForField(key);
    if (onApplyEffect) {
      onApplyEffect(effectType, (prev) => ({
        ...prev,
        [key]: val,
      }));
    } else {
      onUpdateFilters((prev) => ({
        ...prev,
        [key]: val,
      }));
    }
  };

  // Reset Adjustments ONLY: resets manual adjustments to defaults without touching presetFilter or presetIntensity!
  const handleResetAdjustments = () => {
    onUpdateFilters((prev) => ({
      ...prev,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      vibrance: 0,
      temperature: 0,
      tint: 0,
      hue: 0,
      autoWhiteBalance: false,
      sharpness: 0,
      blur: 0,
      clarity: 0,
      texture: 0,
      dehaze: 0,
      toneCurves: DEFAULT_TONE_CURVES,
      hslMixer: DEFAULT_HSL_MIXER,
      colorGrading: DEFAULT_COLOR_GRADING,
      vignette: 0,
      grain: DEFAULT_GRAIN,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      bwEnabled: false,
      // presetFilter & presetIntensity remain completely untouched!
    }));
  };

  // Hold-to-view original handlers
  const handleHoldOriginalStart = () => {
    if (isHoldingOriginal) return;
    setOriginalFiltersBackup({ ...filters });
    setIsHoldingOriginal(true);
    onUpdateFilters((prev) => ({
      ...prev,
      brightness: 100,
      contrast: 100,
      saturation: 100,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      vibrance: 0,
      temperature: 0,
      tint: 0,
      hue: 0,
      sharpness: 0,
      blur: 0,
      clarity: 0,
      texture: 0,
      dehaze: 0,
      toneCurves: DEFAULT_TONE_CURVES,
      hslMixer: DEFAULT_HSL_MIXER,
      colorGrading: DEFAULT_COLOR_GRADING,
      vignette: 0,
      grain: DEFAULT_GRAIN,
      grayscale: 0,
      sepia: 0,
      invert: 0,
      bwEnabled: false,
    }));
  };

  const handleHoldOriginalEnd = () => {
    if (!isHoldingOriginal || !originalFiltersBackup) return;
    setIsHoldingOriginal(false);
    onUpdateFilters(() => ({ ...originalFiltersBackup }));
    setOriginalFiltersBackup(null);
  };

  // Count active manual adjustments that differ from baseline
  const activeAdjustmentsCount = [
    filters.brightness !== 100,
    filters.contrast !== 100,
    filters.saturation !== 100,
    (filters.exposure ?? 0) !== 0,
    (filters.highlights ?? 0) !== 0,
    (filters.shadows ?? 0) !== 0,
    (filters.whites ?? 0) !== 0,
    (filters.blacks ?? 0) !== 0,
    (filters.vibrance ?? 0) !== 0,
    (filters.temperature ?? 0) !== 0,
    (filters.tint ?? 0) !== 0,
    (filters.hue ?? 0) !== 0,
    (filters.sharpness ?? 0) !== 0,
    (filters.blur ?? 0) !== 0,
    (filters.clarity ?? 0) !== 0,
    (filters.texture ?? 0) !== 0,
    Boolean(filters.toneCurves),
    Boolean(filters.colorGrading),
    Boolean(filters.vignette),
    Boolean(filters.grain && filters.grain.amount > 0),
    (filters.grayscale ?? 0) > 0,
    (filters.sepia ?? 0) > 0,
    (filters.invert ?? 0) > 0,
    Boolean(filters.bwEnabled),
  ].filter(Boolean).length;

  return (
    <div className="space-y-3 pb-8" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header Controls Bar */}
      <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {isAr ? 'التحسينات اليدوية' : 'Manual Adjustments'}
          </span>
          {activeAdjustmentsCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#6C4DFF]/10 dark:bg-[#2DD4BF]/10 text-[#6C4DFF] dark:text-[#2DD4BF]">
              {activeAdjustmentsCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Hold to View Original */}
          <button
            type="button"
            onMouseDown={handleHoldOriginalStart}
            onMouseUp={handleHoldOriginalEnd}
            onTouchStart={handleHoldOriginalStart}
            onTouchEnd={handleHoldOriginalEnd}
            title={isAr ? 'اضغط مطولاً للمقارنة مع الأصل' : 'Hold to view original'}
            className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
              isHoldingOriginal
                ? 'bg-amber-500 text-white border-amber-600 shadow-inner'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Before / After Split View */}
          <button
            type="button"
            onClick={() => setShowBeforeAfterModal(true)}
            title={isAr ? 'مقارنة قبل وبعد' : 'Before & After Comparison'}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>

          {/* Reset Adjustments */}
          <button
            type="button"
            onClick={handleResetAdjustments}
            disabled={activeAdjustmentsCount === 0}
            title={isAr ? 'إعادة ضبط التحسينات' : 'Reset Adjustments'}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dedicated Effect Layer Management Card (When adjusting an independent effect layer) */}
      {selectedLayer.type === 'effect' && (
        <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-100 truncate">
                {selectedLayer.name}
              </span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200 shrink-0">
              {isAr ? 'طبقة تأثير مستقلة' : 'Effect Layer'}
            </span>
          </div>

          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-snug">
            {isAr
              ? 'التعديلات هنا معزولة على طبقة مستقلة. يمكنك استخدام الممحاة الذكية لمسح هذا التأثير موضعياً دون المساس بالصورة الأساسية.'
              : 'Adjustments here are isolated on this layer. Use Smart Eraser to locally erase this effect while preserving the base image.'}
          </p>

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
                title={isAr ? 'استعادة كامل التأثير وإزالة القناع' : 'Restore full effect (clear mask)'}
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
                title={isAr ? 'حذف طبقة هذا التأثير والتراجع عنه' : 'Discard this effect layer'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'إلغاء التأثير' : 'Discard'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-amber-800/40 text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              {isAr ? 'الحالة: طبقة نشطة في الترتيب' : 'Status: Live in layer stack'}
            </span>
            <button
              type="button"
              onClick={() => setIsCommitted(true)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                isCommitted
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'bg-amber-200 hover:bg-amber-300 text-amber-800 dark:bg-amber-900 dark:hover:bg-amber-850 dark:text-amber-100'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>{isCommitted ? (isAr ? 'تم التثبيت ✓' : 'Committed ✓') : (isAr ? 'تثبيت التعديل' : 'Commit')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Accordion Container */}
      <div className="space-y-2">
        {/* 1. LIGHTING (الإضاءة) */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('basic')}
            className="w-full px-3 py-2.5 flex items-center justify-between text-start hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isAr ? 'الإضاءة والتعريض' : 'Lighting & Exposure'}
              </span>
            </div>
            {openSections.basic ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.basic && (
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              {/* Exposure */}
              <SliderControl
                label={isAr ? 'التعريض (Exposure)' : 'Exposure'}
                value={filters.exposure ?? 0}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('exposure', v)}
                unit="EV"
              />

              {/* Brightness */}
              <SliderControl
                label={isAr ? 'السطوع (Brightness)' : 'Brightness'}
                value={filters.brightness ?? 100}
                min={0}
                max={200}
                defaultValue={100}
                displayOffset={-100}
                onChange={(v) => updateField('brightness', v)}
              />

              {/* Contrast */}
              <SliderControl
                label={isAr ? 'التباين (Contrast)' : 'Contrast'}
                value={filters.contrast ?? 100}
                min={0}
                max={200}
                defaultValue={100}
                displayOffset={-100}
                onChange={(v) => updateField('contrast', v)}
              />

              {/* Highlights */}
              <SliderControl
                label={isAr ? 'الإضاءات العالية (Highlights)' : 'Highlights'}
                value={filters.highlights ?? 0}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('highlights', v)}
              />

              {/* Shadows */}
              <SliderControl
                label={isAr ? 'الظلال (Shadows)' : 'Shadows'}
                value={filters.shadows ?? 0}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('shadows', v)}
              />

              {/* Whites */}
              <SliderControl
                label={isAr ? 'الدرجات البيضاء (Whites)' : 'Whites'}
                value={filters.whites ?? 0}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('whites', v)}
              />

              {/* Blacks */}
              <SliderControl
                label={isAr ? 'الدرجات السوداء (Blacks)' : 'Blacks'}
                value={filters.blacks ?? 0}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('blacks', v)}
              />
            </div>
          )}
        </div>

        {/* 2. COLOR (الألوان) */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('color')}
            className="w-full px-3 py-2.5 flex items-center justify-between text-start hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isAr ? 'الألوان ودرجة الحرارة' : 'Colors & White Balance'}
              </span>
            </div>
            {openSections.color ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.color && (
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              {/* Smart Auto White Balance button */}
              <button
                type="button"
                onClick={() => {
                  updateField('temperature', 0);
                  updateField('tint', 0);
                  updateField('autoWhiteBalance', true);
                }}
                className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'توازن أبيض تلقائي ذكي' : 'Auto White Balance'}</span>
              </button>

              {/* Temperature (Cool Blue to Warm Amber) */}
              <SliderControl
                label={isAr ? 'درجة الحرارة (Temp)' : 'Temperature'}
                value={filters.temperature ?? 0}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('temperature', v)}
                gradientTrack="linear-gradient(to right, #38bdf8, #94a3b8, #f59e0b)"
              />

              {/* Tint (Green to Magenta) */}
              <SliderControl
                label={isAr ? 'الصبغة (Tint)' : 'Tint'}
                value={filters.tint ?? 0}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('tint', v)}
                gradientTrack="linear-gradient(to right, #4ade80, #94a3b8, #e879f9)"
              />

              {/* Saturation */}
              <SliderControl
                label={isAr ? 'التشبع (Saturation)' : 'Saturation'}
                value={filters.saturation ?? 100}
                min={0}
                max={200}
                defaultValue={100}
                displayOffset={-100}
                onChange={(v) => updateField('saturation', v)}
              />

              {/* Vibrance */}
              <SliderControl
                label={isAr ? 'الحيوية (Vibrance)' : 'Vibrance'}
                value={filters.vibrance ?? 0}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('vibrance', v)}
              />

              {/* Hue */}
              <SliderControl
                label={isAr ? 'درجة اللون (Hue Shift)' : 'Hue Shift'}
                value={filters.hue ?? 0}
                min={-180}
                max={180}
                defaultValue={0}
                unit="°"
                onChange={(v) => updateField('hue', v)}
              />
            </div>
          )}
        </div>

        {/* 3. DETAILS & SHARPNESS (التفاصيل) */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('detail')}
            className="w-full px-3 py-2.5 flex items-center justify-between text-start hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Focus className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isAr ? 'الحدة والتفاصيل والضبابية' : 'Detail, Sharpness & Blur'}
              </span>
            </div>
            {openSections.detail ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.detail && (
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              {/* Sharpness (Unsharp mask) */}
              <SliderControl
                label={isAr ? 'الحدة البصرية (Sharpness)' : 'Sharpness'}
                value={filters.sharpness ?? 0}
                min={0}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('sharpness', v)}
              />

              {/* Blur */}
              <SliderControl
                label={isAr ? 'الضبابية والتنعيم (Blur)' : 'Blur'}
                value={filters.blur ?? 0}
                min={0}
                max={50}
                defaultValue={0}
                unit="px"
                onChange={(v) => updateField('blur', v)}
              />

              {/* Clarity */}
              <SliderControl
                label={isAr ? 'الوضوح (Clarity)' : 'Clarity'}
                value={filters.clarity ?? 0}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('clarity', v)}
              />

              {/* Texture */}
              <SliderControl
                label={isAr ? 'الملمس (Texture)' : 'Texture'}
                value={filters.texture ?? 0}
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => updateField('texture', v)}
              />
            </div>
          )}
        </div>

        {/* 4. HSL MIXER (محرر HSL) */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('hsl')}
            className="w-full px-3 py-2.5 flex items-center justify-between text-start hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isAr ? 'محرر HSL (الألوان المنفصلة)' : 'HSL Color Mixer (8 Channels)'}
              </span>
            </div>
            {openSections.hsl ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.hsl && (
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <HslMixerEditor
                mixer={filters.hslMixer || DEFAULT_HSL_MIXER}
                value={filters.hslMixer || DEFAULT_HSL_MIXER}
                onChange={(newMixer) => updateField('hslMixer', newMixer)}
                language={language}
              />
            </div>
          )}
        </div>

        {/* 5. TONE CURVES (المنحنيات) */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('curves')}
            className="w-full px-3 py-2.5 flex items-center justify-between text-start hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isAr ? 'منحنيات النغمات (Tone Curves)' : 'Tone Curves (RGB)'}
              </span>
            </div>
            {openSections.curves ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.curves && (
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <ToneCurveEditor
                curves={filters.toneCurves || DEFAULT_TONE_CURVES}
                value={filters.toneCurves || DEFAULT_TONE_CURVES}
                onChange={(newCurves) => updateField('toneCurves', newCurves)}
                language={language}
              />
            </div>
          )}
        </div>

        {/* 6. COLOR GRADING (تدرج الألوان) */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('grading')}
            className="w-full px-3 py-2.5 flex items-center justify-between text-start hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isAr ? 'تدرج الألوان السينمائي' : 'Color Grading'}
              </span>
            </div>
            {openSections.grading ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.grading && (
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <ColorGradingWheel
                grading={filters.colorGrading || DEFAULT_COLOR_GRADING}
                value={filters.colorGrading || DEFAULT_COLOR_GRADING}
                onChange={(newGrading) => updateField('colorGrading', newGrading)}
                language={language}
              />
            </div>
          )}
        </div>

        {/* 7. EFFECTS (التأثيرات: Vignette, Grain, Grayscale, Sepia, Invert) */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => toggleSection('effects')}
            className="w-full px-3 py-2.5 flex items-center justify-between text-start hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-fuchsia-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {isAr ? 'التأثيرات وحبيبات الفيلم' : 'Effects & Film Grain'}
              </span>
            </div>
            {openSections.effects ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {openSections.effects && (
            <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              {/* Vignette Amount */}
              <SliderControl
                label={isAr ? 'تغميق الحواف (Vignette)' : 'Vignette'}
                value={
                  typeof filters.vignette === 'number'
                    ? filters.vignette
                    : filters.vignette?.amount || 0
                }
                min={-100}
                max={100}
                defaultValue={0}
                onChange={(v) => {
                  if (typeof filters.vignette === 'object' && filters.vignette !== null) {
                    updateField('vignette', { ...filters.vignette, amount: v });
                  } else {
                    updateField('vignette', v);
                  }
                }}
              />

              {/* Film Grain Amount */}
              <SliderControl
                label={isAr ? 'حبيبات الفيلم (Film Grain)' : 'Film Grain'}
                value={filters.grain?.amount || 0}
                min={0}
                max={100}
                defaultValue={0}
                onChange={(v) => {
                  updateField('grain', {
                    ...(filters.grain || DEFAULT_GRAIN),
                    amount: v,
                  });
                }}
              />

              {/* Grayscale */}
              <SliderControl
                label={isAr ? 'التدرج الرمادي (Grayscale)' : 'Grayscale'}
                value={filters.grayscale ?? 0}
                min={0}
                max={100}
                defaultValue={0}
                unit="%"
                onChange={(v) => updateField('grayscale', v)}
              />

              {/* Sepia */}
              <SliderControl
                label={isAr ? 'سيبيا كلاسيكي (Sepia)' : 'Sepia'}
                value={filters.sepia ?? 0}
                min={0}
                max={100}
                defaultValue={0}
                unit="%"
                onChange={(v) => updateField('sepia', v)}
              />

              {/* Invert */}
              <SliderControl
                label={isAr ? 'عكس الألوان (Invert)' : 'Invert'}
                value={filters.invert ?? 0}
                min={0}
                max={100}
                defaultValue={0}
                unit="%"
                onChange={(v) => updateField('invert', v)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Before / After Modal */}
      {showBeforeAfterModal && (
        <BeforeAfterModal
          selectedLayer={selectedLayer}
          onClose={() => setShowBeforeAfterModal(false)}
          language={language}
        />
      )}
    </div>
  );
};

// Reusable Slider Control with double-click reset and numeric indicator
interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  defaultValue: number;
  displayOffset?: number;
  unit?: string;
  gradientTrack?: string;
  onChange: (val: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  min,
  max,
  defaultValue,
  displayOffset = 0,
  unit = '',
  gradientTrack,
  onChange,
}) => {
  const displayVal = value + displayOffset;
  const isModified = value !== defaultValue;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span
          onDoubleClick={() => onChange(defaultValue)}
          className="text-slate-600 dark:text-slate-400 select-none cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
          title="انقر نقراً مزدوجاً لإعادة التعيين"
        >
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className={`font-mono font-semibold text-[11px] ${
              isModified
                ? 'text-[#6C4DFF] dark:text-[#2DD4BF]'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          >
            {displayVal > 0 && unit !== '°' ? `+${displayVal}` : displayVal}
            {unit}
          </span>
          {isModified && (
            <button
              type="button"
              onClick={() => onChange(defaultValue)}
              title="إعادة التعيين للقيمة الافتراضية"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onDoubleClick={() => onChange(defaultValue)}
        style={gradientTrack ? { background: gradientTrack } : undefined}
        className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer ${
          gradientTrack
            ? 'accent-slate-900 dark:accent-white'
            : 'bg-slate-200 dark:bg-slate-700 accent-[#6C4DFF] dark:accent-[#2DD4BF]'
        }`}
      />
    </div>
  );
};
