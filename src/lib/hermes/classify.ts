/**
 * Saf yanıt-sınıflama yardımcıları — DB bağımlılığı YOK (CI-güvenli birim test).
 * LLM çağrısı reply-handler.ts'te; burada yalnız keyword override + parse + sabitler.
 */
import { extractJson } from "@/lib/llm/client";

export type Classification =
  | "meeting_request"
  | "positive"
  | "negative"
  | "out_of_office"
  | "not_relevant";

export const VALID_CLASSIFICATIONS: Classification[] = [
  "meeting_request",
  "positive",
  "negative",
  "out_of_office",
  "not_relevant",
];

export interface ClassifyResult {
  classification: Classification;
  reason: string;
}

// Haiku bazen bariz unsubscribe ifadelerini kaçırır → keyword override (TR + EN + DE).
const NEGATIVE_RE =
  /(^|\b)(unsubscribe|opt[- ]?out|stop emailing|remove me|please remove|take me off|don'?t (email|contact)|ilgilenmiyorum|kaldır|listeden çıkar|abone(likten)? çık|rahatsız etme|bitte nicht|abbestellen|abmelden)(\b|$)/i;

/** Gövdede bariz negatif/opt-out ifadesi var mı? */
export function keywordNegative(body: string): boolean {
  return NEGATIVE_RE.test(body || "");
}

/** Haiku ham çıktısından sınıflandırmayı çıkar; geçersizse not_relevant. */
export function parseClassification(rawText: string): ClassifyResult {
  const parsed = extractJson<{ classification?: string; reason?: string }>(rawText);
  const c = parsed?.classification as Classification | undefined;
  if (c && VALID_CLASSIFICATIONS.includes(c)) {
    return { classification: c, reason: parsed?.reason ?? "" };
  }
  return { classification: "not_relevant", reason: "parse error" };
}

export const CLASSIFY_SYSTEM = `You classify email replies from sales prospects. Return ONLY a JSON object, no other text.
Classifications:
- meeting_request: wants a call, meeting, or demo explicitly
- positive: interested, asking questions, open to talking
- negative: not interested, stop emailing, unsubscribe
- out_of_office: auto-reply or vacation message
- not_relevant: spam or completely unrelated
Return exactly: {"classification": "...", "reason": "max 10 words"}`;
