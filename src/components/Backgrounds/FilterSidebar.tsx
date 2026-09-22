import React, { useState } from 'react';
import {
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Check,
  Mountain,
  Box,
  Home,
  Building2,
  Shapes,
  Sparkles,
  Square,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import { BackgroundCategory, BackgroundTemplate } from '../../types';

interface FilterSidebarProps {
  categories: BackgroundCategory[];
  templates: BackgroundTemplate[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  selectedColor: string | null;
  onSelectColor: (color: string | null) => void;
  selectedOrientation: string;
  onSelectOrientation: (orientation: string) => void;
  selectedResolution: string;
  onSelectResolution: (resolution: string) => void;
  onResetFilters: () => void;
  isAr: boolean;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  templates,
  selectedCategory,
  onSelectCategory,
  selectedColor,
  onSelectColor,
  selectedOrientation,
  onSelectOrientation,
  selectedResolution,
  onSelectResolution,
  onResetFilters,
  isAr,
}) => {
  const [showMoreColors, setShowMoreColors] = useState(false);

  // Category counts
  const getCategoryCount = (catId: string) => {
    if (catId === 'all') return templates.length;
    return templates.filter((t) => t.category === catId).length;
  };

  const getCategoryIcon = (iconName: string) => {
    const iconClass = 'w-4 h-4 shrink-0';
    switch (iconName) {
      case 'Mountain':
        return <Mountain className={iconClass} />;
      case 'Box':
        return <Box className={iconClass} />;
      case 'Home':
        return <Home className={iconClass} />;
      case 'Building2':
        return <Building2 className={iconClass} />;
      case 'Shapes':
        return <Shapes className={iconClass} />;
      case 'Square':
        return <Square className={iconClass} />;
      case 'Layers':
        return <Layers className={iconClass} />;
      case 'Sparkles':
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const COLOR_PALETTE = [
    { id: 'white', labelAr: 'أبيض', labelEn: 'White', hex: '#FFFFFF', border: true },
    { id: 'silver', labelAr: 'فضي', labelEn: 'Silver', hex: '#94A3B8' },
    { id: 'dark', labelAr: 'داكن / أسود', labelEn: 'Dark / Black', hex: '#0F172A' },
    { id: 'navy', labelAr: 'أزرق داكن', labelEn: 'Navy', hex: '#1E3A8A' },
    { id: 'blue', labelAr: 'أزرق', labelEn: 'Blue', hex: '#2563EB' },
    { id: 'periwinkle', labelAr: 'أرجواني فاتح', labelEn: 'Periwinkle', hex: '#818CF8' },
    { id: 'pink', labelAr: 'وردي', labelEn: 'Pink', hex: '#EC4899' },
    { id: 'purple', labelAr: 'بنفسجي', labelEn: 'Purple', hex: '#7C3AED' },
    { id: 'cyan', labelAr: 'فيروزي / سيان', labelEn: 'Cyan', hex: '#06B6D4' },
    { id: 'green', labelAr: 'أخضر', labelEn: 'Green', hex: '#10B981' },
    { id: 'yellow', labelAr: 'أصفر', labelEn: 'Yellow', hex: '#F59E0B' },
    { id: 'orange', labelAr: 'برتقالي', labelEn: 'Orange', hex: '#F97316' },
    { id: 'warm', labelAr: 'دافئ', labelEn: 'Warm', hex: '#D97706' },
  ];

  const visibleColors = showMoreColors ? COLOR_PALETTE : COLOR_PALETTE.slice(0, 10);

  return (
    <aside
      id="pixelora-backgrounds-sidebar"
      className="w-full lg:w-72 shrink-0 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-2xs space-y-6 select-none"
    >
      {/* 1. Categories Section */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          {isAr ? 'الفئات' : 'Categories'}
        </h3>

        <div className="space-y-1">
          {/* All category */}
          <button
            id="cat-filter-all"
            onClick={() => onSelectCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#6338E8]/10 text-[#6338E8] dark:bg-[#6338E8]/20 dark:text-[#20BFC4] font-bold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4" />
              <span>{isAr ? 'جميع الخلفيات' : 'All Backgrounds'}</span>
            </div>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono ${
                selectedCategory === 'all'
                  ? 'bg-[#6338E8] text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {getCategoryCount('all')}
            </span>
          </button>

          {/* Category List */}
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                id={`cat-filter-${cat.id}`}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isCatActive
                    ? 'bg-[#6338E8]/10 text-[#6338E8] dark:bg-[#6338E8]/20 dark:text-[#20BFC4] font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {getCategoryIcon(cat.icon)}
                  <span className="truncate">{isAr ? cat.nameAr : cat.nameEn}</span>
                </div>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono shrink-0 ${
                    isCatActive
                      ? 'bg-[#6338E8] text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700/60" />

      {/* 2. Color Filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {isAr ? 'الألوان' : 'Colors'}
          </h3>
          {selectedColor && (
            <button
              onClick={() => onSelectColor(null)}
              className="text-[11px] text-[#6338E8] dark:text-[#20BFC4] hover:underline font-semibold"
            >
              {isAr ? 'إلغاء' : 'Clear'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {visibleColors.map((color) => {
            const isColorActive = selectedColor === color.id;

            return (
              <button
                key={color.id}
                onClick={() => onSelectColor(isColorActive ? null : color.id)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 relative ${
                  color.border ? 'border border-slate-300 dark:border-slate-600' : ''
                } ${
                  isColorActive
                    ? 'ring-2 ring-offset-2 ring-[#6338E8] scale-110 shadow-sm'
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex }}
                title={isAr ? color.labelAr : color.labelEn}
                aria-label={isAr ? color.labelAr : color.labelEn}
              >
                {isColorActive && (
                  <Check
                    className={`w-4 h-4 ${
                      color.id === 'white' || color.id === 'silver' || color.id === 'yellow'
                        ? 'text-slate-900'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowMoreColors(!showMoreColors)}
          className="mt-3 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
        >
          <span>{showMoreColors ? (isAr ? 'عرض أقل' : 'Show less') : isAr ? 'عرض المزيد' : 'Show more'}</span>
          {showMoreColors ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700/60" />

      {/* 3. Orientation Filter */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          {isAr ? 'الاتجاه' : 'Orientation'}
        </h3>

        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-700/50">
          <button
            onClick={() => onSelectOrientation('all')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              selectedOrientation === 'all'
                ? 'bg-white dark:bg-slate-800 text-[#6338E8] dark:text-[#20BFC4] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isAr ? 'الكل' : 'All'}
          </button>
          <button
            onClick={() => onSelectOrientation('landscape')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              selectedOrientation === 'landscape'
                ? 'bg-white dark:bg-slate-800 text-[#6338E8] dark:text-[#20BFC4] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isAr ? 'أفقي' : 'Landscape'}
          </button>
          <button
            onClick={() => onSelectOrientation('portrait')}
            className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              selectedOrientation === 'portrait'
                ? 'bg-white dark:bg-slate-800 text-[#6338E8] dark:text-[#20BFC4] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isAr ? 'عمودي' : 'Portrait'}
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700/60" />

      {/* 4. Resolution Filter */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          {isAr ? 'الدقة' : 'Resolution'}
        </h3>

        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'all', label: isAr ? 'جميع الدقات' : 'All Resolutions' },
            { id: '4K', label: '4K Ultra' },
            { id: 'Full HD', label: 'Full HD' },
            { id: 'HD', label: 'HD' },
          ].map((res) => {
            const isResActive = selectedResolution === res.id;

            return (
              <button
                key={res.id}
                onClick={() => onSelectResolution(res.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center border transition-all ${
                  isResActive
                    ? 'border-[#6338E8] bg-[#6338E8]/10 text-[#6338E8] dark:bg-[#6338E8]/20 dark:text-[#20BFC4] font-bold shadow-2xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/40'
                }`}
              >
                {res.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-700/60" />

      {/* 5. Reset Filters Button */}
      <button
        id="reset-filters-btn"
        onClick={onResetFilters}
        className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/70 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600/80 transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <RotateCcw className="w-3.5 h-3.5 text-[#6338E8] dark:text-[#20BFC4]" />
        <span>{isAr ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}</span>
      </button>
    </aside>
  );
};
