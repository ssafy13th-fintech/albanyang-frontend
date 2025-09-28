import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useState } from "react";
import { checkInTimesheet, checkOutTimesheet } from "@/api/Timesheet";
import NFCCheckModal from "./NFCCheckModal";

const SIDE_PADDING = 20;

interface WorkSession {
    storeId: number;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    isWorking: boolean;
    totalHours: number;
    targetHours: number;
    currentTimesheetId?: number;
}

interface Props{
    workSession: WorkSession | null, 
    storeId: number, 
    onAttendanceChange: () => void 
}

/**
 * 출퇴근 시스템 동작 방식:
 * 
 * 1. 스케줄 생성 시 timesheet도 함께 생성됨 (스웨거 참조)
 * 2. 출근: PATCH /api/v1/stores/{store-id}/timesheets/{timesheet-id}/arrive
 * 3. 퇴근: PATCH /api/v1/stores/{store-id}/timesheets/{timesheet-id}/leave
 * 4. timesheetId는 스케줄에서 가져오거나 오늘 날짜 timesheet에서 조회
 */

const handleCheckOut = async (storeId: number, timesheetId: number): Promise<void> => {
  try {
    const response = await checkOutTimesheet(storeId, timesheetId);
    console.log('퇴근 처리 완료:', response);
  } catch (error) {
    console.error('퇴근 처리 실패:', error);
    throw error;
  }
};

const handleCheckIn = async (storeId: number, timesheetId: number): Promise<void> => {
  try {
    const response = await checkInTimesheet(storeId, timesheetId);
    console.log('출근 처리 완료:', response);
  } catch (error) {
    console.error('출근 처리 실패:', error);
    throw error;
  }
};

const AttendanceSection = ({ workSession, storeId, onAttendanceChange }: Props) => {
  const [showNFCModal, setShowNFCModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNFCSuccess = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // timesheetId가 없으면 처리할 수 없음
      if (!workSession?.currentTimesheetId) {
        throw new Error('오늘의 스케줄을 찾을 수 없습니다. 사장님께 스케줄 등록을 요청해주세요.');
      }

      if (workSession?.isWorking) {
        // 퇴근 처리
        await handleCheckOut(storeId, workSession.currentTimesheetId);
        Alert.alert('퇴근 완료', '수고하셨습니다!');
      } else {
        // 출근 처리
        await handleCheckIn(storeId, workSession.currentTimesheetId);
        Alert.alert('출근 완료', '오늘도 화이팅!');
      }
      
      // 성공 시 부모 컴포넌트에 변경 알림
      onAttendanceChange();
      
    } catch (error) {
      console.error('출퇴근 처리 중 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      Alert.alert('오류', `출퇴근 처리 중 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonText = () => {
    if (isProcessing) return '처리 중...';
    if (!workSession?.currentTimesheetId) return '스케줄 없음';
    return workSession?.isWorking ? '퇴근하기' : '출근하기';
  };

  const getButtonStyle = () => {
    if (isProcessing || !workSession?.currentTimesheetId) {
      return [styles.attendanceButton, styles.attendanceButtonDisabled];
    }
    return styles.attendanceButton;
  };

  const isButtonDisabled = () => {
    return isProcessing || !workSession?.currentTimesheetId;
  };

  return (
    <>
      <View style={styles.buttonSection}>
        <Pressable
          style={({ pressed }) => [
            ...getButtonStyle(),
            pressed && !isButtonDisabled() && styles.attendanceButtonPressed
          ]}
          onPress={() => !isButtonDisabled() && setShowNFCModal(true)}
          disabled={isButtonDisabled()}
        >
          <Text style={styles.attendanceButtonText}>
            {getButtonText()}
          </Text>
        </Pressable>
        
        {/* 스케줄이 없을 때 안내 메시지 */}
        {!workSession?.currentTimesheetId && (
          <Text style={styles.noScheduleText}>
            오늘 등록된 스케줄이 없습니다. 사장님께 문의해주세요.
          </Text>
        )}
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

const styles = StyleSheet.create({
  buttonSection: { 
    paddingHorizontal: 20 
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
    elevation: 8 
  },
  attendanceButtonPressed: { 
    backgroundColor: colors.main, 
    transform: [{ scale: 0.98 }] 
  },
  attendanceButtonDisabled: {
    backgroundColor: colors.text.secondary,
    opacity: 0.7
  },
  attendanceButtonText: { 
    fontSize: sizes.normalText, 
    fontFamily: FONTS.jamsil.bold5, 
    color: colors.text.reverse 
  },
  noScheduleText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default AttendanceSection;