import { PathPoint, PathConfig } from '../types';

/**
 * Generates an SVG path 'd' attribute string from a series of PathPoints.
 * Fully supports straight lines (corner points) and cubic Bézier curves (smooth points with handles).
 */
export function pathPointsToSvgD(points: PathPoint[], closed: boolean): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    const hasPrevHandle = prev.handleOut && (prev.handleOut.x !== 0 || prev.handleOut.y !== 0);
    const hasCurrHandle = curr.handleIn && (curr.handleIn.x !== 0 || curr.handleIn.y !== 0);

    if (hasPrevHandle || hasCurrHandle) {
      const c1x = prev.x + (prev.handleOut ? prev.handleOut.x : 0);
      const c1y = prev.y + (prev.handleOut ? prev.handleOut.y : 0);
      const c2x = curr.x + (curr.handleIn ? curr.handleIn.x : 0);
      const c2y = curr.y + (curr.handleIn ? curr.handleIn.y : 0);
      d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
    } else {
      d += ` L ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
    }
  }

  if (closed && points.length > 1) {
    const prev = points[points.length - 1];
    const curr = points[0];

    const hasPrevHandle = prev.handleOut && (prev.handleOut.x !== 0 || prev.handleOut.y !== 0);
    const hasCurrHandle = curr.handleIn && (curr.handleIn.x !== 0 || curr.handleIn.y !== 0);

    if (hasPrevHandle || hasCurrHandle) {
      const c1x = prev.x + (prev.handleOut ? prev.handleOut.x : 0);
      const c1y = prev.y + (prev.handleOut ? prev.handleOut.y : 0);
      const c2x = curr.x + (curr.handleIn ? curr.handleIn.x : 0);
      const c2y = curr.y + (curr.handleIn ? curr.handleIn.y : 0);
      d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
    } else {
      d += ` L ${curr.x.toFixed(2)} ${curr.y.toFixed(2)}`;
    }
    d += ' Z';
  }

  return d;
}

/**
 * Renders a vector path directly on an HTML5 Canvas 2D context.
 * Used by compositeRenderer for export, thumbnails, and rasterization.
 */
export function renderVectorPathOnCanvas(
  ctx: CanvasRenderingContext2D,
  pathConfig: PathConfig,
  scaleX = 1,
  scaleY = 1
): void {
  const { points, closed, fillColor, strokeColor, strokeWidth, strokeCap, strokeJoin, strokeDashArray } =
    pathConfig;
  if (!points || points.length === 0) return;

  ctx.save();
  ctx.beginPath();

  ctx.moveTo(points[0].x * scaleX, points[0].y * scaleY);

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];

    const hasPrevHandle = prev.handleOut && (prev.handleOut.x !== 0 || prev.handleOut.y !== 0);
    const hasCurrHandle = curr.handleIn && (curr.handleIn.x !== 0 || curr.handleIn.y !== 0);

    if (hasPrevHandle || hasCurrHandle) {
      const c1x = (prev.x + (prev.handleOut ? prev.handleOut.x : 0)) * scaleX;
      const c1y = (prev.y + (prev.handleOut ? prev.handleOut.y : 0)) * scaleY;
      const c2x = (curr.x + (curr.handleIn ? curr.handleIn.x : 0)) * scaleX;
      const c2y = (curr.y + (curr.handleIn ? curr.handleIn.y : 0)) * scaleY;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, curr.x * scaleX, curr.y * scaleY);
    } else {
      ctx.lineTo(curr.x * scaleX, curr.y * scaleY);
    }
  }

  if (closed && points.length > 1) {
    const prev = points[points.length - 1];
    const curr = points[0];

    const hasPrevHandle = prev.handleOut && (prev.handleOut.x !== 0 || prev.handleOut.y !== 0);
    const hasCurrHandle = curr.handleIn && (curr.handleIn.x !== 0 || curr.handleIn.y !== 0);

    if (hasPrevHandle || hasCurrHandle) {
      const c1x = (prev.x + (prev.handleOut ? prev.handleOut.x : 0)) * scaleX;
      const c1y = (prev.y + (prev.handleOut ? prev.handleOut.y : 0)) * scaleY;
      const c2x = (curr.x + (curr.handleIn ? curr.handleIn.x : 0)) * scaleX;
      const c2y = (curr.y + (curr.handleIn ? curr.handleIn.y : 0)) * scaleY;
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, curr.x * scaleX, curr.y * scaleY);
    } else {
      ctx.lineTo(curr.x * scaleX, curr.y * scaleY);
    }
    ctx.closePath();
  }

  // Fill
  if (fillColor && fillColor !== 'transparent' && fillColor !== 'none') {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }

  // Stroke
  if (strokeColor && strokeColor !== 'transparent' && strokeColor !== 'none' && strokeWidth > 0) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth * ((scaleX + scaleY) / 2);
    ctx.lineCap = strokeCap || 'round';
    ctx.lineJoin = strokeJoin || 'round';
    if (strokeDashArray) {
      const dashes = strokeDashArray
        .split(/[\s,]+/)
        .map(Number)
        .filter((n) => !isNaN(n));
      ctx.setLineDash(dashes);
    }
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Creates a new PathPoint with unique ID and initialized values.
 */
export function createPathPoint(
  x: number,
  y: number,
  type: 'corner' | 'smooth' | 'symmetric' = 'corner'
): PathPoint {
  return {
    id: 'pt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10,
    handleIn: null,
    handleOut: null,
    type,
  };
}

/**
 * Checks if point (x1, y1) is within distance threshold of (x2, y2).
 */
export function isPointNear(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius = 10
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  return dx * dx + dy * dy <= radius * radius;
}

/**
 * Calculates tight bounding box of all anchor points and control handles.
 */
export function calculatePathBounds(points: PathPoint[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} {
  if (!points || points.length === 0) {
    return { minX: 0, minY: 0, maxX: 100, maxY: 100, width: 100, height: 100 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  points.forEach((p) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);

    if (p.handleIn) {
      minX = Math.min(minX, p.x + p.handleIn.x);
      minY = Math.min(minY, p.y + p.handleIn.y);
      maxX = Math.max(maxX, p.x + p.handleIn.x);
      maxY = Math.max(maxY, p.y + p.handleIn.y);
    }
    if (p.handleOut) {
      minX = Math.min(minX, p.x + p.handleOut.x);
      minY = Math.min(minY, p.y + p.handleOut.y);
      maxX = Math.max(maxX, p.x + p.handleOut.x);
      maxY = Math.max(maxY, p.y + p.handleOut.y);
    }
  });

  // Ensure minimum dimensions
  const width = Math.max(20, Math.round(maxX - minX));
  const height = Math.max(20, Math.round(maxY - minY));

  return {
    minX: Math.round(minX),
    minY: Math.round(minY),
    maxX: Math.round(maxX),
    maxY: Math.round(maxY),
    width,
    height,
  };
}

/**
 * Computes cubic bezier point at parameter t in [0, 1].
 */
function cubicBezierPoint(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number {
  const mt = 1 - t;
  return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

/**
 * Finds if a point (x, y) is near any segment between points.
 * If found, returns the segment index and closest projected coordinates to insert a new point.
 */
export function findSegmentNear(
  points: PathPoint[],
  closed: boolean,
  x: number,
  y: number,
  tolerance = 8
): { index: number; insertX: number; insertY: number } | null {
  if (!points || points.length < 2) return null;

  const segmentCount = closed ? points.length : points.length - 1;

  for (let i = 0; i < segmentCount; i++) {
    const pA = points[i];
    const pB = points[(i + 1) % points.length];

    const hasCurve =
      (pA.handleOut && (pA.handleOut.x !== 0 || pA.handleOut.y !== 0)) ||
      (pB.handleIn && (pB.handleIn.x !== 0 || pB.handleIn.y !== 0));

    if (hasCurve) {
      const c1x = pA.x + (pA.handleOut ? pA.handleOut.x : 0);
      const c1y = pA.y + (pA.handleOut ? pA.handleOut.y : 0);
      const c2x = pB.x + (pB.handleIn ? pB.handleIn.x : 0);
      const c2y = pB.y + (pB.handleIn ? pB.handleIn.y : 0);

      // Sample curve in 20 steps
      for (let step = 0; step <= 20; step++) {
        const t = step / 20;
        const bx = cubicBezierPoint(pA.x, c1x, c2x, pB.x, t);
        const by = cubicBezierPoint(pA.y, c1y, c2y, pB.y, t);

        if (isPointNear(x, y, bx, by, tolerance)) {
          return { index: i + 1, insertX: Math.round(bx), insertY: Math.round(by) };
        }
      }
    } else {
      // Straight line segment: distance from point (x, y) to line segment (pA, pB)
      const dx = pB.x - pA.x;
      const dy = pB.y - pA.y;
      const lenSq = dx * dx + dy * dy;

      if (lenSq === 0) continue;

      // Project point onto line segment
      let t = ((x - pA.x) * dx + (y - pA.y) * dy) / lenSq;
      t = Math.max(0.05, Math.min(0.95, t));

      const projX = pA.x + t * dx;
      const projY = pA.y + t * dy;

      if (isPointNear(x, y, projX, projY, tolerance)) {
        return { index: i + 1, insertX: Math.round(projX), insertY: Math.round(projY) };
      }
    }
  }

  return null;
}

/**
 * Transforms an array of PathPoints by an affine 2D transformation matrix:
 * Translation, Scale, Rotation around pivot, Skew, and Flip.
 * Transforms both anchor points and direction handles preserving complete vector editability.
 */
export function transformPathPoints(
  points: PathPoint[],
  transform: {
    deltaX?: number;
    deltaY?: number;
    scaleX?: number;
    scaleY?: number;
    rotationDeg?: number;
    skewXDeg?: number;
    skewYDeg?: number;
    flipHorizontal?: boolean;
    flipVertical?: boolean;
    pivotX?: number;
    pivotY?: number;
  }
): PathPoint[] {
  if (!points || points.length === 0) return [];

  const {
    deltaX = 0,
    deltaY = 0,
    scaleX = 1,
    scaleY = 1,
    rotationDeg = 0,
    skewXDeg = 0,
    skewYDeg = 0,
    flipHorizontal = false,
    flipVertical = false,
    pivotX = 0,
    pivotY = 0,
  } = transform;

  const rad = (rotationDeg * Math.PI) / 180;
  const cosR = Math.cos(rad);
  const sinR = Math.sin(rad);
  const tanX = Math.tan((skewXDeg * Math.PI) / 180);
  const tanY = Math.tan((skewYDeg * Math.PI) / 180);
  const flipX = flipHorizontal ? -1 : 1;
  const flipY = flipVertical ? -1 : 1;

  // Linear transformation for relative offset vectors (handles)
  const transformVector = (vx: number, vy: number): { x: number; y: number } => {
    // 1. Flip
    let fx = vx * flipX;
    let fy = vy * flipY;
    // 2. Skew
    const sx = fx + fy * tanX;
    const sy = fy + fx * tanY;
    // 3. Scale
    const scx = sx * scaleX;
    const scy = sy * scaleY;
    // 4. Rotate
    const rx = cosR * scx - sinR * scy;
    const ry = sinR * scx + cosR * scy;
    return {
      x: Math.round(rx * 10) / 10,
      y: Math.round(ry * 10) / 10,
    };
  };

  // Full affine transformation for absolute anchor points
  const transformPoint = (px: number, py: number): { x: number; y: number } => {
    // Offset to pivot
    const ox = px - pivotX;
    const oy = py - pivotY;

    // Linear transform
    let fx = ox * flipX;
    let fy = oy * flipY;
    const sx = fx + fy * tanX;
    const sy = fy + fx * tanY;
    const scx = sx * scaleX;
    const scy = sy * scaleY;
    const rx = cosR * scx - sinR * scy;
    const ry = sinR * scx + cosR * scy;

    // Re-apply pivot and add translation
    return {
      x: Math.round((rx + pivotX + deltaX) * 10) / 10,
      y: Math.round((ry + pivotY + deltaY) * 10) / 10,
    };
  };

  return points.map((p) => {
    const newPt = transformPoint(p.x, p.y);
    const newHandleIn = p.handleIn ? transformVector(p.handleIn.x, p.handleIn.y) : null;
    const newHandleOut = p.handleOut ? transformVector(p.handleOut.x, p.handleOut.y) : null;

    return {
      ...p,
      x: newPt.x,
      y: newPt.y,
      handleIn: newHandleIn,
      handleOut: newHandleOut,
    };
  });
}

/**
 * Calculates optimal smooth tangent handles for point i based on adjacent points.
 */
export function calculateTangentHandles(
  points: PathPoint[],
  pointIndex: number,
  closed: boolean
): { handleIn: { x: number; y: number }; handleOut: { x: number; y: number } } {
  const n = points.length;
  if (n <= 1) {
    return { handleIn: { x: -30, y: 0 }, handleOut: { x: 30, y: 0 } };
  }

  const curr = points[pointIndex];
  let prev = pointIndex > 0 ? points[pointIndex - 1] : closed ? points[n - 1] : null;
  let next = pointIndex < n - 1 ? points[pointIndex + 1] : closed ? points[0] : null;

  let dirX = 0;
  let dirY = 0;

  if (prev && next) {
    // Direction from previous to next
    dirX = next.x - prev.x;
    dirY = next.y - prev.y;
  } else if (next) {
    dirX = next.x - curr.x;
    dirY = next.y - curr.y;
  } else if (prev) {
    dirX = curr.x - prev.x;
    dirY = curr.y - prev.y;
  }

  const len = Math.hypot(dirX, dirY);
  if (len === 0) {
    return { handleIn: { x: -30, y: 0 }, handleOut: { x: 30, y: 0 } };
  }

  // Desired handle length (approximately 1/3 of segment length, clamped between 15 and 80)
  const distPrev = prev ? Math.hypot(curr.x - prev.x, curr.y - prev.y) : 60;
  const distNext = next ? Math.hypot(next.x - curr.x, next.y - curr.y) : 60;
  const hInLen = Math.max(15, Math.min(80, distPrev * 0.3));
  const hOutLen = Math.max(15, Math.min(80, distNext * 0.3));

  const uX = dirX / len;
  const uY = dirY / len;

  return {
    handleIn: { x: Math.round(-uX * hInLen), y: Math.round(-uY * hInLen) },
    handleOut: { x: Math.round(uX * hOutLen), y: Math.round(uY * hOutLen) },
  };
}

/**
 * Reverses path direction, flipping handleIn and handleOut.
 */
export function reversePathPoints(points: PathPoint[]): PathPoint[] {
  if (!points || points.length <= 1) return points || [];
  return [...points].reverse().map((p) => ({
    ...p,
    handleIn: p.handleOut ? { x: -p.handleOut.x, y: -p.handleOut.y } : null,
    handleOut: p.handleIn ? { x: -p.handleIn.x, y: -p.handleIn.y } : null,
  }));
}

/**
 * Centers path points in a canvas of width and height.
 */
export function centerPathPoints(
  points: PathPoint[],
  canvasWidth: number,
  canvasHeight: number
): PathPoint[] {
  const bounds = calculatePathBounds(points);
  const pathCenterX = bounds.minX + bounds.width / 2;
  const pathCenterY = bounds.minY + bounds.height / 2;
  const dx = Math.round(canvasWidth / 2 - pathCenterX);
  const dy = Math.round(canvasHeight / 2 - pathCenterY);

  return points.map((p) => ({
    ...p,
    x: p.x + dx,
    y: p.y + dy,
  }));
}

/**
 * Rasterizes vector path into an offscreen canvas and returns an image DataURL
 * suitable for use as a layer mask.
 */
export function rasterizePathToMask(
  canvasWidth: number,
  canvasHeight: number,
  pathConfig: PathConfig
): string | null {
  if (!pathConfig.points || pathConfig.points.length < 2) return null;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, canvasWidth);
  canvas.height = Math.max(1, canvasHeight);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Solid black background (masked out)
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fill path with solid white (visible)
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  const pts = pathConfig.points;
  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const hasPrevH = prev.handleOut && (prev.handleOut.x !== 0 || prev.handleOut.y !== 0);
    const hasCurrH = curr.handleIn && (curr.handleIn.x !== 0 || curr.handleIn.y !== 0);

    if (hasPrevH || hasCurrH) {
      const c1x = prev.x + (prev.handleOut?.x || 0);
      const c1y = prev.y + (prev.handleOut?.y || 0);
      const c2x = curr.x + (curr.handleIn?.x || 0);
      const c2y = curr.y + (curr.handleIn?.y || 0);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, curr.x, curr.y);
    } else {
      ctx.lineTo(curr.x, curr.y);
    }
  }

  if (pts.length > 2) {
    const prev = pts[pts.length - 1];
    const curr = pts[0];
    const hasPrevH = prev.handleOut && (prev.handleOut.x !== 0 || prev.handleOut.y !== 0);
    const hasCurrH = curr.handleIn && (curr.handleIn.x !== 0 || curr.handleIn.y !== 0);

    if (hasPrevH || hasCurrH) {
      const c1x = prev.x + (prev.handleOut?.x || 0);
      const c1y = prev.y + (prev.handleOut?.y || 0);
      const c2x = curr.x + (curr.handleIn?.x || 0);
      const c2y = curr.y + (curr.handleIn?.y || 0);
      ctx.bezierCurveTo(c1x, c1y, c2x, c2y, curr.x, curr.y);
    } else {
      ctx.lineTo(curr.x, curr.y);
    }
    ctx.closePath();
  }

  ctx.fill();

  return canvas.toDataURL('image/png');
}
