// app/beforeLogin/SignUpThird.tsx
import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

export default function SignUpThird() {
  const [bankOpen, setBankOpen] = useState(false);
  const [bank, setBank] = useState<string | null>(null);
  const [acct, setAcct] = useState("");

  const banks = [
    "국민은행",
    "신한은행",
    "하나은행",
    "우리은행",
    "농협은행",
    "기업은행",
    "카카오뱅크",
    "토스뱅크",
  ];

  const onPickBank = (b: string) => {
    setBank(b);
    setBankOpen(false);
  };

  // 가입은 이미 완료된 상태 — 둘 다 최종 이동 처리
  const goNext = () => {
    // TODO: 실제 앱의 첫 화면/탭으로 교체
    // 예) router.replace("/(tabs)");
    router.replace("/albaMainPage/AlbaMainPage"); // 임시
  };

  const onSkip = () => {
    // 선택 정보 없이 마무리
    goNext();
  };

  const onSubmit = () => {
    // 선택 정보가 존재하면 제출(선택 입력이라 없을 수도 있음)
    // TODO: bank, acct 서버에 PATCH/POST
    // console.log({ bank, acct });
    goNext();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤딩 */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.title}>
              이제 이것만 입력하면{" "}
              <Text style={styles.accent}>된다 냥!!</Text>
            </Text>
          </View>

          {/* 은행 (드롭다운) */}
          <View style={{ marginBottom: 16, width: "100%", maxWidth: 360 }}>
            <Text style={styles.label}>은행</Text>
            <Pressable
              onPress={() => setBankOpen((v) => !v)}
              style={[styles.input, styles.selectRow]}
            >
              <Text style={bank ? styles.selectText : styles.selectPlaceholder}>
                {bank ?? "국민은행"}
              </Text>
              <Text style={styles.caret}>▾</Text>
            </Pressable>

            {bankOpen && (
              <View style={styles.dropdown}>
                {banks.map((b) => (
                  <Pressable
                    key={b}
                    onPress={() => onPickBank(b)}
                    style={({ pressed }) => [
                      styles.optionRow,
                      pressed && { backgroundColor: "#F1F5F9" },
                    ]}
                  >
                    <Text style={styles.optionText}>{b}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* 계좌번호 */}
          <View style={{ marginBottom: 6, width: "100%", maxWidth: 360 }}>
            <Text style={styles.label}>계좌번호</Text>
            <TextInput
              style={styles.input}
              placeholder="XX_XX"
              placeholderTextColor="#94a3b8"
              keyboardType="number-pad"
              value={acct}
              onChangeText={setAcct}
            />
          </View>

          {/* 회색 안내 문구 */}
          <Text style={styles.note}>
            계좌번호를 입력하지 않을 시{"\n"}서비스 사용에 불편함이 있을 수 있습니다.
          </Text>

          {/* 공간 채우기 */}
          <View style={{ flex: 1 }} />

          {/* 진행 점 (○ ○ ●) */}
          <View style={styles.dotsWrap}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>

          {/* 하단 버튼 2개: 건너뛰기 / 등록하기 */}
          <View style={styles.btnRow}>
            <Pressable
              onPress={onSkip}
              style={({ pressed }) => [
                styles.skipBtn,
                pressed && { opacity: 0.9, transform: [{ scale: 0.996 }] },
              ]}
            >
              <Text style={styles.skipText}>건너뛰기</Text>
            </Pressable>

            <Pressable
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.submitBtn,
                pressed && { opacity: 0.92, transform: [{ scale: 0.996 }] },
              ]}
            >
              <Text style={styles.submitText}>등록하기</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ORANGE = "#F97316";
const BLUE = "#CFE8FF";
const BLUE_BORDER = "#B6C7E6";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: "flex-start",
  },

  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    color: "#111827",
  },
  accent: { color: ORANGE },

  label: { fontSize: 14, color: "#111827", marginBottom: 6 },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  // select
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { color: "#111827" },
  selectPlaceholder: { color: "#94a3b8" },
  caret: { fontSize: 16, color: "#6B7280" },
  dropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  optionRow: { paddingVertical: 12, paddingHorizontal: 12 },
  optionText: { color: "#111827", fontSize: 14 },

  note: {
    marginTop: 6,
    marginBottom: 8,
    color: "#9CA3AF",
    fontSize: 12,
  },

  // dots
  dotsWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 16,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#E5F0FF",
    borderWidth: 1,
    borderColor: "#D6E6FF",
  },
  dotActive: { backgroundColor: ORANGE, borderColor: ORANGE },

  // bottom buttons
  btnRow: {
    width: "100%",
    maxWidth: 360,
    flexDirection: "row",
    gap: 14,
    alignSelf: "center",
  },
  skipBtn: {
    flex: 1,
    height: 54,
    borderRadius: 22,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: BLUE_BORDER,
    alignItems: "center",
    justifyContent: "center",
  },
  skipText: { color: "#111827", fontSize: 16, fontWeight: "800" },

  submitBtn: {
    flex: 1,
    height: 54,
    borderRadius: 22,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#1F2937", fontSize: 16, fontWeight: "800" },
});
