// TypeScript types for dribble_shots schema tables.
// Column names match actual PostgreSQL column names (snake_case).

export type ProductType = 'website' | 'mobile' | 'dashboard';
export type PlanStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
export type ReviewDecision = 'approved' | 'rejected';
export type NotificationType = 'approved' | 'rejected' | 'info';

export interface ThemeLibrary {
  id: number;
  macro_theme: string;
  niche_name: string;
  country_fit: string[];
  buyer_fit: string[];
  visual_potential: number;
  authority_score: number;
  business_relevance: number;
  discovery_score: number;
  generic_penalty: number;
  notes: string | null;
}

export interface ShotPlan {
  id: number;
  designer_id: string; // uuid → public.users_profile.id
  parent_plan_id: number | null;
  revision_number: number;
  general_theme_id: number;
  specific_theme: string;
  title: string;
  product_type: ProductType;
  target_market: string;
  app_explanation: string;
  sections_json: { name: string; description: string }[] | null;
  screens_json: { name: string; description: string }[] | null;
  pages_json: { name: string; flow: string }[] | null;
  ref_links_json: string[] | null;
  status: PlanStatus;
  created_at: string;
  updated_at: string;
}

export interface AiEvaluation {
  id: number;
  plan_id: number;
  score: number;
  label: string;
  score_breakdown_json: {
    region_timing_fit: number;
    buyer_fit: number;
    authority_fit: number;
    visual_potential: number;
    business_relevance: number;
    discovery_potential: number;
    generic_penalty: number;
  };
  field_feedback_json: {
    specific_theme: string;
    title: string;
    target_market: string;
    sections_or_screens: string;
    app_explanation: string;
  };
  overall_verdict: string;
  created_at: string;
}

export interface AdminReview {
  id: number;
  plan_id: number;
  reviewer_id: string; // uuid
  decision: ReviewDecision;
  field_notes_json: {
    specific_theme?: string;
    title?: string;
    target_market?: string;
    product_type?: string;
    sections_or_screens?: string;
    app_explanation?: string;
    ref_links?: string;
  };
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: string; // uuid
  plan_id: number | null;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
}

// From public.users_profile (only fields used in this project)
export interface UsersProfile {
  id: string; // uuid
  name: string;
}
