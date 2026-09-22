import React, { useState } from 'react';
import {
  Layers,
  Sliders,
  Sparkles,
  Scissors,
  Palette,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Type,
  Square,
  Paintbrush,
  Check,
  Upload,
  Circle,
  Triangle,
  Minus,
  MoveRight,
  Star,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Eraser,
  Plus,
  Maximize2,
  Combine,
  SunMedium,
  Sun,
  Contrast,
  Droplets,
  Zap,
  TrendingUp,
  Film,
  CircleDot,
  PenTool,
  Wand2,
} from 'lucide-react';
import {
  EditorState,
  LayerFilters,
  PresetFilterType,
  BackgroundTemplate,
  ShapeType,
  Layer,
  BrushConfig,
  EffectType,
  PathConfig,
} from '../../types';
import { createEffectLayer, getEffectLayerName, isolateEffectFilters } from '../../utils/effectLayers';
import { BACKGROUND_TEMPLATES } from '../../data/backgrounds';
import { DEFAULT_FILTERS } from '../../data/sampleProjects';
import { TextInspector } from './TextInspector';
import { EraserInspector } from './EraserInspector';
import { BrushInspector } from './BrushInspector';
import { PenInspector } from './PenInspector';
import { TransformInspector } from './Transform/TransformInspector';
import { RemoveObjectInspector } from './RemoveObject/RemoveObjectInspector';
import { FilterLibraryPanel } from './Adjustments/FilterLibraryPanel';
import { ManualAdjustmentsPanel } from './Adjustments/ManualAdjustmentsPanel';
import { UnifiedColorPicker } from '../common/UnifiedColorPicker';

export const renderEffectIcon = (effectType?: EffectType) => {
  switch (effectType) {
    case 'brightness':
    case 'exposure':
    case 'highlights':
    case 'whites':
      return <Sun className="w-4 h-4 text-amber-500" />;
    case 'shadows':
    case 'blacks':
      return <SunMedium className="w-4 h-4 text-amber-600" />;
    case 'contrast':
      return <Contrast className="w-4 h-4 text-blue-500" />;
    case 'saturation':
    case 'vibrance':
    case 'temperature':
    case 'tint':
      return <Palette className="w-4 h-4 text-emerald-500" />;
    case 'blur':
      return <Droplets className="w-4 h-4 text-cyan-500" />;
    case 'sharpen':
      return <Zap className="w-4 h-4 text-yellow-500" />;
    case 'curves':
      return <TrendingUp className="w-4 h-4 text-violet-500" />;
    case 'hsl':
      return <Sliders className="w-4 h-4 text-pink-500" />;
    case 'color_grading':
      return <Film className="w-4 h-4 text-indigo-500" />;
    case 'grain':
      return <Film className="w-4 h-4 text-stone-500" />;
    case 'vignette':
      return <CircleDot className="w-4 h-4 text-purple-500" />;
    case 'filter':
      return <Sparkles className="w-4 h-4 text-amber-500" />;
    default:
      return <Sparkles className="w-4 h-4 text-amber-500" />;
  }
};

interface EditorPropertiesPanelProps {
  state: EditorState;
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void;
  activeTab: 'layers' | 'text' | 'brush' | 'eraser' | 'adjust' | 'filters' | 'bg_remove' | 'background' | 'tools' | 'pen' | 'transform' | 'remove_object';
  setActiveTab: (tab: 'layers' | 'text' | 'brush' | 'eraser' | 'adjust' | 'filters' | 'bg_remove' | 'background' | 'tools' | 'pen' | 'transform' | 'remove_object') => void;
  onOpenShapeModal?: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
  brushConfig: BrushConfig;
  setBrushConfig: React.Dispatch<React.SetStateAction<BrushConfig>>;
  removeObjectProps?: {
    brushSize: number;
    setBrushSize: (size: number) => void;
    hardness: number;
    setHardness: (hardness: number) => void;
    mode: 'add' | 'remove';
    setMode: (mode: 'add' | 'remove') => void;
    isPreviewing: boolean;
    onTogglePreview: () => void;
    onApply: () => void;
    onCancel: () => void;
    onClearMask: () => void;
    hasMask: boolean;
    isProcessing: boolean;
  };
  penProps?: {
    activePathLayer: Layer | null;
    onUpdatePathConfig: (config: PathConfig) => void;
    onConvertToSelection: () => void;
    onConvertToMask?: () => void;
    onNewPath: () => void;
    selectedPointId: string | null;
    setSelectedPointId: (id: string | null) => void;
  };
  transformProps?: {
    onApplyTransform: () => void;
    onCancelTransform: () => void;
    onResetTransform: () => void;
  };
  isEyedropperActive?: boolean;
  onToggleEyedropper?: (target?: any) => void;
  eyedropperTarget?: string | null;
  recentColors?: string[];
  onConvertToMask?: () => void;
  onAutoRemoveBg: () => void;
  isRemovingBg: boolean;
  onOpenResizeModal?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onMergeDown?: () => void;
  onMergeVisible?: () => void;
  onFlattenImage?: () => void;
  onImageUpload?: (files: FileList | null) => void;
  cutoutProps?: {
    mode: 'restore' | 'erase';
    setMode: (mode: 'restore' | 'erase') => void;
  };
}

