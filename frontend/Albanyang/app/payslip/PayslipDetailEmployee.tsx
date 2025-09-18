import { colors as COLORS } from '@/constants/colors/ColorTheme';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTS } from '../../constants/fonts/Fonts';

interface PayslipDetailData {
    period: string;
    payDate: string;
    totalAmount: number;
    allowanceItems: {
        basicSalary: number;
        weeklyHolidayAllowance: number;
    };
    deductionItems: {
        fourMajorInsurance: number;
        nationalPension: number;
        healthInsurance: number;
        longTermCare: number;
        employmentInsurance: number;
    };
}

const PayslipDetailEmployee = () => {
    const params = useLocalSearchParams();
    const { payslipId, storeId, month, year, employeeName } = params;

    const [payslipData, setPayslipData] = useState<PayslipDetailData | null>(null);

    // URL 파라미터를 사용해서 동적 데이터 생성
    useEffect(() => {
        const sampleData: PayslipDetailData = {
            period: `${year}.${month?.toString().padStart(2, '0')}.01 ~ ${month?.toString().padStart(2, '0')}.30 급여명세서`,
            payDate: "06.10 (목)",
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
    }, [payslipId, storeId, month, year, employeeName]);

    const handleBackPress = () => {
        console.log('뒤로가기');
        router.back();
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

            {/* 기간 정보만 (직원명, 입금계좌 제거) */}
            <View style={styles.periodSection}>
                <Text style={styles.periodText}>{payslipData.period}</Text>
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
        paddingHorizontal: 16,
        backgroundColor: '#FFF'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 30,
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
    periodSection: { marginBottom: 24, marginHorizontal: 24 },
    periodText: {
        fontSize: 15,
        marginBottom: 8,
        fontFamily: FONTS.jamsil.thin1
    },
    totalSection: {
        marginBottom: 24,
        marginHorizontal: 24
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
    section: { marginBottom: 24, marginHorizontal: 24 },
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
});

export default PayslipDetailEmployee;