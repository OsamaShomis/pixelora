import React from 'react';
import { ArrowLeft, ArrowRight, Eye, Layers } from 'lucide-react';
import { ReadyProjectTemplate } from '../../data/readyProjectsData';

interface ReadyProjectCardProps {
  project: ReadyProjectTemplate;
  onUseProject: (project: ReadyProjectTemplate) => void;
  isAr: boolean;
}

export const ReadyProjectCard: React.FC<ReadyProjectCardProps> = ({
  project,
  onUseProject,
  isAr,
}) => {
  return (
    <div className="group rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-850 shadow-2xs hover:shadow-xl hover:border-[#6338E8]/40 dark:hover:border-[#20BFC4]/40 transition-all duration-300 flex flex-col justify-between">
      {/* Visual Thumbnail Frame */}
      <div
        onClick={() => onUseProject(project)}
        className="aspect-16/10 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer select-none"
      >
        <img
          src={project.thumbnail}
          alt={isAr ? project.nameAr : project.nameEn}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Pill Tag (Top right / start) */}
        <div className="absolute top-3 start-3 z-10">
          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide backdrop-blur-md bg-black/60 text-white/95 border border-white/10 shadow-xs">
            {isAr ? project.categoryLabelAr : project.categoryLabelEn}
          </span>
        </div>

        {/* Dimension indicator badge (Top end) */}
        <div className="absolute top-3 end-3 z-10">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium backdrop-blur-md bg-black/50 text-slate-200 border border-white/10 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#20BFC4]" />
            <span>
              {project.width}×{project.height}
            </span>
          </span>
        </div>
      </div>

      {/* Card Info Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onUseProject(project)}
            className="text-base sm:text-lg font-black text-[#121A33] dark:text-white mb-1.5 cursor-pointer hover:text-[#6338E8] dark:hover:text-[#20BFC4] transition-colors leading-tight"
          >
            {isAr ? project.nameAr : project.nameEn}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {isAr ? project.descriptionAr : project.descriptionEn}
          </p>
        </div>

        {/* Card Action Button matching reference */}
        <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
          <button
            onClick={() => onUseProject(project)}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#6338E8] dark:text-[#20BFC4] bg-[#6338E8]/10 hover:bg-[#6338E8] hover:text-white dark:bg-[#6338E8]/20 dark:hover:bg-[#20BFC4] dark:hover:text-slate-900 transition-all duration-200 flex items-center justify-center gap-2 group/btn active:scale-98"
          >
            <span>{isAr ? 'استخدام المشروع' : 'Use Project'}</span>
            {isAr ? (
              <ArrowLeft className="w-4 h-4 transition-transform group-hover/btn:-translate-x-1" />
            ) : (
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
