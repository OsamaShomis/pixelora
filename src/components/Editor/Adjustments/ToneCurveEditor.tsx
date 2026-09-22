import React, { useState, useRef, useEffect } from 'react';
import { CurvePoint, ToneCurves } from '../../../types';
import { RotateCcw } from 'lucide-react';
import { DEFAULT_TONE_CURVES } from '../../../data/lightroomPresets';

interface ToneCurveEditorProps {
  curves?: ToneCurves;
  value?: ToneCurves;
  onChange: (curves: ToneCurves) => void;
  language: 'ar' | 'en';
}

type ChannelKey = 'rgb' | 'red' | 'green' | 'blue';

export const ToneCurveEditor: React.FC<ToneCurveEditorProps> = ({
  curves,
  value,
  onChange,
  language,
}) => {
  const isAr = language === 'ar';
  const [activeChannel, setActiveChannel] = useState<ChannelKey>('rgb');
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const actualCurves = curves || value || DEFAULT_TONE_CURVES;
  const currentPoints = actualCurves[activeChannel] || [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ];

  const channelColors: Record<ChannelKey, { stroke: string; activeBg: string; labelAr: string; labelEn: string }> = {
    rgb: { stroke: '#e2e8f0', activeBg: 'bg-slate-700 text-white', labelAr: 'RGB عام', labelEn: 'RGB' },
    red: { stroke: '#ef4444', activeBg: 'bg-red-600 text-white', labelAr: 'أحمر R', labelEn: 'Red' },
    green: { stroke: '#22c55e', activeBg: 'bg-green-600 text-white', labelAr: 'أخضر G', labelEn: 'Green' },
    blue: { stroke: '#3b82f6', activeBg: 'bg-blue-600 text-white', labelAr: 'أزرق B', labelEn: 'Blue' },
  };

  const handleResetChannel = () => {
    onChange({
      ...actualCurves,
      [activeChannel]: [
        { x: 0, y: 0 },
        { x: 255, y: 255 },
      ],
    });
  };

  const getSvgCoordinates = (e: React.MouseEvent | MouseEvent | React.PointerEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    const x = Math.max(0, Math.min(255, Math.round(((clientX - rect.left) / rect.width) * 255)));
    const y = Math.max(0, Math.min(255, Math.round((1 - (clientY - rect.top) / rect.height) * 255)));
    return { x, y };
  };

  const handleSvgMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getSvgCoordinates(e);

    // Check if clicked near an existing point
    const threshold = 16;
    const existingIdx = currentPoints.findIndex(
      (p) => Math.hypot(p.x - x, p.y - y) <= threshold
    );

    if (existingIdx !== -1) {
      setDraggingIdx(existingIdx);
    } else {
      // Add new point
      const newPoints = [...currentPoints, { x, y }].sort((a, b) => a.x - b.x);
      const newIdx = newPoints.findIndex((p) => p.x === x && p.y === y);
      onChange({
        ...actualCurves,
        [activeChannel]: newPoints,
      });
      setDraggingIdx(newIdx);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingIdx === null) return;
      const { x, y } = getSvgCoordinates(e);

      const updated = [...currentPoints];
      // Keep endpoints at x=0 and x=255
      if (draggingIdx === 0) {
        updated[0] = { x: 0, y };
      } else if (draggingIdx === updated.length - 1) {
        updated[updated.length - 1] = { x: 255, y };
      } else {
        const minX = updated[draggingIdx - 1].x + 2;
        const maxX = updated[draggingIdx + 1].x - 2;
        updated[draggingIdx] = {
          x: Math.max(minX, Math.min(maxX, x)),
          y,
        };
      }

      onChange({
        ...actualCurves,
        [activeChannel]: updated,
      });
    };

    const handleMouseUp = () => {
      setDraggingIdx(null);
    };

    if (draggingIdx !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingIdx, currentPoints, activeChannel, actualCurves, onChange]);

  const handlePointDoubleClick = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (idx === 0 || idx === currentPoints.length - 1) return; // Don't remove endpoints
    const updated = currentPoints.filter((_, i) => i !== idx);
    onChange({
      ...actualCurves,
      [activeChannel]: updated,
    });
  };

  // Generate SVG path string from points
  const generatePathD = (pts: CurvePoint[]) => {
    if (pts.length < 2) return '';
    const sorted = [...pts].sort((a, b) => a.x - b.x);
    let d = `M ${sorted[0].x} ${255 - sorted[0].y}`;

    if (sorted.length === 2) {
      d += ` L ${sorted[1].x} ${255 - sorted[1].y}`;
      return d;
    }

    // Bezier smoothing between points
    for (let i = 0; i < sorted.length - 1; i++) {
      const p0 = sorted[i === 0 ? 0 : i - 1];
      const p1 = sorted[i];
      const p2 = sorted[i + 1];
      const p3 = sorted[i + 2 < sorted.length ? i + 2 : sorted.length - 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = 255 - (p1.y + (p2.y - p0.y) / 6);
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = 255 - (p2.y + (p3.y - p1.y) / 6);

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${255 - p2.y}`;
    }
    return d;
  };

  return (
    <div className="space-y-2.5 bg-slate-900/90 rounded-2xl p-3 border border-slate-800 text-slate-200">
      {/* Header & Channels */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-xl border border-slate-700">
          {(['rgb', 'red', 'green', 'blue'] as ChannelKey[]).map((ch) => {
            const isSelected = activeChannel === ch;
            return (
              <button
                key={ch}
                type="button"
                onClick={() => setActiveChannel(ch)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  isSelected
                    ? channelColors[ch].activeBg
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {isAr ? channelColors[ch].labelAr : channelColors[ch].labelEn}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleResetChannel}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title={isAr ? 'إعادة ضبط المنحنى' : 'Reset Curve'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Curve Canvas */}
      <div className="relative w-full aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner select-none cursor-crosshair">
        {/* Histogram Backdrop Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />

        <svg
          ref={svgRef}
          viewBox="0 0 255 255"
          className="w-full h-full"
          onMouseDown={handleSvgMouseDown}
        >
          {/* Grid lines */}
          <line x1="64" y1="0" x2="64" y2="255" stroke="#334155" strokeWidth="0.75" strokeDasharray="2,2" />
          <line x1="128" y1="0" x2="128" y2="255" stroke="#334155" strokeWidth="0.75" strokeDasharray="2,2" />
          <line x1="192" y1="0" x2="192" y2="255" stroke="#334155" strokeWidth="0.75" strokeDasharray="2,2" />
          <line x1="0" y1="64" x2="255" y2="64" stroke="#334155" strokeWidth="0.75" strokeDasharray="2,2" />
          <line x1="0" y1="128" x2="255" y2="128" stroke="#334155" strokeWidth="0.75" strokeDasharray="2,2" />
          <line x1="0" y1="192" x2="255" y2="192" stroke="#334155" strokeWidth="0.75" strokeDasharray="2,2" />

          {/* Neutral 45° reference line */}
          <line x1="0" y1="255" x2="255" y2="0" stroke="#475569" strokeWidth="0.75" />

          {/* Active Channel Curve */}
          <path
            d={generatePathD(currentPoints)}
            fill="none"
            stroke={channelColors[activeChannel].stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Draggable Control Points */}
          {currentPoints.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={255 - pt.y}
              r={draggingIdx === idx ? 6 : 4.5}
              fill={channelColors[activeChannel].stroke}
              stroke="#0f172a"
              strokeWidth="2"
              className="cursor-pointer transition-all hover:scale-125"
              onDoubleClick={(e) => handlePointDoubleClick(idx, e)}
            />
          ))}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>{isAr ? 'الظلال (Shadows)' : 'Shadows'}</span>
        <span>{isAr ? 'المتوسطة (Mids)' : 'Midtones'}</span>
        <span>{isAr ? 'الإضاءة (Highlights)' : 'Highlights'}</span>
      </div>
    </div>
  );
};
