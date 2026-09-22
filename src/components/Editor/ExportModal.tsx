import React, { useState } from 'react';
import { X, Download, FileImage, Sparkles, Check } from 'lucide-react';
import { ExportSettings } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  exportSettings: ExportSettings;
  canvasWidth: number;
  canvasHeight: number;
  onExport: (settings: ExportSettings) => void;
  language: 'ar' | 'en';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  exportSettings,
  canvasWidth,
  canvasHeight,
  onExport,
  language,
}) => {
  const isAr = language === 'ar';

  const [format, setFormat] = useState<'png' | 'jpg' | 'webp' | 'svg'>(exportSettings.format || 'png');
  const [quality, setQuality] = useState<number>(exportSettings.quality || 92);
  const [scale, setScale] = useState<number>(1);
  const [fileName, setFileName] = useState<string>(exportSettings.fileName || 'pixelora-design');
  const [preserveTransparency, setPreserveTransparency] = useState<boolean>(
    exportSettings.preserveTransparency ?? true
  );
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const finalWidth = Math.round(canvasWidth * scale);
  const finalHeight = Math.round(canvasHeight * scale);

  const handleDownload = () => {
    setIsExporting(true);
    onExport({
      format,
      quality,
      customWidth: finalWidth,
      customHeight: finalHeight,
      preserveTransparency: (format === 'png' || format === 'webp' || format === 'svg') ? preserveTransparency : false,
      fileName: fileName.trim() || 'pixelora-design',
    });
    setTimeout(() => {
      setIsExporting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        id="export-modal"
        className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 border border-purple-100 dark:border-gray-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-base text-gray-900 dark:text-white">
            <Download className="w-5 h-5 text-[#6C4DFF] dark:text-[#2DD4BF]" />
            <span>{isAr ? 'تصدير وتحميل الصورة' : 'Export & Download Image'}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* File Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              {isAr ? 'اسم الملف عند التنزيل' : 'File Name'}
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:border-[#6C4DFF]"
            />
          </div>

          {/* Format selection */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              {isAr ? 'صيغة التصدير المستهدفة' : 'Target Format'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['png', 'jpg', 'webp', 'svg'] as const).map((fmt) => {
                const isSelected = format === fmt;
                return (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setFormat(fmt)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'border-[#6C4DFF] bg-[#6C4DFF]/10 text-[#6C4DFF] dark:text-[#2DD4BF]'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{fmt}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
              {format === 'png'
                ? isAr
                  ? 'PNG: مثالي للحفاظ على شفافية الخلفية وجودة التفاصيل الرسومية'
                  : 'PNG: Best for transparency and high-quality graphics'
                : format === 'webp'
                ? isAr
                  ? 'WEBP: ضغط متقدم وحجم فائق الصغر لمواقع الويب والمتاجر'
                  : 'WEBP: Modern small file size optimized for web'
                : format === 'svg'
                ? isAr
                  ? 'SVG: ملف متجهي قياسي يغلف التكوين النهائي بدقة عالية وشفافية كاملة'
                  : 'SVG: Standard vector container embedding high-res composition with full alpha transparency'
                : isAr
                ? 'JPG: مناسب للصور الفوتوغرافية ومنشورات السوشيال'
                : 'JPG: Great standard format for photography'}
            </p>
          </div>

          {/* Scale & Dimensions */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {isAr ? 'مقياس الدقة والأبعاد' : 'Resolution & Dimensions'}
              </label>
              <span className="text-xs font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">
                {finalWidth} × {finalHeight} px
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 1, label: isAr ? '1x (عادي)' : '1x (Standard)' },
                { val: 1.5, label: isAr ? '1.5x (متوسط)' : '1.5x (Medium)' },
                { val: 2, label: isAr ? '2x (فائق الدقة HD)' : '2x (High Res)' },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => setScale(s.val)}
                  className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    scale === s.val
                      ? 'border-[#6C4DFF] bg-[#6C4DFF]/10 text-[#6C4DFF] dark:text-[#2DD4BF] font-bold'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Slider (only for JPG & WEBP) */}
          {(format === 'jpg' || format === 'webp') && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {isAr ? 'جودة الضغط' : 'Quality'}
                </span>
                <span className="font-mono font-bold text-[#6C4DFF] dark:text-[#2DD4BF]">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[#6C4DFF]"
              />
            </div>
          )}

          {/* Transparency checkbox for PNG, WEBP and SVG */}
          {(format === 'png' || format === 'webp' || format === 'svg') && (
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={preserveTransparency}
                onChange={(e) => setPreserveTransparency(e.target.checked)}
                className="accent-[#6C4DFF] rounded-sm"
              />
              <span>{isAr ? 'حفظ الخلفية الشفافة (Alpha Channel)' : 'Preserve Transparent Background'}</span>
            </label>
          )}

          {/* Action button */}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              id="export-download-confirm-btn"
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#6C4DFF] to-[#23B5D3] hover:opacity-95 shadow-md flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isAr ? 'تنزيل وحفظ في جهازي' : 'Download to Device'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
