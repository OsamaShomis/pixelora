export type EditorTool =
  | 'select'
  | 'transform'
  | 'crop'
  | 'freeform_crop'
  | 'draw'
  | 'pen'
  | 'text'
  | 'shape'
  | 'eraser'
  | 'remove_object'
  | 'bg_remove'
  | 'hand'
  | 'zoom';

export interface RemoveObjectConfig {
  brushSize: number;
  hardness: number; // 0 to 1
  mode: 'add' | 'remove'; // add to mask vs erase from mask
  preview: boolean;
}

export type ShapeType =
  // Basic & Geometric Shapes
  | 'rectangle'
  | 'rounded_rectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'right_triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'trapezoid'
  | 'parallelogram'
  | 'kite'
  | 'semicircle'
  | 'quarter_circle'
  | 'ring'
  | 'crescent'
  | 'star'
  | 'line'
  // Arrows & Directional
  | 'arrow'
  | 'arrow_right'
  | 'arrow_left'
  | 'arrow_up'
  | 'arrow_down'
  | 'double_arrow'
  | 'curved_arrow'
  | 'thick_arrow'
  | 'multi_arrow'
  | 'chevron'
  | 'circular_arrow'
  | 'block_arrow'
  // Icons & Symbols
  | 'heart'
  | 'lightning'
  | 'cloud'
  | 'sun'
  | 'moon'
  | 'crown'
  | 'check'
  | 'cross'
  | 'warning'
  | 'question'
  | 'exclamation'
  // Callouts & Speech
  | 'speech_bubble'
  | 'rounded_speech_bubble'
  | 'thought_bubble'
  | 'comic_bubble'
  | 'callout'
  | 'burst_callout'
  // Decorative & Stars
  | 'star_4'
  | 'star_6'
  | 'star_8'
  | 'sparkle'
  | 'sunburst'
  | 'seal'
  | 'badge'
  | 'banner'
  | 'ribbon'
  | 'shield'
  | 'burst'
  // UI & Design Elements
  | 'pill'
  | 'capsule'
  | 'tag'
  | 'label'
  | 'tab'
  | 'ticket'
  | 'bookmark'
  | 'cylinder'
  // Organic & Fluid
  | 'blob'
  | 'wave'
  | 'droplet'
  | 'teardrop'
  | 'leaf'
  // Frames
  | 'frame'
  | 'frame_circle'
  | 'frame_polaroid'
  | 'frame_ticket';

export type PresetFilterType =
  | 'none'
  | 'bw'
  | 'sepia'
  | 'vintage'
  | 'cool'
  | 'warm'
  | 'smooth'
  | 'edges'
  | 'blur'
  | 'auto_enhance'
  | string;

export interface CurvePoint {
  x: number; // 0 - 255
  y: number; // 0 - 255
}

export interface ToneCurves {
  rgb: CurvePoint[];
  red: CurvePoint[];
  green: CurvePoint[];
  blue: CurvePoint[];
}

export type HslChannelColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'aqua'
  | 'blue'
  | 'purple'
  | 'magenta';

export interface HslChannelAdjustments {
  hue: number; // -100 to 100
  saturation: number; // -100 to 100
  luminance: number; // -100 to 100
}

export type HslMixer = Record<HslChannelColor, HslChannelAdjustments>;

export interface ColorGradingTarget {
  hue: number; // 0 - 360
  saturation: number; // 0 - 100
  luminance: number; // -100 to 100
}

export interface ColorGrading {
  shadows: ColorGradingTarget;
  midtones: ColorGradingTarget;
  highlights: ColorGradingTarget;
  blending: number; // 0 - 100
  balance: number; // -100 to 100
}

export interface VignetteEffect {
  amount: number; // -100 to 100
  midpoint: number; // 0 to 100
  roundness: number; // -100 to 100
  feather: number; // 0 to 100
  highlights: number; // 0 to 100
}

export interface GrainEffect {
  amount: number; // 0 to 100
  size: number; // 0 to 100
  roughness: number; // 0 to 100
}

