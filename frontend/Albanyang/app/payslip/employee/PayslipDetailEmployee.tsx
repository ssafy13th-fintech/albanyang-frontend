import { colors as COLORS } from '@/constants/colors/ColorTheme';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTS } from '@/constants/fonts/Fonts';
import { payslipDetail } from '../common/hooks/usePayslipDetail';
import BackHeader from '@/components/header/BackHeader';

const PayslipDetailOwner = () => {
  const params = useLocalSearchParams();
  const { payslipId, storeId } = params;

  const { data: payslipData, loading, error } = payslipDetail({
    payslipId: Number(payslipId),
    storeId: Number(storeId),
  });

  
  const formatPayDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}.${month}.${day} (${weekday})`;
  }; 

  if (loading) return <Text>로딩중...</Text>;
  if (error) return <Text>데이터 불러오기 실패</Text>;
  if (!payslipData) return <Text>데이터 없음</Text>;

  const calculateTotal = (items: Record<string, number>) => {
    return Object.values(items).reduce((sum, value) => sum + value, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <BackHeader headerText='세부내역'/>

      <View style={styles.headerRow}>

        {/* 총 지급액 */}
        <Text style={styles.totalAmount}>
          {payslipData.payslipDetails.totalSalary.toLocaleString()}원
        </Text>
        
        {/* 기간 및 기본 정보 */}
        <View style={styles.infoRow}>
          <Text style={styles.infoValue}>{payslipData.employeeDetails.name}</Text> 
          <Text style={styles.infoValue}>{formatPayDate(payslipData.payslipDetails.payDate)}</Text>
        </View>
      </View>
      

      {/* 지급 항목 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>지급 합계</Text>
          <Text style={styles.sectionTotal}>
            {calculateTotal(payslipData.salaryDetails).toLocaleString()}원
          </Text>
        </View>
        <View style={styles.itemsList}>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>기본급</Text>
            <Text style={styles.itemValue}>
              {payslipData.salaryDetails.baseSalary.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>주휴수당</Text>
            <Text style={styles.itemValue}>
              {payslipData.salaryDetails.weeklyHolidayPay.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>연장수당</Text>
            <Text style={styles.itemValue}>
              {payslipData.salaryDetails.overtimePay.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>야간수당</Text>
            <Text style={styles.itemValue}>
              {payslipData.salaryDetails.nightShiftPay.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>상여금</Text>
            <Text style={styles.itemValue}>
              {payslipData.salaryDetails.bonus.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>기타수당</Text>
            <Text style={styles.itemValue}>
              {payslipData.salaryDetails.otherSalary.toLocaleString()}원
            </Text>
          </View>
        </View>
      </View>

      {/* 공제 항목 */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>공제 합계</Text>
          <Text style={styles.sectionTotal}>
            {calculateTotal(payslipData.deductionDetails).toLocaleString()}원
          </Text>
        </View>
        <View style={styles.itemsList}>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>고용보험</Text>
            <Text style={styles.itemValue}>
              {payslipData.deductionDetails.employmentInsurance.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>건강보험</Text>
            <Text style={styles.itemValue}>
              {payslipData.deductionDetails.healthInsurance.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>국민연금</Text>
            <Text style={styles.itemValue}>
              {payslipData.deductionDetails.nationalPension.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>소득세</Text>
            <Text style={styles.itemValue}>
              {payslipData.deductionDetails.businessIncomeTax.toLocaleString()}원
            </Text>
          </View>
          <View style={styles.item}>
            <Text style={styles.itemLabel}>기타공제</Text>
            <Text style={styles.itemValue}>
              {payslipData.deductionDetails.otherDeductions.toLocaleString()}원
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 8, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, backgroundColor: 'red' },
  
  
  
  
  
  infoRow: { flexDirection: 'column', alignItems: 'flex-end' },
  infoValue: { fontSize: 15, fontFamily: FONTS.jamsil.thin1  },
  totalSection: { marginBottom: 24, marginHorizontal: 24 },
  totalAmount: { fontSize: 36, marginBottom: 4, fontFamily: FONTS.jamsil.regular3, color: COLORS.accent },
  totalLabel: { fontSize: 15, fontFamily: FONTS.jamsil.thin1 },
  section: { marginBottom: 24, marginHorizontal: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontFamily: FONTS.jamsil.regular3 },
  sectionTotal: { fontSize: 18, fontFamily: FONTS.jamsil.regular3 },
  itemsList: { paddingLeft: 8 },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
  itemLabel: { fontSize: 14, fontFamily: FONTS.jamsil.thin1, color: COLORS.text.secondary },
  itemValue: { fontSize: 14, fontFamily: FONTS.jamsil.thin1 },

  headerRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginHorizontal: 24, marginBottom: 24},
});

export default PayslipDetailOwner;
