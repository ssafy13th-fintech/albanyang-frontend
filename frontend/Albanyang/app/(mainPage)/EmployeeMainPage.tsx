// app/(mainPage)/EmployeeMainPage.tsx
import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

// API imports
import { getStaffPayslips } from "@/api/payslip/getStaffPayslips";
import { getStoreSchedules } from '@/api/Schedule';
import { getStaffStores, Store } from '@/api/store/getStaffStores';
import { getMyTimesheets } from '@/api/Timesheet';
import AttendanceSection from "./components/AttendanceSection";
import EmployeeStoreSelectionSection from "./components/EmployeeStoreSelectionSection";
import NoStoreSection from './components/NoStoreSection';
import StoreDetailModal from './components/StoreDetailModal';
import TimeSection from './components/TimeSection';
import { EmployeeTopSection, fetchUserAccountInfo, SalaryInfo, UserAccountInfo } from './components/TopSection';
import WorkProgressSection from './components/WorkProgressSection';

// ====== 레이아웃 상수 ======
const TOP_PADDING = 16;
const SIDE_PADDING = 20;
const SECTION_SPACING = 32;
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WorkSession {
  storeId: number;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  isWorking: boolean;
  totalHours: number;
  targetHours: number;
  currentTimesheetId?: number;
}

const fetchWorkSession = async (storeId: number): Promise<WorkSession> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const timesheetData = (await getMyTimesheets(storeId,{date : today})).data
    console.log("timedata :", timesheetData)
    const todayTimesheet = timesheetData?.timesheets[0];

    const scheduleData = await getStoreSchedules(storeId, undefined, today);
    const mySchedule = scheduleData.data.schedules.find(s => s.staffId === todayTimesheet?.staffId);

    let totalHours = 0;
    let isWorking = false;

    if (todayTimesheet) {
      if (todayTimesheet.arrivedAt && todayTimesheet.leftAt) {
        totalHours = todayTimesheet.commuteDate / 60;
        isWorking = false;
      } else if (todayTimesheet.arrivedAt) {
        const checkInTime = new Date(`${today}T${todayTimesheet.arrivedAt}`);
        const now = new Date();
        totalHours = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
        isWorking = true;
      }
    }

    return {
      storeId,
      checkInTime: todayTimesheet?.arrivedAt ?? null,
      checkOutTime: todayTimesheet?.leftAt ?? null,
      isWorking,
      totalHours: Math.max(totalHours, 0),
      targetHours: mySchedule?.workHours ?? 8,
      currentTimesheetId: todayTimesheet?.id
    };
  } catch (error) {
    console.error('근무 세션 조회 실패:', error);
    return {
      storeId,
      isWorking: false,
      totalHours: 0,
      targetHours: 8
    };
  }
};

const fetchSalaryInfo = async (storeId: number): Promise<SalaryInfo> => {
  try {
    const currentYear = new Date().getFullYear().toString();
    const currentMonth = new Date().getMonth() + 1;

    const payslipsData = await getStaffPayslips(String(storeId), currentYear);
    const monthlyPayslips = payslipsData.payslips?.filter(payslip => {
      const payDate = new Date(payslip.payDate);
      return payDate.getMonth() + 1 === currentMonth;
    }) ?? [];

    const monthlyEarning = monthlyPayslips.length > 0 ? 1000000 : 0;

    return {
      monthlyEarning,
      month: `${currentMonth}월`
    };
  } catch (error) {
    console.error('급여 정보 조회 실패:', error);
    return {
      monthlyEarning: 0,
      month: `${new Date().getMonth() + 1}월`
    };
  }
};

