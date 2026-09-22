import React from 'react';
import {
  Clock,
  Layers,
  Copy,
  Trash2,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import { SavedProject } from '../../types';

interface SavedProjectsSectionProps {
  projects: SavedProject[];
  onOpenProject: (project: SavedProject) => void;
  onDuplicateProject: (project: SavedProject) => void;
  onDeleteProject: (projectId: string) => void;
  onNewProject: () => void;
  deleteConfirmId: string | null;
  setDeleteConfirmId: (id: string | null) => void;
  formatDate: (isoString: string) => string;
  isAr: boolean;
}

export const SavedProjectsSection: React.FC<SavedProjectsSectionProps> = ({
  projects,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
  onNewProject,
  deleteConfirmId,
  setDeleteConfirmId,
  formatDate,
  isAr,
}) => {
  return (
    <section id="my-saved-projects-section" className="mt-16 pt-10 border-t border-slate-200/80 dark:border-slate-800">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6338E8]/10 dark:bg-[#6338E8]/20 text-[#6338E8] dark:text-[#20BFC4] flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#121A33] dark:text-white">
              {isAr ? 'مشاريعي المحفوظة' : 'My Saved Projects'}
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              {projects.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'مشاريعك وتصميماتك السابقة المحفوظة في متصفحك محلياً، يمكنك المتابعة عليها أو تكرارها'
              : 'Your browser-saved designs. Continue editing, duplicate, or manage them anytime.'}
          </p>
        </div>
      </div>

      {/* Grid or Empty State */}
      {projects.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-800/30">
          <FolderOpen className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto mb-2 opacity-60" />
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            {isAr ? 'لا توجد مشاريع شخصية محفوظة بعد' : 'No saved local projects yet'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
            {isAr
              ? 'عند قيامك بحفظ أي تصميم من داخل المحرر أو استخدام أحد المشاريع الجاهزة، ستظهر هنا تلقائياً.'
              : 'When you save designs inside the editor, they will automatically appear here.'}
          </p>
          <button
            onClick={onNewProject}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6338E8] hover:bg-[#522ecc] transition-all"
          >
            {isAr ? 'إنشاء تصميم جديد' : 'Create New Design'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="group rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              {/* Thumbnail */}
              <div
                onClick={() => onOpenProject(project)}
                className="aspect-16/10 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer select-none"
              >
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-purple-50 dark:bg-slate-800 text-[#6338E8]">
                    <Layers className="w-10 h-10 opacity-40" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={() => onOpenProject(project)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6338E8] hover:bg-[#522ecc] flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isAr ? 'فتح في المحرر' : 'Open in Editor'}</span>
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h4
                  onClick={() => onOpenProject(project)}
                  className="text-base font-bold text-slate-900 dark:text-white mb-2 truncate cursor-pointer hover:text-[#6338E8] dark:hover:text-[#20BFC4]"
                >
                  {project.name}
                </h4>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatDate(project.updatedAt)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#20BFC4]" />
                    <span>
                      {project.width}×{project.height}
                    </span>
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenProject(project)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#6338E8] dark:text-[#20BFC4] bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
                    >
                      {isAr ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => onDuplicateProject(project)}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title={isAr ? 'نسخ المشروع' : 'Duplicate'}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {deleteConfirmId === project.id ? (
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-rose-500 font-semibold">
                        {isAr ? 'تأكيد الحذف؟' : 'Delete?'}
                      </span>
                      <button
                        onClick={() => {
                          onDeleteProject(project.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-2 py-1 rounded-md text-[11px] font-bold text-white bg-rose-500 hover:bg-rose-600"
                      >
                        {isAr ? 'نعم' : 'Yes'}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded-md text-[11px] text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {isAr ? 'إلغاء' : 'No'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(project.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title={isAr ? 'حذف المشروع' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
