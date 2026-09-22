import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './components/Home/HomePage';
import { EditorPage } from './components/Editor/EditorPage';
import { BackgroundsPage } from './components/Backgrounds/BackgroundsPage';
import { ProjectsPage } from './components/Projects/ProjectsPage';
import { HelpPage } from './components/Help/HelpPage';
import { EditorState, SavedProject, BackgroundTemplate, Layer } from './types';
import {
  INITIAL_EDITOR_STATE,
  getSavedProjects,
  saveProjectToStorage,
  deleteProjectFromStorage,
  subscribeToProjects,
  sanitizeProject,
  DEFAULT_FILTERS,
} from './data/sampleProjects';
import { migrateLayersToEffectLayers } from './utils/effectLayers';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  // Navigation & Preferences State
  const [activeTab, setActiveTab] = useState<'home' | 'editor' | 'backgrounds' | 'projects' | 'help'>('home');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('pixelora_theme') === 'dark';
  });
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  // Active Editor State
  const [editorState, setEditorState] = useState<EditorState>(INITIAL_EDITOR_STATE);

  // Projects list
  const [projects, setProjects] = useState<SavedProject[]>([]);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync Dark Mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('pixelora_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('pixelora_theme', 'light');
    }
  }, [darkMode]);

  // Sync Language & RTL/LTR
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Load Projects on startup & subscribe to background IndexedDB sync
  useEffect(() => {
    const saved = getSavedProjects();
    setProjects(saved);
    const unsubscribe = subscribeToProjects((updated) => {
      setProjects(updated);
    });
    return () => unsubscribe();
  }, []);

  // Save Project Handler
  const handleSaveProject = async (stateToSave: EditorState) => {
    const safeLayers = Array.isArray(stateToSave?.layers) ? stateToSave.layers : [];
    const width = Number(stateToSave?.canvasWidth) || 1080;
    const height = Number(stateToSave?.canvasHeight) || 1080;
    const name = stateToSave?.projectName || (language === 'ar' ? 'مشروع جديد' : 'New Project');

    // Strip bulky history stack to prevent localStorage quota exhaustion
    const cleanState: EditorState = {
      ...INITIAL_EDITOR_STATE,
      ...stateToSave,
      projectName: name,
      canvasWidth: width,
      canvasHeight: height,
      layers: safeLayers,
      history: [],
      historyIndex: -1,
    };

    let thumb = safeLayers.find((l) => l.type === 'image' && l.source)?.source || '';
    if (!thumb) {
      thumb = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80';
    }

    const projectToSave: SavedProject = {
      id: stateToSave?.projectId || 'proj_' + Date.now(),
      name,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      width,
      height,
      layersCount: safeLayers.length,
      thumbnail: thumb,
      state: cleanState,
    };

    await saveProjectToStorage(projectToSave);
    const updated = getSavedProjects();
    setProjects(updated);
    showToast(language === 'ar' ? 'تم حفظ المشروع بنجاح في متصفحك!' : 'Project saved locally!');
  };

  // Duplicate Project Handler
  const handleDuplicateProject = async (project: SavedProject) => {
    const sanitized = sanitizeProject(project);
    const duplicated: SavedProject = {
      ...sanitized,
      id: 'proj_' + Date.now(),
      name: `${sanitized.name} (${language === 'ar' ? 'نسخة' : 'Copy'})`,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    await saveProjectToStorage(duplicated);
    setProjects(getSavedProjects());
    showToast(language === 'ar' ? 'تم مضاعفة المشروع بنجاح' : 'Project duplicated');
  };

  // Delete Project Handler
  const handleDeleteProject = (projectId: string) => {
    const remaining = deleteProjectFromStorage(projectId);
    setProjects(remaining);
    showToast(language === 'ar' ? 'تم حذف المشروع' : 'Project deleted');
  };

  // Start with single image
  const handleStartWithImage = (imageUrl: string, name: string) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      const maxDim = 900;
      if (w > maxDim || h > maxDim) {
        const ratio = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const newLayer: Layer = {
        id: 'layer_main_' + Date.now(),
        name,
        type: 'image',
        source: imageUrl,
        x: Math.round((1080 - w) / 2),
        y: Math.round((1080 - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 100,
        visible: true,
        zIndex: 1,
        filters: { ...DEFAULT_FILTERS },
      };

      setEditorState({
        ...INITIAL_EDITOR_STATE,
        projectId: 'proj_' + Date.now(),
        projectName: name,
        canvasWidth: Math.max(1080, w),
        canvasHeight: Math.max(1080, h),
        layers: [newLayer],
        selectedLayerId: newLayer.id,
      });
      setActiveTab('editor');
      showToast(language === 'ar' ? 'تم فتح الصورة في مساحة العمل' : 'Image loaded into workspace');
    };
    img.src = imageUrl;
  };

  // Start with multiple images
  const handleStartWithMultipleImages = (images: { url: string; name: string }[]) => {
    const layers: Layer[] = [];
    let loadedCount = 0;

    images.forEach((imgObj, idx) => {
      const img = new Image();
      img.onload = () => {
        let w = img.width;
        let h = img.height;
        const maxDim = 800;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }

        layers.push({
          id: 'layer_multi_' + Date.now() + '_' + idx,
          name: imgObj.name,
          type: 'image',
          source: imgObj.url,
          x: Math.round((1080 - w) / 2) + idx * 30,
          y: Math.round((1080 - h) / 2) + idx * 30,
          width: w,
          height: h,
          rotation: 0,
          opacity: 100,
          visible: true,
          zIndex: idx + 1,
          filters: { ...DEFAULT_FILTERS },
        });

        loadedCount++;
        if (loadedCount === images.length) {
          setEditorState({
            ...INITIAL_EDITOR_STATE,
            projectId: 'proj_' + Date.now(),
            projectName: images[0].name + ' (متعدد)',
            canvasWidth: 1080,
            canvasHeight: 1080,
            layers: layers,
            selectedLayerId: layers[0]?.id || null,
          });
          setActiveTab('editor');
          showToast(
            language === 'ar'
              ? `تم فتح ${images.length} صور في طبقات المحرر`
              : `Loaded ${images.length} images into layers`
          );
        }
      };
      img.src = imgObj.url;
    });
  };

  // Create blank project
  const handleStartBlank = (width: number, height: number, name: string) => {
    setEditorState({
      ...INITIAL_EDITOR_STATE,
      projectId: 'proj_' + Date.now(),
      projectName: name,
      canvasWidth: width,
      canvasHeight: height,
      layers: [],
      selectedLayerId: null,
      background: { type: 'transparent' },
    });
    setActiveTab('editor');
    showToast(language === 'ar' ? 'تم إنشاء مساحة عمل جديدة' : 'New canvas ready');
  };

  // Select Background Template
  const handleSelectBackgroundTemplate = (template: BackgroundTemplate) => {
    setEditorState((prev) => ({
      ...prev,
      background: {
        type: 'library',
        imageUrl: template.type === 'image' ? template.value : undefined,
        gradient: template.type === 'gradient' ? { from: '#6C4DFF', to: '#23B5D3', angle: 135 } : undefined,
      },
    }));
    setActiveTab('editor');
    showToast(
      language === 'ar' ? `تم تطبيق خلفية "${template.name}" على لوحة العمل` : `Background applied`
    );
  };

  // Custom Background Upload
  const handleCustomBackgroundUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setEditorState((prev) => ({
        ...prev,
        background: {
          type: 'custom_image',
          imageUrl: dataUrl,
        },
      }));
      setActiveTab('editor');
      showToast(language === 'ar' ? 'تم تعيين صورتك كخلفية للمشروع' : 'Custom background set');
    };
    reader.readAsDataURL(file);
  };

  // Open existing saved project
  const handleOpenProject = (project: SavedProject) => {
    const sanitized = sanitizeProject(project);
    const rawLayers = Array.isArray(sanitized.state.layers) ? sanitized.state.layers : [];
    const width = sanitized.state.canvasWidth || sanitized.width || 1080;
    const height = sanitized.state.canvasHeight || sanitized.height || 1080;

    const migratedLayers = migrateLayersToEffectLayers(
      rawLayers,
      width,
      height,
      language === 'ar'
    );

    setEditorState({
      ...INITIAL_EDITOR_STATE,
      ...sanitized.state,
      projectId: sanitized.id,
      projectName: sanitized.name,
      canvasWidth: width,
      canvasHeight: height,
      layers: migratedLayers,
      history: [],
      historyIndex: 0,
    });
    setActiveTab('editor');
    showToast(
      language === 'ar' ? `تم فتح المشروع "${sanitized.name}"` : `Opened "${sanitized.name}"`
    );
  };

  return (
    <div
      id="pixelora-root-app"
      className="min-h-screen flex flex-col bg-[#F1F5F9] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200"
    >
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-18 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#2DD4BF]" />
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        language={language}
        setLanguage={setLanguage}
        onNewProject={() =>
          handleStartBlank(1080, 1080, language === 'ar' ? 'تصميم جديد' : 'New Design')
        }
      />

      {/* Main Routed Page Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'home' && (
          <HomePage
            onStartWithImage={handleStartWithImage}
            onStartWithMultipleImages={handleStartWithMultipleImages}
            onStartBlank={handleStartBlank}
            onNavigateToTab={setActiveTab}
            language={language}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'editor' && (
          <EditorPage
            state={editorState}
            setState={setEditorState}
            onSaveProject={handleSaveProject}
            onNewProjectModalOpen={() =>
              handleStartBlank(1080, 1080, language === 'ar' ? 'تصميم جديد' : 'New Design')
            }
            language={language}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'backgrounds' && (
          <BackgroundsPage
            onSelectBackground={handleSelectBackgroundTemplate}
            onCustomBackgroundUpload={handleCustomBackgroundUpload}
            language={language}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsPage
            projects={projects}
            onOpenProject={handleOpenProject}
            onDuplicateProject={handleDuplicateProject}
            onDeleteProject={handleDeleteProject}
            onNewProject={() =>
              handleStartBlank(1080, 1080, language === 'ar' ? 'تصميم جديد' : 'New Design')
            }
            language={language}
            darkMode={darkMode}
          />
        )}

        {activeTab === 'help' && <HelpPage language={language} darkMode={darkMode} />}
      </main>

      {/* Footer (shown on all pages except full active Editor view) */}
      {activeTab !== 'editor' && (
        <Footer language={language} darkMode={darkMode} onNavigate={setActiveTab} />
      )}
    </div>
  );
}
