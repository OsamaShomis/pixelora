import React, { useState } from 'react';
import { HslMixer, HslChannelColor } from '../../../types';
import { RotateCcw, Sliders, Palette } from 'lucide-react';
import { DEFAULT_HSL_MIXER } from '../../../data/lightroomPresets';

interface HslMixerProps {
  mixer?: HslMixer;
  value?: HslMixer;
  onChange: (mixer: HslMixer) => void;
  language: 'ar' | 'en';
}

interface ChannelDef {
  id: HslChannelColor;
  nameAr: string;
  nameEn: string;
  color: string;
  hueShiftGradients: {
    min: string;
    center: string;
    max: string;
  };
}

const CHANNELS: ChannelDef[] = [
  {
    id: 'red',
    nameAr: 'أحمر',
    nameEn: 'Red',
    color: '#ef4444',
    hueShiftGradients: { min: '#ec4899', center: '#ef4444', max: '#f97316' },
  },
  {
    id: 'orange',
    nameAr: 'برتقالي',
    nameEn: 'Orange',
    color: '#f97316',
    hueShiftGradients: { min: '#ef4444', center: '#f97316', max: '#eab308' },
  },
  {
    id: 'yellow',
    nameAr: 'أصفر',
    nameEn: 'Yellow',
    color: '#eab308',
    hueShiftGradients: { min: '#f97316', center: '#eab308', max: '#22c55e' },
  },
  {
    id: 'green',
    nameAr: 'أخضر',
    nameEn: 'Green',
    color: '#22c55e',
    hueShiftGradients: { min: '#eab308', center: '#22c55e', max: '#06b6d4' },
  },
  {
    id: 'aqua',
    nameAr: 'سماوي',
    nameEn: 'Cyan',
    color: '#06b6d4',
    hueShiftGradients: { min: '#22c55e', center: '#06b6d4', max: '#3b82f6' },
  },
  {
    id: 'blue',
    nameAr: 'أزرق',
    nameEn: 'Blue',
    color: '#3b82f6',
    hueShiftGradients: { min: '#06b6d4', center: '#3b82f6', max: '#a855f7' },
  },
  {
    id: 'purple',
    nameAr: 'بنفسجي',
    nameEn: 'Purple',
    color: '#a855f7',
    hueShiftGradients: { min: '#3b82f6', center: '#a855f7', max: '#ec4899' },
  },
  {
    id: 'magenta',
    nameAr: 'ماجنتا',
    nameEn: 'Magenta',
    color: '#ec4899',
    hueShiftGradients: { min: '#a855f7', center: '#ec4899', max: '#ef4444' },
  },
];

type HslViewMode = 'color' | 'all';
type HslAttribute = 'hue' | 'saturation' | 'luminance';

