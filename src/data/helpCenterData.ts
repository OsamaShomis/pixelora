import { EditorTool } from '../types';

export interface HelpParameter {
  nameAr: string;
  nameEn: string;
  type: string;
  defaultVal: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface HelpSubTopic {
  id: string;
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  whatItDoesAr: string;
  whatItDoesEn: string;
  whenToUseAr: string;
  whenToUseEn: string;
  howToUseAr: string[];
  howToUseEn: string[];
  parameters?: HelpParameter[];
  importantNotesAr?: string[];
  importantNotesEn?: string[];
  relatedTools?: string[];
}

export interface HelpSection {
  id: string;
  num: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  category: 'core' | 'tools' | 'editing' | 'processing' | 'reference';
  categoryAr: string;
  categoryEn: string;
  briefAr: string;
  briefEn: string;
  overviewAr: string;
  overviewEn: string;
  topics: HelpSubTopic[];
  tipsAr?: string[];
  tipsEn?: string[];
  warningsAr?: string[];
  warningsEn?: string[];
}

export interface FAQItem {
  id: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
  category: 'basics' | 'tools' | 'layers' | 'filters' | 'export';
  categoryAr?: string;
  categoryEn?: string;
}

export interface TroubleshootingItem {
  id: string;
  problemAr: string;
  problemEn: string;
  causeAr: string;
  causeEn: string;
  solutionAr: string;
  solutionEn: string;
  category: string;
}

export const HELP_SECTIONS: HelpSection[] = [
  // 01 — Getting Started
  {
    id: 'getting-started',
    num: '01',
    titleAr: 'البدء مع بيكسلورا',
    titleEn: 'Getting Started',
    icon: 'Sparkles',
    category: 'core',
    categoryAr: 'الأساسيات والمشروع',
    categoryEn: 'Core & Project',
    briefAr: 'مقدمة شاملة عن محرر بيكسلورا، سير العمل السريع من البداية حتى التصدير النهائي.',
    briefEn: 'Comprehensive overview of Pixelora, rapid 5-step workflow from import to final export.',
    overviewAr: 'بيكسلورا (Pixelora) هو محرر صور وتصميم جرافيكي متطور يعمل مباشرة في المتصفح. يجمع بين سهولة الاستخدام للمبتدئين وقوة المعالجة الرقمية للمحترفين، متضمناً معالجة نقطية وترددية ومكتبة فلاتر غنية ونظام طبقات غير إتلافي، وأدوات متطورة لعزل الخلفيات ومعالجة العناصر.',
    overviewEn: 'Pixelora is an advanced browser-based photo editor and graphic design studio. It blends consumer accessibility with industrial-grade digital image processing, featuring a non-destructive layer stack, 64 mathematical filters, Lightroom-style adjustments, and advanced background cutout tools.',
    topics: [
      {
        id: 'what-is-pixelora',
        titleAr: 'ما هو بيكسلورا؟ والهدف منه',
        titleEn: 'What is Pixelora? Core Purpose',
        summaryAr: 'بيئة متكاملة لمعالجة الصور، تصميم المنتجات، والتحرير الإبداعي السريع محلياً دون رفع بياناتك لخوادم خارجية غير آمنة.',
        summaryEn: 'An all-in-one local-first imaging workstation for e-commerce, digital photography, vector graphics, and scientific processing.',
        whatItDoesAr: 'يوفر محطة عمل كاملة لمعالجة الصور بيكسل ببيكسل، دعم الطبقات والأقنعة، ضبط الإضاءة والألوان، إزالة الخلفيات، وتصميم الرسوميات الإعلانية.',
        whatItDoesEn: 'Delivers a full-featured workstation for pixel-level editing, non-destructive layer compositing, tone curves, background cutout, and commercial graphic design.',
        whenToUseAr: 'عند الرغبة في تحسين الصور الشخصية، معالجة صور المتاجر الإلكترونية، تطبيق فلاتر سينمائية، أو إجراء تحليلات هندسية ورياضية على الصور.',
        whenToUseEn: 'Whenever preparing e-commerce catalog photos, enhancing portraits, crafting marketing graphics, or applying advanced mathematical convolutions.',
        howToUseAr: [
          'افتح التطبيق في المتصفح دون الحاجة لتثبيت أي برامج إضافية.',
          'اختر "مشروع جديد" أو اسحب صورتك مباشرة إلى مساحة العمل.',
          'استخدم الأدوات المتاحة في الشريطين الجانبي والعلوي لتعديل صورتك بحرية.',
          'قم بتصدير عملك بالصيغة والأبعاد المرغوبة بضغطة زر.',
        ],
        howToUseEn: [
          'Open Pixelora directly in your modern web browser without plugin installations.',
          'Choose "New Project" or drag and drop an existing photograph onto the canvas.',
          'Leverage the vertical toolbox and properties inspector to manipulate layers and adjustments.',
          'Export your final artwork in PNG, JPG, or WEBP at pristine resolution.',
        ],
        importantNotesAr: [
          'جميع عمليات المعالجة تتم محلياً في الذاكرة الرسومية للمتصفح عبر Canvas 2D و TypedArrays لضمان الخصوصية والسرعة القصوى.',
          'يتم حفظ المشاريع محلياً في ذاكرة المتصفح (IndexedDB / LocalStorage) لضمان عدم فقدان أعمالك عند إعادة تحميل الصفحة.',
        ],
        importantNotesEn: [
          'All pixel transforms execute client-side via hardware-accelerated Canvas 2D and Uint8ClampedArray for maximum privacy and zero latency.',
          'Projects auto-persist in browser storage (IndexedDB / LocalStorage) so your workflow is never lost on refresh.',
        ],
      },
      {
        id: 'quick-start-workflow',
        titleAr: 'سير العمل السريع في ٥ خطوات',
        titleEn: '5-Step Quick Start Workflow',
        summaryAr: 'الدليل القياسي لتحويل أي صورة خام إلى تصميم نهائي عالي الاحترافية.',
        summaryEn: 'Standard linear pipeline from raw image ingestion to production-ready asset.',
        whatItDoesAr: 'يحدد الخطوات العملية المتسلسلة: الاستيراد ← القص وضبط الأبعاد ← التحسينات اللونية ← التأثيرات والأقنعة ← التصدير.',
        whatItDoesEn: 'Outlines the logical sequence: Ingestion → Geometry/Crop → Tone Adjustments → Effects & Masks → Final Export.',
        whenToUseAr: 'يُنصح باتباع هذا التسلسل في كل مشروع جديد لضمان أفضل جودة معمارية وبصرية.',
        whenToUseEn: 'Follow this sequence for every standard editing session to maintain peak visual fidelity and layer hygiene.',
        howToUseAr: [
          'الخطوة ١ (الاستيراد): انقر على "فتح صورة" من الصفحة الرئيسية أو اسحب الصورة من جهازك.',
          'الخطوة ٢ (الهندسة والقص): اضبط أبعاد لوحة العمل (Canvas Size) أو استخدم أداة القص (Crop - C) للتركيز على موضوع الصورة.',
          'الخطوة ٣ (ضبط الإضاءة والألوان): انتقل إلى تبويب "التحسينات" (A) لتعديل التعرض، التباين، منحنيات النغمات، وموازن الألوان HSL.',
          'الخطوة ٤ (الإبداع والفلاتر): طبّق أحد الفلاتر الجاهزة أو أزل الخلفية بنقرة واحدة، وأضف نصوصاً أو أشكالاً متجهة حسب الحاجة.',
          'الخطوة ٥ (التصدير والمشاركة): اضغط Ctrl+E أو انقر زر "تصدير" واختر PNG للشفافية أو JPG/WEBP للويب.',
        ],
        howToUseEn: [
          'Step 1 (Ingestion): Click "Open Image" or drop an image file onto the startup area.',
          'Step 2 (Geometry): Define canvas bounds or press C for the Crop tool to frame the subject.',
          'Step 3 (Color & Tone): Navigate to Adjustments (A) to calibrate exposure, curves, and HSL mixer.',
          'Step 4 (Effects & Overlays): Apply stylistic presets, isolate subjects with 1-click cutout, or add typography.',
          'Step 5 (Export): Press Ctrl+E to launch the Export modal, choosing PNG for transparency or JPG/WEBP for compact web distribution.',
        ],
      },
    ],
    tipsAr: [
      'استخدم اختصار Ctrl+Z للتراجع عن أي خطوة، و Ctrl+Y لإعادة تطبيقها.',
      'يمكنك دائماً الرجوع إلى نقطة البداية عبر زر "إعادة التعيين" في كل لوحة تحكم دون فقدان الطبقات الأخرى.',
    ],
    tipsEn: [
      'Use Ctrl+Z to undo any step, and Ctrl+Y (or Shift+Ctrl+Z) to redo.',
      'You can safely reset individual adjustment panels without affecting other active layers.',
    ],
  },

  // 02 — Workspace Architecture
  {
    id: 'workspace',
    num: '02',
    titleAr: 'فهم مساحة العمل والواجهة',
    titleEn: 'Understanding the Workspace',
    icon: 'Layout',
    category: 'core',
    categoryAr: 'الأساسيات والمشروع',
    categoryEn: 'Core & Project',
    briefAr: 'تفصيل كامل لمكونات واجهة بيكسلورا: الشريط العلوي، شريط الأدوات، لوحة العمل، ولوحة الخصائص الجانبية.',
    briefEn: 'Exhaustive tour of the interface: Top bar, vertical toolbox, viewport canvas, and properties inspector.',
    overviewAr: 'صُممت واجهة بيكسلورا وفق أحدث المعايير الهندسية لواجهات التطبيقات الاحترافية، حيث تتوزع عناصر التحكم بشكل منطقي يمنع التشتت ويوفر وصولاً سريعاً لكافة الأدوات مع دعم كامل للتصميم المتجاوب والمظهرين الفاتح والداكن.',
    overviewEn: 'Pixelora’s interface follows desktop creative workstation paradigms, organizing controls into functional clusters with responsive collapsing, dual theme engine, and bidirectional RTL/LTR layout.',
    topics: [
      {
        id: 'top-bar',
        titleAr: 'الشريط العلوي (Header & Topbar)',
        titleEn: 'Header & Topbar Anatomy',
        summaryAr: 'يحتوي على اسم المشروع، أدوات الحفظ والتصدير، التراجع والإعادة، وحالة الاتصال.',
        summaryEn: 'Houses project name, save/export triggers, undo/redo buttons, and canvas dimension indicators.',
        whatItDoesAr: 'يعرض اسم المشروع مع إمكانية تعديله فوراً، يتيح حفظ المشروع محلياً (Ctrl+S)، فتح مشاريع سابقة (Ctrl+O)، تصدير العمل (Ctrl+E)، وعرض دقة اللوحة ونسبة التكبير.',
        whatItDoesEn: 'Provides direct project title editing, project serialization to local storage, undo/redo triggers, and instant export initialization.',
        whenToUseAr: 'لإدارة حالة المشروع العامة، التنقل بين التراجعات، وتصدير العمل النهائي.',
        whenToUseEn: 'For project-level lifecycle commands, tracking undo history state, and launching modals.',
        howToUseAr: [
          'انقر على اسم المشروع لتعديله وكتابة اسم جديد معبراً عن التصميم.',
          'استخدم أزرار الأسهم الدائرية للتراجع والإعادة مع رؤية عدد التراجعات المتبقية.',
          'انقر على زر "تصدير" البنفسجي لفتح نافذة التصدير الاحترافية.',
        ],
        howToUseEn: [
          'Click the project name input to rename your document inline.',
          'Use the curved arrow buttons for undo and redo with instant visual feedback.',
          'Click the primary purple "Export" button to configure resolution, scale, and format.',
        ],
      },
      {
        id: 'toolbox',
        titleAr: 'شريط الأدوات الرأسي (Main Vertical Toolbox)',
        titleEn: 'Main Vertical Toolbox',
        summaryAr: 'الشريط الجانبي الذي يضم جميع أدوات التحديد، الرسم، المتجهات، التعديل، وعزل الخلفيات.',
        summaryEn: 'The vertical sidebar hosting core selection, vector drawing, retouching, and background cutout tools.',
        whatItDoesAr: 'يقسم الأدوات إلى مجموعات منطقية: الأدوات الأساسية (تحديد، تحويل، قص، مشهد، تكبير)، أدوات الإنشاء (فرشاة، قلم، ممحاة، نص، أشكال)، أدوات التحسين (إزالة كائن، فلاتر، تحسينات)، وأدوات التركيب (عزل الخلفية، ومكتبة الخلفيات).',
        whatItDoesEn: 'Clusters tools into Core (Select, Transform, Crop, Hand, Zoom), Create (Brush, Pen, Eraser, Text, Shapes), Enhance (Remove Object, Filters, Adjustments), and Composite (Remove BG, Background Library).',
        whenToUseAr: 'للتبديل الفوري بين وضعيات التحرير المختلفة أثناء العمل.',
        whenToUseEn: 'To toggle the active interaction mode across canvas pointer events.',
        howToUseAr: [
          'انقر على أي أداة بالماوس أو اضغط مفتاح الاختصار المقابل لها على لوحة المفاتيح.',
          'عند تفعيل أداة ما، ستتحول لوحة الخصائص اليمنى تلقائياً لعرض خيارات تلك الأداة بالتفصيل.',
        ],
        howToUseEn: [
          'Click any tool icon or press its designated keyboard shortcut (e.g., V, B, P, E, T).',
          'Activating a tool automatically synchronizes the right properties panel to display its parameters.',
        ],
      },
      {
        id: 'canvas-viewport',
        titleAr: 'لوحة العمل ومساحة العرض (Canvas Viewport)',
        titleEn: 'Canvas Viewport & Stage',
        summaryAr: 'المسرح التفاعلي المركزي الذي تُعرض عليه الطبقات وتُنفذ عليه عمليات الرسم والتعديل المباشر.',
        summaryEn: 'The central interactive stage rendering layer composites with real-time transform feedback.',
        whatItDoesAr: 'يدعم التكبير والتصغير من 10% إلى 800%، التحريك باليد (Pan)، شبكة الشفافية للمربعات (Checkerboard)، ومقابض التحويل المحيطة بالعنصر المحدد.',
        whatItDoesEn: 'Supports pan & zoom from 10% to 800%, transparency checkerboard rendering, and transform bounding box overlays.',
        whenToUseAr: 'للمعاينة الحية والتفاعل المباشر مع العناصر والطبقات.',
        whenToUseEn: 'For visually manipulating elements and observing real-time composite changes.',
        howToUseAr: [
          'حرّك عجلة الفأرة للتكبير والتصغير حول مؤشر الماوس.',
          'اضغط زر المسافة (Spacebar) مع السحب بالماوس لتحريك المشهد في أي اتجاه.',
          'انقر مباشرة على أي عنصر في اللوحة لتحديده وإظهار مقابض التحريك والتكبير.',
        ],
        howToUseEn: [
          'Scroll the mouse wheel to zoom in and out centered on the cursor position.',
          'Hold the Spacebar and drag with the left mouse button to pan smoothly across the canvas.',
          'Click directly on any layer object to select it and engage boundary transform handles.',
        ],
      },
      {
        id: 'properties-inspector',
        titleAr: 'لوحة الخصائص والمفتش (Properties Inspector)',
        titleEn: 'Properties & Inspector Panel',
        summaryAr: 'اللوحة الجانبية التفاعلية التي تحتوي على تفاصيل الطبقات، الفلاتر، المنحنيات، والتحكم بالفرشاة.',
        summaryEn: 'The contextual sidebar containing layer stacks, filter catalogs, adjustment sliders, and tool parameters.',
        whatItDoesAr: 'تتغير اللوحة بسلاسة حسب الأداة المختارة أو التبويب النشط، متيحة التحكم الدقيق في كل بارامتر رقمي بيكسل ببيكسل.',
        whatItDoesEn: 'Adapts contextually to current selections, providing fine-grained numerical and visual controls.',
        whenToUseAr: 'لإجراء التعديلات المتقدمة، إدارة ترتيب الطبقات، وضبط شدة الفلاتر والألوان.',
        whenToUseEn: 'To fine-tune color balances, reorder layers, tweak typography, and adjust brush hardness.',
        howToUseAr: [
          'استخدم علامات التبويب العلوية في اللوحة للتنقل بين: الطبقات، التحسينات، الفلاتر، الخلفيات، والنصوص.',
          'اسحب المنزلقات أو اكتب القيمة الرقمية مباشرة في الحقول المخصصة.',
        ],
        howToUseEn: [
          'Switch tabs between Layers, Adjustments, Filters, Backgrounds, and Typography.',
          'Drag sliders or type exact values into the numeric inputs for maximum precision.',
        ],
      },
    ],
  },

  // 03 — Files and Projects
  {
    id: 'files-projects',
    num: '03',
    titleAr: 'إدارة الملفات والمشاريع',
    titleEn: 'Files & Projects Management',
    icon: 'FolderKanban',
    category: 'core',
    categoryAr: 'الأساسيات والمشروع',
    categoryEn: 'Core & Project',
    briefAr: 'إنشاء مشاريع جديدة، فتح المشاريع المحفوظة، إدارة النسخ المحلية، وقوالب الأبعاد القياسية.',
    briefEn: 'Creating new documents, local project persistence, duplicate branching, and standard social presets.',
    overviewAr: 'يوفر بيكسلورا نظاماً مستقلاً لإدارة المشاريع يعتمد على التخزين المحلي الآمن. يمكنك بدء عملك من لوحة بيضاء بأبعاد مخصصة أو قوالب شبكات التواصل الاجتماعي، أو رفع صورة أو عدة صور معاً لتنظيمها تلقائياً في طبقات منفصلة.',
    overviewEn: 'Pixelora includes a robust local document system. You can spin up blank canvases tailored to social presets, or ingest single/multiple image files that automatically organize into discreet layers.',
    topics: [
      {
        id: 'new-project-presets',
        titleAr: 'إنشاء مشروع جديد وقوالب الأبعاد',
        titleEn: 'New Project Dialog & Preset Dimensions',
        summaryAr: 'بدء عمل فني جديد بأبعاد مخصصة أو استخدام قوالب السوشيال ميديا والتجارة الإلكترونية.',
        summaryEn: 'Initialize blank canvases with customized pixel dimensions or industry standard presets.',
        whatItDoesAr: 'يتيح تحديد العرض والارتفاع بالبيكسل، اسم المشروع، ولون الخلفية الأساسي (أبيض، أسود، شفاف، أو مخصص).',
        whatItDoesEn: 'Configures canvas width, height, initial background fill (transparent, white, dark), and project nomenclature.',
        whenToUseAr: 'عند بدء تصميم منشور، إعلان، بنر، أو هوية بصرية جديدة من الصفر.',
        whenToUseEn: 'When constructing banners, product hero shots, or social posts from an empty stage.',
        howToUseAr: [
          'اضغط Ctrl+N أو انقر زر "مشروع جديد" في الشريط العلوي.',
          'اختر قالباً جاهزاً: مربع انستغرام (1080x1080)، قصة/ريلز (1080x1920)، غلاف فيسبوك (1200x630)، أو منتج متجر (1200x1200).',
          'أو أدخل الأبعاد يدوياً وانقر "إنشاء المشروع".',
        ],
        howToUseEn: [
          'Press Ctrl+N or select "New Project" from the top navigation bar.',
          'Pick a preset: Instagram Square (1080x1080), Story (1080x1920), Banner (1200x630), or E-Commerce (1200x1200).',
          'Alternatively enter custom width and height and click "Create Canvas".',
        ],
      },
      {
        id: 'multi-image-import',
        titleAr: 'استيراد صور متعددة وتوليد الطبقات',
        titleEn: 'Multi-Image Ingestion & Layer Generation',
        summaryAr: 'رفع أكثر من صورة معاً لتوليد طبقات متطابقة تلقائياً دون الحاجة لرفع كل صورة منفردة.',
        summaryEn: 'Batch import multiple graphics simultaneously into automatically stacked layers.',
        whatItDoesAr: 'يقرأ ملفات الصور ويدمجها في مشروع واحد بحيث تصبح كل صورة طبقة قابلة للتحريك والتحويل والتعديل المستقل.',
        whatItDoesEn: 'Parses selected images into individual layer objects preserving original pixel resolution.',
        whenToUseAr: 'عند الرغبة في تركيب عدة عناصر، مقارنة تصاميم، أو تجميع منتجات في مشهد واحد.',
        whenToUseEn: 'When combining product variations, composing collages, or staging multi-layer assets.',
        howToUseAr: [
          'اسحب عدة ملفات صور دفعة واحدة من مدير ملفات جهازك إلى صفحة البداية.',
          'سيقوم بيكسلورا بإنشاء مشروع يتناسب مع أكبر صورة ويضع باقي الصور في طبقات فوقها.',
        ],
        howToUseEn: [
          'Select multiple images in your operating system file manager and drop them onto the home landing zone.',
          'Pixelora will instantiate a canvas scaled to fit and load each file as a separate layer.',
        ],
      },
      {
        id: 'saved-projects-library',
        titleAr: 'مكتبة المشاريع السابقة والتكرار',
        titleEn: 'Saved Projects Library & Duplication',
        summaryAr: 'استعراض جميع مشاريعك المخزنة محلياً، فتحها، تكرارها، أو حذفها بأمان.',
        summaryEn: 'Browse all locally stored design files, reload sessions, duplicate branches, or remove projects.',
        whatItDoesAr: 'يعرض بطاقات مصغرة للمشاريع السابقة مع تاريخ التعديل وعدد الطبقات، ويتيح فتح أي مشروع لمواصلة التعديل بدقة متناهية.',
        whatItDoesEn: 'Displays project thumbnail cards with timestamps and layer counts, providing 1-click session restoration.',
        whenToUseAr: 'للعودة إلى تصميم سابق أو إنشاء نسخة معدلة لعميل آخر دون التأثير على الأصل.',
        whenToUseEn: 'To revisit previous work or fork an existing design template for a new variant.',
        howToUseAr: [
          'انقر على تبويب "مشاريعي" في شريط التنقل العلوي.',
          'انقر على أي مشروع لفتحه مباشرة في المحرر.',
          'استخدم أيقونة "تكرار" لإنشاء نسخة مطابقة ومستقلة تماماً.',
        ],
        howToUseEn: [
          'Click the "Projects" tab in the main navigation menu.',
          'Click any project card to immediately mount its complete layer state in the editor.',
          'Click "Duplicate" to spawn an independent copy for testing alternatives.',
        ],
      },
    ],
  },

  // 04 — Basic Image Tools
  {
    id: 'basic-image-tools',
    num: '04',
    titleAr: 'أدوات الصورة الأساسية والهندسة',
    titleEn: 'Basic Image & Geometry Tools',
    icon: 'Maximize2',
    category: 'tools',
    categoryAr: 'أدوات التحرير',
    categoryEn: 'Editor Tools',
    briefAr: 'القص، تغيير حجم الصورة، تغيير حجم لوحة العمل، التحويل المتقدم، التدوير، والقلب.',
    briefEn: 'Crop, Document Image Size, Canvas Size, Advanced Transform, Rotation, and Flipping.',
    overviewAr: 'تشكل الأدوات الهندسية حجر الأساس في أي عملية معالجة صور. يتيح لك بيكسلورا التمييز الهندسي الدقيق بين ثلاثة مفاهيم حيوية: تغيير حجم الصورة (Resample Document)، وتغيير حجم لوحة العمل (Canvas Size)، وتكبير المشهد (Zoom Viewport).',
    overviewEn: 'Geometric operations define image boundaries and spatial resolution. Pixelora strictly distinguishes between Image Resampling (recalculating pixel matrices), Canvas Sizing (extending or cropping the frame boundary), and Viewport Zooming (magnification without altering pixels).',
    topics: [
      {
        id: 'resize-vs-canvas-vs-zoom',
        titleAr: 'المقارنة الحاسمة: حجم الصورة مقابل مساحة اللوحة مقابل التكبير',
        titleEn: 'Critical Distinction: Image Size vs Canvas Size vs Zoom',
        summaryAr: 'شرح الفارق الجوهري بين العمليات الثلاث لتجنب تشويه الصور أو تشويش جودتها.',
        summaryEn: 'Definitive breakdown of resampling pixels vs extending stage canvas vs visual viewport zoom.',
        whatItDoesAr: 'يوضح أن "حجم الصورة" يعيد حساب كل بيكسل في المشروع (Resampling)، بينما "حجم اللوحة" يوسع أو يضيق الإطار المحيط دون تشويه العناصر، و"التكبير" يغير فقط مقياس الرؤية على الشاشة دون تغيير أي بيكسل.',
        whatItDoesEn: 'Explains that Image Size recomputes bitmap resolution, Canvas Size adds or crops frame padding around existing layers, and Zoom changes only viewport scale.',
        whenToUseAr: 'استخدم "حجم الصورة" لتغيير أبعاد الملف للطباعة أو الويب، واستخدم "حجم اللوحة" لإضافة إطار أو هوامش، واستخدم "التكبير" لفحص التفاصيل الدقيقة أثناء الرسم.',
        whenToUseEn: 'Use Image Size for web optimization or print scaling, Canvas Size for padding/margins, and Zoom to inspect fine pixel details.',
        howToUseAr: [
          'لتغيير حجم الصورة: اختر Image Size من القائمة، حدد الأبعاد وخوارزمية إعادة أخذ العينات (Bilinear أو Bicubic أو Lanczos).',
          'لتغيير حجم اللوحة: اختر Canvas Size، حدد الأبعاد الجديدة ونقطة الارتكاز (Anchor Point) من الشبكة ذات الـ 9 نقاط ولون الحشو.',
          'للتكبير: استخدم أداة Z أو عجلة الماوس أو شريط التكبير في الأسفل.',
        ],
        howToUseEn: [
          'For Image Resampling: Open Image Size modal, set dimensions, and pick an algorithm (Bilinear, Bicubic, Lanczos).',
          'For Canvas Sizing: Open Canvas Size modal, pick dimension delta, anchor point on 9-point grid, and canvas background fill.',
          'For Zoom: Tap Z, roll mouse wheel, or drag the bottom percentage slider.',
        ],
      },
      {
        id: 'tool-crop',
        titleAr: 'أداة القص التفاعلية (Crop Tool - C)',
        titleEn: 'Interactive Crop Tool (C)',
        summaryAr: 'قص أطراف الصورة أو استبعاد الأجزاء غير المرغوبة مع الحفاظ على النسب المرئية.',
        summaryEn: 'Frame and trim unwanted peripheries with fixed or freeform aspect ratios.',
        whatItDoesAr: 'تتيح سحب مقابض القص من الأركان والجوانب، مع دعم نسب أبعاد قياسية (1:1، 16:9، 4:3، 9:16) وشبكة الأثلاث (Rule of Thirds) لضبط التكوين الجمالي.',
        whatItDoesEn: 'Provides an interactive rectangular viewport overlay with Rule-of-Thirds guides and aspect ratio locks.',
        whenToUseAr: 'لإعادة تأطير موضوع الصورة، إزالة الحواف المشوهة، وضبط الصورة لنسب العرض المحددة لمنصات التواصل.',
        whenToUseEn: 'To reframe compositions, remove edge distractions, or conform assets to social media feeds.',
        howToUseAr: [
          'اضغط مفتاح C لتفعيل أداة القص.',
          'اسحب مقابض الحدود المستطيلة حول العنصر المراد الاحتفاظ به.',
          'انقر مرتين داخل المستطيل أو اضغط Enter لتنفيذ القص فورياً.',
        ],
        howToUseEn: [
          'Press C to summon the crop overlay box.',
          'Drag corner handles inward or select an aspect preset (1:1, 4:5, 16:9).',
          'Double click inside the boundary or press Enter to apply crop parameters.',
        ],
        parameters: [
          {
            nameAr: 'نسبة الأبعاد (Aspect Ratio)',
            nameEn: 'Aspect Ratio',
            type: 'Preset / Free',
            defaultVal: 'Free',
            descriptionAr: 'قفل نسبة العرض إلى الارتفاع لمنع التشويه (مربع، رأسي، سينمائي).',
            descriptionEn: 'Locks the ratio between width and height during drag transformations.',
          },
          {
            nameAr: 'القص للوحة مقابل الطبقة',
            nameEn: 'Crop Canvas vs Layer',
            type: 'Mode',
            defaultVal: 'Canvas',
            descriptionAr: 'تحديد ما إذا كان القص سيقتطع المشروع ككل أم الطبقة المحددة فقط.',
            descriptionEn: 'Specifies whether to trim the entire stage or solely the selected image layer.',
          },
        ],
      },
      {
        id: 'tool-advanced-transform',
        titleAr: 'أداة التحويل المتقدم (Advanced Transform - Ctrl+T)',
        titleEn: 'Advanced Transform Tool (Ctrl+T)',
        summaryAr: 'التحكم الشامل في الموضع، الحجم، التدوير، الانحراف، ونقطة الارتكاز لجميع الطبقات.',
        summaryEn: 'Comprehensive control over position, scale, free rotation, skew, and 9-point anchor origins.',
        whatItDoesAr: 'تمنحك صندوق تحويل متكامل يحيط بالطبقة المحددة، متيحاً التحريك الدقيق ببيكسل واحد، والتدوير بأي زاوية، والقلب أفقياً وعمودياً، والانحراف على المحورين X و Y.',
        whatItDoesEn: 'Renders an interactive bounding box with 8 scale handles, a top rotation handle, skew shears, and numeric inspector sync.',
        whenToUseAr: 'لضبط أحجام العناصر داخل التصميم، موازنة المنظور، تدوير الشعارات، ومحاذاة الطبقات بدقة متناهية.',
        whenToUseEn: 'When fitting graphic overlays, aligning product mockups, shearing isometric vectors, or rotating angles.',
        howToUseAr: [
          'اضغط Ctrl+T أو اختر أداة التحويل من الشريط الجانبي.',
          'اسحب مقابض الأركان لتغيير الحجم مع قفل النسبة، أو حرك المؤشر خارج المقبض لتدوير العنصر.',
          'استخدم لوحة المفتش اليمنى لإدخال زوايا التدوير الدقيقة وأبعاد البيكسل أو أزرار المحاذاة (وسط، يمين، يسار، أعلى، أسفل).',
        ],
        howToUseEn: [
          'Press Ctrl+T to toggle advanced transformation mode on the selected layer.',
          'Drag bounding corners to scale; hover outside corners to rotate.',
          'Use the inspector panel to type precise angles, skew degrees, or apply 1-click alignments.',
        ],
      },
    ],
  },

  // 05 — Drawing and Creative Tools
  {
    id: 'drawing-creative-tools',
    num: '05',
    titleAr: 'أدوات الرسم والإبداع والمتجهات',
    titleEn: 'Drawing, Vectors & Creative Tools',
    icon: 'PenTool',
    category: 'tools',
    categoryAr: 'أدوات التحرير',
    categoryEn: 'Editor Tools',
    briefAr: 'فرشاة الرسم بأنماطها الستة، أداة القلم ومنحنيات بيزييه، الممحاة بنوعيها، ومكتبة الأشكال.',
    briefEn: '6-style Brush Tool, Bézier Pen Tool & vector paths, dual-mode Eraser, and 70+ Shape library.',
    overviewAr: 'يتضمن بيكسلورا محرك رسم وتوجيه متجهات دقيق يدعم الفرش الناعمة والصلبة والمائية والنيون، بالإضافة إلى أداة القلم (Pen Tool) لإنشاء مسارات متجهة نقية قابلة للتحويل إلى أقنعة أو مسارات ملونة.',
    overviewEn: 'Pixelora integrates procedural raster brush engines alongside editable Bézier vector paths and a library of over 70 geometric, callout, and decorative shapes.',
    topics: [
      {
        id: 'tool-brush',
        titleAr: 'فرشاة الرسم والأنماط التفاعلية (Brush Tool - B)',
        titleEn: 'Procedural Brush Tool (B)',
        summaryAr: 'الرسم الحر المباشر مع 6 أنماط إبداعية وتحكم كامل بالحجم والصلابة والشفافية.',
        summaryEn: 'Direct digital painting with 6 creative styles, customizable opacity, hardness, and dynamic color pickers.',
        whatItDoesAr: 'ترسم خطوطاً سلسة ومستمرة باستخدام خوارزميات محاكاة طبيعية؛ تشمل: الفرشاة الناعمة (Soft)، والصلبة (Hard)، وخط النيون المتوهج (Neon/Glow)، وقلم الماركر/الخط العربي (Calligraphy/Marker)، والرذاذ الهوائي (Airbrush/Spray)، والألوان المائية (Watercolor).',
        whatItDoesEn: 'Renders smooth raster strokes simulating organic media: Soft, Hard, Neon Glow, Calligraphy/Marker, Airbrush/Spray, and Watercolor.',
        whenToUseAr: 'لإضافة لمسات فنية يدوية، تنقيح الصور، كتابة تواقيع، أو تظليل حواف المنتجات.',
        whenToUseEn: 'For hand-drawn illustrations, product highlighting, digital signatures, and organic vignette touchups.',
        howToUseAr: [
          'اضغط B لاختيار الفرشاة.',
          'اختر نمط الفرشاة المناسب من لوحة المفتش اليمنى (مثل Neon أو Watercolor).',
          'اضبط حجم الفرشاة ومنزلق الصلابة ولون الرسم من لوحة الألوان أو أداة القطارة (Eyedropper).',
          'ارسم بحرية على لوحة العمل بالماوس أو القلم اللوحي.',
        ],
        howToUseEn: [
          'Press B to activate the brush tool.',
          'Select your desired brush engine from the inspector (e.g., Neon or Watercolor).',
          'Configure stroke radius, opacity, hardness, and color via the color palette or eyedropper.',
          'Paint directly onto the canvas with smooth interpolated stroke updates.',
        ],
        parameters: [
          {
            nameAr: 'حجم الفرشاة (Size)',
            nameEn: 'Brush Radius / Size',
            type: 'px (1 - 300)',
            defaultVal: '24px',
            descriptionAr: 'قطر ضربة الفرشاة بالبيكسل.',
            descriptionEn: 'Diameter of the painted stroke in canvas pixels.',
          },
          {
            nameAr: 'الصلابة (Hardness)',
            nameEn: 'Hardness',
            type: '0.0 - 1.0',
            defaultVal: '0.8',
            descriptionAr: 'تدرج تلاشي حواف الفرشاة من النعومة التامة (0) إلى الحدة القصوى (1).',
            descriptionEn: 'Controls edge falloff softness: 0 produces ultra-diffuse airbrushing, 1 creates sharp razor edges.',
          },
          {
            nameAr: 'الشفافية (Opacity)',
            nameEn: 'Opacity',
            type: '0% - 100%',
            defaultVal: '100%',
            descriptionAr: 'درجة شفافية اللون والقدرة على بناء طبقات لونية متراكبة.',
            descriptionEn: 'Alpha density of stroke pigment, allowing progressive watercolor glazing.',
          },
        ],
      },
      {
        id: 'tool-pen',
        titleAr: 'أداة القلم والمسارات المتجهة (Pen Tool - P)',
        titleEn: 'Pen Tool & Bézier Vector Paths (P)',
        summaryAr: 'بناء مسارات ومنحنيات دقيقة بنقاط الارتكاز ومقابض بيزييه القابلة للتعديل والتحويل إلى تحديد أو تعبئة.',
        summaryEn: 'Construct precise vector paths and smooth Bézier curves, with 1-click conversion to marching-ants selections or fills.',
        whatItDoesAr: 'تتيح وضع نقاط ارتكاز (Anchor Points) بنقرة ماوس، أو النقر والسحب لإنشاء مقابض توجيه المنحنيات (Direction Handles). يمكن إغلاق المسار بالنقر على نقطة البداية، ثم تحويله إلى قناع تحديد نشط، أو ملئه بلون صلب، أو رسم خط حوافه مع إمكانية تحريك النقاط في أي وقت.',
        whatItDoesEn: 'Plots anchor points and directional handles for cubic Bézier mathematics. Complete paths can be rasterized to marching-ants selection masks, stroked with vector outlines, or filled with color.',
        whenToUseAr: 'للقص اليدوي فائق الدقة للمنتجات المعقدة، رسم شعارات متجهة مخصصة، أو إنشاء أشكال هندسية غير تقليدية.',
        whenToUseEn: 'For pinpoint-accurate product clipping paths, custom vector silhouette extraction, and non-standard geometric design.',
        howToUseAr: [
          'اضغط مفتاح P لاختيار أداة القلم.',
          'انقر على لوحة العمل لإضافة نقطة مستقيمة، أو انقر واسحب لصنع منحنى ناعم.',
          'انقر على نقطة البداية الأولى لإغلاق المسار بالكامل.',
          'في لوحة المفتش اليمنى، اختر "تحويل إلى تحديد" (Make Selection) لإنشاء قناع، أو "تعبئة المسار" (Fill)، أو "رسم الحدود" (Stroke).',
        ],
        howToUseEn: [
          'Press P to engage the vector pen mode.',
          'Click to insert linear corner anchors, or click-and-drag to extend smooth tangent handles.',
          'Click back onto the root anchor point to close the path loop.',
          'Click "Make Selection" in the inspector to activate marching ants, or choose "Stroke" / "Fill".',
        ],
      },
      {
        id: 'tool-eraser',
        titleAr: 'الممحاة بنوعيها: ممحاة البيكسل وممحاة القناع (Eraser Tool - E)',
        titleEn: 'Dual-Mode Eraser: Pixel vs Mask Cutout (E)',
        summaryAr: 'محو البيكسلات مباشرة على طبقات الرسم أو إحداث اقتطاع غير إتلافي عبر قناع الطبقة.',
        summaryEn: 'Erase raster paint directly or carve non-destructive clipping holes via layer masks.',
        whatItDoesAr: 'توفر وضعين متميزين: الوضع الأول (Pixel Eraser) لمحو خطوط الرسم والبيكسلات الفعلية، والوضع الثاني (Mask Eraser / Cutout) لقص وتفريغ أجزاء من الصور دون مسح البيكسل الأصلي مع إمكانية استعادته لاحقاً عبر زر "إعادة تعيين القناع".',
        whatItDoesEn: 'Offers two modes: Raster Pixel Erasing for drawing layers, and Non-Destructive Alpha Mask Cutout for image layers with instant 1-click restore.',
        whenToUseAr: 'لتنظيف الشوائب، مسح الخلفيات يدوياً، أو دمج صورتين بنعومة عبر محو الحواف الشبه شفافة.',
        whenToUseEn: 'To clean unwanted brush strokes, hand-refine edge cutouts, or feather layer transitions non-destructively.',
        howToUseAr: [
          'اضغط مفتاح E لاختيار الممحاة.',
          'اضبط حجم الممحاة ونعومة حوافها من الشريط العلوي أو لوحة المفتش.',
          'امسح على العنصر المطلوب في لوحة العمل؛ إذا كانت الطبقة صورة، سيتم تطبيق قناع تفريغ آمن.',
        ],
        howToUseEn: [
          'Press E to activate the eraser.',
          'Calibrate brush size and edge softness.',
          'Erase over unwanted pixels; on image layers, it safely creates a mask cutout that preserves raw data.',
        ],
      },
      {
        id: 'tool-shapes',
        titleAr: 'مكتبة الأشكال والرموز التعبيرية (Shapes & Icons - U)',
        titleEn: 'Shapes & Vector Icons Library (U)',
        summaryAr: 'أكثر من 70 شكلاً هندسياً وسهماً ورمزاً تعبيرياً مع تحكم كامل بالحدود والتعبئة والتدرجات.',
        summaryEn: 'Over 70 geometric, arrow, badge, callout, and organic shapes with complete stroke and fill control.',
        whatItDoesAr: 'تتيح إدراج أشكال المتجهات النقية المقسمة إلى فئات: الأشكال الأساسية (مستطيل، دائرة، مثلث، نجمة)، الأسهم والتوجيهات، الرموز التعبيرية والفقاعات الكلامية، والشرائط والبطاقات الإعلانية.',
        whatItDoesEn: 'Inserts resolution-independent vector shapes categorized by Basic Geometry, Directional Arrows, Badges & Seals, Callouts & Speech Bubbles, and Fluid Organics.',
        whenToUseAr: 'لتصميم بطاقات الأسعار، لافتات التخفيضات، الأيقونات التوضيحية، وتأطير العناصر المهمة.',
        whenToUseEn: 'For creating discount price tags, product badges, promotional ribbons, framing cards, and CTA containers.',
        howToUseAr: [
          'اضغط مفتاح U لفتح مكتبة الأشكال الشاملة.',
          'اختر الشكل المطلوب (مثل النجمة أو فقاعة المحادثة أو الدرع).',
          'عدل لون التعبئة (Fill Color)، ولون وسُمك الإطار (Stroke Width)، وتدوير الزوايا (Corner Radius) من لوحة المفتش.',
        ],
        howToUseEn: [
          'Press U to open the shape library modal.',
          'Pick any shape geometry (e.g., starburst, badge, speech bubble, or rounded rectangle).',
          'Fine-tune fill color, stroke color, stroke weight, and corner radii in the properties panel.',
        ],
      },
    ],
  },

  // 06 — Typography & Text
  {
    id: 'typography-text',
    num: '06',
    titleAr: 'النصوص والخطوط العربية والعالمية',
    titleEn: 'Typography & Multilingual Text System',
    icon: 'Type',
    category: 'tools',
    categoryAr: 'أدوات التحرير',
    categoryEn: 'Editor Tools',
    briefAr: 'إضافة النصوص، مكتبة الخطوط العربية والإنجليزية، التدرجات اللونية، الظلال، والحدود الخارجية.',
    briefEn: 'Multilingual text engine, Arabic & Latin fonts, gradient fills, outlines, and drop shadows.',
    overviewAr: 'تمتلك بيكسلورا منظومة طباعية متكاملة تدعم اتجاه الكتابة من اليمين لليسار (RTL) للغة العربية ومن اليسار لليمين (LTR) للغات اللاتينية، مع حزمة خطوط ويب مختارة بعناية ودعم كامل للتدرجات والظلال متعددة الطبقات.',
    overviewEn: 'Pixelora features an advanced dual-engine typography system supporting full bidirectional Arabic (RTL) text shaping alongside Latin fonts, gradient fills, multiple strokes, and soft drop shadows.',
    topics: [
      {
        id: 'text-creation-editing',
        titleAr: 'إنشاء وتعديل النصوص والتحكم بالخطوط',
        titleEn: 'Text Creation, Alignment & Font Selection',
        summaryAr: 'إضافة طبقات نصية قابلة للتعديل الفوري مع تشكيلة من أجمل الخطوط العربية والإنجليزية.',
        summaryEn: 'Instant text layer insertion with bidirectional RTL/LTR support and curated font families.',
        whatItDoesAr: 'تتيح كتابة العناوين والنصوص الإعلانية، وتغيير نوع الخط من بين خطوط معتمدة مثل: Cairo، Tajawal، Almarai، Amiri، Changa، Alexandria، El Messiri، و Inter، Roboto، Montserrat وغيرها.',
        whatItDoesEn: 'Facilitates inline headline and body composition using popular web fonts (Cairo, Tajawal, Amiri, Alexandria, Inter, Montserrat, Playfair).',
        whenToUseAr: 'لكتابة عناوين الحملات التسويقية، أسماء المنتجات، الأسعار، والنصوص التوضيحية للتصاميم.',
        whenToUseEn: 'For branding titles, e-commerce promotional banners, calls-to-action, and watermarks.',
        howToUseAr: [
          'اضغط مفتاح T في لوحة المفاتيح لإدراج طبقة نصية فورية.',
          'اكتب النص في حقل الإدخال بلوحة المفتش اليمنى؛ يتغير النص على اللوحة بشكل فوري.',
          'اختر حجم الخط، المحاذاة (يمين، وسط، يسار، ضبط)، وتباعد الحروف، وارتفاع السطر.',
        ],
        howToUseEn: [
          'Press T on your keyboard to instantiate a new typography layer.',
          'Type your copy directly into the inspector text field with real-time canvas rendering.',
          'Select font family, font size, letter spacing, line height, and text alignment.',
        ],
      },
      {
        id: 'text-styling-effects',
        titleAr: 'تأثيرات النصوص: التدرجات، الحدود، والظلال',
        titleEn: 'Styling Effects: Gradients, Strokes & Shadows',
        summaryAr: 'تطبيق ألوان متدرجة فاخرة، وتأطير النص بخطوط حدودية متباينة، وإسقاط ظلال ناعمة.',
        summaryEn: 'Apply luxury multi-stop gradients, outer stroke outlines, and elevated drop shadows.',
        whatItDoesAr: 'يسمح بتعبئة النص بلون صلب أو باختيار قوالب تدرجات جاهزة (مثل التدرج البنفسجي، الذهبي الملكي، والوردي الناري)، مع إمكانية إضافة إطار خارجي (Stroke) وظل ثلاثي الأبعاد مع التحكم في الزاوية والتلاشي.',
        whatItDoesEn: 'Renders linear text gradients across customizable angles, multi-pixel vector stroke envelopes, and soft Gaussian drop shadows.',
        whenToUseAr: 'لإبراز النصوص فوق الصور المليئة بالتفاصيل وضمان مقروئيتها العالية وتماشيها مع الهوية البصرية.',
        whenToUseEn: 'To guarantee high contrast over busy photography backgrounds and inject premium aesthetic polish.',
        howToUseAr: [
          'في لوحة مفتش النصوص، فعّل خيار "التدرج اللوني" (Gradient) واختر أحد النماذج المسبقة.',
          'لتحديد حواف النص، فعّل خيار "الحدود الخارجية" (Stroke) واختر السُمك واللون المرغوب.',
          'لإضافة عمق ثلاثي الأبعاد، فعّل "الظل" (Shadow) واضبط بعد الظل وتلاشيه.',
        ],
        howToUseEn: [
          'In the text properties panel, toggle "Gradient Fill" and select a color palette.',
          'To outline the characters, enable "Stroke" and set pixel thickness and outline color.',
          'To introduce depth, enable "Shadow" and adjust X/Y offset, blur radius, and shadow color.',
        ],
      },
    ],
  },

  // 07 — Layers and Masks
  {
    id: 'layers-masks',
    num: '07',
    titleAr: 'نظام الطبقات والأقنعة وأنماط الدمج',
    titleEn: 'Layers, Masks & Blend Modes Architecture',
    icon: 'Layers',
    category: 'editing',
    categoryAr: 'التحرير والطبقات',
    categoryEn: 'Editing & Layers',
    briefAr: 'إدارة شجرة الطبقات، إعادة الترتيب، الرؤية والقفل، 16 نمط دمج، والأقنعة غير الإتلافية.',
    briefEn: 'Layer hierarchy, drag reordering, visibility & lock, 16 blend modes, and non-destructive masking.',
    overviewAr: 'يعتمد بيكسلورا على معمارية طبقات متطورة تضمن التحرير غير الإتلافي (Non-destructive Editing). كل عنصر يتم إنشاؤه يعيش في طبقة منفصلة تماماً مع مصفوفة تحويل وقناع خاص وخصائص دمج لونية مستقلة.',
    overviewEn: 'Pixelora utilizes a non-destructive layer stack. Each element (image, text, shape, drawing, or effect layer) possesses its own isolated transform matrix, alpha mask, opacity, and blend mode mathematics.',
    topics: [
      {
        id: 'layer-management',
        titleAr: 'إدارة شجرة الطبقات والترتيب والحماية',
        titleEn: 'Layer Tree Management, Ordering & Protection',
        summaryAr: 'ترتيب الطبقات بالسحب، تغيير الشفافية، إخفاء وقفل العناصر لمنع تحريكها العرضي.',
        summaryEn: 'Drag-and-drop layer hierarchy, opacity sliders, visibility toggling, and locking.',
        whatItDoesAr: 'تتيح لوحة الطبقات رؤية كافة العناصر المكونة للتصميم من الأسفل للأعلى، مع إمكانية سحب أي طبقة لتقديمها أو تأخيرها، وتكرار الطبقة (Duplicate)، وقفلها (Lock) لمنع تعديلها، وحذفها بنقرة واحدة.',
        whatItDoesEn: 'Renders the bottom-to-top compositional stack, enabling drag reordering, duplication, locking against accidental edits, and deletion.',
        whenToUseAr: 'في جميع مراحل التصميم لتنظيم المشهد، التحكم بأولويات الرؤية، وتثبيت الخلفيات أو العناصر الثابتة.',
        whenToUseEn: 'Throughout every project to organize scene depth, manage z-index ordering, and anchor background assets.',
        howToUseAr: [
          'افتح تبويب "الطبقات" (Layers) في اللوحة الجانبية.',
          'انقر واسحب الطبقة لأعلى أو لأسفل لتغيير موقعها في الترتيب الرأسي.',
          'انقر على أيقونة "العين" لإخفاء أو إظهار الطبقة مؤقتاً.',
          'انقر على أيقونة "القفل" لتثبيت الطبقة في مكانها ومنع تحديدها أو سحبها بالخطأ على اللوحة.',
        ],
        howToUseEn: [
          'Open the "Layers" tab in the right-hand panel.',
          'Click and drag any layer card up or down to adjust visual stacking precedence.',
          'Click the eye icon to toggle visibility on and off without deleting assets.',
          'Click the padlock icon to freeze a layer against accidental canvas drag operations.',
        ],
      },
      {
        id: 'blend-modes-table',
        titleAr: 'أنماط الدمج الـ 16 (Blend Modes) ومعادلاتها',
        titleEn: '16 Blend Modes & Mathematical Compounding',
        summaryAr: 'كيف تتفاعل ألوان الطبقة العليا مع الطبقات السفلية لخلق تأثيرات إضاءة ودمج سينمائية.',
        summaryEn: 'How foreground pixels mathematically compound with background layers for light and color effects.',
        whatItDoesAr: 'يدعم 16 نمط دمج قياسي تتوزع على 6 مجموعات رياضية: العادي (Normal)، التعتيم (Multiply, Darken, Color Burn)، التفتيح (Screen, Lighten, Color Dodge)، التباين (Overlay, Soft Light, Hard Light)، المقارنة (Difference, Exclusion)، والتلوين (Hue, Saturation, Color, Luminosity).',
        whatItDoesEn: 'Implements standard W3C compositing algorithms: Normal, Multiply, Darken, Color Burn, Screen, Lighten, Color Dodge, Overlay, Soft Light, Hard Light, Difference, Exclusion, Hue, Saturation, Color, and Luminosity.',
        whenToUseAr: 'لدمج القوام والأنسجة، إضافة توهجات ضوئية، تلوين الصور أحادية اللون، أو خلق تأثيرات فوتوغرافية معقدة.',
        whenToUseEn: 'To seamlessly blend light leaks, apply grunge textures, colorize black & white imagery, or create double exposures.',
        howToUseAr: [
          'حدد الطبقة المراد دمجها من لوحة الطبقات.',
          'افتح القائمة المنسدلة "نمط الدمج" (Blend Mode) بجوار منزلق الشفافية.',
          'اختر النمط المطلوب وشاهد النتيجة التفاعلية المباشرة على اللوحة.',
        ],
        howToUseEn: [
          'Select your target layer in the layer stack.',
          'Click the "Blend Mode" dropdown menu next to the opacity slider.',
          'Choose an option (e.g., Screen for light leaks or Multiply for shadows) and observe real-time blending.',
        ],
      },
      {
        id: 'layer-masks-nondestructive',
        titleAr: 'الأقنعة غير الإتلافية وطبقات التأثيرات',
        titleEn: 'Non-Destructive Masks & Effect Layers',
        summaryAr: 'إخفاء أجزاء من الطبقة دون حذف بيكسل واحد، وتطبيق فلاتر مخصصة في طبقات مستقلة.',
        summaryEn: 'Feather or isolate layer portions with alpha masks, and manage adjustments on dedicated effect layers.',
        whatItDoesAr: 'يحتفظ القناع بمعلومات الشفافية للبيكسلات؛ حيث يخفي المناطق المحددة بينما تظل الصورة الأصلية سليمة في الذاكرة. كما يدعم بيكسلورا إنشاء "طبقات تأثيرات" (Effect Layers) لتطبيق الفلاتر والتحسينات كطبقة مستقلة تندمج مع باقي التصميم.',
        whatItDoesEn: 'Maintains an 8-bit alpha mask channel alongside layer pixels, allowing reversible cutouts. Dedicated Effect Layers isolate adjustment algorithms for modular non-destructive tuning.',
        whenToUseAr: 'عند عزل المنتجات، تنعيم أطراف التركيبات، أو تجربة فلاتر لونية يمكن حذفها أو تعديلها في أي وقت دون المساس بالصورة.',
        whenToUseEn: 'When compositing elements, smoothing subject boundaries, or experimenting with reversible color looks.',
        howToUseAr: [
          'استخدم أداة الممحاة في وضع القناع أو أداة القلم لإنشاء قناع على الطبقة المحددة.',
          'يمكنك عكس القناع (Invert Mask) أو مسحه بالكامل لاستعادة الصورة الأصلية بنقرة واحدة عبر "إعادة تعيين القناع".',
          'استخدم خيار "دمج الطبقات المرئية" (Merge Visible) لدمج كل الطبقات النشطة في طبقة واحدة نهائية عند الحاجة.',
        ],
        howToUseEn: [
          'Use the Eraser in mask mode or Pen path selection to carve out transparent zones on the layer.',
          'Click "Invert Mask" or "Reset Mask" in the inspector to restore raw image pixels anytime.',
          'Click the "Merge Visible" icon in the layer header to bake all unhidden layers into a consolidated raster.',
        ],
      },
    ],
  },

  // 08 — Lightroom Adjustments
  {
    id: 'adjustments-system',
    num: '08',
    titleAr: 'نظام التحسينات وضبط الألوان الاحترافي',
    titleEn: 'Professional Adjustments & Color Grading',
    icon: 'Sliders',
    category: 'editing',
    categoryAr: 'التحرير والطبقات',
    categoryEn: 'Editing & Layers',
    briefAr: 'محرك التحسينات الشامل: الإضاءة، منحنيات النغمات RGB، موازن HSL، عجلات الألوان، والحدة والتأثيرات البصرية.',
    briefEn: 'Comprehensive adjustment engine: Exposure, RGB Tone Curves, 8-band HSL Mixer, 3-Way Wheels, and Optics.',
    overviewAr: 'يحتوي بيكسلورا على استوديو تحسينات متكامل يحاكي برامج تحميض الصور الاحترافية (مثل Adobe Lightroom). ينقسم الاستوديو إلى تبويبات متخصصة تمنحك تحكماً بيكسلياً في مستويات الإضاءة، التباين، موازنة الألوان المنفصلة، وتوزيع التدرجات على الظلال والنغمات المتوسطة والإضاءات العالية.',
    overviewEn: 'Pixelora features an industrial-strength darkroom pipeline modeled after professional RAW developers. Divided into modular toolsets, it provides mathematical pixel control over photometric exposure, multi-channel splines, selective chromatic bands, and color balance balance.',
    topics: [
      {
        id: 'basic-light-tone',
        titleAr: 'الإضاءة والنغمات الأساسية (Basic Light & Color)',
        titleEn: 'Basic Light, Tone & White Balance',
        summaryAr: 'التعرض، التباين، الإضاءات العالية، الظلال، البياض، السواد، والحرارة اللونية والتشبع.',
        summaryEn: 'Exposure, Contrast, Highlights, Shadows, Whites, Blacks, Temperature, Tint, Vibrance, and Saturation.',
        whatItDoesAr: 'يعيد معايرة التوزيع الضوئي واللوني للصورة؛ يتيح استعادة تفاصيل الظلال المعتمة دون تفتيح زائد للصورة، وتعديل حرارة اللون (Kelvin) من الأزرق البارد إلى البرتقالي الدافئ، وزيادة حيوية الألوان الباهتة (Vibrance) دون تشويه درجات ألوان البشرة.',
        whatItDoesEn: 'Recalibrates dynamic range: lifts shadow detail without blowing out highlights, tunes Kelvin temperature, balances green/magenta tint, and boosts vibrance while protecting skin tones.',
        whenToUseAr: 'كخطوة تصحيح أولى وأساسية في معالجة أي صورة لمعادلة الإضاءة وضبط الألوان الطبيعية.',
        whenToUseEn: 'As the foundational first pass for correcting underexposure, dynamic range clipping, or skewed white balance.',
        howToUseAr: [
          'انتقل إلى تبويب "التحسينات" (A) في اللوحة اليمنى.',
          'اضبط منزلق "التعرض" (Exposure) لتفتيح أو تعتيم المشهد ككل.',
          'استخدم "الإضاءات" (Highlights) و"الظلال" (Shadows) لاستعادة التفاصيل في المناطق شديدة السطوع أو الإعتام.',
          'اضبط "درجة الحرارة" (Temperature) لمنح الصورة دفئاً شمسياً أو برودة ثلجية متقنة.',
        ],
        howToUseEn: [
          'Navigate to the Adjustments panel (press A or click the Sliders icon).',
          'Tweak "Exposure" to calibrate global photometric intensity.',
          'Balance "Highlights" and "Shadows" to preserve high-contrast dynamic textures.',
          'Fine-tune "Temperature" and "Tint" for lifelike white balance realism.',
        ],
      },
      {
        id: 'tone-curves-editor',
        titleAr: 'محرر منحنيات النغمات التفاعلي (Tone Curves RGB/R/G/B)',
        titleEn: 'Interactive Tone Curves (Composite & R/G/B)',
        summaryAr: 'التحكم المنحني المتقدم في النغمات المركبة وقنوات الألوان الأحمر والأخضر والأزرق بشكل مستقل.',
        summaryEn: 'Parametric and point-based cubic spline curves for composite RGB and individual color channels.',
        whatItDoesAr: 'يرسم منحنى استجابة تفاعلي فوق هيستوجرام الصورة؛ يمكنك إضافة نقاط ارتكاز وسحبها لضبط استجابة الظلال والنغمات المتوسطة والإضاءات العالية. كما يتيح التبديل لقنوات الألوان (Red, Green, Blue) لتنفيذ تدريجات لونية سينمائية فائقة التعقيد.',
        whatItDoesEn: 'Evaluates monotonic cubic splines across an integrated histogram display. Dragging points tunes tone ranges, while switching to R/G/B channels enables cinematic split-toning cross-processing.',
        whenToUseAr: 'لإنشاء تباين S-Curve الكلاسيكي، تعتيم اللون الأسود لصنع مظهر الأفلام القديمة (Matte Shadows)، وتصحيح انحرافات الألوان في القنوات الفردية.',
        whenToUseEn: 'To construct iconic S-curves, lift blacks for a matte film look, or color grade shadows and highlights via channel isolation.',
        howToUseAr: [
          'انقر على قسم "منحنى النغمات" (Tone Curve) لفتحه.',
          'انقر في أي مكان على الخط القطري لإضافة نقطة تحكم جديدة.',
          'اسحب النقطة للأعلى للتفتيح أو للأسفل للتعتيم؛ اسحب نقطة أقصى اليسار السفلية للأعلى لصنع تأثير المظهر الباهت (Matte Film).',
          'انقر على أزرار R و G و B لتلوين الظلال والإضاءات بدقة متناهية.',
        ],
        howToUseEn: [
          'Expand the Tone Curve accordion in the Adjustments panel.',
          'Click anywhere along the diagonal curve to insert a control anchor point.',
          'Drag upward to brighten, downward to darken; raise the bottom-left anchor to lift blacks for a matte look.',
          'Toggle R, G, and B buttons to color-cast shadows or highlights independently.',
        ],
      },
      {
        id: 'hsl-mixer-editor',
        titleAr: 'موازن الألوان الانتقائي (8-Channel HSL Mixer)',
        titleEn: '8-Channel Selective HSL Mixer',
        summaryAr: 'تعديل درجة اللون (Hue)، والتشبع (Saturation)، والإضاءة (Luminance) لكل نطاق لوني منفصل.',
        summaryEn: 'Isolate and calibrate Hue, Saturation, and Luminance across 8 individual chromatic bands.',
        whatItDoesAr: 'يقسم ألوان الصورة إلى 8 نطاقات نقية: الأحمر، البرتقالي، الأصفر، الأخضر، السماوي، الأزرق، البنفسجي، والماجنتا. يمكنك تغيير لون السماء الزرقاء دون التأثير على العشب الأخضر، أو تفتيح ألوان البشرة (البرتقالي) دون مساس بباقي التصميم.',
        whatItDoesEn: 'Segregates the spectrum into 8 discrete bands (Red, Orange, Yellow, Green, Aqua, Blue, Purple, Magenta) with dedicated Hue, Saturation, and Luminance sliders per band.',
        whenToUseAr: 'لتفتيح وتنعيم بشرة الوجوه (نطاق البرتقالي والأصفر)، تحويل أوراق الشجر إلى ألوان خريفية (الأخضر)، وتعميق زرقة السماء والبحار (الأزرق).',
        whenToUseEn: 'For perfecting portrait skin tones, transforming summer foliage into autumn golds, or saturating sky blues without oversaturating faces.',
        howToUseAr: [
          'افتح قسم "موازن الألوان HSL" في لوحة التحسينات.',
          'اختر التبويب المطلوب: تدرج اللون (Hue)، التشبع (Saturation)، أو الإضاءة (Luminance).',
          'حرّك منزلق اللون المستهدف؛ مثلاً زيادة إضاءة البرتقالي تجعل الوجه أكثر إشراقاً ونضارة.',
        ],
        howToUseEn: [
          'Expand the HSL Mixer section.',
          'Select between Hue, Saturation, and Luminance tabs.',
          'Adjust specific sliders: for example, nudging Orange luminance upward instantly illuminates facial skin.',
        ],
      },
      {
        id: 'color-grading-wheels',
        titleAr: 'عجلات التدرج اللوني السينمائي (Color Grading 3-Way Wheels)',
        titleEn: 'Cinematic 3-Way Color Grading Wheels',
        summaryAr: 'تلوين الظلال، النغمات المتوسطة، والإضاءات العالية عبر عجلات ثلاثية الأبعاد مع موازنة التوازن والدمج.',
        summaryEn: 'Industry-standard 3-way color wheels for Shadows, Midtones, and Highlights with Blending & Balance.',
        whatItDoesAr: 'توفر ثلاث عجلات لونية بصرية احترافية: واحدة للظلال (Shadows)، وواحدة للنغمات المتوسطة (Midtones)، وواحدة للإضاءات العالية (Highlights)، بالإضافة إلى منزلق التوازن (Balance) ومنزلق الدمج (Blending) لتحقيق المظهر السينمائي الأكثر شهرة عالمياً (Teal and Orange).',
        whatItDoesEn: 'Presents visual chromatic wheels targeting darks, midtones, and specular highlights, balanced by global blending and tonal distribution controls for blockbuster cinematic looks.',
        whenToUseAr: 'لإعطاء التصوير الفوتوغرافي طابعاً سينمائياً موحداً (Film Grading) يليق بأفلام هوليوود وإعلانات المتاجر الفاخرة.',
        whenToUseEn: 'To infuse photography with a deliberate, director-level color palette (e.g., Teal shadows and warm Golden Hour highlights).',
        howToUseAr: [
          'افتح قسم "التدرج اللوني السينمائي" (Color Grading).',
          'اسحب النقطة المركزية في عجلة الظلال نحو اللون الأزرق أو التركواز.',
          'اسحب النقطة في عجلة الإضاءات العالية نحو اللون البرتقالي أو الذهبي.',
          'اضبط منزلق "الموازنة" (Balance) لتحديد أي التأثيرين يطغى على الصورة.',
        ],
        howToUseEn: [
          'Open the Color Grading panel.',
          'Drag the center crosshair in the Shadows wheel toward cool teal.',
          'Drag the Highlights wheel crosshair toward warm amber.',
          'Calibrate the "Balance" slider to govern whether highlights or shadows dominate the scene.',
        ],
      },
      {
        id: 'detail-effects-optics',
        titleAr: 'التفاصيل، التأثيرات، وحبيبات الأفلام (Detail, Effects & Optics)',
        titleEn: 'Detail Sharpening, Film Grain & Optics',
        summaryAr: 'الحدة البصرية، تقليل الضوضاء، الوضوح (Clarity)، إزالة الضباب (Dehaze)، التظليل المحيطي، وحبيبات الفيلم.',
        summaryEn: 'Unsharp sharpening, noise suppression, clarity, dehaze, vignette framing, and analog film grain.',
        whatItDoesAr: 'يعالج البنية الدقيقة للصورة؛ يزيد حدة التفاصيل (Sharpening) مع قناع لحماية المساحات الناعمة، يزيل التحبب والضوضاء الرقمية، يمنح تظليلاً محيطياً درامياً للحواف (Vignette)، ويحاكي المظهر التناظري الكلاسيكي بإضافة حبيبات الأفلام السينمائية (Film Grain).',
        whatItDoesEn: 'Sculpts micro-contrast and tactile realism: edge sharpening with masking, luminance noise reduction, clarity punch, atmospheric dehazing, vignette shading, and analog 35mm grain.',
        whenToUseAr: 'لإبراز تفاصيل المنتجات والمجوهرات والأقمشة، وتأطير عين المشاهد نحو مركز الصورة بحواف معتمة أنيقة.',
        whenToUseEn: 'To sharpen fine textiles and jewelry facets, eliminate high-ISO sensor noise, and frame focal subjects with elegant edge vignettes.',
        howToUseAr: [
          'في قسم "التفاصيل" (Detail)، ارفع منزلق الحدة لإبراز الملامح بدقة.',
          'في قسم "التأثيرات" (Effects)، اضبط منزلق "الوضوح" (Clarity) لإبراز التباين الموضعي.',
          'استخدم منزلق "التظليل المحيطي" (Vignette) بسحبه لليسار لصنع إطار مظلم ناعم يركز الانتباه على منتجك.',
        ],
        howToUseEn: [
          'Under the Detail tab, increase Sharpening amount to crisp up textures.',
          'Under Effects, apply Clarity to pop midtone local contrast.',
          'Nudge Vignette leftward to introduce a subtle, elegant focal shadow around the outer borders.',
        ],
      },
    ],
  },

  // 09 — Preset Filters
  {
    id: 'preset-filters',
    num: '09',
    titleAr: 'مكتبة الفلاتر الجاهزة والأنماط البصرية',
    titleEn: 'Preset Filters & Photographic Styles',
    icon: 'Sparkles',
    category: 'editing',
    categoryAr: 'التحرير والطبقات',
    categoryEn: 'Editing & Layers',
    briefAr: 'الفلاتر الفوتوغرافية الجاهزة، فئات الأنماط الثمانية، منزلق الشدة، ومقارنة قبل وبعد.',
    briefEn: 'Instant stylistic photo presets across 8 categories, intensity blending slider, and before/after comparison.',
    overviewAr: 'تحتوي مكتبة الفلاتر في بيكسلورا على أنماط احترافية مسبقة الإعداد تمنح صورك هوية بصرية متميزة بنقرة واحدة. لا تعتمد الفلاتر على مجرد طبقات لونية رخيصة، بل تطبق مصفوفات تحويل لونية ونغمية متطورة مع تحكم كامل بنسبة الشدة من 0% إلى 100% ومقارنة فورية بالصورة الأصلية.',
    overviewEn: 'Pixelora’s preset library applies instant director-grade aesthetics across 8 distinct categories. Operating as true parametric transforms, each preset features an intensity blending slider (0-100%) and a split-screen Before/After modal.',
    topics: [
      {
        id: 'filter-categories',
        titleAr: 'فئات الفلاتر الثمانية المتخصصة',
        titleEn: 'The 8 Photographic Preset Families',
        summaryAr: 'أنماط متنوعة تغطي كافة الاحتياجات: الأساسية، السينمائية، القديمة، الأبيض والأسود، الدافئة، والباردة.',
        summaryEn: 'Diverse artistic looks: Basic, Cinematic, Vintage/Film, Black & White, Warm, Cool, Portrait, and Artistic.',
        whatItDoesAr: 'توفر بطاقات مصغرة مع معاينة بصرية حية لكل نمط: فئة السينما تعطي تباين أفلام هوليوود، فئة الأبيض والأسود تحاكي أفلام الفضة الكلاسيكية بنغمات رمادية عميقة، فئة البورتريه تنعم البشرة وتعزز الإشراق، وفئة الفينتاج تعيد بريق كاميرات السبعينيات والثمانينيات.',
        whatItDoesEn: 'Presents responsive thumbnail cards across 8 families: Cinematic (high dynamic drama), Vintage (nostalgic film tones), B&W (silver halide contrast), Portrait (flattering skin softness), Warm (golden glow), and Cool (crisp icy blues).',
        whenToUseAr: 'لإنجاز تعديل جمالي متكامل وسريع، أو توحيد الهوية البصرية لجميع منشورات حسابك على وسائل التواصل الاجتماعي.',
        whenToUseEn: 'For rapid visual polish or establishing a uniform, branded look across social media campaigns.',
        howToUseAr: [
          'افتح تبويب "الفلاتر" (F) في اللوحة الجانبية.',
          'استخدم أزرار التصنيفات العلوية لاختيار الفئة المطلوبة (مثل Cinematic أو Vintage).',
          'انقر على بطاقة الفلتر لتطبيقه فوراً على الطبقة المحددة أو كتأثير مستقل.',
        ],
        howToUseEn: [
          'Press F or switch to the Filters tab in the inspector.',
          'Click a category pill (e.g., Cinematic, Vintage, B&W).',
          'Click any thumbnail card to apply the preset pipeline instantly to the target layer.',
        ],
      },
      {
        id: 'preset-intensity-comparison',
        titleAr: 'منزلق شدة الفلتر ومعاينة قبل وبعد (Before & After)',
        titleEn: 'Filter Intensity Slider & Before/After Comparison',
        summaryAr: 'مزج الفلتر بنسبة دقيقة ومقارنة النتيجة مع الصورة الأصلية بدون تعديل.',
        summaryEn: 'Continuous alpha blending (0-100%) and split-screen before/after visual inspection.',
        whatItDoesAr: 'يتيح منزلق الشدة (Intensity) تخفيف حدة الفلتر حتى يندمج بنعومة مع ألوان الصورة الطبيعية، بينما يتيح زر "قبل وبعد" المقارنة الفورية بضغطة زر لرؤية التغييرات المطبقة بوضوح تام.',
        whatItDoesEn: 'The Intensity slider dynamically interpolates between default parameters and full preset values, while the Before/After modal allows side-by-side or hold-to-compare verification.',
        whenToUseAr: 'لتفادي المبالغة في التأثيرات البصرية وضمان ظهور الصورة بشكل واقعي وطبيعي ومتوازن.',
        whenToUseEn: 'To prevent oversaturation and evaluate whether visual enhancements genuinely elevate the photograph.',
        howToUseAr: [
          'بعد اختيار الفلتر، حرّك منزلق "شدة الفلتر" (Preset Intensity) لتحديد النسبة المرغوبة (مثلاً 70%).',
          'انقر على زر "مقارنة قبل / بعد" في اللوحة لمعاينة الفرق بين الصورة الأصلية والتعديل الحالي جنباً إلى جنب.',
        ],
        howToUseEn: [
          'Once a preset is selected, drag the "Preset Intensity" slider (e.g., to 75% for balanced subtlety).',
          'Click the "Before / After" comparison icon to inspect your original and edited states side-by-side.',
        ],
      },
    ],
  },

  // 10 — Scientific Image Processing
  {
    id: 'image-processing',
    num: '10',
    titleAr: 'معالجة الصور الرقمية الرياضية (64 فلتراً)',
    titleEn: 'Scientific Image Processing (64 Algorithms)',
    icon: 'Binary',
    category: 'processing',
    categoryAr: 'المعالجة الرياضية',
    categoryEn: 'Mathematical Processing',
    briefAr: 'المعالجة النقطية، المرشحات المكانية، كشف الحواف، العمليات المورفولوجية، وتعديل الهيستوجرام وتحويلات فورييه.',
    briefEn: 'Point operations, spatial convolutions, edge detection, morphology, histogram CLAHE, and 2D FFT Fourier domain.',
    overviewAr: 'يتميز بيكسلورا بمكتبة علمية متفردة تضم 64 خوارزمية معالجة صور رقمية تعمل مباشرة على مصفوفات البيكسل الخام (Uint8ClampedArray). صُممت هذه الفلاتر لتلبي احتياجات الطلاب والمهندسين والباحثين في علوم الحاسب والرؤية الحاسوبية، وتغطي كافة فروع معالجة الصور الرقمية الأكاديمية.',
    overviewEn: 'Pixelora contains an unprecedented scientific image processing engine featuring 64 algorithms executing on raw pixel buffers. Designed for computer vision engineers and academic researchers, it provides authentic mathematical implementations across spatial, morphological, histogram, and frequency domains.',
    topics: [
      {
        id: 'point-processing',
        titleAr: 'المعالجة النقطية والتحويلات الحسابية (Point Processing)',
        titleEn: 'Point Processing & Pixel Transforms',
        summaryAr: 'التحويل الرمادي، العكس، العتبة الثنائية، التكميم، تحويل لوغاريتمي، وقانون القوة (Gamma).',
        summaryEn: 'Grayscale, Inversion, Binary & Adaptive Thresholding, Posterize, Solarize, Log Transform, and Power-Law Gamma.',
        whatItDoesAr: 'تجري تحويلات رياضية مباشرة على كل بيكسل بمفرده دون الاعتماد على جيرانه: تشمل معادلات التدرج الرمادي الدقيقة، العكس اللوني، تصحيح غاما، والتقطيع الثنائي بقيمة عتبة تفاعلية.',
        whatItDoesEn: 'Maps each input pixel value f(x,y) to output g(x,y) independently: luminance grayscale, negative inversion, power-law gamma curves, log transforms, and interactive threshold cutoffs.',
        whenToUseAr: 'لإعداد الصور قبل المعالجة المتقدمة، تحسين التباين في المناطق المظلمة، أو فصل النصوص عن الخلفيات البيضاء.',
        whenToUseEn: 'For machine vision pre-processing, optical document binarization, and non-linear dynamic range expansion.',
        howToUseAr: [
          'اختر فئة "المعالجة النقطية" (Point Processing) من مكتبة الفلاتر.',
          'اختر خوارزمية مثل "العتبة الثنائية" (Binary Threshold) أو "تصحيح غاما" (Gamma Correction).',
          'استخدم منزلق البارامترات المخصص أسفل شدة الفلتر لتعديل قيمة العتبة (Threshold) أو قيمة غاما فورياً.',
        ],
        howToUseEn: [
          'Select the "Point Processing" category from the filters library.',
          'Pick an algorithm such as "Binary Threshold" or "Gamma Correction".',
          'Use the contextual parameter slider below the intensity control to adjust the threshold or gamma coefficient in real time.',
        ],
      },
      {
        id: 'spatial-noise-filters',
        titleAr: 'المرشحات المكانية وتقليل الضوضاء (Spatial & Noise Reduction)',
        titleEn: 'Spatial Convolutions & Noise Reduction',
        summaryAr: 'التمويه الصندوقي، التمويه الغاوسي القابل للفصل، مرشح الوسيط (Median)، والتنعيم الثنائي (Bilateral).',
        summaryEn: 'Box Blur, Separable Gaussian Blur, Median Filter, Min/Max Filter, Bilateral Edge-Preserving, and Wiener Filter.',
        whatItDoesAr: 'تطبق التواءً رياضياً (Convolution Matrix) مع جيران البيكسل. يوفر بيكسلورا خوارزمية Gaussian Blur قابلة للفصل (Separable O(N)) لسرعة فائقة، ومرشح الوسيط الحقيقي لإزالة ضوضاء الملح والفلفل دون إتلاف الحواف، والمرشح الثنائي (Bilateral) لتنعيم البشرة مع الحفاظ التام على حدة العيون والتفاصيل الدقيقة.',
        whatItDoesEn: 'Executes spatial convolution kernels over pixel neighborhoods: separable 1D Gaussian passes for 60fps performance, rank-order Median filtering for salt-and-pepper noise removal, and Bilateral filtering for bilateral edge-preserving skin smoothing.',
        whenToUseAr: 'لتنظيف الصور الملتقطة في إضاءة ضعيفة، إزالة تشويش الحساسات، وعزل المواضيع بتمويه ناعم.',
        whenToUseEn: 'For cleaning high-ISO sensor noise, removing impulse speckles, and creating smooth cinematic bokeh while keeping borders razor-sharp.',
        howToUseAr: [
          'اختر فئة "التمويه والتنعيم" أو "تقليل الضوضاء".',
          'طبّق "Bilateral Filter" أو "Median Filter".',
          'اضبط نصف قطر النواة (Kernel Radius) للتحكم في مدى نعومة النتيجة.',
        ],
        howToUseEn: [
          'Select the "Blur & Smoothing" or "Noise Reduction" filter category.',
          'Apply the "Bilateral Filter" or "Median Filter".',
          'Adjust the radius slider to calibrate neighborhood smoothing strength.',
        ],
      },
      {
        id: 'edge-detection-morphology',
        titleAr: 'كشف الحواف والعمليات المورفولوجية (Edge Detection & Morphology)',
        titleEn: 'Edge Detection Operators & Mathematical Morphology',
        summaryAr: 'مشغلات سوبل، بريويت، كاني (Canny)، التمدد والتآكل (Dilation & Erosion)، والفتح والإغلاق.',
        summaryEn: 'Sobel, Prewitt, Roberts, Scharr, Multi-stage Canny Edge Detector, Dilation, Erosion, Opening, and Closing.',
        whatItDoesAr: 'يستخرج الحدود الهندسية والخطوط الفاصلة في الصورة عبر حساب مشتقات التدرج المكاني، متضمناً كاشف كاني متعدد المراحل مع قمع غير الحدود القصوى (Non-Maximum Suppression) والتردد الثنائي. كما يتيح العمليات المورفولوجية الثنائية والرمادية مثل التمدد لتوسيع الأجسام والتآكل لتنحيفها والفتحات لتنظيف الشوائب المعزولة.',
        whatItDoesEn: 'Extracts geometric contours and structural boundaries using gradient approximations (Sobel, Prewitt, Scharr) and Canny edge detection with hysteresis thresholding. Morphological tools perform structural erosion, dilation, morphological gradient, top-hat, and black-hat transforms.',
        whenToUseAr: 'في تطبيقات التعرف الآلي، تحليل الخطوط والأشكال، استخراج الحدود للمخططات الهندسية، وفصل الأشكال المتلاصقة.',
        whenToUseEn: 'For computer vision feature extraction, contour vectorization, architectural blueprint line isolation, and morphological particle analysis.',
        howToUseAr: [
          'اختر فئة "كشف الحواف" (Edge Detection) أو "العمليات المورفولوجية" (Morphology).',
          'اختر "Canny Edge Detector" أو "Sobel Edge Detector".',
          'عدل قيم العتبة لرؤية خطوط الحواف الأكثر وضوحاً بدقة فائقة.',
        ],
        howToUseEn: [
          'Select "Edge Detection" or "Morphological Operations".',
          'Click "Canny Edge Detector" or "Sobel Operator".',
          'Fine-tune the hysteresis thresholds to isolate prominent physical contours.',
        ],
      },
      {
        id: 'histogram-frequency-domain',
        titleAr: 'معالجة الهيستوجرام وتحويلات فورييه (Histogram & Fourier FFT)',
        titleEn: 'Histogram Equalization, CLAHE & 2D FFT Fourier Domain',
        summaryAr: 'مساواة الهيستوجرام، تقنية CLAHE التكيفية، وتحويلات فورييه السريعة 2D FFT مع مرشحات التردد المنخفض والعالي.',
        summaryEn: 'Histogram Equalization, Adaptive CLAHE, 2D Cooley-Tukey FFT & IFFT with Low-Pass, High-Pass, and Notch filters.',
        whatItDoesAr: 'يوفر تحسين التباين الشامل والتكيفي الموضعي (CLAHE) لمنع تضخيم الضوضاء، بالإضافة إلى محرك تحويل فورييه ثنائي الأبعاد الحقيقي (2D Fast Fourier Transform) الذي ينقل الصورة من المجال المكاني إلى مجال الترددات، متيحاً مرشحات التمرير المنخفض (Low Pass) لتنعيم الترددات العالية، ومرشحات التمرير العالي (High Pass) لإبراز التفاصيل، ومرشحات القطع الحزمي (Notch) لإزالة التشويش النمطي المتكرر.',
        whatItDoesEn: 'Features global Histogram Equalization and Contrast Limited Adaptive Histogram Equalization (CLAHE). The 2D Cooley-Tukey Radix-2 FFT and Inverse FFT engine translates spatial data into frequency spectra, enabling Ideal/Gaussian/Butterworth Low-Pass and High-Pass filtering and periodic noise Notch suppression.',
        whenToUseAr: 'لتحسين صور الأشعة الطبية والصور الفضائية، كشف الأنماط المتكررة، وتدريس مفاهيم معالجة الإشارات الرقمية عملياً في الجامعات.',
        whenToUseEn: 'For medical radiograph enhancement, satellite imaging, periodic noise filtering, and university-level digital signal processing demonstrations.',
        howToUseAr: [
          'اختر "معالجة الهيستوجرام" وطبّق "CLAHE" لتحسين تباين الصور الباهتة تلقائياً.',
          'أو اختر "مرشحات التردد (Fourier)" وطبّق "Gaussian Low Pass" أو "Butterworth High Pass" وشاهد الفلترة في مجال الترددات.',
        ],
        howToUseEn: [
          'Pick "Global / Histogram" and apply "CLAHE" to dramatically elevate local contrast without blowing out highlights.',
          'Choose "Frequency Domain" to apply genuine 2D FFT Butterworth or Gaussian frequency filters.',
        ],
      },
    ],
  },

  // 11 — Background & Object Tools
  {
    id: 'background-object-tools',
    num: '11',
    titleAr: 'أدوات عزل الخلفية وإزالة الشوائب',
    titleEn: 'Background Removal & Content-Aware Inpainting',
    icon: 'Scissors',
    category: 'tools',
    categoryAr: 'الأدوات والمعالجة',
    categoryEn: 'Tools & Processing',
    briefAr: 'عزل الخلفيات تلقائياً، الفرشاة والممحاة اليدوية، مكتبة الخلفيات الجاهزة، وإزالة العناصر غير المرغوبة (Inpainting).',
    briefEn: 'Automatic background cutout, manual edge refinement, 40+ background templates, and Navier-Stokes inpainting.',
    overviewAr: 'تمتلك بيكسلورا أدوات فائقة القوة لعزل العناصر وإعادة بناء الصور. يمكنك إزالة خلفية أي عنصر أو شخص تلقائياً أو بالفرشاة اليدوية، واستبدالها بخلفيات مخصصة وتدرجات لونية، أو استخدام أداة "إزالة كائن" (Remove Object) لحذف الشوائب والعلامات المائية مع إعادة ملء الخلفية بسلاسة.',
    overviewEn: 'Pixelora integrates automatic background segmentation alongside content-aware texture synthesis. Users can strip backdrops in 1 click, swap in pre-rendered backdrops, or paint over unwanted elements and watermarks using the Navier-Stokes inpainting engine.',
    topics: [
      {
        id: 'auto-manual-bg-remove',
        titleAr: 'عزل الخلفيات التلقائي واليدوي (Background Removal)',
        titleEn: 'Automatic & Manual Background Cutout',
        summaryAr: 'فصل المنتجات والأشخاص عن خلفياتهم المعقدة مع إمكانية التنقيح اليدوي بالفرشاة والممحاة وفرشاة الاستعادة.',
        summaryEn: 'Instant subject segmentation from complex scenes with fine manual brush, eraser, and restore brush edge refinement.',
        whatItDoesAr: 'يحلل الصورة ويعزل العنصر الأساسي بشفافية كاملة (Alpha Channel)، مع توفير فرشاة الاستعادة وممحاة التحديد لمعالجة التفاصيل الصعبة كخصلات الشعر والأركان الدقيقة.',
        whatItDoesEn: 'Segments foreground subjects into pristine alpha channels. Includes manual restore and erase brushes to perfect difficult contours such as hair strands and transparent glassware.',
        whenToUseAr: 'لتجهيز صور المنتجات للمتاجر الإلكترونية، إعداد الملصقات الدعائية، ودمج العناصر في مشاهد جديدة.',
        whenToUseEn: 'For e-commerce product listings, promotional sticker cutouts, and creative composite collages.',
        howToUseAr: [
          'اضغط مفتاح R أو اختر أداة "عزل الخلفية" من الشريط الجانبي.',
          'انقر على زر "إزالة الخلفية تلقائياً" لعزل العنصر بدقة.',
          'إذا تبقت أي أجزاء غير مرغوبة، استخدم ممحاة القناع لمسحها أو فرشاة الاستعادة لإعادتها.',
        ],
        howToUseEn: [
          'Press R or select "Remove Background" from the toolbox.',
          'Click the primary "Auto Remove Background" button to execute automatic segmentation.',
          'Refine intricate borders using the manual mask brush or eraser tools.',
        ],
      },
      {
        id: 'remove-object-inpaint',
        titleAr: 'إزالة العناصر والشوائب (Remove Object - J)',
        titleEn: 'Content-Aware Object Removal & Inpainting (J)',
        summaryAr: 'إزالة الأشخاص، النصوص، والعلامات المائية وإعادة بناء الخلفية بسلاسة باستخدام خوارزميات Navier-Stokes.',
        summaryEn: 'Seamlessly eliminate tourists, powerlines, and logos using partial differential equation Navier-Stokes texture synthesis.',
        whatItDoesAr: 'تتيح التحديد بالفرشاة فوق أي كائن غير مرغوب فيه في الصورة؛ يقوم محرك Inpainting بتحليل البيكسلات المحيطة وإعادة تركيب القوام والألوان داخل منطقة القناع بدقة رياضية مذهلة تمحو أثر العنصر تماماً.',
        whatItDoesEn: 'Allows painting over distracting objects with a mask brush; the client-side inpainting engine propagates boundary gradients and texture into the hole via Telea / Navier-Stokes equations.',
        whenToUseAr: 'لحذف تواريخ الكاميرا، الأسلاك الكهربائية، الأشخاص العابرين في الخلفية، أو العيوب والخدوش في المنتجات.',
        whenToUseEn: 'To erase photo-bombers, power lines, scratch defects on physical products, watermarks, or dated timestamps.',
        howToUseAr: [
          'اضغط مفتاح J لتفعيل أداة "إزالة كائن".',
          'حدد حجم الفرشاة ولونها الشفاف فوق العنصر المراد حذفه في لوحة العمل.',
          'انقر على زر "معاينة الإزالة" (Preview) أو "تطبيق الإزالة" (Apply) لإتمام المعالجة فورياً.',
        ],
        howToUseEn: [
          'Press J to switch into Remove Object mode.',
          'Paint over the unwanted item using the red highlight mask brush.',
          'Click "Apply Removal" to trigger the inpainting solver and reconstruct the background.',
        ],
      },
      {
        id: 'background-library-page',
        titleAr: 'مكتبة الخلفيات الجاهزة والقوالب الملونة',
        titleEn: 'Background Templates Library & Custom Uploads',
        summaryAr: 'أكثر من 40 خلفية جاهزة مقسمة إلى ألوان صلبة، تدرجات، منصات خشبية ورخامية، ومشاهد طبيعية.',
        summaryEn: 'Over 40 curated backdrops including solid studio tones, luxury marble, wood grain, and nature scenes.',
        whatItDoesAr: 'تتيح بنقرة زر وضع خلفية جديدة تماماً خلف العنصر المعزول، مع إمكانية رفع صورة خلفية مخصصة من جهازك.',
        whatItDoesEn: 'Applies full-bleed backgrounds beneath isolated product layers, with instant support for custom backdrop file uploads.',
        whenToUseAr: 'لتحويل صورة منتج عادية ملتقطة بالهاتف إلى صورة إعلانية فخمة تبدو وكأنها التُقطت في استوديو تصوير محترف.',
        whenToUseEn: 'To transform mundane tabletop phone snapshots into high-end commercial ad campaigns.',
        howToUseAr: [
          'انتقل إلى تبويب "الخلفيات" (G) في لوحة المفتش أو من شريط التنقل العلوي.',
          'تصفح الفئات: رخام، خشب، ستوديو ملون، ألوان باستيل، أو طبيعة.',
          'انقر على أي خلفية لتطبيقها خلف منتجك فوراً.',
        ],
        howToUseEn: [
          'Press G or switch to the Backgrounds tab in the inspector.',
          'Explore categories: Studio Minim, Luxury Marble, Warm Wood, or Nature.',
          'Click any backdrop to inject it directly beneath your foreground cutout layer.',
        ],
      },
    ],
  },

  // 12 — Export
  {
    id: 'export-system',
    num: '12',
    titleAr: 'نظام التصدير والمخرجات فائقة الدقة',
    titleEn: 'High-Resolution Export Engine',
    icon: 'Download',
    category: 'core',
    categoryAr: 'الأساسيات والمشروع',
    categoryEn: 'Core & Project',
    briefAr: 'صيغ التصدير PNG، JPG، WEBP، SVG، التحكم بالجودة والأبعاد، وضمان شفافية الخلفية.',
    briefEn: 'Production formats: PNG, JPG, WEBP, SVG, compression ratios, scaling factors, and alpha transparency.',
    overviewAr: 'يوفر محرك التصدير في بيكسلورا توليداً بيكسلياً فائق النقاء لجميع التصاميم، مع مراعاة المعايير القياسية للويب والطباعة. يمكنك تصدير ملفك بالحجم الأصلي أو بمضاعفات تكبير (1x, 2x, 3x) مع تحكم كامل بنسبة ضغط البيانات وحفظ الشفافية.',
    overviewEn: 'Pixelora’s export pipeline renders pristine raster composites directly from canvas layers. It supports exact pixel scaling (1x, 2x, 3x, 4x), fine-tuned JPEG/WEBP compression quality, PNG alpha transparency preservation, and SVG vector pass-through.',
    topics: [
      {
        id: 'export-formats-comparison',
        titleAr: 'مقارنة صيغ التصدير: PNG مقابل JPG مقابل WEBP مقابل SVG',
        titleEn: 'Format Matrix: PNG vs JPG vs WEBP vs SVG',
        summaryAr: 'متى تختار كل صيغة للحصول على أفضل توازن بين النقاء وحجم الملف.',
        summaryEn: 'Selecting the optimal container format for quality, transparency, and file size.',
        whatItDoesAr: 'صيغة PNG تضمن عدم فقدان أي تفاصيل وتحافظ على شفافية الخلفية، بينما صيغة JPG ممتازة للصور الفوتوغرافية بأحجام ملفات صغيرة، وصيغة WEBP تقدم أحدث تقنيات ضغط الويب مع دعم الشفافية بحجم أصغر بـ 30% من PNG.',
        whatItDoesEn: 'PNG provides lossless raster quality and alpha transparency; JPG offers compact file sizes for photos; WEBP delivers next-gen compression with transparency; SVG preserves vector scalability.',
        whenToUseAr: 'استخدم PNG للشعارات والمنتجات المعزولة، واستخدم JPG للمنشورات السريعة، واستخدم WEBP للمواقع والمتاجر الإلكترونية لتسريع تحميل الصفحات.',
        whenToUseEn: 'Use PNG for logos and cutouts with transparent backdrops; JPG for social photography; WEBP for high-performance e-commerce pages.',
        howToUseAr: [
          'اضغط Ctrl+E أو انقر زر "تصدير" في الشريط العلوي.',
          'اختر الصيغة المرغوبة: PNG، JPG، WEBP، أو SVG.',
          'إذا اخترت JPG أو WEBP، اضبط منزلق "الجودة" (Quality) بين 80% إلى 100%.',
          'انقر على "تنزيل التصميم" لحفظ الملف فوراً في مجلد التنزيلات بجهازك.',
        ],
        howToUseEn: [
          'Press Ctrl+E or click the top "Export" button.',
          'Select your target format: PNG, JPG, WEBP, or SVG.',
          'For JPG/WEBP, set the Quality slider between 80% and 100%.',
          'Click "Download Image" to trigger immediate browser file saving.',
        ],
        parameters: [
          {
            nameAr: 'مقياس الأبعاد (Scale Multiplier)',
            nameEn: 'Scale Factor',
            type: '1x, 2x, 3x',
            defaultVal: '1x',
            descriptionAr: 'مضاعفة أبعاد التصميم النهائي (مثلاً 1080p إلى 4K) لعرض فائق النقاء على شاشات Retina.',
            descriptionEn: 'Multiplies canvas resolution for crisp presentation on ultra-high-DPI Retina screens.',
          },
          {
            nameAr: 'الحفاظ على الشفافية (Preserve Transparency)',
            nameEn: 'Preserve Transparency',
            type: 'Boolean',
            defaultVal: 'True (PNG/WEBP)',
            descriptionAr: 'تصدير المناطق الشاغرة كبكسلات شفافة بدلاً من تعبئتها بخلفية بيضاء صلبة.',
            descriptionEn: 'Ensures canvas regions without background fills remain completely transparent.',
          },
        ],
      },
    ],
  },

  // 13 — Keyboard Shortcuts
  {
    id: 'keyboard-shortcuts',
    num: '13',
    titleAr: 'دليل اختصارات لوحة المفاتيح الكامل',
    titleEn: 'Master Keyboard Shortcuts Reference',
    icon: 'Keyboard',
    category: 'reference',
    categoryAr: 'المراجع السريعة',
    categoryEn: 'Quick Reference',
    briefAr: 'جدول تفاعلي شامل لكافة اختصارات بيكسلورا المعتمدة لأدوات التحرير وإدارة المشهد.',
    briefEn: 'Complete organized table of all verified shortcuts for tools, layers, view, and document commands.',
    overviewAr: 'صُممت اختصارات لوحة المفاتيح في بيكسلورا لتسريع سير عملك ومطابقة المعايير المعترف بها عالمياً في أشهر برامج التصميم. يمكنك تنفيذ كل عملية بنقرة زر واحدة دون الحاجة لتحريك الماوس للقوائم.',
    overviewEn: 'Pixelora’s keyboard shortcuts follow industry conventions, empowering designers to execute high-speed workflows without lifting their hands from the keyboard.',
    topics: [
      {
        id: 'shortcuts-overview',
        titleAr: 'استعراض وبحث الاختصارات الفورية',
        titleEn: 'Interactive Shortcut Search & Groups',
        summaryAr: 'قائمة مصنفة حسب المهام مع محرك بحث فوري لتسهيل الحفظ والاستخدام.',
        summaryEn: 'Categorized shortcut directory with real-time text query filtering.',
        whatItDoesAr: 'تغطي الاختصارات: إدارة المشروع (جديد Ctrl+N، فتح Ctrl+O، حفظ Ctrl+S، تصدير Ctrl+E)، التراجع والإعادة (Ctrl+Z، Ctrl+Y)، مساعدة الاختصارات (? أو F1)، أدوات التحرير (V، Ctrl+T، C، H، Z، B، P، E، T، U، J، F، A، R، G)، عمليات الطبقات (قص Ctrl+X، نسخ Ctrl+C، لصق Ctrl+V، تكرار Ctrl+D، حذف Del، إلغاء Esc، ترتيب الطبقات Ctrl+[/]، حجم الفرشاة [/]، إزاحة دقيقة بالأسهم)، والتحكم بالعرض (تكبير/تصغير Ctrl++/Ctrl+-، وملاءمة الشاشة Ctrl+0، والقياس الأصلي Ctrl+1).',
        whatItDoesEn: 'Encompasses document commands (Ctrl+N, Ctrl+O, Ctrl+S, Ctrl+E), undo/redo (Ctrl+Z, Ctrl+Y), help (? / F1), editor tools (V, Ctrl+T, C, H, Z, B, P, E, T, U, J, F, A, R, G), layer controls (Cut Ctrl+X, Copy Ctrl+C, Paste Ctrl+V, Duplicate Ctrl+D, Delete Del, Deselect Esc, Layer Ordering Ctrl+[/], Brush Size [/], Nudge Arrows), and viewport zoom navigation (Ctrl++, Ctrl+-, Ctrl+0, Ctrl+1).',
        whenToUseAr: 'أثناء جلسات التحرير المكثفة لتحقيق أقصى إنتاجية ممكنة.',
        whenToUseEn: 'During high-tempo professional production sessions to maximize throughput.',
        howToUseAr: [
          'اضغط مفتاح ? أو F1 في أي وقت لفتح نافذة الاختصارات السريعة داخل المحرر.',
          'استخدم حقل البحث في هذه الصفحة للعثور على اختصار أي أداة بالاسم العربي أو الإنجليزي.',
        ],
        howToUseEn: [
          'Press ? or F1 inside the editor to bring up the instant shortcuts cheat-sheet modal.',
          'Use the search bar on this page to quickly locate the hotkey for any operation.',
        ],
      },
    ],
  },

  // 14 — Troubleshooting
  {
    id: 'troubleshooting',
    num: '14',
    titleAr: 'دليل استكشاف الأخطاء وحلها',
    titleEn: 'Troubleshooting & Diagnostics',
    icon: 'AlertCircle',
    category: 'reference',
    categoryAr: 'المراجع السريعة',
    categoryEn: 'Quick Reference',
    briefAr: 'حلول عملية ومباشرة لأبرز المشكلات التقنية: تحميل الصور، أداء اللوحة، الشفافية، والخطوط.',
    briefEn: 'Practical recovery procedures for canvas responsiveness, image ingestion, alpha transparency, and fonts.',
    overviewAr: 'تم تصميم هذا الدليل لمساعدتك في التغلب على أي سلوك غير متوقع أثناء التحرير، موضحاً السبب المحتمل والخطوات الدقيقة لإصلاحه فورياً.',
    overviewEn: 'A structured diagnostic guide offering verified causes and step-by-step remedies for common editing anomalies.',
    topics: [
      {
        id: 'troubleshooting-matrix',
        titleAr: 'جدول المشكلات والحلول المعتمدة',
        titleEn: 'Diagnostic Problems, Causes & Solutions',
        summaryAr: 'استعراض منظم للمشكلات الشائعة مع إرشادات استعادة الأداء.',
        summaryEn: 'Structured overview of common user hurdles and verified remediation steps.',
        whatItDoesAr: 'يقدم حلولاً تفصيلية لمشاكل: عدم استجابة أداة التحديد، ظهور خلفية بيضاء بدلاً من الشفافة عند التصدير، اختفاء محتوى الطبقة، بطء التكبير في الصور الضخمة، وعدم تناسق خطوط النصوص العربية.',
        whatItDoesEn: 'Addresses target layer selection issues, unwanted white export backgrounds, hidden layers, canvas lag, and font rendering.',
        whenToUseAr: 'عند مواجهة أي عائق فني أو نتيجة غير متوقعة أثناء تصميم مشروعك.',
        whenToUseEn: 'Whenever encountering an unexpected editor state or asset export difficulty.',
        howToUseAr: [
          'ابحث في قسم الأسئلة والأخطاء أدناه عن العَرَض الذي تواجهه.',
          'طبّق خطوات الحل المقترحة بالترتيب.',
        ],
        howToUseEn: [
          'Locate your symptom in the troubleshooting table below.',
          'Execute the recommended solution steps in sequence.',
        ],
      },
    ],
  },

  // 15 — FAQ
  {
    id: 'faq',
    num: '15',
    titleAr: 'الأسئلة الشائعة (FAQ)',
    titleEn: 'Frequently Asked Questions (FAQ)',
    icon: 'HelpCircle',
    category: 'reference',
    categoryAr: 'المراجع السريعة',
    categoryEn: 'Quick Reference',
    briefAr: 'إجابات وافية وشاملة عن كل ما يدور في ذهن المستخدم حول إمكانيات بيكسلورا وخصوصيته.',
    briefEn: 'Authoritative answers to core user queries regarding privacy, storage, limitations, and features.',
    overviewAr: 'تجميع لأهم الأسئلة المتكررة التي يطرحها مستخدمو ومصممو بيكسلورا، موثقة بأجوبة تقنية دقيقة وواضحة.',
    overviewEn: 'Curated compilation of core questions frequently posed by creative professionals and student researchers.',
    topics: [
      {
        id: 'faq-list',
        titleAr: 'قائمة الأسئلة الشائعة وإجاباتها',
        titleEn: 'Curated FAQ Answers',
        summaryAr: 'كل ما تحتاج لمعرفته عن التخزين، الخصوصية، الفلاتر، وتوافق المتصفحات.',
        summaryEn: 'Comprehensive answers covering local privacy, browser performance, and capabilities.',
        whatItDoesAr: 'يجيب بدقة عن: هل صوري آمنة؟ ما الفرق بين الفلاتر والتحسينات؟ كيف أحفظ شفافية الشعار؟ هل يدعم بيكسلورا العمل بدون إنترنت؟',
        whatItDoesEn: 'Clarifies offline capabilities, privacy guarantees, differences between filters and adjustments, and export transparency.',
        whenToUseAr: 'للحصول على فهم معمق لطبيعة عمل النظام وأفضل ممارسات الاستخدام.',
        whenToUseEn: 'To quickly resolve conceptual questions regarding application behavior.',
        howToUseAr: [
          'تصفح الأسئلة الشائعة أو استخدم البحث السريع في أعلى الصفحة للوصول لإجابتك فوراً.',
        ],
        howToUseEn: [
          'Browse the categorized questions below or type a query into the top search bar.',
        ],
      },
    ],
  },
];

export const TROUBLESHOOTING_ITEMS: TroubleshootingItem[] = [
  {
    id: 'tr-1',
    category: 'layers',
    problemAr: 'الأداة أو الفرشاة لا تستجيب ولا ترسم على لوحة العمل',
    problemEn: 'Brush or Tool not responding on the canvas',
    causeAr: 'الطبقة المحددة مقفلة (Locked)، أو مخفية (Hidden)، أو أنك محدد لطبقة غير قابلة للرسم المباشر (مثل طبقة نصية أو شكل).',
    causeEn: 'Target layer is locked, hidden, or is a vector/text layer that does not accept direct raster drawing.',
    solutionAr: 'تأكد من اختيار طبقة رسم عادية أو إنشاء طبقة جديدة من لوحة الطبقات، وتأكد من فتح القفل (Unlock) وتفعيل علامة العين.',
    solutionEn: 'Select an active raster layer or click "+" to add a new drawing layer. Ensure the layer is unlocked and visible.',
  },
  {
    id: 'tr-2',
    category: 'export',
    problemAr: 'تم تصدير الصورة بخلفية بيضاء رغم رغبتي في خلفية شفافة',
    problemEn: 'Exported image has a solid white background instead of transparency',
    causeAr: 'تم التصدير بصيغة JPG (التي لا تدعم الشفافية)، أو أن لون خلفية لوحة العمل مضبوط على اللون الأبيض بدلاً من الشفاف.',
    causeEn: 'File was exported as JPG (which lacks alpha channels) or canvas background fill was set to solid white.',
    solutionAr: 'في نافذة التصدير، اختر صيغة PNG أو WEBP وتأكد من تفعيل خيار "الحفاظ على الشفافية"، وتأكد من ضبط خلفية اللوحة على شفاف (Transparent).',
    solutionEn: 'In the Export modal, choose PNG or WEBP, check "Preserve Transparency", and verify the canvas background is set to transparent.',
  },
  {
    id: 'tr-3',
    category: 'selection',
    problemAr: 'لا يمكنني تحريك أو تحديد العنصر المطلوب داخل اللوحة',
    problemEn: 'Cannot select or move a specific element on the stage',
    causeAr: 'توجد طبقة علوية شفافة أو كبيرة الحجم تغطي العنصر وتلتقط نقرات الماوس قبله.',
    causeEn: 'An upper layer with large bounding bounds is intercepting pointer clicks above the desired element.',
    solutionAr: 'اختر العنصر المطلوب مباشرة من قائمة الطبقات في اللوحة اليمنى لتحديده بشكل مؤكد دون الاعتماد على النقر المباشر.',
    solutionEn: 'Click the specific layer card directly in the right-hand Layers panel to force active selection.',
  },
  {
    id: 'tr-4',
    category: 'performance',
    problemAr: 'بطء ملحوظ أو تأخر في الاستجابة عند تطبيق بعض الفلاتر',
    problemEn: 'Noticeable lag when applying complex mathematical filters',
    causeAr: 'الصورة الأصلية ذات أبعاد ضخمة جداً (أكثر من 4000x4000 بيكسل)، مما يتطلب ملايين العمليات الحسابية لكل إطار.',
    causeEn: 'Image dimensions exceed ultra-high thresholds (e.g. >16MP), requiring millions of convolution matrix calculations.',
    solutionAr: 'استخدم نافذة "حجم الصورة" (Image Size) لتصغير الأبعاد إلى قياس مناسب للويب (مثل 2000 بيكسل) قبل تطبيق الفلاتر الثقيلة.',
    solutionEn: 'Open the Image Size dialog and resample dimensions to a manageable web resolution (e.g., 2000px) before heavy convolutions.',
  },
  {
    id: 'tr-5',
    category: 'text',
    problemAr: 'النص العربي يظهر بحروف مفصولة أو بترتيب معكوس في بعض المتصفحات القديمة',
    problemEn: 'Arabic text glyphs appear disconnected or reversed in legacy browsers',
    causeAr: 'تعطيل محرك تشكيل الخطوط ثنائي الاتجاه (BiDi) في بيئة المتصفح القديمة.',
    causeEn: 'Legacy browser environment missing native Unicode bidirectional OpenType Arabic shaping.',
    solutionAr: 'تحديث المتصفح لآخر إصدار من Chrome أو Edge أو Firefox؛ يعتمد بيكسلورا على أحدث واجهات تشكيل الحروف المدمجة.',
    solutionEn: 'Update your browser to the latest version of Chrome, Edge, Safari, or Firefox to leverage standard BiDi engines.',
  },
  {
    id: 'tr-6',
    category: 'bg_remove',
    problemAr: 'أداة عزل الخلفية التلقائية اقتطعت جزءاً من تفاصيل المنتج نفسه',
    problemEn: 'Auto background cutout trimmed away subtle parts of the product',
    causeAr: 'تشابه لون المنتج مع لون الخلفية بدرجة متقاربة جداً (مثل منتج أبيض على خلفية بيضاء).',
    causeEn: 'Low color contrast between the subject and backdrop (e.g. white sneaker on white studio wall).',
    solutionAr: 'استخدم "فرشاة الاستعادة" (Restore Brush) في تبويب عزل الخلفية للرسم فوق الأجزاء المفقودة وإعادتها بدقة تامة.',
    solutionEn: 'Use the "Restore Mask Brush" in the Background Removal panel to hand-paint and recover the omitted edges.',
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'basics',
    questionAr: 'هل يرفع بيكسلورا صوري وتصاميمي إلى أي خوادم خارجية؟',
    questionEn: 'Does Pixelora upload my personal photos to any remote servers?',
    answerAr: 'لا على الإطلاق. يعمل بيكسلورا وفق بنية محلية حقيقية (Local-First Architecture)؛ حيث تتم كافة عمليات المعالجة، الفلاتر، التقطيع، والدمج مباشرة داخل ذاكرة متصفحك الرسومية دون إرسال أي بيكسل لأي طرف ثالث.',
    answerEn: 'Never. Pixelora is architected as a local-first workstation. All pixel computations, convolutions, and layer compositions execute in your browser’s local client memory, ensuring absolute privacy.',
  },
  {
    id: 'faq-2',
    category: 'tools',
    questionAr: 'ما الفرق بين "حجم الصورة" (Image Size) و "حجم لوحة العمل" (Canvas Size)؟',
    questionEn: 'What is the difference between "Image Size" and "Canvas Size"?',
    answerAr: '"حجم الصورة" يقوم بإعادة حساب بيكسلات المستند ككل (Resampling) لتكبير أو تصغير المحتوى الفعلي. أما "حجم لوحة العمل" فيقوم بزيادة أو إنقاص مساحة الإطار المحيط بالعناصر (إضافة هوامش أو قص الإطار) دون تغيير مقياس العناصر نفسها.',
    answerEn: '"Image Size" resamples and re-interpolates the document’s pixel grid to scale contents. "Canvas Size" expands or shrinks the outer frame boundary (adding borders or clipping margins) without resizing individual layers.',
  },
  {
    id: 'faq-3',
    category: 'filters',
    questionAr: 'ما الفرق بين الفلاتر (Filters) والتحسينات (Adjustments)؟',
    questionEn: 'What is the difference between Filters and Adjustments?',
    answerAr: 'التحسينات (Adjustments) هي منزلقات بارامترية للتحكم الفردي في الإضاءة والألوان (كالسطوع، المنحنيات، وموازن HSL). بينما الفلاتر (Filters) هي أنماط متكاملة مسبقة الإعداد تجمع بين خوارزميات لونية وهندسية وحسابية لتطبيق مظهر سينمائي أو رياضي بنقرة واحدة.',
    answerEn: 'Adjustments are parametric continuous controls for specific photometric values (Exposure, Tone Curves, HSL). Filters are holistic recipes and mathematical algorithms (Cinematic looks, FFT, Edge Detectors) applied as a single composite transformation.',
  },
  {
    id: 'faq-4',
    category: 'layers',
    questionAr: 'ما هي الطبقات غير الإتلافية (Non-Destructive Layers)؟',
    questionEn: 'What is Non-Destructive Editing?',
    answerAr: 'يعني ذلك أنك تستطيع في أي وقت إعادة تعديل أي فلتر، تحريك أي نص، استعادة الأجزاء الممسوحة من القناع، أو حذف تأثير معين دون أن تفقد الصورة الأصلية أو تقل جودتها أبداً.',
    answerEn: 'It ensures your raw source imagery remains pristine. You can re-adjust filters, reshape masks, rewrite text, or modify opacity at any future point without generational quality degradation.',
  },
  {
    id: 'faq-5',
    category: 'export',
    questionAr: 'كيف أحفظ تصميمي بأعلى دقة ممكنة للطباعة واللوحات الكبيرة؟',
    questionEn: 'How do I export my artwork at peak resolution for large-format printing?',
    answerAr: 'في نافذة التصدير (Ctrl+E)، اختر صيغة PNG أو WEBP، واضبط مقياس التصدير (Scale) على 2x أو 3x، وتأكد من أن جودة الإخراج مضبوطة على 100% للحصول على ملايين البيكسلات فائقة الوضوح والجاهزة للطباعة.',
    answerEn: 'In the Export modal (Ctrl+E), select PNG or WEBP, increase the Scale Factor to 2x or 3x, and verify quality is set to maximum for multi-megapixel print readiness.',
  },
  {
    id: 'faq-6',
    category: 'basics',
    questionAr: 'هل يمكنني استخدام بيكسلورا على أجهزة التابلت والهواتف الذكية؟',
    questionEn: 'Can I use Pixelora on tablets and mobile devices?',
    answerAr: 'نعم، تم بناء واجهة بيكسلورا بتقنيات متجاوبة بالكامل تتكيف مع الشاشات اللمسية وتدعم إيماءات التكبير والسحب بالقلم اللوحي أو الأصابع.',
    answerEn: 'Yes, Pixelora’s responsive layout adapts seamlessly to tablets and touch devices, supporting stylus input, pinch-to-zoom, and touch dragging.',
  },
];

export const FAQS = FAQ_ITEMS;

export const WORKFLOW_STEPS = [
  {
    step: '1',
    titleAr: 'استيراد أو إنشاء لوحة جديدة',
    titleEn: 'Import or Create Blank Canvas',
    descAr: 'اسحب صورتك مباشرة أو اختر قالباً جاهزاً (1080x1080 أو 1080x1920).',
    descEn: 'Drag and drop your raw photo or initialize a custom canvas preset.',
    shortcut: 'Ctrl+N',
  },
  {
    step: '2',
    titleAr: 'القص وضبط المنظور والأبعاد',
    titleEn: 'Crop & Frame Composition',
    descAr: 'استخدم شبكة الأثلاث وقص بنسبة 1:1 أو 16:9 أو 4:5 واضبط الاستدارة.',
    descEn: 'Set aspect ratio lock (1:1, 4:5, 16:9) and level your visual horizon.',
    shortcut: 'C',
  },
  {
    step: '3',
    titleAr: 'معايرة الألوان ومنحنيات الإضاءة',
    titleEn: 'Tone Curves & HSL Grading',
    descAr: 'اضبط التعرض، منحنيات RGB، وموازن الألوان الانتقائي 8 قنوات.',
    descEn: 'Lift shadows, pull down blown highlights, and fine-tune selective HSL.',
    shortcut: 'A',
  },
  {
    step: '4',
    titleAr: 'عزل الخلفيات ومكتبة القوالب والنصوص',
    titleEn: 'Background Cutout & Text Styling',
    descAr: 'اعزل الخلفية، اختر قالباً من مكتبة الخلفيات، وأضف نصوصاً عربية أنيقة.',
    descEn: 'Isolate foreground subjects, apply backdrops from the templates library, and style Arabic text.',
    shortcut: 'R / T',
  },
  {
    step: '5',
    titleAr: 'التصدير فائق الدقة والمخرجات',
    titleEn: 'High-Resolution Master Export',
    descAr: 'صدّر بصيغة PNG أو WEBP الشفافة مع مضاعفة الدقة حتى 3x للطباعة.',
    descEn: 'Compile to transparent PNG or WEBP with 2x/3x Retina resolution scaling.',
    shortcut: 'Ctrl+E',
  },
];

