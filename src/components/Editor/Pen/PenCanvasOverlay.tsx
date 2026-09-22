import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Layer, PathConfig, PathPoint } from '../../../types';
import {
  pathPointsToSvgD,
  createPathPoint,
  isPointNear,
  findSegmentNear,
  calculateTangentHandles,
} from '../../../utils/vectorPath';

interface PenCanvasOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  activePathLayer: Layer | null;
  onUpdateActivePath: (updatedConfig: PathConfig, isCompleted?: boolean) => void;
  onCreateNewPathLayer: (initialPoint: PathPoint) => void;
  onDeleteSelectedPoint?: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
  selectedPointId: string | null;
  setSelectedPointId: (id: string | null) => void;
}

export const PenCanvasOverlay: React.FC<PenCanvasOverlayProps> = ({
  canvasWidth,
  canvasHeight,
  zoom,
  activePathLayer,
  onUpdateActivePath,
  onCreateNewPathLayer,
  language,
  darkMode,
  selectedPointId,
  setSelectedPointId,
}) => {
  const isAr = language === 'ar';
  const overlayRef = useRef<SVGSVGElement | null>(null);

  // Interaction states
  const [dragMode, setDragMode] = useState<
    | null
    | { type: 'point'; pointId: string; startCanvasX: number; startCanvasY: number; origX: number; origY: number }
    | { type: 'handle'; pointId: string; handleType: 'in' | 'out'; startCanvasX: number; startCanvasY: number }
    | { type: 'new_point_curve'; pointId: string; startCanvasX: number; startCanvasY: number }
  >(null);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isHoveringPoint0, setIsHoveringPoint0] = useState(false);
  const [segmentHover, setSegmentHover] = useState<{ index: number; insertX: number; insertY: number } | null>(null);
  const [isAltPressed, setIsAltPressed] = useState(false);

  // Track Alt key for breaking handle symmetry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setIsAltPressed(true);
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedPointId && activePathLayer?.pathConfig) {
        // Delete selected point
        const currentPoints = activePathLayer.pathConfig.points;
        if (currentPoints.length > 1) {
          const newPoints = currentPoints.filter((p) => p.id !== selectedPointId);
          onUpdateActivePath({
            ...activePathLayer.pathConfig,
            points: newPoints,
          });
          setSelectedPointId(newPoints[newPoints.length - 1]?.id || null);
        }
      }
      if (e.key === 'Enter' || e.key === 'Escape') {
        setSelectedPointId(null);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setIsAltPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedPointId, activePathLayer, onUpdateActivePath, setSelectedPointId]);

  // Coordinate conversion helper: client mouse coords -> SVG local canvas coords
  const getCanvasCoords = useCallback((e: React.PointerEvent | PointerEvent) => {
    if (!overlayRef.current) return { x: 0, y: 0 };
    const rect = overlayRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    return {
      x: Math.max(0, Math.min(canvasWidth, x)),
      y: Math.max(0, Math.min(canvasHeight, y)),
    };
  }, [zoom, canvasWidth, canvasHeight]);

  const points = activePathLayer?.pathConfig?.points || [];
  const isClosed = activePathLayer?.pathConfig?.closed || false;
  const selectedPoint = points.find((p) => p.id === selectedPointId) || null;

  // Handle pointer down on the overlay
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only main left mouse button
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);

    const { x, y } = getCanvasCoords(e);
    const hitTolerance = Math.max(8, 12 / zoom);

    // 1. Check if clicking on a Bézier handle of the selected point FIRST (highest priority)
    if (selectedPoint) {
      if (selectedPoint.handleOut && (selectedPoint.handleOut.x !== 0 || selectedPoint.handleOut.y !== 0)) {
        const hOutX = selectedPoint.x + selectedPoint.handleOut.x;
        const hOutY = selectedPoint.y + selectedPoint.handleOut.y;
        if (isPointNear(x, y, hOutX, hOutY, hitTolerance)) {
          setDragMode({
            type: 'handle',
            pointId: selectedPoint.id,
            handleType: 'out',
            startCanvasX: x,
            startCanvasY: y,
          });
          return;
        }
      }
      if (selectedPoint.handleIn && (selectedPoint.handleIn.x !== 0 || selectedPoint.handleIn.y !== 0)) {
        const hInX = selectedPoint.x + selectedPoint.handleIn.x;
        const hInY = selectedPoint.y + selectedPoint.handleIn.y;
        if (isPointNear(x, y, hInX, hInY, hitTolerance)) {
          setDragMode({
            type: 'handle',
            pointId: selectedPoint.id,
            handleType: 'in',
            startCanvasX: x,
            startCanvasY: y,
          });
          return;
        }
      }
    }

    // 2. Check if clicking on an existing anchor point
    if (points.length > 0) {
      // If clicking first point when path is open and has >= 3 points: CLOSE PATH!
      if (!isClosed && points.length >= 3 && isPointNear(x, y, points[0].x, points[0].y, hitTolerance)) {
        onUpdateActivePath(
          {
            ...activePathLayer!.pathConfig!,
            closed: true,
            isDraft: false,
          },
          true
        );
        setSelectedPointId(points[0].id);
        return;
      }

      // Check if clicking any anchor point
      const clickedIdx = points.findIndex((p) => isPointNear(x, y, p.x, p.y, hitTolerance));
      if (clickedIdx !== -1) {
        const clickedPoint = points[clickedIdx];
        setSelectedPointId(clickedPoint.id);

        if (e.altKey) {
          // Alt+Click toggles between corner and smooth with natural tangent calculation
          const isSmooth = clickedPoint.type === 'smooth';
          const newType = isSmooth ? 'corner' : 'smooth';
          const tangent = !isSmooth
            ? calculateTangentHandles(points, clickedIdx, isClosed)
            : { handleIn: null, handleOut: null };

          const updatedPoints = points.map((p, idx) => {
            if (idx !== clickedIdx) return p;
            return {
              ...p,
              type: newType as 'corner' | 'smooth',
              handleIn: tangent.handleIn,
              handleOut: tangent.handleOut,
            };
          });

          onUpdateActivePath({
            ...activePathLayer!.pathConfig!,
            points: updatedPoints,
          });
        }

        setDragMode({
          type: 'point',
          pointId: clickedPoint.id,
          startCanvasX: x,
          startCanvasY: y,
          origX: clickedPoint.x,
          origY: clickedPoint.y,
        });
        return;
      }

      // 3. Check if clicking on an existing segment to insert a point
      const nearSegment = findSegmentNear(points, isClosed, x, y, hitTolerance);
      if (nearSegment) {
        const newPt = createPathPoint(nearSegment.insertX, nearSegment.insertY, 'smooth');
        const newPoints = [...points];
        newPoints.splice(nearSegment.index, 0, newPt);
        // Calculate smooth tangents for the inserted point
        const tangents = calculateTangentHandles(newPoints, nearSegment.index, isClosed);
        newPoints[nearSegment.index] = {
          ...newPt,
          handleIn: tangents.handleIn,
          handleOut: tangents.handleOut,
        };

        onUpdateActivePath({
          ...activePathLayer!.pathConfig!,
          points: newPoints,
        });
        setSelectedPointId(newPt.id);
        setDragMode({
          type: 'point',
          pointId: newPt.id,
          startCanvasX: x,
          startCanvasY: y,
          origX: newPt.x,
          origY: newPt.y,
        });
        return;
      }
    }

    // 4. Clicked on empty area
    if (activePathLayer && activePathLayer.pathConfig && !activePathLayer.pathConfig.closed) {
      // Append point to open path
      const newPoint = createPathPoint(x, y, 'corner');
      const updatedPoints = [...points, newPoint];
      onUpdateActivePath({
        ...activePathLayer.pathConfig,
        points: updatedPoints,
      });
      setSelectedPointId(newPoint.id);
      setDragMode({
        type: 'new_point_curve',
        pointId: newPoint.id,
        startCanvasX: x,
        startCanvasY: y,
      });
    } else {
      // Start a brand new path layer
      const firstPoint = createPathPoint(x, y, 'corner');
      onCreateNewPathLayer(firstPoint);
      setSelectedPointId(firstPoint.id);
      setDragMode({
        type: 'new_point_curve',
        pointId: firstPoint.id,
        startCanvasX: x,
        startCanvasY: y,
      });
    }
  };

  // Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    const { x, y } = getCanvasCoords(e);
    setMousePos({ x, y });

    // When dragging an anchor point
    if (dragMode?.type === 'point' && activePathLayer?.pathConfig) {
      let dx = x - dragMode.startCanvasX;
      let dy = y - dragMode.startCanvasY;

      // Shift constraint: lock to horizontal or vertical movement
      if (e.shiftKey) {
        if (Math.abs(dx) > Math.abs(dy)) {
          dy = 0;
        } else {
          dx = 0;
        }
      }

      const updatedPoints = activePathLayer.pathConfig.points.map((p) => {
        if (p.id !== dragMode.pointId) return p;
        return {
          ...p,
          x: Math.round(dragMode.origX + dx),
          y: Math.round(dragMode.origY + dy),
        };
      });
      onUpdateActivePath({
        ...activePathLayer.pathConfig,
        points: updatedPoints,
      });
      return;
    }

    // When dragging a Bézier handle grip
    if (dragMode?.type === 'handle' && activePathLayer?.pathConfig) {
      const targetPoint = activePathLayer.pathConfig.points.find((p) => p.id === dragMode.pointId);
      if (!targetPoint) return;

      let deltaX = x - targetPoint.x;
      let deltaY = y - targetPoint.y;

      // Shift constraint: Snap angle to 45 deg intervals
      if (e.shiftKey) {
        const angle = Math.atan2(deltaY, deltaX);
        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
        const dist = Math.hypot(deltaX, deltaY);
        deltaX = Math.round(Math.cos(snappedAngle) * dist);
        deltaY = Math.round(Math.sin(snappedAngle) * dist);
      }

      const isBreakingSymmetry = isAltPressed || e.altKey;

      const updatedPoints = activePathLayer.pathConfig.points.map((p) => {
        if (p.id !== dragMode.pointId) return p;

        if (dragMode.handleType === 'out') {
          // If breaking symmetry with Alt, convert point to independent handles
          const nextType = isBreakingSymmetry ? 'corner' : p.type;
          let nextHandleIn = p.handleIn;

          if (!isBreakingSymmetry && p.type === 'smooth') {
            // Keep opposite handle collinear (180 deg opposite)
            const angle = Math.atan2(deltaY, deltaX);
            const oppAngle = angle + Math.PI;
            const oppDist = p.handleIn ? Math.hypot(p.handleIn.x, p.handleIn.y) : Math.hypot(deltaX, deltaY);
            nextHandleIn = {
              x: Math.round(Math.cos(oppAngle) * oppDist),
              y: Math.round(Math.sin(oppAngle) * oppDist),
            };
          }

          return {
            ...p,
            type: nextType as 'corner' | 'smooth',
            handleOut: { x: Math.round(deltaX), y: Math.round(deltaY) },
            handleIn: nextHandleIn,
          };
        } else {
          // In handle
          const nextType = isBreakingSymmetry ? 'corner' : p.type;
          let nextHandleOut = p.handleOut;

          if (!isBreakingSymmetry && p.type === 'smooth') {
            // Keep opposite handle collinear
            const angle = Math.atan2(deltaY, deltaX);
            const oppAngle = angle + Math.PI;
            const oppDist = p.handleOut ? Math.hypot(p.handleOut.x, p.handleOut.y) : Math.hypot(deltaX, deltaY);
            nextHandleOut = {
              x: Math.round(Math.cos(oppAngle) * oppDist),
              y: Math.round(Math.sin(oppAngle) * oppDist),
            };
          }

          return {
            ...p,
            type: nextType as 'corner' | 'smooth',
            handleIn: { x: Math.round(deltaX), y: Math.round(deltaY) },
            handleOut: nextHandleOut,
          };
        }
      });

      onUpdateActivePath({
        ...activePathLayer.pathConfig,
        points: updatedPoints,
      });
      return;
    }

    // When creating a new point with drag-to-curve
    if (dragMode?.type === 'new_point_curve' && activePathLayer?.pathConfig) {
      let dx = x - dragMode.startCanvasX;
      let dy = y - dragMode.startCanvasY;

      if (e.shiftKey) {
        const angle = Math.atan2(dy, dx);
        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
        const dist = Math.hypot(dx, dy);
        dx = Math.round(Math.cos(snappedAngle) * dist);
        dy = Math.round(Math.sin(snappedAngle) * dist);
      }

      if (Math.hypot(dx, dy) > 3) {
        const updatedPoints = activePathLayer.pathConfig.points.map((p) => {
          if (p.id !== dragMode.pointId) return p;
          return {
            ...p,
            type: 'smooth' as const,
            handleOut: { x: Math.round(dx), y: Math.round(dy) },
            handleIn: { x: -Math.round(dx), y: -Math.round(dy) },
          };
        });
        onUpdateActivePath({
          ...activePathLayer.pathConfig,
          points: updatedPoints,
        });
      }
      return;
    }

    // Hover detection for closing path
    if (!isClosed && points.length >= 3) {
      const isNear0 = isPointNear(x, y, points[0].x, points[0].y, Math.max(10, 14 / zoom));
      setIsHoveringPoint0(isNear0);
    } else {
      setIsHoveringPoint0(false);
    }

    // Hover detection for segment insertion
    if (!dragMode && points.length >= 2) {
      const seg = findSegmentNear(points, isClosed, x, y, Math.max(8, 10 / zoom));
      setSegmentHover(seg);
    } else {
      setSegmentHover(null);
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragMode) {
      (e.target as Element).releasePointerCapture?.(e.pointerId);
      setDragMode(null);
    }
  };

  // SVG Path String
  const svgD = pathPointsToSvgD(points, isClosed);
  const lastPoint = points.length > 0 ? points[points.length - 1] : null;

  return (
    <svg
      ref={overlayRef}
      id="pixelora-pen-overlay"
      className="absolute inset-0 w-full h-full pointer-events-auto select-none z-30"
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      style={{ cursor: isHoveringPoint0 ? 'crosshair' : segmentHover ? 'copy' : 'crosshair' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => {
        setMousePos(null);
        setIsHoveringPoint0(false);
        setSegmentHover(null);
      }}
    >
      <defs>
        {/* Subtle glow filter for high-contrast visibility */}
        <filter id="pen-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000000" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* 1. Underlying path halo for visibility over dark/light canvases */}
      {svgD && (
        <path
          d={svgD}
          fill="none"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth={Math.max(2, 4 / zoom)}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none"
        />
      )}

      {/* 2. Main active path line */}
      {svgD && (
        <path
          d={svgD}
          fill={isClosed && activePathLayer?.pathConfig?.fillColor !== 'transparent' ? activePathLayer?.pathConfig?.fillColor : 'none'}
          stroke="#6C4DFF"
          strokeWidth={Math.max(1.5, 2 / zoom)}
          strokeDasharray={isClosed ? undefined : '4 2'}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none"
          filter="url(#pen-glow)"
        />
      )}

      {/* 3. Rubber-band line from last anchor point to current cursor position */}
      {!isClosed && lastPoint && mousePos && !dragMode && (
        <line
          x1={lastPoint.x}
          y1={lastPoint.y}
          x2={isHoveringPoint0 ? points[0].x : mousePos.x}
          y2={isHoveringPoint0 ? points[0].y : mousePos.y}
          stroke="#2DD4BF"
          strokeWidth={Math.max(1, 1.5 / zoom)}
          strokeDasharray="4 3"
          className="pointer-events-none"
        />
      )}

      {/* 4. Segment insert hover preview point */}
      {segmentHover && !dragMode && (
        <g className="pointer-events-none animate-pulse">
          <circle
            cx={segmentHover.insertX}
            cy={segmentHover.insertY}
            r={Math.max(4, 6 / zoom)}
            fill="#23B5D3"
            stroke="#FFFFFF"
            strokeWidth={Math.max(1, 2 / zoom)}
          />
        </g>
      )}

      {/* 5. Bézier Handles for the Selected Point */}
      {selectedPoint && (
        <g className="pointer-events-none">
          {/* Outgoing Handle Line & Grip */}
          {selectedPoint.handleOut && (selectedPoint.handleOut.x !== 0 || selectedPoint.handleOut.y !== 0) && (
            <g>
              <line
                x1={selectedPoint.x}
                y1={selectedPoint.y}
                x2={selectedPoint.x + selectedPoint.handleOut.x}
                y2={selectedPoint.y + selectedPoint.handleOut.y}
                stroke="#23B5D3"
                strokeWidth={Math.max(1, 1.5 / zoom)}
              />
              <circle
                cx={selectedPoint.x + selectedPoint.handleOut.x}
                cy={selectedPoint.y + selectedPoint.handleOut.y}
                r={Math.max(3.5, 5 / zoom)}
                fill="#23B5D3"
                stroke="#FFFFFF"
                strokeWidth={Math.max(1, 1.5 / zoom)}
                className="cursor-pointer pointer-events-auto"
              />
            </g>
          )}

          {/* Incoming Handle Line & Grip */}
          {selectedPoint.handleIn && (selectedPoint.handleIn.x !== 0 || selectedPoint.handleIn.y !== 0) && (
            <g>
              <line
                x1={selectedPoint.x}
                y1={selectedPoint.y}
                x2={selectedPoint.x + selectedPoint.handleIn.x}
                y2={selectedPoint.y + selectedPoint.handleIn.y}
                stroke="#23B5D3"
                strokeWidth={Math.max(1, 1.5 / zoom)}
              />
              <circle
                cx={selectedPoint.x + selectedPoint.handleIn.x}
                cy={selectedPoint.y + selectedPoint.handleIn.y}
                r={Math.max(3.5, 5 / zoom)}
                fill="#23B5D3"
                stroke="#FFFFFF"
                strokeWidth={Math.max(1, 1.5 / zoom)}
                className="cursor-pointer pointer-events-auto"
              />
            </g>
          )}
        </g>
      )}

      {/* 6. Anchor Points */}
      {points.map((pt, idx) => {
        const isSelected = pt.id === selectedPointId;
        const isFirstPoint = idx === 0;
        const ptSize = Math.max(6, 8 / zoom);
        const halfSize = ptSize / 2;

        return (
          <g key={pt.id} className="cursor-pointer">
            {/* Pulsing ring for Point 0 when ready to close path */}
            {isFirstPoint && !isClosed && points.length >= 3 && isHoveringPoint0 && (
              <circle
                cx={pt.x}
                cy={pt.y}
                r={Math.max(10, 14 / zoom)}
                fill="none"
                stroke="#2DD4BF"
                strokeWidth={Math.max(2, 3 / zoom)}
                strokeDasharray="3 3"
                className="animate-spin"
                style={{ transformOrigin: `${pt.x}px ${pt.y}px` }}
              />
            )}

            {/* Anchor point marker (square with rounded edge) */}
            <rect
              x={pt.x - halfSize}
              y={pt.y - halfSize}
              width={ptSize}
              height={ptSize}
              rx={Math.max(1, 2 / zoom)}
              fill={isSelected ? '#6C4DFF' : '#FFFFFF'}
              stroke={isSelected ? '#FFFFFF' : '#6C4DFF'}
              strokeWidth={Math.max(1.5, 2 / zoom)}
              filter="url(#pen-glow)"
              className="transition-transform duration-75 hover:scale-125"
            />
          </g>
        );
      })}

      {/* 7. Close Path Indicator Badge next to cursor */}
      {isHoveringPoint0 && mousePos && (
        <g
          transform={`translate(${mousePos.x + 14 / zoom}, ${mousePos.y + 14 / zoom})`}
          className="pointer-events-none select-none"
        >
          <rect
            x={0}
            y={-14 / zoom}
            width={isAr ? 75 / zoom : 70 / zoom}
            height={20 / zoom}
            rx={4 / zoom}
            fill="#121A33"
            stroke="#2DD4BF"
            strokeWidth={1 / zoom}
            opacity={0.9}
          />
          <text
            x={isAr ? 38 / zoom : 35 / zoom}
            y={-1 / zoom}
            fill="#FFFFFF"
            fontSize={10 / zoom}
            fontWeight="bold"
            textAnchor="middle"
          >
            {isAr ? 'إغلاق المسار' : 'Close Path'}
          </text>
        </g>
      )}
    </svg>
  );
};
