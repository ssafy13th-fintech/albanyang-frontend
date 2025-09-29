import { AxiosError } from 'axios';
import { api } from './authorization/AuthHeader';


// Axios 인스턴스 (프로젝트 전체에서 동일하게 설정하세요)
// const api: AxiosInstance = axios.create({
//   baseURL: 'https://your-api-domain.com',
//   timeout: 10000,
//   headers: { 'Content-Type': 'application/json' },
// });

// 공통 응답 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

// 타입 정의
export interface PayslipSummary {
  payslipId: number;
  staffName: string;
  staffNickName: string;
  storeName: string;
  payDate: string; // YYYY-MM-DD
  status: string;
  netSalary: number;
}

export interface PayslipListResponse {
  payslips: PayslipSummary[];
}

export interface PayslipUpdateRequest {
  payDate: string;
  baseSalary: number;
  weeklyHolidayPay: number;
  overtimePay: number;
  nightShiftPay: number;
  bouns: number; // note: provided as "bouns" in spec
  otherSalary: number;
  employmentInsurance: number;
  healthInsurance: number;
  nationalPension: number;
  businessIncomeTax: number;
  otherDeduction: number;
}

export interface GeneratedPayslipResponse {
  id: number;
  employeeDetails: {
    name: string;
    phone: string;
  };
  payslipDetails: {
    payDate: string;
    totalSalary: number;
    totalDeduction: number;
    netSalary: number;
  };
  salaryDetails: {
    baseSalary: number;
    weeklyHolidayPay: number;
    overtimePay: number;
    nighShiftPay: number;
    bonus: number;
    otherSalary: number;
  };
  deductionDetails: {
    employmentInsurance: number;
    healthInsurance: number;
    nationalPension: number;
    businessIncomeTax: number;
    otherDeductions: number;
  };
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

// PUT /api/v1/stores/{store-id}/payslips/{payslip-id}
export async function updatePayslip(
  storeId: number,
  payslipId: number,
  body: PayslipUpdateRequest
) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (payslipId === undefined || payslipId === null) throw new Error('payslipId (required)');
  try {
    const res = await api.put<ApiResponse<string>>(
      `/v1/stores/${storeId}/payslips/${payslipId}`,
      body
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// POST /api/v1/stores/{store-id}/payslips/{payslip-id} (전송)
export async function sendPayslip(storeId: number, payslipId: number, staffId: number) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (payslipId === undefined || payslipId === null) throw new Error('payslipId (required)');
  if (staffId === undefined || staffId === null) throw new Error('staffId (required)');
  try {
    // staffId은 쿼리 파라미터로 전달
    const res = await api.post<ApiResponse<string>>(
      `/v1/stores/${storeId}/payslips/${payslipId}`,
      null,
      { params: { staffId } }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// DELETE /api/v1/stores/{store-id}/payslips/{payslip-id}
export async function deletePayslip(storeId: number, payslipId: number) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (payslipId === undefined || payslipId === null) throw new Error('payslipId (required)');
  try {
    const res = await api.delete<ApiResponse<string>>(
      `/v1/stores/${storeId}/payslips/${payslipId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /api/v1/stores/{store-id}/payslips?month=YYYY-MM
export async function getPayslipsByMonth(storeId: number, month?: string) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  try {
    const res = await api.get<ApiResponse<PayslipListResponse>>(
      `/v1/stores/${storeId}/payslips`,
      { params: month ? { month } : {} }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// PUT /api/v1/stores/{store-id}/payslips (자동 생성)
// params: staffId (required), month (optional), payslipId (optional)
export async function generatePayslip(params: { storeId: number; staffId: number; month?: string; payslipId?: number; }) {
  const { storeId, staffId, month, payslipId } = params;
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (staffId === undefined || staffId === null) throw new Error('staffId (required)');
  try {
    const query: any = { staffId };
    if (month) query.month = month;
    if (payslipId !== undefined && payslipId !== null) query.payslipId = payslipId;
    const res = await api.post<ApiResponse<GeneratedPayslipResponse>>(
      `/v1/stores/${storeId}/payslips`,
      null,
      { params: query }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /api/v1/stores/{store-id}/payslips/staffs/{staff-id}?year=YYYY
export async function getPayslipsByStaff(storeId: number, staffId: number, year: string) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (staffId === undefined || staffId === null) throw new Error('staffId (required)');
  if (!year) throw new Error('year (required)');
  try {
    const res = await api.get<ApiResponse<PayslipListResponse>>(
      `/v1/stores/${storeId}/payslips/staffs/${staffId}`,
      { params: { year } }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export default {
  api,
  updatePayslip,
  sendPayslip,
  deletePayslip,
  getPayslipsByMonth,
  generatePayslip,
  getPayslipsByStaff,
};
