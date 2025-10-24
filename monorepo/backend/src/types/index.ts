export interface User {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  status: "active" | "inactive" | "completed";
  created_at: Date;
  updated_at: Date;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  features: string[];
  billing_period: "monthly" | "yearly";
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Invoice {
  id: number;
  user_id: number;
  plan_id: number;
  amount: number;
  status: "pending" | "paid" | "failed" | "cancelled";
  billing_period_start: Date;
  billing_period_end: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuthPayload {
  userId: number;
  email: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
}

export interface UpdateProjectRequest {
  title?: string;
  description?: string;
  status?: "active" | "inactive" | "completed";
}

export interface CreateSubscriptionRequest {
  plan_id: number;
}
