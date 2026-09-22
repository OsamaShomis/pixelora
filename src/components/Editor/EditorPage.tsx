import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  EditorState,
  Layer,
  ExportSettings,
  BackgroundTemplate,
  ShapeType,
  BrushConfig,
  ImageResizeConfig,
  ResampleResult,
  ApplyCropParams,
  ApplyFreeformCropParams,
  DocumentResizeConfig,
  CanvasResizeConfig,
  BackgroundConfig,
  PathConfig,
  PathPoint,
} from '../../types';
import { CheckCircle2, AlertCircle, Info, Scissors, Maximize2, Frame } from 'lucide-react';
import { EditorTopBar } from './EditorTopBar';
import { EditorToolbox } from './EditorToolbox';
import { EditorCanvas } from './EditorCanvas';
import { EditorPropertiesPanel } from './EditorPropertiesPanel';
import { EditorBottomBar } from './EditorBottomBar';
import { ExportModal } from './ExportModal';
import { NewProjectModal } from './NewProjectModal';
import { ShapeLibraryModal } from './ShapeLibraryModal';
import { ImageResizeModal } from './ImageResizeModal';
import { ImageSizeModal } from './ImageSizeModal';
import { CanvasSizeModal } from './CanvasSizeModal';
import { OpenProjectModal } from './OpenProjectModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { DEFAULT_FILTERS, INITIAL_EDITOR_STATE, sanitizeProject } from '../../data/sampleProjects';
import { migrateLayersToEffectLayers } from '../../utils/effectLayers';
import { exportCompositeImage, loadImage, mergeLayersIntoSingleLayer } from '../../utils/compositeRenderer';
import { resampleDocumentLayers, offsetLayersForCanvasResize, MAX_SAFE_IMAGE_DIMENSION } from '../../utils/imageResizer';
import { pathPointsToSvgD, rasterizePathToMask } from '../../utils/vectorPath';
import { inpaintImage } from '../../utils/inpaintEngine';

interface EditorPageProps {
  state: EditorState;
  setState: React.Dispatch<React.SetStateAction<EditorState>>;
  onSaveProject: (state: EditorState) => void;
  onNewProjectModalOpen: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
}

