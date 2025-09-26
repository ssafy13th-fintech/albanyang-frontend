// src/services/payslipService.ts
import { api, handleResponse } from "../api";
import { loadToken } from "../authorization/AuthTokenStorage";

export interface PayslipDetailData {
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
    nightShiftPay: number;
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

export async function getPayslipDetail(storeId: number, payslipId: number): Promise<PayslipDetailData> {
  const token = await loadToken();
  return handleResponse<PayslipDetailData>(
    api.get(`/v1/stores/${storeId}/payslips/${payslipId}`, {
      headers: {
        Authorization: token
      }
    })
  );
}
