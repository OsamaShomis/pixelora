import { Layer, EffectType, LayerFilters } from '../types';
import { DEFAULT_FILTERS } from '../data/sampleProjects';

export function getEffectLayerName(
  effectType: EffectType,
  filters: Partial<LayerFilters>,
  isAr: boolean
): string {
  switch (effectType) {
    case 'blur':
      return isAr ? 'تأثير تمويه (Blur)' : 'Blur Effect';
    case 'brightness':
      return isAr ? 'تعديل السطوع (Brightness)' : 'Brightness Adjustment';
    case 'contrast':
      return isAr ? 'تعديل التباين (Contrast)' : 'Contrast Adjustment';
    case 'exposure':
      return isAr ? 'تعديل التعريض (Exposure)' : 'Exposure Adjustment';
    case 'highlights':
      return isAr ? 'إضاءات عالية (Highlights)' : 'Highlights Adjustment';
    case 'shadows':
      return isAr ? 'تعديل الظلال (Shadows)' : 'Shadows Adjustment';
    case 'whites':
      return isAr ? 'درجات بيضاء (Whites)' : 'Whites Adjustment';
    case 'blacks':
      return isAr ? 'درجات سوداء (Blacks)' : 'Blacks Adjustment';
    case 'temperature':
      return isAr ? 'حرارة اللون (Temperature)' : 'Temperature Adjustment';
    case 'tint':
      return isAr ? 'صبغة اللون (Tint)' : 'Tint Adjustment';
    case 'saturation':
      return isAr ? 'تشبع الألوان (Saturation)' : 'Saturation Adjustment';
    case 'vibrance':
      return isAr ? 'حيوية الألوان (Vibrance)' : 'Vibrance Adjustment';
    case 'clarity':
      return isAr ? 'وضوح ونقاء (Clarity)' : 'Clarity Adjustment';
    case 'sharpen':
      return isAr ? 'حدة وتفاصيل (Sharpen)' : 'Sharpen & Detail';
    case 'noise_reduction':
      return isAr ? 'تنقية الضوضاء (Noise Reduction)' : 'Noise Reduction';
    case 'color_grading':
      return isAr ? 'تلوين سينمائي (Color Grading)' : 'Color Grading Effect';
    case 'curves':
      return isAr ? 'منحنيات النغمة (Tone Curves)' : 'Tone Curves Layer';
    case 'hsl':
      return isAr ? 'محرر ألوان (HSL Mixer)' : 'HSL Color Mixer';
    case 'grain':
      return isAr ? 'حبيبات فيلم (Film Grain)' : 'Film Grain Layer';
    case 'vignette':
      return isAr ? 'تعتيم الحواف (Vignette)' : 'Vignette Layer';
    case 'filter':
      return filters.presetFilter && filters.presetFilter !== 'none'
        ? isAr
          ? `فلتر: ${filters.presetFilter}`
          : `Filter: ${filters.presetFilter}`
        : isAr
        ? 'فلتر مسبق الإعداد'
        : 'Photo Filter Layer';
    default:
      return isAr ? 'طبقة تأثيرات' : 'Effect Layer';
  }
}

/**
 * Maps a specific field from LayerFilters to its corresponding EffectType
 */
export function getEffectTypeForField(key: keyof LayerFilters): EffectType {
  switch (key) {
    case 'brightness':
      return 'brightness';
    case 'contrast':
      return 'contrast';
    case 'exposure':
      return 'exposure';
    case 'highlights':
      return 'highlights';
    case 'shadows':
      return 'shadows';
    case 'whites':
      return 'whites';
    case 'blacks':
      return 'blacks';
    case 'temperature':
      return 'temperature';
    case 'tint':
      return 'tint';
    case 'saturation':
      return 'saturation';
    case 'vibrance':
      return 'vibrance';
    case 'clarity':
    case 'texture':
    case 'dehaze':
      return 'clarity';
    case 'blur':
      return 'blur';
    case 'sharpness':
    case 'sharpeningDetail':
      return 'sharpen';
    case 'noiseReduction':
    case 'colorNoiseReduction':
      return 'noise_reduction';
    case 'hslMixer':
      return 'hsl';
    case 'toneCurves':
      return 'curves';
    case 'colorGrading':
      return 'color_grading';
    case 'grain':
      return 'grain';
    case 'vignette':
      return 'vignette';
    case 'presetFilter':
    case 'presetIntensity':
      return 'filter';
    default:
      return 'adjustment';
  }
}

