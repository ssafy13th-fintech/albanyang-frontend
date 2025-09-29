// app/(mainPage)/NextToEmployerMainPage.tsx
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';
import { StaffDetail } from '@/api/staff/getStaff';
import { updateStaff, UpdateStaff } from '@/api/staff/UpdateStaff';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const StaffDetailModal = ({
  visible,
  staff,
  storeId,
  onClose,
  onSave
}: {
  visible: boolean;
  staff: StaffDetail | null;
  storeId: string;
  onClose: () => void;
  onSave?: (updatedStaff: StaffDetail) => void;
}) => {
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<'재직' | '퇴사' | '예정'>();
  const [taxType, setTaxType] = useState<'4대보험' | '사업소득세' | '없음'>();
  const [wage, setWage] = useState('');
  const [weeklyWorkingDay, setWeeklyWorkingDay] = useState('');
  const [workingHours, setWorkingHours] = useState('');

  // 상태 / 세금 타입 코드 변환
  const getStatusCode = (status: '재직' | '퇴사' | '예정') => 
    status === '예정' ? 1 : status === '재직' ? 2 : 3;

  const getTaxCode = (tax: '4대보험' | '사업소득세' | '없음') =>
    tax === '4대보험' ? 1 : tax === '사업소득세' ? 2 : 3;

  // 모달 열릴 때 staff 값으로 초기화
  useEffect(() => {
    if (staff) {
      setNickname(staff.nickname || '');
      setEmploymentStatus(staff.status || 1);
      setTaxType(staff.taxType || 3);
      setWage(staff.wage?.toString() || '');
      setWeeklyWorkingDay(staff.weeklyWorkingDay?.toString() || '');
      setWorkingHours(staff.workingHours?.toString() || '');
      setEditMode(false);
    }
  }, [staff]);

  // 편집모드 시작 시 staff 값으로 초기화
  useEffect(() => {
    if (editMode && staff) {
      setNickname(staff.nickname || '');
      setEmploymentStatus(staff.status || 2);
      setTaxType(staff.taxType || 3);
      setWage(staff.wage?.toString() || '');
      setWeeklyWorkingDay(staff.weeklyWorkingDay?.toString() || '');
      setWorkingHours(staff.workingHours?.toString() || '');
    }
  }, [editMode, staff]);

  if (!staff) return null;

  const handleSave = async () => {
    try {
      const w = Number(wage);
      const weekly = Number(weeklyWorkingDay);
      const hours = Number(workingHours);

      if (!nickname.trim()) return Alert.alert('오류', '닉네임을 입력하세요.');
      if (isNaN(w) || w < 10030) return Alert.alert('오류', '시급은 최소 10,030원 이상이어야 합니다.');
      if (isNaN(weekly) || weekly < 1 || weekly > 7) return Alert.alert('오류', '주간 근무일수는 1~7일이어야 합니다.');
      if (isNaN(hours) || hours < 1 || hours > 24) return Alert.alert('오류', '하루 근무시간은 1~24시간이어야 합니다.');

      const payload: UpdateStaff = {
        nickname: nickname.trim(),
        status: getStatusCode(employmentStatus!),
        taxType: getTaxCode(taxType!),
        wage: w,
        weeklyWorkingDay: weekly,
        workingHours: hours,
      };

      await updateStaff(Number(storeId), staff.id, payload);
      Alert.alert('저장 완료', '직원 정보가 성공적으로 저장되었습니다.');
      setEditMode(false);
      const updatedStaff: StaffDetail = {
        ...staff!,
        nickname: payload.nickname,
        status: employmentStatus!,
        taxType: taxType!,
        wage: w,
        weeklyWorkingDay: weekly,
        workingHours: hours,
      };
      onClose();
      onSave?.(updatedStaff);
    } catch (err) {
      
      Alert.alert('오류', '직원 정보 저장에 실패했습니다.');
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>직원 정보</Text>
            <Pressable onPress={onClose} style={styles.modalClose}>
                <FontAwesomeIcon icon={faXmark} size={18} color={colors.text.secondary}/>
            </Pressable>
          </View>

          {/* 본명 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>본명</Text>
            <Text style={styles.infoVal}>{staff.name}</Text>
          </View>

          {/* 닉네임 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>닉네임</Text>
            {editMode ? (
              <TextInput
                style={styles.inputBox}
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임 입력"
              />
            ) : (
              <Text style={styles.infoVal}>{staff.nickname || '미등록'}</Text>
            )}
          </View>

          {/* 전화번호 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>전화번호</Text>
            <Text style={styles.infoVal}>{staff.phone}</Text>
          </View>

          {/* 고용상태 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>고용상태</Text>
            {editMode ? (
              <View style={styles.segmentWrap}>
                {(['재직', '퇴사', '예정'] as const).map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => setEmploymentStatus(opt)}
                    style={[styles.segment, employmentStatus === opt && styles.segmentActive]}
                  >
                    <Text style={[styles.segmentText, employmentStatus === opt && styles.segmentTextActive]}>
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.infoVal}>{staff.status}</Text>
            )}
          </View>

          {/* 시급 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>시급</Text>
            {editMode ? (
              <TextInput
                style={styles.inputBox}
                value={wage}
                onChangeText={setWage}
                keyboardType="numeric"
                placeholder="시급 입력"
              />
            ) : (
              <Text style={styles.infoVal}>
                {staff.wage ? `${staff.wage.toLocaleString()}원` : '미설정'}
              </Text>
            )}
          </View>

          {/* 세금 유형 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>세금 유형</Text>
            {editMode ? (
              <View style={styles.segmentWrap}>
                {(['4대보험', '사업소득세', '없음'] as const).map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => setTaxType(opt)}
                    style={[styles.segment, taxType === opt && styles.segmentActive]}
                  >
                    <Text style={[styles.segmentText, taxType === opt && styles.segmentTextActive]}>
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.infoVal}>{staff.taxType}</Text>
            )}
          </View>

          {/* 주간근무일수 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>주간근무일수</Text>
            {editMode ? (
              <TextInput
                style={styles.inputBox}
                value={weeklyWorkingDay}
                onChangeText={setWeeklyWorkingDay}
                keyboardType="numeric"
                placeholder="주간 근무일수"
              />
            ) : (
              <Text style={styles.infoVal}>{staff.weeklyWorkingDay ? `${staff.weeklyWorkingDay}일` : '미등록'}</Text>
            )}
          </View>

          {/* 하루근무시간 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>하루근무시간</Text>
            {editMode ? (
              <TextInput
                style={styles.inputBox}
                value={workingHours}
                onChangeText={setWorkingHours}
                keyboardType="numeric"
                placeholder="하루 근무시간"
              />
            ) : (
              <Text style={styles.infoVal}>{staff.workingHours ? `${staff.workingHours}시간` : '미등록'}</Text>
            )}
          </View>

          {/* 버튼 */}
          {editMode ? (
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>저장</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.editBtn} onPress={() => setEditMode(true)}>
              <Text style={styles.editBtnText}>수정</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default StaffDetailModal;



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.text.reverse },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: colors.text.reverse, borderRadius: 16, padding: 16, width: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  modalClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.disable, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, gap: 12 },
  infoKey: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, flex: 1 },
  infoVal: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, textAlign: 'right', flex: 2 },
  inputBox: { flex: 2, borderWidth: 1, borderColor: colors.disable, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, textAlign: 'right' },
  segmentWrap: { flex: 2, flexDirection: 'row', backgroundColor: colors.disable, borderRadius: 8, padding: 2 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 6 },
  segmentActive: { backgroundColor: colors.main },
  segmentText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  segmentTextActive: { color: colors.text.reverse, fontFamily: FONTS.jamsil.medium4 },
  editBtn: { marginTop: 16, backgroundColor: colors.disable, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  editBtnText: { color: colors.text.primary, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4 },
  saveBtn: { marginTop: 16, backgroundColor: colors.main, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  saveBtnText: { color: colors.text.reverse, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4 },
});
