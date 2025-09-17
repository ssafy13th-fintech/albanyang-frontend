import { useState } from "react";

interface PayrollItem{
  id: string,
  year: number,
  month: number,
  payDate: string,
}

const PayrollListScreen = () => {
  const [selectedYear, setSelectedYear ] = useState<number>(new Date().getFullYear());

  const payrollData: PayrollItem[] = [
    {
      id: '1',
      month: 12,
      year: 2025,
      payDate: '2025-12-31',
    },
    {
      id: '2',
      month: 11,
      year: 2025,
      payDate: '2025-12-31',
    }
  ];
  
}