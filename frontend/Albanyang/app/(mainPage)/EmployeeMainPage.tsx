// app/(mainPage)/AlbaMainPage.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// ====== 레이아웃 상수 ======
const TOP_PADDING = 24;
const SIDE_PADDING = 16;
const EXTRA_BOTTOM = 40;
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;

// ====== 타입 정의 ======
interface Store {
  id: number;
  name: string;
}

interface WorkSession {
  storeId: number;
  checkInTime?: string;
  checkOutTime?: string;
  isWorking: boolean;
  totalHours: number;
  targetHours: number;
}

interface SalaryInfo {
  monthlyEarning: number;
  month: string;
}

// ====== API 호출 함수들 (추후 구현) ======
const fetchUserStores = async (): Promise<Store[]> => {
  // TODO: API 호출
  return [
    { id: 1, name: '메가커피 선릉점' },
    { id: 2, name: '스타벅스 강남점' },
    { id: 3, name: '투썸플레이스 역삼점' }
  ];
};

const fetchWorkSession = async (storeId: number): Promise<WorkSession> => {
  // TODO: API 호출
  return {
    storeId,
    checkInTime: '10:12:25',
    checkOutTime: undefined,
    isWorking: true,
    totalHours: 2.3,
    targetHours: 8
  };
};

const fetchSalaryInfo = async (): Promise<SalaryInfo> => {
  // TODO: API 호출
  return {
    monthlyEarning: 1000000,
    month: '8월'
  };
};

const handleCheckIn = async (storeId: number): Promise<void> => {
  // TODO: API 호출
  console.log('출근 API 호출:', storeId);
};

const handleCheckOut = async (storeId: number): Promise<void> => {
  // TODO: API 호출
  console.log('퇴근 API 호출:', storeId);
};

// 상단 섹션: 알림 버튼 + 마스코트/수익 정보
const TopSection = ({ salaryInfo }: { salaryInfo: SalaryInfo }) => {
  const router = useRouter();

  const handleNotification = () => {
    router.push('/notifications');
  };

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
          onPress={handleNotification}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      {/* 마스코트 + 수익 정보 행 */}
      <View style={styles.mascotSalaryRow}>
        {/* 수익 정보 (왼쪽) */}
        <View style={styles.salaryContainer}>
          <Text style={styles.monthText}>{salaryInfo.month}에</Text>
          <View style={styles.salaryAmountRow}>
            <Text style={styles.salaryLabel}>총 </Text>
            <Text style={styles.salaryAmount}>{salaryInfo.monthlyEarning.toLocaleString()}</Text>
            <Text style={styles.currencyText}>원</Text>
          </View>
          <Text style={styles.earnedText}>벌었습니다!</Text>
        </View>

        {/* 마스코트 (오른쪽) */}
        <View style={styles.mascotContainer}>
          <Image
            source={require("@/assets/images/mascot/mascot_good_alba.png")}
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
  onStoreSelect 
}: { 
  stores: Store[], 
  selectedStoreIndex: number, 
  onStoreSelect: (index: number) => void 
}) => {
  return (
    <View style={styles.storeSelectionContainer}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.storeScrollView}
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
      </ScrollView>
    </View>
  );
};

// 출퇴근 시간 섹션
const TimeSection = ({ workSession }: { workSession: WorkSession }) => {
  return (
    <View style={styles.timeSection}>
      <View style={styles.timeItem}>
        <Text style={styles.timeLabel}>출근시간</Text>
        <Text style={styles.timeValue}>
          {workSession.checkInTime || '--:--:--'}
        </Text>
      </View>
      <View style={styles.timeItem}>
        <Text style={styles.timeLabel}>퇴근시간</Text>
        <Text style={styles.timeValue}>
          {workSession.checkOutTime || (workSession.isWorking ? '근무 중' : '--:--:--')}
        </Text>
      </View>
    </View>
  );
};

// 근무 진행 바 섹션
const WorkProgressSection = ({ workSession }: { workSession: WorkSession }) => {
  const progress = workSession.totalHours / workSession.targetHours;
  const progressPercentage = Math.min(progress * 100, 100);
  
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressTitle}>오늘 근무 진행</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
        <Image 
          source={require("@/assets/images/mascot/mascot_running_alba.png")}
          style={[styles.runningMascot, { left: `${Math.max(progressPercentage - 10, 0)}%` }]}
        />
      </View>
      <Text style={styles.progressText}>
        {workSession.totalHours.toFixed(1)}시간 / {workSession.targetHours}시간
      </Text>
    </View>
  );
};