export interface SharpeningDetail {
  amount: number; // 0 to 150
  radius: number; // 0.5 to 3.0
  detail: number; // 0 to 100
  masking: number; // 0 to 100
}

export interface NoiseReductionDetail {
  luminance: number; // 0 to 100
  detail: number; // 0 to 100
  contrast: number; // 0 to 100
}

export interface ColorNoiseReductionDetail {
  amount: number; // 0 to 100
  detail: number; // 0 to 100
  smoothness: number; // 0 to 100
}

export type BwMix = Record<HslChannelColor, number>;

export interface LensCorrections {
  distortion: number; // -100 to 100
  vignette: number; // -100 to 100
  chromaticAberration: boolean;
  enabled: boolean;
}

export interface GeometryTransform {
  perspectiveHorizontal: number; // -100 to 100
  perspectiveVertical: number; // -100 to 100
  rotate: number; // -45 to 45
  scale: number; // 50 to 150
  offsetDistortX: number; // -100 to 100
  offsetDistortY: number; // -100 to 100
  perspectiveMode: 'off' | 'auto' | 'level' | 'vertical' | 'full';
}

export type AdjustmentMaskType =
  | 'brush'
  | 'linear_gradient'
  | 'radial_gradient'
  | 'subject'
  | 'sky'
  | 'background'
  | 'color_range'
  | 'luminance_range';

export interface LocalAdjustments {
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  temperature: number;
  tint: number;
  saturation: number;
  sharpness: number;
  clarity: number;
  dehaze: number;
  texture: number;
}

export interface AdjustmentMask {
  id: string;
  name: string;
  type: AdjustmentMaskType;
  enabled: boolean;
  inverted: boolean;
  opacity: number; // 0 - 1
  bounds?: { x: number; y: number; width: number; height: number };
  gradientPoints?: { x1: number; y1: number; x2: number; y2: number };
  colorTarget?: string;
  luminanceRange?: [number, number];
  brushPaths?: DrawingPath[];
  adjustments: Partial<LocalAdjustments>;
}

export type CameraProfile =
  | 'adobe_color'
  | 'neutral'
  | 'vivid'
  | 'portrait'
  | 'landscape'
  | 'monochrome'
  | 'vintage'
  | 'artistic';

export interface LayerFilters {
  // 1. Light & Color (الإضاءة والألوان)
  brightness: number; // 0 - 200, default 100
  contrast: number; // 0 - 200, default 100
  exposure?: number; // -100 to 100, default 0
  highlights?: number; // -100 to 100, default 0
  shadows?: number; // -100 to 100, default 0
  whites?: number; // -100 to 100, default 0
  blacks?: number; // -100 to 100, default 0
  saturation: number; // 0 - 200, default 100
  vibrance?: number; // -100 to 100, default 0
  temperature: number; // -100 to 100, default 0
  tint: number; // -100 to 100, default 0
  hue?: number; // -180 to 180, default 0
  autoWhiteBalance?: boolean;
  toneCurves?: ToneCurves;

  // 2. Details (التفاصيل)
  sharpness: number; // 0 to 100, default 0
  blur: number; // 0 to 50, default 0
  clarity?: number; // -100 to 100, default 0
  sharpeningDetail?: SharpeningDetail;
  noiseReduction?: NoiseReductionDetail;
  colorNoiseReduction?: ColorNoiseReductionDetail;

  // 3. Effects (التأثيرات)
  vignette?: number | VignetteEffect; // -100 to 100, default 0
  grayscale?: number; // 0 to 100, default 0
  sepia?: number; // 0 to 100, default 0
  invert?: number; // 0 to 100, default 0
  texture?: number; // -100 to 100, default 0
  dehaze?: number; // -100 to 100, default 0
  grain?: GrainEffect;

  // 4. Color Mixer / HSL & Color Grading
  hslMixer?: HslMixer;
  colorGrading?: ColorGrading;

  // 5. Black & White
  bwEnabled?: boolean;
  bwMix?: BwMix;

