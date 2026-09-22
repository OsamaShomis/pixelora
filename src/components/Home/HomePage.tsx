import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileImage,
  Plus,
  Play,
  Cloud,
  Diamond,
  Zap,
  Star,
  Sliders,
  Scissors,
  Layers,
  Wand2,
  Cpu,
  Palette,
  Maximize2,
  Check,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Laptop,
  Globe,
} from 'lucide-react';

interface HomePageProps {
  onStartWithImage: (imageUrl: string, name: string) => void;
  onStartWithMultipleImages: (images: { url: string; name: string }[]) => void;
  onStartBlank: (width: number, height: number, name: string) => void;
  onNavigateToTab: (tab: 'editor' | 'backgrounds' | 'projects' | 'help') => void;
  language: 'ar' | 'en';
  darkMode: boolean;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartWithImage,
  onStartWithMultipleImages,
  onStartBlank,
  onNavigateToTab,
  language,
  darkMode,
}) => {
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [heroSplitPos, setHeroSplitPos] = useState(52);
  const [portraitSplitPos, setPortraitSplitPos] = useState(48);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);

    const imagePromises = Array.from(files).map((file) => {
      return new Promise<{ url: string; name: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            url: e.target?.result as string,
            name: file.name.replace(/\.[^/.]+$/, ''),
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then((results) => {
      setIsProcessing(false);
      if (results.length === 1) {
        onStartWithImage(results[0].url, results[0].name);
      } else {
        onStartWithMultipleImages(results);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const sampleQuickStarts = [
    {
      id: 'perfume-sample',
      title: isAr ? 'صورة منتج عطر فاخر' : 'Luxury Perfume Product',
      category: isAr ? 'تجارة إلكترونية' : 'E-Commerce',
      size: '1080 × 1080',
      url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'watch-sample',
      title: isAr ? 'ساعة يد كلاسيكية' : 'Classic Wristwatch',
      category: isAr ? 'استوديو' : 'Studio Shot',
      size: '1080 × 1080',
      url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'shoes-sample',
      title: isAr ? 'حذاء رياضي عصري' : 'Modern Sneakers',
      category: isAr ? 'منشور سوشيال' : 'Social Post',
      size: '1080 × 1350',
      url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const toolCategories = [
    {
      id: 'filters',
      titleAr: 'الفلاتر الإبداعية',
      titleEn: 'Creative Filters',
      descAr: 'فلاتر سينمائية، فينتاج، أبيض وأسود، وتأثيرات ضوئية متدرجة بلمسة واحدة.',
      descEn: 'Cinematic, vintage, high-contrast B&W, and lighting presets in 1 click.',
      img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
      tab: 'editor' as const,
    },
    {
      id: 'object_ai',
      titleAr: 'تحديد الكائنات وعزلها',
      titleEn: 'Object & AI Cutout',
      descAr: 'إزالة خلفية المنتجات آلياً وفرشاة استعادة دقيقة ومسح الأجسام غير المرغوبة.',
      descEn: 'Automatic background isolation, precision mask brush, and smart object removal.',
      img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      tab: 'backgrounds' as const,
    },
    {
      id: 'adjustments',
      titleAr: 'التحسينات ومعايرة الألوان',
      titleEn: 'Adjustments & Grading',
      descAr: 'تحكم احترافي بالسطوع، التباين، التشبع، الحرارة، HSL، ومنحنيات النغمات.',
      descEn: 'Master brightness, contrast, saturation, tint, HSL channels, and tone curves.',
      img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      tab: 'editor' as const,
    },
    {
      id: 'point_ops',
      titleAr: 'المعالجة النقطية',
      titleEn: 'Point Processing',
      descAr: 'معادلة الهيستوجرام، التباين النقطي، العتبة الثنائية، والمعالجة الرياضية للبكسلات.',
      descEn: 'Histogram equalization, point contrast stretch, thresholding, and math LUTs.',
      img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      tab: 'editor' as const,
    },
    {
      id: 'local_ops',
      titleAr: 'المعالجة المكانية والمحلية',
      titleEn: 'Local Spatial Processing',
      descAr: 'الترشيح المكاني، التنعيم الغاوسي، زيادة الحدة، واكتشاف الحواف بخوارزمية Sobel.',
      descEn: 'Spatial 3x3/5x5 convolution, Gaussian blur, Laplacian sharpen, and Sobel edges.',
      img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      tab: 'editor' as const,
    },
    {
      id: 'global_ops',
      titleAr: 'المعالجة الشاملة والمورفولوجيا',
      titleEn: 'Global & Morphology',
      descAr: 'العمليات المورفولوجية من تمدد وتآكل وفتح وإغلاق، والتحويلات الهندسية المتقدمة.',
      descEn: 'Morphological dilation, erosion, opening, closing, and frequency filtering.',
      img: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      tab: 'editor' as const,
    },
  ];

  return (
    <div id="pixelora-home-page" className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="w-full">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Desktop 2-column layout matching Reference Image 1)     */}
        {/* ========================================================================= */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#0F172A]">
          {/* Subtle background ambient decorations */}
          <div className="absolute top-1/4 -start-24 w-96 h-96 bg-[#6338E8]/10 dark:bg-[#6338E8]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 end-10 w-80 h-80 bg-[#20BFC4]/10 dark:bg-[#20BFC4]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Heading, Value Proposition & Actions */}
              <div className="lg:col-span-6 flex flex-col items-start text-start">
                {/* Pill badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#6338E8]/10 text-[#6338E8] dark:bg-[#6338E8]/20 dark:text-[#20BFC4] mb-5 border border-[#6338E8]/15 dark:border-[#6338E8]/30 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? 'محرر الصور الاحترافي على الويب' : 'Professional Web-Based Image Editor'}</span>
                </div>

                {/* Main Hero Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#121A33] dark:text-white leading-[1.2] mb-5">
                  <span>{isAr ? 'حوّل أفكارك الإبداعية' : 'Transform Your Ideas'}</span>
                  <br />
                  <span className="bg-gradient-to-r from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] bg-clip-text text-transparent">
                    {isAr ? 'إلى صور مذهلة' : 'Into Stunning Visuals'}
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-8 max-w-xl">
                  {isAr
                    ? 'Pixelora هو محرر صور متكامل يجمع بين البساطة والقوة، يوفّر كل ما تحتاجه لتحرير صورك باحترافية من الفلاتر الإبداعية إلى أدوات المعالجة المتقدمة.'
                    : 'Pixelora is a comprehensive image editor blending simplicity with power, offering everything you need to edit photos professionally—from creative filters to advanced processing.'}
                </p>

                {/* CTA Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <button
                    id="hero-start-btn"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#6338E8] to-[#4F8FE8] hover:from-[#5229db] hover:to-[#3e7fd9] shadow-md shadow-[#6338E8]/25 hover:shadow-lg hover:shadow-[#6338E8]/35 transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{isAr ? 'ابدأ التحرير الآن' : 'Start Editing Now'}</span>
                    <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                  </button>

                  <button
                    id="hero-blank-btn"
                    onClick={() =>
                      onStartBlank(1080, 1080, isAr ? 'تصميم جديد (1080x1080)' : 'New Blank Canvas')
                    }
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <Play className="w-4 h-4 text-[#20BFC4]" />
                    <span>{isAr ? 'إنشاء لوحة عمل فارغة' : 'Create Blank Canvas'}</span>
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center gap-5 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#4F8FE8]" />
                    <span>{isAr ? 'يدعم العربية والإنجليزية' : 'Bilingual Arabic & English'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-[#20BFC4]" />
                    <span>{isAr ? 'يعمل على جميع الأجهزة' : 'Works on All Devices'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-[#6338E8]" />
                    <span>{isAr ? 'لا يحتاج إلى تثبيت تطبيق' : 'No Installation Required'}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Editor Mockup Frame */}
              <div className="lg:col-span-6 relative">
                {/* Floating ambient geometry accents */}
                <div className="absolute -top-4 -end-4 w-12 h-12 rounded-xl bg-gradient-to-tr from-[#6338E8] to-[#20BFC4] opacity-80 blur-xs hidden sm:block" />
                <div className="absolute -bottom-6 -start-6 w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4F8FE8] to-[#20BFC4] opacity-70 blur-xs hidden sm:block" />

                {/* Main Dark Mockup Window */}
                <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-[#0F172A] text-slate-200 group">
                  {/* Mockup Titlebar */}
                  <div className="h-9 px-4 bg-[#1E293B] border-b border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="text-[11px] font-mono text-slate-400 ms-2 font-medium">
                        Pixelora Studio — Landscape_Grading.pxl
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300 font-semibold">
                        Ready
                      </span>
                    </div>
                  </div>

                  {/* Mockup Workspace Body */}
                  <div className="grid grid-cols-12 min-h-[340px] sm:min-h-[380px] bg-[#090D16]">
                    {/* Left Mock Toolbar */}
                    <div className="col-span-2 border-e border-slate-800 bg-[#0D1322] p-2 flex flex-col gap-2">
                      <div className="p-2 rounded-lg bg-[#6338E8]/20 text-[#6338E8] dark:text-[#20BFC4] flex flex-col items-center gap-1 cursor-pointer">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[9px] font-bold">{isAr ? 'فلاتر' : 'Filters'}</span>
                      </div>
                      <div className="p-2 rounded-lg hover:bg-slate-800/80 text-slate-400 flex flex-col items-center gap-1 cursor-pointer">
                        <Sliders className="w-4 h-4" />
                        <span className="text-[9px] font-medium">{isAr ? 'تحسينات' : 'Adjust'}</span>
                      </div>
                      <div className="p-2 rounded-lg hover:bg-slate-800/80 text-slate-400 flex flex-col items-center gap-1 cursor-pointer">
                        <Scissors className="w-4 h-4" />
                        <span className="text-[9px] font-medium">{isAr ? 'عزل' : 'Cutout'}</span>
                      </div>
                      <div className="p-2 rounded-lg hover:bg-slate-800/80 text-slate-400 flex flex-col items-center gap-1 cursor-pointer">
                        <Cpu className="w-4 h-4" />
                        <span className="text-[9px] font-medium">{isAr ? 'معالجة' : 'Pixels'}</span>
                      </div>
                    </div>

                    {/* Central Canvas Viewport with Before/After Split */}
                    <div className="col-span-7 p-3 flex flex-col justify-between">
                      {/* Image Canvas Container */}
                      <div className="relative w-full h-[260px] sm:h-[280px] rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner select-none">
                        {/* After Image (Full background) */}
                        <img
                          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                          alt="Enhanced Mountain Lake"
                          className="w-full h-full object-cover saturate-150 contrast-125"
                          referrerPolicy="no-referrer"
                        />

                        {/* Before Image (Clipped Left Side) */}
                        <div
                          className="absolute inset-y-0 start-0 overflow-hidden"
                          style={{ width: `${heroSplitPos}%` }}
                        >
                          <img
                            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"
                            alt="Original Mountain Lake"
                            className="absolute top-0 start-0 h-full max-w-none grayscale saturate-50 brightness-90"
                            style={{ width: '400px' }}
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Interactive Split Divider Handle */}
                        <div
                          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-md"
                          style={{
                            [isAr ? 'right' : 'left']: `${heroSplitPos}%`,
                          }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white text-slate-900 shadow-lg flex items-center justify-center text-[10px] font-bold">
                            ‹›
                          </div>
                        </div>

                        {/* Interactive Range Input overlay */}
                        <input
                          type="range"
                          min="15"
                          max="85"
                          value={heroSplitPos}
                          onChange={(e) => setHeroSplitPos(Number(e.target.value))}
                          className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
                          title="Drag to compare before & after"
                        />

                        {/* Badges */}
                        <div className="absolute top-2 start-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                          {isAr ? 'قبل' : 'Before'}
                        </div>
                        <div className="absolute top-2 end-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#6338E8]/80 text-white backdrop-blur-xs">
                          {isAr ? 'بعد (Graded)' : 'After (Graded)'}
                        </div>
                      </div>

                      {/* Filmstrip / Layers bottom */}
                      <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-1">
                        <div className="w-12 h-9 rounded-md overflow-hidden border border-[#6338E8] shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=120&q=80"
                            alt="thumb"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="w-12 h-9 rounded-md overflow-hidden border border-slate-700 shrink-0 opacity-60">
                          <img
                            src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=120&q=80"
                            alt="thumb"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="w-12 h-9 rounded-md overflow-hidden border border-slate-700 shrink-0 opacity-60">
                          <img
                            src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=120&q=80"
                            alt="thumb"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Inspector Panel */}
                    <div className="col-span-3 border-s border-slate-800 bg-[#0D1322] p-3 flex flex-col justify-between">
                      <div>
                        <div className="text-[11px] font-bold text-slate-300 pb-2 border-b border-slate-800 mb-3">
                          {isAr ? 'التحسينات' : 'Adjustments'}
                        </div>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>{isAr ? 'السطوع' : 'Brightness'}</span>
                              <span className="font-mono text-[#20BFC4]">+10</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="w-[60%] h-full bg-[#20BFC4] rounded-full" />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>{isAr ? 'التباين' : 'Contrast'}</span>
                              <span className="font-mono text-[#4F8FE8]">+15</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="w-[68%] h-full bg-[#4F8FE8] rounded-full" />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>{isAr ? 'التشبع' : 'Saturation'}</span>
                              <span className="font-mono text-[#6338E8]">+12</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="w-[64%] h-full bg-[#6338E8] rounded-full" />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>{isAr ? 'حرارة اللون' : 'Warmth'}</span>
                              <span className="font-mono text-amber-400">+5</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div className="w-[55%] h-full bg-amber-400 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-1.5 px-2 rounded-lg bg-[#6338E8] hover:bg-[#5229db] text-white text-[11px] font-bold text-center transition-colors cursor-pointer"
                      >
                        {isAr ? 'جرّب على صورتك' : 'Try With Image'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. FOUR-PILLAR TRUST / HIGHLIGHTS STRIP (Matching Reference Image 1)      */}
        {/* ========================================================================= */}
        <section className="py-12 bg-white dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {/* Item 1: Auto Save */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#20BFC4]/10 text-[#20BFC4] flex items-center justify-center mb-3">
                  <Cloud className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#121A33] dark:text-white mb-1">
                  {isAr ? 'حفظ تلقائي' : 'Auto Save'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'لا تفقد أعمالك أبداً' : 'Never lose your design projects'}
                </p>
              </div>

              {/* Item 2: High Quality */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#4F8FE8]/10 text-[#4F8FE8] flex items-center justify-center mb-3">
                  <Diamond className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#121A33] dark:text-white mb-1">
                  {isAr ? 'جودة عالية' : 'High Quality'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'تصدير بجودة احترافية' : 'Full HD & lossless export'}
                </p>
              </div>

              {/* Item 3: Fast Performance */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#6338E8]/10 text-[#6338E8] flex items-center justify-center mb-3">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#121A33] dark:text-white mb-1">
                  {isAr ? 'أداء سريع' : 'Fast Performance'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'تجربة سلسة وفعالة' : 'Smooth in-browser processing'}
                </p>
              </div>

              {/* Item 4: Professional Tools */}
              <div className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-[#6338E8]/10 text-[#6338E8] dark:text-[#20BFC4] flex items-center justify-center mb-3">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#121A33] dark:text-white mb-1">
                  {isAr ? 'أدوات احترافية' : 'Pro Tools'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'كل ما تحتاجه في مكان واحد' : 'Everything in one integrated suite'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. MID SECTION: "أكثر من مجرد محرر صور" (Matching Reference Image 1)       */}
        {/* ========================================================================= */}
        <section className="py-16 lg:py-24 bg-[#F1F5F9] dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-800/80 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Portrait Before/After Split Viewer & Palette Card */}
              <div className="lg:col-span-6 relative">
                {/* Floating Color Palette Card */}
                <div className="absolute -top-4 -start-4 z-20 bg-white dark:bg-slate-800 p-2.5 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 hidden sm:flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-[#6338E8]" />
                  <div className="w-4 h-4 rounded-md bg-[#4F8FE8]" />
                  <div className="w-4 h-4 rounded-md bg-[#20BFC4]" />
                  <div className="w-4 h-4 rounded-md bg-amber-400" />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 ms-1 font-mono">
                    HSL Palette
                  </span>
                </div>

                {/* Main Portrait Interactive Split Mockup */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <div className="relative h-[340px] sm:h-[400px] w-full select-none overflow-hidden">
                    {/* After Image (Full background) */}
                    <img
                      src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
                      alt="Portrait After Color Grading"
                      className="w-full h-full object-cover contrast-115 saturate-125"
                      referrerPolicy="no-referrer"
                    />

                    {/* Before Image (Clipped Left Side) */}
                    <div
                      className="absolute inset-y-0 start-0 overflow-hidden"
                      style={{ width: `${portraitSplitPos}%` }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80"
                        alt="Portrait Before"
                        className="absolute top-0 start-0 h-full max-w-none grayscale saturate-50"
                        style={{ width: '600px' }}
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Split Divider */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-lg"
                      style={{
                        [isAr ? 'right' : 'left']: `${portraitSplitPos}%`,
                      }}
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white text-slate-900 shadow-xl flex items-center justify-center text-xs font-bold">
                        ‹›
                      </div>
                    </div>

                    {/* Interactive Drag Input */}
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={portraitSplitPos}
                      onChange={(e) => setPortraitSplitPos(Number(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
                      title="Drag to compare"
                    />

                    {/* Badges */}
                    <div className="absolute bottom-3 start-3 px-3 py-1 rounded-lg text-xs font-bold bg-black/60 text-white backdrop-blur-xs">
                      {isAr ? 'الأصل (Original)' : 'Original'}
                    </div>
                    <div className="absolute bottom-3 end-3 px-3 py-1 rounded-lg text-xs font-bold bg-[#6338E8]/90 text-white backdrop-blur-xs">
                      {isAr ? 'معايرة سينمائية (Graded)' : 'Cinematic Grading'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Copy & Checklist */}
              <div className="lg:col-span-6 flex flex-col items-start text-start">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#20BFC4]/10 text-[#20BFC4] mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isAr ? 'لماذا Pixelora؟' : 'Why Pixelora?'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#121A33] dark:text-white leading-tight mb-4">
                  {isAr ? 'أكثر من مجرد محرر صور' : 'More Than Just an Image Editor'}
                </h2>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {isAr
                    ? 'في Pixelora، نقدم لك مجموعة متكاملة من الأدوات الاحترافية والفلاتر الذكية التي تساعدك على تحويل صورك إلى أعمال فنية بكل سهولة، سواء كنت مبتدئًا أو محترفًا.'
                    : 'Pixelora delivers a comprehensive suite of professional tools and smart filters that empower you to craft stunning visual artwork effortlessly—whether you are a beginner or a veteran creator.'}
                </p>

                {/* 4 Checklist Bullets with Verification icons */}
                <div className="space-y-3.5 w-full mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#20BFC4] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {isAr
                        ? 'تضبط الألوان والإضاءة بدقة (منحنيات النغمات، HSL، موازنة البياض)'
                        : 'Fine-tune color & lighting (Tone curves, HSL channels, white balance)'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#20BFC4] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {isAr
                        ? 'تطبيق فلاتر سينمائية وإبداعية بنقرة واحدة مع تعديل الكثافة'
                        : 'Apply cinematic & creative presets with instantaneous intensity sliders'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#20BFC4] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {isAr
                        ? 'تحدد الكائنات وتزيل الخلفيات بسهولة واستبدالها بقوالب جاهزة'
                        : 'Isolate objects & strip backgrounds with 1-click presets & mask brushes'}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#20BFC4] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {isAr
                        ? 'تعمل على جميع الأجهزة والمتصفحات بمعالجة محلية تحمي خصوصيتك'
                        : 'Operates smoothly across all devices with client-side privacy protection'}
                    </span>
                  </div>
                </div>

                {/* Explore link */}
                <button
                  onClick={() => onNavigateToTab('help')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-[#6338E8] dark:text-[#20BFC4] bg-[#6338E8]/10 dark:bg-[#6338E8]/20 hover:bg-[#6338E8]/20 dark:hover:bg-[#6338E8]/30 transition-colors cursor-pointer"
                >
                  <span>{isAr ? 'اكتشف جميع الميزات في دليل الاستخدام' : 'Explore All Features in User Guide'}</span>
                  <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. DRAG & DROP UPLOAD ZONE & QUICK PRESETS (Functional Core Preservation) */}
        {/* ========================================================================= */}
        <section className="py-14 bg-white dark:bg-[#0B1120] border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121A33] dark:text-white mb-2">
                {isAr ? 'ابدأ تحرير صورتك الآن' : 'Start Editing Your Image Now'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'ارفع صورتك مباشرة أو اختر نموذجاً تجريبياً جاهزاً للبدء الفوري'
                  : 'Upload an image directly or pick one of our preset demo assets to start'}
              </p>
            </div>

            {/* Drag & Drop Box */}
            <div
              id="home-dropzone"
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 mb-10 ${
                isDragging
                  ? 'border-[#6338E8] bg-[#6338E8]/5 dark:bg-[#6338E8]/10 scale-[1.01]'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50 hover:border-[#6338E8] hover:bg-white dark:hover:bg-slate-800 shadow-sm'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] flex items-center justify-center shadow-md text-white">
                  {isProcessing ? (
                    <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#121A33] dark:text-white mb-1">
                    {isAr ? 'اسحب وأفلت صورتك هنا، أو انقر للاختيار' : 'Drag and drop your images here, or browse'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'يدعم رفع صورة واحدة أو عدة صور معاً (PNG, JPG, WEBP, SVG) حتى 25 ميجابايت'
                      : 'Supports single or batch images (PNG, JPG, WEBP, SVG) up to 25MB'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-[#6338E8] to-[#4F8FE8] hover:opacity-95 shadow-sm transition-all active:scale-95"
                  >
                    {isAr ? 'اختر صورة من جهازك' : 'Browse from Device'}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartBlank(1080, 1080, isAr ? 'تصميم جديد (1080x1080)' : 'New Blank Canvas');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-transparent transition-all active:scale-95 shadow-2xs"
                  >
                    <Plus className="w-4 h-4 text-[#20BFC4]" />
                    <span>{isAr ? 'إنشاء لوحة عمل فارغة' : 'Create Blank Canvas'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Sample Presets */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#121A33] dark:text-white flex items-center gap-2">
                  <FileImage className="w-4 h-4 text-[#20BFC4]" />
                  <span>{isAr ? 'أو ابدأ مباشرة بنماذج جاهزة للتدريب والتحرير:' : 'Or start immediately with sample images:'}</span>
                </h3>
                <button
                  onClick={() => onNavigateToTab('backgrounds')}
                  className="text-xs font-bold text-[#6338E8] dark:text-[#20BFC4] hover:underline flex items-center gap-1"
                >
                  <span>{isAr ? 'استعراض مكتبة الخلفيات' : 'Browse Backgrounds'}</span>
                  <ArrowRight className={`w-3 h-3 ${isAr ? 'rotate-180' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {sampleQuickStarts.map((sample) => (
                  <div
                    key={sample.id}
                    onClick={() => onStartWithImage(sample.url, sample.title)}
                    className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/80 shadow-2xs hover:shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="aspect-4/3 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
                      <img
                        src={sample.url}
                        alt={sample.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-3.5">
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span className="font-bold text-[#6338E8] dark:text-[#20BFC4]">{sample.category}</span>
                        <span className="font-mono">{sample.size}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#121A33] dark:text-white truncate">
                        {sample.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. SIX CATEGORIES SHOWCASE GRID (Matching Reference Image 1)               */}
        {/* ========================================================================= */}
        <section className="py-16 lg:py-24 bg-[#F1F5F9] dark:bg-[#0F172A] border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#6338E8]/10 text-[#6338E8] dark:bg-[#6338E8]/20 dark:text-[#20BFC4] mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'كل ما تحتاجه في مكان واحد' : 'Everything in One Place'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#121A33] dark:text-white mb-3">
                {isAr ? 'أدوات وفلاتر متنوعة' : 'Diverse Tools & Filters'}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {isAr
                  ? 'من الفلاتر السينمائية إلى أدوات المعالجة المتقدمة، ستجد كل ما تحتاجه لتحويل أفكارك إلى صور مذهلة.'
                  : 'From cinematic filters to advanced mathematical processing, discover everything you need to turn your vision into reality.'}
              </p>
            </div>

            {/* 6 Category Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {toolCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => onNavigateToTab(cat.tab)}
                  className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
                >
                  <div className="aspect-16/9 w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                    <img
                      src={cat.img}
                      alt={isAr ? cat.titleAr : cat.titleEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 start-3 text-white font-bold text-sm drop-shadow-sm">
                      {isAr ? cat.titleAr : cat.titleEn}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                      {isAr ? cat.descAr : cat.descEn}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs font-bold text-[#6338E8] dark:text-[#20BFC4]">
                      <span>{isAr ? 'تجربة الأداة' : 'Try Tool'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. CALL-TO-ACTION BOTTOM BANNER (Matching Reference Image 1)               */}
        {/* ========================================================================= */}
        <section className="py-14 bg-white dark:bg-[#0B1120]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#121A33] via-[#1E293B] to-[#2E276E] text-white p-8 sm:p-12 shadow-xl border border-slate-700/60">
              {/* Background Glow */}
              <div className="absolute top-0 end-0 w-80 h-80 bg-[#6338E8]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 start-0 w-80 h-80 bg-[#20BFC4]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-start">
                <div className="max-w-xl">
                  {/* Brand header */}
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                    <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] bg-clip-text text-transparent">
                      Pixelora
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[#20BFC4] font-medium">
                      بيكسلورا
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">
                    {isAr ? 'ابدأ رحلتك الإبداعية الآن.' : 'Start Your Creative Journey Now.'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isAr
                      ? 'انضم إلى آلاف المستخدمين الذين يختارون Pixelora لتحرير صورهم بسهولة واحترافية.'
                      : 'Join thousands of creators who choose Pixelora to transform their imagery with elegance and power.'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="hidden lg:block text-end pe-4 border-e border-slate-700">
                    <span className="text-xs font-serif italic text-[#20BFC4] block">
                      {isAr ? 'إبداعك' : 'Creativity'}
                    </span>
                    <span className="text-sm font-bold tracking-wider">
                      {isAr ? 'بلا حدود' : 'Without Limits'}
                    </span>
                  </div>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-[#121A33] bg-white hover:bg-slate-100 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <span>{isAr ? 'ابدأ الآن' : 'Start Now'}</span>
                    <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
