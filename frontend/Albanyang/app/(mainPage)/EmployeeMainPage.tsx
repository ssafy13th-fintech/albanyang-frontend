// app/(mainPage)/EmployeeMainPage.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBell } from '@fortawesome/free-regular-svg-icons';

// API imports
import { getMe } from '@/api/Member';
import { getStores } from '@/api/Stores';
import { getMyTimesheets, createMyTimesheet, patchMyTimesheetCheckout } from '@/api/TimeSheet';
import { getStoreSchedules } from '@/api/Schedule';
import { getMyPayslips } from '@/api/EmployeePaylips';

// ====== 레이아웃 상수 ======
const TOP_PADDING = 16;
const SIDE_PADDING = 20;
const SECTION_SPACING = 32;
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ====== 타입 정의 ======
interface Store {
  id: number;
  name: string;
}

interface WorkSession {
  storeId: number;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  isWorking: boolean;
  totalHours: number;
  targetHours: number;
  currentTimesheetId?: number;
}

interface SalaryInfo {
  monthlyEarning: number;
  month: string;
}

interface UserAccountInfo {
  hasAccount: boolean;
  accountNumber?: string;
}

interface StoreDetailInfo {
  realName: string;
  nickname: string;
  employmentStatus: string;
  hourlyWage: number;
  weeklyWorkDays: number;
  dailyWorkHours: number;
}

// ====== NFC 관련 함수들 ======
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

const validateStoreTag = (tag: any): boolean => {
  try {
    if (!tag || !tag.id) {
      console.log('유효하지 않은 태그');
      return false;
    }

    console.log('태그 ID:', tag.id);
    console.log('태그 타입:', tag.techTypes);

    return true;
    
  } catch (error) {
    console.error('태그 검증 중 오류:', error);
    return false;
  }
};

// ====== API 호출 함수들 ======
const fetchUserAccountInfo = async (): Promise<UserAccountInfo> => {
  try {
    const userData = await getMe();
    return {
      hasAccount: !!userData.data.account,
      accountNumber: userData.data.account
    };
  } catch (error) {
    console.error('계좌 정보 조회 실패:', error);
    return { hasAccount: false };
  }
};

const fetchUserStores = async (): Promise<Store[]> => {
  try {
    const storesData = await getStores();
    return storesData.data.stores.map(store => ({
      id: store.id,
      name: store.name
    }));
  } catch (error) {
    console.error('매장 정보 조회 실패:', error);
    return [];
  }
};

