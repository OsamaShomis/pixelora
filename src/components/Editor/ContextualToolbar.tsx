import React, { useState } from 'react';
import {
  Crop as CropIcon,
  ImageIcon,
  Eraser,
  Paintbrush,
  Pipette,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronDown,
  PenTool,
  Plus,
  Trash2,
  Maximize2,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Wand2,
  Eye,
  EyeOff,
  Loader2,
  LassoSelect,
  Pencil,
  Share2,
} from 'lucide-react';
import { Layer, CropAspectRatio, BrushConfig, EditorTool, PathConfig, FreeformCropToolbarProps } from '../../types';

export interface RemoveObjectToolbarProps {
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
  selectedLayer: Layer | null;
}

export interface TransformToolbarProps {
  layer: Layer | null;
  onUpdateTransform: (updates: Partial<Layer>) => void;
  onApplyTransform: () => void;
  onCancelTransform: () => void;
  onResetTransform: () => void;
}

export interface PenToolbarProps {
  activePathLayer: Layer | null;
  onConvertToSelection: () => void;
  onToggleClosed: () => void;
  onUpdatePathConfig: (config: PathConfig) => void;
  onNewPath: () => void;
  selectedPointId: string | null;
  onDeleteSelectedPoint: () => void;
}

export interface CropToolbarProps {
  cropTargetMode: 'image' | 'canvas';
  setCropTargetMode: (mode: 'image' | 'canvas') => void;
  cropTargetLayerId: string | null;
  setCropTargetLayerId: (id: string) => void;
  cropAspectRatio: CropAspectRatio;
  setCropAspectRatio: (ratio: CropAspectRatio) => void;
  cropDimensions: { width: number; height: number };
  imageLayers: Layer[];
  onApplyCrop: () => void;
  onCancelCrop: () => void;
  onResetCrop: () => void;
}

export interface ContextualToolbarProps {
  activeTool: EditorTool;
  isEraserActive: boolean;
  brushConfig: BrushConfig;
  setBrushConfig: React.Dispatch<React.SetStateAction<BrushConfig>>;
  recentColors: string[];
  onSelectColor: (color: string) => void;
  isEyedropperActive: boolean;
  onToggleEyedropper: () => void;
  cropProps?: CropToolbarProps;
  freeformCropProps?: FreeformCropToolbarProps;
  penProps?: PenToolbarProps;
  transformProps?: TransformToolbarProps;
  removeObjectProps?: RemoveObjectToolbarProps;
  selectedLayer?: Layer | null;
  language: 'ar' | 'en';
  darkMode: boolean;
  className?: string;
  onPointerEnter?: (e: React.PointerEvent) => void;
  onPointerLeave?: (e: React.PointerEvent) => void;
}

