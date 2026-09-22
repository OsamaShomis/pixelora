import React, { useRef, useEffect } from 'react';
import { Search, Sparkles, Upload, X, Image as ImageIcon } from 'lucide-react';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCustomBackgroundUpload: (file: File) => void;
  isAr: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  searchQuery,
  onSearchChange,
  onCustomBackgroundUpload,
  isAr,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener to focus search input
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCustomBackgroundUpload(file);
    }
  };

  return (
    <section
      id="pixelora-backgrounds-hero"
      className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-[#EEF2FF]/80 via-[#F8FAFC] to-[#F1F5F9] dark:from-[#18153A] dark:via-[#0F172A] dark:to-[#0F172A] select-none"
    >
      {/* Background ambient lighting accents */}
      <div className="absolute top-0 end-1/4 w-96 h-96 bg-[#6338E8]/10 dark:bg-[#6338E8]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-1/4 w-96 h-96 bg-[#20BFC4]/10 dark:bg-[#20BFC4]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Text & Search Side (Takes 7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-start space-y-5">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6338E8]/10 dark:bg-[#6338E8]/20 border border-[#6338E8]/20 text-[#6338E8] dark:text-[#20BFC4] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#6338E8] dark:text-[#20BFC4]" />
              <span>{isAr ? 'مكتبة الخلفيات الجاهزة' : 'Ready Backgrounds Library'}</span>
            </div>

            {/* Display Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              {isAr ? (
                <>
                  خلفيات جاهزة <span className="bg-gradient-to-r from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] bg-clip-text text-transparent">لإبداعاتك</span>
                </>
              ) : (
                <>
                  Ready Backgrounds for <span className="bg-gradient-to-r from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] bg-clip-text text-transparent">Your Creations</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
              {isAr
                ? 'مجموعة واسعة من الخلفيات عالية الدقة جاهزة للاستخدام الفوري في مشاريعك وتصاميمك، سواء كانت صوراً طبيعية، استوديوهات، منتجات، أو خلفيات إبداعية ملهمة.'
                : 'A curated library of ultra-high-resolution backgrounds ready for your designs, featuring nature scenes, product platforms, modern studios, and vibrant textures.'}
            </p>

            {/* Search Bar + Upload Button */}
            <div className="w-full max-w-xl space-y-3 pt-1">
              <div className="relative flex items-center shadow-xs rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus-within:border-[#6338E8] focus-within:ring-2 focus-within:ring-[#6338E8]/20 transition-all">
                <div className="ps-4 text-slate-400 pointer-events-none">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  ref={searchInputRef}
                  id="pixelora-bg-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={
                    isAr
                      ? 'ابحث عن خلفيات (طبيعة، استوديو، رخام، مدينة، منتج...)'
                      : 'Search backgrounds (nature, studio, marble, city, product...)'
                  }
                  className="w-full py-3.5 px-3 text-sm bg-transparent border-0 outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400"
                />
                {searchQuery ? (
                  <button
                    onClick={() => onSearchChange('')}
                    className="p-2 me-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="pe-3 hidden sm:flex items-center">
                    <kbd className="px-2 py-1 text-[11px] font-mono font-semibold text-slate-500 bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600 rounded-md">
                      Ctrl + K
                    </kbd>
                  </div>
                )}
              </div>

              {/* Upload Custom Background action */}
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="upload-custom-bg-input"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#6338E8]/60 hover:text-[#6338E8] dark:hover:text-[#20BFC4] shadow-2xs hover:shadow-xs transition-all active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5 text-[#6338E8] dark:text-[#20BFC4]" />
                  <span>{isAr ? 'رفع خلفية خاصة من جهازك' : 'Upload Custom Background'}</span>
                </button>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  {isAr ? 'يدعم PNG, JPG, WEBP' : 'Supports PNG, JPG, WEBP'}
                </span>
              </div>
            </div>
          </div>

          {/* 3D Visual Collage Side (Takes 5 cols, matching reference) */}
          <div className="lg:col-span-5 relative flex items-center justify-center pt-4 lg:pt-0">
            <div className="relative w-full max-w-md h-72 sm:h-80">
              {/* Back card - City Skyline */}
              <div className="absolute top-2 start-10 w-48 sm:w-56 h-36 sm:h-40 rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-slate-700 rotate-6 transform hover:rotate-2 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=500&q=80"
                  alt="City Skyline"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Bottom card - Modern Interior */}
              <div className="absolute bottom-2 start-4 w-52 sm:w-60 h-40 sm:h-44 rounded-2xl overflow-hidden shadow-2xl border-2 border-white dark:border-slate-700 -rotate-3 transform hover:rotate-0 transition-transform duration-300 z-10">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=500&q=80"
                  alt="Modern Interior"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              {/* Front Main card - Alpine Lake & Mountains */}
              <div className="absolute top-6 end-2 w-56 sm:w-64 h-44 sm:h-48 rounded-2xl overflow-hidden shadow-2xl border-3 border-white dark:border-slate-700 rotate-2 transform hover:scale-105 transition-all duration-300 z-20">
                <img
                  src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80"
                  alt="Alpine Lake"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-xs font-bold drop-shadow-sm">
                    {isAr ? 'جبال الألب 4K' : 'Alpine Mountains 4K'}
                  </span>
                </div>
              </div>

              {/* Floating Translucent Badge 1 */}
              <div className="absolute top-0 end-0 z-30 p-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-white/60 dark:border-slate-700 shadow-lg transform -translate-y-2 translate-x-2 animate-pulse">
                <ImageIcon className="w-5 h-5 text-[#6338E8] dark:text-[#20BFC4]" />
              </div>

              {/* Floating Label with decorative arrow */}
              <div className="absolute -bottom-3 end-6 z-30 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-[#20BFC4]" />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                  {isAr ? 'خلفيات تلهم أفكارك' : 'Backgrounds that inspire'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