/**
 * Isolates parameters for a specific effect layer so it only modifies
 * its intended effect without unintended bleeding of other adjustments.
 */
export function isolateEffectFilters(
  effectType: EffectType,
  incoming: Partial<LayerFilters>
): LayerFilters {
  const base: LayerFilters = { ...DEFAULT_FILTERS };

  switch (effectType) {
    case 'brightness':
      base.brightness = incoming.brightness ?? 125;
      break;
    case 'contrast':
      base.contrast = incoming.contrast ?? 120;
      break;
    case 'exposure':
      base.exposure = incoming.exposure ?? 25;
      break;
    case 'highlights':
      base.highlights = incoming.highlights ?? 30;
      break;
    case 'shadows':
      base.shadows = incoming.shadows ?? 20;
      break;
    case 'whites':
      base.whites = incoming.whites ?? 20;
      break;
    case 'blacks':
      base.blacks = incoming.blacks ?? -20;
      break;
    case 'temperature':
      base.temperature = incoming.temperature ?? 15;
      break;
    case 'tint':
      base.tint = incoming.tint ?? 10;
      break;
    case 'saturation':
      base.saturation = incoming.saturation ?? 130;
      break;
    case 'vibrance':
      base.vibrance = incoming.vibrance ?? 25;
      break;
    case 'clarity':
      base.clarity = incoming.clarity ?? 25;
      base.texture = incoming.texture ?? 0;
      base.dehaze = incoming.dehaze ?? 0;
      break;
    case 'blur':
      base.blur = incoming.blur ?? 15;
      break;
    case 'sharpen':
      base.sharpness = incoming.sharpness ?? 40;
      if (incoming.sharpeningDetail) {
        base.sharpeningDetail = incoming.sharpeningDetail;
      }
      break;
    case 'noise_reduction':
      if (incoming.noiseReduction) {
        base.noiseReduction = { ...incoming.noiseReduction };
      }
      if (incoming.colorNoiseReduction) {
        base.colorNoiseReduction = { ...incoming.colorNoiseReduction };
      }
      break;
    case 'hsl':
      if (incoming.hslMixer) {
        base.hslMixer = JSON.parse(JSON.stringify(incoming.hslMixer));
      }
      break;
    case 'curves':
      if (incoming.toneCurves) {
        base.toneCurves = JSON.parse(JSON.stringify(incoming.toneCurves));
      }
      break;
    case 'color_grading':
      if (incoming.colorGrading) {
        base.colorGrading = JSON.parse(JSON.stringify(incoming.colorGrading));
      } else {
        base.colorGrading = {
          shadows: { hue: 210, saturation: 30, luminance: -10 },
          midtones: { hue: 45, saturation: 15, luminance: 0 },
          highlights: { hue: 35, saturation: 25, luminance: 10 },
          blending: 50,
          balance: 0,
        };
      }
      break;
    case 'grain':
      base.grain = incoming.grain ? { ...incoming.grain } : { amount: 35, size: 25, roughness: 50 };
      break;
    case 'vignette':
      base.vignette = incoming.vignette ?? 40;
      break;
    case 'filter':
      base.presetFilter = incoming.presetFilter ?? 'vintage';
      base.presetIntensity = incoming.presetIntensity ?? 100;
      break;
    default:
      return { ...DEFAULT_FILTERS, ...incoming };
  }

  return base;
}

/**
 * Creates a brand new, non-destructive Effect Layer
 */
