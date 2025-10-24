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
  billingPeriod: "monthly" | "yearly";
  recommended?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiError {
  error: string;
  details?: any;
}
