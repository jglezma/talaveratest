export interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: "active" | "inactive" | "completed";
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string[];
  billing_period: "monthly" | "yearly";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: "active" | "cancelled" | "expired" | "trialing";
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
  plan_name?: string;
  plan_price?: number;
  billing_period?: string;
}

export interface Invoice {
  id: number;
  user_id: number;
  subscription_id: number;
  amount: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  billing_period_start: string;
  billing_period_end: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}
