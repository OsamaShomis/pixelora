import React, { useState, useMemo, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  Download,
  BookOpen,
  FileText,
  Layers,
  Sparkles,
  Sliders,
  Cpu,
  Wand2,
  Box,
  Crop,
  PenTool,
  Type,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Lightbulb,
  Check,
  Zap,
  Info,
  RotateCcw,
  Palette,
  Image as ImageIcon,
  CheckCheck,
  Send,
  MessageSquare,
  Clock,
  ArrowRight,
  Globe,
  Share2,
  PlayCircle,
  HelpCircle as QuestionIcon,
  Monitor,
  Move,
  Scissors,
  Bookmark,
  Users,
  Terminal,
  ChevronRight,
  Star,
  X,
} from 'lucide-react';
import {
  HELP_SECTIONS,
  FAQS,
  TROUBLESHOOTING_ITEMS,
  WORKFLOW_STEPS,
  HelpSection,
} from '../../data/helpCenterData';
import { KEYBOARD_SHORTCUTS } from '../../data/shortcuts';

interface HelpPageProps {
  language: 'ar' | 'en';
  darkMode: boolean;
}

export const HelpPage: React.FC<HelpPageProps> = ({ language, darkMode }) => {
  const isAr = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-local-privacy');
  const [selectedShortcutCategory, setSelectedShortcutCategory] = useState<string>('all');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [downloadStatusText, setDownloadStatusText] = useState<string>('');
  const [downloadErrorText, setDownloadErrorText] = useState<string>('');
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const [feedbackText, setFeedbackText] = useState<string>('');

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('help-search-input');
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleDownloadPdf = async () => {
    // 1. Prevent simultaneous or double-click generation
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadErrorText('');
    setDownloadStatusText(isAr ? 'جاري التحضير...' : 'Preparing...');

    try {
      const { downloadUserGuidePdf } = await import('../../services/pdf/userGuidePdfService');
      await downloadUserGuidePdf({
        language,
        onProgress: (status) => setDownloadStatusText(status),
      });

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 4000);
    } catch (err) {
      console.warn('PDF download dynamic generation error, activating fallback:', err);
      // Fallback directly to static prebuilt file
      try {
        const filename = isAr ? 'Pixelora_User_Guide.pdf' : 'Pixelora_User_Guide_En.pdf';
        const link = document.createElement('a');
        link.href = '/' + filename;
        link.setAttribute('download', filename);
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 1000);

        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 4000);
      } catch (fallbackErr) {
        console.error('Fallback download failed:', fallbackErr);
        setDownloadErrorText(
          isAr
            ? 'تعذر إتمام التحميل، يرجى المحاولة مرة أخرى.'
            : 'Unable to generate the PDF. Please try again.'
        );
        setTimeout(() => setDownloadErrorText(''), 5000);
      }
    } finally {
      // 2. Guaranteed loading state reset on both success and failure
      setIsDownloading(false);
      setDownloadStatusText('');
    }
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackModalOpen(false);
      setFeedbackText('');
    }, 2000);
  };

  // Map icon strings to Lucide components
  const renderIcon = (iconName: string, className = 'w-5 h-5') => {
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Layout':
      case 'Layers':
        return <Layers className={className} />;
      case 'Crop':
        return <Crop className={className} />;
      case 'PenTool':
        return <PenTool className={className} />;
      case 'Type':
        return <Type className={className} />;
      case 'Sliders':
        return <Sliders className={className} />;
      case 'Palette':
        return <Palette className={className} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'Wand2':
        return <Wand2 className={className} />;
      case 'Box':
        return <Box className={className} />;
      case 'Download':
        return <Download className={className} />;
      case 'Keyboard':
        return <Keyboard className={className} />;
      case 'AlertCircle':
        return <AlertCircle className={className} />;
      case 'HelpCircle':
        return <HelpCircle className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      default:
        return <FileText className={className} />;
    }
  };

  // Filter sections by search or active category
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      if (selectedSectionId === 'all') return HELP_SECTIONS;
      return HELP_SECTIONS.filter((s) => s.id === selectedSectionId || s.category === selectedSectionId);
    }
    return HELP_SECTIONS.filter((sec) => {
      const matchTitle =
        sec.titleAr.toLowerCase().includes(q) || sec.titleEn.toLowerCase().includes(q);
      const matchBrief =
        sec.briefAr.toLowerCase().includes(q) || sec.briefEn.toLowerCase().includes(q);
      const matchTopics = sec.topics.some(
        (t) =>
          t.titleAr.toLowerCase().includes(q) ||
          t.titleEn.toLowerCase().includes(q) ||
          t.summaryAr.toLowerCase().includes(q) ||
          t.summaryEn.toLowerCase().includes(q)
      );
      return matchTitle || matchBrief || matchTopics;
    });
  }, [searchQuery, selectedSectionId]);

  // Filter FAQs by search
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return FAQS;
    return FAQS.filter(
      (f) =>
        f.questionAr.toLowerCase().includes(q) ||
        f.questionEn.toLowerCase().includes(q) ||
        f.answerAr.toLowerCase().includes(q) ||
        f.answerEn.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Sidebar navigation menu items
  const navCategories = [
    { id: 'all', titleAr: 'الدليل العام الشامل', titleEn: 'Complete Guide', icon: 'BookOpen' },
    { id: 'getting-started', titleAr: '01. البدء السريع', titleEn: '01. Quick Start', icon: 'Sparkles' },
    { id: 'workspace', titleAr: '02. واجهة المحرر', titleEn: '02. Workspace Anatomy', icon: 'Layout' },
    { id: 'files-projects', titleAr: '03. الملفات والمشاريع', titleEn: '03. Files & Projects', icon: 'Box' },
    { id: 'basic-image-tools', titleAr: '04. أدوات التحرير الأساسية', titleEn: '04. Editing Tools', icon: 'Crop' },
    { id: 'drawing-creative-tools', titleAr: '05. الرسم والمتجهات', titleEn: '05. Drawing & Vectors', icon: 'PenTool' },
    { id: 'typography-text', titleAr: '06. النصوص والخطوط', titleEn: '06. Typography & Text', icon: 'Type' },
    { id: 'layers-masks', titleAr: '07. الطبقات والأقنعة', titleEn: '07. Layers & Masks', icon: 'Layers' },
    { id: 'adjustments-system', titleAr: '08. نظام التحسينات اللونية', titleEn: '08. Color Adjustments', icon: 'Sliders' },
    { id: 'preset-filters', titleAr: '09. الفلاتر الجاهزة (64 فلتر)', titleEn: '09. Preset Filters (64)', icon: 'Palette' },
    { id: 'image-processing', titleAr: '10. معالجة الصور المتقدمة DSP', titleEn: '10. Image Processing DSP', icon: 'Cpu' },
    { id: 'background-object-tools', titleAr: '11. عزل وإزالة الكائنات', titleEn: '11. Cutout & Inpainting', icon: 'Scissors' },
    { id: 'export-system', titleAr: '12. نظام التصدير والمخرجات', titleEn: '12. Export Pipeline', icon: 'Download' },
    { id: 'keyboard-shortcuts', titleAr: '13. اختصارات لوحة المفاتيح', titleEn: '13. Master Shortcuts', icon: 'Keyboard' },
    { id: 'troubleshooting', titleAr: '14. استكشاف الأخطاء وحلها', titleEn: '14. Troubleshooting', icon: 'AlertCircle' },
    { id: 'faq', titleAr: '15. الأسئلة الشائعة', titleEn: '15. FAQ Knowledge Base', icon: 'HelpCircle' },
  ];

  return (
    <div id="pixelora-help-page" className="min-h-screen bg-[#F1F5F9] dark:bg-[#0B1120] text-slate-800 dark:text-slate-100">
      {/* ========================================================================= */}
      {/* 1. TOP HERO & SEARCH (Directly inspired by Reference Image 2)              */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-10 pb-16 border-b border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white via-[#F8FAFC] to-[#F1F5F9] dark:from-[#0B1120] dark:via-[#0F172A] dark:to-[#0F172A]">
        {/* Floating background decorative badges */}
        <div className="absolute top-10 start-12 w-10 h-10 rounded-2xl bg-[#6338E8]/10 text-[#6338E8] dark:bg-[#6338E8]/20 flex items-center justify-center shadow-xs hidden md:flex animate-pulse">
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="absolute top-14 end-16 w-11 h-11 rounded-2xl bg-[#20BFC4]/10 text-[#20BFC4] dark:bg-[#20BFC4]/20 flex items-center justify-center shadow-xs hidden md:flex">
          <QuestionIcon className="w-6 h-6" />
        </div>
        <div className="absolute bottom-6 start-24 w-8 h-8 rounded-xl bg-[#4F8FE8]/10 text-[#4F8FE8] dark:bg-[#4F8FE8]/20 flex items-center justify-center shadow-xs hidden md:flex">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="absolute bottom-8 end-28 w-9 h-9 rounded-xl bg-amber-400/10 text-amber-500 flex items-center justify-center shadow-xs hidden md:flex">
          <PlayCircle className="w-5 h-5" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#6338E8]/10 text-[#6338E8] dark:bg-[#6338E8]/20 dark:text-[#20BFC4] mb-4 border border-[#6338E8]/15 dark:border-[#6338E8]/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{isAr ? 'مركز المساعدة الرسمي' : 'Official Help Center'}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#121A33] dark:text-white tracking-tight mb-4">
            {isAr ? 'مركز المساعدة' : 'Help Center'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            {isAr
              ? 'كل ما تحتاجه من شروحات وإرشادات لاستخدام Pixelora بكل سهولة واحترافية.'
              : 'Everything you need to learn, master, and operate Pixelora smoothly and professionally.'}
          </p>

          {/* Interactive Search Bar with Ctrl+K badge */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative flex items-center rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700/80 overflow-hidden focus-within:ring-2 focus-within:ring-[#6338E8] focus-within:border-transparent transition-all">
              <div className="ps-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                id="help-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن موضوع، أداة، أو اختصار (مثال: قص، HSL، تصدير)...' : 'Search topics, tools, shortcuts (e.g. crop, HSL, export)...'}
                className="w-full py-3.5 px-3 bg-transparent text-sm text-[#121A33] dark:text-white placeholder-slate-400 focus:outline-none"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="pe-4 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="pe-4 hidden sm:flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600">
                  <span>Ctrl</span>
                  <span>+</span>
                  <span>K</span>
                </div>
              )}
            </div>

            {searchQuery && (
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-start px-2 flex justify-between">
                <span>
                  {isAr ? `نتائج البحث عن: "${searchQuery}"` : `Results for: "${searchQuery}"`}
                </span>
                <span className="font-bold text-[#6338E8] dark:text-[#20BFC4]">
                  {filteredSections.length} {isAr ? 'أقسام مطابقة' : 'matching sections'}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THREE-COLUMN / DOCUMENTATION BODY (Matching Reference Image 2)          */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ===================================================================== */}
          {/* LEFT SIDEBAR: Comprehensive Navigation Categories                     */}
          {/* ===================================================================== */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2">
                {isAr ? 'فهرس الموضوعات' : 'Topic Index'}
              </h3>
              <nav className="space-y-1">
                {navCategories.map((item) => {
                  const isActive = selectedSectionId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedSectionId(item.id);
                        if (item.id === 'keyboard-shortcuts') {
                          const elem = document.getElementById('section-shortcuts');
                          elem?.scrollIntoView({ behavior: 'smooth' });
                        } else if (item.id === 'troubleshooting') {
                          const elem = document.getElementById('section-troubleshooting');
                          elem?.scrollIntoView({ behavior: 'smooth' });
                        } else if (item.id === 'faq') {
                          const elem = document.getElementById('section-faq');
                          elem?.scrollIntoView({ behavior: 'smooth' });
                        } else if (item.id !== 'all') {
                          const elem = document.getElementById(`sec-${item.id}`);
                          elem?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-start cursor-pointer ${
                        isActive
                          ? 'bg-[#6338E8] text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {renderIcon(item.icon, `w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`)}
                        <span>{isAr ? item.titleAr : item.titleEn}</span>
                      </div>
                      {isActive && <ChevronRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Support Callout Box */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-2xs text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#4F8FE8]/10 text-[#4F8FE8] flex items-center justify-center mb-3">
                <Send className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-[#121A33] dark:text-white mb-1.5">
                {isAr ? 'ما زلت تحتاج إلى مساعدة؟' : 'Still Need Assistance?'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                {isAr
                  ? 'فريق الدعم الفني جاهز لمساعدتك في أي استفسار أو مشكلة تقنية.'
                  : 'Our developer and support team is ready to answer questions and receive feedback.'}
              </p>
              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-bold text-[#121A33] dark:text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{isAr ? 'تواصل معنا' : 'Contact Support'}</span>
                <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </aside>

          {/* ===================================================================== */}
          {/* CENTER COLUMN: Welcome Hero, 4-Step Start, Topic Deep Dives, FAQ     */}
          {/* ===================================================================== */}
          <main className="lg:col-span-6 space-y-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{isAr ? 'الدعم' : 'Support'}</span>
              <span>/</span>
              <span className="text-[#6338E8] dark:text-[#20BFC4] font-semibold">
                {isAr ? 'الدليل العام' : 'General Documentation'}
              </span>
            </div>

            {/* Welcome Greeting Banner (Matching Reference Image 2) */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121A33] dark:text-white">
                  {isAr ? 'مرحباً بك في Pixelora' : 'Welcome to Pixelora'}
                </h2>
                <span className="text-2xl">👋</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {isAr
                  ? 'Pixelora هو محرر صور متكامل يتيح لك تعديل صورك بكل سهولة واحترافية، مع مجموعة واسعة من الأدوات والخيارات الإبداعية.'
                  : 'Pixelora is a comprehensive image editor empowering you to modify and elevate your imagery smoothly and professionally.'}
              </p>

              {/* 4 Feature highlight badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 text-center">
                  <div className="w-8 h-8 rounded-lg bg-[#6338E8]/10 text-[#6338E8] flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h5 className="text-[11px] font-bold text-[#121A33] dark:text-white mb-0.5">
                    {isAr ? 'فلاتر إبداعية' : 'Creative Filters'}
                  </h5>
                  <p className="text-[10px] text-slate-400">
                    {isAr ? 'بمستوى أشهر المحررات' : 'Top presets'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 text-center">
                  <div className="w-8 h-8 rounded-lg bg-[#4F8FE8]/10 text-[#4F8FE8] flex items-center justify-center mx-auto mb-2">
                    <Star className="w-4 h-4" />
                  </div>
                  <h5 className="text-[11px] font-bold text-[#121A33] dark:text-white mb-0.5">
                    {isAr ? 'أدوات احترافية' : 'Pro Tools'}
                  </h5>
                  <p className="text-[10px] text-slate-400">
                    {isAr ? 'لجميع المستويات' : 'For all skill levels'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 text-center">
                  <div className="w-8 h-8 rounded-lg bg-[#20BFC4]/10 text-[#20BFC4] flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h5 className="text-[11px] font-bold text-[#121A33] dark:text-white mb-0.5">
                    {isAr ? 'آمن وسريع' : 'Fast & Secure'}
                  </h5>
                  <p className="text-[10px] text-slate-400">
                    {isAr ? 'أداء عالي محلي' : 'Client-side speed'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 text-center">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h5 className="text-[11px] font-bold text-[#121A33] dark:text-white mb-0.5">
                    {isAr ? 'يعمل على الويب' : 'Web Based'}
                  </h5>
                  <p className="text-[10px] text-slate-400">
                    {isAr ? 'لا يحتاج لتثبيت' : 'Zero install'}
                  </p>
                </div>
              </div>
            </div>

            {/* "ابدأ من هنا" (Start Here - 4 Step Cards matching Reference Image 2) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#121A33] dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#6338E8]" />
                  <span>{isAr ? 'ابدأ من هنا 🚀' : 'Start Here 🚀'}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {isAr ? 'إذا كنت جديداً على Pixelora، ننصح باتباع هذه الخطوات:' : 'If you are new to Pixelora, follow these steps:'}
                </span>
              </div>

              {/* Step 1: Workspace Anatomy */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-2xs hover:border-[#6338E8] transition-colors">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
                    <img
                      src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80"
                      alt="Workspace preview"
                      className="w-full h-full object-cover opacity-80"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#6338E8] dark:text-[#20BFC4] mb-1">
                      <span>1.</span>
                      <span>{isAr ? 'التعرف على واجهة المحرر' : 'Learn the Workspace'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {isAr
                        ? 'تعرف على أقسام واجهة المحرر: الشريط العلوي، شريط الأدوات، لوحة الخصائص، ومساحة العمل.'
                        : 'Explore workspace sections: Header topbar, vertical toolbox, properties inspector, and viewport.'}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSectionId('workspace');
                        document.getElementById('sec-workspace')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-[#6338E8] dark:text-[#20BFC4] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAr ? 'اقرأ المزيد' : 'Read More'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Essential Editing Tools */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-2xs hover:border-[#6338E8] transition-colors">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-full sm:w-44 h-28 rounded-xl bg-slate-100 dark:bg-slate-900 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-3">
                    <div className="grid grid-cols-3 gap-2 w-full text-slate-600 dark:text-slate-400">
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs">
                        <Crop className="w-4 h-4 text-[#6338E8]" />
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs">
                        <PenTool className="w-4 h-4 text-[#20BFC4]" />
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs">
                        <Type className="w-4 h-4 text-[#4F8FE8]" />
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs">
                        <Move className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs">
                        <Layers className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center shadow-xs">
                        <Palette className="w-4 h-4 text-purple-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#6338E8] dark:text-[#20BFC4] mb-1">
                      <span>2.</span>
                      <span>{isAr ? 'أدوات التحرير الأساسية' : 'Essential Editing Tools'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {isAr
                        ? 'تعرف على أدوات القص، التدوير، القلم المتجه، الفرشاة، والممحاة، وإضافة النصوص العربية.'
                        : 'Discover Crop, Rotate, Pen tool, Brush, Eraser, and Arabic typography insertion.'}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSectionId('basic-image-tools');
                        document.getElementById('sec-basic-image-tools')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-[#6338E8] dark:text-[#20BFC4] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAr ? 'اقرأ المزيد' : 'Read More'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 3: Filters & Adjustments */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-2xs hover:border-[#6338E8] transition-colors">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700 flex items-center justify-center gap-1 p-2">
                    <div className="flex-1 h-full rounded overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=150&q=80"
                        alt="filter1"
                        className="w-full h-full object-cover contrast-125"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 h-full rounded overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80"
                        alt="filter2"
                        className="w-full h-full object-cover saturate-150"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 h-full rounded overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80"
                        alt="filter3"
                        className="w-full h-full object-cover grayscale"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#6338E8] dark:text-[#20BFC4] mb-1">
                      <span>3.</span>
                      <span>{isAr ? 'تطبيق الفلاتر والتحسينات' : 'Apply Filters & Adjustments'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {isAr
                        ? 'اكتشف الفلاتر الحسابية والسينمائية (64 فلتر)، منحنيات RGB، موازن HSL، واستوديو Lightroom.'
                        : 'Explore 64 mathematical/cinematic filters, RGB tone curves, HSL mixer, and Lightroom Studio.'}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSectionId('preset-filters');
                        document.getElementById('sec-preset-filters')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-[#6338E8] dark:text-[#20BFC4] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAr ? 'اقرأ المزيد' : 'Read More'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 4: Background Cutout & Templates */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-2xs hover:border-[#6338E8] transition-colors">
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-full sm:w-44 h-28 rounded-xl overflow-hidden bg-gradient-to-tr from-[#6338E8]/20 to-[#20BFC4]/20 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center p-3 relative">
                    <Scissors className="w-10 h-10 text-[#6338E8] drop-shadow-md" />
                    <Sparkles className="w-5 h-5 text-[#20BFC4] absolute top-3 end-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#6338E8] dark:text-[#20BFC4] mb-1">
                      <span>4.</span>
                      <span>{isAr ? 'عزل الخلفيات ومكتبة القوالب' : 'Background Cutout & Templates'}</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {isAr
                        ? 'استخدم أدوات عزل الخلفية وإزالة الشوائب، واستبدل الخلفيات بتدرجات وقوالب احترافية جاهزة.'
                        : 'Use automatic and manual background cutout tools, remove blemishes, and swap in clean backdrop templates.'}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSectionId('background-object-tools');
                        document.getElementById('sec-background-object-tools')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="text-xs font-bold text-[#6338E8] dark:text-[#20BFC4] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isAr ? 'اقرأ المزيد' : 'Read More'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Deep-Dive Documentation Chapters Render */}
            <div className="space-y-6 pt-4">
              <h3 className="text-base font-bold text-[#121A33] dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#20BFC4]" />
                <span>{isAr ? 'فصول الدليل المكتملة' : 'Detailed Chapters'}</span>
              </h3>

              {filteredSections.map((sec) => (
                <div
                  key={sec.id}
                  id={`sec-${sec.id}`}
                  className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-2xs space-y-6"
                >
                  {/* Section Title Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#6338E8]/10 text-[#6338E8] dark:bg-[#6338E8]/20 dark:text-[#20BFC4] flex items-center justify-center shrink-0">
                        {renderIcon(sec.icon)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-[#6338E8] dark:text-[#20BFC4]">
                            {sec.num}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 font-semibold">
                            {isAr ? sec.categoryAr : sec.categoryEn}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-[#121A33] dark:text-white">
                          {isAr ? sec.titleAr : sec.titleEn}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Section Overview */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {isAr ? sec.overviewAr : sec.overviewEn}
                  </p>

                  {/* Topics deep dive */}
                  <div className="space-y-4">
                    {sec.topics.map((t) => (
                      <div
                        key={t.id}
                        className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 border border-slate-200/60 dark:border-slate-700/50 space-y-3"
                      >
                        <h5 className="text-sm font-bold text-[#121A33] dark:text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#6338E8]" />
                          <span>{isAr ? t.titleAr : t.titleEn}</span>
                        </h5>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700/40">
                            <span className="font-bold text-[#6338E8] dark:text-[#20BFC4] block mb-1">
                              {isAr ? 'ما الذي تفعله الأداة؟' : 'What does it do?'}
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {isAr ? t.whatItDoesAr : t.whatItDoesEn}
                            </p>
                          </div>

                          <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/50 dark:border-slate-700/40">
                            <span className="font-bold text-[#4F8FE8] block mb-1">
                              {isAr ? 'متى يجب استخدامها؟' : 'When should I use it?'}
                            </span>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                              {isAr ? t.whenToUseAr : t.whenToUseEn}
                            </p>
                          </div>
                        </div>

                        {/* Operational Steps */}
                        <div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                            {isAr ? 'خطوات التنفيذ المباشرة:' : 'Operational Steps:'}
                          </span>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed ps-1">
                            {(isAr ? t.howToUseAr : t.howToUseEn).map((step, idx) => (
                              <li key={idx}>{step}</li>
                            ))}
                          </ol>
                        </div>

                        {/* Parameters table if present */}
                        {t.parameters && t.parameters.length > 0 && (
                          <div className="overflow-x-auto pt-2">
                            <table className="w-full text-[11px] text-start border-collapse">
                              <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 font-bold">
                                  <th className="py-1 px-2">{isAr ? 'المعامل' : 'Parameter'}</th>
                                  <th className="py-1 px-2">{isAr ? 'النوع' : 'Type'}</th>
                                  <th className="py-1 px-2">{isAr ? 'القيمة الافتراضية' : 'Default'}</th>
                                  <th className="py-1 px-2">{isAr ? 'الوصف' : 'Description'}</th>
                                </tr>
                              </thead>
                              <tbody>
                                {t.parameters.map((p, pIdx) => (
                                  <tr key={pIdx} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="py-1 px-2 font-mono text-[#6338E8] dark:text-[#20BFC4]">
                                      {isAr ? p.nameAr : p.nameEn}
                                    </td>
                                    <td className="py-1 px-2 text-slate-400">{p.type}</td>
                                    <td className="py-1 px-2 font-mono">{p.defaultVal}</td>
                                    <td className="py-1 px-2 text-slate-600 dark:text-slate-400">
                                      {isAr ? p.descriptionAr : p.descriptionEn}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tips and Warnings */}
                  {sec.tipsAr && sec.tipsAr.length > 0 && (
                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
                        <span className="font-bold block">{isAr ? 'نصيحة للمحترفين:' : 'Pro Tip:'}</span>
                        {(isAr ? sec.tipsAr : sec.tipsEn || []).map((tip, idx) => (
                          <p key={idx}>{tip}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Master Keyboard Shortcuts Matrix Section */}
            <div id="section-shortcuts" className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3 gap-2">
                <h3 className="text-base font-bold text-[#121A33] dark:text-white flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-[#6338E8]" />
                  <span>{isAr ? 'جدول اختصارات لوحة المفاتيح المعتمدة' : 'Master Keyboard Shortcuts'}</span>
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#6338E8]/10 text-[#6338E8] dark:text-[#20BFC4] font-mono font-bold">
                    {KEYBOARD_SHORTCUTS.length} {isAr ? 'اختصار موثق' : 'shortcuts'}
                  </span>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {[
                  { id: 'all', nameAr: 'الكل', nameEn: 'All' },
                  { id: 'general', nameAr: 'عام والمشروع', nameEn: 'General & Project' },
                  { id: 'tools', nameAr: 'أدوات التحرير', nameEn: 'Editor Tools' },
                  { id: 'editing', nameAr: 'الطبقات والتحرير', nameEn: 'Layers & Editing' },
                  { id: 'view', nameAr: 'العرض والتكبير', nameEn: 'View & Zoom' },
                ].map((catTab) => {
                  const isSelected = selectedShortcutCategory === catTab.id;
                  return (
                    <button
                      key={catTab.id}
                      onClick={() => setSelectedShortcutCategory(catTab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#6338E8] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isAr ? catTab.nameAr : catTab.nameEn}
                    </button>
                  );
                })}
              </div>

              {/* Grid of Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {KEYBOARD_SHORTCUTS.filter(
                  (sc) => selectedShortcutCategory === 'all' || sc.category === selectedShortcutCategory
                ).map((sc) => (
                  <div
                    key={sc.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40 flex items-center justify-between gap-3 hover:border-[#6338E8]/40 transition-colors"
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="font-bold text-slate-800 dark:text-white truncate">
                        {isAr ? sc.actionAr : sc.actionEn}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {isAr ? sc.descriptionAr : sc.descriptionEn}
                      </div>
                    </div>
                    <kbd className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-mono text-[11px] font-bold text-[#6338E8] dark:text-[#20BFC4] shadow-xs shrink-0 whitespace-nowrap">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Troubleshooting Diagnostics Section */}
            <div id="section-troubleshooting" className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
                <h3 className="text-base font-bold text-[#121A33] dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? 'دليل حل المشكلات السريع' : 'Troubleshooting & Diagnostics'}</span>
                </h3>
              </div>

              <div className="space-y-3">
                {TROUBLESHOOTING_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/40 space-y-2 text-xs"
                  >
                    <div className="font-bold text-rose-500 dark:text-rose-400">
                      {isAr ? item.problemAr : item.problemEn}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {isAr ? 'السبب: ' : 'Cause: '}
                      </span>
                      {isAr ? item.causeAr : item.causeEn}
                    </div>
                    <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                      <span className="font-bold">{isAr ? 'الحل المباشر: ' : 'Solution: '}</span>
                      {isAr ? item.solutionAr : item.solutionEn}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ Accordion (Matching Reference Image 2) */}
            <div id="section-faq" className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 p-6 sm:p-8 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
                <h3 className="text-base font-bold text-[#121A33] dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#20BFC4]" />
                  <span>{isAr ? 'الأسئلة الشائعة ❓' : 'Frequently Asked Questions'}</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {isAr ? 'إجابات سريعة على أكثر الأسئلة شيوعاً' : 'Quick answers to common questions'}
                </span>
              </div>

              <div className="space-y-2">
                {filteredFaqs.map((faq) => {
                  const isExpanded = expandedFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                        className="w-full p-4 flex items-center justify-between text-start text-xs font-bold text-[#121A33] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors cursor-pointer"
                      >
                        <span>{isAr ? faq.questionAr : faq.questionEn}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 pt-3 bg-slate-50/50 dark:bg-slate-900/30">
                          {isAr ? faq.answerAr : faq.answerEn}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </main>

          {/* ===================================================================== */}
          {/* RIGHT SIDEBAR: Sections List, Quick Links, Real PDF Download, Suggest */}
          {/* ===================================================================== */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Quick Links Card (Matching Reference Image 2) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                <span>{isAr ? 'روابط سريعة' : 'Quick Actions'}</span>
              </h3>

              <div className="space-y-2">
                {/* 1. Official PDF Download Action */}
                <button
                  id="help-download-pdf-btn"
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#6338E8]/10 to-[#20BFC4]/10 hover:from-[#6338E8]/20 hover:to-[#20BFC4]/20 border border-[#6338E8]/20 text-start transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#6338E8] text-white flex items-center justify-center shrink-0 shadow-xs">
                      {isDownloading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : downloadSuccess ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#121A33] dark:text-white block group-hover:text-[#6338E8] dark:group-hover:text-[#20BFC4] transition-colors">
                        {isAr ? 'تحميل دليل المستخدم (PDF)' : 'Download User Guide (PDF)'}
                      </span>
                      <span className={`text-[10px] font-mono ${downloadErrorText ? 'text-red-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                        {downloadErrorText
                          ? downloadErrorText
                          : isDownloading && downloadStatusText
                            ? downloadStatusText
                            : isAr
                              ? '64 صفحة • 360 ك.ب • عربي كامل'
                              : '64 Pages • 250 KB • Full English'}
                      </span>
                    </div>
                  </div>
                </button>

                {/* 2. Keyboard shortcuts quick-jump */}
                <button
                  onClick={() => {
                    const elem = document.getElementById('section-shortcuts');
                    elem?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-start cursor-pointer"
                >
                  <Keyboard className="w-4 h-4 text-slate-400" />
                  <span>{isAr ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts'}</span>
                </button>

                {/* 3. Diagnostics quick-jump */}
                <button
                  onClick={() => {
                    const elem = document.getElementById('section-troubleshooting');
                    elem?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-start cursor-pointer"
                >
                  <AlertCircle className="w-4 h-4 text-slate-400" />
                  <span>{isAr ? 'تشخيص وحل المشكلات' : 'Diagnostics & Troubleshooting'}</span>
                </button>

                {/* 4. FAQ quick-jump */}
                <button
                  onClick={() => {
                    const elem = document.getElementById('section-faq');
                    elem?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors text-start cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>{isAr ? 'الأسئلة الشائعة (FAQ)' : 'FAQ & Knowledge Base'}</span>
                </button>
              </div>
            </div>

            {/* Have a Suggestion Card (Matching Reference Image 2) */}
            <div className="bg-gradient-to-br from-[#121A33] via-[#1E293B] to-[#2E276E] text-white rounded-2xl p-5 shadow-lg border border-slate-700 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                <Lightbulb className="w-5 h-5 text-amber-300" />
              </div>

              <h4 className="text-sm font-bold mb-1">
                {isAr ? 'هل لديك اقتراح؟' : 'Have a Suggestion?'}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {isAr
                  ? 'نود سماع أفكارك ومقترحاتك لتحسين تجربة استخدام Pixelora.'
                  : 'We would love to hear your feedback and ideas to elevate Pixelora.'}
              </p>

              <button
                onClick={() => setFeedbackModalOpen(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#6338E8] to-[#4F8FE8] hover:opacity-95 text-white text-xs font-bold text-center transition-all cursor-pointer"
              >
                {isAr ? 'إرسال اقتراح' : 'Send Feedback'}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEEDBACK & SUGGESTIONS MODAL                                              */}
      {/* ========================================================================= */}
      {feedbackModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-base font-bold text-[#121A33] dark:text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <span>{isAr ? 'إرسال اقتراح أو ملاحظة' : 'Submit Feedback or Suggestion'}</span>
              </h3>
              <button
                onClick={() => setFeedbackModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackSent ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-[#121A33] dark:text-white">
                  {isAr ? 'شكراً لك على اقتراحك!' : 'Thank you for your suggestion!'}
                </h4>
                <p className="text-xs text-slate-500">
                  {isAr ? 'تم استلام ملاحظتك بنجاح وسنعمل على مراجعتها.' : 'Your feedback was successfully registered.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isAr ? 'ما الذي تود تحسينه في Pixelora؟' : 'What would you like improved in Pixelora?'}
                  </label>
                  <textarea
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={isAr ? 'اكتب اقتراحك هنا بكل حرية...' : 'Type your suggestions or feature ideas...'}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-[#121A33] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6338E8]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#6338E8] text-white text-xs font-bold hover:bg-[#5229db] transition-colors"
                  >
                    {isAr ? 'إرسال' : 'Submit'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
