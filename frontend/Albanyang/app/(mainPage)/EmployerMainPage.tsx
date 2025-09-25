// app/(mainPage)/EmployerMainPage.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from "react";
import {
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// API imports
import { getMe } from '@/api/Member';
import { getStores } from '@/api/Stores';
import { getTimesheetsByDate } from '@/api/TimeSheet';
import { getStoreSchedules } from '@/api/Schedule';

// ====== 레이아웃 상수 ======
const TOP_PADDING = 8;
const SIDE_PADDING = 20;
const SECTION_SPACING = 12;
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ====== 타입 정의 ======
interface StaffStatus {
  id: number;
  name: string;
  nickname: string;
  checkInTime?: string;
  checkOutTime?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  scheduleDate?: string;
  status: 'present' | 'late' | 'absent' | 'no-schedule';
  isWorking: boolean;
}

interface Store {
  id: number;
  name: string;
  staffs: StaffStatus[];
  totalStaffs: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
}

interface AccountInfo {
  hasAccount: boolean;
  bankName?: string;
  accountNumber?: string;
  balance?: number;
}

// ====== API 호출 함수들 ======
const fetchAccountInfo = async (): Promise<AccountInfo | null> => {
  try {
    const userData = await getMe();
    
    if (!userData.data.account) {
      return { hasAccount: false };
    }
    
    // 계좌가 있는 경우 (실제로는 별도 API로 잔액 조회 필요)
    return {
      hasAccount: true,
      bankName: "싸피", // 실제로는 계좌번호에서 파싱하거나 별도 API 필요
      accountNumber: userData.data.account,
      balance: 1500000 // 임시값, 실제로는 별도 API 필요
    };
  } catch (error) {
    console.error('계좌 정보 조회 실패:', error);
    return null;
  }
};

const fetchStoresWithStaffStatus = async (): Promise<Store[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. 매장 목록 조회
    const storesResponse = await getStores();
    const stores = storesResponse.data.stores;
    
    // 2. 각 매장별로 오늘의 근태 및 스케줄 정보 조회
    const storesWithStatus = await Promise.all(
      stores.map(async (store) => {
        try {
          // 오늘의 근태 기록 조회
          const timesheetResponse = await getTimesheetsByDate(store.id, today);
          const timesheets = timesheetResponse.data.timesheets;
          
          // 오늘의 스케줄 조회
          const scheduleResponse = await getStoreSchedules(store.id, undefined, today);
          const schedules = scheduleResponse.data.schedules;
          
          // 스케줄과 근태 매칭
          const staffsWithStatus: StaffStatus[] = schedules.map(schedule => {
            const timesheet = timesheets.find(t => t.staffId === schedule.staffId);
            
            let status: 'present' | 'late' | 'absent' | 'no-schedule' = 'absent';
            let isWorking = false;
            
            if (timesheet?.arrivedAt) {
              // 출근 기록이 있음
              const scheduledTime = new Date(`${today}T${schedule.workStartTime}`);
              const arrivedTime = new Date(`${today}T${timesheet.arrivedAt}`);
              
              if (arrivedTime <= scheduledTime) {
                status = 'present';
              } else {
                status = 'late';
              }
              
              isWorking = !timesheet.leftAt; // 퇴근 안했으면 근무중
            }
            
            return {
              id: schedule.staffId,
              name: schedule.staffNickname, // nickname을 name으로 사용
              nickname: schedule.staffNickname,
              checkInTime: timesheet?.arrivedAt ?? undefined,  // null → undefined 변환
              checkOutTime: timesheet?.leftAt ?? undefined,    // null → undefined 변환
              scheduledStartTime: schedule.workStartTime,
              scheduledEndTime: schedule.workEndTime,
              scheduleDate: schedule.commuteDate,
              status,
              isWorking
            };
          });
          
          // 출근/지각/결근 카운트
          const presentCount = staffsWithStatus.filter(s => s.status === 'present').length;
          const lateCount = staffsWithStatus.filter(s => s.status === 'late').length;
          const absentCount = staffsWithStatus.filter(s => s.status === 'absent').length;
          
          return {
            id: store.id,
            name: store.name,
            staffs: staffsWithStatus,
            totalStaffs: staffsWithStatus.length,
            presentCount,
            lateCount,
            absentCount
          };
        } catch (error) {
          console.error(`매장 ${store.id} 정보 조회 실패:`, error);
          return {
            id: store.id,
            name: store.name,
            staffs: [],
            totalStaffs: 0,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0
          };
        }
      })
    );
    
    return storesWithStatus;
  } catch (error) {
    console.error('매장 정보 조회 실패:', error);
    return [];
  }
};

