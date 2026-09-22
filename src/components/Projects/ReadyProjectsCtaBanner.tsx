import React from 'react';
import { Sparkles, PlusCircle } from 'lucide-react';

interface ReadyProjectsCtaBannerProps {
  onNewProject: () => void;
  isAr: boolean;
}

export const ReadyProjectsCtaBanner: React.FC<ReadyProjectsCtaBannerProps> = ({
  onNewProject,
  isAr,
}) => {
  return (
    <section className="relative overflow-hidden rounded-3xl p-6 sm:p-10 my-12 border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-[#EEF2FF] via-[#F0FDFA] to-[#F8FAFC] dark:from-[#18153A] dark:via-[#0F172A] dark:to-[#0F172A] shadow-xs">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 end-0 w-80 h-80 bg-[#6338E8]/10 dark:bg-[#6338E8]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 start-0 w-80 h-80 bg-[#20BFC4]/10 dark:bg-[#20BFC4]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-start">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6338E8] via-[#4F8FE8] to-[#20BFC4] text-white flex items-center justify-center shrink-0 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#121A33] dark:text-white">
              {isAr ? 'هل تحتاج إلى مشروع مخصص؟' : 'Need a custom design canvas?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              {isAr
                ? 'يمكنك إنشاء مشروعك الخاص من الصفر، وتحديد أبعاد اللوحة والألوان حسب احتياجاتك الإبداعية.'
                : 'Start fresh with a custom blank canvas, set specific dimensions, or bring your own visual assets.'}
            </p>
          </div>
        </div>

        <button
          onClick={onNewProject}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-[#6338E8] to-[#4F8FE8] hover:opacity-95 shadow-md hover:shadow-lg transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAr ? 'ابدأ من الصفر' : 'Start from Scratch'}</span>
        </button>
      </div>
    </section>
  );
};
