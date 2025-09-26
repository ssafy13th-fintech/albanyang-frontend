import { api, handleResponse } from "../api";

{/* 직원용 급여명세서 리스트 조회 */}
export interface PayslipSummary {
  payslipId: number;
  staffName: string;
  staffNickName: string;
  storeName: string;
  payDate: string;
  status: string;
}


export async function getStaffPayslips(storeId: string, year: number): Promise<PayslipSummary[]> {
  return handleResponse<{ payslips: PayslipSummary[] }>(
    api.get(`/v1/stores/${storeId}/payslips/me?year=${year}`)
  ).then(res => res.payslips);
}