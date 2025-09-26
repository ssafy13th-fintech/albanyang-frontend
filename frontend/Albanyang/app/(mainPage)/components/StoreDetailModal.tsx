import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Modal, Pressable, Text, ScrollView, View, StyleSheet } from "react-native";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';


export interface StoreDetailInfo {
  realName: string;
  nickname: string;
  employmentStatus: string;
  hourlyWage: number;
  weeklyWorkDays: number;
  dailyWorkHours: number;
}

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

export default StoreDetailModal;

const detailModalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { backgroundColor: colors.text.reverse, borderRadius: 20, width: '100%', maxHeight: '80%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.disable },
  title: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary },
  closeButton: { padding: 4 },
  content: { padding: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.disable },
  label: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  value: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  editableValue: { color: colors.accent },
  buttonContainer: { padding: 20, paddingTop: 0 },
  button: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  editModeButton: { backgroundColor: colors.accent },
  editButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },
  editButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, backgroundColor: colors.disable },
  saveButton: { flex: 1, backgroundColor: colors.accent },
  cancelButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.secondary },
  saveButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse }
});
