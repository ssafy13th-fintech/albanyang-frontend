import { useEffect, useState } from "react";
import { getStaffPayslips, PayslipSummary } from "@/api/payslip/getStaffPayslips";

export const staffPayslips = (storeId: string | null, year: number) => {
  const [allPayslips, setAllPayslips] = useState<PayslipSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const fetchPayslips = async () => {
      setLoading(true);
      setError(null);
      try {
        const payslipList = await getStaffPayslips(storeId, year);
        setAllPayslips(payslipList);
      } catch (err: any) {
        console.error("급여명세서 조회 오류: ", err);
        setError(err.message ?? "급여명세서를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [storeId, year]);

  return { allPayslips, loading, error };
};
