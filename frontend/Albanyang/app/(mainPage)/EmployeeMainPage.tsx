// app/(mainPage)/EmployeeMainPage.tsx - 출퇴근 로직 개선 버전

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useCallback, useEffect, useState } from "react";
import { Alert, Dimensions, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

// API imports
import { getMyPayslips } from "@/api/EmployeePaylips";
import { getMySchedules } from '@/api/Schedule';
import { getStaffStores, Store } from '@/api/store/getStaffStores';
import { getMyTimesheets } from '@/api/Timesheet';
import AttendanceSection from "./components/AttendanceSection";
import EmployeeStoreSelectionSection from "./components/EmployeeStoreSelectionSection";
import NoStoreSection from './components/NoStoreSection';
import StoreDetailModal from './components/StoreDetailModal';
import TimeSection from './components/TimeSection';
import { EmployeeTopSection, fetchUserAccountInfo, SalaryInfo, UserAccountInfo } from './components/TopSection';
import WorkProgressSection from './components/WorkProgressSection';
import { getMonthlyIncome } from '@/api/Member';
import { getToday } from '@/utils/date';

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
  checkInDate?: string;
}

// 시간 차이 계산 함수
// 바꿔야함
const calculateTimeDifference = (startTime: string, endTime?: string): number => {
  const today = getToday();
  const start = new Date(`${today}T${startTime}`);
  const end = endTime ? new Date(`${today}T${endTime}`) : new Date();
  
  return Math.max((end.getTime() - start.getTime()) / (1000 * 60 * 60), 0);
};


/**
 * 개선된 WorkSession 조회 로직
 * 1. 오늘의 timesheet 조회
 * 2. 오늘의 스케줄 조회 (목표 근무시간)
 * 3. timesheetId 확보 (출퇴근 처리를 위해 필수)
 */
const fetchWorkSession = async (storeId: number): Promise<WorkSession> => {
  try {
    const today = getToday();
    console.log(today);
    
    // 1. 오늘의 타임시트 조회
    const timesheetResponse = await getMyTimesheets(storeId, { date: today });
    const timesheetData = timesheetResponse.data;
    console.log("timesheet data:", timesheetData.timesheets);
    
    const todayTimesheet = timesheetData?.timesheets?.[0];

    // 2. 오늘의 스케줄 조회 (목표 근무시간 확인)
    let targetHours = 8; // 기본값
    try {
      const scheduleResponse = await getMySchedules(storeId, undefined, today);
      const scheduleData = scheduleResponse.data;
      console.log("schedule data:", scheduleData.schedules);
      
      const mySchedule = scheduleData?.schedules?.[0];
      if (mySchedule) {
        targetHours = mySchedule.workHours || 8;
      }
    } catch (scheduleError) {
      console.warn('스케줄 조회 실패, 기본값 사용:', scheduleError);
    }

    let totalHours = 0;
    let isWorking = false;
    let checkInTime = null;
    let checkOutTime = null;
    let currentTimesheetId = undefined;

    if (todayTimesheet) {
      currentTimesheetId = todayTimesheet.id;
      checkInTime = todayTimesheet.arrivedAt;
      checkOutTime = todayTimesheet.leftAt;

      if (checkInTime && checkOutTime) {
        // 퇴근 완료
        totalHours = calculateTimeDifference(checkInTime, checkOutTime);
        isWorking = false;
      } else if (checkInTime && !checkOutTime) {
        // 현재 근무 중
        totalHours = calculateTimeDifference(checkInTime);
        isWorking = true;
      } else {
        // 아직 출근하지 않음
        isWorking = false;
        totalHours = 0;
      }
    }

    return {
      storeId,
      checkInTime,
      checkOutTime,
      isWorking,
      totalHours: Math.max(totalHours, 0),
      targetHours,
      currentTimesheetId,
      checkInDate: today
    };
  } catch (error) {
    
    return {
      storeId,
      isWorking: false,
      totalHours: 0,
      targetHours: 8
    };
  }
};

/**
 * 실제 API를 사용한 급여 정보 조회
 */
const fetchSalaryInfo = async (storeId: number): Promise<SalaryInfo> => {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthParam = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;

    // 실제 API 사용
    const incomeResponse = await getMonthlyIncome(monthParam);
    const monthlyIncome = incomeResponse.monthlyIncome || 0;

    return {
      monthlyEarning: monthlyIncome,
      month: `${currentMonth}월`
    };
  } catch (error) {
    
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

  // 실시간 시간 업데이트를 위한 state
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // 근무 중인 경우 총 근무시간 업데이트
      if (workSession?.isWorking && workSession.checkInTime) {
        const updatedHours = calculateTimeDifference(workSession.checkInTime);
        setWorkSession(prev => prev ? { ...prev, totalHours: updatedHours } : null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [workSession?.isWorking, workSession?.checkInTime]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      // 1. 스토어 데이터 가져오기
      const storesDataResponse = await getStaffStores();
      console.log("stores response:", storesDataResponse);
      
      if (storesDataResponse && Array.isArray(storesDataResponse)) {
        setStores(storesDataResponse);
      } else {

        setStores([]);
      }

      // 2. 계정 정보 가져오기
      const accountData = await fetchUserAccountInfo();
      setAccountInfo(accountData);

    } catch (error) {
      
      Alert.alert('오류', '데이터를 불러오는 중 문제가 발생했습니다.');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkSession = async (storeId: number) => {
    try {
      const sessionData = await fetchWorkSession(storeId);
      setWorkSession(sessionData);
    } catch (error) {
      
    }
  };

  const loadSalaryInfo = async (storeId: number) => {
    try {
      const salaryData = await fetchSalaryInfo(storeId);
      setSalaryInfo(salaryData);
    } catch (error) {
      
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

  const handleAttendanceChange = async () => {
    const selectedStoreId = stores?.[selectedStoreIndex]?.id;
    if (selectedStoreId !== undefined) {
      // 출석 변경 후 즉시 데이터 다시 로드
      await loadWorkSession(Number(selectedStoreId));
    }
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
          <EmployeeTopSection salaryInfo={null} />
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
        <EmployeeTopSection salaryInfo={salaryInfo} />
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
        <Text>{!workSession}</Text>
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
  fixedButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: NAVBAR_HEIGHT + 40,
  },
});