import React from 'react';
import {
  Paintbrush,
  Sparkles,
  Circle,
  Square,
  Feather,
  PenTool,
  Trash2,
  Undo,
  RotateCcw,
  Palette,
  Sliders,
  Flame,
  Heart,
  Star,
  Zap,
  Droplet,
  CloudRain,
} from 'lucide-react';
import { BrushConfig, BrushType } from '../../types';

interface BrushInspectorProps {
  brushConfig: BrushConfig;
  setBrushConfig: React.Dispatch<React.SetStateAction<BrushConfig>>;
  onClearDrawingLayer?: () => void;
  onUndo?: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
}

export const BRUSH_PALETTE = [
  '#6C4DFF', // Primary Purple
  '#23B5D3', // Bright Cyan
  '#2DD4BF', // Mint
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#172033', // Dark Slate
  '#FFFFFF', // White
  '#64748B', // Gray
  '#000000', // Black
];

export const BRUSH_PRESETS: {
  id: BrushType;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultHardness: number;
  defaultOpacity: number;
}[] = [
  {
    id: 'soft',
    nameAr: 'فرشاة ناعمة',
    nameEn: 'Soft Brush',
    descAr: 'حواف ريشية ناعمة ومتدرجة',
    descEn: 'Feathered soft edges',
    icon: Feather,
    defaultHardness: 0.2,
    defaultOpacity: 0.85,
  },
  {
    id: 'hard',
    nameAr: 'فرشاة صلبة',
    nameEn: 'Hard Brush',
    descAr: 'حواف حادة ونقية 100%',
    descEn: '100% crisp solid stroke',
    icon: Paintbrush,
    defaultHardness: 1.0,
    defaultOpacity: 1.0,
  },
  {
    id: 'round',
    nameAr: 'فرشاة دائرية',
    nameEn: 'Round Brush',
    descAr: 'فرشاة دائرية متوازنة كلاسيكية',
    descEn: 'Classic balanced round tip',
    icon: Circle,
    defaultHardness: 0.7,
    defaultOpacity: 1.0,
  },
  {
    id: 'pencil',
    nameAr: 'قلم رصاص',
    nameEn: 'Pencil',
    descAr: 'خط دقيق ورفيع للرسم والتخطيط',
    descEn: 'Fine crisp drafting pencil',
    icon: PenTool,
    defaultHardness: 0.95,
    defaultOpacity: 0.9,
  },
  {
    id: 'ink',
    nameAr: 'فرشاة حبر',
    nameEn: 'Ink & Calligraphy',
    descAr: 'حبر انسيابي كاليغرافي عربي',
    descEn: 'Smooth calligraphy stroke',
    icon: Droplet,
    defaultHardness: 0.85,
    defaultOpacity: 1.0,
  },
  {
    id: 'airbrush',
    nameAr: 'فرشاة ضبابية (هوائية)',
    nameEn: 'Soft Airbrush',
    descAr: 'توهج وضبابية هوائية ناعمة',
    descEn: 'Airbrush spray & aura glow',
    icon: CloudRain,
    defaultHardness: 0.05,
    defaultOpacity: 0.45,
  },
  {
    id: 'stars',
    nameAr: 'فرشاة نجوم إبداعية',
    nameEn: 'Stars Brush',
    descAr: 'ترسم مساراً من النجوم المتلألئة',
    descEn: 'Glittering stars trail',
    icon: Star,
    defaultHardness: 0.8,
    defaultOpacity: 0.95,
  },
  {
    id: 'hearts',
    nameAr: 'فرشاة قلوب إبداعية',
    nameEn: 'Hearts Brush',
    descAr: 'ترسم مساراً من القلوب الزخرفية',
    descEn: 'Decorative floating hearts',
    icon: Heart,
    defaultHardness: 0.8,
    defaultOpacity: 0.95,
  },
  {
    id: 'spray',
    nameAr: 'فرشاة رذاذ وبريق',
    nameEn: 'Sparkle & Spray',
    descAr: 'رذاذ نقاط وبريق ساحر',
    descEn: 'Magic sparkles & fine dots',
    icon: Sparkles,
    defaultHardness: 0.6,
    defaultOpacity: 0.85,
  },
];

