import { AxiosError } from "axios";
import { api, handleResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

export interface NotificationRequest {
  title: string;
  content: string;
}

export interface NotificationResponse {
    id: number;
    title: string;
    content: string;
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

export async function writeNotification(storeId: number, body: NotificationRequest) {
    if(body.title.length > 100) throw new Error("공지 제목은 100자 이내로 작성해주세요");

    try {
        const token = await loadToken();
        const res = await api.post<ApiResponse<NotificationResponse>>(
          `/v1/stores/${storeId}/notifications`,
          body,
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
