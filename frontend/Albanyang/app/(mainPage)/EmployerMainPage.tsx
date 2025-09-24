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
  Modal,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// 목업 데이터 추가
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
      }
    ],
    totalStaffs: 3,
    presentCount: 1,
    lateCount: 1,
    absentCount: 1,
    noScheduleCount: 0
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

// 직원 상세 정보 모달
const StaffDetailModal = ({ 
  visible, 
  staff, 
  onClose 
}: { 
  visible: boolean;
  staff: StaffStatus | null;
  onClose: () => void;
}) => {
  if (!staff) return null;

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return '정상 출근';
      case 'late': return '지각';
      case 'absent': return '결근';
      case 'no-schedule': return '스케줄 없음';
      default: return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return '#4CAF50';
      case 'late': return colors.main;
      case 'absent': return colors.reject;
      case 'no-schedule': return colors.text.secondary;
      default: return colors.text.secondary;
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* 헤더 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>직원 정보</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 기본 정보 */}
            <View style={styles.infoSection}>
              <View style={styles.staffProfile}>
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileInitial}>{staff.name[0]}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.staffNameLarge}>{staff.name}</Text>
                  <Text style={styles.staffNickname}>닉네임: {staff.nickname}</Text>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusDotLarge, { backgroundColor: getStatusColor(staff.status) }]} />
                    <Text style={styles.statusText}>{getStatusText(staff.status)}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 연락처 정보 */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>연락처 정보</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>전화번호</Text>
                <Text style={styles.infoValue}>{staff.phone || '미등록'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>이메일</Text>
                <Text style={styles.infoValue}>{staff.email || '미등록'}</Text>
              </View>
            </View>

            {/* 근무 정보 */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>근무 정보</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>시급</Text>
                <Text style={styles.infoValue}>{staff.wage?.toLocaleString() || '미설정'}원</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>입사일</Text>
                <Text style={styles.infoValue}>{staff.joinDate || '미등록'}</Text>
              </View>
              {staff.hasSchedule && (
                <>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>예정 근무시간</Text>
                    <Text style={styles.infoValue}>
                      {staff.scheduledStartTime} - {staff.scheduledEndTime}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>실제 출퇴근</Text>
                    <Text style={styles.infoValue}>
                      {staff.checkInTime || '미출근'} - {staff.checkOutTime || '미퇴근'}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* 액션 버튼들 */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButton, styles.editButton]}>
                <Text style={styles.actionButtonText}>정보 수정</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionButton, styles.scheduleButton]}>
                <Text style={styles.actionButtonText}>스케줄 관리</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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

// 매장 현황 카드 (직원 클릭 기능 추가)
const StoreStatusSection = ({ 
  store, 
  onStaffPress 
}: { 
  store: Store | null;
  onStaffPress: (staff: StaffStatus) => void;
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

        {/* 고정 높이 컨테이너 */}
        <View style={styles.staffListContainer}>
          {store.staffs.length === 0 ? (
            <View style={styles.emptyStaffContainer}>
              <Text style={styles.emptyStaffTitle}>아직 직원이 없습니다</Text>
              <Text style={styles.emptyStaffSubtitle}>직원을 초대해 보세요!</Text>
              <TouchableOpacity style={styles.inviteButton}>
                <Text style={styles.inviteButtonText}>직원 초대하기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.headerText}>이름</Text>
                <Text style={styles.headerText}>출근시간 / 퇴근시간</Text>
              </View>
              
              <ScrollView style={styles.scrollableStaffList} showsVerticalScrollIndicator={false}>
                {store.staffs.map((staff) => (
                  <TouchableOpacity 
                    key={staff.id} 
                    style={styles.albaRow}
                    onPress={() => onStaffPress(staff)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.nameSection}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(staff.status) }]} />
                      <Text style={styles.albaName}>{staff.name}</Text>
                    </View>
                    <View style={styles.timeSection}>
                      <Text style={styles.workTime}>{getStatusText(staff)}</Text>
                      <Text style={styles.scheduleTime}>{getScheduleText(staff)}</Text>
                    </View>
                    <View style={styles.arrowSection}>
                      <Text style={styles.arrowText}>〉</Text>
                    </View>
                  </TouchableOpacity>
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
  
  // 직원 상세 모달 상태
  const [selectedStaff, setSelectedStaff] = useState<StaffStatus | null>(null);
  const [staffModalVisible, setStaffModalVisible] = useState(false);

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

  // 직원 클릭 핸들러
  const handleStaffPress = (staff: StaffStatus) => {
    console.log('직원 정보 조회:', staff.name);
    setSelectedStaff(staff);
    setStaffModalVisible(true);
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
          onStaffPress={handleStaffPress}
        />
        <ActionSection 
          selectedStore={stores[selectedStoreIndex] || null}
          onWriteNotice={handleWriteNotice}
          onSchedule={handleSchedule}
          onInvite={handleInvite}
        />
      </ScrollView>

      {/* 직원 상세 정보 모달 */}
      <StaffDetailModal
        visible={staffModalVisible}
        staff={selectedStaff}
        onClose={() => setStaffModalVisible(false)}
      />

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

  // 직원 리스트 컨테이너 (고정 높이)
  staffListContainer: {
    minHeight: 200, // 최소 높이 고정
    maxHeight: 250, // 최대 높이 제한
  },
  
  // 직원 없을 때 UI
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
  },
  emptyStaffSubtitle: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  inviteButton: {
    backgroundColor: colors.main,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  inviteButtonText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.reverse,
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
  statusDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
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
  arrowSection: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: sizes.normalText,
    color: colors.text.secondary,
    fontFamily: FONTS.jamsil.light2,
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

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
    paddingBottom: 15,
  },
  modalTitle: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.disable,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: sizes.normalText,
    color: colors.text.secondary,
    fontFamily: FONTS.jamsil.regular3,
  },

  // 직원 프로필
  staffProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  profileInitial: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
  profileInfo: {
    flex: 1,
  },
  staffNameLarge: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  staffNickname: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },

  // 정보 섹션
  infoSection: {
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
  },
  sectionTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    flex: 2,
    textAlign: 'right',
  },

  // 액션 버튼들
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.subAccent,
  },
  scheduleButton: {
    backgroundColor: colors.main,
  },
  actionButtonText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.reverse,
  },
});