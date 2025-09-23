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

// API imports
import { getMe } from '@/api/Member';
import { getStores } from '@/api/Stores';
import { getStaffList } from '@/api/Staff';
import { getStoreSchedules } from '@/api/Schedule';
import { getTimesheetsByDate } from '@/api/Timesheet';
import { getNotifications } from '@/api/Notifications';

// ====== 레이아웃 상수 (수정된 값들) ======
const TOP_PADDING = 8; // 16 → 8로 줄임
const SIDE_PADDING = 20;
const SECTION_SPACING = 12; // 16 → 12로 줄임
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

interface NotificationCount {
  unreadCount: number;
}

// ====== 싸피 API 함수 ======
const fetchAccountBalance = async (accountNumber: string): Promise<number> => {
  try {
    // 싸피 API 호출
    const response = await fetch('https://finopenapi.ssafy.io/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositAccount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        Header: {
          apiName: 'inquireDemandDepositAccount',
          transmissionDate: new Date().toISOString().slice(0, 8),
          transmissionTime: new Date().toTimeString().slice(0, 6),
          institutionCode: '00100',
          fintechAppNo: '001',
          apiServiceCode: 'inquireDemandDepositAccount',
          institutionTransactionUniqueNo: Date.now().toString(),
          apiKey: 'YOUR_API_KEY', // 실제 API 키로 교체 필요
          userKey: 'YOUR_USER_KEY' // 실제 USER 키로 교체 필요
        },
        accountNo: accountNumber
      })
    });

    const data = await response.json();
    return data.REC?.accountBalance || 0;
  } catch (error) {
    console.error('계좌 잔액 조회 실패:', error);
    return 0;
  }
};

// ====== API 함수들 ======
const fetchAccountInfo = async (): Promise<AccountInfo> => {
  try {
    const memberData = await getMe();
    const accountNumber = memberData.data.account || '계좌 미등록';
    
    let balance = 0;
    if (accountNumber !== '계좌 미등록') {
      balance = await fetchAccountBalance(accountNumber);
    }

    return {
      bankName: "싸피",
      accountNumber: accountNumber,
      balance: balance
    };
  } catch (error) {
    console.error('계좌 정보 조회 실패:', error);
    return {
      bankName: "싸피",
      accountNumber: '계좌 미등록',
      balance: 0
    };
  }
};

