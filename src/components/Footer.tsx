import React from 'react';
import { Sparkles, Layers, Image as ImageIcon, Heart, Github, Instagram, Youtube, Send } from 'lucide-react';

interface FooterProps {
  language: 'ar' | 'en';
  darkMode?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const isAr = language === 'ar';

  return (
    <footer
      id="pixelora-main-footer"
      className="border-t py-8 px-4 sm:px-6 lg:px-8 transition-colors bg-[#F8FAFC] dark:bg-[#0B0F19] border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        {/* Brand & Developer Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-start">
          <div className="flex items-center gap-3">
            <img
              src="/pixelora_logo_with_name.svg"
              alt="Pixelora"
              className="h-7 sm:h-8 w-auto max-w-[140px] sm:max-w-[160px] object-contain select-none"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div
              style={{ display: 'none' }}
              className="items-center gap-2"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] p-[1.5px] shadow-2xs">
                <div className="w-full h-full bg-white dark:bg-[#0B0F19] rounded-[5.5px] flex items-center justify-center">
                  <span className="font-extrabold text-xs bg-gradient-to-r from-[#6338E8] to-[#20BFC4] bg-clip-text text-transparent">
                    P
                  </span>
                </div>
              </div>
              <span className="font-extrabold text-sm tracking-wider text-[#121A33] dark:text-white">PIXELORA</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Create · Edit · Transform
            </span>
          </div>
          <div className="hidden sm:block w-px h-6 bg-slate-300 dark:bg-slate-800 self-center" />
          <div className="text-slate-500 dark:text-slate-400 text-xs self-center font-medium">
            <span>{isAr ? 'تطوير فريق Pixelora' : 'Developed by Pixelora Team'}</span>
          </div>
        </div>

        {/* Center Navigation / Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-slate-600 dark:text-slate-300 font-medium text-xs">
          <span className="flex items-center gap-1.5 hover:text-[#6338E8] dark:hover:text-[#20BFC4] transition-colors cursor-default">
            <Sparkles className="w-3.5 h-3.5 text-[#20BFC4]" />
            <span>{isAr ? 'الرئيسية' : 'Home'}</span>
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#6338E8] dark:hover:text-[#20BFC4] transition-colors cursor-default">
            <Layers className="w-3.5 h-3.5 text-[#4F8FE8]" />
            <span>{isAr ? 'أدوات التحرير' : 'Editor Tools'}</span>
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#6338E8] dark:hover:text-[#20BFC4] transition-colors cursor-default">
            <ImageIcon className="w-3.5 h-3.5 text-[#6338E8]" />
            <span>{isAr ? 'مكتبة الخلفيات' : 'Backgrounds'}</span>
          </span>
          <span className="flex items-center gap-1.5 hover:text-[#6338E8] dark:hover:text-[#20BFC4] transition-colors cursor-default">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>{isAr ? 'المشاريع' : 'Projects'}</span>
          </span>
        </div>

        {/* Social Icons & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:text-[#6338E8] dark:hover:text-[#20BFC4] hover:bg-slate-200/60 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/osama_shomis7"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:text-[#E1306C] dark:hover:text-[#E1306C] hover:bg-slate-200/60 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              aria-label="Instagram (@osama_shomis7)"
              title={isAr ? 'انستغرام (@osama_shomis7)' : 'Instagram (@osama_shomis7)'}
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:text-[#6338E8] dark:hover:text-[#20BFC4] hover:bg-slate-200/60 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              aria-label="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl hover:text-[#6338E8] dark:hover:text-[#20BFC4] hover:bg-slate-200/60 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              aria-label="Telegram"
            >
              <Send className="w-4 h-4" />
            </a>
          </div>
          <span className="text-slate-500 dark:text-slate-400 text-xs font-normal">
            {isAr ? '© 2025 Pixelora. جميع الحقوق محفوظة.' : '© 2025 Pixelora. All rights reserved.'}
          </span>
        </div>
      </div>
    </footer>
  );
};

