/**
 * Scout (Haiku) — metrik + KB + geçmiş öğrenimler + (opsiyonel) web → yapılandırılmış JSON.
 * Eski Groq/Llama-Scout yerine Haiku. "KiwiAI Lab/Kivanc" prompt'a gömülü DEĞİL → tenant profili enjekte.
 */
import { completeJson } from "@/lib/llm/client";
import type { ResolvedTenant } from "@/lib/tenant";
import { buildTenantProfile } from "@/lib/tenant";
import { fetchLeadMetrics, fetchPipelineStats, fetchRecentLessons } from "./metrics.js";
import { searchKbMulti } from "./kb.js";
import type { ScoutData } from "./types.js";

const SCOUT_SYSTEM = (profile: string) => `Sen bir Scout (keşif) ajanısın. Şirket profili:
${profile}

Görevin: lead/outreach/meeting metriklerini, dahili bilgi tabanını (KB) ve geçmiş öğrenimleri analiz et;
fırsat ve riskleri çıkar. Her zaman Türkçe yaz, somut sayılar kullan. Geçmiş öğrenimler şirketin
tercihlerini yansıtır — dikkate al.

Çıktı formatı (yalnız JSON):
{"metrics_summary":"...","kb_insights":["..."],"lessons_context":["..."],"web_insights":["..."],"opportunities":["..."],"risks":["..."]}`;

/** Lesson içeriğinden dinamik KB sorguları (port: build_dynamic_kb_queries). */
export function buildDynamicKbQueries(lessons: Array<{ content: string }>): string[] {
  const queries = ["hedef sektörler öncelikler", "satış stratejisi aksiyon planı"];
  const keywordMap: Record<string, string> = {
    outreach: "outreach email stratejisi",
    icerik: "içerik pazarlama planı",
    crm: "CRM yönetimi müşteri takibi",
    lead: "lead generation kaynakları",
    fiyat: "hizmet fiyatlama",
    email: "email satış sekans stratejisi",
    satis: "satış süreci kapatma teknikleri",
  };
  const added = new Set<string>();
  for (const lesson of lessons.slice(0, 5)) {
    const lc = (lesson.content || "").toLowerCase();
    for (const [kw, q] of Object.entries(keywordMap)) {
      if (lc.includes(kw) && !added.has(q)) {
        queries.push(q);
        added.add(q);
      }
    }
  }
  return queries.slice(0, 6);
}

async function searchWeb(query: string): Promise<string[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];
  try {
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("q", query);
    url.searchParams.set("api_key", key);
    url.searchParams.set("num", "5");
    const res = await fetch(url);
    const data = (await res.json()) as { organic_results?: Array<{ title?: string; snippet?: string }> };
    return (data.organic_results ?? []).slice(0, 5).map((r) => `${r.title ?? ""}: ${r.snippet ?? ""}`);
  } catch {
    return [];
  }
}

export async function runScout(tenant: ResolvedTenant): Promise<ScoutData> {
  const profile = buildTenantProfile(tenant);

  const [metrics, pipeline, lessons] = await Promise.all([
    fetchLeadMetrics(tenant.id).catch((e) => ({ error: String(e) })),
    fetchPipelineStats(tenant.id).catch((e) => ({ error: String(e) })),
    fetchRecentLessons(tenant.id, 10).catch(() => []),
  ]);

  const kbQueries = buildDynamicKbQueries(lessons);
  const kbHits = await searchKbMulti(tenant.id, kbQueries, 2).catch(() => []);
  const kbContext = kbHits.map((h) => `[${h.document}] ${h.text.slice(0, 400)}`).join("\n\n");
  const lessonsContext = lessons.map((l) => `- [${l.category ?? ""}] ${l.content}`).join("\n");
  const web = await searchWeb("B2B AI automation trends 2026");

  const user = `Bugünkü veriler:

## Metrikler
${JSON.stringify(metrics, null, 2)}

## Pipeline
${JSON.stringify(pipeline, null, 2)}

## Bilgi Tabanı (KB)
${kbContext || "KB boş veya erişilemedi."}

## Geçmiş Öğrenimler
${lessonsContext || "Henüz öğrenme yok."}

## Web Araştırması
${web.length ? web.join("\n") : "Web araması yapılmadı."}

Tüm bu verileri analiz et ve JSON formatında raporla.`;

  const fallback: ScoutData = {
    metrics_summary: JSON.stringify(metrics),
    kb_insights: [],
    lessons_context: [],
    web_insights: web,
    opportunities: [],
    risks: [],
  };

  const { data } = await completeJson<ScoutData>(
    { tier: "haiku", system: SCOUT_SYSTEM(profile), user, temperature: 0.3, maxTokens: 1500 },
    fallback,
  );
  return data;
}
