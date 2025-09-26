import { api, handleResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface PayslipSummary {
  payslipId: number;
  staffName: string;
  staffNickName: string;
  storeName: string;
  payDate: string;
  status: string;
}


export async function getOwnerPayslips(storeId: string, year: number, month: number): Promise<PayslipSummary[]> {
  const displayMonth = month < 10 ? `0${month}` : `${month}`;
  const display = `${year}-${displayMonth}`;
  const token = await loadToken();

  return handleResponse<{ payslips: PayslipSummary[] }>(
    api.get(`/v1/stores/${storeId}/payslips?month=${display}`, {
      headers: {
        Authorization: token
      }
    })
  ).then(res => res.payslips);
}
