import { useEffect, useState } from "react";
import { PayslipDetailData, getPayslipDetail } from "@/api/payslip/getPayslipDetail";

interface PayslipDetailProps {
  payslipId: number;
  storeId: number;
}

export const usePayslipDetail = ({ payslipId, storeId }: PayslipDetailProps) => {
  const [data, setData] = useState<PayslipDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!payslipId || !storeId) return;

    const fetchPayslipDetail = async () => {
      setLoading(true);
      try {
        const responseData = await getPayslipDetail(storeId, payslipId);
        setData(responseData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslipDetail();
  }, [payslipId, storeId]);

  return { data, loading, error };
};
