import { useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from "expo-router";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

interface NoticeData {
  storeId: number;
  title: string;
  content: string;
}

export default function NoticeRegistration() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL 파라미터에서 매장 정보 받기
  const storeId = parseInt(params.storeId as string) || 1;
  const storeName = (params.storeName as string) || "매장";

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

    if (!content.trim()) {
      Alert.alert("알림", "내용을 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const noticeData: NoticeData = {
        storeId,
        title: title.trim(),
        content: content.trim()
      };

      // API 호출 (실제 구현 시)
      await submitNotice(noticeData);
      
      Alert.alert("등록 완료", "공지사항이 등록되었습니다.", [
        { text: "확인", onPress: () => router.back() }
      ]);
      
    } catch (error) {
      console.error('공지 등록 실패:', error);
      Alert.alert("오류", "공지사항 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <View style={[styles.container, { 
        paddingHorizontal: insets.left === 0 ? 20 : insets.left,
        paddingTop: insets.top + 8
      }]}>
        
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable
            onPress={handleCancel}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed
            ]}
          >
            <Image 
              source={require("@/assets/images/icon/icon_back.png")}
              style={styles.backIcon}
            />
          </Pressable>
          
          <Text style={styles.headerTitle}>공지 등록</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* 입력 폼 */}
        <View style={styles.formContainer}>
          {/* 제목 입력 */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>제목</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="제목을 선택해 주세요"
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
        </View>

        {/* 하단 여백 */}
        <View style={styles.spacer} />

        {/* 하단 버튼들 */}
        <View style={[styles.buttonContainer, { 
          marginBottom: insets.bottom + 20 
        }]}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.cancelButtonPressed
            ]}
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
            <Text style={[
              styles.submitButtonText,
              isSubmitting && styles.submitButtonTextDisabled
            ]}>
              {isSubmitting ? "등록중..." : "등록"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

// API 함수 (실제 구현 시 별도 파일로 분리)
const submitNotice = async (noticeData: NoticeData): Promise<void> => {
  // 실제 API 호출 로직
  console.log('공지 등록:', noticeData);
  
  // 임시 지연 (실제 API 호출 시뮬레이션)
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 성공 시 응답 처리
  return Promise.resolve();
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 24,
  },

  backButton: {
    padding: 8,
    borderRadius: 8,
  },

  backButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  backIcon: {
    width: 24,
    height: 24,
  },

  headerTitle: {
    flex: 1,
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    textAlign: "center",
  },

  headerSpacer: {
    width: 40, // 뒤로가기 버튼과 동일한 크기로 중앙 정렬
  },

  formContainer: {
    gap: 24,
  },

  inputSection: {
    gap: 12,
  },

  inputLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },

  titleInput: {
    backgroundColor: colors.text.reverse,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.main,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },

  contentInput: {
    backgroundColor: colors.text.reverse,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.main,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    height: 200,
  },

  spacer: {
    flex: 1,
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.main,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelButtonPressed: {
    backgroundColor: colors.disable,
  },

  cancelButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.main,
  },

  submitButton: {
    flex: 1,
    backgroundColor: colors.main,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  submitButtonPressed: {
    backgroundColor: colors.accent,
  },

  submitButtonDisabled: {
    backgroundColor: colors.text.secondary,
  },

  submitButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.reverse,
  },

  submitButtonTextDisabled: {
    color: colors.text.reverse,
  },
});