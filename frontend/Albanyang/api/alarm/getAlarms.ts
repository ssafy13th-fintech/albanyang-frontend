import { AxiosError } from "axios";
import { api } from "../authorization/AuthHeader";

export interface ApiResponse<T = any> {
    code: string;
    message: string;
    data: T;
}

export interface AlarmResponse{
    id: number;
    messageId: String;
    screen: String;
    title: String;
    isRead: boolean;
    isResponse: boolean;
    date: String;
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

export async function getAlarms() {
    try {
        const res = await api.get<ApiResponse<AlarmResponse[]>>(`/v1/alarms/me`);
        return res.data.data;
    } catch (err) {
        console.error("알람 조회 에러", err);
        handleAxiosError(err);
    }
}