// 출근 버튼 섹션
const AttendanceSection = ({ 
  workSession, 
  storeId, 
  onAttendanceChange 
}: { 
  workSession: WorkSession, 
  storeId: number, 
  onAttendanceChange: () => void 
}) => {
  const handleAttendance = async () => {
    try {
      if (workSession.isWorking) {
        await handleCheckOut(storeId);
      } else {
        await handleCheckIn(storeId);
      }
      onAttendanceChange();
    } catch (error) {
      console.error('출퇴근 처리 중 오류:', error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  const buttonText = workSession.isWorking ? '퇴근하기' : '출근하기';

  return (
    <View style={styles.buttonSection}>
      <Pressable
        style={({ pressed }) => [
          styles.attendanceButton,
          pressed && styles.attendanceButtonPressed
        ]}
        onPress={handleAttendance}
      >
        <Text style={styles.attendanceButtonText}>{buttonText}</Text>
      </Pressable>
    </View>
  );
};

export default function AlbaMainPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const [workSession, setWorkSession] = useState<WorkSession | null>(null);
  const [salaryInfo, setSalaryInfo] = useState<SalaryInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // 데이터 로딩
  useEffect(() => {
    loadInitialData();
  }, []);

  // 매장 선택 시 근무 정보 로딩
  useEffect(() => {
    if (stores.length > 0) {
      loadWorkSession(stores[selectedStoreIndex].id);
    }
  }, [selectedStoreIndex, stores]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [storesData, salaryData] = await Promise.all([
        fetchUserStores(),
        fetchSalaryInfo()
      ]);
      
      setStores(storesData);
      setSalaryInfo(salaryData);
      
      if (storesData.length > 0) {
        await loadWorkSession(storesData[0].id);
      }
    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
      // TODO: 에러 처리 (에러 페이지 표시 또는 재시도 옵션)
    } finally {
      setLoading(false);
    }
  };

  const loadWorkSession = async (storeId: number) => {
    try {
      const sessionData = await fetchWorkSession(storeId);
      setWorkSession(sessionData);
    } catch (error) {
      console.error('근무 정보 로딩 중 오류:', error);
    }
  };

  const handleStoreSelect = (index: number) => {
    setSelectedStoreIndex(index);
  };

  const handleAttendanceChange = () => {
    // 출퇴근 후 데이터 새로고침
    if (stores.length > 0) {
      loadWorkSession(stores[selectedStoreIndex].id);
    }
  };

  const handleNavPress = (key: string) => {
    switch (key) {
      case 'home':
        // 현재 페이지
        break;
      case 'calendar':
        router.push('/schedule');
        break;
      case 'ai':
        router.push('/ai-chat');
        break;
      case 'salary':
        router.push('/salary');
        break;
      case 'mypage':
        router.push('/mypage');
        break;
    }
  };

  if (loading || !workSession || !salaryInfo) {
    // TODO: 로딩 컴포넌트 구현
    return (
      <SafeAreaView style={styles.rootContainer}>
        <View style={styles.loadingContainer}>
          <Text>로딩 중...</Text>
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
      >
        <TopSection salaryInfo={salaryInfo} />
        <StoreSelectionSection 
          stores={stores}
          selectedStoreIndex={selectedStoreIndex}
          onStoreSelect={handleStoreSelect}
        />
        <TimeSection workSession={workSession} />
        <WorkProgressSection workSession={workSession} />
      </ScrollView>

      <View style={styles.fixedButtonWrapper}>
        <AttendanceSection 
          workSession={workSession}
          storeId={stores[selectedStoreIndex]?.id}
          onAttendanceChange={handleAttendanceChange}
        />
      </View>

      <View style={styles.navBarWrapper}>
        <NavBar
          role="alba"
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

  // --- 상단 섹션 (알림 + 마스코트/수익) ---
  topSectionContainer: {
    paddingHorizontal: SIDE_PADDING,
    marginBottom: 40,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
  },
  notificationButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  
  // 마스코트 + 수익 정보 가로 배치
  mascotSalaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    minHeight: 160,
  },
  mascotContainer: {
    flex: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  
  // 수익 정보 컨테이너 (왼쪽)
  salaryContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 24, // 왼쪽 여백 추가
  },
  monthText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    marginBottom: 4,
  },
  salaryAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  salaryLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  salaryAmount: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.accent,
  },
  currencyText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  earnedText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },

  // --- 매장 선택 섹션 ---
  storeSelectionContainer: {
    marginBottom: 24,
  },
  storeScrollView: {
    flexGrow: 0,
  },
  storeTabContainer: {
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

  // --- 근무 진행 바 섹션 ---
  progressContainer: {
    marginHorizontal: SIDE_PADDING,
    marginBottom: 24,
    padding: 20,
    backgroundColor: colors.disable,
    borderRadius: 16,
  },
  progressTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.disable,
    borderRadius: 6,
    position: 'relative',
    marginVertical: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 6,
  },
  runningMascot: {
    position: 'absolute',
    width: 24,
    height: 24,
    top: -6,
    resizeMode: 'contain',
  },
  progressText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // --- 로딩 ---
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- 출퇴근 시간 섹션 ---
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 24,
    marginHorizontal: SIDE_PADDING,
    marginBottom: 40,
    backgroundColor: colors.text.reverse,
    borderRadius: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    marginBottom: 12,
  },
  timeValue: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
  },

  // --- 출근 버튼 섹션 ---
  fixedButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: NAVBAR_HEIGHT + EXTRA_BOTTOM + 80,
  },
  buttonSection: {
    paddingHorizontal: SIDE_PADDING,
    marginTop: 'auto',
  },
  attendanceButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  attendanceButtonPressed: {
    backgroundColor: colors.main,
    transform: [{ scale: 0.98 }],
  },
  attendanceButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },

  // --- NavBar 고정 ---
  navBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: EXTRA_BOTTOM,
  },
});