// ====== 메인 컴포넌트 ======
export default function EmployeeMainPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const [workSession, setWorkSession] = useState<WorkSession | null>(null);
  const [salaryInfo, setSalaryInfo] = useState<SalaryInfo | null>(null);
  const [accountInfo, setAccountInfo] = useState<UserAccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStoreDetailModal, setShowStoreDetailModal] = useState(false);
  const [selectedStoreForDetail, setSelectedStoreForDetail] = useState<{ id: number, name: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const selectedStoreId = stores?.[selectedStoreIndex]?.id;
    if (selectedStoreId !== undefined) {
      loadWorkSession(Number(selectedStoreId));
      loadSalaryInfo(Number(selectedStoreId));
    }
  }, [stores, selectedStoreIndex]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // 1. 스토어 데이터 가져오기
      const storesDataResponse = await getStaffStores();
      console.log(storesDataResponse)
      setStores(storesDataResponse); // 상태만 업데이트

      // 2. 계정 정보 가져오기
      const accountData = await fetchUserAccountInfo();
      setAccountInfo(accountData);

    } catch (error) {
      console.error('데이터 로딩 중 오류:', error);
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
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

  const loadSalaryInfo = async (storeId: number) => {
    try {
      const salaryData = await fetchSalaryInfo(storeId);
      setSalaryInfo(salaryData);
    } catch (error) {
      console.error('급여 정보 로딩 중 오류:', error);
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

  const handleStoreSelect = (index: number) => setSelectedStoreIndex(index);

  const handleStoreInfoPress = (storeId: number, storeName: string) => {
    setSelectedStoreForDetail({ id: storeId, name: storeName });
    setShowStoreDetailModal(true);
  };

  const handleAttendanceChange = () => {
    const selectedStoreId = stores?.[selectedStoreIndex]?.id;
    if (selectedStoreId !== undefined) loadWorkSession(Number(selectedStoreId));
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.rootContainer}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <SafeAreaView style={styles.rootContainer} edges={['top']}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <EmployeeTopSection accountInfo={accountInfo} salaryInfo={null} />
          <NoStoreSection />
        </ScrollView>
        <NavBar role="alba" activeKey="home" />
      </SafeAreaView>
    );
  }

  const selectedStoreId = stores?.[selectedStoreIndex]?.id ?? 0;

  return (
    <SafeAreaView style={styles.rootContainer} edges={['top']}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <EmployeeTopSection accountInfo={accountInfo} salaryInfo={salaryInfo} />
        <EmployeeStoreSelectionSection
          stores={stores}
          selectedStoreIndex={selectedStoreIndex}
          onStoreSelect={handleStoreSelect}
          onStoreInfoPress={handleStoreInfoPress}
        />
        <TimeSection workSession={workSession} />
        <WorkProgressSection workSession={workSession} />
      </ScrollView>

      <StoreDetailModal
        visible={showStoreDetailModal}
        onClose={() => setShowStoreDetailModal(false)}
        storeId={selectedStoreForDetail?.id ?? 0}
        storeName={selectedStoreForDetail?.name ?? ''}
      />

      <View style={styles.fixedButtonWrapper}>
        <AttendanceSection
          workSession={workSession}
          storeId={Number(selectedStoreId)}
          onAttendanceChange={handleAttendanceChange}
        />
      </View>

      <NavBar role="alba" activeKey="home" />
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
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: TOP_PADDING,
    paddingBottom: NAVBAR_HEIGHT + 120,
  },
  section: {
    marginBottom: SECTION_SPACING,
    paddingHorizontal: SIDE_PADDING,
  },
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
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
  },
  notificationButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  salaryCard: {
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
  salaryContent: {
    flex: 1,
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
  noAccountContainer: {
    flex: 1,
  },
  noAccountTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  noAccountSubtitle: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  storeTabContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  storeTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minWidth: 100,
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
  detailButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  detailButtonText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.reverse,
  },
  timeCard: {
    flexDirection: 'row',
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-around',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
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
  progressCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  progressTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: colors.disable,
    borderRadius: 6,
    position: 'relative',
    marginVertical: 16,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  fixedButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: NAVBAR_HEIGHT + 40,
  },
  buttonSection: {
    paddingHorizontal: SIDE_PADDING,
  },
  attendanceButton: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
});
