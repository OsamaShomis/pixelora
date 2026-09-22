import React, { useState, useRef } from 'react';
import { ColorGrading, ColorGradingTarget } from '../../../types';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_COLOR_GRADING } from '../../../data/lightroomPresets';

interface ColorGradingWheelProps {
  grading?: ColorGrading;
  value?: ColorGrading;
  onChange: (grading: ColorGrading) => void;
  language: 'ar' | 'en';
}

type GradingTargetKey = 'shadows' | 'midtones' | 'highlights';

export const ColorGradingWheel: React.FC<ColorGradingWheelProps> = ({
  grading,
  value,
  onChange,
  language,
}) => {
  const isAr = language === 'ar';
  const actualGrading = grading || value || DEFAULT_COLOR_GRADING;
  const [activeTarget, setActiveTarget] = useState<GradingTargetKey>('shadows');
  const wheelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const targets: { id: GradingTargetKey; nameAr: string; nameEn: string }[] = [
    { id: 'shadows', nameAr: 'الظلال (Shadows)', nameEn: 'Shadows' },
    { id: 'midtones', nameAr: 'المتوسطة (Midtones)', nameEn: 'Midtones' },
    { id: 'highlights', nameAr: 'الإضاءة (Highlights)', nameEn: 'Highlights' },
  ];

  const currentGrading = actualGrading[activeTarget] || { hue: 0, saturation: 0, luminance: 0 };

  const handleWheelMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateFromMouse(e);
  };

  const updateFromMouse = (e: React.MouseEvent | MouseEvent) => {
    if (!wheelRef.current) return;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const radius = rect.width / 2;

    let distance = Math.sqrt(dx * dx + dy * dy);
    let sat = Math.min(100, Math.round((distance / radius) * 100));

    // Calculate angle in degrees (0 to 360)
    let angleRad = Math.atan2(dy, dx);
    let angleDeg = Math.round((angleRad * 180) / Math.PI);
    if (angleDeg < 0) angleDeg += 360;

    onChange({
      ...actualGrading,
      [activeTarget]: {
        ...currentGrading,
        hue: angleDeg,
        saturation: sat,
      },
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    updateFromMouse(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const updateLuminance = (lum: number) => {
    onChange({
      ...actualGrading,
      [activeTarget]: {
        ...currentGrading,
        luminance: lum,
      },
    });
  };

  const handleResetTarget = () => {
    onChange({
      ...actualGrading,
      [activeTarget]: { hue: 0, saturation: 0, luminance: 0 },
    });
  };

  // Puck position in percentage from center
  const puckRadius = currentGrading.saturation * 0.45; // 0..45%
  const puckAngleRad = (currentGrading.hue * Math.PI) / 180;
  const puckX = 50 + puckRadius * Math.cos(puckAngleRad);
  const puckY = 50 + puckRadius * Math.sin(puckAngleRad);

  return (
    <div className="space-y-3.5 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-white">
          {isAr ? 'التدرج اللوني السينمائي (Color Grading)' : 'Color Grading (3-Way)'}
        </span>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_COLOR_GRADING)}
          className="text-[10px] font-bold text-[#6C4DFF] dark:text-[#2DD4BF] hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{isAr ? 'إعادة الضبط' : 'Reset'}</span>
        </button>
      </div>

      {/* Target Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
        {targets.map((t) => {
          const isSelected = activeTarget === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTarget(t.id)}
              className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all text-center ${
                isSelected
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {isAr ? t.nameAr : t.nameEn}
            </button>
          );
        })}
      </div>

      {/* Color Wheel Visualization */}
      <div className="flex flex-col items-center gap-2 pt-1">
        <div
          ref={wheelRef}
          onMouseDown={handleWheelMouseDown}
          className="relative w-40 h-40 rounded-full border-2 border-slate-700 cursor-crosshair shadow-inner overflow-hidden select-none"
          style={{
            background: `conic-gradient(from 0deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)`,
          }}
        >
          {/* Radial overlay to make center white/neutral */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, rgba(128, 128, 128, 0.95) 0%, rgba(128, 128, 128, 0.4) 50%, transparent 100%)`,
            }}
          />

          {/* Draggable Puck */}
          <div
            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-75"
            style={{
              left: `${puckX}%`,
              top: `${puckY}%`,
              backgroundColor:
                currentGrading.saturation > 0
                  ? `hsl(${currentGrading.hue}, 100%, 50%)`
                  : '#ffffff',
            }}
          />
        </div>

        {/* Hue & Saturation numeric display */}
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-300">
          <span>Hue: {currentGrading.hue}°</span>
          <span>Sat: {currentGrading.saturation}%</span>
        </div>
      </div>

      {/* Active Target Luminance Slider */}
      <div className="space-y-1 pt-1">
        <div className="flex justify-between text-[11px] font-medium">
          <span className="text-slate-300">{isAr ? 'إضاءة النطاق (Luminance)' : 'Target Luminance'}</span>
          <span className="font-mono text-xs font-bold text-slate-100">
            {currentGrading.luminance > 0 ? `+${currentGrading.luminance}` : currentGrading.luminance}
          </span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          value={currentGrading.luminance}
          onChange={(e) => updateLuminance(Number(e.target.value))}
          className="w-full accent-[#6C4DFF]"
        />
      </div>

      {/* Master Blending & Balance */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-medium">
            <span className="text-slate-300">{isAr ? 'المزج (Blending)' : 'Blending'}</span>
            <span className="font-mono text-slate-200">{actualGrading.blending ?? 50}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={actualGrading.blending ?? 50}
            onChange={(e) => onChange({ ...actualGrading, blending: Number(e.target.value) })}
            className="w-full accent-[#23B5D3]"
          />
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-medium">
            <span className="text-slate-300">{isAr ? 'التوازن (Balance)' : 'Balance'}</span>
            <span className="font-mono text-slate-200">{actualGrading.balance ?? 0}</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={actualGrading.balance ?? 0}
            onChange={(e) => onChange({ ...actualGrading, balance: Number(e.target.value) })}
            className="w-full accent-[#2DD4BF]"
          />
        </div>
      </div>
    </div>
  );
};
