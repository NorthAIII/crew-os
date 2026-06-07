/**
 * Şablon doldurma — eski "Build Email Content" code node'unun saf karşılığı.
 * {{firstName}} {{firmName}} {{city}} {{calLink}} {{segment}} değişkenlerini doldurur.
 * calLink artık tenant_config'ten gelir (eski sistemde hardcode'tu).
 */

export interface TemplateVars {
  firstName: string;
  firmName: string;
  city: string;
  calLink: string;
  segment: string;
}

export function fillTemplate(text: string, vars: TemplateVars): string {
  return text
    .replace(/\{\{\s*firstName\s*\}\}/g, vars.firstName)
    .replace(/\{\{\s*firmName\s*\}\}/g, vars.firmName)
    .replace(/\{\{\s*city\s*\}\}/g, vars.city)
    .replace(/\{\{\s*calLink\s*\}\}/g, vars.calLink)
    .replace(/\{\{\s*segment\s*\}\}/g, vars.segment);
}

export interface TemplateRow {
  segment: string;
  step: number;
  subject: string;
  body: string;
}

/**
 * (segment, step) için şablon seçer; tam eşleşme yoksa 'all' segment'ine düşer.
 * Eski sistemin segment→all fallback davranışı. (A/B variant v3'te sadeleştirildi → tek şablon.)
 */
export function selectTemplate(
  templates: TemplateRow[],
  segment: string,
  step: number,
): TemplateRow | null {
  const exact = templates.find((t) => t.segment === segment && t.step === step);
  if (exact) return exact;
  const fallback = templates.find((t) => t.segment === "all" && t.step === step);
  return fallback ?? null;
}
