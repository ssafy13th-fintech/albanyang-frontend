import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";
import { registerNotification } from "./hooks/useWriteNotification";
import { getRoleFromToken } from "@/api/authorization/AuthTokenStorage";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

import BackHeader from "@/components/header/BackHeader";
import RoleBasedDropdown from "./components/storeSelector";

export default function NoticeRegistration() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedItemObj, setSelectedItemObj] = useState<any>(null);

  const { register, loading: isSubmitting } = registerNotification();

  useEffect(() => {
    const checkRole = async () => {
      const role = await getRoleFromToken();
      if (role == "EMPLOYEE") {
        Alert.alert("권한 없음", "직원 계정은 이 페이지에 접근할 수 없습니다.",
           [{ text: "확인", onPress: () => router.replace("/EmployeeMainPage") }]
          );
      }
    };

    checkRole();
  }, []);

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        "작성 취소",
        "작성중인 내용이 있습니다. 정말 취소하시겠습니까?",
        [
          { text: "계속 작성", style: "cancel" },
          { text: "취소", style: "destructive", onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("알림", "제목을 입력해주세요.");
      return;
    }
    if (!selectedItemObj) {
      Alert.alert("알림", "가게를 선택해주세요.");
      return;
    }

    try {
      const response = await register(selectedItemObj.id, {
        title: title,
        content: content,
      });

      router.push({
        pathname: '/ViewNotificationDetail',
        params: { storeId: selectedItemObj.id, notificationId: response.id },
      });


    } catch (err) {
      Alert.alert("오류", "공지사항 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <BackHeader headerText="공지 등록" />
      <View style={styles.container}>
        {/* 가게 선택 */}
        <RoleBasedDropdown
          selectedItem={selectedItemObj?.name || "매장을 선택해주세요"}
          onSelect={setSelectedItemObj}
          style={styles.storeInput}
        />

        {/* 제목 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>제목</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="제목을 입력해주세요"
            placeholderTextColor={colors.text.secondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            autoCapitalize="sentences"
          />
        </View>

        {/* 내용 입력 */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>내용</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="내용을 입력해주세요"
            placeholderTextColor={colors.text.secondary}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            maxLength={1000}
            autoCapitalize="sentences"
          />
        </View>

        {/* 하단 버튼 */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
            onPress={handleCancel}
            disabled={isSubmitting}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.submitButtonPressed,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={[styles.submitButtonText, isSubmitting && styles.submitButtonTextDisabled]}>
              {isSubmitting ? "등록중..." : "등록"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: '#FFF' },
  container: { flex: 1, paddingHorizontal: 16, gap: 24 },
  inputSection: { gap: 8 },
  inputLabel: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  storeInput: { backgroundColor: colors.text.reverse, borderRadius: 12, borderWidth: 1.5, borderColor: colors.main, minHeight: 45, paddingHorizontal: 16 },
  titleInput: { backgroundColor: colors.text.reverse, borderRadius: 12, borderWidth: 1.5, borderColor: colors.main, paddingHorizontal: 16, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.thin1, color: colors.text.primary },
  contentInput: { backgroundColor: colors.text.reverse, borderRadius: 12, borderWidth: 2, borderColor: colors.main, paddingHorizontal: 16, paddingVertical: 16, minHeight: 100, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.thin1, color: colors.text.primary },
  buttonContainer: { flexDirection: "row", gap: 12, marginTop: 24 },
  cancelButton: { flex: 1, backgroundColor: "transparent", borderRadius: 30, borderWidth: 2, borderColor: colors.main, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  cancelButtonPressed: { backgroundColor: colors.disable },
  cancelButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.main },
  submitButton: { flex: 1, backgroundColor: colors.main, borderRadius: 30, paddingVertical: 16, alignItems: "center", justifyContent: "center" },
  submitButtonPressed: { backgroundColor: colors.accent },
  submitButtonDisabled: { backgroundColor: colors.text.secondary },
  submitButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.reverse },
  submitButtonTextDisabled: { color: colors.text.reverse },
});

