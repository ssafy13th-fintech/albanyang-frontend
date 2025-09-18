import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors as COLORS } from '../../../constants/Colors/ColorTheme';
import { FONTS } from '../../../constants/fonts/Fonts';

interface Props {
  month: number;
  year: number;
  payDate: string;
  employeeName?: string;
  employeeNickname?: string;
  onPress: () => void;
  showEmployeeInfo?: boolean; // 직원 정보 표시 여부
}

const PayslipListItem = ({
  month,
  year,
  payDate,
  employeeName,
  employeeNickname,
  showEmployeeInfo = true,
  onPress
}: Props) => {
  // 제목 생성 (사장용/알바생용 구분)
  const title = showEmployeeInfo && employeeName && employeeNickname
    ? `${month}월 급여명세서(${employeeName}/${employeeNickname})`
    : `${month}월 급여명세서`; // 직원용은 월만 표시

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.payDate}>{payDate} 지급일</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 4,
    marginHorizontal: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontFamily: FONTS.jamsil.light2,
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  payDate: {
    fontSize: 12,
    fontFamily: FONTS.jamsil.thin1,
    color: COLORS.text.secondary,
  },
});

export default PayslipListItem;