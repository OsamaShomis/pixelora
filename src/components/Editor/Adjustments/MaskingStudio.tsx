import React, { useState } from 'react';
import { AdjustmentMask, AdjustmentMaskType, LocalAdjustments } from '../../../types';
import {
  Paintbrush,
  Sliders,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Sun,
  Maximize2,
  Sparkles,
  Contrast,
  Circle,
  Square,
  Layers,
} from 'lucide-react';

interface MaskingStudioProps {
  masks?: AdjustmentMask[];
  onChange: (masks: AdjustmentMask[]) => void;
  language: 'ar' | 'en';
}

const DEFAULT_LOCAL_ADJUSTMENTS: LocalAdjustments = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  saturation: 0,
  sharpness: 0,
  clarity: 0,
  dehaze: 0,
  texture: 0,
};

const MASK_TYPE_INFO: Record<
  AdjustmentMaskType,
  { nameAr: string; nameEn: string; icon: React.FC<{ className?: string }> }
> = {
  brush: { nameAr: 'فرشاة التعديل', nameEn: 'Adjustment Brush', icon: Paintbrush },
  linear_gradient: { nameAr: 'تدرج خطي', nameEn: 'Linear Gradient', icon: Square },
  radial_gradient: { nameAr: 'تدرج دائري', nameEn: 'Radial Gradient', icon: Circle },
  subject: { nameAr: 'تحديد العنصر الرئيسي (AI)', nameEn: 'Select Subject (AI)', icon: Sparkles },
  sky: { nameAr: 'تحديد السماء (AI)', nameEn: 'Select Sky (AI)', icon: Sun },
  background: { nameAr: 'تحديد الخلفية (AI)', nameEn: 'Select Background (AI)', icon: Layers },
  color_range: { nameAr: 'نطاق لوني محدد', nameEn: 'Color Range', icon: Maximize2 },
  luminance_range: { nameAr: 'نطاق الإضاءة', nameEn: 'Luminance Range', icon: Contrast },
};

