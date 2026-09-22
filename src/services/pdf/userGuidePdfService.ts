import htmlToPdfMake from 'html-to-pdfmake';
// @ts-ignore
import pdfMake from 'pdfmake-rtl/build/pdfmake.js';
// @ts-ignore
import vfs from 'pdfmake-rtl/build/vfs_fonts.js';
import { buildUserGuideHtml } from './userGuideHtmlBuilder';

export interface GeneratePdfOptions {
  language: 'ar' | 'en';
  onProgress?: (status: string) => void;
}

function cleanPdfMakeContent(node: any, isAr: boolean) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      cleanPdfMakeContent(node[i], isAr);
    }
    return;
  }
  if (typeof node === 'object') {
    if ('background' in node) {
      delete node.background;
    }
    if (Array.isArray(node.margin)) {
      node.margin = node.margin.map((m: any) => (typeof m === 'number' && !isNaN(m) ? m : 0));
    }
    if (node.font === 'Inter') {
      node.font = isAr ? 'Cairo' : 'Roboto';
    }
    for (const key of Object.keys(node)) {
      if (typeof node[key] === 'object') {
        cleanPdfMakeContent(node[key], isAr);
      }
    }
  }
}

/**
 * Generates and triggers the download of the Pixelora User Guide in the browser.
 * Uses the existing pdfmake-rtl + html-to-pdfmake pipeline.
 */
export async function downloadUserGuidePdf(options: GeneratePdfOptions): Promise<void> {
  const { language, onProgress } = options;
  const isAr = language === 'ar';

  onProgress?.(isAr ? 'جاري بناء هيكل المستند...' : 'Building document structure...');

  try {
    // 1. Generate semantic HTML for documentation
    const html = buildUserGuideHtml({ language });

    onProgress?.(isAr ? 'جاري تهيئة محرك التخطيط...' : 'Initializing layout engine...');

    // 2. Convert HTML to pdfmake docDefinition
    const pdfmakeContent = htmlToPdfMake(html, {
      tableAutoSize: true
    });
    cleanPdfMakeContent(pdfmakeContent, isAr);

    onProgress?.(isAr ? 'جاري تحميل الخطوط ورسم الصفحات...' : 'Loading typography and rendering pages...');

    // 3. Register fonts safely
    pdfMake.vfs = vfs.pdfMake ? vfs.pdfMake.vfs : vfs;
    pdfMake.fonts = {
      Roboto: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      },
      Inter: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      },
      Cairo: {
        normal: 'Cairo-Regular.ttf',
        bold: 'Cairo-Bold.ttf',
        italics: 'Cairo-Regular.ttf',
        bolditalics: 'Cairo-Bold.ttf'
      },
      Monospace: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      },
      monospace: {
        normal: 'Roboto-Regular.ttf',
        bold: 'Roboto-Medium.ttf',
        italics: 'Roboto-Italic.ttf',
        bolditalics: 'Roboto-MediumItalic.ttf'
      }
    };

    // 4. Configure PDF document definition
    const docDefinition: any = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 50, 40, 45],
      defaultStyle: {
        font: isAr ? 'Cairo' : 'Roboto',
        fontSize: 9.5,
        color: '#121A33',
        lineHeight: 1.4
      },
      header: function(currentPage: number) {
        if (currentPage === 1) return null;
        return {
          margin: [40, 15, 40, 0],
          columns: [
            {
              text: isAr ? 'PIXELORA USER GUIDE — دليل مستخدم بيكسلورا' : 'PIXELORA OFFICIAL USER GUIDE',
              fontSize: 7.5,
              color: '#6338E8',
              bold: true,
              alignment: isAr ? 'left' : 'left'
            },
            {
              text: isAr ? 'إصدار التوثيق الرسمي' : 'Official Documentation Release',
              fontSize: 7.5,
              color: '#64748B',
              alignment: isAr ? 'right' : 'right'
            }
          ]
        };
      },
      footer: function(currentPage: number, pageCount: number) {
        return {
          margin: [40, 10, 40, 0],
          columns: [
            {
              text: isAr ? `صفحة ${currentPage} من ${pageCount}` : `Page ${currentPage} of ${pageCount}`,
              fontSize: 8,
              color: '#64748B',
              alignment: isAr ? 'right' : 'right'
            },
            {
              text: 'Pixelora Local-First Image Studio • All Rights Reserved',
              fontSize: 7.5,
              color: '#94A3B8',
              alignment: isAr ? 'left' : 'left'
            }
          ]
        };
      },
      content: pdfmakeContent,
      styles: {
        'html-h1': {
          color: '#6338E8',
          bold: true
        },
        'html-h2': {
          color: '#2E276E',
          bold: true
        },
        'html-h3': {
          color: '#2E276E',
          bold: true
        }
      }
    };

    onProgress?.(isAr ? 'جاري تحويل المستند إلى ملف PDF...' : 'Generating PDF document...');

    const doc = pdfMake.createPdf(docDefinition);

    // 5. Retrieve Blob directly with a 25-second safeguard timeout
    const blobPromise = doc.getBlob();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('PDF generation timed out')), 25000)
    );

    const blob: Blob = await Promise.race([blobPromise, timeoutPromise]);

    if (!blob || !(blob instanceof Blob) || blob.size === 0) {
      throw new Error('Generated PDF blob is empty or invalid');
    }

    onProgress?.(isAr ? 'جاري بدء التحميل...' : 'Starting download...');

    // 6. Trigger download via verified Object URL
    const filename = isAr ? 'Pixelora_User_Guide.pdf' : 'Pixelora_User_Guide_En.pdf';
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1000);

  } catch (error) {
    console.warn('[PDF Generation] Client-side dynamic generation error, using pre-built fallback:', error);
    // Reliable static pre-generated PDF fallback
    const filename = isAr ? 'Pixelora_User_Guide.pdf' : 'Pixelora_User_Guide_En.pdf';
    const link = document.createElement('a');
    link.href = '/' + filename;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 1000);
  }
}