export const EditorPage: React.FC<EditorPageProps> = ({
  state,
  setState,
  onSaveProject,
  language,
  darkMode,
}) => {
  const isAr = language === 'ar';
  const [activePropertyTab, setActivePropertyTab] = useState<
    'layers' | 'text' | 'brush' | 'eraser' | 'adjust' | 'filters' | 'bg_remove' | 'background' | 'tools' | 'pen' | 'transform'
  >('layers');
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [activeSelectionSvgD, setActiveSelectionSvgD] = useState<string | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isShapeModalOpen, setIsShapeModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState(false);
  const [isImageSizeModalOpen, setIsImageSizeModalOpen] = useState(false);
  const [isCanvasSizeModalOpen, setIsCanvasSizeModalOpen] = useState(false);
  const [resizeTargetLayerId, setResizeTargetLayerId] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isOpenProjectModalOpen, setIsOpenProjectModalOpen] = useState(false);
  const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState(state.projectName + ' (Copy)');
  const clipboardLayerRef = useRef<Layer | null>(null);
  const [canPaste, setCanPaste] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.text === text ? null : cur));
    }, 4500);
  }, []);

  // Brush and Eraser settings for drawing, pixel erasing and mask cutout
  const [brushConfig, setBrushConfig] = useState<BrushConfig>({
    size: 24,
    color: '#6C4DFF',
    opacity: 1,
    hardness: 0.8,
    tipShape: 'round',
    brushType: 'soft',
    tool: 'brush',
  });

  // Recent Colors & Eyedropper state
  const [recentColors, setRecentColors] = useState<string[]>([
    '#6C4DFF',
    '#2DD4BF',
    '#23B5D3',
    '#FF6B8A',
    '#F59E0B',
    '#10B981',
  ]);
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);
  const [eyedropperTarget, setEyedropperTarget] = useState<string | null>('brush');
  const eyedropperTargetRef = useRef<string | null>('brush');
  eyedropperTargetRef.current = eyedropperTarget;

  const handleToggleEyedropper = useCallback((target?: any) => {
    if (typeof target === 'string') {
      setEyedropperTarget(target);
      eyedropperTargetRef.current = target;
      setIsEyedropperActive(true);
    } else {
      setIsEyedropperActive((prev) => {
        if (!prev) {
          if (activePropertyTab === 'text') {
            setEyedropperTarget('text-color');
            eyedropperTargetRef.current = 'text-color';
          } else if (activePropertyTab === 'pen') {
            setEyedropperTarget('pen-stroke');
            eyedropperTargetRef.current = 'pen-stroke';
          } else {
            setEyedropperTarget('brush');
            eyedropperTargetRef.current = 'brush';
          }
          return true;
        } else {
          return false;
        }
      });
    }
  }, [activePropertyTab]);

  const handleSelectColor = useCallback((color: string) => {
    const target = eyedropperTargetRef.current;

    // 1. Add to recent colors list
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== color.toLowerCase());
      return [color, ...filtered].slice(0, 8);
    });

    // 2. Route color to specific recipient
    if (target === 'text-color') {
      const selId = state.selectedLayerId;
      setState((prev) => ({
        ...prev,
        layers: prev.layers.map((l) => {
          const isTarget = selId ? l.id === selId : l.type === 'text';
          if (!isTarget || l.type !== 'text') return l;
          return {
            ...l,
            textConfig: {
              ...l.textConfig!,
              color,
              gradient: l.textConfig?.gradient ? { ...l.textConfig.gradient, enabled: false } : undefined,
            },
          };
        }),
      }));
      showNotification(isAr ? `تم تحديد لون النص: ${color}` : `Text color set to ${color}`, 'success');
    } else if (target === 'text-stroke') {
      const selId = state.selectedLayerId;
      setState((prev) => ({
        ...prev,
        layers: prev.layers.map((l) => {
          const isTarget = selId ? l.id === selId : l.type === 'text';
          if (!isTarget || l.type !== 'text') return l;
          return {
            ...l,
            textConfig: {
              ...l.textConfig!,
              stroke: {
                enabled: true,
                color,
                width: l.textConfig?.stroke?.width || 2,
              },
            },
          };
        }),
      }));
      showNotification(isAr ? `تم تحديد لون حواف النص: ${color}` : `Text stroke color set to ${color}`, 'success');
    } else if (target === 'text-shadow') {
      const selId = state.selectedLayerId;
      setState((prev) => ({
        ...prev,
        layers: prev.layers.map((l) => {
          const isTarget = selId ? l.id === selId : l.type === 'text';
          if (!isTarget || l.type !== 'text') return l;
          return {
            ...l,
            textConfig: {
              ...l.textConfig!,
              shadow: {
                enabled: true,
                color,
                blur: l.textConfig?.shadow?.blur || 8,
                offsetX: l.textConfig?.shadow?.offsetX || 2,
                offsetY: l.textConfig?.shadow?.offsetY || 4,
                opacity: l.textConfig?.shadow?.opacity || 0.5,
              },
            },
          };
        }),
      }));
      showNotification(isAr ? `تم تحديد لون ظل النص: ${color}` : `Text shadow color set to ${color}`, 'success');
    } else if (target === 'pen-stroke') {
      setState((prev) => ({
        ...prev,
        layers: prev.layers.map((l) =>
          l.type === 'path' && l.pathConfig
            ? { ...l, pathConfig: { ...l.pathConfig, strokeColor: color } }
            : l
        ),
      }));
      showNotification(isAr ? `تم تحديد لون إطار المسار: ${color}` : `Path stroke color set to ${color}`, 'success');
    } else if (target === 'pen-fill') {
      setState((prev) => ({
        ...prev,
        layers: prev.layers.map((l) =>
          l.type === 'path' && l.pathConfig
            ? { ...l, pathConfig: { ...l.pathConfig, fillColor: color } }
            : l
        ),
      }));
      showNotification(isAr ? `تم تحديد لون تعبئة المسار: ${color}` : `Path fill color set to ${color}`, 'success');
    } else {
      setBrushConfig((b) => ({ ...b, color }));
      showNotification(isAr ? `تم تحديد لون الفرشاة: ${color}` : `Brush color set to ${color}`, 'success');
    }

    setEyedropperTarget('brush');
    eyedropperTargetRef.current = 'brush';
  }, [state.selectedLayerId, isAr, showNotification, setBrushConfig, setState]);

  // History stack for Undo & Redo (tracks layers, canvas dimensions, and background)
  interface HistorySnapshot {
    layers: Layer[];
    canvasWidth: number;
    canvasHeight: number;
    background?: BackgroundConfig;
  }
  const [historyStack, setHistoryStack] = useState<HistorySnapshot[]>([
    {
      layers: Array.isArray(state?.layers) ? state.layers : [],
      canvasWidth: state?.canvasWidth || 1080,
      canvasHeight: state?.canvasHeight || 1080,
      background: state?.background ? { ...state.background } : { type: 'solid', color: '#F1F5F9' },
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isHistoryUpdate = useRef(false);
  const historyDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Record history when layers, canvas dimensions, or background change
  // Continuous operations like dragging/resizing are debounced so 1 gesture = 1 undo entry
  // Structural changes (layer count change, canvas resize, crop) commit immediately
  useEffect(() => {
    if (isHistoryUpdate.current) {
      isHistoryUpdate.current = false;
      return;
    }
    const safeLayers = Array.isArray(state?.layers) ? state.layers : [];
    const currentSnapshot: HistorySnapshot = {
      layers: safeLayers,
      canvasWidth: state?.canvasWidth || 1080,
      canvasHeight: state?.canvasHeight || 1080,
      background: state?.background ? { ...state.background } : { type: 'solid', color: '#F1F5F9' },
    };
    const prevSnapshot = historyStack[historyIndex];
    if (!prevSnapshot) return;

    const prevLayers = Array.isArray(prevSnapshot.layers) ? prevSnapshot.layers : [];

    const isBgChanged =
      prevSnapshot.background?.type !== currentSnapshot.background?.type ||
      prevSnapshot.background?.color !== currentSnapshot.background?.color;

    // Skip if nothing changed
    if (
      prevSnapshot.canvasWidth === currentSnapshot.canvasWidth &&
      prevSnapshot.canvasHeight === currentSnapshot.canvasHeight &&
      !isBgChanged &&
      JSON.stringify(prevLayers) === JSON.stringify(currentSnapshot.layers)
    ) {
      return;
    }

    const hasSourceOrBitmapChange = prevLayers.some((pl, idx) => {
      const cl = currentSnapshot.layers[idx];
      return (
        cl &&
        (cl.source !== pl.source ||
          cl.bitmapWidth !== pl.bitmapWidth ||
          cl.bitmapHeight !== pl.bitmapHeight)
      );
    });

    const isImmediate =
      prevSnapshot.canvasWidth !== currentSnapshot.canvasWidth ||
      prevSnapshot.canvasHeight !== currentSnapshot.canvasHeight ||
      isBgChanged ||
      prevLayers.length !== currentSnapshot.layers.length ||
      hasSourceOrBitmapChange;

    if (historyDebounceRef.current) {
      clearTimeout(historyDebounceRef.current);
      historyDebounceRef.current = null;
    }

    const commitSnapshot = () => {
      setHistoryStack((prevStack) => {
        const newStack = prevStack.slice(0, historyIndex + 1);
        newStack.push(currentSnapshot);
        return newStack;
      });
      setHistoryIndex((prevIdx) => prevIdx + 1);
    };

    if (isImmediate) {
      commitSnapshot();
    } else {
      historyDebounceRef.current = setTimeout(commitSnapshot, 300);
    }

    return () => {
      if (historyDebounceRef.current) {
        clearTimeout(historyDebounceRef.current);
      }
    };
  }, [state.layers, state.canvasWidth, state.canvasHeight, state.background, historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      isHistoryUpdate.current = true;
      const target = historyStack[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setState((prev) => ({
        ...prev,
        layers: target.layers,
        canvasWidth: target.canvasWidth,
        canvasHeight: target.canvasHeight,
        background: target.background ? { ...target.background } : prev.background,
      }));
    }
  }, [historyIndex, historyStack, setState]);

  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      isHistoryUpdate.current = true;
      const target = historyStack[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setState((prev) => ({
        ...prev,
        layers: target.layers,
        canvasWidth: target.canvasWidth,
        canvasHeight: target.canvasHeight,
        background: target.background ? { ...target.background } : prev.background,
      }));
    }
  }, [historyIndex, historyStack, setState]);

  // Edit actions: Cut, Copy, Paste, Duplicate, Delete, Select All, Deselect
  const handleCut = useCallback(() => {
    if (!state.selectedLayerId) return;
    const layer = state.layers.find((l) => l.id === state.selectedLayerId);
    if (!layer || layer.locked) return;
    clipboardLayerRef.current = JSON.parse(JSON.stringify(layer));
    setCanPaste(true);
    setState((prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== prev.selectedLayerId),
      selectedLayerId: null,
    }));
    showNotification(isAr ? 'تم قص الطبقة إلى الحافظة' : 'Layer cut to clipboard', 'info');
  }, [state.selectedLayerId, state.layers, isAr, showNotification, setState]);

  const handleCopy = useCallback(() => {
    if (!state.selectedLayerId) return;
    const layer = state.layers.find((l) => l.id === state.selectedLayerId);
    if (!layer) return;
    clipboardLayerRef.current = JSON.parse(JSON.stringify(layer));
    setCanPaste(true);
    showNotification(isAr ? 'تم نسخ الطبقة إلى الحافظة' : 'Layer copied to clipboard', 'info');
  }, [state.selectedLayerId, state.layers, isAr, showNotification]);

  const handlePaste = useCallback(() => {
    if (!clipboardLayerRef.current) return;
    const template = clipboardLayerRef.current;
    const newId = 'layer_' + Date.now();
    const maxZ = state.layers.reduce((max, l) => Math.max(max, l.zIndex || 0), 0);
    const newLayer: Layer = {
      ...JSON.parse(JSON.stringify(template)),
      id: newId,
      name: `${template.name} (${isAr ? 'نسخة' : 'Copy'})`,
      x: (template.x || 0) + 25,
      y: (template.y || 0) + 25,
      zIndex: maxZ + 1,
    };
    setState((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      selectedLayerId: newId,
    }));
    showNotification(isAr ? 'تم لصق الطبقة في العمل' : 'Layer pasted to canvas', 'success');
  }, [state.layers, isAr, showNotification, setState]);

  const handleDuplicate = useCallback(() => {
    if (!state.selectedLayerId) return;
    const layer = state.layers.find((l) => l.id === state.selectedLayerId);
    if (!layer || layer.locked) return;
    const newId = 'layer_' + Date.now();
    const maxZ = state.layers.reduce((max, l) => Math.max(max, l.zIndex || 0), 0);
    const newLayer: Layer = {
      ...JSON.parse(JSON.stringify(layer)),
      id: newId,
      name: `${layer.name} (${isAr ? 'نسخة' : 'Copy'})`,
      x: (layer.x || 0) + 25,
      y: (layer.y || 0) + 25,
      zIndex: maxZ + 1,
    };
    setState((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      selectedLayerId: newId,
    }));
    showNotification(isAr ? 'تم تكرار الطبقة بنجاح' : 'Layer duplicated', 'success');
  }, [state.selectedLayerId, state.layers, isAr, showNotification, setState]);

  const handleDeleteSelected = useCallback(() => {
    if (!state.selectedLayerId) return;
    const layer = state.layers.find((l) => l.id === state.selectedLayerId);
    if (!layer || layer.locked) return;
    setState((prev) => ({
      ...prev,
      layers: prev.layers.filter((l) => l.id !== prev.selectedLayerId),
      selectedLayerId: null,
    }));
    showNotification(isAr ? 'تم حذف الطبقة' : 'Layer deleted', 'info');
  }, [state.selectedLayerId, state.layers, isAr, showNotification, setState]);

  const handleSelectAll = useCallback(() => {
    if (state.layers.length === 0) return;
    const topmost = [...state.layers].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0))[0];
    if (topmost) {
      setState((prev) => ({ ...prev, selectedLayerId: topmost.id }));
    }
  }, [state.layers, setState]);

  const handleDeselect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedLayerId: null,
      activeTool: prev.activeTool === 'crop' ? 'select' : prev.activeTool,
    }));
  }, [setState]);

  // Background Removal Cutout Workflow: Restore Brush vs Erase Brush Mode
  const [cutoutMode, setCutoutMode] = useState<'restore' | 'erase'>('restore');
  const cutoutProps = useMemo(
    () => ({
      mode: cutoutMode,
      setMode: setCutoutMode,
    }),
    [cutoutMode]
  );

  // Unified Advanced Transform Engine State & Handlers
  const [transformSnapshot, setTransformSnapshot] = useState<Layer | null>(null);

  const handleActivateTransform = useCallback(() => {
    const selected = state.layers.find((l) => l.id === state.selectedLayerId);
    if (!selected) {
      const topLayer = [...state.layers].reverse().find((l) => l.visible && !l.locked);
      if (topLayer) {
        setState((prev) => ({
          ...prev,
          selectedLayerId: topLayer.id,
          activeTool: 'transform',
        }));
        setTransformSnapshot({ ...topLayer });
        setActivePropertyTab('transform');
      } else {
        showNotification(isAr ? 'يرجى تحديد عنصر للتحويل المتقدم' : 'Please select an element to transform', 'warning');
      }
      return;
    }

    setTransformSnapshot({ ...selected });
    setState((prev) => ({
      ...prev,
      activeTool: 'transform',
    }));
    setActivePropertyTab('transform');
  }, [state.layers, state.selectedLayerId, isAr, showNotification, setState]);

  useEffect(() => {
    if (state.activeTool === 'transform' && state.selectedLayerId) {
      const selected = state.layers.find((l) => l.id === state.selectedLayerId);
      if (selected && (!transformSnapshot || transformSnapshot.id !== selected.id)) {
        setTransformSnapshot({ ...selected });
      }
    }
  }, [state.activeTool, state.selectedLayerId, state.layers, transformSnapshot]);

  const handleApplyTransform = useCallback(() => {
    const selected = state.layers.find((l) => l.id === state.selectedLayerId);
    if (!selected) return;

    setTransformSnapshot(null);
    setState((prev) => ({
      ...prev,
      activeTool: 'select',
    }));
    showNotification(isAr ? 'تم تطبيق التحويل بنجاح' : 'Transform applied', 'success');
  }, [state.layers, state.selectedLayerId, isAr, showNotification, setState]);

  const handleCancelTransform = useCallback(() => {
    if (transformSnapshot) {
      setState((prev) => ({
        ...prev,
        activeTool: 'select',
        layers: prev.layers.map((l) => (l.id === transformSnapshot.id ? { ...transformSnapshot } : l)),
      }));
      setTransformSnapshot(null);
      showNotification(isAr ? 'تم إلغاء التحويل واستعادة الحالة السابقة' : 'Transform cancelled', 'info');
    } else {
      setState((prev) => ({ ...prev, activeTool: 'select' }));
    }
  }, [transformSnapshot, isAr, showNotification, setState]);

  const handleResetTransform = useCallback(() => {
    if (!state.selectedLayerId) return;
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === prev.selectedLayerId
          ? {
              ...l,
              rotation: 0,
              flipHorizontal: false,
              flipVertical: false,
              skewX: 0,
              skewY: 0,
              pivotX: 0.5,
              pivotY: 0.5,
            }
          : l
      ),
    }));
    showNotification(isAr ? 'تمت إعادة تعيين التحويل' : 'Transform reset', 'info');
  }, [state.selectedLayerId, isAr, showNotification, setState]);

  const handleSaveAsConfirm = () => {
    const finalName = saveAsName.trim() || `${state.projectName} (Copy)`;
    const newId = 'proj_' + Date.now();
    const clonedState: EditorState = {
      ...state,
      id: newId,
      projectName: finalName,
    };
    onSaveProject(clonedState);
    setState(clonedState);
    setIsSaveAsModalOpen(false);
    showNotification(
      isAr ? `تم حفظ نسخة جديدة: "${finalName}"` : `Saved copy as: "${finalName}"`,
      'success'
    );
  };

  // Layer arrangement helpers
  const handleMoveLayerUp = useCallback(() => {
    setState((prev) => {
      if (!prev.selectedLayerId) return prev;
      const index = prev.layers.findIndex((l) => l.id === prev.selectedLayerId);
      if (index === -1 || index === prev.layers.length - 1) return prev;
      const updated = [...prev.layers];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return {
        ...prev,
        layers: updated.map((l, i) => ({ ...l, zIndex: i + 1 })),
      };
    });
  }, [setState]);

  const handleMoveLayerDown = useCallback(() => {
    setState((prev) => {
      if (!prev.selectedLayerId) return prev;
      const index = prev.layers.findIndex((l) => l.id === prev.selectedLayerId);
      if (index <= 0) return prev;
      const updated = [...prev.layers];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return {
        ...prev,
        layers: updated.map((l, i) => ({ ...l, zIndex: i + 1 })),
      };
    });
  }, [setState]);

  const handleMoveLayerToTop = useCallback(() => {
    setState((prev) => {
      if (!prev.selectedLayerId) return prev;
      const index = prev.layers.findIndex((l) => l.id === prev.selectedLayerId);
      if (index === -1 || index === prev.layers.length - 1) return prev;
      const target = prev.layers[index];
      const remaining = prev.layers.filter((l) => l.id !== prev.selectedLayerId);
      const updated = [...remaining, target];
      return {
        ...prev,
        layers: updated.map((l, i) => ({ ...l, zIndex: i + 1 })),
      };
    });
  }, [setState]);

  const handleMoveLayerToBottom = useCallback(() => {
    setState((prev) => {
      if (!prev.selectedLayerId) return prev;
      const index = prev.layers.findIndex((l) => l.id === prev.selectedLayerId);
      if (index <= 0) return prev;
      const target = prev.layers[index];
      const remaining = prev.layers.filter((l) => l.id !== prev.selectedLayerId);
      const updated = [target, ...remaining];
      return {
        ...prev,
        layers: updated.map((l, i) => ({ ...l, zIndex: i + 1 })),
      };
    });
  }, [setState]);

  // Global Keyboard shortcuts: Strictly unified, without duplication
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid shortcuts when typing inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Help Modal: ? or Shift+/ or F1 or Ctrl+/
      if (e.key === '?' || e.key === 'F1' || ((e.ctrlKey || e.metaKey) && key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen(true);
        return;
      }

      // Shortcuts with Ctrl / Meta
      if (e.ctrlKey || e.metaKey) {
        if (key === 'z') {
          e.preventDefault();
          if (e.shiftKey) {
            handleRedo();
          } else {
            handleUndo();
          }
        } else if (key === 'y') {
          e.preventDefault();
          handleRedo();
        } else if (key === 'n') {
          e.preventDefault();
          setIsNewProjectModalOpen(true);
        } else if (key === 'o') {
          e.preventDefault();
          setIsOpenProjectModalOpen(true);
        } else if (key === 's') {
          e.preventDefault();
          onSaveProject(state);
          showNotification(isAr ? 'تم حفظ المشروع بنجاح' : 'Project saved successfully', 'success');
        } else if (key === 'e') {
          e.preventDefault();
          setIsExportModalOpen(true);
        } else if (key === 'x') {
          e.preventDefault();
          handleCut();
        } else if (key === 'c') {
          e.preventDefault();
          handleCopy();
        } else if (key === 'v') {
          e.preventDefault();
          handlePaste();
        } else if (key === 'd' || key === 'j') {
          e.preventDefault();
          if (key === 'd' && activeSelectionSvgD) {
            setActiveSelectionSvgD(null);
          } else {
            handleDuplicate();
          }
        } else if (key === 't' || e.code === 'KeyT') {
          e.preventDefault();
          handleActivateTransform();
        } else if (key === 'a') {
          e.preventDefault();
          handleSelectAll();
        } else if (e.key === '[') {
          e.preventDefault();
          if (e.shiftKey) {
            handleMoveLayerToBottom();
          } else {
            handleMoveLayerDown();
          }
        } else if (e.key === ']') {
          e.preventDefault();
          if (e.shiftKey) {
            handleMoveLayerToTop();
          } else {
            handleMoveLayerUp();
          }
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setState((prev) => ({
            ...prev,
            zoom: Math.min(5, Number((prev.zoom * 1.15).toFixed(2))),
          }));
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          setState((prev) => ({
            ...prev,
            zoom: Math.max(0.1, Number((prev.zoom * 0.85).toFixed(2))),
          }));
        } else if (e.key === '0') {
          e.preventDefault();
          setState((prev) => ({
            ...prev,
            zoom: 1,
            pan: { x: 0, y: 0 },
          }));
        } else if (e.key === '1') {
          e.preventDefault();
          setState((prev) => ({
            ...prev,
            zoom: 1,
          }));
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (activeSelectionSvgD) {
          setActiveSelectionSvgD(null);
        }
        handleDeselect();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selectedLayerId) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.altKey && !e.ctrlKey && !e.metaKey) {
        if (key === 'i') {
          e.preventDefault();
          setIsImageSizeModalOpen(true);
        } else if (key === 'c') {
          e.preventDefault();
          setIsCanvasSizeModalOpen(true);
        }
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        // Brush & Eraser Size Adjustment: [ and ]
        if (e.key === '[') {
          e.preventDefault();
          setBrushConfig((prev) => ({ ...prev, size: Math.max(1, prev.size - 5) }));
        } else if (e.key === ']') {
          e.preventDefault();
          setBrushConfig((prev) => ({ ...prev, size: Math.min(200, prev.size + 5) }));
        }
        // Arrow Keys: Nudge selected layer
        else if (
          key === 'arrowup' ||
          key === 'arrowdown' ||
          key === 'arrowleft' ||
          key === 'arrowright'
        ) {
          if (state.selectedLayerId && (state.activeTool === 'select' || !state.activeTool)) {
            e.preventDefault();
            const step = e.shiftKey ? 10 : 1;
            const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0;
            const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0;
            setState((prev) => ({
              ...prev,
              layers: prev.layers.map((l) =>
                l.id === prev.selectedLayerId && !l.locked
                  ? { ...l, x: l.x + dx, y: l.y + dy }
                  : l
              ),
            }));
          }
        }
        // Tool single-key shortcuts
        else if (key === 'v') {
          setState((prev) => ({ ...prev, activeTool: 'select' }));
        } else if (key === 'h') {
          setState((prev) => ({ ...prev, activeTool: 'hand' }));
        } else if (key === 'z') {
          setState((prev) => ({ ...prev, activeTool: 'zoom' }));
        } else if (key === 'c') {
          if (e.shiftKey) {
            setState((prev) => ({ ...prev, activeTool: 'freeform_crop' }));
          } else {
            setState((prev) => ({ ...prev, activeTool: 'crop' }));
          }
        } else if (key === 'b') {
          setState((prev) => ({ ...prev, activeTool: 'draw' }));
          setBrushConfig((b) => ({ ...b, tool: 'brush' }));
          setActivePropertyTab('brush');
        } else if (key === 'e') {
          setState((prev) => ({ ...prev, activeTool: 'eraser' }));
          setBrushConfig((b) => ({ ...b, tool: 'eraser' }));
          setActivePropertyTab('eraser');
        } else if (key === 't') {
          setState((prev) => ({ ...prev, activeTool: 'text' }));
          setActivePropertyTab('text');
        } else if (key === 'u') {
          setState((prev) => ({ ...prev, activeTool: 'shape' }));
          setIsShapeModalOpen(true);
        } else if (key === 'f') {
          setState((prev) => ({ ...prev, activeTool: 'filters' }));
          setActivePropertyTab('filters');
        } else if (key === 'a') {
          setState((prev) => ({ ...prev, activeTool: 'adjust' }));
          setActivePropertyTab('adjust');
        } else if (key === 'r') {
          setState((prev) => ({ ...prev, activeTool: 'bg_remove' }));
          setActivePropertyTab('bg_remove');
        } else if (key === 'g') {
          setActivePropertyTab('background');
        } else if (key === 'p') {
          setState((prev) => ({ ...prev, activeTool: 'pen' }));
          setActivePropertyTab('pen');
        } else if (key === 'j') {
          setState((prev) => ({ ...prev, activeTool: 'remove_object' }));
          setActivePropertyTab('remove_object');
        } else if (key === 'k') {
          handleActivateTransform();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    onSaveProject,
    handleCut,
    handleCopy,
    handlePaste,
    handleDuplicate,
    handleDeleteSelected,
    handleSelectAll,
    handleDeselect,
    handleMoveLayerUp,
    handleMoveLayerDown,
    handleMoveLayerToTop,
    handleMoveLayerToBottom,
    handleActivateTransform,
    isAr,
    showNotification,
    state,
    setState,
  ]);

  // Merge selected layer with the layer directly below it (Ctrl+E)
  const handleMergeDown = useCallback(async () => {
    if (!state.selectedLayerId) {
      showNotification(
        isAr ? 'يرجى تحديد الطبقة المراد دمجها لأسفل' : 'Please select a layer to merge down',
        'info'
      );
      return;
    }

    const sorted = [...state.layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    const selectedIdx = sorted.findIndex((l) => l.id === state.selectedLayerId);

    if (selectedIdx === -1) return;
    if (selectedIdx === 0) {
      showNotification(
        isAr
          ? 'الطبقة المحددة في أسفل المكدس بالفعل، لا توجد طبقة تحتها للدمج'
          : 'Selected layer is already at the bottom of the stack',
        'info'
      );
      return;
    }

    const lowerLayer = sorted[selectedIdx - 1];
    const upperLayer = sorted[selectedIdx];

    try {
      showNotification(
        isAr ? 'جاري دمج الطبقتين مع الحفاظ على الشفافية...' : 'Merging layers...',
        'info'
      );

      const mergedLayer = await mergeLayersIntoSingleLayer(
        [lowerLayer, upperLayer],
        state.canvasWidth,
        state.canvasHeight,
        {
          trimTransparentBounds: true,
          mergedLayerName: `${upperLayer.name} + ${lowerLayer.name}`,
        }
      );

      mergedLayer.zIndex = upperLayer.zIndex || lowerLayer.zIndex || 1;

      setState((prev) => {
        const remaining = prev.layers.filter(
          (l) => l.id !== upperLayer.id && l.id !== lowerLayer.id
        );
        return {
          ...prev,
          layers: [...remaining, mergedLayer],
          selectedLayerId: mergedLayer.id,
        };
      });

      showNotification(
        isAr ? 'تم دمج الطبقتين بنجاح في طبقة واحدة' : 'Layers merged successfully',
        'success'
      );
    } catch (err) {
      console.error('Merge down failed:', err);
      showNotification(
        isAr ? 'حدث خطأ أثناء دمج الطبقات' : 'Failed to merge layers',
        'error'
      );
    }
  }, [state.selectedLayerId, state.layers, state.canvasWidth, state.canvasHeight, isAr, showNotification, setState]);

  // Merge all visible layers into a single layer (Ctrl+Shift+E)
  const handleMergeVisible = useCallback(async () => {
    const visibleLayers = [...state.layers]
      .filter((l) => l.visible)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    if (visibleLayers.length < 2) {
      showNotification(
        isAr ? 'يجب توفر طبقتين مرئيتين على الأقل للدمج' : 'Need at least 2 visible layers to merge',
        'info'
      );
      return;
    }

    try {
      showNotification(
        isAr ? 'جاري دمج جميع الطبقات المرئية...' : 'Merging visible layers...',
        'info'
      );

      const mergedLayer = await mergeLayersIntoSingleLayer(
        visibleLayers,
        state.canvasWidth,
        state.canvasHeight,
        {
          trimTransparentBounds: true,
          mergedLayerName: isAr ? 'طبقات مدمجة' : 'Merged Visible',
        }
      );

      const visibleIds = new Set(visibleLayers.map((l) => l.id));

      setState((prev) => {
        const hiddenLayers = prev.layers.filter((l) => !visibleIds.has(l.id));
        return {
          ...prev,
          layers: [...hiddenLayers, mergedLayer],
          selectedLayerId: mergedLayer.id,
        };
      });

      showNotification(
        isAr ? 'تم دمج الطبقات المرئية بنجاح' : 'Visible layers merged successfully',
        'success'
      );
    } catch (err) {
      console.error('Merge visible failed:', err);
      showNotification(
        isAr ? 'حدث خطأ أثناء دمج الطبقات' : 'Failed to merge visible layers',
        'error'
      );
    }
  }, [state.layers, state.canvasWidth, state.canvasHeight, isAr, showNotification, setState]);

  // Flatten entire image with canvas background
  const handleFlattenImage = useCallback(async () => {
    const visibleLayers = [...state.layers]
      .filter((l) => l.visible)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    if (visibleLayers.length === 0) {
      showNotification(
        isAr ? 'لا توجد طبقات لتسطيحها' : 'No layers to flatten',
        'info'
      );
      return;
    }

    try {
      showNotification(
        isAr ? 'جاري تسطيح الصورة بالكامل...' : 'Flattening image...',
        'info'
      );

      const flattened = await mergeLayersIntoSingleLayer(
        visibleLayers,
        state.canvasWidth,
        state.canvasHeight,
        {
          trimTransparentBounds: false,
          isFlatten: true,
          background: state.background,
          mergedLayerName: isAr ? 'خلفية مسطحة' : 'Background',
        }
      );

      setState((prev) => ({
        ...prev,
        layers: [flattened],
        selectedLayerId: flattened.id,
      }));

      showNotification(
        isAr ? 'تم تسطيح الصورة في طبقة خلفية واحدة' : 'Image flattened into single background',
        'success'
      );
    } catch (err) {
      console.error('Flatten image failed:', err);
      showNotification(
        isAr ? 'حدث خطأ أثناء تسطيح الصورة' : 'Failed to flatten image',
        'error'
      );
    }
  }, [state.layers, state.canvasWidth, state.canvasHeight, state.background, isAr, showNotification, setState]);

  // Upload new image as a layer
  const handleImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          setState((prev) => {
            let w = img.width;
            let h = img.height;
            const maxDim = Math.min(prev.canvasWidth * 0.8, prev.canvasHeight * 0.8);
            if (w > maxDim || h > maxDim) {
              const ratio = Math.min(maxDim / w, maxDim / h);
              w = Math.round(w * ratio);
              h = Math.round(h * ratio);
            }

            const naturalW = img.naturalWidth || img.width;
            const naturalH = img.naturalHeight || img.height;

            const maxZ = prev.layers.reduce((max, l) => Math.max(max, l.zIndex || 0), 0);
            const offset = (prev.layers.length * 25) % 150;

            const newLayer: Layer = {
              id: 'layer_img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
              name: file.name.replace(/\.[^/.]+$/, ''),
              type: 'image',
              source: dataUrl,
              originalSource: dataUrl,
              bitmapWidth: naturalW,
              bitmapHeight: naturalH,
              x: Math.round((prev.canvasWidth - w) / 2) + offset,
              y: Math.round((prev.canvasHeight - h) / 2) + offset,
              width: w,
              height: h,
              rotation: 0,
              opacity: 100,
              visible: true,
              zIndex: maxZ + 1,
              filters: { ...DEFAULT_FILTERS },
            };

            return {
              ...prev,
              layers: [...prev.layers, newLayer],
              selectedLayerId: newLayer.id,
            };
          });
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
  };

  // Add text layer
  const handleAddTextLayer = () => {
    const newLayer: Layer = {
      id: 'layer_text_' + Date.now(),
      name: isAr ? 'نص جديد' : 'Text Layer',
      type: 'text',
      x: Math.round(state.canvasWidth / 2 - 150),
      y: Math.round(state.canvasHeight / 2 - 40),
      width: 300,
      height: 80,
      rotation: 0,
      opacity: 100,
      visible: true,
      zIndex: state.layers.length + 1,
      filters: { ...DEFAULT_FILTERS },
      textConfig: {
        text: isAr ? 'أدخل النص هنا' : 'Enter Text Here',
        fontSize: 36,
        fontFamily: 'Tajawal',
        color: '#172033',
        align: 'center',
        bold: true,
        italic: false,
        underline: false,
      },
    };

    setState((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      selectedLayerId: newLayer.id,
    }));
  };

  // Add Shape layer
  const handleAddShapeLayer = (shapeType: ShapeType) => {
    const newLayer: Layer = {
      id: 'layer_shape_' + Date.now(),
      name: isAr ? 'شكل هندسي' : 'Shape Layer',
      type: 'shape',
      x: Math.round(state.canvasWidth / 2 - 100),
      y: Math.round(state.canvasHeight / 2 - 100),
      width: 200,
      height: 200,
      rotation: 0,
      opacity: 100,
      visible: true,
      zIndex: state.layers.length + 1,
      filters: { ...DEFAULT_FILTERS },
      shapeConfig: {
        shapeType,
        fillColor: '#6C4DFF',
        strokeColor: '#4B32C3',
        strokeWidth: 2,
        borderRadius: shapeType === 'rectangle' ? 16 : 0,
      },
    };

    setState((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      selectedLayerId: newLayer.id,
    }));
  };

  // Apply Crop (Distinct, professional implementation for both Crop Image and Crop Canvas)
  const handleApplyCrop = async (params: ApplyCropParams) => {
    if (params.mode === 'image' && params.targetLayerId) {
      // ----------------------------------------------------------------------
      // OPERATION A: CROP IMAGE
      // Crops ONLY the selected image layer's bitmap.
      // Canvas dimensions remain UNCHANGED.
      // All other layers, shapes, text, drawing, and background remain UNCHANGED.
      // Real bitmap crop with preserved alpha transparency and pixel quality.
      // ----------------------------------------------------------------------
      const targetLayer = state.layers.find((l) => l.id === params.targetLayerId);
      if (!targetLayer || targetLayer.type !== 'image' || !targetLayer.source) {
        showNotification(
          isAr ? 'لم يتم العثور على طبقة الصورة المحددة للقص' : 'Selected image layer not found',
          'warning'
        );
        return;
      }

      try {
        const img = await loadImage(targetLayer.source);
        const origBitmapW = targetLayer.bitmapWidth || img.naturalWidth || targetLayer.width;
        const origBitmapH = targetLayer.bitmapHeight || img.naturalHeight || targetLayer.height;

        // Ensure cropArea is valid within local layer coordinates
        const localX = Math.max(0, Math.min(targetLayer.width - 10, params.cropArea.x));
        const localY = Math.max(0, Math.min(targetLayer.height - 10, params.cropArea.y));
        const localW = Math.max(10, Math.min(targetLayer.width - localX, params.cropArea.width));
        const localH = Math.max(10, Math.min(targetLayer.height - localY, params.cropArea.height));

        const scaleX = origBitmapW / Math.max(1, targetLayer.width);
        const scaleY = origBitmapH / Math.max(1, targetLayer.height);

        // Account for horizontal / vertical flips when determining bitmap slice coordinates
        let srcX = Math.round(localX * scaleX);
        let srcY = Math.round(localY * scaleY);
        if (targetLayer.flipHorizontal) {
          srcX = Math.round((targetLayer.width - (localX + localW)) * scaleX);
        }
        if (targetLayer.flipVertical) {
          srcY = Math.round((targetLayer.height - (localY + localH)) * scaleY);
        }

        srcX = Math.max(0, Math.min(origBitmapW - 1, srcX));
        srcY = Math.max(0, Math.min(origBitmapH - 1, srcY));
        const srcW = Math.max(1, Math.min(origBitmapW - srcX, Math.round(localW * scaleX)));
        const srcH = Math.max(1, Math.min(origBitmapH - srcY, Math.round(localH * scaleY)));

        // Perform actual bitmap slice on an offscreen canvas
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = srcW;
        cropCanvas.height = srcH;
        const ctx = cropCanvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2d context for crop canvas');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

        // Lossless PNG preserves transparency and full pixel fidelity
        const croppedDataUrl = cropCanvas.toDataURL('image/png');

        // Also slice maskData if present (from background cutout)
        let croppedMaskData = targetLayer.maskData;
        if (targetLayer.maskData) {
          try {
            const maskImg = await loadImage(targetLayer.maskData);
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = srcW;
            maskCanvas.height = srcH;
            const maskCtx = maskCanvas.getContext('2d');
            if (maskCtx) {
              const maskScaleX = maskImg.naturalWidth / Math.max(1, targetLayer.width);
              const maskScaleY = maskImg.naturalHeight / Math.max(1, targetLayer.height);
              let mSrcX = Math.round(localX * maskScaleX);
              let mSrcY = Math.round(localY * maskScaleY);
              if (targetLayer.flipHorizontal) {
                mSrcX = Math.round((targetLayer.width - (localX + localW)) * maskScaleX);
              }
              if (targetLayer.flipVertical) {
                mSrcY = Math.round((targetLayer.height - (localY + localH)) * maskScaleY);
              }
              maskCtx.drawImage(maskImg, mSrcX, mSrcY, Math.round(localW * maskScaleX), Math.round(localH * maskScaleY), 0, 0, srcW, srcH);
              croppedMaskData = maskCanvas.toDataURL('image/png');
            }
          } catch (mErr) {
            console.warn('Could not crop maskData:', mErr);
          }
        }

        // Calculate layer's new canvas position
        let newLayerX = Math.round(targetLayer.x + localX);
        let newLayerY = Math.round(targetLayer.y + localY);

        if (targetLayer.rotation) {
          // Precise center-shift calculation for rotated layer
          const oldCenterX = targetLayer.x + targetLayer.width / 2;
          const oldCenterY = targetLayer.y + targetLayer.height / 2;

          const cropCenterLocalX = localX + localW / 2;
          const cropCenterLocalY = localY + localH / 2;

          const deltaLocalX = cropCenterLocalX - targetLayer.width / 2;
          const deltaLocalY = cropCenterLocalY - targetLayer.height / 2;

          const rotRad = (targetLayer.rotation * Math.PI) / 180;
          const deltaCanvasX = deltaLocalX * Math.cos(rotRad) - deltaLocalY * Math.sin(rotRad);
          const deltaCanvasY = deltaLocalX * Math.sin(rotRad) + deltaLocalY * Math.cos(rotRad);

          const newCenterX = oldCenterX + deltaCanvasX;
          const newCenterY = oldCenterY + deltaCanvasY;

          newLayerX = Math.round(newCenterX - localW / 2);
          newLayerY = Math.round(newCenterY - localH / 2);
        }

        const updatedLayer: Layer = {
          ...targetLayer,
          source: croppedDataUrl,
          maskData: croppedMaskData,
          x: newLayerX,
          y: newLayerY,
          width: Math.round(localW),
          height: Math.round(localH),
          bitmapWidth: srcW,
          bitmapHeight: srcH,
        };

        // Update ONLY targetLayer. Canvas dimensions and other layers are completely preserved!
        setState((prev) => ({
          ...prev,
          activeTool: 'select',
          layers: prev.layers.map((l) => (l.id === targetLayer.id ? updatedLayer : l)),
        }));

        showNotification(
          isAr
            ? `تم قص الصورة بنجاح (${srcW} × ${srcH} بكسل)`
            : `Image cropped successfully (${srcW} × ${srcH} px)`,
          'success'
        );
      } catch (err) {
        console.error('Failed to crop image bitmap:', err);
        showNotification(
          isAr ? 'فشل قص الصورة، يرجى المحاولة مجدداً' : 'Failed to crop image, please try again',
          'error'
        );
      }
    } else {
      // ----------------------------------------------------------------------
      // OPERATION B: CROP CANVAS
      // Canvas dimensions change.
      // All layers remain part of the project.
      // Positions are recalculated relative to new canvas origin.
      // Exported dimensions match new canvas dimensions.
      // Content outside new canvas boundary is clipped naturally.
      // ----------------------------------------------------------------------
      const cropX = Math.round(params.cropArea.x);
      const cropY = Math.round(params.cropArea.y);
      const cropW = Math.max(10, Math.round(params.cropArea.width));
      const cropH = Math.max(10, Math.round(params.cropArea.height));

      const updatedLayers = state.layers.map((layer) => ({
        ...layer,
        x: Math.round(layer.x - cropX),
        y: Math.round(layer.y - cropY),
      }));

      setState((prev) => ({
        ...prev,
        canvasWidth: cropW,
        canvasHeight: cropH,
        activeTool: 'select',
        layers: updatedLayers,
        background: {
          ...prev.background,
          x: (prev.background.x || 0) - cropX,
          y: (prev.background.y || 0) - cropY,
        },
      }));

      showNotification(
        isAr
          ? `تم قص لوحة العمل إلى ${cropW} × ${cropH} بكسل`
          : `Canvas cropped to ${cropW} × ${cropH} px`,
        'success'
      );
    }
  };

  // Handle Apply Freeform Crop (القص الحر)
  const handleApplyFreeformCrop = useCallback(
    async (params: ApplyFreeformCropParams) => {
      const targetLayer = state.layers.find((l) => l.id === params.targetLayerId);
      if (!targetLayer || targetLayer.type !== 'image' || !targetLayer.source || params.points.length < 3) {
        return;
      }

      try {
        const img = await loadImage(targetLayer.source);

        // 1. Compute bounding box of freeform points in layer coordinate space
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        params.points.forEach((pt) => {
          if (pt.x < minX) minX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y > maxY) maxY = pt.y;
        });

        // Clamp to layer bounds
        minX = Math.max(0, Math.min(targetLayer.width - 1, minX));
        minY = Math.max(0, Math.min(targetLayer.height - 1, minY));
        maxX = Math.max(minX + 1, Math.min(targetLayer.width, maxX));
        maxY = Math.max(minY + 1, Math.min(targetLayer.height, maxY));

        const bboxW = Math.round(maxX - minX);
        const bboxH = Math.round(maxY - minY);

        // Scale factors from layer visual dimensions to raw image natural bitmap dimensions
        const scaleX = img.naturalWidth / Math.max(1, targetLayer.width);
        const scaleY = img.naturalHeight / Math.max(1, targetLayer.height);

        // Output bitmap dimensions matching the cropped bounding box at full native resolution
        const srcW = Math.max(1, Math.round(bboxW * scaleX));
        const srcH = Math.max(1, Math.round(bboxH * scaleY));

        // Offscreen canvas for masked crop result
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = srcW;
        cropCanvas.height = srcH;
        const ctx = cropCanvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D context for freeform crop');

        // Draw clipping path using the freeform points translated to bbox origin and scaled to native bitmap
        ctx.save();
        ctx.beginPath();
        params.points.forEach((pt, index) => {
          const bx = (pt.x - minX) * scaleX;
          const by = (pt.y - minY) * scaleY;
          if (index === 0) {
            ctx.moveTo(bx, by);
          } else {
            ctx.lineTo(bx, by);
          }
        });
        ctx.closePath();
        ctx.clip();

        // Draw source image cropped to bbox
        let srcX = Math.round(minX * scaleX);
        let srcY = Math.round(minY * scaleY);
        if (targetLayer.flipHorizontal) {
          srcX = Math.round((targetLayer.width - (minX + bboxW)) * scaleX);
        }
        if (targetLayer.flipVertical) {
          srcY = Math.round((targetLayer.height - (minY + bboxH)) * scaleY);
        }

        ctx.drawImage(
          img,
          srcX,
          srcY,
          srcW,
          srcH,
          0,
          0,
          srcW,
          srcH
        );
        ctx.restore();

        const croppedDataUrl = cropCanvas.toDataURL('image/png');

        // Also handle maskData if layer already had a mask (e.g. from background removal cutout)
        let croppedMaskData = targetLayer.maskData;
        if (targetLayer.maskData) {
          try {
            const maskImg = await loadImage(targetLayer.maskData);
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = srcW;
            maskCanvas.height = srcH;
            const maskCtx = maskCanvas.getContext('2d');
            if (maskCtx) {
              const maskScaleX = maskImg.naturalWidth / Math.max(1, targetLayer.width);
              const maskScaleY = maskImg.naturalHeight / Math.max(1, targetLayer.height);

              maskCtx.save();
              maskCtx.beginPath();
              params.points.forEach((pt, index) => {
                const bx = (pt.x - minX) * maskScaleX;
                const by = (pt.y - minY) * maskScaleY;
                if (index === 0) maskCtx.moveTo(bx, by);
                else maskCtx.lineTo(bx, by);
              });
              maskCtx.closePath();
              maskCtx.clip();

              let mSrcX = Math.round(minX * maskScaleX);
              let mSrcY = Math.round(minY * maskScaleY);
              if (targetLayer.flipHorizontal) {
                mSrcX = Math.round((targetLayer.width - (minX + bboxW)) * maskScaleX);
              }
              if (targetLayer.flipVertical) {
                mSrcY = Math.round((targetLayer.height - (minY + bboxH)) * maskScaleY);
              }

              maskCtx.drawImage(
                maskImg,
                mSrcX,
                mSrcY,
                srcW,
                srcH,
                0,
                0,
                srcW,
                srcH
              );
              maskCtx.restore();
              croppedMaskData = maskCanvas.toDataURL('image/png');
            }
          } catch (mErr) {
            console.warn('Could not crop maskData in freeform crop:', mErr);
          }
        }

        // Calculate layer's new canvas position
        let newLayerX = Math.round(targetLayer.x + minX);
        let newLayerY = Math.round(targetLayer.y + minY);

        if (targetLayer.rotation) {
          const oldCenterX = targetLayer.x + targetLayer.width / 2;
          const oldCenterY = targetLayer.y + targetLayer.height / 2;

          const cropCenterLocalX = minX + bboxW / 2;
          const cropCenterLocalY = minY + bboxH / 2;

          const deltaLocalX = cropCenterLocalX - targetLayer.width / 2;
          const deltaLocalY = cropCenterLocalY - targetLayer.height / 2;

          const rotRad = (targetLayer.rotation * Math.PI) / 180;
          const deltaCanvasX = deltaLocalX * Math.cos(rotRad) - deltaLocalY * Math.sin(rotRad);
          const deltaCanvasY = deltaLocalX * Math.sin(rotRad) + deltaLocalY * Math.cos(rotRad);

          const newCenterX = oldCenterX + deltaCanvasX;
          const newCenterY = oldCenterY + deltaCanvasY;

          newLayerX = Math.round(newCenterX - bboxW / 2);
          newLayerY = Math.round(newCenterY - bboxH / 2);
        }

        const updatedLayer: Layer = {
          ...targetLayer,
          source: croppedDataUrl,
          maskData: croppedMaskData,
          x: newLayerX,
          y: newLayerY,
          width: Math.round(bboxW),
          height: Math.round(bboxH),
          bitmapWidth: srcW,
          bitmapHeight: srcH,
        };

        // Update ONLY targetLayer. Canvas dimensions and other layers are completely preserved!
        setState((prev) => ({
          ...prev,
          activeTool: 'select',
          layers: prev.layers.map((l) => (l.id === targetLayer.id ? updatedLayer : l)),
        }));

        showNotification(
          isAr
            ? `تم تنفيذ القص الحر بنجاح (${srcW} × ${srcH} بكسل)`
            : `Freeform crop applied successfully (${srcW} × ${srcH} px)`,
          'success'
        );
      } catch (err) {
        console.error('Failed to apply freeform crop:', err);
        showNotification(
          isAr ? 'فشل تطبيق القص الحر، يرجى المحاولة مجدداً' : 'Failed to apply freeform crop, please try again',
          'error'
        );
      }
    },
    [state.layers, showNotification, isAr, setState]
  );

  // Real AI Background Removal using Node.js WASM/ONNX engine (@imgly/background-removal-node)
  const handleAutoRemoveBg = async () => {
    // 1. Determine which layer to process
    let targetLayer = state.layers.find((l) => l.id === state.selectedLayerId);
    if (!targetLayer || targetLayer.type !== 'image' || !targetLayer.source) {
      // If selected layer is not an image, find the first image layer
      const firstImage = state.layers.find((l) => l.type === 'image' && l.source);
      if (firstImage) {
        targetLayer = firstImage;
        setState((prev) => ({ ...prev, selectedLayerId: firstImage.id }));
      } else {
        showNotification(
          isAr
            ? 'يرجى تحديد أو رفع صورة أولاً لعزل خلفيتها.'
            : 'Please select or upload an image layer first.',
          'info'
        );
        return;
      }
    }

    const targetId = targetLayer.id;
    const originalSrc = targetLayer.source;
    setIsRemovingBg(true);

    try {
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: originalSrc,
          method: 'auto',
          threshold: 25,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || errJson.details || (isAr ? 'فشلت معالجة عزل الخلفية' : 'Background removal failed'));
      }

      const data = await response.json();
      if (!data.success || !data.processedImage) {
        throw new Error(data.error || (isAr ? 'لم يتم استلام الصورة المعزولة من الخادم' : 'No processed image received'));
      }

      // Update the layer source with the real transparent PNG cutout
      const cutoutImg = new Image();
      cutoutImg.onload = () => {
        const w = cutoutImg.naturalWidth || cutoutImg.width;
        const h = cutoutImg.naturalHeight || cutoutImg.height;
        setState((prev) => ({
          ...prev,
          layers: prev.layers.map((l) =>
            l.id === targetId
              ? {
                  ...l,
                  source: data.processedImage,
                  originalSource: l.originalSource || originalSrc,
                  bitmapWidth: w,
                  bitmapHeight: h,
                  name: l.name.includes(isAr ? '(معزولة)' : '(Cutout)')
                    ? l.name
                    : `${l.name} (${isAr ? 'معزولة' : 'Cutout'})`,
                }
              : l
          ),
        }));
      };
      cutoutImg.src = data.processedImage;

      showNotification(
        isAr
          ? 'تم عزل الخلفية بنجاح بدقة الذكاء الاصطناعي وجعلها شفافة بالكامل!'
          : 'Background removed successfully with real AI transparency!',
        'success'
      );
    } catch (err: any) {
      console.error('Auto remove bg error:', err);
      showNotification(
        err.message || (isAr ? 'تعذر الاتصال بمحرك عزل الخلفية' : 'Could not connect to background removal service'),
        'error'
      );
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Open Real Image Resample / Bitmap Resize Modal
  const handleOpenResizeModal = (targetId?: string) => {
    let target = targetId ? state.layers.find((l) => l.id === targetId) : null;
    if (!target && state.selectedLayerId) {
      target = state.layers.find((l) => l.id === state.selectedLayerId);
    }
    if (!target || target.type !== 'image' || !target.source) {
      // If current selected layer is not an image, find the first image layer in the project
      const firstImg = state.layers.find((l) => l.type === 'image' && l.source);
      if (firstImg) {
        target = firstImg;
        setState((prev) => ({ ...prev, selectedLayerId: firstImg.id }));
      } else {
        showNotification(
          isAr
            ? 'يرجى تحديد أو رفع صورة أولاً لتغيير أبعاد بكسلاتها الحقيقية.'
            : 'Please select or upload an image first to resize its bitmap pixels.',
          'info'
        );
        return;
      }
    }

    setResizeTargetLayerId(target.id);
    setIsResizeModalOpen(true);
  };

  // Apply Real Image Resample (Genuine Bitmap Resampling in Memory)
  const handleApplyRealResize = (
    layerId: string,
    result: ResampleResult,
    config: ImageResizeConfig
  ) => {
    setState((prev) => {
      const updatedLayers = prev.layers.map((layer) => {
        if (layer.id !== layerId) return layer;

        let nextDisplayW = layer.width;
        let nextDisplayH = layer.height;

        if (config.updateDisplayBounds === 'match_pixels') {
          nextDisplayW = result.width;
          nextDisplayH = result.height;
        }

        return {
          ...layer,
          source: result.dataUrl,
          bitmapWidth: result.width,
          bitmapHeight: result.height,
          width: nextDisplayW,
          height: nextDisplayH,
        };
      });

      let nextCanvasW = prev.canvasWidth;
      let nextCanvasH = prev.canvasHeight;

      if (config.resizeCanvasToFit) {
        nextCanvasW = result.width;
        nextCanvasH = result.height;
      }

      return {
        ...prev,
        layers: updatedLayers,
        canvasWidth: nextCanvasW,
        canvasHeight: nextCanvasH,
      };
    });

    showNotification(
      isAr
        ? `تم تغيير أبعاد الصورة الحقيقية بنجاح إلى ${result.width} × ${result.height} بكسل (${result.megapixels} MP)`
        : `Real image resize applied successfully: ${result.width} × ${result.height} px (${result.megapixels} MP)`,
      'success'
    );
  };

  // Apply Document-level Image Size (All layers, canvas dimensions, resample algorithms)
  const handleApplyDocumentImageSize = useCallback(
    async (config: DocumentResizeConfig) => {
      try {
        if (config.resample) {
          showNotification(
            isAr ? 'جاري تحجيم وإعادة أخذ عينات المستند بالكامل...' : 'Resampling document layers...',
            'info'
          );

          const updatedLayers = await resampleDocumentLayers(
            state.layers,
            state.canvasWidth,
            state.canvasHeight,
            config.targetWidth,
            config.targetHeight,
            config.algorithm,
            config.scaleLayerStyles
          );

          setState((prev) => ({
            ...prev,
            canvasWidth: config.targetWidth,
            canvasHeight: config.targetHeight,
            resolution: config.resolution,
            layers: updatedLayers,
          }));

          showNotification(
            isAr
              ? `تم تغيير حجم الصورة إلى ${config.targetWidth} × ${config.targetHeight} بكسل`
              : `Image size updated to ${config.targetWidth} × ${config.targetHeight} px`,
            'success'
          );
        } else {
          // Without resample: pixels are unchanged, only resolution metadata is updated
          setState((prev) => ({
            ...prev,
            resolution: config.resolution,
          }));

          showNotification(
            isAr
              ? `تم تحديث دقة الصورة إلى ${config.resolution} PPI`
              : `Document resolution updated to ${config.resolution} PPI`,
            'success'
          );
        }
      } catch (err) {
        console.error('Failed to apply document image size:', err);
        showNotification(
          isAr ? 'حدث خطأ أثناء تغيير حجم الصورة' : 'Failed to resize document',
          'error'
        );
      }
    },
    [state.layers, state.canvasWidth, state.canvasHeight, isAr, showNotification, setState]
  );

  // Apply Canvas Size (Artboard expansion/contraction with 9-point anchor)
  const handleApplyCanvasSize = useCallback(
    async (config: CanvasResizeConfig) => {
      if (!config || typeof config !== 'object') return;
      const targetW = Math.round(Number(config.targetWidth));
      const targetH = Math.round(Number(config.targetHeight));
      if (isNaN(targetW) || targetW < 1 || isNaN(targetH) || targetH < 1) {
        showNotification(isAr ? 'أبعاد اللوحة غير صالحة' : 'Invalid canvas dimensions', 'error');
        return;
      }
      const safeW = Math.min(MAX_SAFE_IMAGE_DIMENSION, targetW);
      const safeH = Math.min(MAX_SAFE_IMAGE_DIMENSION, targetH);

      const oldW = state.canvasWidth || 1080;
      const oldH = state.canvasHeight || 1080;
      const currentLayers = Array.isArray(state.layers) ? state.layers : [];

      try {
        const updatedLayers = await offsetLayersForCanvasResize(
          currentLayers,
          oldW,
          oldH,
          safeW,
          safeH,
          config.anchor
        );

        if (!Array.isArray(updatedLayers)) {
          throw new Error('offsetLayersForCanvasResize failed to produce layer array');
        }

        setState((prev) => ({
          ...prev,
          canvasWidth: safeW,
          canvasHeight: safeH,
          layers: updatedLayers,
          background: {
            type: config.background.type === 'transparent' ? 'transparent' : 'solid',
            color: config.background.type === 'solid' ? config.background.color || '#F1F5F9' : undefined,
          },
        }));

        setIsCanvasSizeModalOpen(false);
        showNotification(
          isAr
            ? `تم تغيير حجم اللوحة إلى ${safeW} × ${safeH} بكسل`
            : `Canvas size updated to ${safeW} × ${safeH} px`,
          'success'
        );
      } catch (err) {
        console.error('Failed to apply canvas size:', err);
        showNotification(
          isAr ? 'حدث خطأ أثناء تغيير حجم اللوحة' : 'Failed to resize canvas',
          'error'
        );
      }
    },
    [state.layers, state.canvasWidth, state.canvasHeight, isAr, showNotification, setState]
  );

  // Export & Download rendered Canvas using the comprehensive compositeRenderer engine
  const handleExport = async (exportSettings: ExportSettings) => {
    try {
      const { dataUrl, fileName } = await exportCompositeImage(
        state.layers,
        state.background,
        state.canvasWidth,
        state.canvasHeight,
        exportSettings
      );

      // Trigger browser download
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to export composite image:', err);
    }
  };

  // Active Vector Path Layer (Photoshop-grade non-destructive Bézier architecture)
  const activePathLayer =
    state.layers.find((l) => l.id === state.selectedLayerId && l.type === 'path') ||
    (state.activeTool === 'pen' ? state.layers.find((l) => l.type === 'path') : null) ||
    null;

  const handleCreateNewPathLayer = useCallback((initialPoint: PathPoint) => {
    const newPathLayerId = `path_${Date.now()}`;
    const newPathConfig: PathConfig = {
      points: [initialPoint],
      closed: false,
      fillColor: 'transparent',
      strokeColor: '#6C4DFF',
      strokeWidth: 3,
      strokeCap: 'round',
      strokeJoin: 'round',
      isDraft: true,
      viewBoxWidth: state.canvasWidth,
      viewBoxHeight: state.canvasHeight,
    };

    const newLayer: Layer = {
      id: newPathLayerId,
      name:
        isAr
          ? `مسار متجهات ${state.layers.filter((l) => l.type === 'path').length + 1}`
          : `Vector Path ${state.layers.filter((l) => l.type === 'path').length + 1}`,
      type: 'path',
      x: 0,
      y: 0,
      width: state.canvasWidth,
      height: state.canvasHeight,
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      zIndex: (state.layers.length > 0 ? Math.max(...state.layers.map((l) => l.zIndex || 0)) : 0) + 1,
      filters: { ...DEFAULT_FILTERS },
      pathConfig: newPathConfig,
    };

    setState((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      selectedLayerId: newPathLayerId,
      activeTool: 'pen',
    }));
    setActivePropertyTab('pen');
    setSelectedPointId(initialPoint.id);
  }, [state.canvasWidth, state.canvasHeight, state.layers, isAr, setState]);

  const handleUpdateActivePath = useCallback((updatedConfig: PathConfig, isCompleted = false) => {
    if (!activePathLayer) return;

    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) => {
        if (l.id !== activePathLayer.id) return l;
        return {
          ...l,
          pathConfig: updatedConfig,
        };
      }),
    }));
  }, [activePathLayer, setState]);

  const handleConvertToSelection = useCallback(() => {
    if (!activePathLayer || !activePathLayer.pathConfig) return;
    const { points, closed } = activePathLayer.pathConfig;
    if (!points || points.length < 2) return;
    const d = pathPointsToSvgD(points, closed ?? true);
    setActiveSelectionSvgD(d);
    showNotification(
      isAr
        ? 'تم تحويل المسار إلى تحديد نشط (Marching Ants)'
        : 'Path converted to active selection',
      'success'
    );
  }, [activePathLayer, isAr, showNotification]);

  const handleFillSelection = useCallback((fillColor: string = '#6C4DFF') => {
    if (activePathLayer && activePathLayer.pathConfig) {
      handleUpdateActivePath({
        ...activePathLayer.pathConfig,
        closed: true,
        fillColor,
      });
      showNotification(
        isAr ? 'تمت تعبئة المسار باللون بنجاح' : 'Path filled with color successfully',
        'success'
      );
    }
  }, [activePathLayer, handleUpdateActivePath, isAr, showNotification]);

  const handleStrokeSelection = useCallback((strokeColor: string = '#23B5D3', strokeWidth: number = 3) => {
    if (activePathLayer && activePathLayer.pathConfig) {
      handleUpdateActivePath({
        ...activePathLayer.pathConfig,
        strokeColor,
        strokeWidth,
      });
      showNotification(
        isAr ? 'تم رسم حواف المسار بنجاح' : 'Path stroke applied successfully',
        'success'
      );
    }
  }, [activePathLayer, handleUpdateActivePath, isAr, showNotification]);

  const handleClearSelection = useCallback(() => {
    setActiveSelectionSvgD(null);
  }, []);

  const handleNewPath = useCallback(() => {
    const centerPoint: PathPoint = {
      id: `pt_${Date.now()}_0`,
      x: Math.round(state.canvasWidth / 2 - 60),
      y: Math.round(state.canvasHeight / 2),
      type: 'corner',
    };
    handleCreateNewPathLayer(centerPoint);
  }, [state.canvasWidth, state.canvasHeight, handleCreateNewPathLayer]);

  const handleConvertToMask = useCallback(() => {
    if (!activePathLayer || !activePathLayer.pathConfig) return;
    const maskDataUrl = rasterizePathToMask(
      activePathLayer.pathConfig,
      state.canvasWidth,
      state.canvasHeight
    );
    const targetLayer = state.layers.find(
      (l) => l.id !== activePathLayer.id && l.type !== 'path'
    );
    if (!targetLayer) {
      showNotification(
        isAr ? 'يرجى تحديد أو إنشاء طبقة لتطبيق القناع عليها' : 'Please select or create a layer to apply mask to',
        'info'
      );
      return;
    }
    setState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === targetLayer.id
          ? {
              ...l,
              mask: {
                enabled: true,
                inverted: false,
                dataUrl: maskDataUrl,
              },
            }
          : l
      ),
    }));
    showNotification(
      isAr
        ? `تم تحويل المسار إلى قناع على طبقة "${targetLayer.name}"`
        : `Vector path converted to mask on "${targetLayer.name}"`,
      'success'
    );
  }, [activePathLayer, state.canvasWidth, state.canvasHeight, state.layers, isAr, showNotification, setState]);

  const penPropsForCanvas = {
    activePathLayer,
    onUpdateActivePath: handleUpdateActivePath,
    onCreateNewPathLayer: handleCreateNewPathLayer,
    selectedPointId,
    setSelectedPointId,
    activeSelectionSvgD,
    onFillSelection: handleFillSelection,
    onStrokeSelection: handleStrokeSelection,
    onClearSelection: handleClearSelection,
  };

  const penPropsForPanel = {
    activePathLayer,
    onUpdatePathConfig: handleUpdateActivePath,
    onConvertToSelection: handleConvertToSelection,
    onConvertToMask: handleConvertToMask,
    onNewPath: handleNewPath,
    selectedPointId,
    setSelectedPointId,
  };

  // Remove Object Tool State & Handlers
  const [removeObjectBrushSize, setRemoveObjectBrushSize] = useState<number>(28);
  const [removeObjectHardness, setRemoveObjectHardness] = useState<number>(0.5);
  const [removeObjectMode, setRemoveObjectMode] = useState<'add' | 'remove'>('add');
  const [removeObjectHasMask, setRemoveObjectHasMask] = useState<boolean>(false);
  const [removeObjectIsPreviewing, setRemoveObjectIsPreviewing] = useState<boolean>(false);
  const [removeObjectIsProcessing, setRemoveObjectIsProcessing] = useState<boolean>(false);
  const removeObjectMaskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [removeObjectPreviewCanvas, setRemoveObjectPreviewCanvas] = useState<HTMLCanvasElement | null>(null);

  const handleClearRemoveObjectMask = useCallback(() => {
    if (removeObjectMaskCanvasRef.current) {
      const ctx = removeObjectMaskCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(
          0,
          0,
          removeObjectMaskCanvasRef.current.width,
          removeObjectMaskCanvasRef.current.height
        );
      }
    }
    setRemoveObjectHasMask(false);
    setRemoveObjectIsPreviewing(false);
    setRemoveObjectPreviewCanvas(null);
  }, []);

  const handleToggleRemoveObjectPreview = useCallback(async () => {
    if (removeObjectIsPreviewing) {
      setRemoveObjectIsPreviewing(false);
      return;
    }

    const selectedLayer = (state.layers || []).find((l) => l.id === state.selectedLayerId);
    if (!selectedLayer || selectedLayer.type !== 'image' || !selectedLayer.source || selectedLayer.locked) {
      showNotification(
        isAr
          ? 'تعمل أداة إزالة الكائن على طبقات الصور فقط. يرجى تحديد طبقة صورة قابلة للتعديل.'
          : 'Remove Object works on raster/image content. Select an editable image layer.',
        'warning'
      );
      return;
    }

    if (!removeObjectMaskCanvasRef.current || !removeObjectHasMask) {
      showNotification(
        isAr
          ? 'يرجى تحديد الكائن أو المنطقة المراد إزالتها أولاً باستخدام الفرشاة.'
          : 'Please paint over the object you want to remove first.',
        'warning'
      );
      return;
    }

    try {
      setRemoveObjectIsProcessing(true);
      const img = await loadImage(selectedLayer.source);
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = selectedLayer.bitmapWidth || selectedLayer.width;
      srcCanvas.height = selectedLayer.bitmapHeight || selectedLayer.height;
      const ctx = srcCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, srcCanvas.width, srcCanvas.height);
      }

      const inpaintedCanvas = await inpaintImage(srcCanvas, removeObjectMaskCanvasRef.current, {
        feather: 1 - removeObjectHardness,
        quality: 'high',
      });

      setRemoveObjectPreviewCanvas(inpaintedCanvas);
      setRemoveObjectIsPreviewing(true);
      showNotification(
        isAr ? 'تم إنشاء معاينة النتيجة الذكية لإزالة الكائن' : 'Previewing reconstructed background',
        'info'
      );
    } catch (err) {
      console.error('Inpaint preview failed:', err);
      showNotification(
        isAr ? 'حدث خطأ أثناء معالجة الصورة وإعادة البناء' : 'Failed to reconstruct background',
        'error'
      );
    } finally {
      setRemoveObjectIsProcessing(false);
    }
  }, [removeObjectIsPreviewing, state.layers, state.selectedLayerId, removeObjectHasMask, removeObjectHardness, isAr, showNotification]);

  const handleApplyRemoveObject = useCallback(async () => {
    const selectedLayer = (state.layers || []).find((l) => l.id === state.selectedLayerId);
    if (!selectedLayer || selectedLayer.type !== 'image' || !selectedLayer.source || selectedLayer.locked) {
      showNotification(
        isAr
          ? 'تعمل أداة إزالة الكائن على طبقات الصور فقط. يرجى تحديد طبقة صورة قابلة للتعديل.'
          : 'Remove Object works on raster/image content. Select an editable image layer.',
        'warning'
      );
      return;
    }

    if (!removeObjectMaskCanvasRef.current || !removeObjectHasMask) {
      showNotification(
        isAr ? 'يرجى تحديد الكائن المراد إزالته أولاً' : 'Please paint over the object first',
        'warning'
      );
      return;
    }

    try {
      setRemoveObjectIsProcessing(true);

      let finalCanvas = removeObjectPreviewCanvas;
      if (!finalCanvas || !removeObjectIsPreviewing) {
        const img = await loadImage(selectedLayer.source);
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width = selectedLayer.bitmapWidth || selectedLayer.width;
        srcCanvas.height = selectedLayer.bitmapHeight || selectedLayer.height;
        const ctx = srcCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, srcCanvas.width, srcCanvas.height);
        }

        finalCanvas = await inpaintImage(srcCanvas, removeObjectMaskCanvasRef.current, {
          feather: 1 - removeObjectHardness,
          quality: 'high',
        });
      }

      const updatedDataUrl = finalCanvas.toDataURL('image/png');

      // Update layer source with single atomic snapshot
      setState((prev) => ({
        ...prev,
        layers: (prev.layers || []).map((l) =>
          l.id === selectedLayer.id
            ? {
                ...l,
                source: updatedDataUrl,
                bitmapWidth: finalCanvas!.width,
                bitmapHeight: finalCanvas!.height,
              }
            : l
        ),
      }));

      // Reset Remove Object mask
      handleClearRemoveObjectMask();

      showNotification(
        isAr
          ? 'تمت إزالة الكائن وإعادة بناء الخلفية بنجاح'
          : 'Object removed and background reconstructed',
        'success'
      );
    } catch (err) {
      console.error('Inpaint apply failed:', err);
      showNotification(
        isAr ? 'حدث خطأ أثناء تطبيق إزالة الكائن' : 'Failed to apply object removal',
        'error'
      );
    } finally {
      setRemoveObjectIsProcessing(false);
    }
  }, [state.layers, state.selectedLayerId, removeObjectHasMask, removeObjectPreviewCanvas, removeObjectIsPreviewing, removeObjectHardness, isAr, showNotification, setState, handleClearRemoveObjectMask]);

  const handleCancelRemoveObject = useCallback(() => {
    handleClearRemoveObjectMask();
    showNotification(
      isAr ? 'تم إلغاء عملية إزالة الكائن' : 'Remove Object cancelled',
      'info'
    );
  }, [handleClearRemoveObjectMask, isAr, showNotification]);

  const removeObjectPropsForCanvasAndPanel = {
    brushSize: removeObjectBrushSize,
    setBrushSize: setRemoveObjectBrushSize,
    hardness: removeObjectHardness,
    setHardness: setRemoveObjectHardness,
    mode: removeObjectMode,
    setMode: setRemoveObjectMode,
    isPreviewing: removeObjectIsPreviewing,
    onTogglePreview: handleToggleRemoveObjectPreview,
    onApply: handleApplyRemoveObject,
    onCancel: handleCancelRemoveObject,
    onClearMask: handleClearRemoveObjectMask,
    hasMask: removeObjectHasMask,
    setHasMask: setRemoveObjectHasMask,
    isProcessing: removeObjectIsProcessing,
    setIsProcessing: setRemoveObjectIsProcessing,
    previewCanvas: removeObjectPreviewCanvas,
    maskCanvasRef: removeObjectMaskCanvasRef,
  };

  return (
    <div id="pixelora-editor-workspace" className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      {/* Top Menu Bar */}
      <EditorTopBar
        state={state}
        onUpdateState={setState}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < historyStack.length - 1}
        onSave={() => onSaveProject(state)}
        onSaveAs={() => {
          setSaveAsName(state.projectName + ' (Copy)');
          setIsSaveAsModalOpen(true);
        }}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenResizeModal={() => setIsImageSizeModalOpen(true)}
        onOpenImageSizeModal={() => setIsImageSizeModalOpen(true)}
        onOpenCanvasSizeModal={() => setIsCanvasSizeModalOpen(true)}
        onActivateCrop={() => setState((prev) => ({ ...prev, activeTool: 'crop' }))}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        onNewProject={() => setIsNewProjectModalOpen(true)}
        onOpenProject={() => setIsOpenProjectModalOpen(true)}
        onOpenImageUpload={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e: any) => handleImageUpload(e.target.files);
          input.click();
        }}
        onResetCanvas={() => {
          setState((prev) => ({
            ...prev,
            layers: [],
            selectedLayerId: null,
            background: { type: 'transparent' },
          }));
        }}
        onCut={handleCut}
        onCopy={handleCopy}
        onPaste={handlePaste}
        canPaste={canPaste}
        onDuplicate={handleDuplicate}
        onDeleteSelected={handleDeleteSelected}
        onSelectAll={handleSelectAll}
        onDeselect={handleDeselect}
        language={language}
        darkMode={darkMode}
      />

      {/* Main Workspace Area: Tools (Left/Right) + Canvas (Center) + Properties (Right/Left) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar */}
        <EditorToolbox
          activeTool={state.activeTool}
          setActiveTool={(tool) => {
            setState((prev) => ({ ...prev, activeTool: tool }));
            if (tool === 'text') {
              setActivePropertyTab('text');
            } else if (tool === 'eraser') {
              setBrushConfig((b) => ({ ...b, tool: 'eraser' }));
              setActivePropertyTab('eraser');
            } else if (tool === 'draw') {
              setBrushConfig((b) => ({ ...b, tool: 'brush' }));
              setActivePropertyTab('brush');
            } else if (tool === 'bg_remove') {
              setActivePropertyTab('bg_remove');
            } else if (tool === 'remove_object') {
              setActivePropertyTab('remove_object');
            } else if (tool === 'pen') {
              setActivePropertyTab('pen');
            } else if (tool === 'transform') {
              setActivePropertyTab('transform');
            }
          }}
          onAddTextLayer={handleAddTextLayer}
          onAddShapeLayer={handleAddShapeLayer}
          onOpenShapeLibrary={() => setIsShapeModalOpen(true)}
          onOpenResizeModal={() => handleOpenResizeModal()}
          onSelectPropertyTab={(tab) => setActivePropertyTab(tab)}
          language={language}
        />

        {/* Center Interactive Canvas */}
        <EditorCanvas
          state={state}
          onUpdateState={setState}
          onSelectLayer={(id) => {
            setState((prev) => ({ ...prev, selectedLayerId: id }));
            const layer = state.layers.find((l) => l.id === id);
            if (layer?.type === 'text') {
              setActivePropertyTab('text');
            } else if (layer?.type === 'path') {
              setActivePropertyTab('pen');
              setState((prev) => ({ ...prev, activeTool: 'pen' }));
            } else if (state.activeTool === 'transform') {
              setActivePropertyTab('transform');
            } else if (state.activeTool === 'remove_object') {
              setActivePropertyTab('remove_object');
            }
          }}
          onImageUpload={handleImageUpload}
          language={language}
          darkMode={darkMode}
          brushConfig={brushConfig}
          setBrushConfig={setBrushConfig}
          recentColors={recentColors}
          onSelectColor={handleSelectColor}
          isEyedropperActive={isEyedropperActive}
          onToggleEyedropper={handleToggleEyedropper}
          onApplyCrop={handleApplyCrop}
          onApplyFreeformCrop={handleApplyFreeformCrop}
          onOpenTextInspector={() => setActivePropertyTab('text')}
          penProps={penPropsForCanvas}
          transformProps={{
            onApplyTransform: handleApplyTransform,
            onCancelTransform: handleCancelTransform,
            onResetTransform: handleResetTransform,
          }}
          removeObjectProps={removeObjectPropsForCanvasAndPanel}
          cutoutProps={cutoutProps}
        />

        {/* Right Properties Panel */}
        <EditorPropertiesPanel
          state={state}
          onUpdateState={setState}
          activeTab={activePropertyTab}
          setActiveTab={setActivePropertyTab}
          onOpenShapeModal={() => setIsShapeModalOpen(true)}
          language={language}
          darkMode={darkMode}
          brushConfig={brushConfig}
          setBrushConfig={setBrushConfig}
          penProps={penPropsForPanel}
          transformProps={{
            onApplyTransform: handleApplyTransform,
            onCancelTransform: handleCancelTransform,
            onResetTransform: handleResetTransform,
          }}
          removeObjectProps={removeObjectPropsForCanvasAndPanel}
          cutoutProps={cutoutProps}
          isEyedropperActive={isEyedropperActive}
          onToggleEyedropper={handleToggleEyedropper}
          eyedropperTarget={eyedropperTarget}
          recentColors={recentColors}
          onConvertToMask={handleConvertToMask}
          onAutoRemoveBg={handleAutoRemoveBg}
          isRemovingBg={isRemovingBg}
          onOpenResizeModal={() => handleOpenResizeModal()}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onMergeDown={handleMergeDown}
          onMergeVisible={handleMergeVisible}
          onFlattenImage={handleFlattenImage}
          onImageUpload={handleImageUpload}
        />
      </div>

      {/* Bottom Status & Zoom Bar */}
      <EditorBottomBar state={state} onUpdateState={setState} language={language} />

      {/* Document-level Image Size (حجم الصورة) Modal */}
      {isImageSizeModalOpen && (
        <ImageSizeModal
          isOpen={isImageSizeModalOpen}
          onClose={() => setIsImageSizeModalOpen(false)}
          canvasWidth={state.canvasWidth}
          canvasHeight={state.canvasHeight}
          resolution={state.resolution || 72}
          layers={state.layers}
          background={state.background}
          onApplyImageSize={handleApplyDocumentImageSize}
          language={language}
        />
      )}

      {/* Canvas Size (حجم اللوحة) Modal with 9-Point Anchor */}
      {isCanvasSizeModalOpen && (
        <CanvasSizeModal
          isOpen={isCanvasSizeModalOpen}
          onClose={() => setIsCanvasSizeModalOpen(false)}
          canvasWidth={state.canvasWidth}
          canvasHeight={state.canvasHeight}
          resolution={state.resolution || 72}
          layers={state.layers}
          background={state.background}
          onApplyCanvasSize={handleApplyCanvasSize}
          language={language}
        />
      )}

      {/* Real Image Resample / Bitmap Resize Modal */}
      {isResizeModalOpen && (
        <ImageResizeModal
          isOpen={isResizeModalOpen}
          onClose={() => setIsResizeModalOpen(false)}
          layer={state.layers.find((l) => l.id === (resizeTargetLayerId || state.selectedLayerId)) || null}
          canvasWidth={state.canvasWidth}
          canvasHeight={state.canvasHeight}
          onApplyResize={handleApplyRealResize}
          language={language}
        />
      )}

      {/* Shape Library Modal */}
      {isShapeModalOpen && (
        <ShapeLibraryModal
          isOpen={isShapeModalOpen}
          onClose={() => setIsShapeModalOpen(false)}
          onSelectShape={(shapeType) => {
            // If a shape layer is currently selected, update its shapeType, else add new shape layer
            const selected = state.layers.find((l) => l.id === state.selectedLayerId);
            if (selected && selected.type === 'shape') {
              setState((prev) => ({
                ...prev,
                layers: prev.layers.map((l) =>
                  l.id === selected.id
                    ? {
                        ...l,
                        name: `شكل ${shapeType}`,
                        shapeConfig: {
                          ...l.shapeConfig!,
                          shapeType,
                        },
                      }
                    : l
                ),
              }));
            } else {
              handleAddShapeLayer(shapeType);
            }
          }}
          language={language}
        />
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          exportSettings={state.exportSettings}
          canvasWidth={state.canvasWidth}
          canvasHeight={state.canvasHeight}
          onExport={handleExport}
          language={language}
        />
      )}

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <NewProjectModal
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreateProject={(w, h, name, bgType, bgColor) => {
            setState((prev) => ({
              ...prev,
              projectName: name,
              canvasWidth: w,
              canvasHeight: h,
              layers: [],
              selectedLayerId: null,
              background: {
                type: bgType,
                color: bgColor,
              },
            }));
          }}
          language={language}
        />
      )}

      {/* Open Project Modal */}
      {isOpenProjectModalOpen && (
        <OpenProjectModal
          isOpen={isOpenProjectModalOpen}
          onClose={() => setIsOpenProjectModalOpen(false)}
          onSelectProject={(proj) => {
            const sanitized = sanitizeProject(proj);
            const rawLayers = Array.isArray(sanitized.state.layers)
              ? sanitized.state.layers
              : [];
            const canvasW = sanitized.state.canvasWidth || sanitized.width || 1080;
            const canvasH = sanitized.state.canvasHeight || sanitized.height || 1080;
            const migrated = migrateLayersToEffectLayers(rawLayers, canvasW, canvasH, isAr);

            const nextState: EditorState = {
              ...INITIAL_EDITOR_STATE,
              ...sanitized.state,
              projectId: sanitized.id,
              projectName: sanitized.name,
              canvasWidth: canvasW,
              canvasHeight: canvasH,
              layers: migrated,
              history: [],
              historyIndex: 0,
            };
            setState(nextState);
            setHistoryStack([
              {
                layers: migrated,
                canvasWidth: canvasW,
                canvasHeight: canvasH,
              },
            ]);
            setHistoryIndex(0);
            showNotification(
              isAr ? `تم فتح المشروع "${sanitized.name}" بنجاح` : `Project "${sanitized.name}" opened successfully`,
              'success'
            );
          }}
          onImportFile={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e: any) => handleImageUpload(e.target.files);
            input.click();
          }}
          language={language}
        />
      )}

      {/* Save As Modal */}
      {isSaveAsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              {isAr ? 'حفظ نسخة من المشروع باسم جديد' : 'Save Project Copy As'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {isAr
                ? 'أدخل اسم النسخة الجديدة لحفظها كمشروع مستقل في ذاكرة التطبيق'
                : 'Enter a name for the new copy to save it in local storage'}
            </p>
            <input
              type="text"
              autoFocus
              value={saveAsName}
              onChange={(e) => setSaveAsName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveAsConfirm()}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white mb-5 focus:outline-hidden focus:border-[#6C4DFF]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSaveAsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSaveAsConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-[#6C4DFF] hover:bg-[#5B3EE6] rounded-xl shadow-xs"
              >
                {isAr ? 'حفظ النسخة' : 'Save Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        language={language}
        darkMode={darkMode}
      />

      {/* Floating Status / Action Toast */}
      {toastMessage && (
        <div
          id="editor-action-toast"
          className={`fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-3 duration-200 border ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/30'
              : toastMessage.type === 'error'
              ? 'bg-rose-950/90 text-rose-200 border-rose-500/30'
              : 'bg-slate-900/90 text-slate-200 border-slate-700/50'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-cyan-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
};
