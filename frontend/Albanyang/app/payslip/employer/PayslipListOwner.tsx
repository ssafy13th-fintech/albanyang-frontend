import Header from '@/components/header/Header';
import NavBar from '@/components/navBar/NavBar';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View, Text, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PayslipListItem from '../common/components/PayslipListItem';
import PayslipTabBar from '../common/components/PayslipTabBar';
import YearAndMonthSelector from '../common/components/YearAndMonthSelector';
import EmployeeDropdown from './components/PayslipEmployeeSelector';
import { ownerPayslips } from './hooks/useOwnerPayslips';
import { ownerStores } from './hooks/useOwnerStores';
import { getRoleFromToken } from '@/api/authorization/AuthTokenStorage';

const PayslipListOwner = () => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedEmployee, setSelectedEmployee] = useState('전체');
  const [filteredPayslips, setFilteredPayslips] = useState<any[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const { stores, loading: storesLoading, error: storesError } = ownerStores();
  const { allPayslips, loading: payslipLoading, error: payslipError } = ownerPayslips(activeStoreId, selectedYear, selectedMonth);

  useEffect(() => {
    const checkRole = async () => {
      const role = await getRoleFromToken();
      if (role == "EMPLOYEE") {
        Alert.alert("권한 없음", "직원 계정은 이 페이지에 접근할 수 없습니다.",
           [{ text: "확인", onPress: () => router.back() }]);
      }
    };
    checkRole();
  }, []);

  useEffect(() => {
    if (stores.length > 0 && !activeStoreId) {
      setActiveStoreId(stores[0].id);
    }
  }, [stores, activeStoreId]);

  useEffect(() => setSelectedEmployee("전체"), [activeStoreId]);

  useEffect(() => {
    let filtered = allPayslips;
    if (selectedEmployee !== '전체') {
      filtered = filtered.filter(item => item.staffName === selectedEmployee);
    }
    setFilteredPayslips(filtered);
  }, [allPayslips, selectedEmployee]);

  const handleEmployeeSelect = (employee: any) => setSelectedEmployee(employee.name);
  const handlePayslipPress = (payslipId: number, storeId: number) => {
    router.push({ pathname: '/payslip/common/PayslipDetail', params: { payslipId, storeId } });
  };

  if (storesLoading || payslipLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text style={styles.loadingText}>급여명세서를 불러오는 중입니다...</Text>
      </SafeAreaView>
    );
  }

  if (storesError || payslipError) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>데이터 불러오기 실패</Text>
      </SafeAreaView>
    );
  }

  if (stores.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.emptyText}>사업장 생성하러 가기</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header headerText='급여명세서 목록' />

      <PayslipTabBar
        tabs={stores.map(store => store.name)}
        activeTab={stores.findIndex(store => store.id === activeStoreId)}
        onTabPress={(index) => setActiveStoreId(stores[index].id)}
      />

      <View style={{ flexDirection: 'column', paddingHorizontal: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <YearAndMonthSelector
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onYearChange={setSelectedYear}
            onMonthChange={setSelectedMonth}
          />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {activeStoreId && (
            <EmployeeDropdown
              storeId={activeStoreId}
              selectedEmployee={selectedEmployee}
              onSelect={handleEmployeeSelect}
            />
          )}
        </View>
      </View>

      <ScrollView>
        {filteredPayslips.map((item) => (
          <PayslipListItem
            key={item.payslipId}
            month={Number(item.payDate.split('-')[1])}
            year={Number(item.payDate.split('-')[0])}
            payDate={item.payDate}
            employeeName={item.staffName}
            employeeNickname={item.staffNickName}
            onPress={() => handlePayslipPress(item.payslipId, Number(activeStoreId))}
          />
        ))}
      </ScrollView>

      <NavBar role='sajang' />
    </SafeAreaView>
  );
};

export default PayslipListOwner;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#FF8C00', fontFamily: 'System' },
  errorText: { fontSize: 16, color: 'red', fontFamily: 'System' },
  emptyText: { fontSize: 16, color: '#666', fontFamily: 'System' },
});