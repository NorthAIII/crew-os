/**
 * Anthropic istemci sarmalayıcısı. Tüm ajanlar bunu kullanır — tek giriş noktası.
 * - Prompt caching: büyük statik system prompt'u `cache_control: ephemeral` ile işaretler.
 * - completeJSON: eski crew-os ajanlarındaki "ham metinden ilk {...} bloğunu çek" desenini
 *   tek yerde toplar (model bazen JSON'u açıklama metniyle sarmalıyor).
 */
import Anthropic from "@anthropic-ai/sdk";
import { MODELS, type Tier } from "./models.js";

// NOT: anahtar kontrolü import anında DEĞİL, ilk complete() çağrısında yapılır.
// (Eager throw `next build`'i kırıyordu — build modülü yükler ama complete() çağırmaz.)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? "" });

export interface CompleteOptions {
  tier?: Tier;
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  /** Statik system prompt'u cache'le (varsayılan: true). Token tasarrufu. */
  cacheSystem?: boolean;
}

export interface CompleteResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export async function complete(opts: CompleteOptions): Promise<CompleteResult> {
  if (!process.env.ANTHROPIC_API_KEY) {
    // Runtime fail-fast: LLM çağrısı anında anahtar zorunlu (build/import değil).
    throw new Error("ANTHROPIC_API_KEY tanımlı değil — LLM çağrısı yapılamaz.");
  }
  const tier = opts.tier ?? "sonnet";
  const model = MODELS[tier];
  const cacheSystem = opts.cacheSystem ?? true;

  const resp = await anthropic.messages.create({
    model,
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.6,
    system: cacheSystem
      ? [{ type: "text", text: opts.system, cache_control: { type: "ephemeral" } }]
      : opts.system,
    messages: [{ role: "user", content: opts.user }],
  });

  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return {
    text,
    inputTokens: resp.usage.input_tokens,
    outputTokens: resp.usage.output_tokens,
    model,
  };
}

/** Ham metinden ilk dengeli {...} bloğunu çıkarıp JSON.parse eder; başarısızsa null. */
export function extractJson<T = unknown>(raw: string): T | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

/** complete + JSON çıkarımı. Model JSON döndüremezse fallback döner. */
export async function completeJson<T = unknown>(
  opts: CompleteOptions,
  fallback: T,
): Promise<{ data: T; usage: CompleteResult }> {
  const usage = await complete(opts);
  const data = extractJson<T>(usage.text);
  return { data: data ?? fallback, usage };
}
