import React, { useState, useMemo } from 'react';
import {
  FolderOpen,
  SearchX,
} from 'lucide-react';
import { SavedProject } from '../../types';
import { READY_PROJECT_TEMPLATES, ReadyProjectTemplate } from '../../data/readyProjectsData';
import { ReadyProjectsHero } from './ReadyProjectsHero';
import { ReadyCategoriesBar } from './ReadyCategoriesBar';
import { ReadyProjectCard } from './ReadyProjectCard';
import { ReadyProjectsCtaBanner } from './ReadyProjectsCtaBanner';
import { SavedProjectsSection } from './SavedProjectsSection';

interface ProjectsPageProps {
  projects: SavedProject[];
  onOpenProject: (project: SavedProject) => void;
  onDuplicateProject: (project: SavedProject) => void;
  onDeleteProject: (projectId: string) => void;
  onNewProject: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  onOpenProject,
  onDuplicateProject,
  onDeleteProject,
  onNewProject,
  language,
  darkMode,
}) => {
  const isAr = language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Convert ReadyProjectTemplate into a SavedProject instance when opened
  const handleUseReadyProject = (readyTemplate: ReadyProjectTemplate) => {
    const projectInstance: SavedProject = {
      id: 'proj_' + readyTemplate.id + '_' + Date.now(),
      name: isAr ? readyTemplate.nameAr : readyTemplate.nameEn,
      thumbnail: readyTemplate.thumbnail,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      width: readyTemplate.width,
      height: readyTemplate.height,
      layersCount: readyTemplate.layersCount,
      state: {
        ...readyTemplate.state,
        projectName: isAr ? readyTemplate.nameAr : readyTemplate.nameEn,
      },
    };
    onOpenProject(projectInstance);
  };

  // Filter Ready Projects
  const filteredReadyProjects = useMemo(() => {
    return READY_PROJECT_TEMPLATES.filter((project) => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && project.category !== selectedCategory) {
        return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAr = project.nameAr.toLowerCase().includes(q) || project.descriptionAr.toLowerCase().includes(q);
        const matchEn = project.nameEn.toLowerCase().includes(q) || project.descriptionEn.toLowerCase().includes(q);
        const matchCat = project.category.toLowerCase().includes(q);
        if (!matchAr && !matchEn && !matchCat) {
          return false;
        }
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Filter Saved Projects (matching search query)
  const filteredSavedProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase().trim();
    return projects.filter((p) => p.name.toLowerCase().includes(q));
  }, [projects, searchQuery]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div id="pixelora-ready-projects-page" className="flex-1 flex flex-col">
      {/* 1. HERO SECTION (Directly inspired by Reference Layout with Pixelora Brand) */}
      <ReadyProjectsHero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAr={isAr}
      />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* 2. CATEGORY PILL BAR */}
        <ReadyCategoriesBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          isAr={isAr}
        />

        {/* Section Heading & Counter matching reference */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6338E8]/10 dark:bg-[#6338E8]/20 text-[#6338E8] dark:text-[#20BFC4] flex items-center justify-center">
              <FolderOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#121A33] dark:text-white">
                {isAr ? 'جميع المشاريع الجاهزة' : 'All Ready Projects'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'اختر من بين مجموعتنا المتنوعة من المشاريع الجاهزة والمعدة باحترافية'
                  : 'Choose from our curated collection of professionally prepared design templates'}
              </p>
            </div>
          </div>

          <div className="self-start sm:self-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6338E8]/10 text-[#6338E8] dark:bg-[#6338E8]/20 dark:text-[#20BFC4] border border-[#6338E8]/20">
              {filteredReadyProjects.length} {isAr ? 'مشروع جاهز' : 'ready templates'}
            </span>
          </div>
        </div>

        {/* 3. READY PROJECTS GRID (Multi-column responsive grid matching reference) */}
        {filteredReadyProjects.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/40 my-6">
            <SearchX className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              {isAr ? 'لا توجد مشاريع جاهزة مطابقة لبحثك' : 'No matching ready projects found'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
              {isAr
                ? 'جرّب تغيير فئة العرض أو تعديل كلمات البحث للعثور على قوالب ومشاريع أخرى.'
                : 'Try selecting a different category or clearing search filters to see all available templates.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#6338E8] hover:bg-[#522ecc] transition-all"
            >
              {isAr ? 'عرض جميع المشاريع' : 'Show All Projects'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredReadyProjects.map((proj) => (
              <ReadyProjectCard
                key={proj.id}
                project={proj}
                onUseProject={handleUseReadyProject}
                isAr={isAr}
              />
            ))}
          </div>
        )}

        {/* 4. CTA BANNER (Inspired by reference bottom section) */}
        <ReadyProjectsCtaBanner
          onNewProject={onNewProject}
          isAr={isAr}
        />

        {/* 5. SAVED / LOCAL PROJECTS SECTION (Preserving existing user projects) */}
        <SavedProjectsSection
          projects={filteredSavedProjects}
          onOpenProject={onOpenProject}
          onDuplicateProject={onDuplicateProject}
          onDeleteProject={onDeleteProject}
          onNewProject={onNewProject}
          deleteConfirmId={deleteConfirmId}
          setDeleteConfirmId={setDeleteConfirmId}
          formatDate={formatDate}
          isAr={isAr}
        />
      </div>
    </div>
  );
};
