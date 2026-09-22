import { SavedProject, EditorState, LayerFilters } from '../types';

export const DEFAULT_FILTERS: LayerFilters = {
  // Light & Color
  brightness: 100,
  contrast: 100,
  exposure: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  saturation: 100,
  vibrance: 0,
  temperature: 0,
  tint: 0,
  hue: 0,

  // Details
  sharpness: 0,
  blur: 0,
  clarity: 0,

  // Effects
  vignette: 0,
  grayscale: 0,
  sepia: 0,
  invert: 0,

  // General
  opacity: 100,
  presetFilter: 'none',
  presetIntensity: 100,
};

export const INITIAL_EDITOR_STATE: EditorState = {
  projectName: 'تصميم جديد - بيكسلورا',
  canvasWidth: 1080,
  canvasHeight: 1080,
  layers: [],
  selectedLayerId: null,
  activeTool: 'select',
  zoom: 1,
  pan: { x: 0, y: 0 },
  background: {
    type: 'transparent',
    color: '#ffffff',
  },
  history: [],
  historyIndex: -1,
  exportSettings: {
    format: 'png',
    quality: 92,
    preserveTransparency: true,
    fileName: 'pixelora-design',
  },
};

export const SAMPLE_PROJECTS: SavedProject[] = [
  {
    id: 'proj-perfume-ecom',
    name: 'تصميم إعلان عطر فاخر - متجر إلكتروني',
    thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=400&q=80',
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    width: 1080,
    height: 1080,
    layersCount: 3,
    state: {
      ...INITIAL_EDITOR_STATE,
      projectName: 'تصميم إعلان عطر فاخر - متجر إلكتروني',
      canvasWidth: 1080,
      canvasHeight: 1080,
      background: {
        type: 'library',
        imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
      },
      layers: [
        {
          id: 'layer-perfume',
          name: 'زجاجة العطر (مفرغة)',
          type: 'image',
          source: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
          x: 290,
          y: 200,
          width: 500,
          height: 600,
          rotation: 0,
          opacity: 100,
          visible: true,
          zIndex: 1,
          filters: { ...DEFAULT_FILTERS, brightness: 105, contrast: 110, saturation: 115 },
        },
        {
          id: 'layer-title',
          name: 'عنوان المنتج',
          type: 'text',
          x: 240,
          y: 840,
          width: 600,
          height: 80,
          rotation: 0,
          opacity: 100,
          visible: true,
          zIndex: 2,
          filters: DEFAULT_FILTERS,
          textConfig: {
            text: 'عطر النخبة الملكي',
            fontSize: 42,
            fontFamily: 'Tajawal',
            color: '#172033',
            align: 'center',
            bold: true,
            italic: false,
            underline: false,
          },
        },
      ],
    },
  },
  {
    id: 'proj-sneakers-promo',
    name: 'بوستر حذاء رياضي - عرض خاص',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80',
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    width: 1080,
    height: 1350,
    layersCount: 2,
    state: {
      ...INITIAL_EDITOR_STATE,
      projectName: 'بوستر حذاء رياضي - عرض خاص',
      canvasWidth: 1080,
      canvasHeight: 1350,
      background: {
        type: 'gradient',
        gradient: { from: '#090d16', to: '#1e1b4b', angle: 135 },
      },
      layers: [
        {
          id: 'layer-sneaker',
          name: 'حذاء رياضي أحمر',
          type: 'image',
          source: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
          x: 140,
          y: 350,
          width: 800,
          height: 520,
          rotation: -12,
          opacity: 100,
          visible: true,
          zIndex: 1,
          filters: { ...DEFAULT_FILTERS, sharpness: 20, contrast: 115 },
        },
      ],
    },
  },
];