export const BrushInspector: React.FC<BrushInspectorProps> = ({
  brushConfig,
  setBrushConfig,
  onClearDrawingLayer,
  onUndo,
  language,
  darkMode,
}) => {
  const isAr = language === 'ar';

  const selectBrushPreset = (preset: (typeof BRUSH_PRESETS)[0]) => {
    setBrushConfig((prev) => ({
      ...prev,
      brushType: preset.id,
      hardness: preset.defaultHardness,
      opacity: preset.defaultOpacity,
      tool: 'brush',
    }));
  };

  return (
    <div className="space-y-4 text-xs select-none">
      {/* 1. Header with Tools & Clear */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <Paintbrush className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
          <span>{isAr ? 'أداة الفرشاة المتطورة' : 'Pro Brush Studio'}</span>
        </div>

        <div className="flex items-center gap-1">
          {onUndo && (
            <button
              onClick={onUndo}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isAr ? 'تراجع عن آخر رسمة' : 'Undo Last Stroke'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          {onClearDrawingLayer && (
            <button
              onClick={onClearDrawingLayer}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title={isAr ? 'مسح كل الرسومات في الطبقة' : 'Clear All Drawings'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Brush Types Selector (Grid of Presets) */}
      <div className="space-y-2">
        <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>{isAr ? 'نوع الفرشاة والرسم' : 'Brush Type & Style'}</span>
          <span className="text-[10px] text-[#6C4DFF] dark:text-[#2DD4BF] font-mono font-bold">
            {BRUSH_PRESETS.find((b) => b.id === (brushConfig.brushType || 'soft'))?.nameAr || ''}
          </span>
        </label>

        <div className="grid grid-cols-3 gap-1.5">
          {BRUSH_PRESETS.map((preset) => {
            const Icon = preset.icon;
            const isSelected = (brushConfig.brushType || 'soft') === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => selectBrushPreset(preset)}
                className={`p-2 rounded-xl flex flex-col items-center gap-1 text-center transition-all ${
                  isSelected
                    ? 'bg-[#6C4DFF] text-white shadow-xs scale-[1.02] ring-2 ring-[#6C4DFF]/30'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-purple-300 dark:hover:border-slate-600 hover:bg-purple-50/50 dark:hover:bg-slate-700/50'
                }`}
                title={isAr ? preset.descAr : preset.descEn}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#6C4DFF] dark:text-[#2DD4BF]'}`} />
                <span className="text-[11px] font-bold leading-tight truncate w-full">
                  {isAr ? preset.nameAr : preset.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Live Stroke Preview Box */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
        <span className="text-[10px] font-bold text-slate-400">
          {isAr ? 'معاينة حية لضربة الفرشاة' : 'Live Stroke Preview'}
        </span>
        <div className="w-full h-12 bg-white dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-center overflow-hidden relative shadow-inner">
          <div
            style={{
              width: `${Math.min(220, Math.max(20, brushConfig.size * 2))}px`,
              height: `${Math.min(36, Math.max(4, brushConfig.size))}px`,
              backgroundColor: brushConfig.color,
              opacity: brushConfig.opacity,
              borderRadius: brushConfig.tipShape === 'square' ? '2px' : '999px',
              filter:
                brushConfig.hardness < 0.9
                  ? `blur(${Math.max(1, (1 - brushConfig.hardness) * 6)}px)`
                  : 'none',
              boxShadow:
                brushConfig.brushType === 'airbrush'
                  ? `0 0 12px ${brushConfig.color}`
                  : 'none',
            }}
            className="transition-all duration-150"
          />
        </div>
      </div>

      {/* 4. Brush Color Selector */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'لون الفرشاة' : 'Brush Color'}</span>
          </label>
          <span className="font-mono text-xs font-bold uppercase text-slate-600 dark:text-slate-300">
            {brushConfig.color}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={brushConfig.color}
            onChange={(e) => setBrushConfig((prev) => ({ ...prev, color: e.target.value }))}
            className="w-9 h-9 rounded-xl border-2 border-white dark:border-slate-700 cursor-pointer shadow-xs p-0 bg-transparent shrink-0"
          />
          <input
            type="text"
            value={brushConfig.color}
            onChange={(e) => setBrushConfig((prev) => ({ ...prev, color: e.target.value }))}
            className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 font-mono font-bold text-xs uppercase text-slate-900 dark:text-white"
          />
        </div>

        {/* Quick Palette */}
        <div className="grid grid-cols-6 gap-1.5 pt-1">
          {BRUSH_PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setBrushConfig((prev) => ({ ...prev, color: c }))}
              style={{ backgroundColor: c }}
              className={`w-full aspect-square rounded-xl border border-black/10 transition-transform hover:scale-110 ${
                brushConfig.color.toLowerCase() === c.toLowerCase()
                  ? 'ring-2 ring-[#6C4DFF] ring-offset-2 scale-105'
                  : ''
              }`}
            />
          ))}
        </div>
      </div>

      {/* 5. Brush Size */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'حجم الفرشاة (Size)' : 'Brush Size'}
          </label>
          <span className="font-mono text-xs font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
            {brushConfig.size}px
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="200"
          value={brushConfig.size}
          onChange={(e) =>
            setBrushConfig((prev) => ({ ...prev, size: Number(e.target.value) }))
          }
          className="w-full accent-[#6C4DFF] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />

        {/* Quick size pills */}
        <div className="flex items-center justify-between gap-1 pt-1">
          {[2, 8, 16, 32, 64, 120].map((sz) => (
            <button
              key={sz}
              onClick={() => setBrushConfig((prev) => ({ ...prev, size: sz }))}
              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                brushConfig.size === sz
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-purple-50'
              }`}
            >
              {sz}px
            </button>
          ))}
        </div>
      </div>

      {/* 6. Opacity & Hardness Sliders */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
        {/* Opacity */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'شفافية الفرشاة (Opacity)' : 'Opacity'}
            </span>
            <span className="font-mono text-xs font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
              {Math.round(brushConfig.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            value={Math.round(brushConfig.opacity * 100)}
            onChange={(e) =>
              setBrushConfig((prev) => ({ ...prev, opacity: Number(e.target.value) / 100 }))
            }
            className="w-full accent-[#6C4DFF] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Hardness */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'صلابة الحواف (Hardness)' : 'Edge Hardness'}
            </span>
            <span className="font-mono text-xs font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
              {Math.round(brushConfig.hardness * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(brushConfig.hardness * 100)}
            onChange={(e) =>
              setBrushConfig((prev) => ({ ...prev, hardness: Number(e.target.value) / 100 }))
            }
            className="w-full accent-[#6C4DFF] h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Tip Shape */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'شكل رأس الفرشاة' : 'Tip Shape'}
          </span>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setBrushConfig((prev) => ({ ...prev, tipShape: 'round' }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                brushConfig.tipShape === 'round'
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Circle className="w-3 h-3" />
              <span>{isAr ? 'دائري' : 'Round'}</span>
            </button>
            <button
              onClick={() => setBrushConfig((prev) => ({ ...prev, tipShape: 'square' }))}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                brushConfig.tipShape === 'square'
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Square className="w-3 h-3" />
              <span>{isAr ? 'مربع' : 'Square'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
