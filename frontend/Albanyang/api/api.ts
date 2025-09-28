// src/services/api.ts
import axios, { AxiosInstance, AxiosResponse } from "axios";

/**
 * API 응답 공통 타입 (명세 기반)
 * {
 *   code: "SUCCESS" | ...,
 *   message: string | null,
 *   data: T | null
 * }
 */
export type ApiResponse<T = any> = {
  code: string;
  message: string | null;
  data: T | null;
};

const BASE_URL = process.env.API_BASE_URL ?? "https://j13a605.p.ssafy.io"; // 변경하세요

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 토큰을 전역 헤더에 세팅/해제하는 유틸 (외부에서 호출)
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}

// 응답 래핑 헬퍼 (data 부분만 반환, 에러는 throw)
export async function handleResponse<T>(p: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  try {
    const res = await p;
    const body = res.data;
    if (!body) throw new Error("Empty response from server");
    if (body.code !== "SUCCESS") {
      // 서버가 실패 코드를 명시하는 경우
      const msg = body.message ?? "Server returned error";
      const err: any = new Error(msg);
      err.code = body.code;
      throw err;
    }
    return body.data as T;
  } catch (err: any) {
    // axios 에러에서 메시지 추출
    if (err?.response?.data) {
      const resp = err.response.data as ApiResponse;
      const msg = resp?.message ?? JSON.stringify(resp);
      throw new Error(msg);
    }
    throw err;
  }
}
