import { AxiosError } from "axios";
import { ApiResponse } from "../api";
import { api } from "../authorization/AuthHeader";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface UpdateStaff{
    nickname: string;
    status: number;
    taxType: number;
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

export async function updateStaff(storeId: number, staffId: number, body: UpdateStaff) {
    try {
        const token = await loadToken();
        console.log(body);
        await api.put<ApiResponse<void>>(
          `/v1/stores/${storeId}/staffs/${staffId}`,
          body,
          {
              headers: {
                  Authorization: token,
              },
          }
        );
        
    } catch (err) {
        console.error(err);
        handleAxiosError(err);
    }
}
