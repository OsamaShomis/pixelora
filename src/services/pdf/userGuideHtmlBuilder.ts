import {
  HELP_SECTIONS,
  TROUBLESHOOTING_ITEMS,
  FAQ_ITEMS,
} from '../../data/helpCenterData';
import { KEYBOARD_SHORTCUTS } from '../../data/shortcuts';

interface GenerateHtmlOptions {
  language: 'ar' | 'en';
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildUserGuideHtml({ language }: GenerateHtmlOptions): string {
  const isAr = language === 'ar';
  const direction = isAr ? 'rtl' : 'ltr';
  const textAlign = isAr ? 'right' : 'left';
  const fontFamily = isAr
    ? "'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif"
    : "'Roboto', Arial, sans-serif";

  // Brand Palette Constants (Clean print-optimized styling)
  const brandPrimary = '#6338E8'; // Pixelora Purple
  const brandDarkPurple = '#121A33';
  const brandCyan = '#20BFC4';
  const brandDark = '#1E293B';
  const brandMuted = '#64748B';
  const borderLight = '#E2E8F0';
  const bgLight = '#F8FAFC';

  let html = `
<div dir="${direction}" style="font-family: ${fontFamily}; color: ${brandDark}; line-height: 1.5; text-align: ${textAlign}; background-color: #FFFFFF; padding: 15px;">

  <!-- COVER PAGE -->
  <div style="text-align: center; padding: 40px 20px; page-break-after: always; border: 1px solid ${borderLight}; background-color: #FFFFFF; margin-bottom: 30px;">
    <div style="font-size: 26pt; font-weight: 900; color: ${brandDarkPurple}; margin-bottom: 8px; letter-spacing: -0.5px;">
      PIXELORA
    </div>
    <div style="font-size: 13pt; color: ${brandPrimary}; font-weight: bold; margin-bottom: 25px;">
      ${isAr ? 'دليل المستخدم الشامل والتوثيق المعتمد' : 'Complete Official User Guide & Technical Manual'}
    </div>

    <div style="width: 80px; height: 3px; background-color: ${brandCyan}; margin-bottom: 30px;"></div>

    <p style="font-size: 10pt; color: ${brandMuted}; max-width: 500px; margin-bottom: 40px; line-height: 1.6;">
      ${isAr
        ? 'المرجع الرسمي والتقني الشامل لمنصة بيكسلورا لمعالجة وتصميم الصور المتقدمة، وأدوات عزل الخلفيات والتصميم الاحترافي.'
        : 'The definitive architectural and operational reference for Pixelora image processing suite, background cutout tools, and client-side raster engine.'}
    </p>

    <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse; font-size: 9pt; background-color: ${bgLight}; border: 1px solid ${borderLight};">
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid ${borderLight}; font-weight: bold; color: ${brandDarkPurple}; width: 45%;">
          ${isAr ? 'الإصدار البرمجي:' : 'Software Release:'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid ${borderLight}; color: ${brandDark};">
          v2.4.0 Professional Edition
        </td>
      </tr>
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid ${borderLight}; font-weight: bold; color: ${brandDarkPurple};">
          ${isAr ? 'اللغة والترميز:' : 'Language & Localization:'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid ${borderLight}; color: ${brandDark};">
          ${isAr ? 'العربية (كامل)' : 'English (Complete)'}
        </td>
      </tr>
      <tr>
        <td style="padding: 10px; font-weight: bold; color: ${brandDarkPurple};">
          ${isAr ? 'تاريخ المراجعة:' : 'Audit Date:'}
        </td>
        <td style="padding: 10px; color: ${brandDark};">
          ${new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </td>
      </tr>
    </table>
  </div>

  <!-- TABLE OF CONTENTS -->
  <div style="margin-bottom: 40px; page-break-after: always; padding: 20px; background-color: #FFFFFF; border: 1px solid ${borderLight};">
    <h2 style="color: ${brandDarkPurple}; font-size: 16pt; margin: 0 0 15px 0; border-bottom: 2px solid ${brandPrimary}; padding-bottom: 8px;">
      ${isAr ? 'فهرس المحتويات' : 'Table of Contents'}
    </h2>
    <table style="width: 100%; border-collapse: collapse;">
`;

  HELP_SECTIONS.forEach((section) => {
    const title = isAr ? section.titleAr : section.titleEn;
    const cat = isAr ? section.categoryAr : section.categoryEn;
    html += `
      <tr style="border-bottom: 1px solid ${borderLight};">
        <td style="padding: 8px 4px; font-weight: bold; color: ${brandPrimary}; width: 40px;">
          ${escapeHtml(section.num)}
        </td>
        <td style="padding: 8px 4px; color: ${brandDark}; font-weight: bold;">
          ${escapeHtml(title)}
        </td>
        <td style="padding: 8px 4px; text-align: ${isAr ? 'left' : 'right'}; color: ${brandMuted}; font-size: 9pt;">
          ${escapeHtml(cat)}
        </td>
      </tr>
`;
  });

  html += `
    </table>
  </div>
`;

  // CHAPTERS RENDERING (Chapters 1 to 16)
  HELP_SECTIONS.forEach((section) => {
    const title = isAr ? section.titleAr : section.titleEn;
    const overview = isAr ? section.overviewAr : section.overviewEn;
    const brief = isAr ? section.briefAr : section.briefEn;

    html += `
  <!-- CHAPTER ${section.num}: ${escapeHtml(title)} -->
  <div style="margin-bottom: 35px; page-break-after: always;">
    <!-- Chapter Header -->
    <div style="border-bottom: 2px solid ${brandPrimary}; padding-bottom: 6px; margin-bottom: 15px;">
      <span style="font-size: 9pt; font-weight: bold; color: ${brandPrimary}; text-transform: uppercase;">
        ${isAr ? `الفصل ${section.num}` : `CHAPTER ${section.num}`}
      </span>
      <h2 style="font-size: 16pt; color: ${brandDarkPurple}; margin: 4px 0 0 0;">
        ${escapeHtml(title)}
      </h2>
    </div>

    <!-- Brief & Overview -->
    <div style="margin-bottom: 15px; padding: 10px; background-color: ${bgLight}; border-left: 3px solid ${brandPrimary}; border-right: 3px solid ${brandPrimary}; font-size: 9.5pt; font-style: italic; color: ${brandDark};">
      ${escapeHtml(brief)}
    </div>

    <p style="margin: 0 0 15px 0; color: ${brandDark}; font-size: 9.5pt; line-height: 1.6;">
      ${escapeHtml(overview)}
    </p>
`;

    // Specialized rendering for Chapter 14 (Keyboard Shortcuts)
    if (section.id === 'keyboard-shortcuts') {
      html += `
    <table style="width: 100%; border-collapse: collapse; font-size: 9pt; margin-top: 15px;">
      <thead>
        <tr style="background-color: ${brandPrimary}; color: #FFFFFF;">
          <th style="padding: 6px 10px; text-align: ${textAlign}; border: 1px solid ${brandPrimary};">${isAr ? 'الأمر / الإجراء' : 'Command / Action'}</th>
          <th style="padding: 6px 10px; text-align: center; border: 1px solid ${brandPrimary};">${isAr ? 'المفتاح' : 'Key'}</th>
          <th style="padding: 6px 10px; text-align: ${textAlign}; border: 1px solid ${brandPrimary};">${isAr ? 'التصنيف والوظيفة' : 'Category & Scope'}</th>
        </tr>
      </thead>
      <tbody>
`;
      KEYBOARD_SHORTCUTS.forEach((sc) => {
        const scAction = isAr ? sc.actionAr : sc.actionEn;
        const scDesc = isAr ? sc.descriptionAr : sc.descriptionEn;
        const scCat = isAr ? sc.categoryAr : sc.categoryEn;
        html += `
        <tr style="border-bottom: 1px solid ${borderLight};">
          <td style="padding: 6px 8px; font-weight: bold; color: ${brandDark};">${escapeHtml(scAction)}</td>
          <td style="padding: 6px 8px; text-align: center; font-family: monospace; font-weight: bold; color: ${brandPrimary}; background-color: ${bgLight};">${escapeHtml(sc.key)}</td>
          <td style="padding: 6px 8px; color: ${brandMuted}; font-size: 8.5pt;">${escapeHtml(scDesc)} <span style="color: ${brandPrimary}; font-weight: bold;">[${escapeHtml(scCat)}]</span></td>
        </tr>
`;
      });
      html += `
      </tbody>
    </table>
`;
    }

    // Specialized rendering for Chapter 15 (Troubleshooting)
    else if (section.id === 'troubleshooting') {
      html += `
    <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-top: 15px;">
      <thead>
        <tr style="background-color: ${brandDarkPurple}; color: #FFFFFF;">
          <th style="padding: 6px; text-align: ${textAlign}; border: 1px solid ${brandDarkPurple}; width: 30%;">${isAr ? 'المشكلة' : 'Anomaly'}</th>
          <th style="padding: 6px; text-align: ${textAlign}; border: 1px solid ${brandDarkPurple}; width: 35%;">${isAr ? 'السبب المحتمل' : 'Probable Root Cause'}</th>
          <th style="padding: 6px; text-align: ${textAlign}; border: 1px solid ${brandDarkPurple}; width: 35%;">${isAr ? 'الحل المباشر' : 'Verified Resolution'}</th>
        </tr>
      </thead>
      <tbody>
`;
      TROUBLESHOOTING_ITEMS.forEach((tb) => {
        const prob = isAr ? tb.problemAr : tb.problemEn;
        const cause = isAr ? tb.causeAr : tb.causeEn;
        const sol = isAr ? tb.solutionAr : tb.solutionEn;
        html += `
        <tr style="border-bottom: 1px solid ${borderLight};">
          <td style="padding: 6px; font-weight: bold; color: #DC2626;">${escapeHtml(prob)}</td>
          <td style="padding: 6px; color: ${brandMuted};">${escapeHtml(cause)}</td>
          <td style="padding: 6px; color: #059669; font-weight: bold;">${escapeHtml(sol)}</td>
        </tr>
`;
      });
      html += `
      </tbody>
    </table>
`;
    }

    // Specialized rendering for Chapter 16 (FAQ)
    else if (section.id === 'faq') {
      html += `
    <div style="margin-top: 15px;">
`;
      FAQ_ITEMS.forEach((faq) => {
        const q = isAr ? faq.questionAr : faq.questionEn;
        const a = isAr ? faq.answerAr : faq.answerEn;
        html += `
      <div style="margin-bottom: 12px; padding: 10px; background-color: ${bgLight}; border-left: 3px solid ${brandPrimary}; border-right: 3px solid ${brandPrimary};">
        <strong style="color: ${brandDarkPurple}; font-size: 9.5pt; display: block; margin-bottom: 4px;">
          Q: ${escapeHtml(q)}
        </strong>
        <p style="margin: 0; color: ${brandDark}; font-size: 9pt;">
          ${escapeHtml(a)}
        </p>
      </div>
`;
      });
      html += `
    </div>
`;
    }

    // Standard Chapter Topics (Chapters 1 to 13)
    else if (section.topics && section.topics.length > 0) {
      section.topics.forEach((topic) => {
        const tTitle = isAr ? topic.titleAr : topic.titleEn;
        const tWhat = isAr ? topic.whatItDoesAr : topic.whatItDoesEn;
        const tWhen = isAr ? topic.whenToUseAr : topic.whenToUseEn;
        const tHow = isAr ? topic.howToUseAr : topic.howToUseEn;

        html += `
    <div style="margin-bottom: 16px; padding: 12px; border: 1px solid ${borderLight}; background-color: #FFFFFF;">
      <h3 style="font-size: 11pt; color: ${brandDarkPurple}; margin: 0 0 6px 0; border-bottom: 1px dashed ${borderLight}; padding-bottom: 4px;">
        ${escapeHtml(tTitle)}
      </h3>

      <p style="margin: 0 0 6px 0; font-size: 9pt; color: ${brandDark};">
        <strong>${isAr ? 'الوظيفة العملية: ' : 'Functionality: '}</strong>
        ${escapeHtml(tWhat)}
      </p>

      <p style="margin: 0 0 8px 0; font-size: 9pt; color: ${brandMuted};">
        <strong>${isAr ? 'حالات الاستخدام: ' : 'When to Use: '}</strong>
        ${escapeHtml(tWhen)}
      </p>

      <!-- How to use numbered list -->
      <div style="margin: 6px 0 8px 0; background-color: ${bgLight}; padding: 8px 12px; font-size: 8.5pt;">
        <strong style="color: ${brandPrimary}; display: block; margin-bottom: 4px;">
          ${isAr ? 'خطوات التنفيذ السريع:' : 'Step-by-Step Procedure:'}
        </strong>
        <ol style="margin: 0; padding-left: ${isAr ? '0' : '20px'}; padding-right: ${isAr ? '20px' : '0'};">
`;
        tHow.forEach((step) => {
          html += `
          <li style="margin-bottom: 3px; color: ${brandDark};">${escapeHtml(step)}</li>
`;
        });
        html += `
        </ol>
      </div>
`;

        // Parameters Table if present
        if (topic.parameters && topic.parameters.length > 0) {
          html += `
      <div style="margin-top: 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 8pt;">
          <thead>
            <tr style="background-color: ${brandPrimary}; color: #FFFFFF;">
              <th style="padding: 4px 6px; text-align: ${textAlign}; width: 30%; border: 1px solid ${brandPrimary};">${isAr ? 'المعامل' : 'Parameter'}</th>
              <th style="padding: 4px 6px; text-align: center; width: 15%; border: 1px solid ${brandPrimary};">${isAr ? 'النوع' : 'Type'}</th>
              <th style="padding: 4px 6px; text-align: center; width: 15%; border: 1px solid ${brandPrimary};">${isAr ? 'الافتراضي' : 'Default'}</th>
              <th style="padding: 4px 6px; text-align: ${textAlign}; width: 40%; border: 1px solid ${brandPrimary};">${isAr ? 'الوصف والتأثير' : 'Description'}</th>
            </tr>
          </thead>
          <tbody>
`;
          topic.parameters.forEach((param) => {
            const pName = isAr ? param.nameAr : param.nameEn;
            const pDesc = isAr ? param.descriptionAr : param.descriptionEn;
            html += `
            <tr style="border-bottom: 1px solid ${borderLight};">
              <td style="padding: 4px 6px; font-weight: bold; color: ${brandDark};">${escapeHtml(pName)}</td>
              <td style="padding: 4px 6px; text-align: center; color: ${brandMuted}; font-family: monospace;">${escapeHtml(param.type)}</td>
              <td style="padding: 4px 6px; text-align: center; font-weight: bold; font-family: monospace; color: ${brandPrimary};">${escapeHtml(param.defaultVal)}</td>
              <td style="padding: 4px 6px; color: ${brandDark};">${escapeHtml(pDesc)}</td>
            </tr>
`;
          });
          html += `
          </tbody>
        </table>
      </div>
`;
        }

        html += `
    </div>
`;
      });
    }

    // Pro Tips
    const tips = isAr ? section.tipsAr : section.tipsEn;
    if (tips && tips.length > 0) {
      html += `
    <div style="margin-top: 12px; padding: 10px; background-color: #FEF3C7; border: 1px solid #F59E0B; font-size: 8.5pt; color: #92400E;">
      <strong style="display: block; margin-bottom: 3px;">${isAr ? '💡 نصيحة للمحترفين:' : '💡 Pro Tip:'}</strong>
`;
      tips.forEach((tip) => {
        html += `<div style="margin-bottom: 2px;">• ${escapeHtml(tip)}</div>`;
      });
      html += `
    </div>
`;
    }

    // Warnings
    const warnings = isAr ? section.warningsAr : section.warningsEn;
    if (warnings && warnings.length > 0) {
      html += `
    <div style="margin-top: 8px; padding: 10px; background-color: #FEE2E2; border: 1px solid #EF4444; font-size: 8.5pt; color: #991B1B;">
      <strong style="display: block; margin-bottom: 3px;">${isAr ? '⚠️ تنبيه هام:' : '⚠️ Warning:'}</strong>
`;
      warnings.forEach((warn) => {
        html += `<div style="margin-bottom: 2px;">• ${escapeHtml(warn)}</div>`;
      });
      html += `
    </div>
`;
    }

    html += `
  </div>
`;
  });

  html += `
</div>
`;

  return html;
}
