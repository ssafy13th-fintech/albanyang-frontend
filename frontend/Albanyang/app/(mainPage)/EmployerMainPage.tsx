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

// 목업 데이터 수정 - 스케줄 없는 직원 추가
const mockStoresWithStaff = [
  {
    id: 1,
    name: 'GS25 강남점',
    staffs: [
      {
        id: 1,
        name: '김알바',
        nickname: '김김',
        checkInTime: '09:00',
        checkOutTime: undefined,
        scheduledStartTime: '09:00',
        scheduledEndTime: '18:00',
        status: 'present' as const,
        isWorking: true,
        hasSchedule: true,
        phone: '010-1234-5678',
        email: 'kim@example.com',
        wage: 12000,
        joinDate: '2024-01-15'
      },
      {
        id: 2,
        name: '이직원',
        nickname: '이이',
        checkInTime: '09:15',
        checkOutTime: undefined,
        scheduledStartTime: '09:00',
        scheduledEndTime: '18:00',
        status: 'late' as const,
        isWorking: true,
        hasSchedule: true,
        phone: '010-2345-6789',
        email: 'lee@example.com',
        wage: 13000,
        joinDate: '2024-02-01'
      },
      {
        id: 3,
        name: '박근무',
        nickname: '박박',
        checkInTime: undefined,
        checkOutTime: undefined,
        scheduledStartTime: '14:00',
        scheduledEndTime: '22:00',
        status: 'absent' as const,
        isWorking: false,
        hasSchedule: true,
        phone: '010-3456-7890',
        email: 'park@example.com',
        wage: 11500,
        joinDate: '2024-03-10'
      },
      {
        id: 4,
        name: '최직원',
        nickname: '최최',
        checkInTime: '10:00',
        checkOutTime: undefined,
        scheduledStartTime: '10:00',
        scheduledEndTime: '19:00',
        status: 'present' as const,
        isWorking: true,
        hasSchedule: true,
        phone: '010-4567-8901',
        email: 'choi@example.com',
        wage: 12500,
        joinDate: '2024-04-01'
      },
      {
        id: 5,
        name: '정알바',
        nickname: '정정',
        checkInTime: undefined,
        checkOutTime: undefined,
        scheduledStartTime: undefined,
        scheduledEndTime: undefined,
        status: 'no-schedule' as const,
        isWorking: false,
        hasSchedule: false,
        phone: '010-5678-9012',
        email: 'jung@example.com',
        wage: 12000,
        joinDate: '2024-05-01'
      }
    ],
    totalStaffs: 5,
    presentCount: 2,
    lateCount: 1,
    absentCount: 1,
    noScheduleCount: 1
  },
  {
    id: 2,
    name: 'CU 홍대점',
    staffs: [],
    totalStaffs: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    noScheduleCount: 0
  }
];

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
  status: 'present' | 'late' | 'absent' | 'no-schedule';
  isWorking: boolean;
  hasSchedule: boolean;
  phone?: string;
  email?: string;
  wage?: number;
  joinDate?: string;
}

interface Store {
  id: number;
  name: string;
  address?: string;
  staffs: StaffStatus[];
  totalStaffs: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  noScheduleCount: number;
}

interface AccountInfo {
  bankName: string;
  accountNumber: string;
  balance: number;
}

// ====== API 함수들 (목업) ======
const fetchAccountInfo = async (): Promise<AccountInfo> => {
  return {
    bankName: "싸피",
    accountNumber: '110-234-567890',
    balance: 1500000
  };
};

const fetchStoresWithStaffStatus = async (): Promise<Store[]> => {
  return mockStoresWithStaff;
};

// ====== 컴포넌트들 ======

// 상단 섹션: 알림 버튼 + 계좌/마스코트
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
      {/* 알림 버튼 */}
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

      {/* 계좌 정보 + 마스코트 카드 */}
      <View style={styles.accountCard}>
        <View style={styles.accountInfo}>
          <Text style={styles.accountLabel}>계좌 잔액</Text>
          <Text style={styles.accountNumber}>
            {accountInfo ? `${accountInfo.bankName} ${accountInfo.accountNumber}` : '계좌 정보 로딩중...'}
          </Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.accountBalance}>
              {accountInfo ? accountInfo.balance.toLocaleString() : '---'}
            </Text>
            <Text style={styles.currencyText}>원</Text>
          </View>
        </View>
        
        <View style={styles.mascotContainer}>
          <Text style={styles.mascotMessage}>좋은 하루예요!</Text>
          <Image
            source={require("@/assets/images/mascot/mascot_basic_boss.png")}
            style={styles.mascotImage}
          />
        </View>
      </View>
    </View>
  );
};

// 매장 선택 섹션
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

