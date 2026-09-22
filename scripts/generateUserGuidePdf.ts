import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
// @ts-ignore
import htmlToPdfMake from 'html-to-pdfmake';
// @ts-ignore
import pdfMake from 'pdfmake-rtl/build/pdfmake.js';
// @ts-ignore
import vfs from 'pdfmake-rtl/build/vfs_fonts.js';
import { buildUserGuideHtml } from '../src/services/pdf/userGuideHtmlBuilder';

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

async function generateSinglePdf(language: 'ar' | 'en', filename: string) {
  const isAr = language === 'ar';
  console.log(`[PDF Generator] Generating ${isAr ? 'Arabic' : 'English'} User Guide HTML...`);
  const html = buildUserGuideHtml({ language });

  // DOM for html-to-pdfmake in Node
  const dom = new JSDOM('<!DOCTYPE html><html><body>' + html + '</body></html>');
  const { window } = dom;

  console.log(`[PDF Generator] Converting ${language} HTML to pdfmake docDefinition...`);
  const pdfmakeContent = htmlToPdfMake(html, {
    window: window,
    tableAutoSize: true
  });
  cleanPdfMakeContent(pdfmakeContent, isAr);

  pdfMake.vfs = vfs;
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

  const docDefinition = {
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

  console.log(`[PDF Generator] Creating PDF document for ${filename}...`);
  const doc = pdfMake.createPdf(docDefinition);
  const buffer = await doc.getBuffer();

  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outPath = path.join(publicDir, filename);
  fs.writeFileSync(outPath, buffer);
  console.log(`[PDF Generator] Saved ${filename} (${(buffer.length / 1024).toFixed(1)} KB) to ${outPath}`);
}

export async function generatePdf() {
  // Generate default Arabic User Guide
  await generateSinglePdf('ar', 'Pixelora_User_Guide.pdf');
  // Generate English User Guide
  await generateSinglePdf('en', 'Pixelora_User_Guide_En.pdf');
}

// Auto-run if executed directly via CLI/npm script
generatePdf().catch(err => {
  console.error('[PDF Generator Error]:', err);
  process.exit(1);
});
