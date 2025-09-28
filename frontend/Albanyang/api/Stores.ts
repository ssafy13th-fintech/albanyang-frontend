// ../Albayang/api/Store.ts

import { api } from "@/api/authorization/AuthHeader";
import { AxiosError } from "axios";

// 공통 응답 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

// ===== 스웨거 스펙에 맞춘 타입 =====
// GET/PUT/POST 응답 본문
export interface StoreData {
  id: number;
  name: string;
  address: string;
  officeNumber: string;
  payDay: number;
  // 스웨거 응답은 string (예: "SMALL", "1" 등 서버 구현에 따라 문자열)
  scale: string;
}

export interface StoreListResponse {
  stores: { id: number; name: string }[];
}

// 요청 바디 (PUT/POST)
export interface StoreRequestBody {
  name: string;
  address: string;
  // 스웨거상 필수 아님
  officeNumber?: string;
  // 필수
  payDay: number;
  // 스웨거상 number, 필수 아님
  scale?: number;
}

// 에러 처리 유틸
function handleAxiosError(err: unknown): never {
  if ((err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data as any;
    throw new Error(
      `Request failed${status ? ` (status ${status})` : ""}: ${data?.message ?? axiosErr.message}`
    );
  }
  throw err;
}

/**
 * GET /api/v1/stores/{store-id}
 * 사업장 단일 조회
 */
export async function getStoreById(storeId: number) {
  if (storeId == null) throw new Error("storeId (required)");
  try {
    const res = await api.get<ApiResponse<StoreData>>(`/v1/stores/${storeId}`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

/**
 * PUT /api/v1/stores/{store-id}
 * 사업장 정보 수정
 */
export async function updateStore(storeId: number, body: StoreRequestBody) {
  if (storeId == null) throw new Error("storeId (required)");
  // name/address/payDay는 실제 수정 시에도 유효값 권장
  if (!body?.name || !body?.address || typeof body?.payDay !== "number") {
    throw new Error("name, address, payDay are required in body");
  }
  try {
    const res = await api.put<ApiResponse<string>>(`/v1/stores/${storeId}`, body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

/**
 * DELETE /api/v1/stores/{store-id}
 * 사업장 삭제
 */
export async function deleteStore(storeId: number) {
  if (storeId == null) throw new Error("storeId (required)");
  try {
    const res = await api.delete<ApiResponse<string>>(`/v1/stores/${storeId}`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

/**
 * GET /api/v1/stores
 * 사장의 모든 사업장 조회
 */
export async function getStores() {
  try {
    const res = await api.get<ApiResponse<StoreListResponse>>(`/v1/stores`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

/**
 * POST /api/v1/stores
 * 사업장 등록
 */
export async function createStore(body: StoreRequestBody) {
  // 스웨거 required: name, address, payDay
  if (!body?.name || !body?.address || typeof body?.payDay !== "number") {
    throw new Error("name, address, payDay are required in body");
  }
  try {
    const res = await api.post<ApiResponse<StoreData>>(`/v1/stores`, body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export default {
  api,
  getStoreById,
  updateStore,
  deleteStore,
  getStores,
  createStore,
};
