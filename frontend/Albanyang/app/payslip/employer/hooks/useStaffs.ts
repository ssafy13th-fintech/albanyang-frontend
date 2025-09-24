import { useState, useEffect } from "react";
import { getStaffs, Staff } from "@/api/staff/getStaffs";

export const staffs = (storeId: string | null) => {
  const [employees, setEmployees] = useState<Staff[]>([{ id: 0, name: "전체", nickname: "전체", status: "ALL" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const employeeList = await getStaffs(storeId);
        setEmployees([{ id: 0, name: "전체", nickname: "전체", status: "ALL" }, ...employeeList]);
      } catch (err: any) {
        console.error("직원 조회 오류: ", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [storeId]);

  return { employees, loading, error };
};
