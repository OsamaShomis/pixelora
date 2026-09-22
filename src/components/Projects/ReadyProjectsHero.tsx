import React, { useRef, useEffect } from 'react';
import { Search, Sparkles, FolderOpen, Zap, Layers } from 'lucide-react';

interface ReadyProjectsHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAr: boolean;
}

export const ReadyProjectsHero: React.FC<ReadyProjectsHeroProps> = ({
  searchQuery,
  onSearchChange,
  isAr,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <section
      id="pixelora-ready-projects-hero"
      className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-[#EEF2FF]/80 via-[#F8FAFC] to-[#F1F5F9] dark:from-[#18153A] dark:via-[#0F172A] dark:to-[#0F172A] select-none"
    >
      {/* Background ambient lighting accents */}
      <div className="absolute top-0 end-1/4 w-96 h-96 bg-[#6338E8]/10 dark:bg-[#6338E8]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-1/4 w-96 h-96 bg-[#20BFC4]/10 dark:bg-[#20BFC4]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Heading, Subtitle & Value Props */}
          <div className="lg:col-span-7 flex flex-col items-start text-start space-y-5">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6338E8]/10 dark:bg-[#6338E8]/20 border border-[#6338E8]/20 text-[#6338E8] dark:text-[#20BFC4] text-xs font-bold shadow-2xs">
              <FolderOpen className="w-3.5 h-3.5 text-[#6338E8] dark:text-[#20BFC4]" />
              <span>{isAr ? 'مشاريع جاهزة' : 'Ready Projects'}</span>
            </div>

            {/* Display Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#121A33] dark:text-white tracking-tight leading-[1.2]">
              {isAr ? (
                <>
                  استخدم <span className="bg-gradient-to-r from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] bg-clip-text text-transparent">مشاريع جاهزة</span>
                  <br />
                  لإنشاء صور مذهلة بسرعة
                </>
              ) : (
                <>
                  Use <span className="bg-gradient-to-r from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] bg-clip-text text-transparent">Ready Projects</span>
                  <br />
                  to Create Stunning Designs Fast
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              {isAr
                ? 'استكشف مجموعة من القوالب والمشاريع الجاهزة التي صممناها خصيصاً لك. اختر مشروعك المفضل وابدأ في التعديل مباشرة أو استخدمه كنقطة انطلاق لإبداعك.'
                : 'Explore professionally prepared project templates. Choose your favorite starter design and jump straight into the editor with all preset layers and adjustments.'}
            </p>

            {/* 3 Quick Value Points */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full pt-1">
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#6338E8]/10 dark:bg-[#6338E8]/20 text-[#6338E8] dark:text-[#20BFC4] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {isAr ? 'قوالب احترافية' : 'Curated Templates'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr ? 'بكل سهولة وسرعة' : 'Ready in seconds'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#4F8FE8]/10 dark:bg-[#4F8FE8]/20 text-[#4F8FE8] flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {isAr ? 'تعديل سهل' : 'Easy Editing'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr ? 'قم بتخصيصها حسب رغبتك' : 'Customize as you wish'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-[#20BFC4]/10 dark:bg-[#20BFC4]/20 text-[#20BFC4] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {isAr ? 'نتائج مذهلة' : 'High Fidelity'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr ? 'تصاميم عالية الجودة' : 'Ultra HD output'}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Search */}
            <div className="w-full max-w-xl pt-2">
              <div className="relative flex items-center shadow-xs rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus-within:border-[#6338E8] focus-within:ring-2 focus-within:ring-[#6338E8]/20 transition-all">
                <div className="ps-4 text-slate-400 pointer-events-none">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  ref={searchInputRef}
                  id="ready-projects-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ابحث في المشاريع الجاهزة والمحفوظة (سيارات، ساعات، طبيعة، هواتف...)'
                      : 'Search ready & saved projects (cars, watches, nature, phones...)'
                  }
                  className="w-full py-3.5 px-3 text-sm bg-transparent border-0 outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="p-2 me-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    ✕
                  </button>
                ) : (
                  <div className="pe-4 hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
                    <kbd className="px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-[10px] font-mono">
                      Ctrl
                    </kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-[10px] font-mono">
                      K
                    </kbd>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Visual Mockup Composition matching reference */}
          <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
            <div className="relative w-full max-w-[430px] aspect-4/3 sm:aspect-square flex items-center justify-center">
              {/* Soft decorative background circles */}
              <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-[#6338E8]/20 via-[#4F8FE8]/15 to-transparent blur-2xl" />
              <div className="absolute w-60 h-60 rounded-full bg-gradient-to-br from-[#20BFC4]/20 via-transparent to-[#6338E8]/10 blur-xl" />

              {/* Central Main Editor Frame Mockup */}
              <div className="relative z-10 w-[78%] h-[82%] rounded-2xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200/90 dark:border-slate-700 p-2.5 flex flex-col transform hover:scale-[1.02] transition-transform duration-300">
                {/* Mockup Toolbar Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700/80">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[10px] font-semibold text-[#6338E8] dark:text-[#20BFC4] bg-[#6338E8]/10 dark:bg-[#6338E8]/20 px-2 py-0.5 rounded-full">
                    Ready to edit
                  </span>
                </div>

                {/* Split canvas representation */}
                <div className="flex-1 flex gap-2 overflow-hidden rounded-xl">
                  {/* Image area */}
                  <div className="flex-1 relative rounded-lg overflow-hidden bg-slate-900 group">
                    <img
                      src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80"
                      alt="Alpine Mountain"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] text-white font-bold drop-shadow-xs">
                        Alpine Landscape
                      </span>
                    </div>
                  </div>

                  {/* Sidebar miniature with tools */}
                  <div className="w-20 bg-slate-50 dark:bg-slate-900/60 rounded-lg p-1.5 flex flex-col gap-1.5 text-[9px] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800">
                    <div className="py-1 px-1.5 rounded-md bg-[#6338E8]/10 text-[#6338E8] dark:text-[#20BFC4] font-bold text-center">
                      Layers (2)
                    </div>
                    <div className="py-1 px-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center font-medium truncate">
                      Filters
                    </div>
                    <div className="py-1 px-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center font-medium truncate">
                      Adjust
                    </div>
                    <div className="py-1 px-1.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-center font-medium truncate">
                      Effects
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Card 1: Top-start (City Skyline) */}
              <div className="absolute -top-3 -start-4 sm:-start-6 z-20 w-24 sm:w-28 h-28 sm:h-32 rounded-xl overflow-hidden shadow-xl border-2 border-white dark:border-slate-700 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=300&q=80"
                  alt="City Sunset"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1.5">
                  <span className="text-[9px] text-white font-bold leading-tight">
                    {isAr ? 'غروب المدينة' : 'City Sunset'}
                  </span>
                </div>
              </div>

              {/* Floating Card 2: Bottom-start (BMW luxury car) */}
              <div className="absolute -bottom-4 start-4 sm:start-2 z-20 w-24 sm:w-28 h-24 sm:h-28 rounded-xl overflow-hidden shadow-xl border-2 border-white dark:border-slate-700 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=300&q=80"
                  alt="BMW Sport Car"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-1.5">
                  <span className="text-[9px] text-white font-bold leading-tight">
                    {isAr ? 'سيارة BMW' : 'BMW Sport'}
                  </span>
                </div>
              </div>

              {/* Floating Badge Tool Icon: Pen/Edit tool circle */}
              <div className="absolute bottom-2 -end-3 z-30 w-11 h-11 rounded-full bg-gradient-to-tr from-[#6338E8] to-[#4F8FE8] text-white shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform border-2 border-white dark:border-slate-800">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
