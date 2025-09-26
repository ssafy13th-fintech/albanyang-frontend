import { api, handleResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

{/* 직원용 급여명세서 리스트 조회 */}
export interface PayslipSummary {
  payslipId: number;
  staffName: string;
  staffNickName: string;
  storeName: string;
  payDate: string;
  status: string;
}


export async function getStaffPayslips(storeId: string, year: string): Promise<PayslipSummary[]> {
  const token = await loadToken();

  console.log(token);
  console.log(storeId);
  console.log(year);
  return handleResponse<{ payslips: PayslipSummary[] }>(
    api.get(`/v1/stores/${storeId}/payslips/me`, {
      headers: {
        Authorization: token
      },
      params: {
        year: year,
      },
    })
  ).then(res => res.payslips);
}