// 매장 현황 카드 (수정됨)
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
    if (!staff.hasSchedule) {
      return '스케줄 없음';
    }
    
    const checkIn = staff.checkInTime || '----';
    const checkOut = staff.checkOutTime || '----';
    return `${checkIn} / ${checkOut}`;
  };

  const getScheduleText = (staff: StaffStatus) => {
    if (!staff.hasSchedule) {
      return '';
    }
    return `(${staff.scheduledStartTime} / ${staff.scheduledEndTime})`;
  };

  // 매장이 없는 경우
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

  // 금일 스케줄이 있는 직원들만 필터링
  const todayStaffs = store.staffs.filter(staff => staff.hasSchedule);

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
              {store.noScheduleCount > 0 && ` · 스케줄없음 ${store.noScheduleCount}`}
            </Text>
          </View>
        </View>

        {/* 고정 높이 컨테이너 수정 */}
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
              
              <ScrollView style={styles.scrollableStaffList} showsVerticalScrollIndicator={false}>
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

// 액션 버튼 섹션
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
      
      console.log('목업 데이터 로드 완료');
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
      pathname: "./NextToEmployerMainPage",
      params: { storeId: store.id, storeName: store.name },
    });
  };

  const handleAddStore = () => {
    router.push("./StoreRegistration");
  };

  const handleNotificationPress = () => {
    const selectedStore = stores[selectedStoreIndex];
    if (selectedStore) {
      router.push({
        pathname: "./ViewNotification",
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
      pathname: "./WriteNotification",
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
      pathname: "./ScheduleManagement",
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
      pathname: "./FindAlba",
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

// ====== 스타일 ======
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.text.reverse,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: TOP_PADDING,
    paddingBottom: NAVBAR_HEIGHT + 40,
  },

  // 공통 섹션 스타일
  section: {
    marginBottom: SECTION_SPACING,
    paddingHorizontal: SIDE_PADDING,
  },

  // 로딩
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  // 알림 버튼
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    position: 'relative',
  },
  notificationButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.reject,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadgeText: {
    color: colors.text.reverse,
    fontSize: 10,
    fontFamily: FONTS.jamsil.bold5,
  },

  // 계좌 정보 카드
  accountCard: {
    flexDirection: 'row',
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  accountInfo: {
    flex: 1,
  },
  accountLabel: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: sizes.smallText,
    color: colors.text.secondary,
    marginBottom: 8,
    fontFamily: FONTS.jamsil.regular3,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  accountBalance: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    marginRight: 4,
  },
  currencyText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotMessage: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
    backgroundColor: colors.disable,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  mascotImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },

  // 매장 선택
  storeTabContainer: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 4,
  },
  storeTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 120,
    alignItems: 'center',
  },
  activeStoreTab: {
    borderBottomColor: colors.accent,
  },
  storeTabText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  activeStoreTabText: {
    color: colors.accent,
    fontFamily: FONTS.jamsil.medium4,
  },
  addStoreTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 120,
    alignItems: 'center',
  },
  addStoreTabText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.main,
    textAlign: 'center',
  },

  // 매장 현황 카드
  statusCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  statusHeader: {
    marginBottom: 20,
  },
  
  // 매장 헤더 버튼 (수정된 UI)
  storeHeaderButton: {
    borderRadius: 8,
    padding: 4,
    marginHorizontal: -4,
  },
  storeHeaderButtonPressed: {
    backgroundColor: colors.disable,
  },
  storeHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 8,
  },
  moreIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.text.secondary,
  },
  
  statusSummary: {
    flexDirection: 'row',
  },
  statusCount: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  // 직원 리스트 컨테이너 (높이 조정)
  staffListContainer: {
    minHeight: 200,
    maxHeight: 300, // 높이 증가
  },
  
  // 직원/매장 없을 때 UI
  emptyStaffContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStaffTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStaffSubtitle: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  
  // 매장 없을 때
  emptyStoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStoreTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStoreSubtitle: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // 직원 리스트
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: sizes.smallText,
    color: colors.text.secondary,
    fontFamily: FONTS.jamsil.regular3,
  },
  scrollableStaffList: {
    flex: 1,
  },
  albaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  albaName: {
    fontSize: sizes.normalText,
    color: colors.text.primary,
    fontFamily: FONTS.jamsil.regular3,
  },
  timeSection: {
    flex: 2,
    alignItems: 'flex-end',
  },
  workTime: {
    fontSize: sizes.smallText,
    color: colors.text.primary,
    marginBottom: 4,
    fontFamily: FONTS.jamsil.regular3,
  },
  scheduleTime: {
    fontSize: sizes.smallText,
    color: colors.text.secondary,
    fontFamily: FONTS.jamsil.regular3,
  },

  // 액션 버튼 (3개 동그라미)
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  circleActionButton: {
    flex: 1,
    backgroundColor: colors.text.reverse,
    borderRadius: 30,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    aspectRatio: 1,
  },
  actionButtonPressed: {
    backgroundColor: colors.disable,
    transform: [{ scale: 0.95 }],
  },
  circleActionIconContainer: {
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionText: {
    fontSize: sizes.smallText,
    color: colors.text.primary,
    fontFamily: FONTS.jamsil.medium4,
    textAlign: 'center',
  },
});