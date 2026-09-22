import {
  ToneCurves,
  HslMixer,
  ColorGrading,
  VignetteEffect,
  GrainEffect,
  SharpeningDetail,
  NoiseReductionDetail,
  ColorNoiseReductionDetail,
  BwMix,
  LensCorrections,
  GeometryTransform,
  CameraProfile,
  LayerFilters,
} from '../types';
import { NEW_FILTER_CATEGORIES, IMAGE_PROCESSING_PRESETS } from './imageProcessingFilters';

export const DEFAULT_TONE_CURVES: ToneCurves = {
  rgb: [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ],
  red: [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ],
  green: [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ],
  blue: [
    { x: 0, y: 0 },
    { x: 255, y: 255 },
  ],
};

export const DEFAULT_HSL_MIXER: HslMixer = {
  red: { hue: 0, saturation: 0, luminance: 0 },
  orange: { hue: 0, saturation: 0, luminance: 0 },
  yellow: { hue: 0, saturation: 0, luminance: 0 },
  green: { hue: 0, saturation: 0, luminance: 0 },
  aqua: { hue: 0, saturation: 0, luminance: 0 },
  blue: { hue: 0, saturation: 0, luminance: 0 },
  purple: { hue: 0, saturation: 0, luminance: 0 },
  magenta: { hue: 0, saturation: 0, luminance: 0 },
};

export const DEFAULT_COLOR_GRADING: ColorGrading = {
  shadows: { hue: 0, saturation: 0, luminance: 0 },
  midtones: { hue: 0, saturation: 0, luminance: 0 },
  highlights: { hue: 0, saturation: 0, luminance: 0 },
  blending: 50,
  balance: 0,
};

export const DEFAULT_VIGNETTE: VignetteEffect = {
  amount: 0,
  midpoint: 50,
  roundness: 0,
  feather: 50,
  highlights: 0,
};

export const DEFAULT_GRAIN: GrainEffect = {
  amount: 0,
  size: 25,
  roughness: 50,
};

export const DEFAULT_SHARPENING: SharpeningDetail = {
  amount: 0,
  radius: 1.0,
  detail: 25,
  masking: 0,
};

export const DEFAULT_NOISE_REDUCTION: NoiseReductionDetail = {
  luminance: 0,
  detail: 50,
  contrast: 0,
};

export const DEFAULT_COLOR_NOISE: ColorNoiseReductionDetail = {
  amount: 0,
  detail: 50,
  smoothness: 50,
};

export const DEFAULT_BW_MIX: BwMix = {
  red: 40,
  orange: 60,
  yellow: 80,
  green: 40,
  aqua: 60,
  blue: 20,
  purple: 60,
  magenta: 80,
};

export const DEFAULT_LENS_CORRECTIONS: LensCorrections = {
  distortion: 0,
  vignette: 0,
  chromaticAberration: false,
  enabled: false,
};

export const DEFAULT_GEOMETRY: GeometryTransform = {
  perspectiveHorizontal: 0,
  perspectiveVertical: 0,
  rotate: 0,
  scale: 100,
  offsetDistortX: 0,
  offsetDistortY: 0,
  perspectiveMode: 'off',
};

export type PresetCategoryId =
  | 'basic'
  | 'cinematic'
  | 'vintage'
  | 'bw'
  | 'warm'
  | 'cool'
  | 'portrait'
  | 'artistic'
  | 'point'
  | 'blur'
  | 'noise'
  | 'sharpen'
  | 'edges'
  | 'morphology'
  | 'histogram'
  | 'frequency';

export interface FilterPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  category: PresetCategoryId;
  descriptionAr: string;
  descriptionEn: string;
  previewGradient: string;
  filters: Partial<LayerFilters>;
}

export interface PresetCategory {
  id: PresetCategoryId;
  nameAr: string;
  nameEn: string;
  iconName: string;
}

