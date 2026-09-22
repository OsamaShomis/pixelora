import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Camera,
  ShoppingBag,
  Crown,
  Trees,
  Square,
  Film,
  Palette,
  Box,
  Wind,
  Layers,
  Sliders,
  Scissors,
  Eye,
  Check,
  RotateCcw,
  SunMedium,
  Sun,
  Maximize2,
  AlignCenter,
  Move,
  Upload,
  Gem,
} from 'lucide-react';
import {
  EditorState,
  Layer,
  ProductScene,
  SceneCategoryId,
  PodiumType,
  LightingType,
  LayerShadow,
} from '../../types';
import { SCENE_CATEGORIES, PRODUCT_SCENES } from '../../data/productScenes';
import {
  autoPlaceProduct,
  centerProductInCanvas,
  fitProductToCanvas,
  createPodiumLayer,
  createLightingLayer,
} from '../../utils/productAutoPlacement';

interface ProductStudioPanelProps {
  state: EditorState;
  onUpdateState: (updater: (prev: EditorState) => EditorState) => void;
  onAutoRemoveBg?: () => Promise<void>;
  isRemovingBg?: boolean;
  language: 'ar' | 'en';
  darkMode: boolean;
  onShowNotification?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProductStudioPanel: React.FC<ProductStudioPanelProps> = ({
  state,
  onUpdateState,
  onAutoRemoveBg,
  isRemovingBg = false,
  language,
  darkMode,
  onShowNotification,
}) => {
  const isAr = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<SceneCategoryId>('all');
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  // Find currently selected layer or identify product layer (non-scene image layer)
  const productLayer = useMemo(() => {
    const layers = Array.isArray(state?.layers) ? state.layers : [];
    // 1. If currently selected layer is an image and not a scene layer
    if (state.selectedLayerId) {
      const selected = layers.find((l) => l.id === state.selectedLayerId);
      if (selected && selected.type === 'image' && !selected.isSceneLayer) {
        return selected;
      }
    }
    // 2. Find any image layer that is not a scene layer (podium/lighting)
    const candidates = layers.filter((l) => l.type === 'image' && !l.isSceneLayer);
    return candidates[candidates.length - 1] || null;
  }, [state.layers, state.selectedLayerId]);

  // Find scene layers if present
  const podiumLayer = useMemo(() => {
    const layers = Array.isArray(state?.layers) ? state.layers : [];
    return layers.find((l) => l.isSceneLayer && l.sceneRole === 'podium') || null;
  }, [state.layers]);

  const lightingLayer = useMemo(() => {
    const layers = Array.isArray(state?.layers) ? state.layers : [];
    return layers.find((l) => l.isSceneLayer && l.sceneRole === 'lighting') || null;
  }, [state.layers]);

  // Filter scenes by category
  const filteredScenes = useMemo(() => {
    if (selectedCategory === 'all') return PRODUCT_SCENES;
    return PRODUCT_SCENES.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera':
        return <Camera className="w-3.5 h-3.5" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'Crown':
        return <Crown className="w-3.5 h-3.5" />;
      case 'Gem':
        return <Gem className="w-3.5 h-3.5" />;
      case 'Trees':
        return <Trees className="w-3.5 h-3.5" />;
      case 'Square':
        return <Square className="w-3.5 h-3.5" />;
      case 'Film':
        return <Film className="w-3.5 h-3.5" />;
      case 'Palette':
        return <Palette className="w-3.5 h-3.5" />;
      case 'Box':
        return <Box className="w-3.5 h-3.5" />;
      case 'Wind':
        return <Wind className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  /**
   * Apply Scene: Non-destructively setups the composition:
   * 1. Preserves user's product layer and any non-scene layers.
   * 2. Sets background according to scene.
   * 3. Creates/replaces podium layer.
   * 4. Creates/replaces lighting overlay layer.
   * 5. Automatically sizes, centers, and anchors product onto the podium/surface.
   * 6. Configures realistic shadow according to scene.
   */
  const handleApplyScene = (scene: ProductScene) => {
    setActiveSceneId(scene.id);

    onUpdateState((prev) => {
      // 1. Separate user layers from existing scene layers
      const nonSceneLayers = prev.layers.filter((l) => !l.isSceneLayer);
      // Determine the product layer to position
      let targetProduct = nonSceneLayers.find((l) => l.type === 'image') || null;

      // 2. Build new scene layers
      const newLayers: Layer[] = [];
      let nextZIndex = 1;

      // Create podium layer if scene has one
      const newPodium = createPodiumLayer(scene, prev.canvasWidth, prev.canvasHeight, nextZIndex++);
      if (newPodium) {
        newLayers.push(newPodium);
      }

      // Position the product layer if it exists
      if (targetProduct) {
        const placement = autoPlaceProduct(targetProduct, prev.canvasWidth, prev.canvasHeight, scene);
        const updatedProduct: Layer = {
          ...targetProduct,
          x: placement.x,
          y: placement.y,
          width: placement.width,
          height: placement.height,
          zIndex: nextZIndex++,
          shadow: {
            ...scene.shadowDefaults,
          },
          sceneRole: 'product',
        };

        // Add user layers with updated product
        nonSceneLayers.forEach((l) => {
          if (l.id === targetProduct?.id) {
            newLayers.push(updatedProduct);
          } else {
            newLayers.push({ ...l, zIndex: nextZIndex++ });
          }
        });
      } else {
        // No product layer yet, retain existing user layers
        nonSceneLayers.forEach((l) => {
          newLayers.push({ ...l, zIndex: nextZIndex++ });
        });
      }

      // Create lighting overlay layer at the top if scene has one
      const newLighting = createLightingLayer(scene, prev.canvasWidth, prev.canvasHeight, nextZIndex++);
      if (newLighting) {
        newLayers.push(newLighting);
      }

      // 3. Update background config
      let newBackground = { ...prev.background };
      if (scene.background.type === 'color') {
        newBackground = { type: 'solid', color: scene.background.value };
      } else if (scene.background.type === 'gradient') {
        newBackground = {
          type: 'gradient',
          gradient: { from: '#6C4DFF', to: '#23B5D3', angle: 135 },
          color: scene.background.previewColor,
        };
      } else if (scene.background.type === 'image') {
        newBackground = {
          type: 'library',
          imageUrl: scene.background.value,
        };
      }

      return {
        ...prev,
        background: newBackground,
        layers: newLayers,
        selectedLayerId: targetProduct ? targetProduct.id : prev.selectedLayerId,
      };
    });

    onShowNotification?.(
      isAr
        ? `تم تطبيق مشهد "${scene.nameAr}" وترتيب الطبقات والظلال بنجاح`
        : `Applied scene "${scene.nameEn}" with smart placement and shadows`,
      'success'
    );
  };

  /**
   * Auto Place Product within current scene or canvas
   */
  const handleAutoPlaceProduct = () => {
    if (!productLayer) {
      onShowNotification?.(
        isAr ? 'يرجى تحديد أو رفع صورة منتج أولاً' : 'Please select or upload a product image first',
        'info'
      );
      return;
    }

    const currentScene = PRODUCT_SCENES.find((s) => s.id === activeSceneId) || PRODUCT_SCENES[0];

    onUpdateState((prev) => {
      const placement = autoPlaceProduct(productLayer, prev.canvasWidth, prev.canvasHeight, currentScene);
      return {
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === productLayer.id
            ? {
                ...l,
                x: placement.x,
                y: placement.y,
                width: placement.width,
                height: placement.height,
              }
            : l
        ),
      };
    });

    onShowNotification?.(
      isAr ? 'تم ضبط المحاذاة والارتكاز التلقائي للمنتج' : 'Product auto-placed and grounded',
      'success'
    );
  };

  /**
   * Center Product
   */
  const handleCenterProduct = () => {
    if (!productLayer) return;
    onUpdateState((prev) => {
      const res = centerProductInCanvas(productLayer, prev.canvasWidth, prev.canvasHeight);
      return {
        ...prev,
        layers: prev.layers.map((l) => (l.id === productLayer.id ? { ...l, x: res.x, y: res.y } : l)),
      };
    });
  };

  /**
   * Fit Product to Scene bounds
   */
  const handleFitProduct = () => {
    if (!productLayer) return;
    onUpdateState((prev) => {
      const res = fitProductToCanvas(productLayer, prev.canvasWidth, prev.canvasHeight);
      return {
        ...prev,
        layers: prev.layers.map((l) =>
          l.id === productLayer.id
            ? { ...l, x: res.x, y: res.y, width: res.width, height: res.height }
            : l
        ),
      };
    });
  };

  /**
   * Update Product Shadow settings
   */
  const handleUpdateShadow = (updater: (prevShadow: LayerShadow) => LayerShadow) => {
    if (!productLayer) return;
    const defaultShadow: LayerShadow = {
      enabled: true,
      color: '#000000',
      opacity: 50,
      blur: 20,
      distance: 10,
      angle: 90,
      type: 'contact',
    };

    onUpdateState((prev) => {
      return {
        ...prev,
        layers: prev.layers.map((l) => {
          if (l.id === productLayer.id) {
            const current = l.shadow || defaultShadow;
            return {
              ...l,
              shadow: updater(current),
            };
          }
          return l;
        }),
      };
    });
  };

  /**
   * Switch or toggle Podium
   */
  const handleSwitchPodium = (podiumType: PodiumType) => {
    onUpdateState((prev) => {
      // Remove existing podium layer
      const filtered = prev.layers.filter((l) => !(l.isSceneLayer && l.sceneRole === 'podium'));
      if (podiumType === 'none') {
        return { ...prev, layers: filtered };
      }

      // Create new podium layer
      const currentScene = PRODUCT_SCENES.find((s) => s.id === activeSceneId) || PRODUCT_SCENES[0];
      const dummyScene: ProductScene = {
        ...currentScene,
        podium: {
          type: podiumType,
          nameAr: 'منصة العرض',
          nameEn: 'Product Podium',
          widthRatio: 0.58,
          heightRatio: 0.22,
          yRatio: 0.70,
        },
      };

      const newPodium = createPodiumLayer(dummyScene, prev.canvasWidth, prev.canvasHeight, 1);
      const targetProd = filtered.find((l) => l.type === 'image' && !l.isSceneLayer);

      const finalLayers: Layer[] = [];
      if (newPodium) finalLayers.push(newPodium);
      filtered.forEach((l) => {
        finalLayers.push({
          ...l,
          zIndex: l.id === targetProd?.id ? 2 : l.zIndex + 1,
        });
      });

      return {
        ...prev,
        layers: finalLayers,
      };
    });
  };

  /**
   * Switch or toggle Lighting
   */
  const handleSwitchLighting = (lightType: LightingType) => {
    onUpdateState((prev) => {
      const filtered = prev.layers.filter((l) => !(l.isSceneLayer && l.sceneRole === 'lighting'));
      if (lightType === 'none') {
        return { ...prev, layers: filtered };
      }

      const currentScene = PRODUCT_SCENES.find((s) => s.id === activeSceneId) || PRODUCT_SCENES[0];
      const dummyScene: ProductScene = {
        ...currentScene,
        lighting: {
          type: lightType,
          nameAr: 'إضاءة المشهد',
          nameEn: 'Scene Lighting',
          opacity: 0.35,
        },
      };

      const maxZ = Math.max(...filtered.map((l) => l.zIndex), 0);
      const newLighting = createLightingLayer(dummyScene, prev.canvasWidth, prev.canvasHeight, maxZ + 1);

      return {
        ...prev,
        layers: newLighting ? [...filtered, newLighting] : filtered,
      };
    });
  };

  const currentShadow = productLayer?.shadow || {
    enabled: true,
    color: '#000000',
    opacity: 50,
    blur: 20,
    distance: 10,
    angle: 90,
    type: 'contact' as const,
  };

  return (
    <div id="product-studio-panel" className="space-y-6 pb-6">
      {/* Header Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#6C4DFF]/15 via-[#23B5D3]/10 to-[#2DD4BF]/15 border border-[#6C4DFF]/25 dark:border-[#6C4DFF]/35">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-[#6C4DFF] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {isAr ? 'استوديو المنتجات الذكي' : 'Smart Product Studio'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[#6C4DFF]/20 text-[#6C4DFF] dark:text-[#2DD4BF] font-mono font-bold ml-auto">
            PRO
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          {isAr
            ? 'مشاهد احترافية جاهزة مع منصات ثلاثية الأبعاد، إضاءة استوديو، وظلال ذكية ترتكز تلقائياً.'
            : 'Turn raw products into commercial ads with 3D podiums, realistic lighting, and smart grounded shadows.'}
        </p>
      </div>

      {/* PRODUCT STATUS & SMART ACTIONS */}
      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'طبقة المنتج النشطة' : 'Active Product Layer'}</span>
          </span>
          {productLayer ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>{productLayer.name}</span>
            </span>
          ) : (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold">
              {isAr ? 'لم يتم العثور على منتج' : 'No product layer'}
            </span>
          )}
        </div>

        {/* Quick Product Actions */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            onClick={handleAutoPlaceProduct}
            disabled={!productLayer}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#6C4DFF] hover:bg-[#6C4DFF]/5 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition-all disabled:opacity-40 disabled:pointer-events-none"
            title={isAr ? 'محاذاة وارتكاز ذكي في المشهد' : 'Auto Place & Ground in Scene'}
          >
            <Sparkles className="w-4 h-4 text-[#6C4DFF] mb-1" />
            <span>{isAr ? 'وضع ذكي' : 'Auto Place'}</span>
          </button>

          <button
            onClick={handleCenterProduct}
            disabled={!productLayer}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#6C4DFF] hover:bg-[#6C4DFF]/5 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition-all disabled:opacity-40 disabled:pointer-events-none"
            title={isAr ? 'توسيط المنتج في مساحة العمل' : 'Center Product'}
          >
            <AlignCenter className="w-4 h-4 text-[#23B5D3] mb-1" />
            <span>{isAr ? 'توسيط' : 'Center'}</span>
          </button>

          <button
            onClick={handleFitProduct}
            disabled={!productLayer}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#6C4DFF] hover:bg-[#6C4DFF]/5 text-slate-700 dark:text-slate-200 text-[10px] font-bold transition-all disabled:opacity-40 disabled:pointer-events-none"
            title={isAr ? 'ملاءمة حجم المنتج لأبعاد المشهد' : 'Fit to Scene'}
          >
            <Maximize2 className="w-4 h-4 text-[#2DD4BF] mb-1" />
            <span>{isAr ? 'ملاءمة' : 'Fit'}</span>
          </button>
        </div>

        {/* AI Background Removal Shortcut if product has background */}
        {onAutoRemoveBg && productLayer && (
          <button
            onClick={() => onAutoRemoveBg()}
            disabled={isRemovingBg}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#6C4DFF]/10 to-[#23B5D3]/10 hover:from-[#6C4DFF]/20 hover:to-[#23B5D3]/20 border border-[#6C4DFF]/30 text-[#6C4DFF] dark:text-[#2DD4BF] text-xs font-bold transition-all"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>
              {isRemovingBg
                ? isAr
                  ? 'جاري عزل الخلفية بالذكاء الاصطناعي...'
                  : 'Removing Background AI...'
                : isAr
                ? 'عزل خلفية المنتج تلقائياً (شفاف)'
                : 'Remove Product Background AI'}
            </span>
          </button>
        )}
      </div>

      {/* SCENE CATEGORIES SELECTOR */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#6C4DFF]" />
            <span>{isAr ? 'تصنيفات المشاهد' : 'Scene Categories'}</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            {filteredScenes.length} {isAr ? 'مشهد' : 'scenes'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          {SCENE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#6C4DFF] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {getCategoryIcon(cat.icon)}
              <span>{isAr ? cat.nameAr : cat.nameEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* SCENE PREVIEW CARDS */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
          {isAr ? 'اختر المشهد المطلوب' : 'Choose Scene Preset'}
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          {filteredScenes.map((scene) => {
            const isActive = activeSceneId === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => handleApplyScene(scene)}
                className={`group relative flex flex-col rounded-xl overflow-hidden border text-left transition-all ${
                  isActive
                    ? 'border-[#6C4DFF] ring-2 ring-[#6C4DFF]/30 shadow-md scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-4/3 overflow-hidden bg-slate-100 dark:bg-slate-900">
                  <img
                    src={scene.thumbnail}
                    alt={scene.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category Pill Tag */}
                  <span className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-md bg-slate-900/70 backdrop-blur-xs text-white font-bold">
                    {scene.category}
                  </span>
                  {/* Podium indicator */}
                  {scene.podium && (
                    <span className="absolute bottom-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-md bg-[#6C4DFF]/90 backdrop-blur-xs text-white font-bold flex items-center gap-0.5">
                      <Box className="w-2.5 h-2.5" />
                      <span>{isAr ? 'منصة' : 'Podium'}</span>
                    </span>
                  )}
                  {/* Active check overlay */}
                  {isActive && (
                    <div className="absolute inset-0 bg-[#6C4DFF]/25 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-white text-[#6C4DFF] flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Scene Meta */}
                <div className="p-2 space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1 block">
                    {isAr ? scene.nameAr : scene.nameEn}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {isAr ? scene.descriptionAr : scene.descriptionEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PRODUCT SHADOW SYSTEM CONTROLS */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>{isAr ? 'نظام ظلال المنتج (Product Shadow)' : 'Product Shadow System'}</span>
          </span>

          {/* Enable/Disable Toggle */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentShadow.enabled}
              onChange={(e) =>
                handleUpdateShadow((prev) => ({ ...prev, enabled: e.target.checked }))
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#6C4DFF]"></div>
          </label>
        </div>

        {currentShadow.enabled && (
          <div className="space-y-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            {/* Shadow Style Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                {isAr ? 'نمط الظل' : 'Shadow Style'}
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'contact', nameAr: 'ملامس للأرضية', nameEn: 'Contact' },
                  { id: 'floating', nameAr: 'ظل عائم Zero-G', nameEn: 'Floating' },
                  { id: 'drop', nameAr: 'ظل ناعم Drop', nameEn: 'Soft Drop' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() =>
                      handleUpdateShadow((prev) => ({
                        ...prev,
                        type: s.id as 'contact' | 'floating' | 'drop',
                      }))
                    }
                    className={`px-2 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                      currentShadow.type === s.id
                        ? 'bg-[#6C4DFF] text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {isAr ? s.nameAr : s.nameEn}
                  </button>
                ))}
              </div>
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>{isAr ? 'الشفافية' : 'Opacity'}</span>
                <span className="font-mono font-bold">{currentShadow.opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentShadow.opacity}
                onChange={(e) =>
                  handleUpdateShadow((prev) => ({ ...prev, opacity: Number(e.target.value) }))
                }
                className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Blur Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>{isAr ? 'النعومة والضبابية' : 'Blur'}</span>
                <span className="font-mono font-bold">{currentShadow.blur}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={currentShadow.blur}
                onChange={(e) =>
                  handleUpdateShadow((prev) => ({ ...prev, blur: Number(e.target.value) }))
                }
                className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Distance Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>{isAr ? 'المسافة / الارتفاع' : 'Distance'}</span>
                <span className="font-mono font-bold">{currentShadow.distance}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentShadow.distance}
                onChange={(e) =>
                  handleUpdateShadow((prev) => ({ ...prev, distance: Number(e.target.value) }))
                }
                className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Angle Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-400">
                <span>{isAr ? 'زاوية مصدر الضوء' : 'Angle'}</span>
                <span className="font-mono font-bold">{currentShadow.angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={currentShadow.angle}
                onChange={(e) =>
                  handleUpdateShadow((prev) => ({ ...prev, angle: Number(e.target.value) }))
                }
                className="w-full accent-[#6C4DFF] h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Shadow Color & Presets */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-600 dark:text-slate-400">
                {isAr ? 'لون الظل' : 'Shadow Color'}
              </span>
              <div className="flex items-center gap-1.5">
                {['#000000', '#0f172a', '#334155', '#451a03'].map((c) => (
                  <button
                    key={c}
                    onClick={() => handleUpdateShadow((prev) => ({ ...prev, color: c }))}
                    className={`w-5 h-5 rounded-full border border-slate-300 transition-transform ${
                      currentShadow.color === c ? 'scale-125 ring-2 ring-[#6C4DFF]' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  value={currentShadow.color || '#000000'}
                  onChange={(e) =>
                    handleUpdateShadow((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SCENE COMPONENTS INSPECTION & SWAPPING */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70 space-y-3">
        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#6C4DFF]" />
          <span>{isAr ? 'مكونات المشهد القابلة للتخصيص' : 'Scene Components'}</span>
        </span>

        {/* Podium Switcher */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
            {isAr ? 'منصة العرض (Podium)' : 'Podium / Surface'}
          </label>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'cylinder_pastel', labelAr: 'أسطوانة', labelEn: 'Cylinder' },
              { id: 'marble_pedestal', labelAr: 'رخام', labelEn: 'Marble' },
              { id: 'wood_round', labelAr: 'خشب', labelEn: 'Wood' },
              { id: 'white_minimal', labelAr: 'أبيض', labelEn: 'White' },
              { id: 'dark_gold', labelAr: 'ذهب', labelEn: 'Gold' },
              { id: 'glass_disk', labelAr: 'زجاج', labelEn: 'Glass' },
              { id: 'neon_ring', labelAr: 'نيون', labelEn: 'Neon' },
              { id: 'none', labelAr: 'بدون', labelEn: 'None' },
            ].map((p) => {
              const isCurrent =
                (podiumLayer && podiumLayer.source?.includes(p.id)) ||
                (!podiumLayer && p.id === 'none');
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitchPodium(p.id as PodiumType)}
                  className={`py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    isCurrent
                      ? 'bg-[#6C4DFF] text-white border-[#6C4DFF]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isAr ? p.labelAr : p.labelEn}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lighting Switcher */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
            {isAr ? 'تأثير الإضاءة (Lighting)' : 'Lighting Style'}
          </label>
          <div className="grid grid-cols-3 gap-1">
            {[
              { id: 'spotlight', labelAr: 'بؤرية', labelEn: 'Spotlight' },
              { id: 'soft_glow', labelAr: 'ناعمة', labelEn: 'Soft Glow' },
              { id: 'golden_beam', labelAr: 'شعاع ذهبي', labelEn: 'Golden' },
              { id: 'top_rim', labelAr: 'علوية', labelEn: 'Top Rim' },
              { id: 'cinematic_dual', labelAr: 'سينمائي', labelEn: 'Dual Noir' },
              { id: 'none', labelAr: 'بدون', labelEn: 'None' },
            ].map((l) => {
              const isCurrent =
                (lightingLayer && lightingLayer.source?.includes(l.id)) ||
                (!lightingLayer && l.id === 'none');
              return (
                <button
                  key={l.id}
                  onClick={() => handleSwitchLighting(l.id as LightingType)}
                  className={`py-1.5 rounded-lg text-[10px] font-semibold border transition-all ${
                    isCurrent
                      ? 'bg-[#23B5D3] text-white border-[#23B5D3]'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {isAr ? l.labelAr : l.labelEn}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
