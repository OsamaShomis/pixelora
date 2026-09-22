import React from 'react';
import {
  MousePointer,
  Crop,
  LassoSelect,
  Paintbrush,
  PenTool,
  Type,
  Eraser,
  Scissors,
  Hand,
  ZoomIn,
  Shapes,
  Sparkles,
  Sliders,
  Palette,
  Maximize2,
  Wand2,
} from 'lucide-react';
import { EditorTool, ShapeType } from '../../types';

interface EditorToolboxProps {
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;
  onAddTextLayer: () => void;
  onAddShapeLayer: (shapeType: ShapeType) => void;
  onOpenShapeLibrary?: () => void;
  onOpenResizeModal?: () => void;
  onSelectPropertyTab?: (tab: 'layers' | 'text' | 'brush' | 'eraser' | 'adjust' | 'filters' | 'bg_remove' | 'background' | 'pen' | 'transform' | 'remove_object') => void;
  language: 'ar' | 'en';
}

export const EditorToolbox: React.FC<EditorToolboxProps> = ({
  activeTool,
  setActiveTool,
  onAddTextLayer,
  onAddShapeLayer,
  onOpenShapeLibrary,
  onOpenResizeModal,
  onSelectPropertyTab,
  language,
}) => {
  const isAr = language === 'ar';

  // Organized Tool Groups per Pixelora Phase 6 architecture
  const toolGroups = [
    {
      group: 'core',
      tools: [
        {
          id: 'select' as EditorTool,
          name: isAr ? 'تحديد وتحريك' : 'Select & Move',
          shortcut: 'V',
          icon: <MousePointer className="w-4 h-4" />,
          onClick: () => setActiveTool('select'),
        },
        {
          id: 'transform' as EditorTool,
          name: isAr ? 'التحويل المتقدم' : 'Advanced Transform',
          description: isAr
            ? 'التحويل المتقدم — موضع وحجم وتدوير وانحراف لجميع العناصر'
            : 'Advanced Transform — Move, scale, rotate & skew any element',
          shortcut: 'Ctrl+T',
          icon: <Maximize2 className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />,
          onClick: () => {
            setActiveTool('transform');
            if (onSelectPropertyTab) onSelectPropertyTab('transform');
          },
        },
        {
          id: 'crop' as EditorTool,
          name: isAr ? 'قص صورة أو لوحة العمل' : 'Crop Image / Canvas',
          shortcut: 'C',
          icon: <Crop className="w-4 h-4" />,
          onClick: () => setActiveTool('crop'),
        },
        {
          id: 'freeform_crop' as EditorTool,
          name: isAr ? 'القص الحر' : 'Freeform Crop',
          description: isAr
            ? 'القص الحر — رسم مسار حر حول طبقة الصورة وقص ما حولها بشفافية دون تغيير لوحة العمل'
            : 'Freeform Crop — Draw a freeform or polygon boundary around the selected image layer',
          shortcut: 'Shift+C',
          icon: <LassoSelect className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
          onClick: () => setActiveTool('freeform_crop'),
        },
        {
          id: 'hand' as EditorTool,
          name: isAr ? 'تحريك المشهد' : 'Pan Canvas',
          shortcut: 'H',
          icon: <Hand className="w-4 h-4" />,
          onClick: () => setActiveTool('hand'),
        },
        {
          id: 'zoom' as EditorTool,
          name: isAr ? 'مقياس العرض (تكبير)' : 'Zoom View Scale',
          shortcut: 'Z',
          icon: <ZoomIn className="w-4 h-4" />,
          onClick: () => setActiveTool('zoom'),
        },
      ],
    },
    {
      group: 'create',
      tools: [
        {
          id: 'draw' as EditorTool,
          name: isAr ? 'فرشاة الرسم' : 'Brush Tool',
          shortcut: 'B',
          icon: <Paintbrush className="w-4 h-4" />,
          onClick: () => {
            setActiveTool('draw');
            if (onSelectPropertyTab) onSelectPropertyTab('brush');
          },
        },
        {
          id: 'pen' as EditorTool,
          name: isAr ? 'قلم' : 'Pen Tool',
          description: isAr
            ? 'قلم — إنشاء مسارات ومنحنيات قابلة للتحرير'
            : 'Pen Tool — Create editable paths and curves',
          shortcut: 'P',
          icon: <PenTool className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />,
          onClick: () => {
            setActiveTool('pen');
            if (onSelectPropertyTab) onSelectPropertyTab('pen');
          },
        },
        {
          id: 'eraser' as EditorTool,
          name: isAr ? 'ممحاة القناع والرسم' : 'Eraser Tool',
          shortcut: 'E',
          icon: <Eraser className="w-4 h-4 text-red-500" />,
          onClick: () => {
            setActiveTool('eraser');
            if (onSelectPropertyTab) onSelectPropertyTab('eraser');
          },
        },
        {
          id: 'text' as EditorTool,
          name: isAr ? 'إضافة نص' : 'Add Text',
          shortcut: 'T',
          icon: <Type className="w-4 h-4" />,
          onClick: () => {
            setActiveTool('text');
            onAddTextLayer();
            if (onSelectPropertyTab) onSelectPropertyTab('text');
          },
        },
        {
          id: 'shape' as EditorTool,
          name: isAr ? 'مكتبة الأشكال والرموز' : 'Shapes & Icons',
          shortcut: 'U',
          icon: <Shapes className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />,
          onClick: () => {
            if (onOpenShapeLibrary) {
              onOpenShapeLibrary();
            } else {
              onAddShapeLayer('rectangle');
            }
          },
        },
      ],
    },
    {
      group: 'enhance',
      tools: [
        {
          id: 'remove_object' as EditorTool,
          name: isAr ? 'إزالة كائن' : 'Remove Object',
          description: isAr
            ? 'إزالة كائن — إزالة عناصر وأشخاص غير مرغوبين مع إعادة بناء الخلفية المحيطة ذكياً'
            : 'Remove Object — Remove unwanted objects or people with smart background inpainting',
          shortcut: 'J',
          icon: <Wand2 className="w-4 h-4 text-[#6338E8] dark:text-[#20BFC4]" />,
          onClick: () => {
            setActiveTool('remove_object');
            if (onSelectPropertyTab) onSelectPropertyTab('remove_object');
          },
        },
        {
          id: 'filters' as any,
          name: isAr ? 'مكتبة الفلاتر الجاهزة' : 'Preset Filters',
          shortcut: 'F',
          icon: <Sparkles className="w-4 h-4 text-amber-500" />,
          onClick: () => {
            if (onSelectPropertyTab) onSelectPropertyTab('filters');
          },
        },
        {
          id: 'adjust' as any,
          name: isAr ? 'التحسينات وتعديل الألوان' : 'Adjustments & Color',
          shortcut: 'A',
          icon: <Sliders className="w-4 h-4 text-[#6C4DFF] dark:text-[#2DD4BF]" />,
          onClick: () => {
            if (onSelectPropertyTab) onSelectPropertyTab('adjust');
          },
        },
      ],
    },
    {
      group: 'composite',
      tools: [
        {
          id: 'bg_remove' as EditorTool,
          name: isAr ? 'عزل وإزالة الخلفية' : 'Remove Background',
          shortcut: 'R',
          icon: <Scissors className="w-4 h-4 text-[#2DD4BF]" />,
          onClick: () => {
            setActiveTool('bg_remove');
            if (onSelectPropertyTab) onSelectPropertyTab('bg_remove');
          },
        },
        {
          id: 'background' as any,
          name: isAr ? 'مكتبة الخلفيات الجاهزة' : 'Background Library',
          shortcut: 'G',
          icon: <Palette className="w-4 h-4 text-emerald-500" />,
          onClick: () => {
            if (onSelectPropertyTab) onSelectPropertyTab('background');
          },
        },
      ],
    },
  ];

  return (
    <aside
      id="editor-vertical-toolbox"
      aria-label={isAr ? 'شريط الأدوات الرئيسي' : 'Main Toolbox'}
      className="w-14 bg-white dark:bg-slate-800 border-l sm:border-l-0 sm:border-r border-slate-200/90 dark:border-slate-700 py-2.5 flex flex-col items-center justify-between shrink-0 select-none z-20 shadow-2xs overflow-y-auto scrollbar-none"
    >
      <div className="flex flex-col items-center gap-1.5 w-full px-1.5">
        {toolGroups.map((group, groupIdx) => (
          <React.Fragment key={group.group}>
            {groupIdx > 0 && (
              <div className="w-6 h-[1px] bg-slate-200 dark:bg-slate-700 my-1" />
            )}
            <div className="flex flex-col items-center gap-1 w-full">
              {group.tools.map((tool) => {
                const isActive = activeTool === tool.id;

                return (
                  <button
                    key={tool.id}
                    id={`tool-${tool.id}`}
                    aria-label={tool.name}
                    onClick={tool.onClick}
                    title={`${tool.name} (${tool.shortcut})`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all group relative ${
                      isActive
                        ? 'bg-gradient-to-tr from-[#6C4DFF] to-[#4B32C3] text-white shadow-xs scale-105'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-slate-700/70 hover:text-[#6C4DFF]'
                    }`}
                  >
                    {tool.icon}

                    {/* Rich Accessible Tooltip */}
                    <div
                      className={`absolute ${
                        isAr ? 'left-full ml-2.5' : 'right-full mr-2.5'
                      } hidden group-hover:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold whitespace-nowrap shadow-xl z-50 pointer-events-none border border-slate-700/60`}
                    >
                      <span>{(tool as any).description || tool.name}</span>
                      <span className="text-slate-400 font-mono text-[10px]">[{tool.shortcut}]</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Mini brand badge */}
      <div className="pt-2 text-[10px] font-bold text-[#6C4DFF] dark:text-[#2DD4BF] opacity-80 font-mono">
        Px
      </div>
    </aside>
  );
};
