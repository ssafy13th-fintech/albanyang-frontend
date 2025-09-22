// app/(mainPage)/EmployeeMainPage.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Modal,
  Animated,
  Dimensions,
  PanResponder
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// 실제 NFC 라이브러리 import 추가
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// ====== 레이아웃 상수 (수정됨) ======
const TOP_PADDING = 24;
const SIDE_PADDING = 20;  // 16 -> 20으로 증가
const SECTION_SPACING = 32;  // 섹션 간 간격 통일
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

// ====== NFC 관련 함수들 ======
// NFC 상태 확인 함수
const checkNFCAvailability = async (): Promise<{available: boolean, message: string}> => {
  try {
    const isSupported = await NfcManager.isSupported();
    if (!isSupported) {
      return { available: false, message: '이 기기는 NFC를 지원하지 않습니다.' };
    }

    const isEnabled = await NfcManager.isEnabled();
    if (!isEnabled) {
      return { available: false, message: 'NFC가 비활성화되어 있습니다. 설정에서 NFC를 활성화해주세요.' };
    }

    return { available: true, message: 'NFC 사용 가능' };
  } catch (error) {
    return { available: false, message: 'NFC 상태 확인 중 오류가 발생했습니다.' };
  }
};

// NFC 태그 읽기 함수
const readNFCTag = async (): Promise<boolean> => {
  try {
    await NfcManager.start();
    
    const isEnabled = await NfcManager.isEnabled();
    if (!isEnabled) {
      console.log('NFC가 비활성화되어 있습니다.');
      return false;
    }

    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'NFC 태그에 휴대폰을 가까이 대주세요',
    });
    
    const tag = await NfcManager.getTag();
    console.log('NFC Tag detected:', tag);

    const isValidTag = validateStoreTag(tag);
    return isValidTag;
    
  } catch (error) {
    console.error('NFC 읽기 실패:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('cancelled') || errorMessage.includes('timeout')) {
      return false;
    }
    return false;
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.log('NFC 해제 중 오류:', error);
    }
  }
};

// 매장 태그 검증 함수
const validateStoreTag = (tag: any): boolean => {
  try {
    if (!tag || !tag.id) {
      console.log('유효하지 않은 태그');
      return false;
    }

    console.log('태그 ID:', tag.id);
    console.log('태그 타입:', tag.techTypes);

    // 개발/테스트용: 모든 NFC 태그 허용
    return true;
    
  } catch (error) {
    console.error('태그 검증 중 오류:', error);
    return false;
  }
};

// ====== API 호출 함수들 ======
const fetchUserStores = async (): Promise<Store[]> => {
  return [
    { id: 1, name: '메가커피 선릉점' },
    { id: 2, name: '스타벅스 강남점' },
    { id: 3, name: '투썸플레이스 역삼점' }
  ];
};

const fetchWorkSession = async (storeId: number): Promise<WorkSession> => {
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
  return {
    monthlyEarning: 1000000,
    month: '8월'
  };
};

const handleCheckIn = async (storeId: number): Promise<void> => {
  console.log('출근 API 호출:', storeId);
};

const handleCheckOut = async (storeId: number): Promise<void> => {
  console.log('퇴근 API 호출:', storeId);
};

