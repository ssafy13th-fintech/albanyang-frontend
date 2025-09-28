import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useState } from "react";
import { patchMyTimesheetCheckout, createMyTimesheet } from "@/api/Timesheet";
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


const handleCheckOut = async (storeId: number, timesheetId: number): Promise<void> => {
  try {
    await patchMyTimesheetCheckout(storeId, timesheetId);
    console.log('퇴근 처리 완료:', storeId, timesheetId);
  } catch (error) {
    console.error('퇴근 처리 실패:', error);
    throw error;
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


const AttendanceSection = ({ workSession, storeId, onAttendanceChange }: Props) => {
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

const styles = StyleSheet.create({
  buttonSection: { paddingHorizontal: 20 },
  attendanceButton: { backgroundColor: colors.accent, borderRadius: 20, paddingVertical: 20, alignItems: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  attendanceButtonPressed: { backgroundColor: colors.main, transform: [{ scale: 0.98 }] },
  attendanceButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },
});


export default AttendanceSection;