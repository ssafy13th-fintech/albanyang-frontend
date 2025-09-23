import axios, { AxiosError, AxiosInstance } from 'axios';

// Axios 인스턴스 설정 (member.ts와 동일하게 맞춰야 함)
const api: AxiosInstance = axios.create({
  baseURL: 'https://your-api-domain.com', // 프로젝트에 맞게 수정
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 공통 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

// 요청 타입
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
}

// 에러 처리 헬퍼
function handleAxiosError(err: unknown): never {
  if ((err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;
    throw new Error(
      `Request failed${status ? ` (status ${status})` : ''}: ${
        (data && (data as any).message) || axiosErr.message
      }`
    );
  }
  throw err;
}

// 1) POST /api/v1/auth/login
// 로그인
export async function login(body: LoginRequest) {
  if (!body.email || !body.password) {
    throw new Error('email and password are required');
  }
  try {
    const res = await api.post<ApiResponse<LoginResponseData>>(
      '/api/v1/auth/login',
      body
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// 2) POST /api/v1/auth/logout
// 로그아웃
export async function logout() {
  try {
    const res = await api.post<ApiResponse<string>>('/api/v1/auth/logout');
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}7

export default {
  api,
  login,
  logout,
};