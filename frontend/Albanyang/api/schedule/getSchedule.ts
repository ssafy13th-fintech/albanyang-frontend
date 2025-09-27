import { AxiosError } from "axios";
import { api, handleResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

// 스케줄 관련 타입 정의
export interface Schedule {
  id: number;
  commuteDate: string; // "2025-09-25" 형식
  workStartTime: string;
  workEndTime: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightShiftHours: number;
  scheduleType: 'NORMAL' | string;
  editable: boolean;
  storeId: number;
  staffId: number;
  staffNickname: string;
}

export interface ScheduleListResponse {
  schedules: Schedule[];
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

// GET /api/v1/stores/{store-id}/schedule - 매장의 전체 스케줄 조회
export async function getStoreSchedules(storeId: number, month?: string, date?: string) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if((month === undefined || month === null) && (date === undefined || date === null)) throw new Error('month나 date를 넣어주세요');
  if((month !== undefined && month !== null) && (date !== undefined && date !== null)) throw new Error('month나 date 중 하나만 넣어주세요');
  try {
    const params: any = {};
    if (month) params.month = month;
    if (date) params.date = date;

    const token = await loadToken();
    const res = await api.get<ApiResponse<ScheduleListResponse>>(
      `/v1/stores/${storeId}/schedule`,
      {
            headers: {
                Authorization: token,
            },
            params: {
                date: date
            }
        }
    );
    return res.data.data;
  } catch (err) {
    handleAxiosError(err);
  }
}