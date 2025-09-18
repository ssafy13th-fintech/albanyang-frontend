
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import PayslipHeader from './components/PayslipHeader';
import PayslipListItem from './components/PayslipListItem';
import PayslipTabBar from './components/PayslipTabBar';
import PayslipYearSelector from './components/PayslipYearSelector';

const PayslipListEmployee = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    interface PayslipData {
        month: number;
        year: number;
        payDate: string;
        employeeName: string;
        employeeNickname: string;
    }
    const [filteredPayslips, setFilteredPayslips] = useState<PayslipData[]>([]);

    // 가게별로 급여명세서 데이터 분리
    const payslipDataByStore: { [key: number]: PayslipData[] } = {
        0: [ // 메가MGC커피 데이터
            { month: 12, year: 2025, payDate: '2025.12.31', employeeName: '홍길동', employeeNickname: '바리스타' },
            { month: 11, year: 2025, payDate: '2025.11.30', employeeName: '홍길동', employeeNickname: '바리스타' },
        ],
        1: [ // 바나프레소 데이터  
            { month: 10, year: 2025, payDate: '2025.10.31', employeeName: '홍길동', employeeNickname: '매니저' },
        ],
        2: [ // 텐퍼센트커피 데이터
            { month: 9, year: 2025, payDate: '2025.09.30', employeeName: '홍길동', employeeNickname: '신입' },
        ]
    };


    //가게 더미 데이터
    const storeTabs = ['메가MGC커피 역삼GFC점', '바나프레소 테헤란로점', '텐퍼센트커피 역삼역점'];

    useEffect(() => {
        const storeData = payslipDataByStore[activeTab] || [];
        const filtered = storeData.filter((item: PayslipData) => item.year === selectedYear);
        setFilteredPayslips(filtered);
    }, [selectedYear, activeTab]);

    const handlePayslipPress = (month: number, year: number, employeeName: string, employeeNickname: string) => {
        console.log(`${year}년 ${month}월 급여명세서 클릭`);

        // 직원용 상세 페이지로 이동
        router.push({
            pathname: '/payslip/PayslipDetailEmployee',
            params: {
                month: month.toString(),
                year: year.toString(),
                employeeName,
                payslipId: `${year}-${month}-${employeeName}`,
                storeId: 'store1',
            }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <PayslipHeader />
            <PayslipTabBar
                tabs={storeTabs}
                activeTab={activeTab}
                onTabPress={setActiveTab}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, justifyContent: 'space-between' }}>
                <PayslipYearSelector
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                />
            </View>
            <ScrollView style={styles.listContainer}>
                {filteredPayslips.map((item, index) => (
                    <PayslipListItem
                        key={`${item.year}-${item.month}-${index}`}
                        month={item.month}
                        year={item.year}
                        payDate={item.payDate}
                        employeeName={item.employeeName}
                        employeeNickname={item.employeeNickname}
                        showEmployeeInfo={false}
                        onPress={() => handlePayslipPress(item.month, item.year, item.employeeName, item.employeeNickname)}
                    />
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        backgroundColor: '#FFF'
    },
    listContainer: {
        flex: 1,
        paddingVertical: 8,
    },
});

export default PayslipListEmployee;