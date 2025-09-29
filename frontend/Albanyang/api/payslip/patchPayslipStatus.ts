import { AxiosError } from "axios";
import { ApiResponse } from "../api";
import { api } from "../authorization/AuthHeader";
import { loadToken } from "../authorization/AuthTokenStorage";


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

export async function patchPayslipStatus(storeId: number, payslipId: number) {
    try {
      console.log('상태 변경 요청');
      console.log(storeId, payslipId);
      await api.get<ApiResponse<void>>(
        `/v1/stores/${storeId}/payslips/${payslipId}/confirm`
        
      );
      console.log('상태 변경 완료');
        
    } catch (err) {
        handleAxiosError(err);
    }
}
