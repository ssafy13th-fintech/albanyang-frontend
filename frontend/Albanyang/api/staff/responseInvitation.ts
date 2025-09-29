import { AxiosError } from "axios";
import { api, handleResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
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

export async function responseInvitation(storeId: number, accept: boolean) {
    try {
        const token = await loadToken();
        console.log(token);
        console.log("수락이나 거절 요청함");
        await api.post<ApiResponse<void>>(
          `/v1/stores/${storeId}/invitation/response`,
          {},
          {
              headers: {
                  Authorization: token,
              },
              params: {
                accept: accept
              }
          }
        );
    } catch (err) {

        handleAxiosError(err);
    }
}
