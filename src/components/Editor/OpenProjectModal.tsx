import React, { useState, useEffect } from 'react';
import { X, FolderOpen, Clock, Layers, Trash2, Upload, FileImage, Plus } from 'lucide-react';
import { SavedProject } from '../../types';
import { getSavedProjects, deleteProjectFromStorage, subscribeToProjects } from '../../data/sampleProjects';

interface OpenProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (project: SavedProject) => void;
  onImportFile: () => void;
  language: 'ar' | 'en';
}

export const OpenProjectModal: React.FC<OpenProjectModalProps> = ({
  isOpen,
  onClose,
  onSelectProject,
  onImportFile,
  language,
}) => {
  const isAr = language === 'ar';
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    if (isOpen) {
      setProjects(getSavedProjects());
      const unsubscribe = subscribeToProjects((updated) => {
        setProjects(updated);
      });
      return () => unsubscribe();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = deleteProjectFromStorage(id);
    setProjects(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="open-project-modal"
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-800 border border-purple-100 dark:border-slate-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-base text-slate-900 dark:text-white">
            <FolderOpen className="w-5 h-5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'فتح مشروع محفوظ' : 'Open Saved Project'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                onImportFile();
              }}
              className="flex-1 py-3 px-4 rounded-xl border border-dashed border-[#6C4DFF]/40 dark:border-[#2DD4BF]/40 bg-purple-50/50 dark:bg-slate-900/60 hover:bg-purple-50 dark:hover:bg-slate-700 text-xs font-bold text-[#6C4DFF] dark:text-[#2DD4BF] flex items-center justify-center gap-2 transition-all group"
            >
              <Upload className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              <span>{isAr ? 'استيراد صورة من جهازك كطبقة جديدة' : 'Import Image from Device'}</span>
            </button>
          </div>

          {/* Saved Projects List */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 uppercase tracking-wider">
              {isAr ? 'المشاريع والتصاميم السابقة' : 'Saved Projects'}
            </h4>

            {projects.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50">
                <FileImage className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isAr ? 'لا توجد مشاريع محفوظة حاليًا' : 'No saved projects found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 hover:border-[#6C4DFF] dark:hover:border-[#2DD4BF] hover:shadow-md transition-all cursor-pointer group relative flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden border border-slate-200/60 dark:border-slate-700 flex items-center justify-center">
                        {proj.thumbnail ? (
                          <img
                            src={proj.thumbnail}
                            alt={proj.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <FileImage className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white truncate group-hover:text-[#6C4DFF] dark:group-hover:text-[#2DD4BF] transition-colors">
                          {proj.name}
                        </h5>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <span>{proj.width} × {proj.height} px</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {proj.layersCount || 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString(
                              isAr ? 'ar-EG' : 'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, proj.id)}
                      title={isAr ? 'حذف المشروع' : 'Delete Project'}
                      className="absolute top-2.5 left-2.5 sm:left-auto sm:right-2.5 p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-700 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