export const PRESET_CATEGORIES: PresetCategory[] = [
  { id: 'basic', nameAr: 'الأساسية والمثالية', nameEn: 'Basic & Clean', iconName: 'Sun' },
  { id: 'cinematic', nameAr: 'السينمائية والدرامية', nameEn: 'Cinematic', iconName: 'Film' },
  { id: 'vintage', nameAr: 'الكلاسيكية والفينتاج', nameEn: 'Vintage & Film', iconName: 'Clock' },
  { id: 'bw', nameAr: 'الأبيض والأسود الفاخر', nameEn: 'Black & White', iconName: 'Contrast' },
  { id: 'warm', nameAr: 'الدافئة والساعة الذهبية', nameEn: 'Warm & Golden', iconName: 'Flame' },
  { id: 'cool', nameAr: 'الباردة والزرقاء', nameEn: 'Cool & Nordic', iconName: 'Snowflake' },
  { id: 'portrait', nameAr: 'البورتريه والبشرة', nameEn: 'Portrait & Skin', iconName: 'User' },
  { id: 'artistic', nameAr: 'الفنية والإبداعية', nameEn: 'Artistic & Mood', iconName: 'Palette' },
  ...NEW_FILTER_CATEGORIES,
];

export const LIGHTROOM_PRESETS: FilterPreset[] = [
  // 1. Basic
  {
    id: 'original',
    nameAr: 'الأصلي (بدون تعديل)',
    nameEn: 'Original',
    category: 'basic',
    descriptionAr: 'الصورة الأصلية النقية بدون أي معالجة إضافية',
    descriptionEn: 'Original untouched image',
    previewGradient: 'from-slate-400 to-slate-600',
    filters: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      exposure: 0,
      highlights: 0,
      shadows: 0,
      whites: 0,
      blacks: 0,
      temperature: 0,
      tint: 0,
      vibrance: 0,
      clarity: 0,
      texture: 0,
      dehaze: 0,
    },
  },
  {
    id: 'auto_pro',
    nameAr: 'التحسين التلقائي الذكي',
    nameEn: 'Auto Enhance Pro',
    category: 'basic',
    descriptionAr: 'توازن دقيق بين الإضاءة والتباين وتشبع الألوان الطبيعية',
    descriptionEn: 'Intelligent light balancing and vivid natural colors',
    previewGradient: 'from-amber-400 to-blue-500',
    filters: {
      brightness: 105,
      contrast: 110,
      saturation: 112,
      exposure: 5,
      highlights: -15,
      shadows: 20,
      whites: 10,
      blacks: -10,
      vibrance: 15,
      clarity: 12,
      texture: 10,
      dehaze: 8,
    },
  },
  {
    id: 'crisp_studio',
    nameAr: 'إضاءة الاستوديو النقية',
    nameEn: 'Crisp Studio',
    category: 'basic',
    descriptionAr: 'وضوح عالٍ وألوان دقيقة مخصصة للكتالوجات والمنتجات',
    descriptionEn: 'High contrast and studio clarity for crisp product shots',
    previewGradient: 'from-sky-300 to-indigo-500',
    filters: {
      brightness: 104,
      contrast: 115,
      saturation: 105,
      exposure: 8,
      highlights: -20,
      shadows: 15,
      whites: 15,
      blacks: -5,
      clarity: 20,
      texture: 15,
      sharpness: 25,
    },
  },
  {
    id: 'natural_boost',
    nameAr: 'حيوية طبيعية متوازنة',
    nameEn: 'Natural Boost',
    category: 'basic',
    descriptionAr: 'إبراز التفاصيل والظلال بلطف ودون مبالغة',
    descriptionEn: 'Gentle enhancement of natural shadows and vibrant colors',
    previewGradient: 'from-emerald-400 to-teal-600',
    filters: {
      brightness: 102,
      contrast: 106,
      saturation: 110,
      shadows: 25,
      highlights: -10,
      vibrance: 20,
      temperature: 4,
      texture: 8,
    },
  },

  // 2. Cinematic
  {
    id: 'teal_orange',
    nameAr: 'تيل & أورانج (هوليوود)',
    nameEn: 'Teal & Orange',
    category: 'cinematic',
    descriptionAr: 'التدرج السينمائي الأيقوني مع تباين أزرق في الظلال وبرتقالي في الإضاءة',
    descriptionEn: 'Iconic Hollywood blockbuster color grade with teal shadows and warm orange lights',
    previewGradient: 'from-orange-500 to-teal-700',
    filters: {
      contrast: 118,
      saturation: 110,
      exposure: -2,
      highlights: -15,
      shadows: 10,
      temperature: 12,
      tint: -6,
      clarity: 16,
      dehaze: 10,
      colorGrading: {
        shadows: { hue: 195, saturation: 45, luminance: -10 },
        midtones: { hue: 35, saturation: 20, luminance: 0 },
        highlights: { hue: 38, saturation: 50, luminance: 10 },
        blending: 60,
        balance: 10,
      },
      vignette: { amount: -25, midpoint: 45, roundness: 0, feather: 60, highlights: 20 },
    },
  },
  {
    id: 'moody_dark',
    nameAr: 'الدراما الغامضة (Dark Moody)',
    nameEn: 'Dark & Moody',
    category: 'cinematic',
    descriptionAr: 'ظلال عميقة وتفاصيل سينمائية غنية للأفلام الدرامية',
    descriptionEn: 'Deep rich shadows and atmospheric subdued tones',
    previewGradient: 'from-slate-800 to-indigo-950',
    filters: {
      contrast: 125,
      saturation: 85,
      exposure: -12,
      highlights: -35,
      shadows: -15,
      blacks: -25,
      clarity: 25,
      texture: 20,
      dehaze: 18,
      vignette: { amount: -45, midpoint: 40, roundness: -10, feather: 70, highlights: 15 },
      colorGrading: {
        shadows: { hue: 220, saturation: 35, luminance: -15 },
        midtones: { hue: 200, saturation: 15, luminance: -5 },
        highlights: { hue: 45, saturation: 25, luminance: 5 },
        blending: 50,
        balance: -10,
      },
    },
  },
  {
    id: 'cyberpunk_neon',
    nameAr: 'سايبر بانك (نيون ليلي)',
    nameEn: 'Cyberpunk Neon',
    category: 'cinematic',
    descriptionAr: 'أضواء نيون فاقعة بدرجات الأزرق والأرجواني اللامع',
    descriptionEn: 'Futuristic electric magenta and cyan nightlife vibes',
    previewGradient: 'from-fuchsia-600 to-cyan-500',
    filters: {
      contrast: 130,
      saturation: 135,
      exposure: 5,
      highlights: 20,
      shadows: -20,
      vibrance: 40,
      clarity: 30,
      colorGrading: {
        shadows: { hue: 275, saturation: 60, luminance: -10 },
        midtones: { hue: 310, saturation: 40, luminance: 0 },
        highlights: { hue: 185, saturation: 70, luminance: 20 },
        blending: 70,
        balance: 20,
      },
    },
  },

  // 3. Vintage
  {
    id: 'classic_kodak',
    nameAr: 'فيلم كوداك الكلاسيكي',
    nameEn: 'Kodak Film Classic',
    category: 'vintage',
    descriptionAr: 'درجات دافئة طبيعية وملمس حبيبات الفيلم القديم',
    descriptionEn: 'Timeless warmth with nostalgic 35mm film emulation',
    previewGradient: 'from-amber-600 to-yellow-800',
    filters: {
      contrast: 108,
      saturation: 95,
      temperature: 18,
      tint: 8,
      highlights: -20,
      shadows: 25,
      blacks: 15,
      texture: 15,
      grain: { amount: 35, size: 30, roughness: 60 },
      vignette: { amount: -20, midpoint: 55, roundness: 10, feather: 50, highlights: 30 },
    },
  },
  {
    id: 'faded_polaroid',
    nameAr: 'بولارويد باهت (Polaroid)',
    nameEn: 'Faded Polaroid',
    category: 'vintage',
    descriptionAr: 'ظلال مرتفعة وصبغة حنين مستوحاة من كاميرات الفورية',
    descriptionEn: 'Lifted matte shadows and soft nostalgic vintage glow',
    previewGradient: 'from-rose-300 to-amber-200',
    filters: {
      contrast: 90,
      saturation: 85,
      brightness: 106,
      exposure: 6,
      shadows: 40,
      blacks: 30,
      temperature: 10,
      tint: 12,
      grain: { amount: 25, size: 25, roughness: 45 },
    },
  },
  {
    id: 'retro_70s',
    nameAr: 'السبعينات الذهبية',
    nameEn: '70s Warm Retro',
    category: 'vintage',
    descriptionAr: 'ألوان ترابية غنية وطابع عتيق دافئ',
    descriptionEn: 'Rich earth tones and golden sunshine from the 1970s',
    previewGradient: 'from-yellow-600 to-amber-900',
    filters: {
      contrast: 112,
      saturation: 105,
      temperature: 24,
      tint: 6,
      highlights: -15,
      shadows: 15,
      vibrance: 20,
      colorGrading: {
        shadows: { hue: 40, saturation: 35, luminance: 0 },
        midtones: { hue: 30, saturation: 20, luminance: 5 },
        highlights: { hue: 50, saturation: 40, luminance: 10 },
        blending: 50,
        balance: 0,
      },
    },
  },

  // 4. Black & White
  {
    id: 'bw_noir_fineart',
    nameAr: 'نوار كلاسيكي فاخر (Fine Art Noir)',
    nameEn: 'Fine Art Noir',
    category: 'bw',
    descriptionAr: 'تباين مذهل وعمق درامي للأبيض والأسود الفني',
    descriptionEn: 'High contrast monochrome with rich dynamic blacks',
    previewGradient: 'from-zinc-900 via-neutral-600 to-zinc-200',
    filters: {
      bwEnabled: true,
      contrast: 145,
      saturation: 0,
      exposure: 0,
      highlights: 25,
      shadows: -30,
      whites: 35,
      blacks: -40,
      clarity: 35,
      texture: 25,
      sharpness: 30,
      bwMix: { red: 50, orange: 65, yellow: 90, green: 35, aqua: 50, blue: 15, purple: 45, magenta: 70 },
      vignette: { amount: -35, midpoint: 40, roundness: 0, feather: 65, highlights: 10 },
    },
  },
  {
    id: 'bw_silver_gelatin',
    nameAr: 'الفضة والجيلاتين الناعم',
    nameEn: 'Silver Gelatin',
    category: 'bw',
    descriptionAr: 'درجات رمادية ناعمة ومتدرجة تشبه طباعة الغرف المظلمة',
    descriptionEn: 'Silky smooth grayscale gradations inspired by darkroom prints',
    previewGradient: 'from-stone-800 to-stone-400',
    filters: {
      bwEnabled: true,
      contrast: 105,
      saturation: 0,
      exposure: 4,
      highlights: -15,
      shadows: 20,
      whites: 10,
      blacks: 5,
      clarity: 10,
      grain: { amount: 20, size: 20, roughness: 40 },
    },
  },
  {
    id: 'bw_dramatic_charcoal',
    nameAr: 'الفحم الدرامي (High Contrast)',
    nameEn: 'Dramatic Charcoal',
    category: 'bw',
    descriptionAr: 'تأثير الفحم الحاد مع إبراز التفاصيل المعمارية والوجوه',
    descriptionEn: 'Punchy stark black & white with accentuated structure',
    previewGradient: 'from-black to-slate-700',
    filters: {
      bwEnabled: true,
      contrast: 160,
      saturation: 0,
      exposure: -5,
      highlights: 30,
      shadows: -45,
      whites: 40,
      blacks: -55,
      clarity: 45,
      texture: 35,
      dehaze: 20,
    },
  },

  // 5. Warm
  {
    id: 'golden_hour',
    nameAr: 'الساعة الذهبية (Golden Hour)',
    nameEn: 'Golden Hour Sunset',
    category: 'warm',
    descriptionAr: 'وهج الغروب الذهبي الساحر وألوان دافئة تشع بالحياة',
    descriptionEn: 'Luminous golden hour sunset glow with rich amber warmth',
    previewGradient: 'from-amber-500 via-orange-400 to-yellow-300',
    filters: {
      contrast: 110,
      saturation: 120,
      temperature: 35,
      tint: 10,
      highlights: -25,
      shadows: 20,
      vibrance: 30,
      clarity: 10,
      colorGrading: {
        shadows: { hue: 30, saturation: 40, luminance: 0 },
        midtones: { hue: 40, saturation: 30, luminance: 5 },
        highlights: { hue: 48, saturation: 55, luminance: 15 },
        blending: 65,
        balance: 15,
      },
    },
  },
  {
    id: 'desert_amber',
    nameAr: 'عنبر الصحراء الدافئ',
    nameEn: 'Desert Amber',
    category: 'warm',
    descriptionAr: 'نغمات رملية دافئة وتباين عميق للضوء والظلال',
    descriptionEn: 'Earthy desert tones with golden sand highlights',
    previewGradient: 'from-yellow-700 via-amber-600 to-orange-400',
    filters: {
      contrast: 115,
      saturation: 115,
      temperature: 28,
      tint: 4,
      highlights: -15,
      shadows: 15,
      texture: 18,
      clarity: 15,
    },
  },

  // 6. Cool
  {
    id: 'blue_hour',
    nameAr: 'الساعة الزرقاء (Blue Hour)',
    nameEn: 'Blue Hour Twilight',
    category: 'cool',
    descriptionAr: 'سكينة الغسق وأضواء الشفق الباردة المتوازنة',
    descriptionEn: 'Serene blue hour twilight with cool cobalt tones',
    previewGradient: 'from-blue-900 via-indigo-700 to-sky-400',
    filters: {
      contrast: 112,
      saturation: 108,
      temperature: -32,
      tint: 12,
      highlights: -20,
      shadows: 20,
      vibrance: 25,
      colorGrading: {
        shadows: { hue: 225, saturation: 45, luminance: -5 },
        midtones: { hue: 210, saturation: 25, luminance: 0 },
        highlights: { hue: 195, saturation: 35, luminance: 10 },
        blending: 50,
        balance: -5,
      },
    },
  },
  {
    id: 'nordic_frost',
    nameAr: 'الصقيع الإسكندنافي (Nordic Frost)',
    nameEn: 'Nordic Frost',
    category: 'cool',
    descriptionAr: 'نقاء ثلجي ودرجات زرقاء مائية منعشة ومصقولة',
    descriptionEn: 'Crisp arctic clarity and icy blue highlights',
    previewGradient: 'from-cyan-700 via-teal-500 to-blue-300',
    filters: {
      contrast: 118,
      saturation: 92,
      temperature: -25,
      tint: -8,
      exposure: 6,
      highlights: 15,
      shadows: -10,
      clarity: 25,
      texture: 15,
      dehaze: 12,
    },
  },

  // 7. Portrait
  {
    id: 'portrait_soft_glow',
    nameAr: 'بورتريه النعومة والوهج',
    nameEn: 'Soft Glow Portrait',
    category: 'portrait',
    descriptionAr: 'تنعيم البشرة والحفاظ على درجات لون الجلد الطبيعية الجذابة',
    descriptionEn: 'Flattering skin tones with soft highlight diffusion',
    previewGradient: 'from-rose-400 via-amber-300 to-orange-200',
    filters: {
      contrast: 98,
      saturation: 105,
      brightness: 104,
      exposure: 4,
      highlights: -25,
      shadows: 30,
      temperature: 8,
      tint: 6,
      clarity: -12,
      texture: -8,
      vibrance: 12,
      hslMixer: {
        ...DEFAULT_HSL_MIXER,
        orange: { hue: 0, saturation: 10, luminance: 15 },
        red: { hue: 2, saturation: 5, luminance: 8 },
        yellow: { hue: -5, saturation: 8, luminance: 10 },
      },
    },
  },
  {
    id: 'portrait_studio_velvet',
    nameAr: 'مخمل الاستوديو (Studio Velvet)',
    nameEn: 'Studio Velvet',
    category: 'portrait',
    descriptionAr: 'إضاءة استوديو متقنة مع تفاصيل عيون حادة وتباين ناعم',
    descriptionEn: 'High-end commercial portrait grade with defined eyes and silky skin',
    previewGradient: 'from-amber-700 via-stone-500 to-stone-300',
    filters: {
      contrast: 112,
      saturation: 102,
      brightness: 102,
      highlights: -20,
      shadows: 18,
      whites: 12,
      blacks: -8,
      clarity: 8,
      sharpness: 20,
      vibrance: 15,
    },
  },

  // 8. Artistic
  {
    id: 'matte_pastel',
    nameAr: 'الباستيل المطفي (Matte Pastel)',
    nameEn: 'Matte Pastel',
    category: 'artistic',
    descriptionAr: 'ألوان باستيلية هادئة بلمسة مطفية جذابة للتصميم العصري',
    descriptionEn: 'Dreamy muted pastel tones with lifted matte blacks',
    previewGradient: 'from-pink-300 via-purple-300 to-indigo-300',
    filters: {
      contrast: 88,
      saturation: 115,
      brightness: 108,
      shadows: 45,
      blacks: 35,
      highlights: -15,
      vibrance: 25,
      temperature: 5,
      tint: 15,
    },
  },
  {
    id: 'moody_emerald',
    nameAr: 'الزمرد الغامض (Emerald Forest)',
    nameEn: 'Emerald Forest',
    category: 'artistic',
    descriptionAr: 'درجات خضراء عميقة ولمسة سرية ساحرة للطبيعة',
    descriptionEn: 'Lush atmospheric emerald greens and moody dark ambiance',
    previewGradient: 'from-emerald-950 via-teal-800 to-green-600',
    filters: {
      contrast: 122,
      saturation: 112,
      exposure: -8,
      shadows: -15,
      highlights: -25,
      temperature: -10,
      tint: -15,
      clarity: 22,
      dehaze: 15,
      colorGrading: {
        shadows: { hue: 155, saturation: 40, luminance: -10 },
        midtones: { hue: 140, saturation: 25, luminance: 0 },
        highlights: { hue: 90, saturation: 35, luminance: 10 },
        blending: 50,
        balance: 0,
      },
    },
  },
  // =========================================================================
  // Genuinely Expanded Real Image-Processing Filters (64 Mathematical Engines)
  // =========================================================================
  ...IMAGE_PROCESSING_PRESETS,
];