export const HslMixerEditor: React.FC<HslMixerProps> = ({
  mixer,
  value,
  onChange,
  language,
}) => {
  const isAr = language === 'ar';
  const actualMixer = mixer || value || DEFAULT_HSL_MIXER;
  const [selectedChannel, setSelectedChannel] = useState<HslChannelColor>('red');
  const [viewMode, setViewMode] = useState<HslViewMode>('color');
  const [activeAttribute, setActiveAttribute] = useState<HslAttribute>('saturation');

  const currentValues = actualMixer[selectedChannel] || { hue: 0, saturation: 0, luminance: 0 };

  const clampValue = (val: number) => {
    if (!Number.isFinite(val)) return 0;
    return Math.max(-100, Math.min(100, Math.round(val)));
  };

  const updateChannelValue = (
    channel: HslChannelColor,
    key: 'hue' | 'saturation' | 'luminance',
    val: number
  ) => {
    const channelData = actualMixer[channel] || { hue: 0, saturation: 0, luminance: 0 };
    onChange({
      ...actualMixer,
      [channel]: {
        ...channelData,
        [key]: clampValue(val),
      },
    });
  };

  const handleResetChannel = (channel: HslChannelColor) => {
    onChange({
      ...actualMixer,
      [channel]: { hue: 0, saturation: 0, luminance: 0 },
    });
  };

  const handleResetAllHsl = () => {
    onChange(DEFAULT_HSL_MIXER);
  };

  const hasAnyAdjustments = CHANNELS.some((ch) => {
    const val = actualMixer[ch.id];
    return val && (val.hue !== 0 || val.saturation !== 0 || val.luminance !== 0);
  });

  const selectedChannelInfo = CHANNELS.find((c) => c.id === selectedChannel)!;
  const isCurrentChannelModified =
    currentValues.hue !== 0 || currentValues.saturation !== 0 || currentValues.luminance !== 0;

  return (
    <div className="space-y-3.5 bg-slate-50 dark:bg-slate-900/70 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200">
      {/* Header with Title, Mode Toggles, and Reset All */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {isAr ? 'محرر HSL للألوان' : 'HSL Color Mixer'}
          </span>
          {hasAnyAdjustments && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DFF] dark:bg-[#2DD4BF]" />
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: By Color vs All Colors */}
          <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-slate-800 rounded-lg text-[10px] font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('color')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                viewMode === 'color'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? 'حسب اللون' : 'Color'}
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-2 py-0.5 rounded-md transition-all ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? 'كل القنوات' : 'All'}
            </button>
          </div>

          {/* Reset All */}
          <button
            type="button"
            onClick={handleResetAllHsl}
            disabled={!hasAnyAdjustments}
            className="text-[10px] font-bold text-slate-500 hover:text-[#6C4DFF] dark:text-slate-400 dark:hover:text-[#2DD4BF] disabled:opacity-40 disabled:hover:text-slate-500 transition-colors flex items-center gap-1"
            title={isAr ? 'إعادة ضبط جميع قنوات HSL' : 'Reset all HSL adjustments'}
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">{isAr ? 'إعادة ضبط' : 'Reset All'}</span>
          </button>
        </div>
      </div>

      {/* 8 Color Selection Swatches */}
      <div className="space-y-1">
        <div className="grid grid-cols-8 gap-1 p-1 bg-slate-200/60 dark:bg-slate-950/60 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
          {CHANNELS.map((ch) => {
            const isSelected = selectedChannel === ch.id;
            const chVal = actualMixer[ch.id];
            const hasChanges =
              chVal &&
              (chVal.hue !== 0 || chVal.saturation !== 0 || chVal.luminance !== 0);

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setSelectedChannel(ch.id);
                  if (viewMode === 'all') {
                    setViewMode('color');
                  }
                }}
                className={`py-1.5 px-0.5 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                  isSelected && viewMode === 'color'
                    ? 'bg-white dark:bg-slate-800 shadow-xs ring-2 ring-[#6C4DFF] dark:ring-[#2DD4BF] scale-102'
                    : 'hover:bg-white/60 dark:hover:bg-slate-800/60 opacity-85 hover:opacity-100'
                }`}
                title={`${isAr ? ch.nameAr : ch.nameEn} (${ch.id})`}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full shadow-2xs relative shrink-0"
                  style={{ backgroundColor: ch.color }}
                >
                  {hasChanges && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white ring-1 ring-white dark:ring-slate-900" />
                  )}
                </div>
                <span className="text-[8.5px] font-bold truncate max-w-full text-slate-700 dark:text-slate-300">
                  {isAr ? ch.nameAr : ch.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW 1: BY INDIVIDUAL COLOR (Hue, Saturation, Lightness) */}
      {viewMode === 'color' && (
        <div className="space-y-3 pt-1 border-t border-slate-200/80 dark:border-slate-800">
          {/* Active Channel Header & Reset for this channel */}
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full shadow-2xs"
                style={{ backgroundColor: selectedChannelInfo.color }}
              />
              <span className="text-slate-900 dark:text-slate-100">
                {isAr ? selectedChannelInfo.nameAr : selectedChannelInfo.nameEn}
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">
                ({isAr ? 'نطاق الألوان' : 'Color Range'})
              </span>
            </div>

            {isCurrentChannelModified && (
              <button
                type="button"
                onClick={() => handleResetChannel(selectedChannel)}
                className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>
                  {isAr ? `إعادة ضبط ${selectedChannelInfo.nameAr}` : `Reset ${selectedChannelInfo.nameEn}`}
                </span>
              </button>
            )}
          </div>

          {/* 1. HUE SLIDER */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                {isAr ? 'تدرج اللون (Hue)' : 'Hue'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateChannelValue(selectedChannel, 'hue', 0)}
                  className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-[#6C4DFF]/20 transition-colors"
                  title={isAr ? 'انقر لإعادة الضبط إلى 0' : 'Click to reset to 0'}
                >
                  {currentValues.hue > 0 ? `+${currentValues.hue}` : currentValues.hue}
                </button>
              </div>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="-100"
                max="100"
                value={currentValues.hue}
                onChange={(e) =>
                  updateChannelValue(selectedChannel, 'hue', Number(e.target.value))
                }
                style={{
                  background: `linear-gradient(to right, ${selectedChannelInfo.hueShiftGradients.min}, ${selectedChannelInfo.hueShiftGradients.center}, ${selectedChannelInfo.hueShiftGradients.max})`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer shadow-inner"
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-600 dark:text-slate-400 font-mono">
              <span>-100</span>
              <span>0</span>
              <span>+100</span>
            </div>
          </div>

          {/* 2. SATURATION SLIDER */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                {isAr ? 'التشبع (Saturation)' : 'Saturation'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateChannelValue(selectedChannel, 'saturation', 0)}
                  className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-[#23B5D3]/20 transition-colors"
                  title={isAr ? 'انقر لإعادة الضبط إلى 0' : 'Click to reset to 0'}
                >
                  {currentValues.saturation > 0
                    ? `+${currentValues.saturation}`
                    : currentValues.saturation}
                </button>
              </div>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="-100"
                max="100"
                value={currentValues.saturation}
                onChange={(e) =>
                  updateChannelValue(selectedChannel, 'saturation', Number(e.target.value))
                }
                style={{
                  background: `linear-gradient(to right, #6b7280, ${selectedChannelInfo.color})`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer shadow-inner"
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-600 dark:text-slate-400 font-mono">
              <span>-100</span>
              <span>0</span>
              <span>+100</span>
            </div>
          </div>

          {/* 3. LIGHTNESS / LUMINANCE SLIDER */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold">
              <span className="text-slate-700 dark:text-slate-300">
                {isAr ? 'الإضاءة والنصوع (Lightness)' : 'Lightness'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateChannelValue(selectedChannel, 'luminance', 0)}
                  className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-[#2DD4BF]/20 transition-colors"
                  title={isAr ? 'انقر لإعادة الضبط إلى 0' : 'Click to reset to 0'}
                >
                  {currentValues.luminance > 0
                    ? `+${currentValues.luminance}`
                    : currentValues.luminance}
                </button>
              </div>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="-100"
                max="100"
                value={currentValues.luminance}
                onChange={(e) =>
                  updateChannelValue(selectedChannel, 'luminance', Number(e.target.value))
                }
                style={{
                  background: `linear-gradient(to right, #1e293b, ${selectedChannelInfo.color}, #f8fafc)`,
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer shadow-inner"
              />
            </div>
            <div className="flex justify-between text-[9px] text-slate-600 dark:text-slate-400 font-mono">
              <span>-100</span>
              <span>0</span>
              <span>+100</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ALL COLORS PER ATTRIBUTE (Hue | Saturation | Lightness) */}
      {viewMode === 'all' && (
        <div className="space-y-2.5 pt-1 border-t border-slate-200/80 dark:border-slate-800">
          {/* Subtabs for Hue, Saturation, Lightness */}
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-[10px] font-bold">
            <button
              type="button"
              onClick={() => setActiveAttribute('hue')}
              className={`py-1 rounded-md transition-all ${
                activeAttribute === 'hue'
                  ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'التدرج (Hue)' : 'Hue'}
            </button>
            <button
              type="button"
              onClick={() => setActiveAttribute('saturation')}
              className={`py-1 rounded-md transition-all ${
                activeAttribute === 'saturation'
                  ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'التشبع (Sat)' : 'Saturation'}
            </button>
            <button
              type="button"
              onClick={() => setActiveAttribute('luminance')}
              className={`py-1 rounded-md transition-all ${
                activeAttribute === 'luminance'
                  ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'النصوع (Lum)' : 'Lightness'}
            </button>
          </div>

          {/* List of 8 compact color sliders for active attribute */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {CHANNELS.map((ch) => {
              const val = (actualMixer[ch.id] || { hue: 0, saturation: 0, luminance: 0 })[
                activeAttribute
              ];

              return (
                <div key={ch.id} className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 w-16 shrink-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: ch.color }}
                    />
                    <span className="text-[10px] font-bold truncate text-slate-700 dark:text-slate-300">
                      {isAr ? ch.nameAr : ch.nameEn}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={val}
                    onChange={(e) =>
                      updateChannelValue(ch.id, activeAttribute, Number(e.target.value))
                    }
                    className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF]"
                  />

                  <button
                    type="button"
                    onClick={() => updateChannelValue(ch.id, activeAttribute, 0)}
                    className="w-9 font-mono text-[10px] font-bold text-end text-slate-700 dark:text-slate-300 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF]"
                    title={isAr ? 'إعادة ضبط' : 'Reset'}
                  >
                    {val > 0 ? `+${val}` : val}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
