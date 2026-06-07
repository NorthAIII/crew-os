/**
 * Saf KB metin yardımcıları — DB bağımlılığı YOK (CI-güvenli test).
 * chunkMarkdown: dokümanı arama chunk'larına böler. toOrTsquery: sorguyu OR tsquery'ye çevirir.
 */

export function chunkMarkdown(text: string, maxLen = 700): string[] {
  const normalized = text.replace(/\r/g, "").trim();
  const sections = normalized
    .split(/\n-{3,}\n|(?=\n#{1,3}\s)/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  for (const section of sections) {
    if (section.length <= maxLen) {
      chunks.push(section);
      continue;
    }
    let buf = "";
    for (const para of section.split(/\n\n+/)) {
      if (buf && buf.length + para.length + 2 > maxLen) {
        chunks.push(buf.trim());
        buf = "";
      }
      buf += (buf ? "\n\n" : "") + para;
    }
    if (buf.trim()) chunks.push(buf.trim());
  }
  return chunks.filter((c) => c.length > 0);
}

/**
 * Sorguyu güvenli tsquery'ye çevirir: alfanümerik token'lar OR'lanır (recall öncelikli).
 * 'simple' config stemming yapmadığından chunk'lara bölünmüş KB'de AND çok katı kalıyordu.
 */
export function toOrTsquery(query: string): string {
  const tokens = query
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1);
  return tokens.join(" | ");
}
