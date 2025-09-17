import { colors as COLORS } from '@/constants/colors/ColorTheme';
import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { FONTS } from '../../constants/fonts/Fonts';


// interface Employee {
//     name: string;
//     accountNumber: number;
// }

// interface Payslip {
//     payDate: string;
//     totalSalary: number;
//     totalDeductions: number;
//     netSalary: number;
// }

interface PayslipDetailData {
  employeeName: string;
  accountNumber: string;
  period: string;
  payDate: string;
  totalAmount: number;
  allowanceItems: {
    basicSalary: number;
    weeklyHolidayAllowance: number;
  };
  deductionItems: {
    fourMajorInsurance: number;
    nationalPension: number; //국민연금
    healthInsurance: number; //건강보험
    longTermCare: number; //장기보험
    employmentInsurance: number; //산재보험
  };
}

interface Props {
  payslipId: number;
  storeId: string;
}

const PayslipDetailOwner = ({ payslipId, storeId }: Props) => {
  const [payslipData, setPayslipData] = useState<PayslipDetailData | null>(null);


  // 더미 데이터
  useEffect(() => {
    const sampleData: PayslipDetailData = {
      employeeName: "홍길동",
      accountNumber: "우리 1002-123-123456",
      period: "25.06.01 ~ 06.30 급여명세서",
      payDate: "07.10 (목)",
      totalAmount: 310000,
      allowanceItems: {
        basicSalary: 310000,
        weeklyHolidayAllowance: 0,
      },
      deductionItems: {
        fourMajorInsurance: 0,
        nationalPension: 0,
        healthInsurance: 0,
        longTermCare: 0,
        employmentInsurance: 0,
      }
    };
    setPayslipData(sampleData);
  }, [payslipId, storeId]);

  const handleEditAllowance = () => {
    console.log('수정');
  }

  const handleBackPress = () => {
    console.log('뒤로가기');
  }

  if (!payslipData) {
    return <Text>로딩중...</Text>
  }

  const calculateTotal = (items: Record<string, number>) => {
    return Object.values(items).reduce((sum, value) => sum + value, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>상세 내역</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 기간 및 기본 정보 */}
      <View style={styles.periodSection}>
        <Text style={styles.periodText}>{payslipData.period}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>직원명</Text>
          <Text style={styles.infoValue}>{payslipData.employeeName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>입금계좌</Text>
          <Text style={styles.infoValue}>{payslipData.accountNumber}</Text>
        </View>
      </View>

      {/* 총 지급액 */}
      <View style={styles.totalSection}>
        <Text style={styles.totalAmount}>{payslipData.totalAmount.toLocaleString()}원</Text>
        <Text style={styles.totalLabel}>급여 지급일 {payslipData.payDate}</Text>
      </View>

      {/* 지급 항목 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>지급 합계</Text>
          <Text style={styles.sectionTotal}>
            {calculateTotal(payslipData.allowanceItems).toLocaleString()}원
          </Text>
        </View>

        <View style={styles.itemsList}>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>근무 수당</Text>
            <Text style={styles.itemValue}>
              {payslipData.allowanceItems.basicSalary.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemLabel}>주휴 수당</Text>
            <Text style={styles.itemValue}>
              {payslipData.allowanceItems.weeklyHolidayAllowance.toLocaleString()}원
            </Text>
          </View>
        </View>
      </View>

      {/* 공제 항목 */} 
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>공제 합계</Text>
          <Text style={styles.sectionTotal}>
            {calculateTotal(payslipData.deductionItems).toLocaleString()}원
          </Text>
        </View>

        <View style={styles.itemsList}>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>4대보험</Text>
            <Text style={styles.itemValue}>
              {payslipData.deductionItems.fourMajorInsurance.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemLabel}>국민연금</Text>
            <Text style={styles.itemValue}>
              {payslipData.deductionItems.nationalPension.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemLabel}>건강보험</Text>
            <Text style={styles.itemValue}>
              {payslipData.deductionItems.healthInsurance.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemLabel}>장기보험</Text>
            <Text style={styles.itemValue}>
              {payslipData.deductionItems.longTermCare.toLocaleString()}원
            </Text>
          </View>

          <View style={styles.item}>
            <Text style={styles.itemLabel}>산재보험</Text>
            <Text style={styles.itemValue}>
              {payslipData.deductionItems.employmentInsurance.toLocaleString()}원
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    paddingHorizontal: 16
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 32,
  },
  backIcon: { 
    fontSize: 18,
    fontFamily: FONTS.jamsil.thin1
  },
  headerTitle: { 
    fontSize: 24,
    fontFamily: FONTS.jamsil.thin1,
  },
  headerSpacer: { width: 18 },
  content: { flex: 1, padding: 16 },
  periodSection: { marginBottom: 24 },
  periodText: { 
    fontSize: 15, 
    marginBottom: 8,
    fontFamily: FONTS.jamsil.thin1
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: { 
    fontSize: 15,
    fontFamily: FONTS.jamsil.thin1
  },
  infoValue: { 
    fontSize: 15,
    fontFamily: FONTS.jamsil.thin1
  },
  totalSection: {
    marginBottom: 24,
  },
  totalAmount: {
    fontSize: 36,
    marginBottom: 4,
    fontFamily: FONTS.jamsil.thin1,
    color: COLORS.accent,
  },
  totalLabel: { 
    fontSize: 15,
    fontFamily: FONTS.jamsil.thin1
  },
  section: { marginBottom: 24 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.jamsil.thin1
  },
  sectionTotal: {
    fontSize: 18,
    fontFamily: FONTS.jamsil.thin1
  },
  itemsList: { paddingLeft: 8 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemLabel: { 
    fontSize: 14,
    fontFamily: FONTS.jamsil.thin1
  },
  itemValue: { 
    fontSize: 14,
    fontFamily: FONTS.jamsil.thin1
  },
  editButtonContainer: {
    marginTop: 8,
  },
  editButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editButtonText: { 
    fontSize: 14,
    fontFamily: FONTS.jamsil.thin1
  },
});

export default PayslipDetailOwner;


