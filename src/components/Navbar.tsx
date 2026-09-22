import React from 'react';
import {
  Sparkles,
  LayoutGrid,
  Image as ImageIcon,
  FolderKanban,
  HelpCircle,
  Moon,
  Sun,
  Languages,
  PlusCircle,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'home' | 'editor' | 'backgrounds' | 'projects' | 'help';
  setActiveTab: (tab: 'home' | 'editor' | 'backgrounds' | 'projects' | 'help') => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  onNewProject: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
  onNewProject,
}) => {
  const isAr = language === 'ar';

  const navItemClass = (tab: typeof activeTab) =>
    `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
      activeTab === tab
        ? 'bg-white dark:bg-slate-700 text-[#6338E8] dark:text-[#20BFC4] shadow-xs font-semibold border border-slate-200/60 dark:border-transparent'
        : 'text-slate-600 dark:text-slate-300 hover:text-[#121A33] dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
    }`;

  return (
    <header
      id="pixelora-main-navbar"
      className="sticky top-0 z-40 border-b backdrop-blur-md transition-colors duration-200 bg-white/95 dark:bg-[#0B0F19]/95 border-slate-200/80 dark:border-slate-800 text-[#121A33] dark:text-slate-100 shadow-2xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 cursor-pointer select-none group focus:outline-hidden"
          title="Pixelora"
        >
          <img
            src="/pixelora_logo_with_name.svg"
            alt="Pixelora"
            className="h-8 sm:h-9 w-auto max-w-[160px] sm:max-w-[180px] object-contain select-none transition-transform duration-200 group-hover:scale-[1.02]"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div
            style={{ display: 'none' }}
            className="items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] p-[1.5px] shadow-xs group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-white dark:bg-[#0B0F19] rounded-[9.5px] flex items-center justify-center">
                <span className="font-extrabold text-base bg-gradient-to-r from-[#6338E8] to-[#4F8FE8] bg-clip-text text-transparent">
                  P
                </span>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight bg-gradient-to-r from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] bg-clip-text text-transparent">
                  Pixelora
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#6338E8]/10 text-[#6338E8] dark:bg-[#6338E8]/20 dark:text-[#20BFC4]">
                  بيكسلورا
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/50 text-sm font-medium">
          <button
            id="nav-home-btn"
            onClick={() => setActiveTab('home')}
            className={navItemClass('home')}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isAr ? 'الرئيسية' : 'Home'}</span>
          </button>

          <button
            id="nav-editor-btn"
            onClick={() => setActiveTab('editor')}
            className={navItemClass('editor')}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{isAr ? 'المحرر' : 'Editor'}</span>
          </button>

          <button
            id="nav-backgrounds-btn"
            onClick={() => setActiveTab('backgrounds')}
            className={navItemClass('backgrounds')}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{isAr ? 'مكتبة الخلفيات' : 'Backgrounds'}</span>
          </button>

          <button
            id="nav-projects-btn"
            onClick={() => setActiveTab('projects')}
            className={navItemClass('projects')}
          >
            <FolderKanban className="w-4 h-4" />
            <span>{isAr ? 'المشاريع الجاهزة' : 'Ready Projects'}</span>
          </button>

          <button
            id="nav-help-btn"
            onClick={() => setActiveTab('help')}
            className={navItemClass('help')}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{isAr ? 'المساعدة' : 'Help'}</span>
          </button>
        </nav>

        {/* Action Controls & Toggles */}
        <div className="flex items-center gap-2">
          {/* New Design Button */}
          <button
            id="navbar-new-project-btn"
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-[#6338E8] to-[#4F8FE8] hover:from-[#522ecc] hover:to-[#3e7fd9] shadow-xs hover:shadow-sm transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAr ? 'تصميم جديد' : 'New Project'}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            id="theme-toggle-btn"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 h-9 w-9 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center justify-center"
            title={darkMode ? (isAr ? 'الوضع الفاتح' : 'Light Mode') : (isAr ? 'الوضع الداكن' : 'Dark Mode')}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Language Toggle */}
          <button
            id="language-toggle-btn"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="h-9 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold"
            title={isAr ? 'تبديل للإنجليزية' : 'Switch to Arabic'}
            aria-label={isAr ? 'Switch to English' : 'Switch to Arabic'}
          >
            <Languages className="w-3.5 h-3.5 text-[#4F8FE8]" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