  // 6. Lens Corrections & Geometry
  lensCorrections?: LensCorrections;
  geometry?: GeometryTransform;

  // 7. Masking (Local Adjustments)
  masks?: AdjustmentMask[];

  // 8. Profile
  profile?: CameraProfile;

  // General & Presets
  opacity: number; // 0 to 100, default 100
  presetFilter: PresetFilterType;
  presetIntensity: number; // 0 to 100, default 100
  presetParams?: Record<string, any>;
}

export interface GradientColorStop {
  color: string;
  offset: number; // 0 to 1
}

export interface TextGradient {
  enabled: boolean;
  from: string;
  to: string;
  angle: number; // 0 - 360
  stops?: GradientColorStop[];
}

export interface TextShadow {
  enabled?: boolean;
  color: string;
  blur: number; // 0 - 50
  offsetX: number; // -50 - 50
  offsetY: number; // -50 - 50
  opacity?: number; // 0 - 1
}

export interface TextStroke {
  enabled: boolean;
  color: string;
  width: number; // 0 - 20
}

export type BrushType =
  | 'round'
  | 'soft'
  | 'hard'
  | 'pencil'
  | 'ink'
  | 'airbrush'
  | 'stars'
  | 'hearts'
  | 'spray';

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  size: number;
  opacity: number;
  hardness?: number; // 0 to 1 (0 = feathered/soft, 1 = sharp/hard)
  tipShape?: 'round' | 'square';
  brushType?: BrushType;
  tool: 'pen' | 'brush' | 'eraser';
}

export interface BrushConfig {
  size: number;
  color: string;
  opacity: number; // 0.05 to 1.0
  hardness: number; // 0 to 1
  tipShape: 'round' | 'square';
  brushType: BrushType;
  tool: 'pen' | 'brush' | 'eraser';
}

export interface EraserConfig {
  size: number;
  hardness: number; // 0 to 1
  opacity: number; // 0.05 to 1.0
  tipShape: 'round' | 'square';
}

export interface TextConfig {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity?: number; // 0 to 1
  align: 'right' | 'center' | 'left' | 'justify';
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough?: boolean;
  uppercase?: boolean;
  letterSpacing?: number; // -5 to 30 px
  lineHeight?: number; // 0.8 to 2.5
  direction?: 'rtl' | 'ltr';
  backgroundColor?: string;
  gradient?: TextGradient;
  shadow?: TextShadow;
  stroke?: TextStroke;
}

export interface ShapeConfig {
  shapeType: ShapeType;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  borderRadius?: number;
  points?: number; // e.g. for stars, sunbursts
  gradient?: TextGradient;
}

export interface LayerShadow {
  enabled: boolean;
  color: string; // e.g. '#000000'
  opacity: number; // 0 - 100
  blur: number; // 0 - 100 px
  distance: number; // 0 - 150 px
  angle: number; // 0 - 360 deg
  spread?: number; // 0 - 50 px
  type: 'contact' | 'drop' | 'floating'; // contact: bottom grounding ellipse, drop: contour drop shadow, floating: elevated soft oval
}

export type LayerType = 'image' | 'text' | 'shape' | 'drawing' | 'effect' | 'path';

export interface PathPoint {
  id: string;
  x: number;
  y: number;
  handleIn?: { x: number; y: number } | null;
  handleOut?: { x: number; y: number } | null;
  type?: 'corner' | 'smooth' | 'symmetric';
}

export interface PathConfig {
  points: PathPoint[];
  closed: boolean;
  fillColor: string; // 'transparent' or hex/rgb
  strokeColor: string;
  strokeWidth: number;
  strokeCap?: 'round' | 'butt' | 'square';
  strokeJoin?: 'round' | 'miter' | 'bevel';
  strokeDashArray?: string;
  isDraft?: boolean;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
}

export type EffectType =
  | 'blur'
  | 'brightness'
  | 'contrast'
  | 'exposure'
  | 'highlights'
  | 'shadows'
  | 'whites'
  | 'blacks'
  | 'temperature'
  | 'tint'
  | 'saturation'
  | 'vibrance'
  | 'clarity'
  | 'color_grading'
  | 'curves'
  | 'hsl'
  | 'sharpen'
  | 'noise_reduction'
  | 'grain'
  | 'vignette'
  | 'filter'
  | 'adjustment';

