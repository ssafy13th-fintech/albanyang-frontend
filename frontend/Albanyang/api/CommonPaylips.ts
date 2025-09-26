import { AxiosError } from 'axios';
import { api } from './authorization/AuthHeader';


// Axios 인스턴스
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

// 단일 명세서 타입 정의
export interface PayslipDetails {
  payDate: string;
  totalSalary: number;
  totalDeduction: number;
  netSalary: number;
}

export interface SalaryDetails {
  baseSalary: number;
  weeklyHolidayPay: number;
  overtimePay: number;
  nighShiftPay: number;
  bonus: number;
  otherSalary: number;
}

export interface DeductionDetails {
  employmentInsurance: number;
  healthInsurance: number;
  nationalPension: number;
  businessIncomeTax: number;
  otherDeductions: number;
}

export interface EmployeeDetails {
  name: string;
  phone: string;
}

export interface CommonPayslipResponse {
  id: number;
  employeeDetails: EmployeeDetails;
  payslipDetails: PayslipDetails;
  salaryDetails: SalaryDetails;
  deductionDetails: DeductionDetails;
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

// GET /api/v1/stores/{store-id}/payslips/{payslip-id}
export async function getCommonPayslip(storeId: number, payslipId: number) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (payslipId === undefined || payslipId === null) throw new Error('payslipId (required)');

  try {
    const res = await api.get<ApiResponse<CommonPayslipResponse>>(
      `/v1/stores/${storeId}/payslips/${payslipId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export default {
  api,
  getCommonPayslip,
};
