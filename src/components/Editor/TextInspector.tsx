import React, { useState, useMemo } from 'react';
import {
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  CaseUpper,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Sparkles,
  Palette,
  Sliders,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Layers,
  Trash2,
  Copy,
  Check,
  Plus,
  Minus,
  Move,
  Sun,
  Shield,
  Eye,
  ChevronDown,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Layer, TextConfig, TextGradient, TextShadow, TextStroke } from '../../types';
import { ALL_FONTS, FONT_CATEGORIES, FontItem } from '../../data/fonts';
import { UnifiedColorPicker } from '../common/UnifiedColorPicker';

interface TextInspectorProps {
  layer: Layer;
  onUpdateLayer: (updater: (prev: Layer) => Layer) => void;
  onDeleteLayer?: () => void;
  onDuplicateLayer?: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
  isEyedropperActive?: boolean;
  onToggleEyedropper?: (target?: 'text-color' | 'text-stroke' | 'text-shadow') => void;
  eyedropperTarget?: string | null;
  recentColors?: string[];
}

export const GRADIENT_PRESETS = [
  { name: 'بنفسجي وتركواز', from: '#6C4DFF', to: '#23B5D3', angle: 135 },
  { name: 'توهج وردي ناري', from: '#EC4899', to: '#F43F5E', angle: 90 },
  { name: 'غروب ذهبي دافئ', from: '#F59E0B', to: '#EF4444', angle: 135 },
  { name: 'زمردي منعش', from: '#059669', to: '#2DD4BF', angle: 45 },
  { name: 'سايبر بلو نقي', from: '#2563EB', to: '#06B6D4', angle: 120 },
  { name: 'أرجواني ملكي', from: '#7C3AED', to: '#DB2777', angle: 160 },
  { name: 'ذهبي كلاسيكي', from: '#D97706', to: '#FCD34D', angle: 45 },
  { name: 'تدرج رمادي عصري', from: '#1E293B', to: '#64748B', angle: 180 },
];

export const SHADOW_PRESETS = [
  { nameAr: 'ظل ساقط ناعم', nameEn: 'Soft Drop', color: '#000000', opacity: 0.4, blur: 8, offsetX: 2, offsetY: 4 },
  { nameAr: 'توهج نيون مضيء', nameEn: 'Neon Glow', color: '#6C4DFF', opacity: 0.8, blur: 16, offsetX: 0, offsetY: 0 },
  { nameAr: 'بروز ثلاثي الأبعاد', nameEn: '3D Extrude', color: '#000000', opacity: 0.7, blur: 2, offsetX: 4, offsetY: 4 },
  { nameAr: 'ظل عميق غامق', nameEn: 'Deep Shadow', color: '#000000', opacity: 0.6, blur: 18, offsetX: 0, offsetY: 8 },
  { nameAr: 'توهج أبيض ناصع', nameEn: 'White Glow', color: '#FFFFFF', opacity: 0.9, blur: 12, offsetX: 0, offsetY: 0 },
];

export const COLOR_PALETTE = [
  '#172033', // Dark Slate
  '#6C4DFF', // Primary Purple
  '#23B5D3', // Vibrant Cyan
  '#2DD4BF', // Mint Teal
  '#F43F5E', // Rose Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#8B5CF6', // Violet
  '#FFFFFF', // White
  '#64748B', // Slate Gray
  '#000000', // Pure Black
  '#D97706', // Gold Bronze
];

