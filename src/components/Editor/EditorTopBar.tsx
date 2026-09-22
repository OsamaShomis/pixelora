import React, { useState, useRef, useEffect } from 'react';
import {
  Undo2,
  Redo2,
  RotateCcw,
  Save,
  Download,
  FolderOpen,
  FilePlus,
  Copy,
  Scissors,
  ClipboardPaste,
  Trash2,
  CheckSquare,
  Square,
  ChevronDown,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  Hand,
  Maximize2,
  Frame,
  Crop,
  LassoSelect,
  Upload,
  BookmarkPlus,
  Keyboard,
} from 'lucide-react';
import { EditorState } from '../../types';

interface EditorTopBarProps {
  state: EditorState;
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onSaveAs: () => void;
  onOpenExportModal: () => void;
  onOpenResizeModal?: () => void;
  onOpenImageSizeModal?: () => void;
  onOpenCanvasSizeModal?: () => void;
  onActivateCrop?: () => void;
  onOpenShortcutsModal?: () => void;
  onNewProject: () => void;
  onOpenProject: () => void;
  onOpenImageUpload: () => void;
  onResetCanvas: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  canPaste: boolean;
  onDuplicate: () => void;
  onDeleteSelected: () => void;
  onSelectAll: () => void;
  onDeselect: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  state,
  onUpdateState,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onSave,
  onSaveAs,
  onOpenExportModal,
  onOpenResizeModal,
  onOpenImageSizeModal,
  onOpenCanvasSizeModal,
  onActivateCrop,
  onOpenShortcutsModal,
  onNewProject,
  onOpenProject,
  onOpenImageUpload,
  onResetCanvas,
  onCut,
  onCopy,
  onPaste,
  canPaste,
  onDuplicate,
  onDeleteSelected,
  onSelectAll,
  onDeselect,
  language,
}) => {
  const isAr = language === 'ar';
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [projectName, setProjectName] = useState(state.projectName);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync internal project name if changed externally
  useEffect(() => {
    setProjectName(state.projectName);
  }, [state.projectName]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNameBlur = () => {
    setIsEditingName(false);
    onUpdateState((prev) => ({
      ...prev,
      projectName: projectName.trim() || prev.projectName,
    }));
  };

  // Selected layer for quick transformation bar
  const safeLayers = Array.isArray(state?.layers) ? state.layers : [];
  const selectedLayer = safeLayers.find((l) => l.id === state.selectedLayerId);

  const handleRotate = (deg: number) => {
    onUpdateState((prev) => {
      const prevLayers = Array.isArray(prev?.layers) ? prev.layers : [];
      const targetId = prev.selectedLayerId || (prevLayers.length > 0 ? prevLayers[0].id : null);
      if (!targetId) return prev;
      const targetLayer = prevLayers.find((l) => l.id === targetId);
      if (targetLayer?.locked) return prev;
      return {
        ...prev,
        layers: prevLayers.map((l) =>
          l.id === targetId ? { ...l, rotation: ((l.rotation || 0) + deg + 360) % 360 } : l
        ),
      };
    });
  };

  const handleFlip = (axis: 'h' | 'v') => {
    onUpdateState((prev) => {
      const prevLayers = Array.isArray(prev?.layers) ? prev.layers : [];
      const targetId = prev.selectedLayerId || (prevLayers.length > 0 ? prevLayers[0].id : null);
      if (!targetId) return prev;
      const targetLayer = prevLayers.find((l) => l.id === targetId);
      if (targetLayer?.locked) return prev;
      return {
        ...prev,
        layers: prevLayers.map((l) =>
          l.id === targetId
            ? {
                ...l,
                flipHorizontal: axis === 'h' ? !l.flipHorizontal : l.flipHorizontal,
                flipVertical: axis === 'v' ? !l.flipVertical : l.flipVertical,
              }
            : l
        ),
      };
    });
  };

  return (
    <div
      id="editor-top-bar"
      ref={menuRef}
      className="h-13 bg-white dark:bg-slate-800 border-b border-slate-200/90 dark:border-slate-700 px-3 sm:px-4 flex items-center justify-between gap-2 select-none z-30 shadow-2xs"
    >
      {/* Left: Menus & Project Name */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 relative overflow-visible py-1">
        {/* Project Name */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isEditingName ? (
            <input
              type="text"
              autoFocus
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#6C4DFF] bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-hidden shadow-2xs"
            />
          ) : (
            <span
              onClick={() => setIsEditingName(true)}
              className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF] cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 max-w-[170px] truncate border border-transparent hover:border-slate-200 dark:hover:border-transparent transition-all"
              title={isAr ? 'انقر لتعديل اسم المشروع' : 'Click to rename project'}
            >
              {state.projectName}
            </span>
          )}
        </div>

        {/* Clean Top Navigation Menus: ONLY File & Edit */}
        <div className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 relative overflow-visible">
          {/* File Menu (ملف) */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
              onMouseEnter={() => {
                if (activeMenu) setActiveMenu('file');
              }}
              className={`px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors ${
                activeMenu === 'file' ? 'bg-slate-100 dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF]' : ''
              }`}
            >
              <span>{isAr ? 'ملف' : 'File'}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeMenu === 'file' && (
              <div
                className={`absolute top-full ${
                  isAr ? 'right-0 text-right' : 'left-0 text-left'
                } mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 ring-1 ring-black/5`}
              >
                {/* New Project */}
                <button
                  onClick={() => {
                    onNewProject();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'إنشاء تصميم أو مشروع جديد بأبعاد مخصصة' : 'Create new project (Ctrl+N)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <FilePlus className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                    <span>{isAr ? 'تصميم جديد' : 'New Project'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+N</span>
                </button>

                {/* Open Project */}
                <button
                  onClick={() => {
                    onOpenProject();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'فتح مشروع محفوظ سابقاً من الذاكرة' : 'Open saved project (Ctrl+O)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <FolderOpen className="w-4 h-4 text-[#23B5D3]" />
                    <span>{isAr ? 'فتح مشروع' : 'Open Project'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
                </button>

                {/* Save Project */}
                <button
                  onClick={() => {
                    onSave();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'حفظ التعديلات في الذاكرة المحلية' : 'Save current project (Ctrl+S)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Save className="w-4 h-4 text-[#6C4DFF]" />
                    <span>{isAr ? 'حفظ المشروع' : 'Save Project'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
                </button>

                {/* Save As */}
                <button
                  onClick={() => {
                    onSaveAs();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'حفظ نسخة جديدة من المشروع باسم آخر' : 'Save a duplicate copy with new name'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <BookmarkPlus className="w-4 h-4 text-[#2DD4BF]" />
                    <span>{isAr ? 'حفظ باسم...' : 'Save As...'}</span>
                  </span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                {/* Import Image */}
                <button
                  onClick={() => {
                    onOpenImageUpload();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center gap-2.5 font-medium transition-colors`}
                  title={isAr ? 'استيراد صورة من جهازك كطبقة جديدة في لوحة العمل' : 'Import image file as layer'}
                >
                  <Upload className="w-4 h-4 text-[#23B5D3]" />
                  <span>{isAr ? 'استيراد صورة' : 'Import Image'}</span>
                </button>

                {/* Export */}
                <button
                  onClick={() => {
                    onOpenExportModal();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'تصدير وتحميل العمل بصيغ PNG, JPEG, WebP, SVG' : 'Export & download (Ctrl+E)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Download className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                    <span>{isAr ? 'تصدير...' : 'Export...'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+E</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                {/* Reset / Close Canvas */}
                <button
                  onClick={() => {
                    onResetCanvas();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#FF6B8A] flex items-center gap-2.5 font-medium transition-colors`}
                  title={isAr ? 'إفراغ لوحة العمل وإعادة ضبطها' : 'Reset canvas workspace'}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isAr ? 'إعادة ضبط لوحة العمل' : 'Reset Canvas'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu (تعديل) */}
          <div className="relative">
            <button
              onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
              onMouseEnter={() => {
                if (activeMenu) setActiveMenu('edit');
              }}
              className={`px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors ${
                activeMenu === 'edit' ? 'bg-slate-100 dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF]' : ''
              }`}
            >
              <span>{isAr ? 'تعديل' : 'Edit'}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {activeMenu === 'edit' && (
              <div
                className={`absolute top-full ${
                  isAr ? 'right-0 text-right' : 'left-0 text-left'
                } mt-1.5 w-56 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 ring-1 ring-black/5`}
              >
                {/* Undo */}
                <button
                  disabled={!canUndo}
                  onClick={() => {
                    onUndo();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Undo2 className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                    <span>{isAr ? 'تراجع' : 'Undo'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+Z</span>
                </button>

                {/* Redo */}
                <button
                  disabled={!canRedo}
                  onClick={() => {
                    onRedo();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Redo2 className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                    <span>{isAr ? 'إعادة' : 'Redo'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+Y</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                {/* عمليات الصورة / Image Operations */}
                <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {isAr ? 'عمليات الصورة' : 'Image Operations'}
                </div>

                {/* حجم الصورة... / Image Size... */}
                <button
                  onClick={() => {
                    if (onOpenImageSizeModal) onOpenImageSizeModal();
                    else if (onOpenResizeModal) onOpenResizeModal();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'تغيير حجم ودقة مستند الصورة (Alt+I)' : 'Document Image Size & Resolution (Alt+I)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Maximize2 className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                    <span>{isAr ? 'حجم الصورة…' : 'Image Size…'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Alt+I</span>
                </button>

                {/* حجم اللوحة... / Canvas Size... */}
                <button
                  onClick={() => {
                    if (onOpenCanvasSizeModal) onOpenCanvasSizeModal();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'توسيع أو اقتطاع مساحة اللوحة المحيطة (Alt+C)' : 'Canvas Size & Anchor Extension (Alt+C)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Frame className="w-4 h-4 text-[#23B5D3]" />
                    <span>{isAr ? 'حجم اللوحة…' : 'Canvas Size…'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Alt+C</span>
                </button>

                {/* التحويل المتقدم... / Advanced Transform... */}
                <button
                  onClick={() => {
                    onUpdateState((prev) => ({ ...prev, activeTool: 'transform' }));
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'التحويل المتقدم وتدوير وانحراف العنصر المحدد (Ctrl+T)' : 'Advanced Transform Selected Layer (Ctrl+T)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Maximize2 className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                    <span>{isAr ? 'التحويل المتقدم…' : 'Advanced Transform…'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+T</span>
                </button>

                {/* قص الصورة / Crop Image */}
                <button
                  onClick={() => {
                    if (onActivateCrop) onActivateCrop();
                    else onUpdateState((prev) => ({ ...prev, activeTool: 'crop' }));
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'أداة قص إطار الصورة (C)' : 'Crop Image Frame Tool (C)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Crop className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? 'قص الصورة' : 'Crop Image'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">C</span>
                </button>

                {/* القص الحر / Freeform Crop */}
                <button
                  onClick={() => {
                    onUpdateState((prev) => ({ ...prev, activeTool: 'freeform_crop' }));
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'أداة القص الحر لطبقة الصورة المحددة (Shift+C)' : 'Freeform Crop for selected image layer (Shift+C)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <LassoSelect className="w-4 h-4 text-emerald-500" />
                    <span>{isAr ? 'القص الحر' : 'Freeform Crop'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Shift+C</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                {/* تدوير / Rotate */}
                <button
                  onClick={() => {
                    handleRotate(90);
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'تدوير 90 درجة يميناً' : 'Rotate 90° Clockwise'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <RotateCw className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                    <span>{isAr ? 'تدوير (90°)' : 'Rotate (90°)'}</span>
                  </span>
                </button>

                {/* قلب أفقي / Flip Horizontal */}
                <button
                  onClick={() => {
                    handleFlip('h');
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'قلب أفقي' : 'Flip Horizontal'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <FlipHorizontal className="w-4 h-4 text-[#23B5D3]" />
                    <span>{isAr ? 'قلب أفقي' : 'Flip Horizontal'}</span>
                  </span>
                </button>

                {/* قلب عمودي / Flip Vertical */}
                <button
                  onClick={() => {
                    handleFlip('v');
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between transition-colors`}
                  title={isAr ? 'قلب عمودي' : 'Flip Vertical'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <FlipVertical className="w-4 h-4 text-[#2DD4BF]" />
                    <span>{isAr ? 'قلب عمودي' : 'Flip Vertical'}</span>
                  </span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                {/* Cut Layer */}
                <button
                  disabled={!selectedLayer || selectedLayer.locked}
                  onClick={() => {
                    onCut();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
                  title={isAr ? 'قص الطبقة المحددة إلى الحافظة' : 'Cut selected layer (Ctrl+X)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Scissors className="w-4 h-4 text-amber-500" />
                    <span>{isAr ? 'قص' : 'Cut'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+X</span>
                </button>

                {/* Copy Layer */}
                <button
                  disabled={!selectedLayer}
                  onClick={() => {
                    onCopy();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
                  title={isAr ? 'نسخ الطبقة المحددة إلى الحافظة' : 'Copy selected layer (Ctrl+C)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Copy className="w-4 h-4 text-[#23B5D3]" />
                    <span>{isAr ? 'نسخ' : 'Copy'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+C</span>
                </button>

                {/* Paste Layer */}
                <button
                  disabled={!canPaste}
                  onClick={() => {
                    onPaste();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
                  title={isAr ? 'لصق الطبقة المنسوخة في لوحة العمل' : 'Paste copied layer (Ctrl+V)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <ClipboardPaste className="w-4 h-4 text-[#2DD4BF]" />
                    <span>{isAr ? 'لصق' : 'Paste'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+V</span>
                </button>

                {/* Duplicate Layer */}
                <button
                  disabled={!selectedLayer || selectedLayer.locked}
                  onClick={() => {
                    onDuplicate();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
                  title={isAr ? 'تكرار ومضاعفة الطبقة المحددة فورياً' : 'Duplicate selected layer (Ctrl+D)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Copy className="w-4 h-4 text-[#6C4DFF]" />
                    <span>{isAr ? 'تكرار' : 'Duplicate'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+D</span>
                </button>

                {/* Delete Layer */}
                <button
                  disabled={!selectedLayer || selectedLayer.locked}
                  onClick={() => {
                    onDeleteSelected();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#FF6B8A] flex items-center justify-between disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
                  title={isAr ? 'حذف الطبقة المحددة' : 'Delete selected layer (Delete)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Trash2 className="w-4 h-4" />
                    <span>{isAr ? 'حذف' : 'Delete'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Delete</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />

                {/* Select All */}
                <button
                  disabled={state.layers.length === 0}
                  onClick={() => {
                    onSelectAll();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
                  title={isAr ? 'تحديد الطبقة العليا في المشروع' : 'Select layer (Ctrl+A)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <CheckSquare className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                    <span>{isAr ? 'تحديد الكل' : 'Select All'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Ctrl+A</span>
                </button>

                {/* Deselect */}
                <button
                  disabled={!state.selectedLayerId}
                  onClick={() => {
                    onDeselect();
                    setActiveMenu(null);
                  }}
                  className={`w-full px-3.5 py-2 ${
                    isAr ? 'text-right' : 'text-left'
                  } hover:bg-purple-50 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 flex items-center justify-between disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
                  title={isAr ? 'إلغاء تحديد الطبقة الحالية' : 'Deselect (Esc)'}
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Square className="w-4 h-4 text-slate-400" />
                    <span>{isAr ? 'إلغاء التحديد' : 'Deselect'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Esc</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: Contextual Quick Actions Bar (Selected Layer & Transformations) */}
      <div className="flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-900/80 px-2 py-1 rounded-xl border border-slate-200/80 dark:border-slate-750/80 shadow-2xs">
        {selectedLayer ? (
          <>
            {/* Layer indicator badge */}
            <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-slate-800 text-[11px] font-bold text-[#6C4DFF] dark:text-[#2DD4BF] max-w-[130px] truncate">
              <span className="truncate">{selectedLayer.name}</span>
            </div>

            {/* Rotate 90° CW */}
            <button
              disabled={selectedLayer.locked}
              onClick={() => handleRotate(90)}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF] transition-all flex items-center gap-1 text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              title={isAr ? 'تدوير 90 درجة مع عقارب الساعة' : 'Rotate 90° CW'}
            >
              <RotateCw className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
              <span className="hidden xl:inline">{isAr ? '90° يمينًا' : 'CW'}</span>
            </button>

            {/* Rotate 90° CCW */}
            <button
              disabled={selectedLayer.locked}
              onClick={() => handleRotate(-90)}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-[#6C4DFF] dark:hover:text-[#2DD4BF] transition-all flex items-center gap-1 text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              title={isAr ? 'تدوير 90 درجة عكس عقارب الساعة' : 'Rotate 90° CCW'}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
              <span className="hidden xl:inline">{isAr ? '90° يسارًا' : 'CCW'}</span>
            </button>

            {/* Flip Horizontal */}
            <button
              disabled={selectedLayer.locked}
              onClick={() => handleFlip('h')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-[#23B5D3] transition-all flex items-center gap-1 text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              title={isAr ? 'قلب أفقي' : 'Flip Horizontal'}
            >
              <FlipHorizontal className="w-3.5 h-3.5 text-[#23B5D3]" />
              <span className="hidden xl:inline">{isAr ? 'قلب أفقي' : 'Flip H'}</span>
            </button>

            {/* Flip Vertical */}
            <button
              disabled={selectedLayer.locked}
              onClick={() => handleFlip('v')}
              className="p-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:text-[#2DD4BF] transition-all flex items-center gap-1 text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed"
              title={isAr ? 'قلب رأسي' : 'Flip Vertical'}
            >
              <FlipVertical className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span className="hidden xl:inline">{isAr ? 'قلب رأسي' : 'Flip V'}</span>
            </button>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-0.5" />
          </>
        ) : (
          /* When no layer is selected, show subtle canvas dimensions info */
          <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-slate-500">
            <span>{state.canvasWidth} × {state.canvasHeight} px</span>
          </div>
        )}

        {/* Pan / Hand Mode Toggle */}
        <button
          onClick={() =>
            onUpdateState((prev) => ({
              ...prev,
              activeTool: prev.activeTool === 'hand' ? 'select' : 'hand',
            }))
          }
          className={`p-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
            state.activeTool === 'hand'
              ? 'bg-[#6C4DFF] text-white shadow-2xs'
              : 'text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800'
          }`}
          title={isAr ? 'أداة التحريك اليدوي (Hand Pan) - H' : 'Pan Tool (H)'}
        >
          <Hand className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">{isAr ? 'تحريك' : 'Pan'}</span>
        </button>
      </div>

      {/* Right: Quick Action Buttons (Shortcuts, Undo, Redo, Save, Export) */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Keyboard Shortcuts Help */}
        {onOpenShortcutsModal && (
          <button
            id="editor-shortcuts-btn"
            onClick={onOpenShortcutsModal}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title={isAr ? 'اختصارات لوحة المفاتيح (?)' : 'Keyboard Shortcuts (?)'}
          >
            <Keyboard className="w-4 h-4 text-slate-500 hover:text-[#6C4DFF] dark:text-slate-400 dark:hover:text-[#2DD4BF]" />
          </button>
        )}

        {/* Undo / Redo */}
        <button
          id="editor-undo-btn"
          disabled={!canUndo}
          onClick={onUndo}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
          title={isAr ? 'تراجع (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          id="editor-redo-btn"
          disabled={!canRedo}
          onClick={onRedo}
          className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors"
          title={isAr ? 'إعادة (Ctrl+Y)' : 'Redo (Ctrl+Y)'}
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

        {/* Save Button */}
        <button
          id="editor-save-btn"
          onClick={onSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-750 dark:text-slate-200 bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-700 dark:hover:bg-slate-600 border border-slate-200/80 dark:border-transparent transition-all active:scale-95 shadow-2xs"
          title={isAr ? 'حفظ المشروع (Ctrl+S)' : 'Save Project (Ctrl+S)'}
        >
          <Save className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
          <span className="hidden sm:inline">{isAr ? 'حفظ' : 'Save'}</span>
        </button>

        {/* Export Button */}
        <button
          id="editor-export-btn"
          onClick={onOpenExportModal}
          title={isAr ? 'تصدير وتحميل المشروع (Ctrl+E)' : 'Export & Download (Ctrl+E)'}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C4DFF] to-[#23B5D3] hover:opacity-95 shadow-xs transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{isAr ? 'تصدير' : 'Export'}</span>
        </button>
      </div>
    </div>
  );
};
