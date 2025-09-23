import axios, { AxiosError, AxiosInstance } from 'axios';

// Axios 인스턴스 (공통 사용)
const api: AxiosInstance = axios.create({
  baseURL: 'https://your-api-domain.com',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 공통 응답 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

export interface PayslipSummary {
  payslipId: number;
  staffName: string;
  staffNickName: string;
  storeName: string;
  payDate: string;
  status: string;
}

export interface PayslipListResponse {
  payslips: PayslipSummary[];
}

// 에러 처리 유틸
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

// POST /api/v1/store/{store-id}/payslips/{payslip-id}/response
export async function respondPayslip(storeId: number, payslipId: number, accept: boolean) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (payslipId === undefined || payslipId === null) throw new Error('payslipId (required)');
  if (accept === undefined || accept === null) throw new Error('accept (required)');
  try {
    const res = await api.post<ApiResponse<string>>(
      `/api/v1/store/${storeId}/payslips/${payslipId}/response`,
      null,
      { params: { accept } }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /api/v1/store/{store-id}/payslips/me?year=YYYY
export async function getMyPayslips(storeId: number, year: string) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (!year) throw new Error('year (required)');
  try {
    const res = await api.get<ApiResponse<PayslipListResponse>>(
      `/api/v1/store/${storeId}/payslips/me`,
      { params: { year } }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export default {
  api,
  respondPayslip,
  getMyPayslips,
};
