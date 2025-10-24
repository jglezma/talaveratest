import axios, { AxiosInstance, AxiosResponse } from "axios";
import { ApiResponse, AuthResponse, User, Project, Plan } from "../types";

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.setToken(null);
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      this.setToken(savedToken);
    }
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  // Auth endpoints
  async signup(
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await this.api.post("/auth/signup", {
        email,
        password,
        name,
      });
    return response.data.data;
  }

  async signin(email: string, password: string): Promise<AuthResponse> {
    const response: AxiosResponse<ApiResponse<AuthResponse>> =
      await this.api.post("/auth/signin", {
        email,
        password,
      });
    return response.data.data;
  }

  async getProfile(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(
      "/auth/profile"
    );
    return response.data.data;
  }

  // Projects endpoints
  async getProjects(): Promise<Project[]> {
    const response: AxiosResponse<ApiResponse<Project[]>> = await this.api.get(
      "/projects"
    );
    return response.data.data;
  }

  async getProject(id: number): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await this.api.get(
      `/projects/${id}`
    );
    return response.data.data;
  }

  async createProject(title: string, description?: string): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await this.api.post(
      "/projects",
      {
        title,
        description,
      }
    );
    return response.data.data;
  }

  async updateProject(id: number, data: Partial<Project>): Promise<Project> {
    const response: AxiosResponse<ApiResponse<Project>> = await this.api.put(
      `/projects/${id}`,
      data
    );
    return response.data.data;
  }

  async deleteProject(id: number): Promise<void> {
    await this.api.delete(`/projects/${id}`);
  }

  // Subscriptions endpoints
  async getPlans(): Promise<Plan[]> {
    const response: AxiosResponse<ApiResponse<Plan[]>> = await this.api.get(
      "/subscriptions/plans"
    );
    return response.data.data;
  }

  async createSubscription(planId: number): Promise<any> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.post(
      "/subscriptions",
      {
        plan_id: planId,
      }
    );
    return response.data.data;
  }

  async getUserSubscriptions(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any[]>> = await this.api.get(
      "/subscriptions"
    );
    return response.data.data;
  }
}

export const apiService = new ApiService();