export const TextInspector: React.FC<TextInspectorProps> = ({
  layer,
  onUpdateLayer,
  onDeleteLayer,
  onDuplicateLayer,
  language,
  darkMode,
  isEyedropperActive = false,
  onToggleEyedropper,
  eyedropperTarget = null,
  recentColors = [],
}) => {
  const isAr = language === 'ar';
  const config = layer.textConfig || {
    text: isAr ? 'بيكسلورا | Pixelora' : 'Pixelora Studio',
    fontSize: 36,
    fontFamily: 'Cairo',
    color: '#172033',
    opacity: 1,
    align: 'center',
    bold: true,
    italic: false,
    underline: false,
  };

  const [colorMode, setColorMode] = useState<'solid' | 'gradient'>(
    config.gradient?.enabled ? 'gradient' : 'solid'
  );

  // Font Picker Modal / Drawer state
  const [isFontPickerOpen, setIsFontPickerOpen] = useState(false);
  const [selectedFontCategory, setSelectedFontCategory] = useState<string>('all');
  const [fontSearchQuery, setFontSearchQuery] = useState('');
  const [customSampleText, setCustomSampleText] = useState('بيكسلورا | Pixelora');

  const updateConfig = (updates: Partial<TextConfig>) => {
    onUpdateLayer((prev) => ({
      ...prev,
      textConfig: {
        ...config,
        ...updates,
      },
    }));
  };

  // Filter fonts
  const filteredFonts = useMemo(() => {
    return ALL_FONTS.filter((font) => {
      // Category filter
      if (selectedFontCategory !== 'all') {
        if (selectedFontCategory === 'arabic' && font.category !== 'arabic') return false;
        if (selectedFontCategory === 'english' && font.category !== 'english') return false;
        if (['modern', 'luxury', 'bold', 'handwriting', 'decorative'].includes(selectedFontCategory)) {
          if (font.styleCategory !== selectedFontCategory) return false;
        }
      }

      // Search filter
      if (fontSearchQuery.trim()) {
        const q = fontSearchQuery.toLowerCase().trim();
        const matchNameAr = font.nameAr.toLowerCase().includes(q);
        const matchNameEn = font.nameEn.toLowerCase().includes(q);
        const matchId = font.id.toLowerCase().includes(q);
        if (!matchNameAr && !matchNameEn && !matchId) return false;
      }

      return true;
    });
  }, [selectedFontCategory, fontSearchQuery]);

  const currentFontObj = ALL_FONTS.find((f) => f.id === config.fontFamily) || {
    id: config.fontFamily,
    nameAr: config.fontFamily,
    nameEn: config.fontFamily,
  };

  return (
    <div className="space-y-4 text-xs select-none">
      {/* 1. Header with Layer Info & Delete/Duplicate */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
          <Type className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
          <span>{isAr ? 'أداة النص والخطوط المتطورة' : 'Advanced Typography'}</span>
        </div>
        <div className="flex items-center gap-1">
          {onDuplicateLayer && (
            <button
              onClick={onDuplicateLayer}
              className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isAr ? 'تكرار النص' : 'Duplicate text'}
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          )}
          {onDeleteLayer && (
            <button
              onClick={onDeleteLayer}
              className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              title={isAr ? 'حذف النص' : 'Delete text'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Direct Textarea Live Input */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'محتوى النص والكتابة' : 'Text Content'}
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {config.text.length} {isAr ? 'حرف' : 'chars'}
          </span>
        </div>
        <textarea
          rows={3}
          value={config.text}
          onChange={(e) => updateConfig({ text: e.target.value })}
          placeholder={isAr ? 'اكتب النص هنا...' : 'Type text here...'}
          dir={config.direction || (isAr ? 'rtl' : 'ltr')}
          className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#6C4DFF] focus:border-transparent outline-none resize-y text-xs transition-all leading-relaxed"
        />
      </div>

      {/* 3. Typography: Curated Font Family Showcase & Visual Picker */}
      <div className="space-y-2 p-3 bg-gradient-to-br from-purple-50/50 to-cyan-50/30 dark:from-slate-900/80 dark:to-slate-850 rounded-2xl border border-purple-100 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'مكتبة الخطوط المنتقاة' : 'Curated Font Library'}</span>
          </label>
          <span className="text-[10px] text-purple-600 dark:text-purple-300 font-bold">
            {ALL_FONTS.length} {isAr ? 'خط متاح' : 'Fonts'}
          </span>
        </div>

        {/* Selected Font Showcase Card with Open Library Button */}
        <div
          onClick={() => setIsFontPickerOpen(true)}
          className="p-3 bg-white dark:bg-slate-800 rounded-xl border-2 border-purple-200 dark:border-slate-600 hover:border-[#6C4DFF] dark:hover:border-[#2DD4BF] cursor-pointer transition-all shadow-xs group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-bold text-slate-900 dark:text-white text-xs">
              {isAr ? currentFontObj.nameAr : currentFontObj.nameEn}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6C4DFF]/10 dark:bg-[#2DD4BF]/20 text-[#6C4DFF] dark:text-[#2DD4BF] group-hover:bg-[#6C4DFF] group-hover:text-white transition-all">
              {isAr ? 'استعراض الكل' : 'Browse All'}
            </span>
          </div>

          {/* Rendered Live Sample */}
          <div
            style={{ fontFamily: config.fontFamily }}
            className="text-base text-slate-800 dark:text-slate-100 truncate py-1 text-center bg-slate-50 dark:bg-slate-900/60 rounded-lg px-2"
          >
            {customSampleText || (isAr ? 'بيكسلورا | Pixelora' : 'Pixelora Studio')}
          </div>
        </div>

        {/* Quick horizontal scroll of popular fonts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar pt-1">
          {ALL_FONTS.slice(0, 8).map((f) => {
            const isSelected = config.fontFamily === f.id;
            return (
              <button
                key={f.id}
                onClick={() => updateConfig({ fontFamily: f.id })}
                style={{ fontFamily: f.id }}
                className={`px-2.5 py-1 rounded-lg text-xs shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#6C4DFF] text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100/60 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isAr ? f.nameAr : f.nameEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Font Size & Quick Size Buttons */}
      <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'حجم الخط' : 'Font Size'}
          </span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="8"
              max="200"
              value={config.fontSize}
              onChange={(e) => updateConfig({ fontSize: Math.max(8, Math.min(200, Number(e.target.value) || 12)) })}
              className="w-14 p-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-center font-mono font-bold text-xs"
            />
            <span className="text-[10px] text-slate-400 font-mono">px</span>
          </div>
        </div>

        <input
          type="range"
          min="12"
          max="160"
          value={config.fontSize}
          onChange={(e) => updateConfig({ fontSize: Number(e.target.value) })}
          className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
        />

        <div className="flex items-center gap-1 pt-1">
          {[16, 24, 32, 48, 64, 84, 110].map((sz) => (
            <button
              key={sz}
              onClick={() => updateConfig({ fontSize: sz })}
              className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                config.fontSize === sz
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Typography Formatting & Text Align */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
        <span className="font-bold text-slate-700 dark:text-slate-300 block">
          {isAr ? 'التنسيق والمحاذاة والاتجاه' : 'Formatting & Alignment'}
        </span>

        {/* Bold, Italic, Underline, Strikethrough, Uppercase */}
        <div className="grid grid-cols-5 gap-1">
          <button
            onClick={() => updateConfig({ bold: !config.bold })}
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              config.bold
                ? 'bg-[#6C4DFF] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
            title={isAr ? 'عريض (Bold)' : 'Bold'}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateConfig({ italic: !config.italic })}
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              config.italic
                ? 'bg-[#6C4DFF] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
            title={isAr ? 'مائل (Italic)' : 'Italic'}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateConfig({ underline: !config.underline })}
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              config.underline
                ? 'bg-[#6C4DFF] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
            title={isAr ? 'تسطير (Underline)' : 'Underline'}
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateConfig({ strikethrough: !config.strikethrough })}
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              config.strikethrough
                ? 'bg-[#6C4DFF] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
            title={isAr ? 'يتوسطه خط (Strikethrough)' : 'Strikethrough'}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateConfig({ uppercase: !config.uppercase })}
            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
              config.uppercase
                ? 'bg-[#6C4DFF] text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
            title={isAr ? 'أحرف كبيرة (Uppercase)' : 'Uppercase'}
          >
            <CaseUpper className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alignments */}
        <div className="grid grid-cols-4 gap-1">
          {(['right', 'center', 'left', 'justify'] as const).map((align) => (
            <button
              key={align}
              onClick={() => updateConfig({ align })}
              className={`p-1.5 rounded-xl flex items-center justify-center transition-all ${
                config.align === align
                  ? 'bg-[#2DD4BF] text-slate-900 font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
              {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
              {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
              {align === 'justify' && <AlignJustify className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>

        {/* Direction Switch RTL / LTR */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-200/80 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
            {isAr ? 'اتجاه النص:' : 'Text Direction:'}
          </span>
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => updateConfig({ direction: 'rtl' })}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                config.direction === 'rtl' || (!config.direction && isAr)
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'من اليمين (عربي)' : 'RTL'}
            </button>
            <button
              onClick={() => updateConfig({ direction: 'ltr' })}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                config.direction === 'ltr'
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {isAr ? 'من اليسار (LTR)' : 'LTR'}
            </button>
          </div>
        </div>
      </div>

      {/* 6. Letter Spacing & Line Height */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
        {/* Letter Spacing */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'تباعد الأحرف (Letter Spacing)' : 'Letter Spacing'}
            </span>
            <span className="text-xs font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
              {config.letterSpacing || 0}px
            </span>
          </div>
          <input
            type="range"
            min="-3"
            max="30"
            step="0.5"
            value={config.letterSpacing || 0}
            onChange={(e) => updateConfig({ letterSpacing: Number(e.target.value) })}
            className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Line Height */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'ارتفاع الأسطر (Line Height)' : 'Line Height'}
            </span>
            <span className="text-xs font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
              {config.lineHeight || 1.3}
            </span>
          </div>
          <input
            type="range"
            min="0.8"
            max="2.5"
            step="0.05"
            value={config.lineHeight || 1.3}
            onChange={(e) => updateConfig({ lineHeight: Number(e.target.value) })}
            className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Opacity */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'شفافية النص' : 'Text Opacity'}
            </span>
            <span className="text-xs font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
              {Math.round((config.opacity !== undefined ? config.opacity : 1) * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.05"
            value={config.opacity !== undefined ? config.opacity : 1}
            onChange={(e) => updateConfig({ opacity: Number(e.target.value) })}
            className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* 7. Color & Gradient Controls with UnifiedColorPicker */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2.5">
        <UnifiedColorPicker
          color={config.color || '#6C4DFF'}
          onChangeColor={(newColor) =>
            updateConfig({
              color: newColor,
              gradient: config.gradient ? { ...config.gradient, enabled: false } : undefined,
            })
          }
          supportGradient={true}
          gradient={config.gradient}
          onChangeGradient={(newGrad) =>
            updateConfig({
              gradient: newGrad,
            })
          }
          recentColors={recentColors}
          isEyedropperActive={isEyedropperActive && (eyedropperTarget === 'text-color' || !eyedropperTarget)}
          onTriggerEyedropper={() => onToggleEyedropper?.('text-color')}
          language={language}
          label={isAr ? 'لون النص والتدرجات اللونية' : 'Text Color & Gradient'}
        />
      </div>

      {/* 8. Text Outline / Stroke */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'حواف النص الخارجية (Stroke / Outline)' : 'Text Outline / Stroke'}
          </span>
          <input
            type="checkbox"
            checked={!!config.stroke?.enabled}
            onChange={(e) =>
              updateConfig({
                stroke: {
                  enabled: e.target.checked,
                  color: config.stroke?.color || '#ffffff',
                  width: config.stroke?.width || 2,
                },
              })
            }
            className="w-4 h-4 rounded text-[#6C4DFF] accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {config.stroke?.enabled && (
          <div className="space-y-2.5 pt-1 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-bold">{isAr ? 'سماكة الحافة:' : 'Width:'}</span>
              <span className="font-mono text-xs font-bold text-[#6C4DFF]">{config.stroke.width}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="16"
              value={config.stroke.width}
              onChange={(e) =>
                updateConfig({
                  stroke: { ...config.stroke!, enabled: true, width: Number(e.target.value) },
                })
              }
              className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <UnifiedColorPicker
              color={config.stroke.color || '#ffffff'}
              onChangeColor={(newColor) =>
                updateConfig({
                  stroke: { ...config.stroke!, enabled: true, color: newColor },
                })
              }
              supportGradient={false}
              recentColors={recentColors}
              isEyedropperActive={isEyedropperActive && eyedropperTarget === 'text-stroke'}
              onTriggerEyedropper={() => onToggleEyedropper?.('text-stroke')}
              language={language}
              label={isAr ? 'لون الحافة (Stroke Color)' : 'Stroke Color'}
            />
          </div>
        )}
      </div>

      {/* 9. Text Shadow */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'الظل والتوهج (Text Shadow)' : 'Text Shadow'}
          </span>
          <input
            type="checkbox"
            checked={!!config.shadow?.enabled}
            onChange={(e) =>
              updateConfig({
                shadow: {
                  enabled: e.target.checked,
                  color: config.shadow?.color || '#000000',
                  blur: config.shadow?.blur || 8,
                  offsetX: config.shadow?.offsetX || 2,
                  offsetY: config.shadow?.offsetY || 4,
                  opacity: config.shadow?.opacity || 0.5,
                },
              })
            }
            className="w-4 h-4 rounded text-[#6C4DFF] accent-[#6C4DFF] cursor-pointer"
          />
        </div>

        {config.shadow?.enabled && (
          <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700">
            {/* Presets */}
            <div className="grid grid-cols-2 gap-1 mb-2">
              {SHADOW_PRESETS.map((sh, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    updateConfig({
                      shadow: {
                        enabled: true,
                        color: sh.color,
                        blur: sh.blur,
                        offsetX: sh.offsetX,
                        offsetY: sh.offsetY,
                        opacity: sh.opacity,
                      },
                    })
                  }
                  className="px-2 py-1 bg-white dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors truncate text-right"
                >
                  {isAr ? sh.nameAr : sh.nameEn}
                </button>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] text-slate-500 font-bold">{isAr ? 'الضبابية (Blur):' : 'Blur:'}</span>
                <span className="font-mono text-xs font-bold text-[#6C4DFF]">{config.shadow.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={config.shadow.blur}
                onChange={(e) =>
                  updateConfig({
                    shadow: { ...config.shadow!, enabled: true, blur: Number(e.target.value) },
                  })
                }
                className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block mb-1">
                  {isAr ? 'إزاحة أفقية X' : 'Offset X'} ({config.shadow.offsetX}px)
                </span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={config.shadow.offsetX}
                  onChange={(e) =>
                    updateConfig({
                      shadow: { ...config.shadow!, enabled: true, offsetX: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block mb-1">
                  {isAr ? 'إزاحة رأسية Y' : 'Offset Y'} ({config.shadow.offsetY}px)
                </span>
                <input
                  type="range"
                  min="-30"
                  max="30"
                  value={config.shadow.offsetY}
                  onChange={(e) =>
                    updateConfig({
                      shadow: { ...config.shadow!, enabled: true, offsetY: Number(e.target.value) },
                    })
                  }
                  className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <UnifiedColorPicker
              color={config.shadow.color || '#000000'}
              onChangeColor={(newColor) =>
                updateConfig({
                  shadow: { ...config.shadow!, enabled: true, color: newColor },
                })
              }
              supportGradient={false}
              recentColors={recentColors}
              isEyedropperActive={isEyedropperActive && eyedropperTarget === 'text-shadow'}
              onTriggerEyedropper={() => onToggleEyedropper?.('text-shadow')}
              language={language}
              label={isAr ? 'لون الظل والتوهج (Shadow Color)' : 'Shadow Color'}
            />
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 10. MODAL: Full Curated Font Library Browser with Live Visual Rendering  */}
      {/* ========================================================================= */}
      {isFontPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                  <span>{isAr ? 'مكتبة الخطوط والتيبوغرافي الاحترافية' : 'Typography & Font Library'}</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isAr
                    ? 'اختر الخط المناسب لتصميمك مع معاينة بصرية حقيقية بالخط نفسه'
                    : 'Choose the ideal font with live typographic preview rendered in real-time.'}
                </p>
              </div>
              <button
                onClick={() => setIsFontPickerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Custom Sample Text Input & Search */}
            <div className="p-4 bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fontSearchQuery}
                    onChange={(e) => setFontSearchQuery(e.target.value)}
                    placeholder={isAr ? 'ابحث عن اسم الخط...' : 'Search font name...'}
                    className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#6C4DFF]"
                  />
                  {fontSearchQuery && (
                    <button
                      onClick={() => setFontSearchQuery('')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Custom Sample Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={customSampleText}
                    onChange={(e) => setCustomSampleText(e.target.value)}
                    placeholder={isAr ? 'اكتب نص المعاينة (مثل: بيكسلورا | Pixelora)' : 'Custom preview text...'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#2DD4BF]"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {FONT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedFontCategory(cat.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedFontCategory === cat.id
                        ? 'bg-[#6C4DFF] text-white shadow-xs scale-102'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isAr ? cat.nameAr : cat.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Grid List */}
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-h-[300px]">
              {filteredFonts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs font-bold">{isAr ? 'لم يتم العثور على خط يطابق البحث' : 'No fonts matched'}</p>
                </div>
              ) : (
                filteredFonts.map((font) => {
                  const isSelected = config.fontFamily === font.id;
                  const sample = customSampleText || font.sampleAr || 'بيكسلورا | Pixelora';

                  return (
                    <div
                      key={font.id}
                      onClick={() => {
                        updateConfig({ fontFamily: font.id });
                        setIsFontPickerOpen(false);
                      }}
                      className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'border-[#6C4DFF] bg-purple-50/50 dark:bg-purple-950/20 shadow-md ring-2 ring-[#6C4DFF]/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850 hover:border-[#6C4DFF] dark:hover:border-[#2DD4BF] hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs group-hover:text-[#6C4DFF] dark:group-hover:text-[#2DD4BF] transition-colors">
                            {isAr ? font.nameAr : font.nameEn}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">{font.id}</span>
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold group-hover:bg-[#6C4DFF] group-hover:text-white transition-colors">
                            {isAr ? 'اختيار' : 'Select'}
                          </span>
                        )}
                      </div>

                      {/* Font rendered showcase */}
                      <div
                        style={{ fontFamily: font.id }}
                        className="text-lg text-slate-900 dark:text-white text-center py-2.5 px-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 truncate"
                      >
                        {sample}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {isAr ? 'الخط المختار حالياً:' : 'Active Font:'}{' '}
                <strong className="text-slate-900 dark:text-white">{config.fontFamily}</strong>
              </span>
              <button
                onClick={() => setIsFontPickerOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-[#6C4DFF] hover:bg-[#5839EE] text-white font-bold text-xs shadow-xs"
              >
                {isAr ? 'تم وتطبيق' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
