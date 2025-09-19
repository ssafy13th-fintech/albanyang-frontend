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
  RefreshControl
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// ====== 레이아웃 상수 ======
const TOP_PADDING = 24;
const SIDE_PADDING = 16;
const EXTRA_BOTTOM = 40;
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ====== 타입 정의 ======
interface AlbaStatus {
  id: number;
  name: string;
  checkInTime?: string;
  checkOutTime?: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  status: 'present' | 'late' | 'absent';
  isWorking: boolean;
}

interface Store {
  id: number;
  name: string;
  address?: string;
  albas: AlbaStatus[];
  totalAlbas: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
}

interface AccountInfo {
  bankName: string;
  accountNumber: string;
  balance: number;
}

interface NotificationCount {
  unreadCount: number;
}

// ====== API 함수들 ======
const fetchAccountInfo = async (): Promise<AccountInfo> => {
  try {
    // TODO: 실제 API 호출
    // const response = await fetch('/api/employer/account', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return await response.json();
    
    // 임시 데이터
    return {
      bankName: "국민",
      accountNumber: "000-0000-000000",
      balance: 7000000
    };
  } catch (error) {
    console.error('계좌 정보 조회 실패:', error);
    throw error;
  }
};

const fetchStores = async (): Promise<Store[]> => {
  try {
    // TODO: 실제 API 호출
    // const response = await fetch('/api/employer/stores', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return await response.json();
    
    // 임시 데이터
    return [
      {
        id: 1,
        name: '메가커피 선릉점',
        address: '서울시 강남구 선릉동',
        totalAlbas: 6,
        presentCount: 3,
        lateCount: 1,
        absentCount: 2,
        albas: [
          {
            id: 1,
            name: '알바 1',
            checkInTime: '07:50',
            scheduledStartTime: '08:00',
            scheduledEndTime: '13:00',
            status: 'present',
            isWorking: true
          },
          {
            id: 2,
            name: '알바 2',
            checkInTime: '08:10',
            scheduledStartTime: '08:00',
            scheduledEndTime: '13:00',
            status: 'late',
            isWorking: true
          },
          {
            id: 3,
            name: '알바 3',
            scheduledStartTime: '08:00',
            scheduledEndTime: '13:00',
            status: 'absent',
            isWorking: false
          }
        ]
      },
      {
        id: 2,
        name: '스타벅스 강남점',
        address: '서울시 강남구 역삼동',
        totalAlbas: 0,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        albas: []
      }
    ];
  } catch (error) {
    console.error('매장 정보 조회 실패:', error);
    throw error;
  }
};

const fetchNotificationCount = async (): Promise<NotificationCount> => {
  try {
    // TODO: 실제 API 호출
    // const response = await fetch('/api/notifications/count', {
    //   headers: { Authorization: `Bearer ${token}` }
    // });
    // return await response.json();
    
    return { unreadCount: 3 };
  } catch (error) {
    console.error('알림 개수 조회 실패:', error);
    return { unreadCount: 0 };
  }
};

const createNotice = async (storeId: number, content: string): Promise<void> => {
  try {
    // TODO: 실제 API 호출
    // await fetch('/api/employer/notices', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`
    //   },
    //   body: JSON.stringify({ storeId, content })
    // });
    
    console.log('공지사항 생성:', { storeId, content });
  } catch (error) {
    console.error('공지사항 생성 실패:', error);
    throw error;
  }
};

const inviteEmployee = async (storeId: number, phoneNumber: string): Promise<void> => {
  try {
    // TODO: 실제 API 호출
    // await fetch('/api/employer/invite', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     Authorization: `Bearer ${token}`
    //   },
    //   body: JSON.stringify({ storeId, phoneNumber })
    // });
    
    console.log('직원 초대:', { storeId, phoneNumber });
  } catch (error) {
    console.error('직원 초대 실패:', error);
    throw error;
  }
};

// ====== 컴포넌트들 ======

