import React, { useState, useMemo, useEffect } from 'react';
import {
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  SearchX,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { BackgroundTemplate } from '../../types';
import { BACKGROUND_CATEGORIES, BACKGROUND_TEMPLATES } from '../../data/backgrounds';
import { HeroSection } from './HeroSection';
import { FeaturedCategories } from './FeaturedCategories';
import { FilterSidebar } from './FilterSidebar';
import { BackgroundCard } from './BackgroundCard';

interface BackgroundsPageProps {
  onSelectBackground: (template: BackgroundTemplate) => void;
  onCustomBackgroundUpload: (file: File) => void;
  language?: 'ar' | 'en';
  darkMode?: boolean;
}

export const BackgroundsPage: React.FC<BackgroundsPageProps> = ({
  onSelectBackground,
  onCustomBackgroundUpload,
  language = 'ar',
}) => {
  const isAr = language === 'ar';

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<string>('all');
  const [selectedResolution, setSelectedResolution] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular' | 'name'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  // Local persistence for favorites
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pixelora_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem('pixelora_favorites', JSON.stringify(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // Reset page whenever any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedColor, selectedOrientation, selectedResolution, sortBy]);

  // Filtered and Sorted templates
  const filteredTemplates = useMemo(() => {
    return BACKGROUND_TEMPLATES.filter((template) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = template.name.toLowerCase().includes(query);
        const matchesDesc = template.description?.toLowerCase().includes(query);
        const matchesCat = template.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      // 2. Category
      if (selectedCategory !== 'all' && template.category !== selectedCategory) {
        return false;
      }

      // 3. Color
      if (selectedColor !== null && template.colorTone !== selectedColor) {
        return false;
      }

      // 4. Orientation
      if (selectedOrientation !== 'all' && template.orientation !== selectedOrientation) {
        return false;
      }

      // 5. Resolution
      if (selectedResolution !== 'all' && template.resolution !== selectedResolution) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name, isAr ? 'ar' : 'en');
      }
      if (sortBy === 'oldest') {
        return 1;
      }
      if (sortBy === 'popular') {
        const aFav = favorites.includes(a.id) ? 1 : 0;
        const bFav = favorites.includes(b.id) ? 1 : 0;
        return bFav - aFav;
      }
      // 'newest' default
      return 0;
    });
  }, [
    searchQuery,
    selectedCategory,
    selectedColor,
    selectedOrientation,
    selectedResolution,
    sortBy,
    favorites,
    isAr,
  ]);

  // Pagination calculation: 16 items per page (4 rows x 4 columns)
  const itemsPerPage = 16;
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / itemsPerPage));
  const paginatedTemplates = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTemplates.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTemplates, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedColor(null);
    setSelectedOrientation('all');
    setSelectedResolution('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleApply = (template: BackgroundTemplate) => {
    setAppliedId(template.id);
    onSelectBackground(template);
    setTimeout(() => setAppliedId(null), 1500);
  };

  // Get active category display name
  const currentCategoryName = useMemo(() => {
    if (selectedCategory === 'all') return isAr ? 'جميع الخلفيات' : 'All Backgrounds';
    const found = BACKGROUND_CATEGORIES.find((c) => c.id === selectedCategory);
    return found ? (isAr ? found.nameAr : found.nameEn) : isAr ? 'خلفيات' : 'Backgrounds';
  }, [selectedCategory, isAr]);

  return (
    <div
      id="pixelora-backgrounds-page"
      className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200"
    >
      {/* 1. Hero Section with Search, Action and 3D Visual Mockups */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCustomBackgroundUpload={onCustomBackgroundUpload}
        isAr={isAr}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full flex-1">
        {/* 2. Popular Categories Quick Row */}
        <FeaturedCategories
          categories={BACKGROUND_CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isAr={isAr}
        />

        {/* 3. Main Content: Filter Sidebar on Left + Grid on Right (matching reference) */}
        <div
          className={`flex flex-col ${
            isAr ? 'lg:flex-row-reverse' : 'lg:flex-row'
          } gap-8 items-start`}
        >
          {/* Sidebar */}
          <FilterSidebar
            categories={BACKGROUND_CATEGORIES}
            templates={BACKGROUND_TEMPLATES}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            selectedColor={selectedColor}
            onSelectColor={setSelectedColor}
            selectedOrientation={selectedOrientation}
            onSelectOrientation={setSelectedOrientation}
            selectedResolution={selectedResolution}
            onSelectResolution={setSelectedResolution}
            onResetFilters={handleResetFilters}
            isAr={isAr}
          />

          {/* Main Grid Column */}
          <section className="flex-1 w-full min-w-0" aria-label="Backgrounds Catalog">
            {/* Header controls above grid */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
              {/* Category title & item count */}
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {currentCategoryName}
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {isAr ? `${filteredTemplates.length} خلفية` : `${filteredTemplates.length} backgrounds`}
                </span>
              </div>

              {/* View Switcher + Sort Dropdown */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                {/* View Mode Toggle */}
                <div className="flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700/60">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-slate-700 text-[#6338E8] dark:text-[#20BFC4] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                    title={isAr ? 'عرض شبكي' : 'Grid view'}
                    aria-label="Grid view"
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-slate-700 text-[#6338E8] dark:text-[#20BFC4] shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                    title={isAr ? 'عرض قائمة' : 'List view'}
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    id="pixelora-bg-sort-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="appearance-none py-2 ps-3.5 pe-8 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#6338E8] focus:outline-hidden focus:ring-2 focus:ring-[#6338E8]/20 cursor-pointer shadow-2xs"
                  >
                    <option value="newest">{isAr ? 'الأحدث أولاً' : 'Newest First'}</option>
                    <option value="popular">{isAr ? 'الأكثر شهرة' : 'Most Popular'}</option>
                    <option value="name">{isAr ? 'الاسم (أ-ي)' : 'Name (A-Z)'}</option>
                    <option value="oldest">{isAr ? 'الأقدم أولاً' : 'Oldest First'}</option>
                  </select>
                  <div className="absolute top-1/2 end-2.5 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Templates List/Grid */}
            {filteredTemplates.length === 0 ? (
              <div className="py-16 px-4 text-center bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60 my-6">
                <div className="w-14 h-14 rounded-2xl bg-[#6338E8]/10 text-[#6338E8] dark:text-[#20BFC4] flex items-center justify-center mx-auto mb-4">
                  <SearchX className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
                  {isAr ? 'لا توجد خلفيات تطابق خيارات التصفية' : 'No backgrounds match your filters'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                  {isAr
                    ? 'جرب البحث بكلمات أخرى أو قم بإلغاء بعض الفلاتر لعرض نتائج أكثر.'
                    : 'Try searching with different keywords or clear active filters to discover more items.'}
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6338E8] hover:bg-[#5229D2] shadow-sm transition-all active:scale-95"
                >
                  {isAr ? 'إعادة تعيين الفلاتر' : 'Reset All Filters'}
                </button>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5'
                    : 'flex flex-col gap-3.5'
                }
              >
                {paginatedTemplates.map((template) => (
                  <BackgroundCard
                    key={template.id}
                    template={template}
                    isApplied={appliedId === template.id}
                    isFavorite={favorites.includes(template.id)}
                    onApply={handleApply}
                    onToggleFavorite={toggleFavorite}
                    isAr={isAr}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* 4. Pagination (Matching Reference `< 1 2 3 ... >`) */}
            {totalPages > 1 && (
              <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 select-none">
                {/* Prev Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Previous Page"
                >
                  {isAr ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = currentPage === pageNum;

                  // Show first page, last page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-[#6338E8] text-white shadow-xs'
                            : 'border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-[#6338E8]/50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }

                  // Ellipsis
                  if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return (
                      <span key={pageNum} className="px-1 text-slate-400 text-xs">
                        ...
                      </span>
                    );
                  }

                  return null;
                })}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  aria-label="Next Page"
                >
                  {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
