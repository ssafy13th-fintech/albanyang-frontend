import Header from '@/components/header/Header';
import NavBar from '@/components/navBar/NavBar';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View, Text, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PayslipListItem from '../common/components/PayslipListItem';
import PayslipTabBar from '../common/components/PayslipTabBar';
import YearSelector from '../common/components/YearSelector';
import { staffStores } from './hooks/useStaffStores';
import { getRoleFromToken } from '@/api/authorization/AuthTokenStorage';
import { ownerStores } from '../employer/hooks/useOwnerStores';
import { staffPayslips } from './hooks/useStaffPayslips';

const PayslipListOwner = () => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const { stores, loading: storesLoading, error: storesError } = staffStores();
  const { allPayslips, loading: payslipLoading, error: payslipError } = staffPayslips(activeStoreId, String(selectedYear));

  // 첫 가게 자동 선택
  useEffect(() => {
    if (stores.length > 0 && !activeStoreId) {
      setActiveStoreId(stores[0].id);
    }
  }, [stores, activeStoreId]);

  useEffect(() => {
    const checkRole = async () => {
      const role = await getRoleFromToken();
      if (role == "EMPLOYER") {
        Alert.alert("권한 없음", "사장 계정은 이 페이지에 접근할 수 없습니다.",
            [{ text: "확인", onPress: () => router.back() }]
          );
      }
    };

    checkRole();
  }, []);

  const handlePayslipPress = (payslipId: number, storeId: number) => {
    router.push({
      pathname: '/payslip/common/PayslipDetail',
      params: {
        payslipId: payslipId,
        storeId: storeId
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Header headerText='급여명세서 목록'/>

      {storesLoading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator />
            <Text>로딩중..</Text>
          </View>
      ) : stores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>일하고 있는 사업장이 없어요 ㅠ</Text>
        </View>
      ) : (
        <>
          <PayslipTabBar
            tabs={stores.map(store => store.name)}
            activeTab={stores.findIndex(store => store.id === activeStoreId)}
            onTabPress={(index) => setActiveStoreId(stores[index].id)}
          />

          <View style={{ alignItems: 'center', marginBottom: 8 }}>
            <YearSelector
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </View>

          <ScrollView>
            {allPayslips.map((item, index) => (
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
        </>
      )}

      <NavBar role='alba'/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  emptyContainer: {  
    flex: 1,               // ✅ 화면 중앙 정렬
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { fontSize: 16, color: '#666' },
});

export default PayslipListOwner;