// 상단 섹션: 알림 버튼 + 계좌/고양이
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
    <View style={styles.topSectionContainer}>
      {/* 알림 버튼 행 */}
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

      {/* 계좌 + 고양이 행 */}
      <View style={styles.accountMascotRow}>
        {/* 계좌 정보 카드 (왼쪽) */}
        <View style={styles.accountCard}>
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

        {/* 고양이 마스코트 (오른쪽) */}
        <View style={styles.mascotContainer}>
          <Text style={styles.mascotMessage}>좋은 하루예요! 😊</Text>
          <Image
            source={require("@/assets/images/mascot/mascot_basic_boss.png")}
            style={styles.mascotImage}
          />
        </View>
      </View>
    </View>
  );
};

// 매장 탭 + 현황 섹션
const StoreTabSection = ({ 
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
  const getStatusColor = (status: 'present' | 'late' | 'absent') => {
    switch (status) {
      case 'present': return '#4CAF50';
      case 'late': return colors.main;
      case 'absent': return colors.reject;
      default: return colors.text.secondary;
    }
  };

  const formatTime = (alba: AlbaStatus) => {
    const checkIn = alba.checkInTime || '----';
    const checkOut = alba.checkOutTime || '----';
    return `${checkIn} / ${checkOut}`;
  };

  const formatScheduleTime = (alba: AlbaStatus) => {
    return `(${alba.scheduledStartTime} / ${alba.scheduledEndTime})`;
  };

  const renderAlbaList = (store: Store) => {
    if (store.albas.length === 0) {
      return (
        <View style={styles.emptyAlbaContainer}>
          <Text style={styles.emptyAlbaText}>알바가 없습니다</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.albaScrollView} showsVerticalScrollIndicator={false}>
        {store.albas.map((alba) => (
          <View key={alba.id} style={styles.statusRow}>
            <View style={styles.nameSection}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(alba.status) }]} />
              <Text style={styles.workerName}>{alba.name}</Text>
            </View>
            <View style={styles.timeSection}>
              <Text style={styles.workTime}>{formatTime(alba)}</Text>
              <Text style={styles.scheduleTime}>{formatScheduleTime(alba)}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.storeTabContainer}>
      {/* 매장 탭들 */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabContainer}
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
        
        {/* 매장 추가 탭 */}
        <Pressable
          style={styles.addStoreTab}
          onPress={onAddStore}
        >
          <Text style={styles.addStoreTabText}>매장 추가+</Text>
        </Pressable>
      </ScrollView>

      {/* 선택된 매장의 상세 정보 */}
      {stores[selectedStoreIndex] && (
        <View style={styles.storeDetailCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.headerText}>이름</Text>
            <Text style={styles.headerText}>출근시간 / 퇴근시간</Text>
          </View>

          {renderAlbaList(stores[selectedStoreIndex])}
        </View>
      )}
    </View>
  );
};

// 액션 버튼 컴포넌트
const ActionButtonsComponent = ({ 
  selectedStore, 
  onWriteNotice, 
  onInvite 
}: { 
  selectedStore: Store | null;
  onWriteNotice: () => void;
  onInvite: () => void;
}) => {
  return (
    <View style={styles.actionContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed
        ]}
        onPress={onWriteNotice}
      >
        <Text style={styles.actionIcon}>📢</Text>
        <Text style={styles.actionText}>공지 쓰기</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed
        ]}
        onPress={onInvite}
      >
        <Text style={styles.actionIcon}>✉️</Text>
        <Text style={styles.actionText}>초대하기</Text>
      </Pressable>
    </View>
  );
};