export interface Layer {
  id: string;
  name: string;
  type: LayerType;
  source?: string; // image URL / dataURL
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked?: boolean;
  zIndex: number;
  filters: LayerFilters;
  textConfig?: TextConfig;
  shapeConfig?: ShapeConfig;
  drawingPaths?: DrawingPath[];
  pathConfig?: PathConfig;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  skewX?: number; // Horizontal skew in degrees
  skewY?: number; // Vertical skew in degrees
  pivotX?: number; // Normalized pivot X (0 = left, 0.5 = center, 1 = right)
  pivotY?: number; // Normalized pivot Y (0 = top, 0.5 = center, 1 = bottom)
  originalSource?: string; // Original image source URL/dataURL before background cutout or destructive editing
  maskData?: string; // Mask for background removal
  bitmapWidth?: number; // True underlying bitmap pixel width
  bitmapHeight?: number; // True underlying bitmap pixel height
  shadow?: LayerShadow; // Product / layer shadow configuration
  isSceneLayer?: boolean; // Marker for scene-generated layers
  sceneRole?: 'background' | 'podium' | 'lighting' | 'shadow' | 'product'; // Role in Product Studio composition
  // Effect layer specific fields
  effectType?: EffectType;
  effectMask?: string; // Non-destructive mask bitmap dataURL (alpha: 255 = effect active, 0 = erased)
}

export type CropTargetMode = 'image' | 'canvas';

export type CropAspectRatio = 'free' | 'original' | '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

export interface ApplyCropParams {
  mode: CropTargetMode;
  targetLayerId?: string;
  cropArea: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export type FreeformCropMode = 'freehand' | 'polygon';

export interface FreeformCropPoint {
  x: number; // Layer-local coordinates
  y: number;
}

export interface ApplyFreeformCropParams {
  targetLayerId: string;
  points: FreeformCropPoint[];
  mode: FreeformCropMode;
}

export interface FreeformCropToolbarProps {
  mode: FreeformCropMode;
  setMode: (mode: FreeformCropMode) => void;
  pointsCount: number;
  canApply: boolean;
  onApply: () => void;
  onReset: () => void;
  onCancel: () => void;
  isDrawing: boolean;
}

export type ResampleAlgorithm =
  | 'automatic'
  | 'nearest'
  | 'bilinear'
  | 'bicubic'
  | 'bicubic_sharper'
  | 'bicubic_smoother'
  | 'lanczos_step';

export type CanvasAnchorPosition =
  | 'top_left'
  | 'top'
  | 'top_right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom_left'
  | 'bottom'
  | 'bottom_right';

export interface DocumentResizeConfig {
  targetWidth: number;
  targetHeight: number;
  resample: boolean;
  algorithm: ResampleAlgorithm;
  resolution: number; // in PPI
  scaleLayerStyles?: boolean;
}

export interface CanvasResizeConfig {
  targetWidth: number;
  targetHeight: number;
  anchor: CanvasAnchorPosition;
  background: {
    type: 'transparent' | 'solid';
    color?: string;
  };
}

export interface ImageResizeConfig {
  targetWidth: number;
  targetHeight: number;
  keepAspectRatio: boolean;
  algorithm: ResampleAlgorithm;
  updateDisplayBounds: 'match_pixels' | 'keep_canvas_size' | 'scale_proportionally';
  resizeCanvasToFit?: boolean;
}

export interface ResampleResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  megapixels: number;
  aspectRatio: number;
  byteSize: number;
  algorithmUsed: ResampleAlgorithm;
}

export interface BackgroundConfig {
  type: 'transparent' | 'solid' | 'gradient' | 'library' | 'custom_image';
  color?: string;
  gradient?: {
    from: string;
    to: string;
    angle: number;
  };
  imageUrl?: string;
  scale?: number;
  x?: number;
  y?: number;
}

