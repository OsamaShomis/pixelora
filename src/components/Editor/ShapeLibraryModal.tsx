import React, { useState, useMemo } from 'react';
import { Search, X, Shapes, Sparkles } from 'lucide-react';
import { ShapeType } from '../../types';
import { ALL_SHAPES, SHAPE_CATEGORIES, ShapeDefinition } from '../../data/shapes';
import { getShapeSvgContent } from '../../utils/shapeDrawer';

interface ShapeLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectShape: (shapeType: ShapeType) => void;
  language: 'ar' | 'en';
}

export const ShapeLibraryModal: React.FC<ShapeLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectShape,
  language,
}) => {
  const isAr = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredShapes = useMemo(() => {
    return ALL_SHAPES.filter((s) => {
      if (selectedCategory !== 'all' && s.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAr = s.nameAr.toLowerCase().includes(q);
        const matchEn = s.nameEn.toLowerCase().includes(q);
        const matchId = s.id.toLowerCase().includes(q);
        if (!matchAr && !matchEn && !matchId) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shapes className="w-5 h-5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
              <span>{isAr ? 'مكتبة الأشكال والرموز الهندسية' : 'Comprehensive Shape Library'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr
                ? 'اختر من بين تشكيلة واسعة من الأشكال، الأسهم، الرموز، والبانرات لإضافتها للتصميم'
                : 'Select from a rich set of basic shapes, directional arrows, icons, and design ribbons.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن شكل أو رمز (سهم، قلب، نجمة، تاج، فقاعة...)' : 'Search shapes...'}
              className="w-full pr-9 pl-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#6C4DFF]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {SHAPE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#6C4DFF] text-white shadow-xs scale-102'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isAr ? cat.nameAr : cat.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Shape Grid */}
        <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 min-h-[300px]">
          {filteredShapes.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-bold">
                {isAr ? 'لم يتم العثور على أشكال مطابقة للبحث' : 'No shapes match your query'}
              </p>
            </div>
          ) : (
            filteredShapes.map((shape) => {
              const svgData = getShapeSvgContent(
                shape.id,
                80,
                80,
                '#6C4DFF',
                '#4B32C3',
                2,
                12
              );

              return (
                <button
                  key={shape.id}
                  onClick={() => {
                    onSelectShape(shape.id);
                    onClose();
                  }}
                  className="p-3 bg-white dark:bg-slate-850 hover:bg-purple-50/60 dark:hover:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-[#6C4DFF] dark:hover:border-[#2DD4BF] flex flex-col items-center justify-between gap-2.5 transition-all group shadow-2xs hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-16 h-16 flex items-center justify-center p-1 rounded-xl bg-slate-50 dark:bg-slate-900/60 group-hover:bg-white dark:group-hover:bg-slate-800 transition-colors">
                    <svg viewBox="0 0 80 80" className="w-12 h-12 overflow-visible">
                      {svgData.type === 'rect' && <rect {...svgData.props} />}
                      {svgData.type === 'ellipse' && <ellipse {...svgData.props} />}
                      {svgData.type === 'polygon' && <polygon {...svgData.props} />}
                      {svgData.type === 'path' && <path {...svgData.props} />}
                      {svgData.type === 'line' && <line {...svgData.props} />}
                    </svg>
                  </div>
                  <div className="text-center w-full">
                    <span className="font-bold text-slate-900 dark:text-white text-xs block truncate group-hover:text-[#6C4DFF] dark:group-hover:text-[#2DD4BF] transition-colors">
                      {isAr ? shape.nameAr : shape.nameEn}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium block truncate">
                      {isAr ? shape.categoryAr : shape.categoryEn}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {isAr ? 'عدد الأشكال المتاحة:' : 'Total Shapes:'}{' '}
            <strong className="text-slate-900 dark:text-white">{filteredShapes.length}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold text-xs transition-colors"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
