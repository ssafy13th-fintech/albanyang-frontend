import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PayslipListItem from '../common/components/PayslipListItem';
import PayslipTabBar from '../common/components/PayslipTabBar';
import YearSelector from '../common/components/YearSelector';
import { staffPayslips } from './hooks/useStaffPayslips'
import { ownerStores } from '../employer/hooks/useOwnerStores';
import Header from '@/components/header/Header';

const PayslipListOwner = () => {
  const today = new Date();
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [filteredPayslips, setFilteredPayslips] = useState<any[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  const { stores, loading: storesLoading, error: storesError } = ownerStores();
  const { allPayslips, loading: payslipLoading, error: payslipError } = staffPayslips(activeStoreId, selectedYear);

  // 첫 가게 자동 선택
  useEffect(() => {
    if (stores.length > 0 && !activeStoreId) {
      setActiveStoreId(stores[0].id);
    }
  }, [stores, activeStoreId]);

  const handlePayslipPress = (payslipId: number, storeId: number) => {
    router.push({
      pathname: '/payslip/PayslipDetail',
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
            <Image
              source={require('@/assets/images/icon/loading.gif')}
              style={{ width: 100, height: 100 }}
            />
          </View>
      ) : stores.length === 0 ? (
            <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>일하고 있는 사업장이 없어요ㅜ</Text>
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
            {filteredPayslips.map((item, index) => (
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#666' },
});

export default PayslipListOwner;
