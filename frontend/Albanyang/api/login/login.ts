// src/services/authService.ts
import { api, handleResponse } from "../api";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginData = {
  accessToken: string;
  refreshToken?: string;
};

export async function login(request: LoginRequest): Promise<LoginData> {
  return handleResponse<LoginData>(api.post("/api/v1/auth/login", request));
}