// ====== 컴포넌트들 ======
const TopSection = ({ 
  accountInfo, 
  notificationCount, 
  onNotificationPress 
}: { 
  accountInfo: AccountInfo | null;
  notificationCount: number;
  onNotificationPress: () => void;
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.notificationRow}>
        <View style={{ flex: 1 }} />
        <Pressable
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.notificationButtonPressed
          ]}
          onPress={onNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {notificationCount > 99 ? '99+' : notificationCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={styles.accountCard}>
        <View style={styles.accountInfo}>
          {accountInfo?.hasAccount ? (
            <>
              <Text style={styles.accountLabel}>계좌 잔액</Text>
              <Text style={styles.accountNumber}>
                {`${accountInfo.bankName} ${accountInfo.accountNumber}`}
              </Text>
              <View style={styles.balanceContainer}>
                <Text style={styles.accountBalance}>
                  {accountInfo.balance?.toLocaleString()}
                </Text>
                <Text style={styles.currencyText}>원</Text>
              </View>
            </>
          ) : (
            <View style={styles.noAccountContainer}>
              <Text style={styles.noAccountTitle}>계좌를 등록해주세요</Text>
              <Text style={styles.noAccountSubtitle}>마이페이지에서 계좌를 등록해주세요</Text>
            </View>
          )}
        </View>
        
        <View style={styles.mascotContainer}>
          <Text style={styles.mascotMessage}>
            {accountInfo?.hasAccount ? '좋은 하루예요!' : '계좌 등록하고\n시작해보세요!'}
          </Text>
          <Image
            source={require("@/assets/images/mascot/mascot_basic_boss.png")}
            style={styles.mascotImage}
          />
        </View>
      </View>
    </View>
  );
};