// ====== NFC 확인 모달 컴포넌트 ======
const NFCCheckModal = ({ 
  visible, 
  onClose, 
  onSuccess,
  isCheckIn 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
  isCheckIn: boolean;
}) => {
  const [nfcStatus, setNfcStatus] = useState<'waiting' | 'checking' | 'success' | 'error' | 'disabled'>('waiting');
  const [statusMessage, setStatusMessage] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 현재 시간 업데이트
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('ko-KR', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 모달 표시 시 NFC 상태 확인
  useEffect(() => {
    if (visible) {
      checkInitialNFCStatus();
    }
  }, [visible]);

  const checkInitialNFCStatus = async () => {
    const nfcCheck = await checkNFCAvailability();
    if (!nfcCheck.available) {
      setNfcStatus('disabled');
      setStatusMessage(nfcCheck.message);
    } else {
      setNfcStatus('waiting');
      setStatusMessage(`아직 ${isCheckIn ? '출근' : '퇴근'}하지 않았어요`);
    }
  };

  // 모달 애니메이션
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  // NFC 버튼 애니메이션
  useEffect(() => {
    if (nfcStatus === 'checking') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      scaleAnim.setValue(1);
    }
  }, [nfcStatus]);

  // 팬 제스처
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 0 && gestureState.dy > Math.abs(gestureState.dx);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleNFCCheck = async () => {
    if (nfcStatus === 'disabled') {
      const nfcCheck = await checkNFCAvailability();
      if (!nfcCheck.available) {
        setStatusMessage(nfcCheck.message);
        return;
      } else {
        setNfcStatus('waiting');
        setStatusMessage(`아직 ${isCheckIn ? '출근' : '퇴근'}하지 않았어요`);
        return;
      }
    }

    setNfcStatus('checking');
    setStatusMessage('NFC 태그를 확인 중...');
    
    try {
      const isValid = await readNFCTag();
      if (isValid) {
        setNfcStatus('success');
        setStatusMessage(`${isCheckIn ? '출근' : '퇴근'} 완료!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setNfcStatus('error');
        setStatusMessage('NFC 인식 실패. 다시 시도해주세요.');
        setTimeout(() => {
          setNfcStatus('waiting');
          setStatusMessage(`아직 ${isCheckIn ? '출근' : '퇴근'}하지 않았어요`);
        }, 2000);
      }
    } catch (error) {
      setNfcStatus('error');
      setStatusMessage('NFC 인식 실패. 다시 시도해주세요.');
      setTimeout(() => {
        setNfcStatus('waiting');
        setStatusMessage(`아직 ${isCheckIn ? '출근' : '퇴근'}하지 않았어요`);
      }, 2000);
    }
  };

  const getButtonText = () => {
    switch (nfcStatus) {
      case 'waiting': return `${isCheckIn ? '출근' : '퇴근'} 체크`;
      case 'checking': return '확인 중...';
      case 'success': return '완료';
      case 'error': return '재시도';
      case 'disabled': return 'NFC 설정 확인';
      default: return '';
    }
  };

  const getButtonColor = () => {
    switch (nfcStatus) {
      case 'waiting': return isCheckIn ? colors.subAccent : colors.main;
      case 'checking': return colors.text.secondary;
      case 'success': return '#4CAF50';
      case 'error': return colors.reject;
      case 'disabled': return colors.reject;
      default: return colors.main;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Animated.View
          style={[modalStyles.container, { transform: [{ translateY: slideAnim }] }]}
          {...panResponder.panHandlers}
        >
          <View style={modalStyles.dragHandle} />
          
          <View style={modalStyles.header}>
            <Text style={modalStyles.dayText}>월</Text>
            <View style={[modalStyles.dateCircle, { backgroundColor: isCheckIn ? colors.subAccent : colors.main }]}>
              <Text style={modalStyles.dateText}>8</Text>
            </View>
            <Text style={modalStyles.dayText}>화</Text>
          </View>

          <Text style={modalStyles.timeText}>{currentTime}</Text>

          <Text style={[
            modalStyles.statusText,
            nfcStatus === 'success' && { color: '#4CAF50' },
            nfcStatus === 'error' && { color: colors.reject },
            nfcStatus === 'disabled' && { color: colors.reject }
          ]}>
            {statusMessage}
          </Text>

          <View style={modalStyles.nfcContainer}>
            <Ionicons 
              name="wifi" 
              size={80} 
              color={nfcStatus === 'disabled' ? colors.reject : colors.text.secondary} 
            />
            <Text style={modalStyles.nfcLabel}>NFC</Text>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              style={[
                modalStyles.checkButton,
                { backgroundColor: getButtonColor() },
                nfcStatus === 'checking' && modalStyles.checkButtonDisabled
              ]}
              onPress={handleNFCCheck}
              disabled={nfcStatus === 'checking' || nfcStatus === 'success'}
            >
              <Text style={modalStyles.checkButtonText}>{getButtonText()}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ====== 컴포넌트들 (수정됨) ======
// 상단 섹션: 알림 버튼 + 마스코트/수익 정보
const TopSection = ({ salaryInfo }: { salaryInfo: SalaryInfo }) => {
  const router = useRouter();

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
          onPress={() => router.push('/notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      {/* 수익 정보 카드 */}
      <View style={styles.salaryCard}>
        <View style={styles.salaryContent}>
          <Text style={styles.monthText}>{salaryInfo.month}에</Text>
          <View style={styles.salaryAmountRow}>
            <Text style={styles.salaryLabel}>총 </Text>
            <Text style={styles.salaryAmount}>{salaryInfo.monthlyEarning.toLocaleString()}</Text>
            <Text style={styles.currencyText}>원</Text>
          </View>
          <Text style={styles.earnedText}>벌었습니다!</Text>
        </View>
        
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
      </ScrollView>
    </View>
  );
};

// 출퇴근 시간 섹션
const TimeSection = ({ workSession }: { workSession: WorkSession }) => {
  return (
    <View style={styles.section}>
      <View style={styles.timeCard}>
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
    </View>
  );
};

// 근무 진행 바 섹션
const WorkProgressSection = ({ workSession }: { workSession: WorkSession }) => {
  const progress = workSession.totalHours / workSession.targetHours;
  const progressPercentage = Math.min(progress * 100, 100);
  
  return (
    <View style={styles.section}>
      <View style={styles.progressCard}>
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
  const [showNFCModal, setShowNFCModal] = useState(false);

  const handleNFCSuccess = async () => {
    try {
      if (workSession.isWorking) {
        await handleCheckOut(storeId);
      } else {
        await handleCheckIn(storeId);
      }
      onAttendanceChange();
    } catch (error) {
      console.error('출퇴근 처리 중 오류:', error);
    }
  };

  const buttonText = workSession.isWorking ? '퇴근하기' : '출근하기';

  return (
    <>
      <View style={styles.buttonSection}>
        <Pressable
          style={({ pressed }) => [
            styles.attendanceButton,
            pressed && styles.attendanceButtonPressed
          ]}
          onPress={() => setShowNFCModal(true)}
        >
          <Text style={styles.attendanceButtonText}>{buttonText}</Text>
        </Pressable>
      </View>

      <NFCCheckModal
        visible={showNFCModal}
        onClose={() => setShowNFCModal(false)}
        onSuccess={handleNFCSuccess}
        isCheckIn={!workSession.isWorking}
      />
    </>
  );
};

// ====== 메인 컴포넌트 ======
export default function AlbaMainPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const [workSession, setWorkSession] = useState<WorkSession | null>(null);
  const [salaryInfo, setSalaryInfo] = useState<SalaryInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

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
    if (stores.length > 0) {
      loadWorkSession(stores[selectedStoreIndex].id);
    }
  };

  if (loading || !workSession || !salaryInfo) {
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

      <NavBar role="alba" activeKey="home" />
    </SafeAreaView>
  );
}

// ====== 스타일 (완전히 재구성) ======
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.text.reverse,  // 원래대로 흰색 배경
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: TOP_PADDING,
    paddingBottom: NAVBAR_HEIGHT + 120,  // 버튼 공간 확보
  },

  // 공통 섹션 스타일
  section: {
    marginBottom: SECTION_SPACING,
    paddingHorizontal: SIDE_PADDING,
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
  },
  notificationButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  // 수익 정보 카드
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
  mascotContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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

  // 출퇴근 시간 카드
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

  // 진행률 카드
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

  // 로딩
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 출근 버튼
  fixedButtonWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: NAVBAR_HEIGHT + 24,  // 네비바 위 여백만 24
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

// ====== 모달 스타일 ======
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.text.reverse,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: 400,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.text.secondary,
    borderRadius: 2,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 20,
  },
  dayText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },
  dateCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
  timeText: {
    fontSize: 48,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    marginBottom: 16,
  },
  statusText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  nfcContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  nfcLabel: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    marginTop: 8,
  },
  checkButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    opacity: 0.7,
  },
  checkButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
});