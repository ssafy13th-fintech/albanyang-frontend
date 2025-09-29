import { AxiosError } from "axios";
import { api } from "../authorization/AuthHeader";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface Store {
  id: number;
  name: string;
  address: string;
  officeNumber: string;
  payDay: number;
  scale: '5인 이상' | '5인 미만';
}

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

export interface StaffStoresResponse {
  stores: Store[];
}

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

export async function getStore(storeId: number) {
    try {
        const token = await loadToken();
        const res = await api.get<ApiResponse<Store>>(
        `/v1/stores/${storeId}`,
        {
            headers: {
                Authorization: token,
            },
        }
        );
        return res.data.data;
    } catch (err) {

        handleAxiosError(err);
    }
}

// GET /api/v1/stores/me - 직원이 일하는 사업장 조회
export async function getStaffStores(): Promise<Store[]> {
  try {
    const res = await api.get<ApiResponse<StaffStoresResponse>>('/v1/stores/me');
    
    if (res.data && res.data.data && res.data.data.stores) {
      return res.data.data.stores;
    }
    
    if (res.data && Array.isArray(res.data)) {
      return res.data;
    }
    
    console.warn('Unexpected API response structure:', res.data);
    return [];
    
  } catch (err) {

    handleAxiosError(err);
  }
}

export default {
  getStore,
  getStaffStores,
};