const fetchStoresWithStaffStatus = async (): Promise<Store[]> => {
  try {
    const storesData = await getStores();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const storesWithStatus = await Promise.all(
      storesData.data.stores.map(async (store) => {
        try {
          // 해당 매장의 전체 직원 목록 조회
          const staffData = await getStaffList(store.id);
          
          // 해당 매장의 오늘 스케줄 조회
          const scheduleData = await getStoreSchedules(store.id, undefined, today);
          
          // 해당 매장의 오늘 출근 기록 조회
          const timesheetData = await getTimesheetsByDate(store.id, today);

          const staffsWithStatus: StaffStatus[] = staffData.data.staffInfoRes.map((staff: any) => {
            // 해당 직원의 오늘 스케줄 찾기
            const todaySchedule = scheduleData.data.schedules.find(
              (schedule) => schedule.staffId === staff.id
            );

            // 해당 직원의 오늘 출근 기록 찾기
            const todayTimesheet = timesheetData.data.timesheets.find(
              (timesheet) => timesheet.staffId === staff.id
            );

            if (!todaySchedule) {
              // 스케줄이 없는 경우
              return {
                id: staff.id,
                name: staff.name,
                nickname: staff.nickname,
                checkInTime: undefined,
                checkOutTime: undefined,
                scheduledStartTime: undefined,
                scheduledEndTime: undefined,
                status: 'no-schedule' as const,
                isWorking: false,
                hasSchedule: false
              };
            }

            // 스케줄이 있는 경우 출근 상태 판단
            let status: 'present' | 'late' | 'absent' = 'absent';
            let isWorking = false;

            if (todayTimesheet?.arrivedAt) {
              const arrivedTime = new Date(`${today}T${todayTimesheet.arrivedAt}`);
              const scheduledTime = new Date(`${today}T${todaySchedule.workStartTime}`);
              
              if (arrivedTime <= scheduledTime) {
                status = 'present';
              } else {
                status = 'late';
              }
              
              isWorking = !todayTimesheet.leftAt; // 퇴근 기록이 없으면 근무 중
            }

            return {
              id: staff.id,
              name: staff.name,
              nickname: staff.nickname,
              checkInTime: todayTimesheet?.arrivedAt,
              checkOutTime: todayTimesheet?.leftAt,
              scheduledStartTime: todaySchedule.workStartTime,
              scheduledEndTime: todaySchedule.workEndTime,
              status,
              isWorking,
              hasSchedule: true
            };
          });

          // 상태별 카운트
          const presentCount = staffsWithStatus.filter(s => s.status === 'present').length;
          const lateCount = staffsWithStatus.filter(s => s.status === 'late').length;
          const absentCount = staffsWithStatus.filter(s => s.status === 'absent').length;
          const noScheduleCount = staffsWithStatus.filter(s => s.status === 'no-schedule').length;

          return {
            id: store.id,
            name: store.name,
            staffs: staffsWithStatus,
            totalStaffs: staffsWithStatus.length,
            presentCount,
            lateCount,
            absentCount,
            noScheduleCount
          };
        } catch (error) {
          console.error(`매장 ${store.id} 직원 상태 조회 실패:`, error);
          return {
            id: store.id,
            name: store.name,
            staffs: [],
            totalStaffs: 0,
            presentCount: 0,
            lateCount: 0,
            absentCount: 0,
            noScheduleCount: 0
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

const fetchNotificationCount = async (storeId?: number): Promise<NotificationCount> => {
  try {
    if (!storeId) return { unreadCount: 0 };
    
    const notificationData = await getNotifications(storeId);
    return { unreadCount: notificationData.data.infos.length };
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

// 매장 선택 섹션 (간격 조정)
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

// 매장 현황 카드 (전체 직원 표시 + 스케줄 없음 상태 추가)
const StoreStatusSection = ({ store }: { store: Store | null }) => {
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

  if (!store) return null;

  return (
    <View style={styles.section}>
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>{store.name} 현황</Text>
          <View style={styles.statusSummary}>
            <Text style={styles.statusCount}>
              출근 {store.presentCount} · 지각 {store.lateCount} · 결근 {store.absentCount}
              {store.noScheduleCount > 0 && ` · 스케줄없음 ${store.noScheduleCount}`}
            </Text>
          </View>
        </View>

        {store.staffs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 직원이 없습니다</Text>
          </View>
        ) : (
          <ScrollView style={styles.albaList} showsVerticalScrollIndicator={false}>
            <View style={styles.listHeader}>
              <Text style={styles.headerText}>이름</Text>
              <Text style={styles.headerText}>출근시간 / 퇴근시간</Text>
            </View>
            
            {store.staffs.map((staff) => (
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
        )}
      </View>
    </View>
  );
};

// 액션 버튼 섹션 (3개 동그라미 버튼으로 변경)
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
  const [notificationCount, setNotificationCount] = useState(0);
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
      
      // 첫 번째 매장의 알림 개수 조회
      if (storesData.length > 0) {
        const notificationData = await fetchNotificationCount(storesData[0].id);
        setNotificationCount(notificationData.unreadCount);
      }
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

  const handleStoreSelect = async (index: number) => {
    setSelectedStoreIndex(index);
    
    // 선택된 매장의 알림 개수 업데이트
    if (stores[index]) {
      const notificationData = await fetchNotificationCount(stores[index].id);
      setNotificationCount(notificationData.unreadCount);
    }
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
    marginBottom: 16, // 24 → 16으로 줄임
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

  // 매장 선택 (간격 조정)
  storeTabContainer: {
    flexDirection: 'row',
    gap: 4, // 8 → 4로 줄임
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

  // 액션 버튼 (3개 동그라미)
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  circleActionButton: {
    flex: 1,
    backgroundColor: colors.text.reverse,
    borderRadius: 30, // 원형으로 만들기 위해 큰 값
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    aspectRatio: 1, // 정사각형으로 만들어 원형 효과
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