export const MaskingStudio: React.FC<MaskingStudioProps> = ({
  masks = [],
  onChange,
  language,
}) => {
  const isAr = language === 'ar';
  const [selectedMaskId, setSelectedMaskId] = useState<string | null>(
    masks.length > 0 ? masks[0].id : null
  );

  const selectedMask = masks.find((m) => m.id === selectedMaskId);

  const handleAddMask = (type: AdjustmentMaskType) => {
    const info = MASK_TYPE_INFO[type];
    const newMask: AdjustmentMask = {
      id: `mask-${Date.now()}`,
      name: `${isAr ? info.nameAr : info.nameEn} ${masks.length + 1}`,
      type,
      enabled: true,
      inverted: false,
      opacity: 1.0,
      adjustments: { ...DEFAULT_LOCAL_ADJUSTMENTS, exposure: 15 },
    };
    const updated = [...masks, newMask];
    onChange(updated);
    setSelectedMaskId(newMask.id);
  };

  const handleRemoveMask = (id: string) => {
    const updated = masks.filter((m) => m.id !== id);
    onChange(updated);
    if (selectedMaskId === id) {
      setSelectedMaskId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleToggleMaskEnabled = (id: string) => {
    onChange(
      masks.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleToggleMaskInvert = (id: string) => {
    onChange(
      masks.map((m) => (m.id === id ? { ...m, inverted: !m.inverted } : m))
    );
  };

  const updateSelectedAdjustments = (key: keyof LocalAdjustments, value: number) => {
    if (!selectedMaskId) return;
    onChange(
      masks.map((m) =>
        m.id === selectedMaskId
          ? {
              ...m,
              adjustments: {
                ...m.adjustments,
                [key]: value,
              },
            }
          : m
      )
    );
  };

  return (
    <div className="space-y-4 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Paintbrush className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
          <span>{isAr ? 'الأقنعة والتعديلات الموضعية (Masking)' : 'Masking (Local Adjustments)'}</span>
        </span>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
          {masks.length} {isAr ? 'أقنعة' : 'masks'}
        </span>
      </div>

      {/* Quick Add Mask Buttons */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 block">
          {isAr ? 'إضافة قناع موضعي جديد:' : 'Add New Adjustment Mask:'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {(
            [
              'brush',
              'linear_gradient',
              'radial_gradient',
              'subject',
              'sky',
              'background',
              'color_range',
              'luminance_range',
            ] as AdjustmentMaskType[]
          ).map((type) => {
            const info = MASK_TYPE_INFO[type];
            const Icon = info.icon;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleAddMask(type)}
                className="p-2 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-[#6C4DFF] text-slate-300 text-[10px] font-bold flex flex-col items-center gap-1 transition-all"
              >
                <Icon className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span className="truncate max-w-full">{isAr ? info.nameAr : info.nameEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Masks List */}
      {masks.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-bold text-slate-400 block">
            {isAr ? 'الأقنعة المفعلة:' : 'Active Masks:'}
          </label>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {masks.map((mask) => {
              const isSelected = mask.id === selectedMaskId;
              const info = MASK_TYPE_INFO[mask.type];
              const Icon = info.icon;

              return (
                <div
                  key={mask.id}
                  onClick={() => setSelectedMaskId(mask.id)}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#6C4DFF] bg-[#6C4DFF]/15 text-white'
                      : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
                      <Icon className="w-3 h-3 text-[#2DD4BF]" />
                    </div>
                    <span className="text-xs font-bold truncate">{mask.name}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMaskInvert(mask.id);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                        mask.inverted
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={isAr ? 'عكس القناع' : 'Invert Mask'}
                    >
                      {isAr ? 'عكس' : 'Invert'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMaskEnabled(mask.id);
                      }}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      {mask.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMask(mask.id);
                      }}
                      className="p-1 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Mask Local Sliders */}
      {selectedMask && (
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold text-[#2DD4BF]">
            <span>{isAr ? `تعديلات: ${selectedMask.name}` : `Adjustments for: ${selectedMask.name}`}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {/* Exposure */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">{isAr ? 'التعريض (Exposure)' : 'Exposure'}</span>
                <span className="font-mono text-slate-200">
                  {selectedMask.adjustments.exposure || 0}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={selectedMask.adjustments.exposure || 0}
                onChange={(e) => updateSelectedAdjustments('exposure', Number(e.target.value))}
                className="w-full accent-[#6C4DFF]"
              />
            </div>

            {/* Contrast */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">{isAr ? 'التباين (Contrast)' : 'Contrast'}</span>
                <span className="font-mono text-slate-200">
                  {selectedMask.adjustments.contrast || 0}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={selectedMask.adjustments.contrast || 0}
                onChange={(e) => updateSelectedAdjustments('contrast', Number(e.target.value))}
                className="w-full accent-[#6C4DFF]"
              />
            </div>

            {/* Highlights */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">{isAr ? 'المناطق الساطعة (Highlights)' : 'Highlights'}</span>
                <span className="font-mono text-slate-200">
                  {selectedMask.adjustments.highlights || 0}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={selectedMask.adjustments.highlights || 0}
                onChange={(e) => updateSelectedAdjustments('highlights', Number(e.target.value))}
                className="w-full accent-[#6C4DFF]"
              />
            </div>

            {/* Shadows */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">{isAr ? 'الظلال (Shadows)' : 'Shadows'}</span>
                <span className="font-mono text-slate-200">
                  {selectedMask.adjustments.shadows || 0}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={selectedMask.adjustments.shadows || 0}
                onChange={(e) => updateSelectedAdjustments('shadows', Number(e.target.value))}
                className="w-full accent-[#6C4DFF]"
              />
            </div>

            {/* Temperature */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">{isAr ? 'حرارة اللون (Temperature)' : 'Temperature'}</span>
                <span className="font-mono text-slate-200">
                  {selectedMask.adjustments.temperature || 0}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={selectedMask.adjustments.temperature || 0}
                onChange={(e) => updateSelectedAdjustments('temperature', Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Clarity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300">{isAr ? 'الوضوح (Clarity)' : 'Clarity'}</span>
                <span className="font-mono text-slate-200">
                  {selectedMask.adjustments.clarity || 0}
                </span>
              </div>
              <input
                type="range"
                min="-100"
                max="100"
                value={selectedMask.adjustments.clarity || 0}
                onChange={(e) => updateSelectedAdjustments('clarity', Number(e.target.value))}
                className="w-full accent-[#2DD4BF]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