export function createEffectLayer(
  effectType: EffectType,
  canvasWidth: number,
  canvasHeight: number,
  initialFilters?: Partial<LayerFilters>,
  isAr: boolean = false
): Layer {
  const isolated = isolateEffectFilters(effectType, initialFilters || {});
  const name = getEffectLayerName(effectType, isolated, isAr);

  return {
    id: 'effect_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    name,
    type: 'effect',
    effectType,
    x: 0,
    y: 0,
    width: Math.max(1, Math.round(canvasWidth)),
    height: Math.max(1, Math.round(canvasHeight)),
    rotation: 0,
    opacity: 100,
    visible: true,
    locked: false,
    zIndex: 10,
    filters: isolated,
  };
}

/**
 * Migrates legacy projects where filters were stored on base Image layers
 * into clean, non-destructive Effect Layers placed right above them.
 */
export function migrateLayersToEffectLayers(
  layers: Layer[],
  canvasWidth: number,
  canvasHeight: number,
  isAr: boolean = false
): Layer[] {
  if (!Array.isArray(layers)) {
    return [];
  }
  const result: Layer[] = [];
  let currentZ = 1;

  for (const layer of layers) {
    if (!layer) continue;
    if (layer.type === 'effect') {
      result.push({ ...layer, zIndex: currentZ++ });
      continue;
    }

    const filters = layer.filters;
    const hasLegacyFilters =
      filters &&
      (filters.presetFilter !== undefined && filters.presetFilter !== 'none' ||
        (filters.brightness !== undefined && filters.brightness !== 100) ||
        (filters.contrast !== undefined && filters.contrast !== 100) ||
        (filters.saturation !== undefined && filters.saturation !== 100) ||
        (filters.blur !== undefined && filters.blur > 0) ||
        (filters.sharpness !== undefined && filters.sharpness > 0) ||
        (filters.exposure !== undefined && filters.exposure !== 0) ||
        (filters.temperature !== undefined && filters.temperature !== 0) ||
        Boolean(filters.colorGrading) ||
        Boolean(filters.toneCurves) ||
        Boolean(filters.hslMixer));

    if (layer.type === 'image' && hasLegacyFilters) {
      // Keep base image with reset default filters (non-destructive)
      const cleanImageLayer: Layer = {
        ...layer,
        zIndex: currentZ++,
        filters: { ...DEFAULT_FILTERS },
      };
      result.push(cleanImageLayer);

      // Extract filter preset into its own Effect Layer if present
      if (filters.presetFilter && filters.presetFilter !== 'none') {
        const filterLayer = createEffectLayer(
          'filter',
          canvasWidth,
          canvasHeight,
          { presetFilter: filters.presetFilter, presetIntensity: filters.presetIntensity ?? 100 },
          isAr
        );
        filterLayer.zIndex = currentZ++;
        result.push(filterLayer);
      }

      // Extract brightness if modified
      if (filters.brightness !== undefined && filters.brightness !== 100) {
        const bLayer = createEffectLayer(
          'brightness',
          canvasWidth,
          canvasHeight,
          { brightness: filters.brightness },
          isAr
        );
        bLayer.zIndex = currentZ++;
        result.push(bLayer);
      }

      // Extract contrast if modified
      if (filters.contrast !== undefined && filters.contrast !== 100) {
        const cLayer = createEffectLayer(
          'contrast',
          canvasWidth,
          canvasHeight,
          { contrast: filters.contrast },
          isAr
        );
        cLayer.zIndex = currentZ++;
        result.push(cLayer);
      }

      // Extract blur if present
      if (filters.blur !== undefined && filters.blur > 0) {
        const blurLayer = createEffectLayer(
          'blur',
          canvasWidth,
          canvasHeight,
          { blur: filters.blur },
          isAr
        );
        blurLayer.zIndex = currentZ++;
        result.push(blurLayer);
      }
    } else {
      result.push({ ...layer, zIndex: currentZ++ });
    }
  }

  return result;
}