export const ContextualToolbar: React.FC<ContextualToolbarProps> = ({
  activeTool,
  isEraserActive,
  brushConfig,
  setBrushConfig,
  recentColors,
  onSelectColor,
  isEyedropperActive,
  onToggleEyedropper,
  cropProps,
  freeformCropProps,
  penProps,
  transformProps,
  removeObjectProps,
  selectedLayer,
  language,
  className = '',
  onPointerEnter,
  onPointerLeave,
}) => {
  const isAr = language === 'ar';
  const [showAdvancedBrush, setShowAdvancedBrush] = useState(false);

  // If no contextual tool is active, don't render floating toolbar
  const isCrop = activeTool === 'crop';
  const isFreeformCrop = activeTool === 'freeform_crop';
  const isBrush = activeTool === 'draw' && !isEraserActive && brushConfig.tool !== 'eraser';
  const isPen = activeTool === 'pen';
  const isTransform = activeTool === 'transform';
  const isRemoveObject = activeTool === 'remove_object';

  if (!isCrop && !isFreeformCrop && !isEraserActive && !isBrush && !isEyedropperActive && !isPen && !isTransform && !isRemoveObject) {
    return null;
  }

  return (
    <div
      id="pixelora-contextual-toolbar"
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      onPointerEnter={(e) => onPointerEnter?.(e)}
      onPointerLeave={(e) => onPointerLeave?.(e)}
      className={`absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-2.5 h-11 sm:h-12 px-3 sm:px-3.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-xl shadow-slate-900/10 dark:shadow-2xl dark:shadow-black/60 z-40 text-xs text-slate-800 dark:text-slate-100 max-w-[96vw] overflow-x-auto scrollbar-none cursor-default select-none animate-in fade-in slide-in-from-top-2 duration-150 ${className}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* ========================================================================= */}
      {/* 1. EYEDROPPER ACTIVE SAMPLING MODE                                        */}
      {/* ========================================================================= */}
      {isEyedropperActive ? (
        <div className="flex items-center gap-2.5 shrink-0 py-1">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C4DFF] dark:text-[#2DD4BF] font-bold border border-[#6C4DFF]/20">
            <Pipette className="w-4 h-4 animate-bounce" />
            <span>{isAr ? 'نمط اقتطاف اللون' : 'Eyedropper Active'}</span>
          </div>

          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
            {isAr
              ? 'انقر على أي بكسل في لوحة العمل لتحديده كلون للفرشاة (أو اضغط Esc للإلغاء)'
              : 'Click any pixel on the canvas to set brush color (or press Esc to cancel)'}
          </span>

          <div
            className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 shadow-xs shrink-0"
            style={{ backgroundColor: brushConfig.color }}
            title={brushConfig.color}
          />

          <button
            onClick={onToggleEyedropper}
            className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      ) : isFreeformCrop && freeformCropProps ? (
        /* ======================================================================= */
        /* 2. FREEFORM CROP CONTEXTUAL TOOLBAR                                     */
        /* ======================================================================= */
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 py-0.5">
          {/* Tool Title Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold shrink-0 border border-emerald-200 dark:border-emerald-800/60">
            <LassoSelect className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isAr ? 'القص الحر' : 'Freeform Crop'}</span>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Mode Switcher: Freehand vs Polygon */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700/70 p-0.5 rounded-xl border border-slate-200/80 dark:border-slate-600/60 shrink-0">
            <button
              onClick={() => freeformCropProps.setMode('freehand')}
              title={isAr ? 'الرسم الحر بالماوس أو القلم' : 'Freehand continuous path drawing'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                freeformCropProps.mode === 'freehand'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Pencil className="w-3 h-3" />
              <span>{isAr ? 'حر' : 'Freehand'}</span>
            </button>

            <button
              onClick={() => freeformCropProps.setMode('polygon')}
              title={isAr ? 'رسم مضلع بالنقاط المستقيمة' : 'Polygon point-by-point drawing'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                freeformCropProps.mode === 'polygon'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Share2 className="w-3 h-3" />
              <span>{isAr ? 'مضلع' : 'Polygon'}</span>
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Point Counter / Status */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/70 border border-slate-200/80 dark:border-slate-600/50 text-[11px] font-medium text-slate-700 dark:text-slate-300 shrink-0"
            title={
              freeformCropProps.pointsCount > 0
                ? isAr
                  ? `تم تحديد ${freeformCropProps.pointsCount} نقطة مسار`
                  : `${freeformCropProps.pointsCount} boundary points recorded`
                : isAr
                ? 'انقر واسحب لرسم مسار القص'
                : 'Click and drag to draw crop path'
            }
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {freeformCropProps.pointsCount > 0
                ? isAr
                  ? `${freeformCropProps.pointsCount} نقطة`
                  : `${freeformCropProps.pointsCount} pts`
                : isAr
                ? 'ارسم المسار'
                : 'Draw boundary'}
            </span>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Actions: Clear / Reset, Cancel, Apply */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Reset / Redraw */}
            <button
              onClick={freeformCropProps.onReset}
              disabled={freeformCropProps.pointsCount === 0}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              title={isAr ? 'إعادة تعيين / مسح المسار' : 'Clear / Reset path'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Cancel */}
            <button
              onClick={freeformCropProps.onCancel}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isAr ? 'إلغاء القص الحر (Esc)' : 'Cancel freeform crop (Esc)'}
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'إلغاء' : 'Cancel'}</span>
            </button>

            {/* Apply */}
            <button
              onClick={freeformCropProps.onApply}
              disabled={!freeformCropProps.canApply}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-xl text-xs font-bold text-white transition-all shadow-xs ${
                freeformCropProps.canApply
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 active:scale-95 shadow-emerald-500/20 cursor-pointer'
                  : 'bg-slate-400 dark:bg-slate-600 opacity-50 cursor-not-allowed'
              }`}
              title={
                freeformCropProps.canApply
                  ? isAr
                    ? 'تأكيد وقص الصورة بالمسار الحر (Enter)'
                    : 'Apply Freeform Crop (Enter)'
                  : isAr
                  ? 'يرجى رسم مسار حول الجزء المطلوب أولاً'
                  : 'Please draw a boundary path first'
              }
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isAr ? 'تطبيق القص' : 'Apply Crop'}</span>
            </button>
          </div>
        </div>
      ) : isCrop && cropProps ? (
        /* ======================================================================= */
        /* 2. CROP CONTEXTUAL TOOLBAR                                              */
        /* ======================================================================= */
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 py-0.5">
          {/* Section 1: Crop Target */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700/70 p-0.5 rounded-xl border border-slate-200 dark:border-slate-600/60 shrink-0">
            {/* Crop Image */}
            <button
              onClick={() => {
                const targetImg =
                  cropProps.imageLayers.find((l) => l.id === cropProps.cropTargetLayerId) ||
                  cropProps.imageLayers[0];
                if (targetImg) {
                  cropProps.setCropTargetMode('image');
                  cropProps.setCropTargetLayerId(targetImg.id);
                }
              }}
              disabled={cropProps.imageLayers.length === 0}
              title={
                cropProps.imageLayers.length === 0
                  ? isAr
                    ? 'لا توجد طبقة صورة في المشروع'
                    : 'No image layer in project'
                  : isAr
                  ? 'قص طبقة الصورة المحددة فقط دون تغيير أبعاد لوحة العمل'
                  : 'Crop image layer only without changing canvas'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                cropProps.cropTargetMode === 'image'
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-600/50 disabled:opacity-40'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{isAr ? 'قص صورة' : 'Crop Image'}</span>
            </button>

            {/* Crop Canvas */}
            <button
              onClick={() => cropProps.setCropTargetMode('canvas')}
              title={
                isAr
                  ? 'قص وضبط أبعاد مساحة العمل بالكامل'
                  : 'Crop and resize entire workspace canvas'
              }
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                cropProps.cropTargetMode === 'canvas'
                  ? 'bg-[#2DD4BF] text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-600/50'
              }`}
            >
              <CropIcon className="w-3.5 h-3.5" />
              <span>{isAr ? 'قص لوحة العمل' : 'Crop Canvas'}</span>
            </button>
          </div>

          {/* Layer switcher if multiple image layers */}
          {cropProps.cropTargetMode === 'image' && cropProps.imageLayers.length > 1 && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/70 px-2 py-0.5 rounded-xl border border-slate-200 dark:border-slate-600/60 shrink-0">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={cropProps.cropTargetLayerId || ''}
                onChange={(e) => cropProps.setCropTargetLayerId(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-200 outline-hidden cursor-pointer"
              >
                {cropProps.imageLayers.map((img) => (
                  <option key={img.id} value={img.id} className="dark:bg-slate-800">
                    {img.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Section 2: Aspect Ratio Presets */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
              {isAr ? 'النسبة:' : 'Ratio:'}
            </span>
            {(
              [
                { id: 'free', labelAr: 'حر', labelEn: 'Free' },
                { id: 'original', labelAr: 'أصلي', labelEn: 'Original' },
                { id: '1:1', labelAr: '1:1', labelEn: '1:1' },
                { id: '4:3', labelAr: '4:3', labelEn: '4:3' },
                { id: '3:4', labelAr: '3:4', labelEn: '3:4' },
                { id: '16:9', labelAr: '16:9', labelEn: '16:9' },
                { id: '9:16', labelAr: '9:16', labelEn: '9:16' },
              ] as { id: CropAspectRatio; labelAr: string; labelEn: string }[]
            ).map((ratio) => (
              <button
                key={ratio.id}
                onClick={() => cropProps.setCropAspectRatio(ratio.id)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                  cropProps.cropAspectRatio === ratio.id
                    ? 'bg-[#6C4DFF]/15 dark:bg-[#6C4DFF]/30 text-[#6C4DFF] dark:text-[#2DD4BF] border border-[#6C4DFF]/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                {isAr ? ratio.labelAr : ratio.labelEn}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Section 3: Live Dimensions Badge */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/70 border border-slate-200/80 dark:border-slate-600/50 font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0"
            title={isAr ? 'الأبعاد الحالية لمنطقة القص المحددة' : 'Current crop area dimensions'}
          >
            <span>{cropProps.cropDimensions.width}</span>
            <span className="text-slate-400">×</span>
            <span>{cropProps.cropDimensions.height}</span>
            <span className="text-[10px] text-slate-400 font-sans">px</span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Section 4: Actions (Reset, Cancel, Apply) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Reset */}
            <button
              onClick={cropProps.onResetCrop}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isAr ? 'إعادة ضبط أبعاد القص للأصل' : 'Reset crop bounds'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Cancel */}
            <button
              onClick={cropProps.onCancelCrop}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isAr ? 'إلغاء أداة القص' : 'Cancel crop (Esc)'}
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAr ? 'إلغاء' : 'Cancel'}</span>
            </button>

            {/* Apply */}
            <button
              onClick={cropProps.onApplyCrop}
              className="flex items-center gap-1.5 px-3.5 py-1 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C4DFF] to-[#5B3EE6] hover:opacity-95 shadow-sm shadow-purple-500/20 active:scale-95 transition-all"
              title={isAr ? 'تأكيد وتنفيذ عملية القص فورياً' : 'Apply crop (Enter)'}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isAr ? 'تطبيق القص' : 'Apply Crop'}</span>
            </button>
          </div>
        </div>
      ) : isEraserActive ? (
        /* ======================================================================= */
        /* 3. ERASER CONTEXTUAL TOOLBAR                                            */
        /* ======================================================================= */
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 py-0.5">
          {/* Eraser Tool Badge */}
          <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-xl border border-red-200 dark:border-red-900/50 shrink-0">
            <Eraser className="w-3.5 h-3.5" />
            <span>{isAr ? 'الممحاة الذكية' : 'Smart Eraser'}</span>
          </div>

          {/* Active Target Layer Badge */}
          {selectedLayer ? (
            <div
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg shrink-0 max-w-[150px] truncate ${
                selectedLayer.locked
                  ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                  : selectedLayer.type === 'image'
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60'
                  : selectedLayer.type === 'drawing'
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
              title={`${selectedLayer.name} (${selectedLayer.type})`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
              <span className="truncate">{selectedLayer.name}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg shrink-0 border border-amber-200 dark:border-amber-900/50">
              <span>{isAr ? 'انقر على طبقة للمسح' : 'Click layer to erase'}</span>
            </div>
          )}

          {/* Size Section */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {isAr ? 'الحجم:' : 'Size:'}
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[28px]">
              {brushConfig.size}px
            </span>

            {/* Quick Size Presets */}
            <div className="flex items-center gap-1">
              {[16, 32, 64, 100].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setBrushConfig((b) => ({ ...b, size: sz }))}
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all ${
                    brushConfig.size === sz
                      ? 'bg-red-500 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            {/* Size Slider */}
            <input
              type="range"
              min="2"
              max="200"
              value={brushConfig.size}
              onChange={(e) =>
                setBrushConfig((b) => ({ ...b, size: Number(e.target.value) }))
              }
              className="w-16 sm:w-20 accent-red-500 cursor-pointer"
              title={isAr ? 'تعديل حجم الممحاة' : 'Eraser size slider'}
            />
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Opacity Section */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
              {isAr ? 'القوة:' : 'Opacity:'}
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[32px]">
              {Math.round(brushConfig.opacity * 100)}%
            </span>
            <input
              type="range"
              min="10"
              max="100"
              value={Math.round(brushConfig.opacity * 100)}
              onChange={(e) =>
                setBrushConfig((b) => ({ ...b, opacity: Number(e.target.value) / 100 }))
              }
              className="w-14 sm:w-16 accent-red-500 cursor-pointer"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Hardness Toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setBrushConfig((b) => ({ ...b, hardness: 0.2 }))}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                brushConfig.hardness < 0.5
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isAr ? 'ناعم' : 'Soft'}
            </button>
            <button
              onClick={() => setBrushConfig((b) => ({ ...b, hardness: 0.95 }))}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                brushConfig.hardness >= 0.5
                  ? 'bg-red-500/15 text-red-600 dark:text-red-400 font-bold border border-red-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isAr ? 'حاد' : 'Hard'}
            </button>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Reset Eraser */}
          <button
            onClick={() =>
              setBrushConfig((b) => ({
                ...b,
                size: 32,
                opacity: 1,
                hardness: 0.8,
                tipShape: 'round',
              }))
            }
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
            title={isAr ? 'إعادة ضبط إعدادات الممحاة' : 'Reset eraser settings'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* ======================================================================= */
        /* 4. BRUSH CONTEXTUAL TOOLBAR                                             */
        /* ======================================================================= */
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 py-0.5">
          {/* Tool Badge */}
          <div className="flex items-center gap-1.5 font-bold text-[#6C4DFF] dark:text-[#2DD4BF] bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-xl border border-purple-200 dark:border-purple-900/50 shrink-0">
            <Paintbrush className="w-3.5 h-3.5" />
            <span>{isAr ? 'الفرشاة' : 'Brush'}</span>
          </div>

          {/* Color Picker Swatch & Eyedropper Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Native Color Input */}
            <div className="relative flex items-center">
              <input
                type="color"
                value={brushConfig.color}
                onChange={(e) => onSelectColor(e.target.value)}
                className="w-6 h-6 rounded-full border border-slate-300 dark:border-slate-600 cursor-pointer overflow-hidden p-0 bg-transparent"
                title={isAr ? 'اختر لون الفرشاة' : 'Choose brush color'}
              />
            </div>

            {/* Eyedropper Tool Button */}
            <button
              onClick={onToggleEyedropper}
              className={`p-1.5 rounded-xl border transition-all flex items-center gap-1 ${
                isEyedropperActive
                  ? 'bg-[#6C4DFF] text-white border-[#6C4DFF] shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600'
              }`}
              title={
                isAr
                  ? 'قطارة اقتطاف اللون: انقر على أي جزء من اللوحة لتحديد لونه (أو اضغط Alt+Click)'
                  : 'Eyedropper: Click anywhere on canvas to sample color (or Alt+Click)'
              }
            >
              <Pipette className="w-3.5 h-3.5" />
              <span className="hidden md:inline text-[11px] font-semibold">
                {isAr ? 'قطّارة' : 'Picker'}
              </span>
            </button>
          </div>

          {/* Recent Colors Palette (Compact) */}
          {recentColors && recentColors.length > 0 && (
            <div className="flex items-center gap-1 shrink-0 px-1 border-x border-slate-200 dark:border-slate-700">
              {recentColors.slice(0, 6).map((col) => (
                <button
                  key={col}
                  onClick={() => onSelectColor(col)}
                  style={{ backgroundColor: col }}
                  className={`w-4 h-4 rounded-full border transition-all ${
                    brushConfig.color.toLowerCase() === col.toLowerCase()
                      ? 'scale-125 border-[#6C4DFF] dark:border-[#2DD4BF] shadow-xs ring-1 ring-purple-400'
                      : 'border-slate-300 dark:border-slate-600 hover:scale-110'
                  }`}
                  title={col}
                />
              ))}
            </div>
          )}

          {/* Size Section */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {isAr ? 'الحجم:' : 'Size:'}
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[28px]">
              {brushConfig.size}px
            </span>

            {/* Quick Size Presets */}
            <div className="flex items-center gap-1">
              {[6, 16, 32, 64].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setBrushConfig((b) => ({ ...b, size: sz }))}
                  className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold transition-all ${
                    brushConfig.size === sz
                      ? 'bg-[#6C4DFF] text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="1"
              max="150"
              value={brushConfig.size}
              onChange={(e) =>
                setBrushConfig((b) => ({ ...b, size: Number(e.target.value) }))
              }
              className="w-16 sm:w-20 accent-[#6C4DFF] cursor-pointer"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Opacity Section */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
              {isAr ? 'الشفافية:' : 'Opacity:'}
            </span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[32px]">
              {Math.round(brushConfig.opacity * 100)}%
            </span>
            <input
              type="range"
              min="10"
              max="100"
              value={Math.round(brushConfig.opacity * 100)}
              onChange={(e) =>
                setBrushConfig((b) => ({ ...b, opacity: Number(e.target.value) / 100 }))
              }
              className="w-14 sm:w-16 accent-[#6C4DFF] cursor-pointer"
            />
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Advanced / Brush Type Toggle */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() =>
                setBrushConfig((b) => ({
                  ...b,
                  brushType: 'soft',
                  hardness: 0.25,
                }))
              }
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                brushConfig.brushType === 'soft' && brushConfig.hardness < 0.6
                  ? 'bg-[#6C4DFF]/15 text-[#6C4DFF] dark:text-[#2DD4BF] font-bold border border-[#6C4DFF]/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isAr ? 'ناعم' : 'Soft'}
            </button>
            <button
              onClick={() =>
                setBrushConfig((b) => ({
                  ...b,
                  brushType: 'hard',
                  hardness: 0.95,
                }))
              }
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all ${
                brushConfig.hardness >= 0.8
                  ? 'bg-[#6C4DFF]/15 text-[#6C4DFF] dark:text-[#2DD4BF] font-bold border border-[#6C4DFF]/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {isAr ? 'حاد' : 'Hard'}
            </button>

            {/* Quick dropdown for decorative/artistic brushes */}
            <div className="relative">
              <button
                onClick={() => setShowAdvancedBrush(!showAdvancedBrush)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                title={isAr ? 'أنماط الفرشاة الفنية' : 'Artistic brush styles'}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </button>

              {showAdvancedBrush && (
                <div
                  className={`absolute top-full ${
                    isAr ? 'left-0 text-right' : 'right-0 text-left'
                  } mt-2 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 z-50 text-xs`}
                >
                  {[
                    { id: 'airbrush', nameAr: 'بخاخ هوائي', nameEn: 'Airbrush' },
                    { id: 'spray', nameAr: 'رذاذ نقطي', nameEn: 'Spray Particles' },
                    { id: 'stars', nameAr: 'فرشاة النجوم ★', nameEn: 'Star Sparkles' },
                    { id: 'hearts', nameAr: 'فرشاة القلوب ♥', nameEn: 'Heart Trail' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        setBrushConfig((b) => ({ ...b, brushType: style.id as any }));
                        setShowAdvancedBrush(false);
                      }}
                      className={`w-full px-3 py-1.5 flex items-center justify-between hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors ${
                        brushConfig.brushType === style.id
                          ? 'text-[#6C4DFF] dark:text-[#2DD4BF] font-bold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{isAr ? style.nameAr : style.nameEn}</span>
                      {brushConfig.brushType === style.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Reset Brush */}
          <button
            onClick={() => {
              setBrushConfig((b) => ({
                ...b,
                size: 16,
                opacity: 1,
                hardness: 0.75,
                brushType: 'soft',
                tipShape: 'round',
              }));
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0"
            title={isAr ? 'إعادة ضبط إعدادات الفرشاة' : 'Reset brush settings'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. PEN TOOL CONTEXTUAL BAR                                                */}
      {/* ========================================================================= */}
      {isPen && penProps && (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 py-1">
          {/* Tool badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C4DFF] dark:text-[#2DD4BF] font-bold border border-[#6C4DFF]/20">
            <PenTool className="w-3.5 h-3.5" />
            <span>{isAr ? 'أداة القلم' : 'Pen Tool'}</span>
          </div>

          {/* Status info */}
          {penProps.activePathLayer?.pathConfig ? (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {penProps.activePathLayer.pathConfig.closed
                  ? isAr
                    ? `مسار مغلق (${penProps.activePathLayer.pathConfig.points.length} نقاط)`
                    : `Closed (${penProps.activePathLayer.pathConfig.points.length} pts)`
                  : isAr
                  ? `مسار مفتوح (${penProps.activePathLayer.pathConfig.points.length} نقاط)`
                  : `Open (${penProps.activePathLayer.pathConfig.points.length} pts)`}
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAr ? 'انقر على اللوحة لبدء مسار' : 'Click canvas to start path'}
            </span>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Convert to Selection button */}
          <button
            onClick={penProps.onConvertToSelection}
            disabled={!penProps.activePathLayer?.pathConfig}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#6C4DFF] to-[#5538EE] hover:opacity-95 disabled:opacity-50 text-white font-bold transition-all active:scale-95 shadow-2xs cursor-pointer disabled:cursor-not-allowed"
            title={isAr ? 'تحويل المسار إلى تحديد نشط (Marching Ants)' : 'Convert to Selection'}
          >
            <Sparkles className="w-3 h-3" />
            <span>{isAr ? 'تحويل لتحديد' : 'To Selection'}</span>
          </button>

          {/* Toggle Closed / Open */}
          {penProps.activePathLayer?.pathConfig && (
            <button
              onClick={penProps.onToggleClosed}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold transition-colors cursor-pointer"
              title={penProps.activePathLayer.pathConfig.closed ? (isAr ? 'فتح المسار' : 'Open Path') : isAr ? 'إغلاق المسار' : 'Close Path'}
            >
              <span>
                {penProps.activePathLayer.pathConfig.closed
                  ? isAr
                    ? 'مسار مغلق'
                    : 'Closed'
                  : isAr
                  ? 'إغلاق المسار'
                  : 'Close Path'}
              </span>
            </button>
          )}

          {/* Stroke width quick control */}
          {penProps.activePathLayer?.pathConfig && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-xl bg-slate-100/80 dark:bg-slate-700/60">
              <span className="text-[10px] text-slate-500 font-bold uppercase">{isAr ? 'السُمك' : 'Width'}</span>
              <input
                type="range"
                min={1}
                max={30}
                value={penProps.activePathLayer.pathConfig.strokeWidth}
                onChange={(e) =>
                  penProps.onUpdatePathConfig({
                    ...penProps.activePathLayer!.pathConfig!,
                    strokeWidth: Number(e.target.value),
                  })
                }
                className="w-16 accent-[#6C4DFF]"
              />
              <span className="font-mono text-[10px] w-6 text-center">
                {penProps.activePathLayer.pathConfig.strokeWidth}p
              </span>
            </div>
          )}

          {/* Delete selected anchor point button */}
          {penProps.selectedPointId && (
            <button
              onClick={penProps.onDeleteSelectedPoint}
              className="flex items-center gap-1 px-2 py-1 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/40 transition-colors cursor-pointer"
              title={isAr ? 'حذف النقطة المحددة (Delete)' : 'Delete selected point (Del)'}
            >
              <Trash2 className="w-3 h-3" />
              <span className="text-[11px]">{isAr ? 'حذف نقطة' : 'Delete pt'}</span>
            </button>
          )}

          {/* New Path button */}
          <button
            onClick={penProps.onNewPath}
            className="flex items-center gap-1 px-2 py-1 rounded-xl text-[#6C4DFF] dark:text-[#2DD4BF] hover:bg-purple-50 dark:hover:bg-slate-700 border border-purple-200/60 dark:border-slate-600 transition-colors font-semibold cursor-pointer"
            title={isAr ? 'بدء مسار جديد' : 'Start new path'}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-[11px]">{isAr ? 'مسار جديد' : 'New Path'}</span>
          </button>
        </div>
      )}

      {isTransform && transformProps && (
        /* ======================================================================= */
        /* 5. ADVANCED TRANSFORM CONTEXTUAL TOOLBAR                                */
        /* ======================================================================= */
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 py-0.5">
          {/* Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6C4DFF] dark:text-[#2DD4BF] font-bold border border-[#6C4DFF]/20 shrink-0">
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{isAr ? 'التحويل المتقدم' : 'Advanced Transform'}</span>
          </div>

          {transformProps.layer ? (
            <>
              {/* Layer Name / Type */}
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-[11px] font-semibold max-w-[130px] truncate border border-slate-200 dark:border-slate-650 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6C4DFF] shrink-0" />
                <span className="truncate">{transformProps.layer.name}</span>
              </div>

              {/* Position: X & Y */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-650 shrink-0">
                <span className="text-[10px] text-slate-400 font-bold">X:</span>
                <input
                  type="number"
                  value={Math.round(transformProps.layer.x)}
                  onChange={(e) => transformProps.onUpdateTransform({ x: Number(e.target.value) || 0 })}
                  className="w-12 bg-transparent text-xs font-mono outline-none text-center"
                />
                <span className="text-[10px] text-slate-400 font-bold">Y:</span>
                <input
                  type="number"
                  value={Math.round(transformProps.layer.y)}
                  onChange={(e) => transformProps.onUpdateTransform({ y: Number(e.target.value) || 0 })}
                  className="w-12 bg-transparent text-xs font-mono outline-none text-center"
                />
              </div>

              {/* Dimensions: W & H */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-650 shrink-0">
                <span className="text-[10px] text-slate-400 font-bold">W:</span>
                <input
                  type="number"
                  min="5"
                  value={Math.round(transformProps.layer.width)}
                  onChange={(e) => transformProps.onUpdateTransform({ width: Math.max(5, Number(e.target.value) || 5) })}
                  className="w-12 bg-transparent text-xs font-mono outline-none text-center"
                />
                <span className="text-[10px] text-slate-400 font-bold">H:</span>
                <input
                  type="number"
                  min="5"
                  value={Math.round(transformProps.layer.height)}
                  onChange={(e) => transformProps.onUpdateTransform({ height: Math.max(5, Number(e.target.value) || 5) })}
                  className="w-12 bg-transparent text-xs font-mono outline-none text-center"
                />
              </div>

              {/* Rotation */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/60 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-650 shrink-0">
                <RotateCw className="w-3 h-3 text-[#6C4DFF] dark:text-[#2DD4BF]" />
                <input
                  type="number"
                  value={Math.round(transformProps.layer.rotation || 0)}
                  onChange={(e) => transformProps.onUpdateTransform({ rotation: Number(e.target.value) || 0 })}
                  className="w-10 bg-transparent text-xs font-mono outline-none text-center"
                />
                <span className="text-[10px] text-slate-400">°</span>
                <button
                  onClick={() => transformProps.onUpdateTransform({ rotation: (((transformProps.layer!.rotation || 0) + 90) % 360) })}
                  className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                  title={isAr ? 'تدوير +90°' : 'Rotate +90°'}
                >
                  <RotateCw className="w-3 h-3" />
                </button>
              </div>

              {/* Flip Buttons */}
              <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700/60 p-0.5 rounded-xl border border-slate-200 dark:border-slate-650 shrink-0">
                <button
                  onClick={() => transformProps.onUpdateTransform({ flipHorizontal: !transformProps.layer!.flipHorizontal })}
                  className={`p-1 rounded-lg transition-colors ${
                    transformProps.layer.flipHorizontal
                      ? 'bg-[#6C4DFF] text-white'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                  title={isAr ? 'قلب أفقي' : 'Flip Horizontal'}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => transformProps.onUpdateTransform({ flipVertical: !transformProps.layer!.flipVertical })}
                  className={`p-1 rounded-lg transition-colors ${
                    transformProps.layer.flipVertical
                      ? 'bg-[#6C4DFF] text-white'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}
                  title={isAr ? 'قلب رأسي' : 'Flip Vertical'}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

              {/* Apply (Enter) */}
              <button
                onClick={transformProps.onApplyTransform}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#6C4DFF] hover:bg-[#5839EE] text-white font-bold shadow-xs hover:shadow transition-all shrink-0 cursor-pointer active:scale-95"
                title={isAr ? 'تطبيق التحويل (Enter)' : 'Apply Transform (Enter)'}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isAr ? 'تطبيق' : 'Apply'}</span>
              </button>

              {/* Cancel (Esc) */}
              <button
                onClick={transformProps.onCancelTransform}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 font-semibold border border-slate-200 dark:border-slate-600 transition-all shrink-0 cursor-pointer active:scale-95"
                title={isAr ? 'إلغاء واستعادة الحالة السابقة (Esc)' : 'Cancel & Revert (Esc)'}
              >
                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{isAr ? 'إلغاء' : 'Cancel'}</span>
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-500 italic px-2">
              {isAr ? 'حدد أي عنصر للتحويل' : 'Select any layer to transform'}
            </span>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. REMOVE OBJECT CONTEXTUAL TOOLBAR                                       */}
      {/* ========================================================================= */}
      {isRemoveObject && removeObjectProps && (
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 py-0.5">
          {/* Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-[#6338E8] dark:text-[#20BFC4] font-bold border border-[#6338E8]/20 shrink-0">
            <Wand2 className="w-4 h-4" />
            <span className="font-bold">{isAr ? 'إزالة كائن' : 'Remove Object'}</span>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Mode toggle: Paint Mask (+) vs Erase Mask (-) */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-700/60 rounded-xl shrink-0">
            <button
              onClick={() => removeObjectProps.setMode('add')}
              title={isAr ? 'تحديد كائن جديد بالفرشاة' : 'Paint object to remove (+)'}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                removeObjectProps.mode === 'add'
                  ? 'bg-[#6338E8] text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span>{isAr ? 'تحديد' : 'Paint'}</span>
            </button>

            <button
              onClick={() => removeObjectProps.setMode('remove')}
              title={isAr ? 'مسح من التحديد للتصحيح' : 'Erase from mask to correct (-)'}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                removeObjectProps.mode === 'remove'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>{isAr ? 'تصحيح' : 'Erase'}</span>
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Brush Size Slider */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {isAr ? 'الحجم:' : 'Size:'}
            </span>
            <input
              type="range"
              min="4"
              max="200"
              value={removeObjectProps.brushSize}
              onChange={(e) => removeObjectProps.setBrushSize(parseInt(e.target.value))}
              className="w-16 sm:w-24 accent-[#6338E8] dark:accent-[#20BFC4] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 w-9">
              {removeObjectProps.brushSize}px
            </span>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Feather / Hardness Slider */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {isAr ? 'التنعيم:' : 'Feather:'}
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={1 - removeObjectProps.hardness}
              onChange={(e) => removeObjectProps.setHardness(1 - parseFloat(e.target.value))}
              className="w-14 sm:w-20 accent-[#6338E8] dark:accent-[#20BFC4] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200 w-8">
              {Math.round((1 - removeObjectProps.hardness) * 100)}%
            </span>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 shrink-0" />

          {/* Clear Mask if present */}
          {removeObjectProps.hasMask && (
            <button
              onClick={removeObjectProps.onClearMask}
              className="px-2 py-1 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg text-[11px] font-semibold transition-all shrink-0 cursor-pointer"
              title={isAr ? 'مسح قناع التحديد' : 'Clear mask'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Preview Toggle Button */}
          <button
            onClick={removeObjectProps.onTogglePreview}
            disabled={!removeObjectProps.hasMask || removeObjectProps.isProcessing}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
              removeObjectProps.isPreviewing
                ? 'bg-amber-500 text-white shadow-xs'
                : removeObjectProps.hasMask
                ? 'bg-purple-100 dark:bg-purple-950/60 text-[#6338E8] dark:text-[#20BFC4] hover:bg-purple-200'
                : 'text-slate-400 cursor-not-allowed opacity-50'
            }`}
            title={isAr ? 'معاينة النتيجة غير إتلافية' : 'Preview reconstructed result'}
          >
            {removeObjectProps.isProcessing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : removeObjectProps.isPreviewing ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            <span>
              {removeObjectProps.isPreviewing
                ? isAr ? 'إخفاء المعاينة' : 'Hide Preview'
                : isAr ? 'معاينة' : 'Preview'}
            </span>
          </button>

          {/* Apply Button */}
          <button
            onClick={removeObjectProps.onApply}
            disabled={!removeObjectProps.hasMask || removeObjectProps.isProcessing}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-white shadow-xs transition-all shrink-0 cursor-pointer active:scale-95 ${
              removeObjectProps.hasMask && !removeObjectProps.isProcessing
                ? 'bg-gradient-to-r from-[#6338E8] to-[#4F8FE8] hover:from-[#522ac7] hover:to-[#3b7bd6]'
                : 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed opacity-50'
            }`}
            title={isAr ? 'تطبيق الإزالة (Enter)' : 'Apply Removal (Enter)'}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isAr ? 'تطبيق' : 'Apply'}</span>
          </button>

          {/* Cancel Button */}
          <button
            onClick={removeObjectProps.onCancel}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 font-semibold border border-slate-200 dark:border-slate-600 transition-all shrink-0 cursor-pointer active:scale-95"
            title={isAr ? 'إلغاء واستعادة الحالة السابقة (Esc)' : 'Cancel (Esc)'}
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isAr ? 'إلغاء' : 'Cancel'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