const StoreSelectionSection = ({ 
  stores, 
  selectedStoreIndex, 
  onStoreSelect, 
  onAddStore 
}: { 
  stores: Store[];
  selectedStoreIndex: number;
  onStoreSelect: (index: number) => void;
  onAddStore: () => void;
}) => {
  return (
    <View style={styles.section}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storeTabContainer}
      >
        {stores.map((store, index) => (
          <Pressable
            key={store.id}
            style={[
              styles.storeTab,
              selectedStoreIndex === index && styles.activeStoreTab
            ]}
            onPress={() => onStoreSelect(index)}
          >
            <Text style={[
              styles.storeTabText,
              selectedStoreIndex === index && styles.activeStoreTabText
            ]}>
              {store.name}
            </Text>
          </Pressable>
        ))}
        
        <Pressable style={styles.addStoreTab} onPress={onAddStore}>
          <Text style={styles.addStoreTabText}>매장 추가+</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const StoreStatusSection = ({ 
  store, 
  stores,
  onPressStoreOverview,
}: { 
  store: Store | null;
  stores: Store[];
  onPressStoreOverview: (store: Store) => void;
}) => {
  const getStatusColor = (status: 'present' | 'late' | 'absent' | 'no-schedule') => {
    switch (status) {
      case 'present': return '#4CAF50';
      case 'late': return colors.main;
      case 'absent': return colors.reject;
      case 'no-schedule': return colors.text.secondary;
      default: return colors.text.secondary;
    }
  };

  const getStatusText = (staff: StaffStatus) => {
    const checkIn = staff.checkInTime || '----';
    const checkOut = staff.checkOutTime || '----';
    return `${checkIn} / ${checkOut}`;
  };

  const getScheduleText = (staff: StaffStatus) => {
    return `(${staff.scheduledStartTime} / ${staff.scheduledEndTime})`;
  };

  if (stores.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.statusCard}>
          <View style={styles.emptyStoreContainer}>
            <Text style={styles.emptyStoreTitle}>매장을 추가해보세요</Text>
            <Text style={styles.emptyStoreSubtitle}>첫 매장을 등록하고 직원들을 관리해보세요</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!store) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayStaffs = store.staffs.filter(staff => staff.scheduleDate === today);

  return (
    <View style={styles.section}>
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Pressable
            onPress={() => store && onPressStoreOverview(store)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.storeHeaderButton, 
              pressed && styles.storeHeaderButtonPressed
            ]}
          >
            <View style={styles.storeHeaderContent}>
              <Text style={styles.statusTitle}>{store.name} 현황</Text>
              <View style={styles.moreIcon}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          </Pressable>
          <View style={styles.statusSummary}>
            <Text style={styles.statusCount}>
              출근 {store.presentCount} · 지각 {store.lateCount} · 결근 {store.absentCount}
            </Text>
          </View>
        </View>

        <View style={styles.staffListContainer}>
          {todayStaffs.length === 0 ? (
            <View style={styles.emptyStaffContainer}>
              <Text style={styles.emptyStaffTitle}>오늘 스케줄된 직원이 없습니다</Text>
              <Text style={styles.emptyStaffSubtitle}>스케줄을 등록해보세요</Text>
            </View>
          ) : (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.headerText}>이름</Text>
                <Text style={styles.headerText}>출근시간 / 퇴근시간</Text>
              </View>
              
              <ScrollView style={styles.scrollableStaffList} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                {todayStaffs.map((staff) => (
                  <View key={staff.id} style={styles.albaRow}>
                    <View style={styles.nameSection}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(staff.status) }]} />
                      <Text style={styles.albaName}>{staff.name}</Text>
                    </View>
                    <View style={styles.timeSection}>
                      <Text style={styles.workTime}>{getStatusText(staff)}</Text>
                      <Text style={styles.scheduleTime}>{getScheduleText(staff)}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const ActionSection = ({ 
  selectedStore, 
  onWriteNotice, 
  onSchedule,
  onInvite 
}: { 
  selectedStore: Store | null;
  onWriteNotice: () => void;
  onSchedule: () => void;
  onInvite: () => void;
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.actionContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.circleActionButton,
            pressed && styles.actionButtonPressed
          ]}
          onPress={onWriteNotice}
        >
          <View style={styles.circleActionIconContainer}>
            <Text style={styles.actionIcon}>📢</Text>
          </View>
          <Text style={styles.actionText}>공지 쓰기</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.circleActionButton,
            pressed && styles.actionButtonPressed
          ]}
          onPress={onSchedule}
        >
          <View style={styles.circleActionIconContainer}>
            <Text style={styles.actionIcon}>📅</Text>
          </View>
          <Text style={styles.actionText}>스케줄</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.circleActionButton,
            pressed && styles.actionButtonPressed
          ]}
          onPress={onInvite}
        >
          <View style={styles.circleActionIconContainer}>
            <Text style={styles.actionIcon}>✉️</Text>
          </View>
          <Text style={styles.actionText}>초대하기</Text>
        </Pressable>
      </View>
    </View>
  );
};

