import { AxiosError } from "axios";
import { ApiResponse } from "../api";
import { api } from "../authorization/AuthHeader";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface TimesheetItem {
  id: number;
  commuteDate: string;
  arrivedAt: string | null;
  leftAt: string | null;
  commuteTime: number;
  breakTime: number;
  editable: boolean;
  staffId: number;
  nickname: string;
}

export interface TimesheetListResponse {
  timesheets: TimesheetItem[];
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

export async function getTimesheetsByDate(storeId: number, date: string) {
    if ((!storeId && storeId !== 0) || !date) throw new Error('storeId and date (required)');

    try {
        const token = await loadToken();
        console.log(token);
        const res = await api.get<ApiResponse<TimesheetListResponse>>(
        `/v1/stores/${storeId}/timesheets`,
        {
          headers: {
            Authorization: token
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