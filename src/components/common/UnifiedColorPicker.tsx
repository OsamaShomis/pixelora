import React, { useState, useEffect } from 'react';
import { Pipette, Plus, Trash2, RotateCw } from 'lucide-react';
import { TextGradient, GradientColorStop } from '../../types';

export const CURATED_COLOR_SWATCHES = [
  '#000000', '#1E293B', '#475569', '#94A3B8', '#E2E8F0', '#FFFFFF',
  '#6C4DFF', '#8B5CF6', '#A855F7', '#EC4899', '#F43F5E', '#EF4444',
  '#F97316', '#F59E0B', '#10B981', '#14B8A6', '#06B6D4', '#23B5D3',
  '#3B82F6', '#2563EB', '#1D4ED8', '#4338CA', '#2DD4BF', '#84CC16'
];

export const POPULAR_GRADIENTS = [
  { name: 'Purple Cyan', angle: 135, from: '#6C4DFF', to: '#23B5D3' },
  { name: 'Sunset Glow', angle: 45, from: '#F43F5E', to: '#F59E0B' },
  { name: 'Emerald Wave', angle: 90, from: '#10B981', to: '#06B6D4' },
  { name: 'Royal Indigo', angle: 160, from: '#4338CA', to: '#EC4899' },
  { name: 'Ocean Depths', angle: 180, from: '#1D4ED8', to: '#2DD4BF' },
  { name: 'Amber Fire', angle: 60, from: '#F97316', to: '#EF4444' },
  { name: 'Twilight Dark', angle: 135, from: '#1E1B4B', to: '#312E81' },
  { name: 'Silver Frost', angle: 45, from: '#94A3B8', to: '#E2E8F0' },
];

export interface UnifiedColorPickerProps {
  color: string;
  onChangeColor: (color: string) => void;
  supportGradient?: boolean;
  gradient?: TextGradient;
  onChangeGradient?: (gradient: TextGradient) => void;
  recentColors?: string[];
  onSelectRecentColor?: (color: string) => void;
  isEyedropperActive?: boolean;
  onTriggerEyedropper?: () => void;
  language?: 'ar' | 'en';
  label?: string;
  className?: string;
}

