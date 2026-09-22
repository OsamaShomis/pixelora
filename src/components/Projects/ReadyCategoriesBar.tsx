import React from 'react';
import {
  LayoutGrid,
  Mountain,
  User,
  Car,
  Smartphone,
  Package,
  Palette,
  Share2,
} from 'lucide-react';
import { READY_PROJECT_CATEGORIES, ReadyProjectCategory } from '../../data/readyProjectsData';

interface ReadyCategoriesBarProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  isAr: boolean;
}

export const ReadyCategoriesBar: React.FC<ReadyCategoriesBarProps> = ({
  selectedCategory,
  onSelectCategory,
  isAr,
}) => {
  const getCategoryIcon = (iconName: ReadyProjectCategory['iconName']) => {
    switch (iconName) {
      case 'nature':
        return <Mountain className="w-4 h-4" />;
      case 'portrait':
        return <User className="w-4 h-4" />;
      case 'cars':
        return <Car className="w-4 h-4" />;
      case 'devices':
        return <Smartphone className="w-4 h-4" />;
      case 'products':
        return <Package className="w-4 h-4" />;
      case 'creative':
        return <Palette className="w-4 h-4" />;
      case 'all':
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center justify-center w-full py-4 mb-8 overflow-x-auto scrollbar-none">
      <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-xs max-w-full">
        {READY_PROJECT_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                isSelected
                  ? 'bg-gradient-to-r from-[#6338E8] to-[#4F8FE8] text-white shadow-xs scale-[1.02]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-[#6338E8] dark:hover:text-[#20BFC4] hover:bg-slate-100/80 dark:hover:bg-slate-700/50'
              }`}
            >
              {getCategoryIcon(cat.iconName)}
              <span>{isAr ? cat.nameAr : cat.nameEn}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
