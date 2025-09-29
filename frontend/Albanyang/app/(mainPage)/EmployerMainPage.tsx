// app/(mainPage)/EmployerMainPage.tsx
import { useState, useEffect, useCallback } from "react";
import { ScrollView, StyleSheet, Text, View, Alert, RefreshControl, } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

import { fetchAccountInfo, AccountInfo } from './components/TopSection';
import { fetchStoresWithStaffStatus, StaffStatus, StoreDetail } from "./hook/getStoresDetail";
import { EmployerTopSection } from "./components/TopSection";
import StoreSelectionSection from './components/EmployerStoreSelectionSection';
import StoreStatusSection from './components/StoreStatusSection';
import ActionSection from './components/ActionSection';

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

const TOP_PADDING = 8;
const SIDE_PADDING = 20;
const SECTION_SPACING = 12;
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;


export default function EmployerMainPage() {
  const router = useRouter();
  
  const [stores, setStores] = useState<StoreDetail[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [storesData, accountData] = await Promise.all([
        fetchStoresWithStaffStatus(),
        fetchAccountInfo()
      ]);
      
      setStores(storesData);
      setAccountInfo(accountData);
      
      console.log('데이터 로드 완료');
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleStoreSelect = (index: number) => {
    setSelectedStoreIndex(index);
  };

  const handlePressStoreOverview = (store: StoreDetail) => {
    router.push({
      pathname: "/NextToEmployerMainPage",
      params: { storeId: store.id, storeName: store.name },
    });
  };

  const handleNotificationPress = () => {
    const selectedStore = stores[selectedStoreIndex];
    if (selectedStore) {
      router.push('/ViewNotification');
    }
  };

  const handleWriteNotice = () => {
    const selectedStore = stores[selectedStoreIndex];
    if (!selectedStore) {
      Alert.alert('알림', '매장을 선택해주세요.');
      return;
    }
    router.push({
      pathname: "/WriteNotification",
      params: { storeId: selectedStore.id, storeName: selectedStore.name }
    });
  };

  const handleSendMoney = () => {
    const selectedStore = stores[selectedStoreIndex];
    if (!selectedStore) {
      Alert.alert('알림', '매장을 선택해주세요.');
      return;
    }
    router.push({
      pathname: "/CheckMemberListPage",
      params: { storeId: selectedStore.id, storeName: selectedStore.name }
    });
  };

  const handleSchedule = () => {
    const selectedStore = stores[selectedStoreIndex];
    if (!selectedStore) {
      Alert.alert('알림', '매장을 선택해주세요.');
      return;
    }
    router.push({
      pathname: "/Schedule",
      params: { storeId: selectedStore.id, storeName: selectedStore.name }
    });
  };

  const handleInvite = () => {
    const selectedStore = stores[selectedStoreIndex];
    if (!selectedStore) {
      Alert.alert('알림', '매장을 선택해주세요.');
      return;
    }
    router.push({
      pathname: "/FindAlba",
      params: { storeId: selectedStore.id, storeName: selectedStore.name }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.rootContainer}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.rootContainer} edges={['top']}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <EmployerTopSection 
          accountInfo={accountInfo}
          notificationCount={0}
          onNotificationPress={handleNotificationPress}
        />
        <StoreSelectionSection 
          stores={stores}
          selectedStoreIndex={selectedStoreIndex}
          onStoreSelect={handleStoreSelect}
        />
        <StoreStatusSection 
          store={stores[selectedStoreIndex] || null} 
          stores={stores}
          onPressStoreOverview={handlePressStoreOverview}
        />
        <ActionSection 
          selectedStore={stores[selectedStoreIndex] || null}
          onWriteNotice={handleWriteNotice}
          onSchedule={handleSchedule}
          onInvite={handleInvite}
          onSend={handleSendMoney}
        />
      </ScrollView>

      <NavBar role="sajang" activeKey="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: colors.text.reverse },
  scrollContainer: { flex: 1 },
  contentContainer: { flexGrow: 1, paddingTop: TOP_PADDING, paddingBottom: NAVBAR_HEIGHT + 40 },
  section: { marginBottom: SECTION_SPACING, paddingHorizontal: SIDE_PADDING },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
});