// ====== 메인 컴포넌트 ======
export default function EmployerMainPage() {
  const router = useRouter();
  
  // 상태 관리
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 초기 데이터 로딩
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [storesData, accountData, notificationData] = await Promise.all([
        fetchStores(),
        fetchAccountInfo(),
        fetchNotificationCount()
      ]);
      
      setStores(storesData);
      setAccountInfo(accountData);
      setNotificationCount(notificationData.unreadCount);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 새로고침
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
    } finally {
      setRefreshing(false);
    }
  }, []);

  // 이벤트 핸들러들
  const handleStoreSelect = (index: number) => {
    setSelectedStoreIndex(index);
  };

  const handleAddStore = () => {
    router.push("/store/StoreRegistration");
  };

  const handleNotificationPress = () => {
    router.push("/notifications");
  };

  const handleWriteNotice = () => {
    const selectedStore = stores[selectedStoreIndex];
    if (!selectedStore) {
      Alert.alert('알림', '매장을 선택해주세요.');
      return;
    }
    router.push({
      pathname: "/notice/WriteNotice",
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
      pathname: "/invite/InviteEmployee",
      params: { storeId: selectedStore.id, storeName: selectedStore.name }
    });
  };

  const handleNavPress = (key: string) => {
    switch (key) {
      case 'home':
        // 현재 페이지
        break;
      case 'schedule':
        router.push("/schedule");
        break;
      case 'salary':
        router.push("/salary");
        break;
      case 'mypage':
        router.push("/mypage");
        break;
    }
  };

  // 로딩 상태
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
          notificationCount={notificationCount}
          onNotificationPress={handleNotificationPress}
        />
        <StoreTabSection 
          stores={stores}
          selectedStoreIndex={selectedStoreIndex}
          onStoreSelect={handleStoreSelect}
          onAddStore={handleAddStore}
        />
        <ActionButtonsComponent 
          selectedStore={stores[selectedStoreIndex] || null}
          onWriteNotice={handleWriteNotice}
          onInvite={handleInvite}
        />
      </ScrollView>

      <View style={styles.navBarWrapper}>
        <NavBar
          role="sajang"
          activeKey="home"
          onTabPress={handleNavPress}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.text.reverse,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.text.reverse,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: TOP_PADDING,
    paddingBottom: NAVBAR_HEIGHT + EXTRA_BOTTOM,
    minHeight: '100%',
  },

  // --- 로딩 ---
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

  // --- 상단 섹션 (알림 + 계좌/고양이) ---
  topSectionContainer: {
    paddingHorizontal: SIDE_PADDING,
    marginBottom: 16,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
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
  accountMascotRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
    minHeight: 160,
  },
  accountCard: {
    flex: 1.2,
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.main,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  accountNumber: {
    fontSize: sizes.smallText + 2,
    color: colors.text.secondary,
    marginBottom: 16,
    fontFamily: FONTS.jamsil.regular3,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
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
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 16,
  },
  mascotImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginTop: 8,
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
    overflow: 'hidden',
    marginTop: -16,
  },

  // --- 매장 탭 섹션 ---
  storeTabContainer: {
    marginBottom: 32,
  },
  tabScrollView: {
    flexGrow: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIDE_PADDING,
    gap: 0,
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

  // --- 매장 상세 카드 ---
  storeDetailCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.main,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: SIDE_PADDING,
    marginTop: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    height: 260,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  headerText: {
    fontSize: sizes.smallText,
    color: colors.text.secondary,
    fontFamily: FONTS.jamsil.regular3,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
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
  workerName: {
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

  // --- 알바 스크롤 영역 ---
  albaScrollView: {
    maxHeight: 180,
  },
  
  // --- 빈 알바 상태 ---
  emptyAlbaContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyAlbaText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  // --- 액션 버튼 ---
  actionContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: SIDE_PADDING,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.text.reverse,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.main,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 70,
  },
  actionButtonPressed: {
    backgroundColor: colors.disable,
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    fontSize: 28,
  },
  actionText: {
    fontSize: sizes.normalText,
    color: colors.text.primary,
    fontFamily: FONTS.jamsil.medium4,
  },

  // --- NavBar 고정 ---
  navBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: EXTRA_BOTTOM,
  },
});