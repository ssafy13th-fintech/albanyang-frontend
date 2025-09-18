import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import EmployeeDropdown from './components/PayslipEmployeeSelector';
import PayslipHeader from './components/PayslipHeader';
import PayslipListItem from './components/PayslipListItem';
import PayslipTabBar from './components/PayslipTabBar';
import PayslipYearSelector from './components/PayslipYearSelector';

const PayslipListOwner = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedEmployee, setSelectedEmployee] = useState('전체');
  const [filteredPayslips, setFilteredPayslips] = useState<any[]>([]);

  // 직원 목록 추가
  const employees = [
    { id: 'all', name: '전체' },
    { id: 'hong', name: '홍길동' },
    { id: 'kim', name: '김철수' },
    { id: 'lee', name: '이영희' },
    { id: 'park', name: '박민수' },
    { id: 'choi', name: '최지은' },
    { id: 'jung', name: '정태현' },
  ];

  //가게 더미 데이터
  const storeTabs = ['메가MGC커피 역삼GFC점', '바나프레소 테헤란로점', '텐퍼센트커피 역삼역점'];

  // 전체 급여명세서 더미 데이터 (여러 년도)
  const allPayslipData = [
    // 2025년 데이터
    { month: 12, year: 2025, payDate: '2025.12.31', employeeName: '홍길동', employeeNickname: '바리스타' },
    { month: 11, year: 2025, payDate: '2025.11.30', employeeName: '김철수', employeeNickname: '매니저' },
    { month: 10, year: 2025, payDate: '2025.10.31', employeeName: '이영희', employeeNickname: '신입' },

    // 2024년 데이터
    { month: 12, year: 2024, payDate: '2024.12.31', employeeName: '박민수', employeeNickname: '팀장' },
    { month: 11, year: 2024, payDate: '2024.11.30', employeeName: '최지은', employeeNickname: '알바' },

    // 2023년 데이터
    { month: 12, year: 2023, payDate: '2023.12.31', employeeName: '정태현', employeeNickname: '매니저' },
  ];

  // 직원 및 연도 필터링
  useEffect(() => {
    let filtered = allPayslipData.filter(item => item.year === selectedYear);

    if (selectedEmployee !== '전체') {
      filtered = filtered.filter(item => item.employeeName === selectedEmployee);
    }

    setFilteredPayslips(filtered);
  }, [selectedYear, selectedEmployee]);

  const handleEmployeeSelect = (employee: any) => {
    setSelectedEmployee(employee.name);
  };

  const handlePayslipPress = (month: number, year: number, employeeName: string, employeeNinkname: string) => {
    console.log(`${year}년 ${month}월 급여명세서 클릭`);

    //상세 페이지로 이동
    router.push({
      pathname: '/payslip/PayslipDetailOwner',
      params: {
        month: month.toString(),
        year: year.toString(),
        employeeName,
        payslipId: `${year}-${month}-${employeeName}`,
        storeId: 'store1',
      }
    });
  }

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
        <EmployeeDropdown
          employees={employees}
          selectedEmployee={selectedEmployee}
          onSelect={handleEmployeeSelect}
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

export default PayslipListOwner;