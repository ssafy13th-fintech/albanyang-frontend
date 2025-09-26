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

export async function responsePayslip(storeId: number, payslipId: number, messageId: string, accept: boolean) {
    try {
        const token = await loadToken();
        console.log(messageId);
        await api.post<ApiResponse<void>>(
          `/v1/stores/${storeId}/payslips/${payslipId}/response`,
          {},
          {
              headers: {
                  Authorization: token,
              },
              params: {
                'message-id': messageId,
                accept: accept
              }
          }
        );
    } catch (err) {
        console.error(err);
        handleAxiosError(err);
    }
}
