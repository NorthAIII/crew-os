/**
 * Brifing pipeline paylaşılan tipleri (crew-os TS portu).
 * Saf tipler — DB/LLM bağımlılığı yok.
 */

export interface ScoutData {
  metrics_summary: string;
  hubspot_summary?: string;
  kb_insights: string[];
  lessons_context: string[];
  web_insights: string[];
  opportunities: string[];
  risks: string[];
}

export type ActionType = "outreach" | "content" | "crm" | "research" | "other";

export interface StrategyAction {
  id: number;
  title: string;
  priority: "high" | "medium" | "low";
  impact: string;
  steps: string;
  type: ActionType;
}

export interface Strategy {
  analysis: string;
  actions: StrategyAction[];
  focus_of_the_day: string;
}

export interface CriticReview {
  approved: boolean;
  score: number;
  feedback: string;
  action_reviews?: Array<{ id: number; ok: boolean; comment: string }>;
}

/** Conductor'ın brifingdeki onay-bekleyen aksiyonu. category dashboard'da gösterilir. */
export interface PendingAction {
  id: number;
  category: string; // OUTREACH | EMAIL | ICERIK | CRM | ARASTIRMA | DIGER
  description: string;
}

export interface ConductorEmail {
  subject: string;
  body: string;
  pending_actions: PendingAction[];
}

/** Kategori bazlı onay oranı (graduated autonomy girdisi). */
export interface CategoryRate {
  total: number;
  approved: number;
  rejected: number;
  approval_rate: number; // 0-100
}

export type ApprovalRates = Record<string, CategoryRate>;

export interface BriefingResult {
  runId: string;
  subject: string;
  body: string;
  pending_actions: PendingAction[];
  auto_approved_actions: PendingAction[];
  auto_rejected_actions: PendingAction[];
  metadata: {
    iterations: number;
    graduated_autonomy: {
      auto_approved: number;
      auto_rejected: number;
      needs_approval: number;
      rates: ApprovalRates;
    };
  };
}
