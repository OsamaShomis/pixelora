import { ShapeConfig, ShapeType } from '../types';

/**
 * Returns SVG path / elements for rendering any ShapeType in React / SVG
 */
export function getShapeSvgContent(
  shapeType: ShapeType,
  width: number,
  height: number,
  fillColor: string = '#6C4DFF',
  strokeColor: string = '#4B32C3',
  strokeWidth: number = 2,
  borderRadius: number = 16
) {
  const fill = fillColor && fillColor !== 'transparent' ? fillColor : 'none';
  const stroke = strokeColor || 'none';
  const sw = strokeWidth || 0;
  const w = Math.max(10, width);
  const h = Math.max(10, height);

  switch (shapeType) {
    case 'rectangle':
      return {
        type: 'rect',
        props: { x: 0, y: 0, width: w, height: h, rx: 0, fill, stroke, strokeWidth: sw },
      };

    case 'rounded_rectangle':
      return {
        type: 'rect',
        props: { x: 0, y: 0, width: w, height: h, rx: borderRadius || 16, fill, stroke, strokeWidth: sw },
      };

    case 'circle':
    case 'ellipse':
      return {
        type: 'ellipse',
        props: { cx: w / 2, cy: h / 2, rx: w / 2, ry: h / 2, fill, stroke, strokeWidth: sw },
      };

    case 'triangle': {
      const points = `${w / 2},${sw / 2} ${w - sw / 2},${h - sw / 2} ${sw / 2},${h - sw / 2}`;
      return {
        type: 'polygon',
        props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' },
      };
    }

    case 'diamond': {
      const points = `${w / 2},0 ${w},${h / 2} ${w / 2},${h} 0,${h / 2}`;
      return {
        type: 'polygon',
        props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' },
      };
    }

    case 'pentagon': {
      const points = Array.from({ length: 5 })
        .map((_, i) => {
          const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const px = w / 2 + (w / 2 - sw) * Math.cos(angle);
          const py = h / 2 + (h / 2 - sw) * Math.sin(angle);
          return `${px},${py}`;
        })
        .join(' ');
      return {
        type: 'polygon',
        props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' },
      };
    }

    case 'hexagon': {
      const points = Array.from({ length: 6 })
        .map((_, i) => {
          const angle = (i * 2 * Math.PI) / 6;
          const px = w / 2 + (w / 2 - sw) * Math.cos(angle);
          const py = h / 2 + (h / 2 - sw) * Math.sin(angle);
          return `${px},${py}`;
        })
        .join(' ');
      return {
        type: 'polygon',
        props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' },
      };
    }

    case 'octagon': {
      const points = Array.from({ length: 8 })
        .map((_, i) => {
          const angle = (i * 2 * Math.PI) / 8 + Math.PI / 8;
          const px = w / 2 + (w / 2 - sw) * Math.cos(angle);
          const py = h / 2 + (h / 2 - sw) * Math.sin(angle);
          return `${px},${py}`;
        })
        .join(' ');
      return {
        type: 'polygon',
        props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' },
      };
    }

    case 'trapezoid': {
      const inset = w * 0.2;
      const points = `${inset},0 ${w - inset},0 ${w},${h} 0,${h}`;
      return {
        type: 'polygon',
        props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' },
      };
    }

    case 'parallelogram': {
      const slant = w * 0.25;
      const points = `${slant},0 ${w},0 ${w - slant},${h} 0,${h}`;
      return {
        type: 'polygon',
        props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' },
      };
    }

    case 'star': {
      const points = Array.from({ length: 10 })
        .map((_, i) => {
          const r = i % 2 === 0 ? w / 2 - sw : (w / 2 - sw) * 0.45;
          const angle = (i * Math.PI) / 5 - Math.PI / 2;
          return `${w / 2 + r * Math.cos(angle)},${h / 2 + r * Math.sin(angle)}`;
        })
        .join(' ');
      return {
        type: 'polygon',
        props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' },
      };
    }

    case 'line': {
      return {
        type: 'line',
        props: { x1: 0, y1: h / 2, x2: w, y2: h / 2, stroke, strokeWidth: Math.max(2, sw) },
      };
    }

    // Arrows
    case 'arrow':
    case 'arrow_right': {
      const head = Math.min(30, w * 0.35);
      const th = Math.min(24, h * 0.35);
      const yMid = h / 2;
      const d = `M 0 ${yMid - th / 2} L ${w - head} ${yMid - th / 2} L ${w - head} ${
        yMid - head / 1.4
      } L ${w} ${yMid} L ${w - head} ${yMid + head / 1.4} L ${w - head} ${yMid + th / 2} L 0 ${
        yMid + th / 2
      } Z`;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'arrow_left': {
      const head = Math.min(30, w * 0.35);
      const th = Math.min(24, h * 0.35);
      const yMid = h / 2;
      const d = `M ${w} ${yMid - th / 2} L ${head} ${yMid - th / 2} L ${head} ${
        yMid - head / 1.4
      } L 0 ${yMid} L ${head} ${yMid + head / 1.4} L ${head} ${yMid + th / 2} L ${w} ${
        yMid + th / 2
      } Z`;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'arrow_up': {
      const head = Math.min(30, h * 0.35);
      const th = Math.min(24, w * 0.35);
      const xMid = w / 2;
      const d = `M ${xMid - th / 2} ${h} L ${xMid - th / 2} ${head} L ${
        xMid - head / 1.4
      } ${head} L ${xMid} 0 L ${xMid + head / 1.4} ${head} L ${xMid + th / 2} ${head} L ${
        xMid + th / 2
      } ${h} Z`;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'arrow_down': {
      const head = Math.min(30, h * 0.35);
      const th = Math.min(24, w * 0.35);
      const xMid = w / 2;
      const d = `M ${xMid - th / 2} 0 L ${xMid - th / 2} ${h - head} L ${
        xMid - head / 1.4
      } ${h - head} L ${xMid} ${h} L ${xMid + head / 1.4} ${h - head} L ${xMid + th / 2} ${
        h - head
      } L ${xMid + th / 2} 0 Z`;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'double_arrow': {
      const head = Math.min(25, w * 0.25);
      const th = Math.min(20, h * 0.3);
      const yMid = h / 2;
      const d = `M ${head} ${yMid - th / 2} L ${w - head} ${yMid - th / 2} L ${w - head} ${
        yMid - head / 1.5
      } L ${w} ${yMid} L ${w - head} ${yMid + head / 1.5} L ${w - head} ${yMid + th / 2} L ${head} ${
        yMid + th / 2
      } L ${head} ${yMid + head / 1.5} L 0 ${yMid} L ${head} ${yMid - head / 1.5} Z`;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'curved_arrow': {
      const d = `M ${w * 0.1} ${h * 0.8} C ${w * 0.1} ${h * 0.2}, ${w * 0.6} ${h * 0.15}, ${
        w * 0.85
      } ${h * 0.35} L ${w * 0.75} ${h * 0.15} L ${w} ${h * 0.4} L ${w * 0.85} ${h * 0.65} L ${
        w * 0.82
      } ${h * 0.48} C ${w * 0.55} ${h * 0.3}, ${w * 0.25} ${h * 0.4}, ${w * 0.25} ${h * 0.8} Z`;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'thick_arrow': {
      const d = `M 0 ${h * 0.3} L ${w * 0.6} ${h * 0.3} L ${w * 0.6} 0 L ${w} ${h * 0.5} L ${
        w * 0.6
      } ${h} L ${w * 0.6} ${h * 0.7} L 0 ${h * 0.7} Z`;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'multi_arrow': {
      const cx = w / 2;
      const cy = h / 2;
      const arm = w * 0.15;
      const head = w * 0.22;
      const d = `
        M ${cx - arm} ${cy - arm}
        L ${cx - arm} ${head} L ${cx - head} ${head} L ${cx} 0 L ${cx + head} ${head} L ${cx + arm} ${head}
        L ${cx + arm} ${cy - arm}
        L ${w - head} ${cy - arm} L ${w - head} ${cy - head} L ${w} ${cy} L ${w - head} ${cy + head} L ${w - head} ${cy + arm}
        L ${cx + arm} ${cy + arm}
        L ${cx + arm} ${h - head} L ${cx + head} ${h - head} L ${cx} ${h} L ${cx - head} ${h - head} L ${cx - arm} ${h - head}
        L ${cx - arm} ${cy + arm}
        L ${head} ${cy + arm} L ${head} ${cy + head} L 0 ${cy} L ${head} ${cy - head} L ${head} ${cy - arm}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    // Symbols & Icons
    case 'heart': {
      const d = `
        M ${w / 2} ${h * 0.85}
        C ${w * 0.1} ${h * 0.55}, 0 ${h * 0.3}, 0 ${h * 0.2}
        C 0 ${h * 0.05}, ${w * 0.2} 0, ${w * 0.4} 0
        C ${w * 0.47} 0, ${w / 2} ${h * 0.12}, ${w / 2} ${h * 0.18}
        C ${w / 2} ${h * 0.12}, ${w * 0.53} 0, ${w * 0.6} 0
        C ${w * 0.8} 0, ${w} ${h * 0.05}, ${w} ${h * 0.2}
        C ${w} ${h * 0.3}, ${w * 0.9} ${h * 0.55}, ${w / 2} ${h * 0.85}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'lightning': {
      const d = `
        M ${w * 0.58} 0
        L ${w * 0.12} ${h * 0.52}
        L ${w * 0.48} ${h * 0.52}
        L ${w * 0.38} ${h}
        L ${w * 0.88} ${h * 0.44}
        L ${w * 0.54} ${h * 0.44}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'cloud': {
      const d = `
        M ${w * 0.2} ${h * 0.75}
        C ${w * 0.05} ${h * 0.75}, 0 ${h * 0.6}, 0 ${h * 0.45}
        C 0 ${h * 0.3}, ${w * 0.15} ${h * 0.18}, ${w * 0.3} ${h * 0.2}
        C ${w * 0.35} ${h * 0.05}, ${w * 0.55} 0, ${w * 0.68} ${h * 0.1}
        C ${w * 0.8} ${h * 0.05}, ${w * 0.95} ${h * 0.2}, ${w * 0.95} ${h * 0.35}
        C ${w} ${h * 0.45}, ${w} ${h * 0.6}, ${w * 0.88} ${h * 0.75}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'sun': {
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.25;
      const outerR = Math.min(w, h) * 0.45;
      let d = `M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} `;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4;
        const x1 = cx + (r + 4) * Math.cos(angle);
        const y1 = cy + (r + 4) * Math.sin(angle);
        const x2 = cx + outerR * Math.cos(angle);
        const y2 = cy + outerR * Math.sin(angle);
        d += `M ${x1} ${y1} L ${x2} ${y2} `;
      }
      return { type: 'path', props: { d, fill, stroke, strokeWidth: Math.max(3, sw) } };
    }

    case 'moon': {
      const d = `
        M ${w * 0.7} ${h * 0.05}
        C ${w * 0.3} ${h * 0.15}, ${w * 0.1} ${h * 0.45}, ${w * 0.25} ${h * 0.8}
        C ${w * 0.4} ${h * 0.98}, ${w * 0.7} ${h * 0.98}, ${w * 0.9} ${h * 0.85}
        C ${w * 0.65} ${h * 0.8}, ${w * 0.45} ${h * 0.6}, ${w * 0.45} ${h * 0.4}
        C ${w * 0.45} ${h * 0.2}, ${w * 0.55} ${h * 0.08}, ${w * 0.7} ${h * 0.05}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'crown': {
      const d = `
        M 0 ${h * 0.85}
        L ${w * 0.08} ${h * 0.3}
        L ${w * 0.3} ${h * 0.6}
        L ${w / 2} ${h * 0.15}
        L ${w * 0.7} ${h * 0.6}
        L ${w * 0.92} ${h * 0.3}
        L ${w} ${h * 0.85}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'check': {
      const d = `
        M ${w * 0.15} ${h * 0.5}
        L ${w * 0.4} ${h * 0.8}
        L ${w * 0.88} ${h * 0.18}
      `;
      return {
        type: 'path',
        props: {
          d,
          fill: 'none',
          stroke: stroke !== 'none' ? stroke : fillColor,
          strokeWidth: Math.max(6, sw * 2),
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        },
      };
    }

    case 'cross': {
      const pad = Math.min(w, h) * 0.15;
      const d = `
        M ${pad} ${pad} L ${w - pad} ${h - pad}
        M ${w - pad} ${pad} L ${pad} ${h - pad}
      `;
      return {
        type: 'path',
        props: {
          d,
          fill: 'none',
          stroke: stroke !== 'none' ? stroke : fillColor,
          strokeWidth: Math.max(6, sw * 2),
          strokeLinecap: 'round',
        },
      };
    }

    case 'warning': {
      const d = `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'question': {
      const d = `
        M ${w * 0.3} ${h * 0.3}
        C ${w * 0.3} ${h * 0.15}, ${w * 0.7} ${h * 0.15}, ${w * 0.7} ${h * 0.35}
        C ${w * 0.7} ${h * 0.5}, ${w * 0.5} ${h * 0.55}, ${w * 0.5} ${h * 0.7}
        M ${w * 0.5} ${h * 0.85} L ${w * 0.5} ${h * 0.9}
      `;
      return {
        type: 'path',
        props: {
          d,
          fill: 'none',
          stroke: stroke !== 'none' ? stroke : fillColor,
          strokeWidth: Math.max(6, sw * 2),
          strokeLinecap: 'round',
        },
      };
    }

    case 'exclamation': {
      const d = `
        M ${w / 2} ${h * 0.15} L ${w / 2} ${h * 0.65}
        M ${w / 2} ${h * 0.82} L ${w / 2} ${h * 0.88}
      `;
      return {
        type: 'path',
        props: {
          d,
          fill: 'none',
          stroke: stroke !== 'none' ? stroke : fillColor,
          strokeWidth: Math.max(6, sw * 2),
          strokeLinecap: 'round',
        },
      };
    }

    // Design Shapes
    case 'speech_bubble': {
      const r = Math.min(20, w * 0.1);
      const bh = h * 0.75;
      const d = `
        M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${bh - r} Q ${w} ${bh} ${w - r} ${bh}
        L ${w * 0.45} ${bh} L ${w * 0.25} ${h} L ${w * 0.3} ${bh}
        L ${r} ${bh} Q 0 ${bh} 0 ${bh - r} L 0 ${r} Q 0 0 ${r} 0 Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'callout': {
      const r = Math.min(24, w * 0.12);
      const bh = h * 0.75;
      const d = `
        M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${bh - r} Q ${w} ${bh} ${w - r} ${bh}
        L ${w * 0.55} ${bh} L ${w * 0.4} ${h} L ${w * 0.42} ${bh}
        L ${r} ${bh} Q 0 ${bh} 0 ${bh - r} L 0 ${r} Q 0 0 ${r} 0 Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'banner': {
      const cut = w * 0.08;
      const d = `
        M 0 0 L ${w} 0 L ${w - cut} ${h / 2} L ${w} ${h} L 0 ${h} L ${cut} ${h / 2} Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'ribbon': {
      const tail = h * 0.3;
      const d = `
        M 0 0 L ${w} 0 L ${w} ${h} L ${w / 2} ${h - tail} L 0 ${h} Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'badge': {
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 16;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.82;
      const points = Array.from({ length: spikes * 2 })
        .map((_, i) => {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(' ');
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'label': {
      const cut = Math.min(30, h * 0.5);
      const d = `
        M ${cut} 0 L ${w} 0 L ${w} ${h} L ${cut} ${h} L 0 ${h / 2} Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'frame': {
      const inW = w * 0.75;
      const inH = h * 0.75;
      const offX = (w - inW) / 2;
      const offY = (h - inH) / 2;
      const d = `
        M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z
        M ${offX} ${offY} L 0 ${offY} L ${offX} ${offY + inH} L ${offX + inW} ${offY + inH} L ${offX + inW} ${offY} Z
      `;
      return {
        type: 'rect',
        props: {
          x: offX,
          y: offY,
          width: inW,
          height: inH,
          fill,
          stroke,
          strokeWidth: Math.max(6, sw * 2),
        },
      };
    }

    case 'shield': {
      const d = `
        M 0 0 L ${w} 0 L ${w} ${h * 0.5}
        C ${w} ${h * 0.8}, ${w * 0.6} ${h * 0.95}, ${w / 2} ${h}
        C ${w * 0.4} ${h * 0.95}, 0 ${h * 0.8}, 0 ${h * 0.5}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'burst': {
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 12;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.6;
      const points = Array.from({ length: spikes * 2 })
        .map((_, i) => {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(' ');
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'right_triangle': {
      const points = `0,0 0,${h} ${w},${h}`;
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'kite': {
      const points = `${w / 2},0 ${w},${h * 0.35} ${w / 2},${h} 0,${h * 0.35}`;
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'semicircle': {
      const d = `M 0,${h} A ${w / 2} ${h} 0 0 1 ${w},${h} Z`;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'quarter_circle': {
      const d = `M 0,0 L 0,${h} A ${w} ${h} 0 0 1 ${w},0 Z`;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'ring': {
      const cx = w / 2;
      const cy = h / 2;
      const rOut = Math.min(w, h) / 2;
      const rIn = rOut * 0.55;
      const d = `
        M ${cx} ${cy - rOut}
        A ${rOut} ${rOut} 0 1 0 ${cx} ${cy + rOut}
        A ${rOut} ${rOut} 0 1 0 ${cx} ${cy - rOut}
        Z
        M ${cx} ${cy - rIn}
        A ${rIn} ${rIn} 0 1 1 ${cx} ${cy + rIn}
        A ${rIn} ${rIn} 0 1 1 ${cx} ${cy - rIn}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, fillRule: 'evenodd' } };
    }

    case 'crescent': {
      const d = `
        M ${w * 0.8} 0
        A ${w * 0.45} ${h * 0.45} 0 1 0 ${w * 0.8} ${h}
        A ${w * 0.38} ${h * 0.38} 0 0 1 ${w * 0.8} 0
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'chevron': {
      const inset = w * 0.35;
      const points = `0,0 ${w - inset},${h / 2} 0,${h} ${inset},${h} ${w},${h / 2} ${inset},0`;
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'circular_arrow': {
      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.38;
      const d = `
        M ${cx + r} ${cy}
        A ${r} ${r} 0 1 1 ${cx} ${cy - r}
        L ${cx} ${cy - r * 1.3}
        L ${cx + r * 0.35} ${cy - r * 0.85}
        L ${cx} ${cy - r * 0.4}
        L ${cx} ${cy - r * 0.7}
        A ${r * 0.7} ${r * 0.7} 0 1 0 ${cx + r * 0.7} ${cy}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'block_arrow': {
      const bodyTop = h * 0.25;
      const bodyBottom = h * 0.75;
      const headX = w * 0.6;
      const points = `0,${bodyTop} ${headX},${bodyTop} ${headX},0 ${w},${h / 2} ${headX},${h} ${headX},${bodyBottom} 0,${bodyBottom}`;
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'rounded_speech_bubble': {
      const tailW = w * 0.15;
      const tailH = h * 0.2;
      const bubbleH = h - tailH;
      const rx = 16;
      const d = `
        M ${rx} 0
        H ${w - rx}
        A ${rx} ${rx} 0 0 1 ${w} ${rx}
        V ${bubbleH - rx}
        A ${rx} ${rx} 0 0 1 ${w - rx} ${bubbleH}
        H ${w * 0.4 + tailW}
        L ${w * 0.3} ${h}
        L ${w * 0.35} ${bubbleH}
        H ${rx}
        A ${rx} ${rx} 0 0 1 0 ${bubbleH - rx}
        V ${rx}
        A ${rx} ${rx} 0 0 1 ${rx} 0
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'thought_bubble': {
      const d = `
        M ${w * 0.2} ${h * 0.3}
        C ${w * 0.1} ${h * 0.1}, ${w * 0.4} ${h * 0.05}, ${w * 0.5} ${h * 0.15}
        C ${w * 0.6} ${h * 0.05}, ${w * 0.9} ${h * 0.1}, ${w * 0.85} ${h * 0.35}
        C ${w * 0.98} ${h * 0.45}, ${w * 0.95} ${h * 0.7}, ${w * 0.8} ${h * 0.75}
        C ${w * 0.7} ${h * 0.88}, ${w * 0.4} ${h * 0.85}, ${w * 0.3} ${h * 0.75}
        C ${w * 0.1} ${h * 0.75}, ${w * 0.05} ${h * 0.5}, ${w * 0.2} ${h * 0.3}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'comic_bubble': {
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 14;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.72;
      const points = Array.from({ length: spikes * 2 })
        .map((_, i) => {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(' ');
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'burst_callout': {
      const points = `
        ${w * 0.1},0 ${w * 0.4},${h * 0.1} ${w * 0.6},0 ${w * 0.75},${h * 0.15} ${w},${h * 0.05}
        ${w * 0.9},${h * 0.4} ${w},${h * 0.65} ${w * 0.85},${h * 0.75} ${w * 0.9},${h}
        ${w * 0.6},${h * 0.85} ${w * 0.3},${h} ${w * 0.35},${h * 0.8} 0,${h * 0.85}
        ${w * 0.1},${h * 0.55} 0,${h * 0.35} ${w * 0.15},${h * 0.2}
      `;
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'star_4': {
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 4;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.3;
      const points = Array.from({ length: spikes * 2 })
        .map((_, i) => {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes - Math.PI / 2;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(' ');
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'star_6': {
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 6;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.5;
      const points = Array.from({ length: spikes * 2 })
        .map((_, i) => {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(' ');
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'star_8': {
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 8;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.55;
      const points = Array.from({ length: spikes * 2 })
        .map((_, i) => {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(' ');
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'sparkle': {
      const d = `
        M ${w / 2} 0
        Q ${w / 2} ${h / 2} ${w} ${h / 2}
        Q ${w / 2} ${h / 2} ${w / 2} ${h}
        Q ${w / 2} ${h / 2} 0 ${h / 2}
        Q ${w / 2} ${h / 2} ${w / 2} 0
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'sunburst': {
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 16;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.75;
      const points = Array.from({ length: spikes * 2 })
        .map((_, i) => {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(' ');
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'seal': {
      const cx = w / 2;
      const cy = h / 2;
      const spikes = 24;
      const outerR = Math.min(w, h) / 2;
      const innerR = outerR * 0.88;
      const points = Array.from({ length: spikes * 2 })
        .map((_, i) => {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / spikes;
          return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
        })
        .join(' ');
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'pill': {
      const radius = h / 2;
      return {
        type: 'rect',
        props: { x: 0, y: 0, width: w, height: h, rx: radius, fill, stroke, strokeWidth: sw },
      };
    }

    case 'capsule': {
      const radius = w / 2;
      return {
        type: 'rect',
        props: { x: 0, y: 0, width: w, height: h, rx: radius, fill, stroke, strokeWidth: sw },
      };
    }

    case 'tag': {
      const notch = h * 0.35;
      const points = `0,0 ${w - notch},0 ${w},${h / 2} ${w - notch},${h} 0,${h}`;
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'tab': {
      const slope = 20;
      const points = `0,${h} ${slope},0 ${w - slope},0 ${w},${h}`;
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'ticket': {
      const notchR = h * 0.18;
      const d = `
        M 0 0
        H ${w}
        V ${h / 2 - notchR}
        A ${notchR} ${notchR} 0 0 0 ${w} ${h / 2 + notchR}
        V ${h}
        H 0
        V ${h / 2 + notchR}
        A ${notchR} ${notchR} 0 0 0 0 ${h / 2 - notchR}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'bookmark': {
      const vDepth = h * 0.2;
      const points = `0,0 ${w},0 ${w},${h} ${w / 2},${h - vDepth} 0,${h}`;
      return { type: 'polygon', props: { points, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'cylinder': {
      const ovalH = h * 0.2;
      const d = `
        M 0 ${ovalH / 2}
        A ${w / 2} ${ovalH / 2} 0 0 1 ${w} ${ovalH / 2}
        V ${h - ovalH / 2}
        A ${w / 2} ${ovalH / 2} 0 0 1 0 ${h - ovalH / 2}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'blob': {
      const d = `
        M ${w * 0.5} 0
        C ${w * 0.85} 0, ${w} ${h * 0.3}, ${w} ${h * 0.6}
        C ${w} ${h * 0.9}, ${w * 0.7} ${h}, ${w * 0.4} ${h}
        C ${w * 0.15} ${h}, 0 ${h * 0.8}, 0 ${h * 0.5}
        C 0 ${h * 0.2}, ${w * 0.2} 0, ${w * 0.5} 0
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'wave': {
      const d = `
        M 0 ${h * 0.5}
        Q ${w * 0.25} 0, ${w * 0.5} ${h * 0.5}
        T ${w} ${h * 0.5}
        V ${h}
        H 0
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'droplet': {
      const d = `
        M ${w / 2} 0
        C ${w * 0.8} ${h * 0.45}, ${w} ${h * 0.7}, ${w} ${h * 0.8}
        A ${w / 2} ${w / 2} 0 0 1 0 ${h * 0.8}
        C 0 ${h * 0.7}, ${w * 0.2} ${h * 0.45}, ${w / 2} 0
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'teardrop': {
      const d = `
        M ${w / 2} 0
        C ${w * 0.9} ${h * 0.5}, ${w} ${h * 0.75}, ${w * 0.7} ${h * 0.95}
        C ${w * 0.4} ${h * 1.05}, 0 ${h * 0.9}, 0 ${h * 0.65}
        C 0 ${h * 0.4}, ${w * 0.2} ${h * 0.2}, ${w / 2} 0
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'leaf': {
      const d = `
        M 0 ${h}
        Q 0 0, ${w} 0
        Q ${w} ${h}, 0 ${h}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, strokeLinejoin: 'round' } };
    }

    case 'frame_circle': {
      const cx = w / 2;
      const cy = h / 2;
      const rOut = Math.min(w, h) / 2;
      const rIn = rOut * 0.82;
      const d = `
        M ${cx} ${cy - rOut}
        A ${rOut} ${rOut} 0 1 0 ${cx} ${cy + rOut}
        A ${rOut} ${rOut} 0 1 0 ${cx} ${cy - rOut}
        Z
        M ${cx} ${cy - rIn}
        A ${rIn} ${rIn} 0 1 1 ${cx} ${cy + rIn}
        A ${rIn} ${rIn} 0 1 1 ${cx} ${cy - rIn}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, fillRule: 'evenodd' } };
    }

    case 'frame_polaroid': {
      const pad = 14;
      const bottomPad = h * 0.24;
      const d = `
        M 0 0
        H ${w}
        V ${h}
        H 0
        Z
        M ${pad} ${pad}
        V ${h - bottomPad}
        H ${w - pad}
        V ${pad}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, fillRule: 'evenodd' } };
    }

    case 'frame_ticket': {
      const r = 16;
      const d = `
        M 0 0
        H ${w}
        V ${h}
        H 0
        Z
        M ${r} ${r}
        V ${h - r}
        H ${w - r}
        V ${r}
        Z
      `;
      return { type: 'path', props: { d, fill, stroke, strokeWidth: sw, fillRule: 'evenodd' } };
    }

    default:
      return {
        type: 'rect',
        props: { x: 0, y: 0, width: w, height: h, fill, stroke, strokeWidth: sw },
      };
  }
}

/**
 * Draws shape on 2D Canvas context for high-resolution PNG/JPG export
 */
export function drawShapeOnCanvas(
  ctx: CanvasRenderingContext2D,
  shape: ShapeConfig,
  width: number,
  height: number
) {
  ctx.save();
  const shapeData = getShapeSvgContent(
    shape.shapeType,
    width,
    height,
    shape.fillColor,
    shape.strokeColor,
    shape.strokeWidth,
    shape.borderRadius
  );

  let fillStyle: string | CanvasGradient | null =
    shape.fillColor && shape.fillColor !== 'transparent' ? shape.fillColor : null;

  if (shape.gradient && shape.gradient.enabled) {
    const angleRad = ((shape.gradient.angle || 135) * Math.PI) / 180;
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.sqrt(width * width + height * height) / 2;
    const x0 = cx - Math.cos(angleRad) * r;
    const y0 = cy - Math.sin(angleRad) * r;
    const x1 = cx + Math.cos(angleRad) * r;
    const y1 = cy + Math.sin(angleRad) * r;
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    if (shape.gradient.stops && shape.gradient.stops.length >= 2) {
      shape.gradient.stops.forEach((s) => grad.addColorStop(s.offset, s.color));
    } else {
      grad.addColorStop(0, shape.gradient.from || '#6C4DFF');
      grad.addColorStop(1, shape.gradient.to || '#23B5D3');
    }
    fillStyle = grad;
  }

  const stroke = shape.strokeColor && shape.strokeWidth > 0 ? shape.strokeColor : null;
  const sw = shape.strokeWidth || 2;

  if (shapeData.type === 'rect') {
    const { x, y, width: rw, height: rh, rx } = shapeData.props;
    ctx.beginPath();
    if (rx && rx > 0 && typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, rw, rh, rx);
    } else {
      ctx.rect(x, y, rw, rh);
    }
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = sw;
      ctx.stroke();
    }
  } else if (shapeData.type === 'ellipse') {
    const { cx, cy, rx, ry } = shapeData.props;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = sw;
      ctx.stroke();
    }
  } else if (shapeData.type === 'polygon') {
    const pts = (shapeData.props.points as string).split(' ').map((p) => {
      const [px, py] = p.split(',').map(Number);
      return { x: px, y: py };
    });
    ctx.beginPath();
    pts.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = sw;
      ctx.stroke();
    }
  } else if (shapeData.type === 'path') {
    const p = new Path2D(shapeData.props.d);
    if (fillStyle) {
      ctx.fillStyle = fillStyle;
      ctx.fill(p);
    }
    if (stroke || shapeData.props.stroke !== 'none') {
      ctx.strokeStyle = (shapeData.props.stroke as string) || stroke || '#6C4DFF';
      ctx.lineWidth = Number(shapeData.props.strokeWidth) || sw;
      ctx.stroke(p);
    }
  } else if (shapeData.type === 'line') {
    ctx.beginPath();
    ctx.moveTo(shapeData.props.x1, shapeData.props.y1);
    ctx.lineTo(shapeData.props.x2, shapeData.props.y2);
    ctx.strokeStyle = stroke || shape.strokeColor || '#6C4DFF';
    ctx.lineWidth = sw;
    ctx.stroke();
  }

  ctx.restore();
}
