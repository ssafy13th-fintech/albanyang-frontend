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

// ====== 레이아웃 상수 (AlbaMainPage와 통일) ======
const TOP_PADDING = 16;
const SIDE_PADDING = 20;
const SECTION_SPACING = 16;
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
            name: '김알바',
            checkInTime: '07:50',
            scheduledStartTime: '08:00',
            scheduledEndTime: '13:00',
            status: 'present',
            isWorking: true
          },
          {
            id: 2,
            name: '이알바',
            checkInTime: '08:10',
            scheduledStartTime: '08:00',
            scheduledEndTime: '13:00',
            status: 'late',
            isWorking: true
          },
          {
            id: 3,
            name: '박알바',
            scheduledStartTime: '08:00',
            scheduledEndTime: '13:00',
            status: 'absent',
            isWorking: false
          },
          {
            id: 4,
            name: '최알바',
            checkInTime: '09:00',
            scheduledStartTime: '09:00',
            scheduledEndTime: '14:00',
            status: 'present',
            isWorking: true
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
    return { unreadCount: 3 };
  } catch (error) {
    console.error('알림 개수 조회 실패:', error);
    return { unreadCount: 0 };
  }
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

// 매장 현황 카드
const StoreStatusSection = ({ store }: { store: Store | null }) => {
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

  if (!store) return null;

  return (
    <View style={styles.section}>
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>{store.name} 현황</Text>
          <View style={styles.statusSummary}>
            <Text style={styles.statusCount}>
              출근 {store.presentCount} · 지각 {store.lateCount} · 결근 {store.absentCount}
            </Text>
          </View>
        </View>

        {store.albas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 직원이 없습니다</Text>
          </View>
        ) : (
          <ScrollView style={styles.albaList} showsVerticalScrollIndicator={false}>
            <View style={styles.listHeader}>
              <Text style={styles.headerText}>이름</Text>
              <Text style={styles.headerText}>출근시간 / 퇴근시간</Text>
            </View>
            
            {store.albas.map((alba) => (
              <View key={alba.id} style={styles.albaRow}>
                <View style={styles.nameSection}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(alba.status) }]} />
                  <Text style={styles.albaName}>{alba.name}</Text>
                </View>
                <View style={styles.timeSection}>
                  <Text style={styles.workTime}>{formatTime(alba)}</Text>
                  <Text style={styles.scheduleTime}>{formatScheduleTime(alba)}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

// 액션 버튼 섹션
const ActionSection = ({ 
  selectedStore, 
  onWriteNotice, 
  onInvite 
}: { 
  selectedStore: Store | null;
  onWriteNotice: () => void;
  onInvite: () => void;
}) => {
  return (
    <View style={styles.section}>
      <View style={styles.actionContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed
          ]}
          onPress={onWriteNotice}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIcon}>📢</Text>
          </View>
          <Text style={styles.actionText}>공지 쓰기</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            pressed && styles.actionButtonPressed
          ]}
          onPress={onInvite}
        >
          <View style={styles.actionIconContainer}>
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
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const handleAddStore = () => {
    // router.push("/store/StoreRegistration");
  };

  const handleNotificationPress = () => {
    // router.push("/notifications");
  };

  const handleWriteNotice = () => {
    const selectedStore = stores[selectedStoreIndex];
    if (!selectedStore) {
      Alert.alert('알림', '매장을 선택해주세요.');
      return;
    }
    // router.push({
    //   pathname: "/notice/WriteNotice",
    //   params: { storeId: selectedStore.id, storeName: selectedStore.name }
    // });
  };

  const handleInvite = () => {
    const selectedStore = stores[selectedStoreIndex];
    if (!selectedStore) {
      Alert.alert('알림', '매장을 선택해주세요.');
      return;
    }
    // router.push({
    //   pathname: "/invite/InviteEmployee",
    //   params: { storeId: selectedStore.id, storeName: selectedStore.name }
    // });
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
          notificationCount={notificationCount}
          onNotificationPress={handleNotificationPress}
        />
        <StoreSelectionSection 
          stores={stores}
          selectedStoreIndex={selectedStoreIndex}
          onStoreSelect={handleStoreSelect}
          onAddStore={handleAddStore}
        />
        <StoreStatusSection store={stores[selectedStoreIndex] || null} />
        <ActionSection 
          selectedStore={stores[selectedStoreIndex] || null}
          onWriteNotice={handleWriteNotice}
          onInvite={handleInvite}
        />
      </ScrollView>

      <NavBar role="sajang" activeKey="home" />
    </SafeAreaView>
  );
}

// ====== 스타일 (AlbaMainPage와 통일된 디자인) ======
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
    marginBottom: 24,
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
    gap: 8,
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
  statusTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 8,
  },
  statusSummary: {
    flexDirection: 'row',
  },
  statusCount: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },
  albaList: {
    maxHeight: 200,
  },
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

  // 액션 버튼
  actionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
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
  actionButtonPressed: {
    backgroundColor: colors.disable,
    transform: [{ scale: 0.98 }],
  },
  actionIconContainer: {
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 32,
  },
  actionText: {
    fontSize: sizes.normalText,
    color: colors.text.primary,
    fontFamily: FONTS.jamsil.medium4,
  },
});