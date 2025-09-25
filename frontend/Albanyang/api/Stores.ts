import { api } from "@/api/authorization/AuthHeader";
import { AxiosError } from 'axios';
// Axios 인스턴스 (다른 api 파일들과 동일하게 설정)
// const api: AxiosInstance = axios.create({
//   baseURL: 'https://your-api-domain.com', // 프로젝트 환경에 맞게 변경
//   timeout: 10000,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// 공통 응답 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

// Store 데이터 타입
export interface StoreData {
  id: number;
  name: string;
  address: string;
  officeNumber: string;
  payDay: number;
  scale: string | number;
}

export interface StoreListResponse {
  stores: { id: number; name: string }[];
}

export interface StoreRequestBody {
  name: string;
  address: string;
  officeNumber: string;
  payDay: number;
  scale: number;
}

// 에러 처리 유틸
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

// GET /api/v1/stores/{store-id}
// 사업장 조회
export async function getStoreById(storeId: number) {
  if (!storeId && storeId !== 0) throw new Error('storeId (required)');
  try {
    const res = await api.get<ApiResponse<StoreData>>(`/api/v1/stores/${storeId}`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// PUT /api/v1/stores/{store-id}
// 사업장 정보 수정
export async function updateStore(storeId: number, body: StoreRequestBody) {
  if (!storeId && storeId !== 0) throw new Error('storeId (required)');
  try {
    const res = await api.put<ApiResponse<string>>(`/api/v1/stores/${storeId}`, body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// DELETE /api/v1/stores/{store-id}
// 사업장 삭제
export async function deleteStore(storeId: number) {
  if (!storeId && storeId !== 0) throw new Error('storeId (required)');
  try {
    const res = await api.delete<ApiResponse<string>>(`/api/v1/stores/${storeId}`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /api/v1/stores
// 모든 사업장 조회
export async function getStores() {
  try {
    const res = await api.get<ApiResponse<StoreListResponse>>('/api/v1/stores');
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// POST /api/v1/stores
// 사업장 등록
export async function createStore(body: StoreRequestBody) {
  if (!body.name || !body.address || !body.officeNumber || !body.payDay || !body.scale) {
    throw new Error('All fields in StoreRequestBody are required');
  }
  try {
    const res = await api.post<ApiResponse<StoreData>>('/api/v1/stores', body);
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
