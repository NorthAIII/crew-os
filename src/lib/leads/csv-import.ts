/**
 * Apollo/CSV lead import (eski apollo-csv-import.json portu). Parser saf, test edilebilir.
 * Esnek başlık eşleme: Apollo'nun yaygın kolon adlarını lead alanlarına çevirir.
 */

/** Saf: CSV metnini satır nesnelerine çevirir (tırnak içi virgül destekli). */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r/g, "").trim().split("\n");
  if (lines.length < 2) return [];

  const splitLine = (line: string): string[] => {
    const cols: string[] = [];
    let inQ = false;
    let cur = "";
    for (const ch of line) {
      if (ch === '"') inQ = !inQ;
      else if (ch === "," && !inQ) {
        cols.push(cur.trim());
        cur = "";
      } else cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  };

  const headers = splitLine(lines[0]).map((h) => h.toLowerCase());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = splitLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => (row[h] = cols[idx] ?? ""));
    rows.push(row);
  }
  return rows;
}

export interface ImportLead {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  industry: string;
  city: string;
  country: string;
  linkedin: string;
  targetSegment: string | null;
}

const ALIASES: Record<keyof ImportLead, string[]> = {
  firstName: ["first name", "first_name", "firstname", "ad"],
  lastName: ["last name", "last_name", "lastname", "soyad"],
  email: ["email", "email address", "e-mail"],
  company: ["company", "company name", "organization", "şirket"],
  phone: ["phone", "phone number", "mobile", "telefon"],
  industry: ["industry", "sektor", "sektör"],
  city: ["city", "şehir"],
  country: ["country", "ülke"],
  linkedin: ["person linkedin url", "linkedin url", "linkedin"],
  targetSegment: ["segment", "target_segment", "target segment"],
};

function pick(row: Record<string, string>, keys: string[]): string {
  for (const k of keys) if (row[k]) return row[k];
  return "";
}

/** Saf: CSV satırlarını lead nesnelerine eşler (email zorunlu; eksikse atlanır). */
export function rowsToLeads(rows: Record<string, string>[], defaultSegment?: string): ImportLead[] {
  const out: ImportLead[] = [];
  for (const row of rows) {
    const email = pick(row, ALIASES.email).toLowerCase();
    if (!email) continue;
    out.push({
      firstName: pick(row, ALIASES.firstName),
      lastName: pick(row, ALIASES.lastName),
      email,
      company: pick(row, ALIASES.company),
      phone: pick(row, ALIASES.phone),
      industry: pick(row, ALIASES.industry),
      city: pick(row, ALIASES.city),
      country: pick(row, ALIASES.country),
      linkedin: pick(row, ALIASES.linkedin),
      targetSegment: pick(row, ALIASES.targetSegment) || defaultSegment || null,
    });
  }
  return out;
}