export const EditorPropertiesPanel: React.FC<EditorPropertiesPanelProps> = ({
  state,
  onUpdateState,
  activeTab,
  setActiveTab,
  onOpenShapeModal,
  language,
  darkMode,
  brushConfig,
  setBrushConfig,
  removeObjectProps,
  penProps,
  transformProps,
  isEyedropperActive = false,
  onToggleEyedropper,
  eyedropperTarget = null,
  recentColors = [],
  onConvertToMask,
  onAutoRemoveBg,
  isRemovingBg,
  onOpenResizeModal,
  onUndo,
  onRedo,
  onMergeDown,
  onMergeVisible,
  onFlattenImage,
  onImageUpload,
  cutoutProps,
}) => {
  const isAr = language === 'ar';
  const safeLayers = Array.isArray(state?.layers) ? state.layers : [];
  const selectedLayer = safeLayers.find((l) => l.id === state.selectedLayerId);
  const selectedTextLayer = selectedLayer?.type === 'text' ? selectedLayer : safeLayers.find((l) => l.type === 'text');

  // Automatic Effect Layer Management (Seamless non-destructive adjustment architecture)
  const handleApplyOrUpdateEffect = (
    effectType: EffectType,
    updater: (prev: LayerFilters) => LayerFilters
  ) => {
    onUpdateState((prev) => {
      const selected = prev.layers.find((l) => l.id === prev.selectedLayerId);

      // Case 1: If an Effect Layer of the exact same effectType is already selected, update it in place!
      if (selected && selected.type === 'effect' && selected.effectType === effectType) {
        const updatedFilters = updater(selected.filters || DEFAULT_FILTERS);
        return {
          ...prev,
          layers: prev.layers.map((l) =>
            l.id === selected.id
              ? {
                  ...l,
                  name: getEffectLayerName(effectType, updatedFilters, isAr),
                  filters: updatedFilters,
                }
              : l
          ),
        };
      }

      // Case 2: New effect operation (from base image or different effect type)
      // Automatically create a new Effect Layer placed above current selected layer
      const initialIsolated = isolateEffectFilters(effectType, updater(DEFAULT_FILTERS));
      const newEffectLayer = createEffectLayer(
        effectType,
        prev.canvasWidth,
        prev.canvasHeight,
        initialIsolated,
        isAr
      );

      const targetZ = selected ? (selected.zIndex || 1) + 1 : prev.layers.length + 1;
      newEffectLayer.zIndex = targetZ;

      return {
        ...prev,
        layers: [...prev.layers, newEffectLayer],
        selectedLayerId: newEffectLayer.id,
      };
    });
  };

  const handleDiscardEffect = (layerId: string) => {
    onUpdateState((prev) => {
      const remaining = prev.layers.filter((l) => l.id !== layerId);
      const fallbackSelected = remaining.find((l) => l.type === 'image') || remaining[remaining.length - 1] || null;
      return {
        ...prev,
        layers: remaining,
        selectedLayerId: fallbackSelected ? fallbackSelected.id : null,
      };
    });
  };

  // Update filters for selected layer
  const updateLayerFilter = (key: keyof LayerFilters, value: any) => {
    if (!state.selectedLayerId) return;
    onUpdateState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === prev.selectedLayerId
          ? { ...l, filters: { ...l.filters, [key]: value } }
          : l
      ),
    }));
  };

  // Functional updater for layer filters
  const updateLayerFiltersFn = (updater: (prev: LayerFilters) => LayerFilters) => {
    if (!state.selectedLayerId) return;
    onUpdateState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === prev.selectedLayerId
          ? { ...l, filters: updater(l.filters || DEFAULT_FILTERS) }
          : l
      ),
    }));
  };

  // Reset filters to default
  const handleResetFilters = () => {
    if (!state.selectedLayerId) return;
    onUpdateState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === prev.selectedLayerId ? { ...l, filters: { ...DEFAULT_FILTERS } } : l
      ),
    }));
  };

  // Duplicate a specific layer
  const handleDuplicateLayer = (layerId: string) => {
    onUpdateState((prev) => {
      const target = prev.layers.find((l) => l.id === layerId);
      if (!target) return prev;
      const isEffect = target.type === 'effect';
      const newLayer: Layer = {
        ...target,
        id: 'layer_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: `${target.name} (${isAr ? 'نسخة' : 'copy'})`,
        x: isEffect ? 0 : target.x + 20,
        y: isEffect ? 0 : target.y + 20,
        width: target.width,
        height: target.height,
        filters: target.filters ? JSON.parse(JSON.stringify(target.filters)) : undefined,
        effectMask: target.effectMask,
        zIndex: (target.zIndex || 0) + 1,
      };
      return {
        ...prev,
        layers: [...prev.layers, newLayer],
        selectedLayerId: newLayer.id,
      };
    });
  };

  // Toggle layer lock
  const handleToggleLock = (layerId: string) => {
    onUpdateState((prev) => ({
      ...prev,
      layers: prev.layers.map((l) =>
        l.id === layerId ? { ...l, locked: !l.locked } : l
      ),
    }));
  };

  // Move layer up/down in zIndex
  const handleMoveLayer = (layerId: string, direction: 'up' | 'down') => {
    onUpdateState((prev) => {
      const index = prev.layers.findIndex((l) => l.id === layerId);
      if (index === -1) return prev;
      if (direction === 'up' && index === prev.layers.length - 1) return prev;
      if (direction === 'down' && index === 0) return prev;

      const targetIndex = direction === 'up' ? index + 1 : index - 1;
      const updated = [...prev.layers];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;

      return {
        ...prev,
        layers: updated.map((l, i) => ({ ...l, zIndex: i + 1 })),
      };
    });
  };

  const presetFiltersList: { id: PresetFilterType; nameAr: string; nameEn: string }[] = [
    { id: 'none', nameAr: 'عادي (أصلي)', nameEn: 'Normal' },
    { id: 'auto_enhance', nameAr: 'تحسين ذكي', nameEn: 'Auto Enhance' },
    { id: 'bw', nameAr: 'أبيض وأسود', nameEn: 'B & W' },
    { id: 'sepia', nameAr: 'سيبيا دافئ', nameEn: 'Sepia' },
    { id: 'vintage', nameAr: 'فينتاج كلاسيكي', nameEn: 'Vintage' },
    { id: 'cool', nameAr: 'بارد نقي', nameEn: 'Cool Blue' },
    { id: 'warm', nameAr: 'دافئ سينمائي', nameEn: 'Warm Glow' },
    { id: 'smooth', nameAr: 'تنعيم ناعم', nameEn: 'Smooth' },
    { id: 'edges', nameAr: 'تحديد الحواف', nameEn: 'Sharp Edges' },
    { id: 'blur', nameAr: 'ضبابية ناعمة', nameEn: 'Soft Blur' },
  ];

  const shapeTypes: { id: ShapeType; nameAr: string; nameEn: string; icon: any }[] = [
    { id: 'rectangle', nameAr: 'مستطيل', nameEn: 'Rectangle', icon: Square },
    { id: 'circle', nameAr: 'دائرة', nameEn: 'Circle', icon: Circle },
    { id: 'triangle', nameAr: 'مثلث', nameEn: 'Triangle', icon: Triangle },
    { id: 'line', nameAr: 'خط مستقيم', nameEn: 'Line', icon: Minus },
    { id: 'arrow', nameAr: 'سهم', nameEn: 'Arrow', icon: MoveRight },
    { id: 'star', nameAr: 'نجمة', nameEn: 'Star', icon: Star },
  ];

  const colorPresets = [
    '#6C4DFF',
    '#23B5D3',
    '#2DD4BF',
    '#F43F5E',
    '#F59E0B',
    '#10B981',
    '#0F172A',
    '#FFFFFF',
    '#E2E8F0',
    '#475569',
  ];

  return (
    <aside
      id="editor-properties-panel"
      className="w-80 bg-white dark:bg-slate-800 border-r sm:border-r-0 sm:border-l border-slate-200/90 dark:border-slate-700 flex flex-col shrink-0 select-none z-20 h-full overflow-hidden shadow-2xs"
    >
      {/* Tabs Header */}
      <div className="flex items-center border-b border-slate-200/90 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/60 p-1.5 gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('layers')}
          title={isAr ? 'إدارة طبقات المشروع وترتيبها' : 'Manage project layers & hierarchy'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'layers'
              ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isAr ? 'الطبقات' : 'Layers'}</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-200/80 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full font-mono font-bold">
            {state.layers.length}
          </span>
        </button>

        {/* Text Tab Button */}
        <button
          onClick={() => setActiveTab('text')}
          title={isAr ? 'خصائص النصوص والخطوط والمحاذاة' : 'Text formatting and typography'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'text'
              ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <Type className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
          <span>{isAr ? 'النص' : 'Text'}</span>
          {selectedLayer?.type === 'text' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DFF]" />
          )}
        </button>

        {/* Brush Tab Button */}
        <button
          onClick={() => {
            setActiveTab('brush');
            setBrushConfig((b) => ({ ...b, tool: 'brush' }));
            onUpdateState((prev) => ({ ...prev, activeTool: 'draw' }));
          }}
          title={isAr ? 'إعدادات الفرشاة وحجم الرسم واللون' : 'Brush size, opacity & color'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'brush'
              ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <Paintbrush className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
          <span>{isAr ? 'الفرشاة' : 'Brush'}</span>
          {state.activeTool === 'draw' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DFF]" />
          )}
        </button>

        {/* Eraser Tab Button */}
        <button
          onClick={() => {
            setActiveTab('eraser');
            setBrushConfig((b) => ({ ...b, tool: 'eraser' }));
            onUpdateState((prev) => ({ ...prev, activeTool: 'eraser' }));
          }}
          title={isAr ? 'إعدادات الممحاة وحجم المسح والصلابة' : 'Eraser size, opacity & hardness'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'eraser'
              ? 'bg-white dark:bg-slate-700 text-[#EF4444] dark:text-[#F87171] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <Eraser className="w-3.5 h-3.5 text-[#EF4444]" />
          <span>{isAr ? 'الممحاة' : 'Eraser'}</span>
          {state.activeTool === 'eraser' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
          )}
        </button>

        {/* Remove Object Tab Button */}
        <button
          onClick={() => {
            setActiveTab('remove_object');
            onUpdateState((prev) => ({ ...prev, activeTool: 'remove_object' }));
          }}
          title={isAr ? 'أداة إزالة الكائن — إزالة عناصر وأشخاص مع إعادة بناء الخلفية' : 'Remove Object with smart background inpainting'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'remove_object'
              ? 'bg-white dark:bg-slate-700 text-[#6338E8] dark:text-[#20BFC4] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 text-[#6338E8] dark:text-[#20BFC4]" />
          <span>{isAr ? 'إزالة كائن' : 'Remove Object'}</span>
          {state.activeTool === 'remove_object' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6338E8]" />
          )}
        </button>

        {/* Pen Tab Button */}
        <button
          onClick={() => {
            setActiveTab('pen');
            onUpdateState((prev) => ({ ...prev, activeTool: 'pen' }));
          }}
          title={isAr ? 'أداة القلم والمتجهات ومقابض بيزييه' : 'Pen tool & vector path curves'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'pen'
              ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <PenTool className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
          <span>{isAr ? 'القلم' : 'Pen'}</span>
          {state.activeTool === 'pen' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DFF]" />
          )}
        </button>

        {/* Transform Tab Button */}
        <button
          onClick={() => {
            setActiveTab('transform');
            onUpdateState((prev) => ({ ...prev, activeTool: 'transform' }));
          }}
          title={isAr ? 'التحويل المتقدم — موضع وحجم وتدوير وانحراف لجميع العناصر' : 'Advanced Transform — Position, size, rotation & skew'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'transform'
              ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
          <span>{isAr ? 'التحويل' : 'Transform'}</span>
          {state.activeTool === 'transform' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DFF]" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('filters')}
          title={isAr ? 'مكتبة الفلاتر الجاهزة' : 'Filters library presets'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'filters'
              ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isAr ? 'الفلاتر' : 'Filters'}</span>
        </button>

        <button
          onClick={() => setActiveTab('adjust')}
          title={isAr ? 'التحسينات اليدوية والسطوع والتباين والألوان' : 'Manual adjustments: brightness, contrast & colors'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'adjust'
              ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{isAr ? 'التحسينات' : 'Adjustments'}</span>
        </button>

        <button
          onClick={() => setActiveTab('bg_remove')}
          title={isAr ? 'عزل الخلفية التلقائي والشفافية' : 'Background removal & cutout'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'bg_remove'
              ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <Scissors className="w-3.5 h-3.5" />
          <span>{isAr ? 'العزل' : 'Cutout'}</span>
        </button>

        <button
          onClick={() => setActiveTab('background')}
          title={isAr ? 'مكتبة الخلفيات والألوان والتدرجات' : 'Background colors, gradients & textures'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'background'
              ? 'bg-white dark:bg-slate-700 text-[#6C4DFF] dark:text-[#2DD4BF] shadow-xs border border-slate-200/60 dark:border-transparent'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/40 dark:hover:bg-slate-700/40'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>{isAr ? 'الخلفية' : 'BG'}</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TEXT INSPECTOR TAB */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            {selectedTextLayer ? (
              <TextInspector
                layer={selectedTextLayer}
                onUpdateLayer={(updater) => {
                  onUpdateState((prev) => ({
                    ...prev,
                    layers: prev.layers.map((l) =>
                      l.id === selectedTextLayer.id ? updater(l) : l
                    ),
                  }));
                }}
                onDeleteLayer={() => {
                  onUpdateState((prev) => ({
                    ...prev,
                    layers: prev.layers.filter((l) => l.id !== selectedTextLayer.id),
                    selectedLayerId: prev.selectedLayerId === selectedTextLayer.id ? null : prev.selectedLayerId,
                  }));
                }}
                onDuplicateLayer={() => {
                  const dup: Layer = {
                    ...selectedTextLayer,
                    id: 'layer_text_' + Date.now(),
                    name: `${selectedTextLayer.name} (${isAr ? 'نسخة' : 'Copy'})`,
                    x: selectedTextLayer.x + 20,
                    y: selectedTextLayer.y + 20,
                    zIndex: state.layers.length + 1,
                  };
                  onUpdateState((prev) => ({
                    ...prev,
                    layers: [...prev.layers, dup],
                    selectedLayerId: dup.id,
                  }));
                }}
                language={language}
                darkMode={darkMode}
                isEyedropperActive={isEyedropperActive}
                onToggleEyedropper={onToggleEyedropper}
                eyedropperTarget={eyedropperTarget}
                recentColors={recentColors}
              />
            ) : (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-4 space-y-3">
                <Type className="w-10 h-10 mx-auto text-[#6C4DFF] mb-2 opacity-80" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {isAr ? 'لا توجد طبقة نص محددة' : 'No Text Layer Selected'}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isAr
                    ? 'أضف طبقة نص جديدة للتحكم في نوع الخط، الحجم، الألوان، التدرجات، والظلال بدقة.'
                    : 'Add a new text layer to customize fonts, sizes, gradients, shadows, and strokes.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
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
                        fontSize: 38,
                        fontFamily: 'Tajawal',
                        color: '#172033',
                        opacity: 1,
                        align: 'center',
                        bold: true,
                        italic: false,
                        underline: false,
                        direction: isAr ? 'rtl' : 'ltr',
                      },
                    };
                    onUpdateState((prev) => ({
                      ...prev,
                      layers: [...prev.layers, newLayer],
                      selectedLayerId: newLayer.id,
                    }));
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#6C4DFF] hover:bg-[#5839EE] text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isAr ? 'إضافة نص جديد الآن' : 'Add New Text Layer'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* BRUSH INSPECTOR TAB */}
        {activeTab === 'brush' && (
          <BrushInspector
            brushConfig={brushConfig}
            setBrushConfig={setBrushConfig}
            onUndo={onUndo}
            onClearDrawingLayer={() => {
              onUpdateState((prev) => ({
                ...prev,
                layers: prev.layers.map((l) =>
                  l.type === 'drawing' ? { ...l, drawingPaths: [] } : l
                ),
              }));
            }}
            language={language}
            darkMode={darkMode}
          />
        )}

        {/* ERASER INSPECTOR TAB */}
        {activeTab === 'eraser' && (
          <EraserInspector
            brushConfig={brushConfig}
            setBrushConfig={setBrushConfig}
            selectedLayer={selectedLayer}
            layers={state.layers}
            onSelectLayer={(id) => onUpdateState((prev) => ({ ...prev, selectedLayerId: id }))}
            onResetEffectMask={(layerId) => {
              onUpdateState((prev) => ({
                ...prev,
                layers: prev.layers.map((l) =>
                  l.id === layerId ? { ...l, effectMask: undefined } : l
                ),
              }));
            }}
            onClearDrawingLayer={() => {
              onUpdateState((prev) => ({
                ...prev,
                layers: prev.layers.map((l) =>
                  l.type === 'drawing' ? { ...l, drawingPaths: [] } : l
                ),
              }));
            }}
            language={language}
            darkMode={darkMode}
          />
        )}

        {/* REMOVE OBJECT INSPECTOR TAB */}
        {activeTab === 'remove_object' && removeObjectProps && (
          <RemoveObjectInspector
            brushSize={removeObjectProps.brushSize}
            setBrushSize={removeObjectProps.setBrushSize}
            hardness={removeObjectProps.hardness}
            setHardness={removeObjectProps.setHardness}
            mode={removeObjectProps.mode}
            setMode={removeObjectProps.setMode}
            isPreviewing={removeObjectProps.isPreviewing}
            onTogglePreview={removeObjectProps.onTogglePreview}
            onApply={removeObjectProps.onApply}
            onCancel={removeObjectProps.onCancel}
            onClearMask={removeObjectProps.onClearMask}
            hasMask={removeObjectProps.hasMask}
            isProcessing={removeObjectProps.isProcessing}
            selectedLayer={selectedLayer}
            layers={state.layers}
            onSelectLayer={(id) => onUpdateState((prev) => ({ ...prev, selectedLayerId: id }))}
            language={language}
            darkMode={darkMode}
          />
        )}

        {/* PEN / VECTOR PATH INSPECTOR TAB */}
        {activeTab === 'pen' && (
          <PenInspector
            activePathLayer={
              penProps?.activePathLayer ||
              state.layers.find((l) => l.id === state.selectedLayerId && l.type === 'path') ||
              state.layers.find((l) => l.type === 'path') ||
              null
            }
            onUpdatePathConfig={
              penProps?.onUpdatePathConfig ||
              ((cfg) => {
                onUpdateState((prev) => ({
                  ...prev,
                  layers: prev.layers.map((l) =>
                    l.id === prev.selectedLayerId && l.type === 'path' ? { ...l, pathConfig: cfg } : l
                  ),
                }));
              })
            }
            onConvertToSelection={penProps?.onConvertToSelection || (() => {})}
            onConvertToMask={penProps?.onConvertToMask || onConvertToMask}
            onNewPath={penProps?.onNewPath || (() => {})}
            onDeleteLayer={(layerId) => {
              onUpdateState((prev) => ({
                ...prev,
                layers: prev.layers.filter((l) => l.id !== layerId),
                selectedLayerId: prev.layers.find((l) => l.id !== layerId)?.id || null,
              }));
            }}
            selectedPointId={penProps?.selectedPointId || null}
            setSelectedPointId={penProps?.setSelectedPointId || (() => {})}
            language={language}
            darkMode={darkMode}
            isEyedropperActive={isEyedropperActive}
            onToggleEyedropper={onToggleEyedropper}
            eyedropperTarget={eyedropperTarget}
            recentColors={recentColors}
            canvasWidth={state.canvasWidth}
            canvasHeight={state.canvasHeight}
          />
        )}
        {/* 1. LAYERS TAB */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isAr ? 'قائمة طبقات التصميم' : 'Design Layers Stack'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {state.layers.length} {isAr ? 'طبقة' : 'layers'}
              </span>
            </div>

            {/* Layer Actions & Merge Toolbar */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {onImageUpload && (
                <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#6C4DFF] hover:bg-[#5835FF] text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إضافة صورة' : '+ Add Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        onImageUpload(e.target.files);
                        e.target.value = '';
                      }
                    }}
                  />
                </label>
              )}

              {onMergeDown && (
                <button
                  type="button"
                  disabled={!selectedLayer || safeLayers.findIndex((l) => l.id === selectedLayer.id) === 0}
                  onClick={onMergeDown}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
                  title={isAr ? 'دمج الطبقة المحددة مع الطبقة التي تحتها (Ctrl+E)' : 'Merge selected layer down (Ctrl+E)'}
                >
                  <Combine className="w-3.5 h-3.5 text-[#6C4DFF]" />
                  <span>{isAr ? 'دمج لأسفل' : 'Merge Down'}</span>
                </button>
              )}

              {onMergeVisible && (
                <button
                  type="button"
                  disabled={state.layers.filter((l) => l.visible).length < 2}
                  onClick={onMergeVisible}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
                  title={isAr ? 'دمج جميع الطبقات المرئية في طبقة واحدة (Ctrl+Shift+E)' : 'Merge all visible layers (Ctrl+Shift+E)'}
                >
                  <Layers className="w-3.5 h-3.5 text-[#23B5D3]" />
                  <span>{isAr ? 'دمج المرئي' : 'Merge Visible'}</span>
                </button>
              )}

              {onFlattenImage && (
                <button
                  type="button"
                  disabled={state.layers.length === 0}
                  onClick={onFlattenImage}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs transition-colors"
                  title={isAr ? 'تسطيح جميع الطبقات مع الخلفية في طبقة صورة واحدة' : 'Flatten all layers with background into a single image'}
                >
                  <Maximize2 className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  <span>{isAr ? 'تسطيح الكل' : 'Flatten'}</span>
                </button>
              )}
            </div>

            {state.layers.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Layers className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isAr ? 'لا توجد طبقات بعد. ارفع صورة للبدء.' : 'No layers yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...state.layers].reverse().map((layer) => {
                  const isSelected = layer.id === state.selectedLayerId;

                  return (
                    <div
                      key={layer.id}
                      onClick={() =>
                        onUpdateState((prev) => ({ ...prev, selectedLayerId: layer.id }))
                      }
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#6C4DFF] bg-purple-50/70 dark:bg-[#6C4DFF]/15 text-slate-900 dark:text-white shadow-2xs'
                          : 'border-slate-200/80 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-100 hover:border-slate-300 dark:hover:bg-slate-800'
                      }`}
                    >
                      {/* Layer Info & Thumbnail */}
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className={`w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-slate-200/60 dark:border-transparent ${
                          layer.type === 'effect'
                            ? 'bg-amber-100 dark:bg-amber-950/60'
                            : 'bg-purple-100 dark:bg-slate-800'
                        }`}>
                          {layer.type === 'image' && layer.source ? (
                            <img src={layer.source} alt="" className="w-full h-full object-cover" />
                          ) : layer.type === 'text' ? (
                            <Type className="w-4 h-4 text-[#6C4DFF]" />
                          ) : layer.type === 'shape' ? (
                            <Square className="w-4 h-4 text-[#23B5D3]" />
                          ) : layer.type === 'effect' ? (
                            renderEffectIcon(layer.effectType)
                          ) : (
                            <Paintbrush className="w-4 h-4 text-[#2DD4BF]" />
                          )}
                        </div>

                        <div className="overflow-hidden min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold truncate">{layer.name}</p>
                            {layer.type === 'effect' && (
                              <span className="px-1 py-0.5 rounded text-[8px] font-black uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shrink-0">
                                FX
                              </span>
                            )}
                            {layer.type === 'effect' && layer.effectMask && (
                              <span className="px-1 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 shrink-0">
                                MASK
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {layer.type === 'effect'
                              ? isAr ? 'طبقة تأثير كاملة' : 'Full Canvas Effect'
                              : `${layer.width} × ${layer.height} px`}
                          </p>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        {/* Duplicate */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateLayer(layer.id);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-200/60"
                          title={isAr ? 'مضاعفة الطبقة' : 'Duplicate layer'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        {/* Lock / Unlock */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleLock(layer.id);
                          }}
                          className={`p-1 rounded-md hover:bg-slate-200/60 ${
                            layer.locked
                              ? 'text-amber-500 hover:text-amber-600'
                              : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                          }`}
                          title={layer.locked ? (isAr ? 'إلغاء قفل الطبقة' : 'Unlock layer') : (isAr ? 'قفل الطبقة' : 'Lock layer')}
                        >
                          {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={safeLayers.findIndex((l) => l.id === layer.id) === safeLayers.length - 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLayer(layer.id, 'up');
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isAr ? 'تحريك لأعلى المكدس' : 'Move up'}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={safeLayers.findIndex((l) => l.id === layer.id) === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveLayer(layer.id, 'down');
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-md hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={isAr ? 'تحريك لأسفل المكدس' : 'Move down'}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateState((prev) => ({
                              ...prev,
                              layers: prev.layers.map((l) =>
                                l.id === layer.id ? { ...l, visible: !l.visible } : l
                              ),
                            }));
                          }}
                          className={`p-1 rounded-md ${
                            layer.visible
                              ? 'text-slate-500 hover:text-slate-800'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                          title={layer.visible ? (isAr ? 'إخفاء' : 'Hide') : (isAr ? 'إظهار' : 'Show')}
                        >
                          {layer.visible ? (
                            <Eye className="w-3.5 h-3.5" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {/* Delete Layer */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateState((prev) => ({
                              ...prev,
                              layers: prev.layers.filter((l) => l.id !== layer.id),
                              selectedLayerId:
                                prev.selectedLayerId === layer.id ? null : prev.selectedLayerId,
                            }));
                          }}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md"
                          title={isAr ? 'حذف' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Effect Layer Dedicated Controls */}
            {selectedLayer && selectedLayer.type === 'effect' && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="p-3 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-100 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? 'خصائص طبقة التأثير' : 'Effect Layer Controls'}</span>
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 font-bold">
                      {selectedLayer.effectType?.toUpperCase()}
                    </span>
                  </div>

                  {/* Mask Status */}
                  <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="text-slate-600 dark:text-slate-400">
                      {isAr ? 'حالة القناع الذكي:' : 'Smart Mask Status:'}
                    </span>
                    {selectedLayer.effectMask ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        <span>{isAr ? 'ممسوح جزئياً' : 'Masked (Selective)'}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-medium">
                        {isAr ? 'يطبق على كامل الصورة' : 'Full Canvas (No Mask)'}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateState((prev) => ({ ...prev, activeTool: 'eraser' }));
                        setBrushConfig((b) => ({ ...b, tool: 'eraser' }));
                        setActiveTab('eraser');
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Eraser className="w-3.5 h-3.5" />
                      <span>{isAr ? 'مسح التأثير' : 'Erase Effect'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab(selectedLayer.effectType === 'filter' ? 'filters' : 'adjust');
                      }}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#6C4DFF] hover:bg-[#5835FF] text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>{isAr ? 'ضبط القيم' : 'Edit Values'}</span>
                    </button>
                  </div>

                  {selectedLayer.effectMask && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateState((prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) =>
                            l.id === selectedLayer.id ? { ...l, effectMask: undefined } : l
                          ),
                        }));
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700/60 text-xs font-semibold transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{isAr ? 'استعادة كامل التأثير (حذف القناع)' : 'Restore Full Effect (Remove Mask)'}</span>
                    </button>
                  )}
                </div>

                {/* Effect Opacity Slider */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-bold">
                      <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                      <span>{isAr ? 'شدة / شفافية التأثير' : 'Effect Layer Opacity'}</span>
                    </span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      {selectedLayer.opacity !== undefined ? selectedLayer.opacity : 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={selectedLayer.opacity !== undefined ? selectedLayer.opacity : 100}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === selectedLayer.id ? { ...l, opacity: val } : l
                        ),
                      }));
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
            )}

            {/* Layer Transformations Section */}
            {selectedLayer && selectedLayer.type !== 'effect' && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <RotateCw className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                    <span>{isAr ? 'دوران وقلب الطبقة المحددة' : 'Layer Transform & Flip'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {selectedLayer.rotation || 0}°
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  <button
                    type="button"
                    disabled={selectedLayer.locked}
                    onClick={() =>
                      onUpdateState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === selectedLayer.id ? { ...l, rotation: ((l.rotation || 0) + 90) % 360 } : l
                        ),
                      }))
                    }
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-750 dark:text-slate-200 text-[10px] font-bold flex flex-col items-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                    title={isAr ? 'تدوير 90° يمين' : 'Rotate +90°'}
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#6C4DFF]" />
                    <span>+90°</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedLayer.locked}
                    onClick={() =>
                      onUpdateState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === selectedLayer.id ? { ...l, rotation: ((l.rotation || 0) - 90 + 360) % 360 } : l
                        ),
                      }))
                    }
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-750 dark:text-slate-200 text-[10px] font-bold flex flex-col items-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                    title={isAr ? 'تدوير 90° يسار' : 'Rotate -90°'}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#6C4DFF]" />
                    <span>-90°</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedLayer.locked}
                    onClick={() =>
                      onUpdateState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === selectedLayer.id ? { ...l, rotation: ((l.rotation || 0) + 180) % 360 } : l
                        ),
                      }))
                    }
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-750 dark:text-slate-200 text-[10px] font-bold flex flex-col items-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
                    title={isAr ? 'تدوير 180°' : 'Rotate 180°'}
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>180°</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedLayer.locked}
                    onClick={() =>
                      onUpdateState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === selectedLayer.id ? { ...l, flipHorizontal: !l.flipHorizontal } : l
                        ),
                      }))
                    }
                    className={`p-1.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedLayer.flipHorizontal
                        ? 'border-[#23B5D3] bg-[#23B5D3]/15 text-[#23B5D3]'
                        : 'border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-750 dark:text-slate-200'
                    }`}
                    title={isAr ? 'قلب أفقي' : 'Flip Horizontal'}
                  >
                    <FlipHorizontal className="w-3.5 h-3.5 text-[#23B5D3]" />
                    <span>{isAr ? 'أفقي' : 'Flip H'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={selectedLayer.locked}
                    onClick={() =>
                      onUpdateState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === selectedLayer.id ? { ...l, flipVertical: !l.flipVertical } : l
                        ),
                      }))
                    }
                    className={`p-1.5 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed ${
                      selectedLayer.flipVertical
                        ? 'border-[#2DD4BF] bg-[#2DD4BF]/15 text-[#2DD4BF]'
                        : 'border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-850 hover:bg-slate-100 text-slate-750 dark:text-slate-200'
                    }`}
                    title={isAr ? 'قلب رأسي' : 'Flip Vertical'}
                  >
                    <FlipVertical className="w-3.5 h-3.5 text-[#2DD4BF]" />
                    <span>{isAr ? 'رأسي' : 'Flip V'}</span>
                  </button>
                </div>

                {/* Free Rotation Angle Slider */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span>{isAr ? 'زاوية الدوران الحرة' : 'Free Rotation Angle'}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {selectedLayer.rotation || 0}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="359"
                    step="1"
                    disabled={selectedLayer.locked}
                    value={selectedLayer.rotation || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === selectedLayer.id ? { ...l, rotation: val } : l
                        ),
                      }));
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Layer Opacity Slider */}
                <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-bold">
                      <SunMedium className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                      <span>{isAr ? 'شفافية الطبقة' : 'Layer Opacity'}</span>
                    </span>
                    <span className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
                      {selectedLayer.opacity !== undefined ? selectedLayer.opacity : 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    disabled={selectedLayer.locked}
                    value={selectedLayer.opacity !== undefined ? selectedLayer.opacity : 100}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      onUpdateState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === selectedLayer.id ? { ...l, opacity: val } : l
                        ),
                      }));
                    }}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF] dark:accent-[#2DD4BF] disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            )}

            {/* Shape Properties if Shape Layer is selected */}
            {selectedLayer && selectedLayer.type === 'shape' && selectedLayer.shapeConfig && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? 'خصائص وتخصيص الشكل' : 'Shape Customization'}
                  </span>
                  {onOpenShapeModal && (
                    <button
                      type="button"
                      onClick={onOpenShapeModal}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-[#6C4DFF]/10 hover:bg-[#6C4DFF]/20 text-[#6C4DFF] dark:text-[#2DD4BF] font-bold flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{isAr ? 'تصفح كل الأشكال (35+)' : 'Browse Shapes (35+)'}</span>
                    </button>
                  )}
                </div>

                {/* Quick Shape Type Selector */}
                <div className="grid grid-cols-3 gap-1.5">
                  {shapeTypes.map((st) => {
                    const Icon = st.icon;
                    const isSelected = selectedLayer.shapeConfig?.shapeType === st.id;
                    return (
                      <button
                        key={st.id}
                        onClick={() =>
                          onUpdateState((prev) => ({
                            ...prev,
                            layers: prev.layers.map((l) =>
                              l.id === selectedLayer.id
                                ? {
                                    ...l,
                                    shapeConfig: {
                                      ...l.shapeConfig!,
                                      shapeType: st.id,
                                    },
                                  }
                                : l
                            ),
                          }))
                        }
                        className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'border-[#6C4DFF] bg-[#6C4DFF]/10 text-[#6C4DFF] dark:text-[#2DD4BF]'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{isAr ? st.nameAr : st.nameEn}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Fill Color & Gradient with UnifiedColorPicker */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                      {isAr ? 'لون وتدرج التعبئة الداخلي' : 'Fill Color & Gradient'}
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateState((prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) =>
                            l.id === selectedLayer.id
                              ? {
                                  ...l,
                                  shapeConfig: {
                                    ...l.shapeConfig!,
                                    fillColor:
                                      l.shapeConfig!.fillColor === 'transparent'
                                        ? '#6C4DFF'
                                        : 'transparent',
                                    gradient: {
                                      ...l.shapeConfig!.gradient,
                                      enabled: false,
                                      from: '',
                                      to: '',
                                      angle: 0,
                                    },
                                  },
                                }
                              : l
                          ),
                        }))
                      }
                      className={`px-2 py-0.5 text-[11px] rounded-lg border transition-all ${
                        selectedLayer.shapeConfig.fillColor === 'transparent'
                          ? 'border-[#6C4DFF] bg-[#6C4DFF]/15 text-[#6C4DFF] font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {selectedLayer.shapeConfig.fillColor === 'transparent'
                        ? (isAr ? '✓ مفرغ (إطار فقط)' : '✓ Outline Only')
                        : (isAr ? 'تفريغ التعبئة' : 'Transparent Fill')}
                    </button>
                  </div>

                  {selectedLayer.shapeConfig.fillColor !== 'transparent' && (
                    <UnifiedColorPicker
                      color={selectedLayer.shapeConfig.fillColor || '#6C4DFF'}
                      onChangeColor={(newColor) =>
                        onUpdateState((prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) =>
                            l.id === selectedLayer.id
                              ? {
                                  ...l,
                                  shapeConfig: {
                                    ...l.shapeConfig!,
                                    fillColor: newColor,
                                    gradient: {
                                      ...l.shapeConfig!.gradient,
                                      enabled: false,
                                      from: '',
                                      to: '',
                                      angle: 0,
                                    },
                                  },
                                }
                              : l
                          ),
                        }))
                      }
                      supportGradient={true}
                      gradient={selectedLayer.shapeConfig.gradient}
                      onChangeGradient={(newGrad) =>
                        onUpdateState((prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) =>
                            l.id === selectedLayer.id
                              ? {
                                  ...l,
                                  shapeConfig: {
                                    ...l.shapeConfig!,
                                    gradient: newGrad,
                                  },
                                }
                              : l
                          ),
                        }))
                      }
                      language={language}
                    />
                  )}
                </div>

                {/* Stroke Color & Width */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span>{isAr ? 'سمك ولون الحدود' : 'Stroke Width & Color'}</span>
                    <span className="font-mono">{selectedLayer.shapeConfig.strokeWidth}px</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={selectedLayer.shapeConfig.strokeColor || '#4B32C3'}
                      onChange={(e) =>
                        onUpdateState((prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) =>
                            l.id === selectedLayer.id
                              ? {
                                  ...l,
                                  shapeConfig: { ...l.shapeConfig!, strokeColor: e.target.value },
                                }
                              : l
                          ),
                        }))
                      }
                      className="w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer p-0 shrink-0"
                    />
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={selectedLayer.shapeConfig.strokeWidth}
                      onChange={(e) =>
                        onUpdateState((prev) => ({
                          ...prev,
                          layers: prev.layers.map((l) =>
                            l.id === selectedLayer.id
                              ? {
                                  ...l,
                                  shapeConfig: {
                                    ...l.shapeConfig!,
                                    strokeWidth: Number(e.target.value),
                                  },
                                }
                              : l
                          ),
                        }))
                      }
                      className="flex-1 accent-[#6C4DFF]"
                    />
                  </div>
                </div>

                {/* Border Radius (if applicable) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span>{isAr ? 'استدارة الحواف (Border Radius)' : 'Corner Radius'}</span>
                    <span className="font-mono">{selectedLayer.shapeConfig.borderRadius || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={selectedLayer.shapeConfig.borderRadius || 0}
                    onChange={(e) =>
                      onUpdateState((prev) => ({
                        ...prev,
                        layers: prev.layers.map((l) =>
                          l.id === selectedLayer.id
                            ? {
                                ...l,
                                shapeConfig: {
                                  ...l.shapeConfig!,
                                  borderRadius: Number(e.target.value),
                                },
                              }
                            : l
                        ),
                      }))
                    }
                    className="w-full accent-[#6C4DFF]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. FILTERS TAB */}
        {activeTab === 'filters' && (
          <FilterLibraryPanel
            selectedLayer={selectedLayer}
            layers={state.layers}
            onUpdateFilters={updateLayerFiltersFn}
            onApplyEffect={handleApplyOrUpdateEffect}
            onDiscardEffect={handleDiscardEffect}
            onActivateEraser={() => {
              onUpdateState((prev) => ({ ...prev, activeTool: 'eraser' }));
              setBrushConfig((b) => ({ ...b, tool: 'eraser' }));
              setActiveTab('eraser');
            }}
            onResetEffectMask={() => {
              if (selectedLayer) {
                onUpdateState((prev) => ({
                  ...prev,
                  layers: prev.layers.map((l) =>
                    l.id === selectedLayer.id ? { ...l, effectMask: undefined } : l
                  ),
                }));
              }
            }}
            language={language}
          />
        )}

        {/* 3. ADJUSTMENTS TAB */}
        {activeTab === 'adjust' && (
          <ManualAdjustmentsPanel
            selectedLayer={selectedLayer}
            layers={state.layers}
            onUpdateFilters={updateLayerFiltersFn}
            onApplyEffect={handleApplyOrUpdateEffect}
            onDiscardEffect={handleDiscardEffect}
            onActivateEraser={() => {
              onUpdateState((prev) => ({ ...prev, activeTool: 'eraser' }));
              setBrushConfig((b) => ({ ...b, tool: 'eraser' }));
              setActiveTab('eraser');
            }}
            onResetEffectMask={() => {
              if (selectedLayer) {
                onUpdateState((prev) => ({
                  ...prev,
                  layers: prev.layers.map((l) =>
                    l.id === selectedLayer.id ? { ...l, effectMask: undefined } : l
                  ),
                }));
              }
            }}
            language={language}
          />
        )}

        {/* 4. BACKGROUND REMOVAL TAB */}
        {activeTab === 'bg_remove' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                {isAr ? 'عزل وإزالة خلفية الصورة' : 'Background Removal'}
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isAr
                  ? 'عزل دقيق للمنتجات بواسطة الممحاة اليدوية التفاعلية أو العزل التلقائي.'
                  : 'Manual mask eraser & AI cutout for clean product isolation.'}
              </p>
            </div>

            {/* Auto Cutout with transparent status tag */}
            <div className="space-y-1.5">
              <button
                onClick={onAutoRemoveBg}
                disabled={isRemovingBg || !selectedLayer}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C4DFF] to-[#23B5D3] hover:opacity-95 shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 transition-all active:scale-95"
              >
                {isRemovingBg ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isAr ? 'جاري عزل الخلفية...' : 'Processing Cutout...'}</span>
                  </>
                ) : (
                  <>
                    <Scissors className="w-4 h-4" />
                    <span>{isAr ? 'إزالة الخلفية التلقائية' : 'Auto Cutout'}</span>
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>
                  {isAr
                    ? 'عزل ذكي حقيقي (AI Segmentation) — شفافية Alpha فائقة الدقة'
                    : 'Real AI Segmentation — Ultra-precise transparent Alpha cutout'}
                </span>
              </div>
              {selectedLayer && selectedLayer.type !== 'image' && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 text-center">
                  {isAr
                    ? 'يرجى تحديد طبقة صورة لتفعيل العزل بالذكاء الاصطناعي'
                    : 'Please select an image layer to enable AI cutout'}
                </p>
              )}
            </div>

            {/* Cutout Refine: Professional Restore & Erase Brush Studio */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-700 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
                  {isAr ? 'تنقيح العزل واسترجاع العناصر' : 'Cutout Brush & Restoration'}
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {isAr
                    ? 'استخدم فرشاة الاسترجاع لإعادة الأجزاء الممسوحة بالخطأ من الصورة الأصلية، أو الممحاة لإزالة ما تبقى من الخلفية.'
                    : 'Use Restore Brush to bring back accidentally removed areas from the original image, or Erase to clean edges.'}
                </p>
              </div>

              {/* Mode Toggle: Restore Brush vs Erase Brush */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    cutoutProps?.setMode('restore');
                    onUpdateState((prev) => ({ ...prev, activeTool: 'bg_remove' }));
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    (cutoutProps?.mode ?? 'restore') === 'restore' && state.activeTool === 'bg_remove'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فرشاة الاسترجاع' : 'Restore Brush'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    cutoutProps?.setMode('erase');
                    onUpdateState((prev) => ({ ...prev, activeTool: 'bg_remove' }));
                  }}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    cutoutProps?.mode === 'erase' && state.activeTool === 'bg_remove'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فرشاة المسح' : 'Erase Brush'}</span>
                </button>
              </div>

              {/* Status Hint */}
              <div
                className={`p-2.5 rounded-xl border text-[11px] leading-relaxed flex items-start gap-2 ${
                  (cutoutProps?.mode ?? 'restore') === 'restore'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-800/40 dark:text-emerald-300'
                    : 'bg-rose-50/70 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-800/40 dark:text-rose-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {(cutoutProps?.mode ?? 'restore') === 'restore' ? (
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Eraser className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  )}
                </div>
                <div>
                  <span className="font-bold block">
                    {(cutoutProps?.mode ?? 'restore') === 'restore'
                      ? isAr
                        ? 'فرشاة الاسترجاع نشطة'
                        : 'Restore Brush Active'
                      : isAr
                      ? 'فرشاة المسح نشطة'
                      : 'Erase Brush Active'}
                  </span>
                  <span>
                    {(cutoutProps?.mode ?? 'restore') === 'restore'
                      ? isAr
                        ? 'مرر الفرشاة على لوحة الرسم لاستعادة بكسلات الصورة الأصلية بدقة تامة دون إنشاء أي ذكاء اصطناعي.'
                        : 'Paint directly on the canvas to restore original pixels from the unmodified source image.'
                      : isAr
                      ? 'مرر الفرشاة على اللوحة لمسح البكسلات وجعلها شفافة بالكامل.'
                      : 'Paint on the canvas to erase background pixels and make them fully transparent.'}
                  </span>
                </div>
              </div>

              {/* Brush Parameters: Size, Hardness, Opacity */}
              <div className="space-y-3 pt-1">
                {/* Size */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {isAr ? 'حجم الفرشاة' : 'Brush Size'}
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                      {brushConfig.size}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="250"
                    value={brushConfig.size}
                    onChange={(e) =>
                      setBrushConfig((prev) => ({ ...prev, size: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF]"
                  />
                </div>

                {/* Hardness */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {isAr ? 'صلابة الحواف' : 'Hardness'}
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                      {Math.round(brushConfig.hardness * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={brushConfig.hardness}
                    onChange={(e) =>
                      setBrushConfig((prev) => ({ ...prev, hardness: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF]"
                  />
                </div>

                {/* Opacity */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      {isAr ? 'شفافية الفرشاة' : 'Opacity'}
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                      {Math.round(brushConfig.opacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={brushConfig.opacity}
                    onChange={(e) =>
                      setBrushConfig((prev) => ({ ...prev, opacity: Number(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#6C4DFF]"
                  />
                </div>
              </div>

              {/* Reset to Original Image (Non-destructive safety) */}
              {selectedLayer?.type === 'image' && selectedLayer.originalSource && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedLayer || selectedLayer.type !== 'image' || !selectedLayer.originalSource) return;
                      const orig = selectedLayer.originalSource;
                      onUpdateState((prev) => ({
                        ...prev,
                        layers: (prev.layers || []).map((l) =>
                          l.id === selectedLayer.id ? { ...l, source: orig } : l
                        ),
                      }));
                    }}
                    className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                    <span>{isAr ? 'استرجاع الصورة الأصلية بالكامل' : 'Revert to Original Image'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. BACKGROUND TAB */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              {isAr ? 'نوع خلفية لوحة العمل' : 'Canvas Background'}
            </span>

            {/* Background Types buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'transparent', label: isAr ? 'شفافة' : 'Transparent' },
                { id: 'solid', label: isAr ? 'لون موحد' : 'Solid Color' },
                { id: 'gradient', label: isAr ? 'تدرج' : 'Gradient' },
              ].map((bg) => (
                <button
                  key={bg.id}
                  onClick={() =>
                    onUpdateState((prev) => ({
                      ...prev,
                      background: {
                        ...prev.background,
                        type: bg.id as any,
                        color: prev.background.color || '#ffffff',
                        gradient: prev.background.gradient || {
                          from: '#6C4DFF',
                          to: '#23B5D3',
                          angle: 135,
                        },
                      },
                    }))
                  }
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    state.background.type === bg.id
                      ? 'border-[#6C4DFF] bg-purple-50/80 text-[#6C4DFF] dark:bg-[#6C4DFF]/20 dark:text-[#2DD4BF] shadow-xs'
                      : 'border-slate-200/90 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {bg.label}
                </button>
              ))}
            </div>

            {/* Solid color picker */}
            {state.background.type === 'solid' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {isAr ? 'اختر لون الخلفية' : 'Select Background Color'}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={state.background.color || '#ffffff'}
                    onChange={(e) =>
                      onUpdateState((prev) => ({
                        ...prev,
                        background: { ...prev.background, color: e.target.value },
                      }))
                    }
                    className="w-10 h-10 rounded-xl border border-slate-300 dark:border-slate-600 cursor-pointer p-0"
                  />
                  <span className="font-mono text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                    {state.background.color || '#FFFFFF'}
                  </span>
                </div>
              </div>
            )}

            {/* Gradient pickers */}
            {state.background.type === 'gradient' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">
                      {isAr ? 'اللون الأول' : 'From'}
                    </label>
                    <input
                      type="color"
                      value={state.background.gradient?.from || '#6C4DFF'}
                      onChange={(e) =>
                        onUpdateState((prev) => ({
                          ...prev,
                          background: {
                            ...prev.background,
                            gradient: {
                              ...prev.background.gradient!,
                              from: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full h-8 rounded-lg border border-slate-300 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 mb-1 block">
                      {isAr ? 'اللون الثاني' : 'To'}
                    </label>
                    <input
                      type="color"
                      value={state.background.gradient?.to || '#23B5D3'}
                      onChange={(e) =>
                        onUpdateState((prev) => ({
                          ...prev,
                          background: {
                            ...prev.background,
                            gradient: {
                              ...prev.background.gradient!,
                              to: e.target.value,
                            },
                          },
                        }))
                      }
                      className="w-full h-8 rounded-lg border border-slate-300 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}


            {/* Preset Background Library */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                {isAr ? 'مكتبة استوديوهات وخلفيات المنتجات' : 'Product Background Templates'}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {BACKGROUND_TEMPLATES.slice(0, 9).map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      if (template.type === 'color') {
                        onUpdateState((prev) => ({
                          ...prev,
                          background: { type: 'solid', color: template.value },
                        }));
                      } else if (template.type === 'gradient') {
                        // Extract gradient colors or use preset
                        onUpdateState((prev) => ({
                          ...prev,
                          background: {
                            type: 'gradient',
                            gradient: { from: '#6C4DFF', to: '#23B5D3', angle: 135 },
                          },
                        }));
                      } else if (template.type === 'image') {
                        onUpdateState((prev) => ({
                          ...prev,
                          background: { type: 'library', imageUrl: template.value },
                        }));
                      }
                    }}
                    className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-square hover:border-[#6C4DFF] transition-all"
                  >
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-white font-bold text-center px-1">
                        {template.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 11. ADVANCED TRANSFORM TAB */}
        {activeTab === 'transform' && (
          <TransformInspector
            selectedLayer={selectedLayer || null}
            onUpdateTransform={(updates) => {
              if (!selectedLayer) return;
              onUpdateState((prev) => ({
                ...prev,
                layers: prev.layers.map((l) => (l.id === selectedLayer.id ? { ...l, ...updates } : l)),
              }));
            }}
            onApplyTransform={() => transformProps?.onApplyTransform()}
            onCancelTransform={() => transformProps?.onCancelTransform()}
            onResetTransform={() => transformProps?.onResetTransform()}
            language={language}
            darkMode={darkMode}
            canvasWidth={state.canvasWidth}
            canvasHeight={state.canvasHeight}
          />
        )}
      </div>
    </aside>
  );
};
