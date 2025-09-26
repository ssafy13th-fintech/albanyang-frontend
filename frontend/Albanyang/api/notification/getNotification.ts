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
    storeName: string;
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

export async function getNotification(storeId: number, notificationId: number) {
    try {
        const token = await loadToken();
        const res = await api.get<ApiResponse<NotificationResponse>>(
        `/v1/stores/${storeId}/notifications/${notificationId}`,
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
