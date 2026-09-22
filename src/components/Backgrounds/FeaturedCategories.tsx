import React from 'react';
import { BackgroundCategory } from '../../types';

interface FeaturedCategoriesProps {
  categories: BackgroundCategory[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  isAr: boolean;
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({
  selectedCategory,
  onSelectCategory,
  isAr,
}) => {
  // Curated 5 featured items closely matching the reference image layout
  const FEATURED_ITEMS = [
    {
      categoryId: 'colorful',
      nameAr: 'خلفيات تجريدية',
      nameEn: 'Abstract',
      thumbnail: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=150&q=80',
    },
    {
      categoryId: 'tech',
      nameAr: 'خلفيات مدينة',
      nameEn: 'City & Urban',
      thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=150&q=80',
    },
    {
      categoryId: 'luxury',
      nameAr: 'خلفيات داخلية',
      nameEn: 'Interiors',
      thumbnail: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=150&q=80',
    },
    {
      categoryId: 'ecommerce',
      nameAr: 'خلفيات منتجات',
      nameEn: 'Products',
      thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=150&q=80',
    },
    {
      categoryId: 'wood',
      nameAr: 'خلفيات طبيعية',
      nameEn: 'Nature',
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=150&q=80',
    },
  ];

  return (
    <section className="mb-8" aria-label={isAr ? 'أشهر الفئات' : 'Popular Categories'}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
          {isAr ? 'أشهر الفئات' : 'Popular Categories'}
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
        {FEATURED_ITEMS.map((item) => {
          const isActive = selectedCategory === item.categoryId;

          return (
            <button
              key={item.categoryId}
              id={`featured-cat-${item.categoryId}`}
              onClick={() => onSelectCategory(isActive ? 'all' : item.categoryId)}
              className={`group flex items-center justify-between p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 select-none text-start ${
                isActive
                  ? 'bg-[#6338E8]/10 dark:bg-[#6338E8]/20 border-[#6338E8] shadow-sm ring-1 ring-[#6338E8]/30'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-[#6338E8]/60 hover:shadow-xs'
              }`}
            >
              <span
                className={`text-xs sm:text-sm font-bold truncate px-1 transition-colors ${
                  isActive
                    ? 'text-[#6338E8] dark:text-[#20BFC4]'
                    : 'text-slate-800 dark:text-slate-200 group-hover:text-[#6338E8] dark:group-hover:text-[#20BFC4]'
                }`}
              >
                {isAr ? item.nameAr : item.nameEn}
              </span>

              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700/60 bg-slate-100 dark:bg-slate-900">
                <img
                  src={item.thumbnail}
                  alt={isAr ? item.nameAr : item.nameEn}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
