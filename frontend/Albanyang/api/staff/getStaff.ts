import { AxiosError } from "axios";
import { api, handleResponse, ApiResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface StaffDetail {
  id: number;
  name: string;
  nickname: string;
  status: '재직' | '퇴사' | '예정';
  taxType: '4대보험' | '사업소득세' | '없음';
  wage: number;
  weeklyWorkingDay: number;
  workingHours: number;
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

export async function getStaff(storeId: number, staffId: number) {
    try {
        const token = await loadToken();
        const res = await api.get<ApiResponse<StaffDetail>>(
        `/v1/stores/${storeId}/staffs/${staffId}`,
        {
            headers: {
                Authorization: token,
            },
        }
        );
        return res.data.data;
    } catch (err) {
        console.error("사업장 조회 에러", err);
        handleAxiosError(err);
    }
}

