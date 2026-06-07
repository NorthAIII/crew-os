/**
 * Tek LLM sağlayıcısı = Anthropic Claude. (Groq/Qwen/Llama + Gemini kaldırıldı.)
 * Kademe seçimi maliyet/kalite dengesi:
 *  - haiku: ucuz/hızlı → Scout, Critic, reply sınıflama, routing
 *  - sonnet: kaliteli → Strategist, Conductor (brifing), içerik, Reflexion
 * Token verimliliği: Haiku + prompt caching (statik system prompt'ları cache'lenir).
 */
export const MODELS = {
  haiku: process.env.ANTHROPIC_MODEL_HAIKU ?? "claude-haiku-4-5-20251001",
  sonnet: process.env.ANTHROPIC_MODEL_SONNET ?? "claude-sonnet-4-6",
} as const;

export type Tier = keyof typeof MODELS;
