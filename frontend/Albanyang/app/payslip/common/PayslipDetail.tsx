import { colors as COLORS } from '@/constants/colors/ColorTheme';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTS } from '@/constants/fonts/Fonts';
import { usePayslipDetail } from './hooks/usePayslipDetail';
import PayslipDetailModal from './components/PayslipDetailComponent';
import BackHeader from '@/components/header/BackHeader';

const PayslipDetail = () => {
  const params = useLocalSearchParams();
  const { payslipId, storeId } = params;

  const { data: payslipData, loading, error } = usePayslipDetail({
    payslipId: Number(payslipId),
    storeId: Number(storeId),
  });



  if (loading) return <Text>로딩중...</Text>;
  if (error) return <Text>데이터 불러오기 실패</Text>;
  if (!payslipData) return <Text>데이터 없음</Text>;



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <BackHeader headerText='세부내역'/>
      <PayslipDetailModal payslip={payslipData} />
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

export default PayslipDetail;
