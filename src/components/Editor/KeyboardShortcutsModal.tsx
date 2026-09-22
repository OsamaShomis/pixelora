import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Keyboard, Command } from 'lucide-react';
import { KEYBOARD_SHORTCUTS, ShortcutDefinition } from '../../data/shortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
  darkMode: boolean;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  language,
  darkMode,
}) => {
  const isAr = language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const categories = useMemo(
    () => [
      { id: 'all', nameAr: 'كل الاختصارات', nameEn: 'All Shortcuts' },
      { id: 'general', nameAr: 'عام والمشروع', nameEn: 'General & Project' },
      { id: 'tools', nameAr: 'أدوات التحرير', nameEn: 'Editor Tools' },
      { id: 'editing', nameAr: 'الطبقات والتحرير', nameEn: 'Layers & Editing' },
      { id: 'view', nameAr: 'العرض والتكبير', nameEn: 'View & Navigation' },
    ],
    []
  );

  const filteredShortcuts = useMemo(() => {
    return KEYBOARD_SHORTCUTS.filter((sc) => {
      if (selectedCategory !== 'all' && sc.category !== selectedCategory) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        sc.key.toLowerCase().includes(q) ||
        sc.actionAr.toLowerCase().includes(q) ||
        sc.actionEn.toLowerCase().includes(q) ||
        sc.descriptionAr.toLowerCase().includes(q) ||
        sc.descriptionEn.toLowerCase().includes(q)
      );
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      id="keyboard-shortcuts-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6C4DFF] to-[#23B5D3] flex items-center justify-center text-white shadow-xs">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{isAr ? 'اختصارات لوحة المفاتيح' : 'Keyboard Shortcuts'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#6C4DFF]/10 text-[#6C4DFF] dark:text-[#2DD4BF] font-mono">
                  {filteredShortcuts.length}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'سرّع وتيرة عملك في بيكسلورا بالتحكم الكامل عبر لوحة المفاتيح'
                  : 'Speed up your creative workflow with keyboard controls'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isAr ? 'إغلاق (Esc)' : 'Close (Esc)'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls: Search & Categories */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'ابحث عن اختصار بالاسم أو المفتاح (مثل: Ctrl+S, V, تراجع...)'
                  : 'Search shortcuts by key or action (e.g., Ctrl+S, V, Undo...)'
              }
              className="w-full ps-9 pe-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-[#6C4DFF] focus:border-transparent transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#6C4DFF] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-750'
                }`}
              >
                {isAr ? cat.nameAr : cat.nameEn}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-center">
              <Search className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-bold">
                {isAr ? 'لم يتم العثور على اختصارات تطابق البحث' : 'No matching shortcuts found'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-2 text-xs text-[#6C4DFF] hover:underline font-bold"
              >
                {isAr ? 'عرض جميع الاختصارات' : 'View all shortcuts'}
              </button>
            </div>
          ) : (
            filteredShortcuts.map((sc) => (
              <div
                key={sc.id}
                className="pt-2 first:pt-0 flex items-center justify-between gap-4 py-1.5 group hover:bg-purple-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {isAr ? sc.actionAr : sc.actionEn}
                    </span>
                    <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                      {isAr ? sc.categoryAr : sc.categoryEn}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {isAr ? sc.descriptionAr : sc.descriptionEn}
                  </p>
                </div>

                {/* Key badges */}
                <div className="flex items-center gap-1 shrink-0">
                  {sc.key.split('+').map((keyPart, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <span className="text-slate-400 text-xs font-bold">+</span>}
                      <kbd className="px-2 py-1 min-w-[24px] text-center text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-2xs">
                        {keyPart.trim()}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <Command className="w-3.5 h-3.5 text-[#6C4DFF]" />
            <span>
              {isAr
                ? 'اضغط مفتاح ? أو F1 في أي وقت لفتح هذه النافذة'
                : 'Press ? or F1 at any time to open shortcuts help'}
            </span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-xs"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