const fetchWorkSession = async (storeId: number): Promise<WorkSession> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const timesheetData = await getMyTimesheets(storeId, { date: today });
    const todayTimesheet = timesheetData.data.timesheets[0];
    
    const scheduleData = await getStoreSchedules(storeId, undefined, today);
    const mySchedule = scheduleData.data.schedules.find(s => s.staffId === todayTimesheet?.staffId);
    
    let totalHours = 0;
    let isWorking = false;
    
    if (todayTimesheet) {
      if (todayTimesheet.arrivedAt && todayTimesheet.leftAt) {
        totalHours = todayTimesheet.commuteTime / 60;
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
      checkInTime: todayTimesheet?.arrivedAt!,
      checkOutTime: todayTimesheet?.leftAt!,
      isWorking,
      totalHours: Math.max(totalHours, 0),
      targetHours: mySchedule?.workHours || 8,
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
    
    const payslipsData = await getMyPayslips(storeId, currentYear);
    
    const monthlyPayslips = payslipsData.data.payslips.filter(payslip => {
      const payDate = new Date(payslip.payDate);
      return payDate.getMonth() + 1 === currentMonth;
    });
    
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

const handleCheckIn = async (storeId: number): Promise<void> => {
  try {
    await createMyTimesheet(storeId);
    console.log('출근 처리 완료:', storeId);
  } catch (error) {
    console.error('출근 처리 실패:', error);
    throw error;
  }
};

const handleCheckOut = async (storeId: number, timesheetId: number): Promise<void> => {
  try {
    await patchMyTimesheetCheckout(storeId, timesheetId);
    console.log('퇴근 처리 완료:', storeId, timesheetId);
  } catch (error) {
    console.error('퇴근 처리 실패:', error);
    throw error;
  }
};

// ====== 매장 상세 정보 모달 ======
const StoreDetailModal = ({
  visible,
  onClose,
  storeId,
  storeName
}: {
  visible: boolean;
  onClose: () => void;
  storeId: number;
  storeName: string;
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [detailInfo, setDetailInfo] = useState<StoreDetailInfo | null>(null);
  const [editedInfo, setEditedInfo] = useState<StoreDetailInfo | null>(null);

  useEffect(() => {
    if (visible && storeId) {
      // 실제로는 API에서 매장별 상세 정보 가져오기
      // const info = await fetchStoreDetail(storeId);
      // 임시 더미 데이터
      const info: StoreDetailInfo = {
        realName: "김철수",
        nickname: "철수",
        employmentStatus: "정규직",
        hourlyWage: 12000,
        weeklyWorkDays: 5,
        dailyWorkHours: 8
      };
      setDetailInfo(info);
      setEditedInfo(info);
    }
  }, [visible, storeId]);

  const handleSave = () => {
    if (editedInfo) {
      setDetailInfo(editedInfo);
      setIsEditMode(false);
      Alert.alert('저장 완료', '정보가 업데이트되었습니다.');
      // 실제로는 여기서 API 호출
    }
  };

  const handleCancel = () => {
    setEditedInfo(detailInfo);
    setIsEditMode(false);
  };

  if (!detailInfo) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={detailModalStyles.overlay}>
        <View style={detailModalStyles.container}>
          <View style={detailModalStyles.header}>
            <Text style={detailModalStyles.title}>{storeName}</Text>
            <Pressable onPress={onClose} style={detailModalStyles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView style={detailModalStyles.content} showsVerticalScrollIndicator={false}>
            <View style={detailModalStyles.infoRow}>
              <Text style={detailModalStyles.label}>본명</Text>
              <Text style={detailModalStyles.value}>{detailInfo.realName}</Text>
            </View>

            <View style={detailModalStyles.infoRow}>
              <Text style={detailModalStyles.label}>닉네임</Text>
              {isEditMode ? (
                <Text style={[detailModalStyles.value, detailModalStyles.editableValue]}>
                  {editedInfo?.nickname}
                </Text>
              ) : (
                <Text style={detailModalStyles.value}>{detailInfo.nickname}</Text>
              )}
            </View>

            <View style={detailModalStyles.infoRow}>
              <Text style={detailModalStyles.label}>고용상태</Text>
              {isEditMode ? (
                <Text style={[detailModalStyles.value, detailModalStyles.editableValue]}>
                  {editedInfo?.employmentStatus}
                </Text>
              ) : (
                <Text style={detailModalStyles.value}>{detailInfo.employmentStatus}</Text>
              )}
            </View>

            <View style={detailModalStyles.infoRow}>
              <Text style={detailModalStyles.label}>시급</Text>
              {isEditMode ? (
                <Text style={[detailModalStyles.value, detailModalStyles.editableValue]}>
                  {editedInfo?.hourlyWage.toLocaleString()}원
                </Text>
              ) : (
                <Text style={detailModalStyles.value}>{detailInfo.hourlyWage.toLocaleString()}원</Text>
              )}
            </View>

            <View style={detailModalStyles.infoRow}>
              <Text style={detailModalStyles.label}>주간근무일수</Text>
              <Text style={detailModalStyles.value}>{detailInfo.weeklyWorkDays}일</Text>
            </View>

            <View style={detailModalStyles.infoRow}>
              <Text style={detailModalStyles.label}>하루근무시간</Text>
              <Text style={detailModalStyles.value}>{detailInfo.dailyWorkHours}시간</Text>
            </View>
          </ScrollView>

          <View style={detailModalStyles.buttonContainer}>
            {isEditMode ? (
              <View style={detailModalStyles.editButtons}>
                <Pressable
                  style={[detailModalStyles.button, detailModalStyles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={detailModalStyles.cancelButtonText}>취소</Text>
                </Pressable>
                <Pressable
                  style={[detailModalStyles.button, detailModalStyles.saveButton]}
                  onPress={handleSave}
                >
                  <Text style={detailModalStyles.saveButtonText}>저장</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[detailModalStyles.button, detailModalStyles.editModeButton]}
                onPress={() => setIsEditMode(true)}
              >
                <Text style={detailModalStyles.editButtonText}>수정하기</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
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
              <Text style={modalStyles.dateText}>{new Date().getDate()}</Text>
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

// ====== 컴포넌트들 ======
const TopSection = ({ 
  accountInfo, 
  salaryInfo 
}: { 
  accountInfo: UserAccountInfo | null;
  salaryInfo: SalaryInfo | null;
}) => {
  const router = useRouter();

  return (
    <View style={styles.section}>
      <View style={styles.notificationRow}>
        <View style={{ flex: 1 }} />
        <Pressable
          style={({ pressed }) => [
            styles.notificationButton,
            pressed && styles.notificationButtonPressed
          ]}
          onPress={() => {
            router.push('/ViewNotification');
          }}
        >
          <FontAwesomeIcon icon={faBell} size={24} color={colors.text.primary} />
        </Pressable>
      </View>

      <View style={styles.salaryCard}>
        <View style={styles.salaryContent}>
          {accountInfo?.hasAccount ? (
            <>
              <Text style={styles.monthText}>{salaryInfo?.month || '이번 달'}에</Text>
              <View style={styles.salaryAmountRow}>
                <Text style={styles.salaryLabel}>총 </Text>
                <Text style={styles.salaryAmount}>{salaryInfo?.monthlyEarning.toLocaleString() || '0'}</Text>
                <Text style={styles.currencyText}>원</Text>
              </View>
              <Text style={styles.earnedText}>벌었습니다!</Text>
            </>
          ) : (
            <View style={styles.noAccountContainer}>
              <Text style={styles.noAccountTitle}>계좌를 등록해주세요</Text>
              <Text style={styles.noAccountSubtitle}>마이페이지에서 계좌를 등록해주세요</Text>
            </View>
          )}
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

const StoreSelectionSection = ({ 
  stores, 
  selectedStoreIndex, 
  onStoreSelect,
  onStoreInfoPress 
}: { 
  stores: Store[], 
  selectedStoreIndex: number, 
  onStoreSelect: (index: number) => void,
  onStoreInfoPress: (storeId: number, storeName: string) => void
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
      
      <Pressable 
        style={styles.detailButton}
        onPress={() => onStoreInfoPress(stores[selectedStoreIndex].id, stores[selectedStoreIndex].name)}
      >
        <Text style={styles.detailButtonText}>상세보기</Text>
      </Pressable>
    </View>
  );
};

const TimeSection = ({ workSession }: { workSession: WorkSession | null }) => {
  return (
    <View style={styles.section}>
      <View style={styles.timeCard}>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>출근시간</Text>
          <Text style={styles.timeValue}>
            {workSession?.checkInTime || '--:--:--'}
          </Text>
        </View>
        <View style={styles.timeItem}>
          <Text style={styles.timeLabel}>퇴근시간</Text>
          <Text style={styles.timeValue}>
            {workSession?.checkOutTime || (workSession?.isWorking ? '근무 중' : '--:--:--')}
          </Text>
        </View>
      </View>
    </View>
  );
};

const WorkProgressSection = ({ workSession }: { workSession: WorkSession | null }) => {
  if (!workSession) return null;
  
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

const AttendanceSection = ({ 
  workSession, 
  storeId, 
  onAttendanceChange 
}: { 
  workSession: WorkSession | null, 
  storeId: number, 
  onAttendanceChange: () => void 
}) => {
  const [showNFCModal, setShowNFCModal] = useState(false);

  const handleNFCSuccess = async () => {
    try {
      if (workSession?.isWorking) {
        if (workSession.currentTimesheetId) {
          await handleCheckOut(storeId, workSession.currentTimesheetId);
        }
      } else {
        await handleCheckIn(storeId);
      }
      onAttendanceChange();
    } catch (error) {
      console.error('출퇴근 처리 중 오류:', error);
      Alert.alert('오류', '출퇴근 처리 중 오류가 발생했습니다.');
    }
  };

  const buttonText = workSession?.isWorking ? '퇴근하기' : '출근하기';

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
        isCheckIn={!workSession?.isWorking}
      />
    </>
  );
};

const NoStoreSection = () => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyTitle}>알바를 구해봅시다!</Text>
        <Text style={styles.emptySubtitle}>등록된 사업장이 없습니다</Text>
      </View>
    </View>
  );
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
    if (stores.length > 0) {
      loadWorkSession(stores[selectedStoreIndex].id);
      loadSalaryInfo(stores[selectedStoreIndex].id);
    }
  }, [selectedStoreIndex, stores]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [accountData, storesData] = await Promise.all([
        fetchUserAccountInfo(),
        fetchUserStores()
      ]);
      
      setAccountInfo(accountData);
      setStores(storesData);
      
      if (storesData.length > 0) {
        await Promise.all([
          loadWorkSession(storesData[0].id),
          loadSalaryInfo(storesData[0].id)
        ]);
      }
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

  const handleStoreSelect = (index: number) => {
    setSelectedStoreIndex(index);
  };

  const handleStoreInfoPress = (storeId: number, storeName: string) => {
    setSelectedStoreForDetail({ id: storeId, name: storeName });
    setShowStoreDetailModal(true);
  };

  const handleAttendanceChange = () => {
    if (stores.length > 0) {
      loadWorkSession(stores[selectedStoreIndex].id);
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

  if (stores.length === 0) {
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
          <TopSection accountInfo={accountInfo} salaryInfo={null} />
          <NoStoreSection />
        </ScrollView>
        <NavBar role="alba" activeKey="home" />
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
        <TopSection accountInfo={accountInfo} salaryInfo={salaryInfo} />
        <StoreSelectionSection 
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
        storeId={selectedStoreForDetail?.id || 0}
        storeName={selectedStoreForDetail?.name || ''}
      />

      <View style={styles.fixedButtonWrapper}>
        <AttendanceSection 
          workSession={workSession}
          storeId={stores[selectedStoreIndex]?.id || 0}
          onAttendanceChange={handleAttendanceChange}
        />
      </View>

      <NavBar role="alba" activeKey="home" />
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

const detailModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
  },
  title: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
  },
  label: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },
  value: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
  },
  editableValue: {
    color: colors.accent,
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editModeButton: {
    backgroundColor: colors.accent,
  },
  editButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.disable,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.accent,
  },
  cancelButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.secondary,
  },
  saveButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
});