export interface ExportSettings {
  format: 'png' | 'jpg' | 'webp' | 'svg';
  quality: number; // 10 - 100
  customWidth?: number;
  customHeight?: number;
  preserveTransparency: boolean;
  fileName: string;
}

export interface EditorHistoryItem {
  id: string;
  title: string;
  layers: Layer[];
  canvasWidth: number;
  canvasHeight: number;
  resolution?: number;
  background: BackgroundConfig;
}

export interface EditorState {
  projectId?: string;
  projectName: string;
  canvasWidth: number;
  canvasHeight: number;
  resolution?: number;
  layers: Layer[];
  selectedLayerId: string | null;
  activeTool: EditorTool;
  zoom: number;
  pan: { x: number; y: number };
  background: BackgroundConfig;
  history: EditorHistoryItem[];
  historyIndex: number;
  exportSettings: ExportSettings;
}

export interface SavedProject {
  id: string;
  name: string;
  thumbnail: string;
  updatedAt: string;
  createdAt: string;
  width: number;
  height: number;
  layersCount: number;
  state: EditorState;
}

export interface BackgroundCategory {
  id: 'white' | 'studio' | 'wood' | 'luxury' | 'colorful' | 'tech' | 'ecommerce' | 'social';
  nameAr: string;
  nameEn: string;
  icon: string;
}

export interface BackgroundTemplate {
  id: string;
  name: string;
  category: BackgroundCategory['id'];
  thumbnail: string;
  type: 'color' | 'gradient' | 'pattern' | 'image';
  value: string; // CSS color, gradient string, or image URL
  description: string;
  dimensions?: string;
  orientation?: 'landscape' | 'portrait' | 'square';
  resolution?: '4K' | 'Full HD' | 'HD';
  colorTone?: string;
  icon?: string;
}

export type SceneCategoryId =
  | 'all'
  | 'studio'
  | 'ecommerce'
  | 'luxury'
  | 'marble'
  | 'wood'
  | 'minimal'
  | 'cinematic'
  | 'gradient'
  | 'podium'
  | 'floating';

export interface SceneCategory {
  id: SceneCategoryId;
  nameAr: string;
  nameEn: string;
  icon: string;
}

export type PodiumType =
  | 'cylinder_pastel'
  | 'marble_pedestal'
  | 'wood_round'
  | 'white_minimal'
  | 'dark_gold'
  | 'glass_disk'
  | 'neon_ring'
  | 'water_ripple'
  | 'none';

export type LightingType =
  | 'spotlight'
  | 'soft_glow'
  | 'golden_beam'
  | 'top_rim'
  | 'cinematic_dual'
  | 'none';

export interface ScenePodiumConfig {
  type: PodiumType;
  nameAr: string;
  nameEn: string;
  sourceSvg?: string; // Precomputed SVG or generator key
  widthRatio: number; // relative to canvasWidth (e.g. 0.58)
  heightRatio: number; // relative to canvasHeight (e.g. 0.22)
  yRatio: number; // relative position from top (e.g. 0.70)
}

export interface SceneLightingConfig {
  type: LightingType;
  nameAr: string;
  nameEn: string;
  opacity: number; // 0 to 1
  blendMode?: 'screen' | 'overlay' | 'soft-light' | 'color-dodge' | 'normal';
}

export interface ProductScene {
  id: string;
  nameAr: string;
  nameEn: string;
  category: SceneCategoryId;
  thumbnail: string;
  descriptionAr: string;
  descriptionEn: string;
  background: {
    type: 'color' | 'gradient' | 'image';
    value: string; // hex, gradient string, or image URL
    previewColor?: string;
  };
  podium?: ScenePodiumConfig;
  lighting?: SceneLightingConfig;
  shadowDefaults: LayerShadow;
  placement: {
    scaleRatio: number; // ideal height ratio for product relative to canvas height
    verticalAnchor: 'on_podium' | 'floating' | 'surface' | 'center';
    yOffsetRatio?: number; // fine-tuning offset
  };
}

