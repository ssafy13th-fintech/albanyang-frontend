import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { PayslipDetailData } from "@/api/payslip/getPayslipDetail";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";

interface PayslipDetailComponentProps {
  payslip: PayslipDetailData | null;
}

const formatPayDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return `${year}.${month}.${day} (${weekday})`;
};

const calculateTotal = (items: Record<string, number>) => {
  return Object.values(items).reduce((sum, value) => sum + value, 0);
};

const PayslipDetailComponent = ({ payslip }: PayslipDetailComponentProps) => {
  if (!payslip) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {/* 총 지급액 */}
        <Text style={styles.totalAmount}>
          {payslip.payslipDetails.totalSalary.toLocaleString()}원
        </Text>

        {/* 기간 및 기본 정보 */}
        <View style={styles.infoRow}>
          <Text style={styles.infoValue}>
            {payslip.employeeDetails.name}
          </Text>
          <Text style={styles.infoValue}>
            {formatPayDate(payslip.payslipDetails.payDate)}
          </Text>
        </View>
      </View>

      {/* 지급 항목 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>지급 합계</Text>
          <Text style={styles.sectionTotal}>
            {calculateTotal(payslip.salaryDetails).toLocaleString()}원
          </Text>
        </View>
        <View style={styles.itemsList}>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>기본급</Text>
            <Text style={styles.itemValue}>
              {payslip.salaryDetails.baseSalary.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>주휴수당</Text>
            <Text style={styles.itemValue}>
              {payslip.salaryDetails.weeklyHolidayPay.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>연장수당</Text>
            <Text style={styles.itemValue}>
              {payslip.salaryDetails.overtimePay.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>야간수당</Text>
            <Text style={styles.itemValue}>
              {payslip.salaryDetails.nightShiftPay.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>상여금</Text>
            <Text style={styles.itemValue}>
              {payslip.salaryDetails.bonus.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>기타수당</Text>
            <Text style={styles.itemValue}>
              {payslip.salaryDetails.otherSalary.toLocaleString()}원
            </Text>
          </View>
        </View>
      </View>

      {/* 공제 항목 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>공제 합계</Text>
          <Text style={styles.sectionTotal}>
            {calculateTotal(payslip.deductionDetails).toLocaleString()}원
          </Text>
        </View>
        <View style={styles.itemsList}>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>고용보험</Text>
            <Text style={styles.itemValue}>
              {payslip.deductionDetails.employmentInsurance.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>건강보험</Text>
            <Text style={styles.itemValue}>
              {payslip.deductionDetails.healthInsurance.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>국민연금</Text>
            <Text style={styles.itemValue}>
              {payslip.deductionDetails.nationalPension.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>소득세</Text>
            <Text style={styles.itemValue}>
              {payslip.deductionDetails.businessIncomeTax.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>기타공제</Text>
            <Text style={styles.itemValue}>
              {payslip.deductionDetails.otherDeductions.toLocaleString()}원
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default PayslipDetailComponent;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  infoRow: { flexDirection: "column", alignItems: "flex-end" },
  infoValue: {
    fontSize: 15,
    fontFamily: FONTS.jamsil.thin1,
  },
  totalAmount: {
    fontSize: 36,
    marginBottom: 4,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.accent,
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.jamsil.regular3 },
  sectionTotal: { fontSize: 18, fontFamily: FONTS.jamsil.regular3 },
  itemsList: { paddingLeft: 8 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  itemLabel: {
    fontSize: 14,
    fontFamily: FONTS.jamsil.thin1,
    color: colors.text.secondary,
  },
  itemValue: { fontSize: 14, fontFamily: FONTS.jamsil.thin1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
  },
});