export interface CameraProfileItem {
  id: CameraProfile;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export const CAMERA_PROFILES: CameraProfileItem[] = [
  {
    id: 'adobe_color',
    nameAr: 'Adobe Color (الافتراضي)',
    nameEn: 'Adobe Color (Default)',
    descriptionAr: 'ألوان غنية ومتوازنة تناسب جميع أنواع التصوير',
    descriptionEn: 'Rich, natural, and balanced rendering for all scenes',
  },
  {
    id: 'neutral',
    nameAr: 'محايد (Adobe Neutral)',
    nameEn: 'Adobe Neutral',
    descriptionAr: 'نطاق ديناميكي واسع بألوان مسطحة مثالية للتعديل العميق',
    descriptionEn: 'Flat profile with high dynamic range for flexible grading',
  },
  {
    id: 'vivid',
    nameAr: 'حيوي وزاهي (Adobe Vivid)',
    nameEn: 'Adobe Vivid',
    descriptionAr: 'تشبع لوني قوي وتباين ساطع يلفت الأنظار',
    descriptionEn: 'Punchy contrast and vibrant saturated tones',
  },
  {
    id: 'portrait',
    nameAr: 'بورتريه (Adobe Portrait)',
    nameEn: 'Adobe Portrait',
    descriptionAr: 'معالجة مخصصة لتفتيح ونقاء درجات البشرة',
    descriptionEn: 'Optimized for flattering and natural skin tones',
  },
  {
    id: 'landscape',
    nameAr: 'مناظر طبيعية (Landscape)',
    nameEn: 'Adobe Landscape',
    descriptionAr: 'إبراز زرقة السماء وخضرة الطبيعة بأعلى تباين',
    descriptionEn: 'Deep blues and vivid greens for striking landscape shots',
  },
  {
    id: 'monochrome',
    nameAr: 'أحادي اللون (Monochrome)',
    nameEn: 'Adobe Monochrome',
    descriptionAr: 'تحويل احترافي أحادي باللونين الأبيض والأسود',
    descriptionEn: 'Clean, professional single-channel black and white conversion',
  },
  {
    id: 'vintage',
    nameAr: 'أرشيف كلاسيكي (Vintage)',
    nameEn: 'Adobe Vintage',
    descriptionAr: 'نغمات دافئة تمنح شعور الأفلام التناظرية',
    descriptionEn: 'Subtle warm analog film characteristic base',
  },
  {
    id: 'artistic',
    nameAr: 'طابع فني (Artistic)',
    nameEn: 'Adobe Artistic',
    descriptionAr: 'تدرج فني مميز مع تباين ألوان متقدم',
    descriptionEn: 'Creative color mapping for stylized artwork',
  },
];
