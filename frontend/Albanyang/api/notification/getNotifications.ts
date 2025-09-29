import { AxiosError } from "axios";
import { api, handleResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

export interface NotificationResponse {
    id: number;
    title: string;
    content: string;
    date: string;
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

export async function getNotifications(storeId: number) {
    try {
        const token = await loadToken();
        console.log("공지 함수 접근 직전");
        const res = await api.get<ApiResponse<NotificationResponse[]>>(
        `/v1/stores/${storeId}/notifications`,
        {
            headers: {
                Authorization: token,
            },
        }
        );
        console.log("공지 함수 접근 후");
        return res.data.data;
    } catch (err) {
        
        handleAxiosError(err);
    }
}
