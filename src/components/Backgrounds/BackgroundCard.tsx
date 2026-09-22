import React from 'react';
import {
  Sparkles,
  Check,
  Heart,
  Mountain,
  Box,
  Home,
  Building2,
  Building,
  Shapes,
  Square,
  Layers,
  Trees,
  Droplets,
  Waves,
  Leaf,
  Palette,
  Moon,
  Sun,
  SunMedium,
  Snowflake,
  Crown,
  Cpu,
  Share2,
} from 'lucide-react';
import { BackgroundTemplate } from '../../types';

interface BackgroundCardProps {
  template: BackgroundTemplate;
  isApplied: boolean;
  isFavorite: boolean;
  onApply: (template: BackgroundTemplate) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  isAr: boolean;
  viewMode: 'grid' | 'list';
}

export const BackgroundCard: React.FC<BackgroundCardProps> = ({
  template,
  isApplied,
  isFavorite,
  onApply,
  onToggleFavorite,
  isAr,
  viewMode,
}) => {
  const renderIcon = (iconName?: string) => {
    const iconClass = 'w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0';
    switch (iconName) {
      case 'Mountain':
        return <Mountain className={iconClass} />;
      case 'Box':
        return <Box className={iconClass} />;
      case 'Home':
        return <Home className={iconClass} />;
      case 'Building2':
        return <Building2 className={iconClass} />;
      case 'Building':
        return <Building className={iconClass} />;
      case 'Shapes':
        return <Shapes className={iconClass} />;
      case 'Square':
        return <Square className={iconClass} />;
      case 'Layers':
        return <Layers className={iconClass} />;
      case 'Trees':
        return <Trees className={iconClass} />;
      case 'Droplets':
        return <Droplets className={iconClass} />;
      case 'Waves':
        return <Waves className={iconClass} />;
      case 'Leaf':
        return <Leaf className={iconClass} />;
      case 'Palette':
        return <Palette className={iconClass} />;
      case 'Moon':
        return <Moon className={iconClass} />;
      case 'Sun':
        return <Sun className={iconClass} />;
      case 'SunMedium':
        return <SunMedium className={iconClass} />;
      case 'Snowflake':
        return <Snowflake className={iconClass} />;
      case 'Crown':
        return <Crown className={iconClass} />;
      case 'Cpu':
        return <Cpu className={iconClass} />;
      case 'Share2':
        return <Share2 className={iconClass} />;
      default:
        return <Mountain className={iconClass} />;
    }
  };

  if (viewMode === 'list') {
    return (
      <div
        id={`bg-card-${template.id}`}
        onClick={() => onApply(template)}
        className="group bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-3 shadow-2xs hover:shadow-md hover:border-[#6338E8]/60 transition-all duration-200 flex items-center gap-4 cursor-pointer select-none"
      >
        {/* Thumbnail */}
        <div
          className="w-24 sm:w-32 h-20 rounded-xl overflow-hidden relative bg-slate-100 dark:bg-slate-900 shrink-0"
          style={
            template.type === 'gradient' || template.type === 'color'
              ? { background: template.value }
              : undefined
          }
        >
          {template.type === 'image' && (
            <img
              src={template.thumbnail}
              alt={template.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          )}

          <button
            onClick={(e) => onToggleFavorite(template.id, e)}
            className="absolute top-1.5 end-1.5 p-1.5 rounded-full bg-black/40 backdrop-blur-xs text-white hover:bg-black/60 transition-transform active:scale-90"
            title={isFavorite ? (isAr ? 'إزالة من المفضلة' : 'Remove from Favorites') : isAr ? 'إضافة للمفضلة' : 'Add to Favorites'}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isFavorite ? 'fill-[#FF4B6E] text-[#FF4B6E]' : 'text-white'
              }`}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {renderIcon(template.icon)}
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {template.name}
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-2">
            {template.description}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
            <span>{template.dimensions || '3840 × 2160'}</span>
            <span>•</span>
            <span className="uppercase">{template.resolution || '4K'}</span>
            <span>•</span>
            <span className="capitalize">{template.type}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 pe-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApply(template);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 ${
              isApplied
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'bg-[#6338E8] hover:bg-[#5229D2] text-white shadow-xs'
            }`}
          >
            {isApplied ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isApplied ? (isAr ? 'تم التطبيق' : 'Applied') : isAr ? 'استخدم في المحرر' : 'Use in Editor'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`bg-card-${template.id}`}
      onClick={() => onApply(template)}
      className="group bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 overflow-hidden shadow-2xs hover:shadow-lg hover:border-[#6338E8]/50 transition-all duration-300 flex flex-col justify-between cursor-pointer select-none"
    >
      {/* Thumbnail Area */}
      <div
        className="aspect-[16/10] w-full relative overflow-hidden bg-slate-100 dark:bg-slate-900"
        style={
          template.type === 'gradient' || template.type === 'color'
            ? { background: template.value }
            : undefined
        }
      >
        {template.type === 'image' && (
          <img
            src={template.thumbnail}
            alt={template.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => onToggleFavorite(template.id, e)}
          className="absolute top-2.5 end-2.5 z-10 p-2 rounded-full bg-black/35 backdrop-blur-xs text-white hover:bg-black/55 transition-all duration-150 active:scale-90"
          title={isFavorite ? (isAr ? 'إزالة من المفضلة' : 'Remove from Favorites') : isAr ? 'إضافة للمفضلة' : 'Add to Favorites'}
          aria-label="Favorite"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-[#FF4B6E] text-[#FF4B6E]' : 'text-white'
            }`}
          />
        </button>

        {/* Hover Overlay with Action Button */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onApply(template);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${
              isApplied
                ? 'bg-emerald-500 text-white'
                : 'bg-[#6338E8] hover:bg-[#5229D2] text-white'
            }`}
          >
            {isApplied ? <Check className="w-4 h-4 text-emerald-100" /> : <Sparkles className="w-4 h-4" />}
            <span>{isApplied ? (isAr ? 'تم التطبيق!' : 'Applied!') : isAr ? 'استخدم في المحرر' : 'Use in Editor'}</span>
          </button>
        </div>
      </div>

      {/* Card Metadata Footer (Matching Reference) */}
      <div className="px-4 py-3 bg-white dark:bg-slate-800/80 flex items-center justify-between gap-3">
        {/* Category Icon */}
        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700/60 border border-slate-100 dark:border-slate-700/50">
          {renderIcon(template.icon)}
        </div>

        {/* Title and Dimension */}
        <div className="flex-1 min-w-0 text-start">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {template.name}
          </h3>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tracking-tight">
            {template.dimensions || '3840 × 2160'}
          </span>
        </div>
      </div>
    </div>
  );
};
