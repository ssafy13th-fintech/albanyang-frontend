import { api, handleResponse } from "../Api";

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

  return handleResponse<{ payslips: PayslipSummary[] }>(
    api.get(`/v1/stores/${storeId}/payslips?month=${display}`)
  ).then(res => res.payslips);
}