export const UnifiedColorPicker: React.FC<UnifiedColorPickerProps> = ({
  color,
  onChangeColor,
  supportGradient = false,
  gradient,
  onChangeGradient,
  recentColors = [],
  onSelectRecentColor,
  isEyedropperActive = false,
  onTriggerEyedropper,
  language = 'ar',
  label,
  className = '',
}) => {
  const isAr = language === 'ar';
  const isGradientMode = supportGradient && gradient?.enabled;
  const [hexInput, setHexInput] = useState(color || '#6C4DFF');
  const [activeStopIndex, setActiveStopIndex] = useState<number>(0);

  // Synchronize internal hex input when color prop changes
  useEffect(() => {
    if (color) {
      setHexInput(color.toUpperCase());
    }
  }, [color]);

  // Handle direct hex typing with normalization and validation
  const handleHexChange = (value: string) => {
    setHexInput(value);
    const cleaned = value.trim().replace(/^#/, '');
    if (/^[0-9A-Fa-f]{6}$/.test(cleaned) || /^[0-9A-Fa-f]{3}$/.test(cleaned)) {
      const fullHex = `#${cleaned}`;
      onChangeColor(fullHex);
    }
  };

  const handleHexBlur = () => {
    const cleaned = hexInput.trim().replace(/^#/, '');
    if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
      const valid = `#${cleaned.toUpperCase()}`;
      setHexInput(valid);
      onChangeColor(valid);
    } else if (/^[0-9A-Fa-f]{3}$/.test(cleaned)) {
      const expanded = `#${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`.toUpperCase();
      setHexInput(expanded);
      onChangeColor(expanded);
    } else {
      // Revert to valid prop
      setHexInput(color ? color.toUpperCase() : '#6C4DFF');
    }
  };

  // Gradient helpers
  const currentStops: GradientColorStop[] =
    gradient?.stops && gradient.stops.length >= 2
      ? gradient.stops
      : [
          { color: gradient?.from || '#6C4DFF', offset: 0 },
          { color: gradient?.to || '#23B5D3', offset: 1 },
        ];

  const updateGradientStops = (newStops: GradientColorStop[]) => {
    if (!onChangeGradient) return;
    const sorted = [...newStops].sort((a, b) => a.offset - b.offset);
    onChangeGradient({
      enabled: true,
      from: sorted[0]?.color || '#6C4DFF',
      to: sorted[sorted.length - 1]?.color || '#23B5D3',
      angle: gradient?.angle ?? 135,
      stops: sorted,
    });
  };

  const handleAddStop = () => {
    const newOffset = 0.5;
    const newStop: GradientColorStop = {
      color: '#FFFFFF',
      offset: newOffset,
    };
    const nextStops = [...currentStops, newStop];
    updateGradientStops(nextStops);
    setActiveStopIndex(nextStops.length - 1);
  };

  const handleRemoveStop = (idx: number) => {
    if (currentStops.length <= 2) return;
    const nextStops = currentStops.filter((_, i) => i !== idx);
    updateGradientStops(nextStops);
    setActiveStopIndex(Math.max(0, idx - 1));
  };

  const handleStopColorChange = (idx: number, newColor: string) => {
    const nextStops = currentStops.map((st, i) =>
      i === idx ? { ...st, color: newColor } : st
    );
    updateGradientStops(nextStops);
  };

  const handleStopOffsetChange = (idx: number, newOffset: number) => {
    const nextStops = currentStops.map((st, i) =>
      i === idx ? { ...st, offset: Math.max(0, Math.min(1, newOffset)) } : st
    );
    updateGradientStops(nextStops);
  };

  return (
    <div className={`space-y-3 text-xs ${className}`}>
      {/* Header / Mode Selector */}
      <div className="flex items-center justify-between">
        {label && (
          <span className="font-bold text-slate-700 dark:text-slate-200">{label}</span>
        )}
        {supportGradient && onChangeGradient && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 ms-auto">
            <button
              type="button"
              onClick={() =>
                onChangeGradient({
                  enabled: false,
                  from: color || '#6C4DFF',
                  to: '#23B5D3',
                  angle: 135,
                })
              }
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                !isGradientMode
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isAr ? 'لون مصمت' : 'Solid'}
            </button>
            <button
              type="button"
              onClick={() =>
                onChangeGradient({
                  enabled: true,
                  from: gradient?.from || color || '#6C4DFF',
                  to: gradient?.to || '#23B5D3',
                  angle: gradient?.angle ?? 135,
                  stops: currentStops,
                })
              }
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ${
                isGradientMode
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {isAr ? 'تدرج لوني' : 'Gradient'}
            </button>
          </div>
        )}
      </div>

      {/* SOLID COLOR CONTROLS */}
      {!isGradientMode ? (
        <div className="space-y-3">
          {/* Main Color Picker + HEX input + Eyedropper */}
          <div className="flex items-center gap-2">
            <div className="relative shrink-0">
              <input
                type="color"
                value={color?.startsWith('#') ? color : '#6C4DFF'}
                onChange={(e) => {
                  onChangeColor(e.target.value);
                  setHexInput(e.target.value.toUpperCase());
                }}
                className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer p-0 bg-transparent shadow-xs"
                title={isAr ? 'اختر لوناً مخصصاً' : 'Choose custom color'}
              />
            </div>

            {/* Direct HEX Input with # */}
            <div className="flex-1 flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-[#6C4DFF] focus-within:border-transparent">
              <span className="text-slate-400 font-mono font-bold mr-1 text-xs">#</span>
              <input
                type="text"
                value={hexInput.replace(/^#/, '')}
                onChange={(e) => handleHexChange(e.target.value)}
                onBlur={handleHexBlur}
                maxLength={6}
                placeholder="6C4DFF"
                className="w-full bg-transparent font-mono font-bold text-xs uppercase text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>

            {/* Eyedropper Sampling Button */}
            {onTriggerEyedropper && (
              <button
                type="button"
                onClick={onTriggerEyedropper}
                className={`p-2 rounded-xl border transition-all ${
                  isEyedropperActive
                    ? 'bg-[#6C4DFF] text-white border-[#6C4DFF] animate-pulse shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
                title={isAr ? 'اقتطاف لون من لوحة العمل (القطارة)' : 'Sample color from canvas'}
              >
                <Pipette className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Curated Swatches Palette */}
          <div className="grid grid-cols-8 gap-1.5 pt-1">
            {CURATED_COLOR_SWATCHES.map((swatch) => {
              const isSelected = color?.toLowerCase() === swatch.toLowerCase();
              return (
                <button
                  key={swatch}
                  type="button"
                  onClick={() => {
                    onChangeColor(swatch);
                    setHexInput(swatch.toUpperCase());
                  }}
                  style={{ backgroundColor: swatch }}
                  className={`w-full aspect-square rounded-lg border border-black/10 dark:border-white/10 transition-transform hover:scale-115 ${
                    isSelected ? 'ring-2 ring-[#6C4DFF] ring-offset-2 scale-110 shadow-xs' : ''
                  }`}
                  title={swatch}
                />
              );
            })}
          </div>

          {/* Recent Colors List (Clickable, no duplicates) */}
          {recentColors && recentColors.length > 0 && (
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
                {isAr ? 'الألوان المستخدمة مؤخراً' : 'Recent Colors'}
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {Array.from(new Set(recentColors.filter(Boolean))).slice(0, 10).map((rc, idx) => (
                  <button
                    key={`${rc}_${idx}`}
                    type="button"
                    onClick={() => {
                      if (onSelectRecentColor) {
                        onSelectRecentColor(rc);
                      } else {
                        onChangeColor(rc);
                      }
                      setHexInput(rc.toUpperCase());
                    }}
                    style={{ backgroundColor: rc }}
                    className="w-6 h-6 rounded-lg border border-black/15 dark:border-white/15 shrink-0 transition-transform hover:scale-115 hover:shadow-xs"
                    title={rc}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* GRADIENT CONTROLS WITH MULTI-COLOR STOPS */
        <div className="space-y-3.5">
          {/* Visual Gradient Preview Strip with Color Stop Indicators */}
          <div className="space-y-1.5">
            <div
              className="w-full h-8 rounded-xl border border-slate-300 dark:border-slate-600 shadow-inner relative"
              style={{
                background: `linear-gradient(${gradient?.angle ?? 135}deg, ${currentStops
                  .map((s) => `${s.color} ${Math.round(s.offset * 100)}%`)
                  .join(', ')})`,
              }}
            />

            {/* Gradient Angle Slider */}
            <div className="flex items-center justify-between gap-3 text-xs pt-1">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <RotateCw className="w-3.5 h-3.5 text-[#6C4DFF]" />
                <span className="font-bold">{isAr ? 'زاوية التدرج:' : 'Angle:'}</span>
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-[180px]">
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="5"
                  value={gradient?.angle ?? 135}
                  onChange={(e) =>
                    onChangeGradient?.({
                      ...gradient!,
                      enabled: true,
                      angle: Number(e.target.value),
                      stops: currentStops,
                    })
                  }
                  className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <span className="font-mono font-bold text-[#6C4DFF] text-xs w-9 text-right">
                  {gradient?.angle ?? 135}°
                </span>
              </div>
            </div>
          </div>

          {/* Color Stops Controls */}
          <div className="space-y-2 pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'نقاط ألوان التدرج (Color Stops)' : 'Gradient Color Stops'}
              </span>
              <button
                type="button"
                onClick={handleAddStop}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#6C4DFF]/10 text-[#6C4DFF] dark:text-[#2DD4BF] text-[11px] font-bold hover:bg-[#6C4DFF]/20 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>{isAr ? 'إضافة نقطة' : 'Add Stop'}</span>
              </button>
            </div>

            {/* Stops List */}
            <div className="space-y-1.5">
              {currentStops.map((stop, idx) => {
                const isActive = activeStopIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveStopIndex(idx)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                      isActive
                        ? 'border-[#6C4DFF] bg-[#6C4DFF]/5 dark:bg-[#6C4DFF]/10'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <input
                      type="color"
                      value={stop.color}
                      onChange={(e) => handleStopColorChange(idx, e.target.value)}
                      className="w-7 h-7 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0 bg-transparent shrink-0"
                    />

                    {/* HEX Input for stop */}
                    <input
                      type="text"
                      value={stop.color.toUpperCase()}
                      onChange={(e) => handleStopColorChange(idx, e.target.value)}
                      maxLength={7}
                      className="w-18 p-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-transparent font-mono font-bold text-[11px] text-center uppercase"
                    />

                    {/* Offset Slider (0% - 100%) */}
                    <div className="flex-1 flex items-center gap-1.5">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={stop.offset}
                        onChange={(e) => handleStopOffsetChange(idx, Number(e.target.value))}
                        className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <span className="font-mono text-[10px] text-slate-500 w-7 text-right">
                        {Math.round(stop.offset * 100)}%
                      </span>
                    </div>

                    {/* Delete stop button (only if > 2 stops) */}
                    {currentStops.length > 2 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStop(idx);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title={isAr ? 'حذف هذه النقطة' : 'Delete stop'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Gradient Presets */}
          <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              {isAr ? 'تدرجات لونية جاهزة' : 'Gradient Presets'}
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {POPULAR_GRADIENTS.map((g, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onChangeGradient?.({
                      enabled: true,
                      from: g.from,
                      to: g.to,
                      angle: g.angle,
                      stops: [
                        { color: g.from, offset: 0 },
                        { color: g.to, offset: 1 },
                      ],
                    });
                  }}
                  style={{ background: `linear-gradient(${g.angle}deg, ${g.from}, ${g.to})` }}
                  className="h-7 rounded-xl border border-white/20 shadow-xs hover:scale-105 transition-transform"
                  title={g.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