// ====== 메인 컴포넌트 ======
export default function EmployerMainPage() {
  const router = useRouter();
  
  const [stores, setStores] = useState<Store[]>([]);
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
      console.error('데이터 로딩 실패:', error);
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
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

  const handlePressStoreOverview = (store: Store) => {
    router.push({
      pathname: "/NextToEmployerMainPage",
      params: { storeId: store.id, storeName: store.name },
    });
  };

  const handleAddStore = () => {
    router.push("/RegistrationWrite");
  };

  const handleNotificationPress = () => {
    const selectedStore = stores[selectedStoreIndex];
    if (selectedStore) {
      router.push({
        pathname: "/ViewNotification",
        params: { storeId: selectedStore.id }
      });
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
        <TopSection 
          accountInfo={accountInfo}
          notificationCount={0}
          onNotificationPress={handleNotificationPress}
        />
        <StoreSelectionSection 
          stores={stores}
          selectedStoreIndex={selectedStoreIndex}
          onStoreSelect={handleStoreSelect}
          onAddStore={handleAddStore}
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
        />
      </ScrollView>

      <NavBar role="sajang" activeKey="home" />
    </SafeAreaView>
  );
}

// ====== 스타일 (생략 - 기존과 동일) ======
const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: colors.text.reverse },
  scrollContainer: { flex: 1 },
  contentContainer: { flexGrow: 1, paddingTop: TOP_PADDING, paddingBottom: NAVBAR_HEIGHT + 40 },
  section: { marginBottom: SECTION_SPACING, paddingHorizontal: SIDE_PADDING },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  notificationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  notificationButton: { padding: 8, borderRadius: 8, position: 'relative' },
  notificationButtonPressed: { backgroundColor: 'rgba(0,0,0,0.05)' },
  notificationBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: colors.reject, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  notificationBadgeText: { color: colors.text.reverse, fontSize: 10, fontFamily: FONTS.jamsil.bold5 },
  accountCard: { flexDirection: 'row', backgroundColor: colors.text.reverse, borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },
  accountInfo: { flex: 1 },
  accountLabel: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, marginBottom: 4 },
  accountNumber: { fontSize: sizes.smallText, color: colors.text.secondary, marginBottom: 8, fontFamily: FONTS.jamsil.regular3 },
  balanceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  accountBalance: { fontSize: sizes.middleTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary, marginRight: 4 },
  currencyText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  noAccountContainer: { flex: 1 },
  noAccountTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 4 },
  noAccountSubtitle: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  mascotContainer: { alignItems: 'center', justifyContent: 'center' },
  mascotMessage: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center', backgroundColor: colors.disable, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 8 },
  mascotImage: { width: 100, height: 100, resizeMode: 'contain' },
  storeTabContainer: { flexDirection: 'row', gap: 4, paddingHorizontal: 4 },
  storeTab: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', minWidth: 120, alignItems: 'center' },
  activeStoreTab: { borderBottomColor: colors.accent },
  storeTabText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center' },
  activeStoreTabText: { color: colors.accent, fontFamily: FONTS.jamsil.medium4 },
  addStoreTab: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', minWidth: 120, alignItems: 'center' },
  addStoreTabText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.main, textAlign: 'center' },
  statusCard: { backgroundColor: colors.text.reverse, borderRadius: 20, padding: 24, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },
  statusHeader: { marginBottom: 20 },
  storeHeaderButton: { borderRadius: 8, padding: 4, marginHorizontal: -4 },
  storeHeaderButtonPressed: { backgroundColor: colors.disable },
  storeHeaderContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  moreIcon: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 8 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text.secondary },
  statusSummary: { flexDirection: 'row' },
  statusCount: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  staffListContainer: { minHeight: 300, maxHeight: 300 },
  emptyStaffContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyStaffTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 8, textAlign: 'center' },
  emptyStaffSubtitle: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center' },
  emptyStoreContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStoreTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 8, textAlign: 'center' },
  emptyStoreSubtitle: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, paddingHorizontal: 4 },
  headerText: { fontSize: sizes.smallText, color: colors.text.secondary, fontFamily: FONTS.jamsil.regular3 },
  scrollableStaffList: { flex: 1 },
  albaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: colors.disable },
  nameSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  albaName: { fontSize: sizes.normalText, color: colors.text.primary, fontFamily: FONTS.jamsil.regular3 },
  timeSection: { flex: 2, alignItems: 'flex-end' },
  workTime: { fontSize: sizes.smallText, color: colors.text.primary, marginBottom: 4, fontFamily: FONTS.jamsil.regular3 },
  scheduleTime: { fontSize: sizes.smallText, color: colors.text.secondary, fontFamily: FONTS.jamsil.regular3 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-around', gap: 12 },
  circleActionButton: { flex: 1, backgroundColor: colors.text.reverse, borderRadius: 30, padding: 20, alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6, aspectRatio: 1 },
  actionButtonPressed: { backgroundColor: colors.disable, transform: [{ scale: 0.95 }] },
  circleActionIconContainer: { marginBottom: 8 },
  actionIcon: { fontSize: 28 },
  actionText: { fontSize: sizes.smallText, color: colors.text.primary, fontFamily: FONTS.jamsil.medium4, textAlign: 'center' },
});