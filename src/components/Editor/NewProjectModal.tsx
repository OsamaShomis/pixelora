import React, { useState } from 'react';
import { X, Sparkles, Layout, Smartphone, ShoppingBag, Youtube, FileText } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (width: number, height: number, name: string, bgType: 'transparent' | 'solid', bgColor: string) => void;
  language: 'ar' | 'en';
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
  language,
}) => {
  const isAr = language === 'ar';

  const [name, setName] = useState(isAr ? 'تصميم جديد' : 'New Design');
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [bgType, setBgType] = useState<'transparent' | 'solid'>('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');

  if (!isOpen) return null;

  const presets = [
    { id: 'insta-square', label: isAr ? 'انستغرام مربع' : 'Instagram Square', w: 1080, h: 1080, icon: <Layout className="w-4 h-4" /> },
    { id: 'insta-story', label: isAr ? 'ستوري / تيك توك' : 'Story / TikTok', w: 1080, h: 1920, icon: <Smartphone className="w-4 h-4" /> },
    { id: 'ecom-product', label: isAr ? 'منتج متجر إلكتروني' : 'E-commerce Product', w: 1200, h: 1200, icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'youtube-thumb', label: isAr ? 'مصغرة يوتيوب' : 'YouTube Thumbnail', w: 1280, h: 720, icon: <Youtube className="w-4 h-4" /> },
    { id: 'a4-doc', label: isAr ? 'مستند / بوستر A4' : 'A4 Document', w: 1240, h: 1754, icon: <FileText className="w-4 h-4" /> },
  ];

  const handleSelectPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateProject(width, height, name.trim() || (isAr ? 'تصميم جديد' : 'New Design'), bgType, bgColor);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="new-project-modal"
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 border border-purple-100 dark:border-gray-700 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base text-gray-900 dark:text-white">
            <Sparkles className="w-5 h-5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'إنشاء تصميم أو لوحة عمل جديدة' : 'Create New Design Canvas'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {isAr ? 'اسم المشروع أو التصميم' : 'Project Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-[#6C4DFF]"
              placeholder={isAr ? 'أدخل اسم التصميم...' : 'Design title...'}
            />
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              {isAr ? 'اختر أبعادًا شائعة:' : 'Popular Dimension Presets:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {presets.map((p) => {
                const isSelected = width === p.w && height === p.h;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p.w, p.h)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-xs text-right transition-all ${
                      isSelected
                        ? 'border-[#6C4DFF] bg-[#6C4DFF]/10 text-[#6C4DFF] dark:text-[#2DD4BF] font-bold'
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-gray-500 dark:text-gray-400">
                      {p.icon}
                      <span className="font-semibold truncate">{p.label}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {p.w} × {p.h} px
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Width & Height */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {isAr ? 'العرض (Width px)' : 'Width (px)'}
              </label>
              <input
                type="number"
                min="100"
                max="8000"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {isAr ? 'الارتفاع (Height px)' : 'Height (px)'}
              </label>
              <input
                type="number"
                min="100"
                max="8000"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Background selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              {isAr ? 'نوع خلفية البداية:' : 'Initial Background:'}
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="bgType"
                  checked={bgType === 'transparent'}
                  onChange={() => setBgType('transparent')}
                  className="accent-[#6C4DFF]"
                />
                <span>{isAr ? 'شفافة (Transparent)' : 'Transparent'}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                <input
                  type="radio"
                  name="bgType"
                  checked={bgType === 'solid'}
                  onChange={() => setBgType('solid')}
                  className="accent-[#6C4DFF]"
                />
                <span>{isAr ? 'لون موحد (Solid Color)' : 'Solid Color'}</span>
              </label>
              {bgType === 'solid' && (
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 rounded-md cursor-pointer border border-gray-300 p-0"
                />
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C4DFF] to-[#4B32C3] hover:opacity-95 shadow-xs transition-all active:scale-95"
            >
              {isAr ? 'إنشاء لوحة العمل' : 'Create Canvas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
