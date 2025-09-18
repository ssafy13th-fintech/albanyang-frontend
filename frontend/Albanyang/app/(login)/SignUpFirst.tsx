// app/beforeLogin/SignUpFirst.tsx
import { useState, useMemo } from "react";
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
import { router } from "expo-router"; // 다음 단계 연결 시 사용

export default function SignUpFirst() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [checking, setChecking] = useState(false);
  // isDup: null(미확인), true(중복), false(사용 가능)
  const [isDup, setIsDup] = useState<null | boolean>(null);

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const pwBothTyped = pw.length > 0 && pw2.length > 0;
  const pwMatch = pwBothTyped && pw === pw2;

  const canNext = useMemo(() => {
    // 실제론: 이메일 중복검사 완료 && 사용가능 && 비번 조건 통과
    return emailValid && isDup === false && pwMatch;
  }, [emailValid, isDup, pwMatch]);

  const onCheckDuplicate = async () => {
    // TODO: 실제 API 연동으로 교체하세요
    setChecking(true);
    setTimeout(() => {
      // 데모 규칙: 이메일 형식이 아니면 실패, 형식이면 사용 가능 처리
      if (!emailValid) {
        setIsDup(true); // 형식 불량 → 중복 취급
      } else {
        setIsDup(false); // 사용 가능
      }
      setChecking(false);
    }, 500);
  };

  const onNext = () => {
    if (!canNext) return;
    router.push("/beforeLogin/SignUpSecond");
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
              어서오라 <Text style={styles.accent}>냥!</Text>
            </Text>
            <Text style={styles.title}>
              함께 하자 <Text style={styles.accent}>냥!</Text>
            </Text>
          </View>

          {/* 아이디(이메일) */}
          <View style={{ marginBottom: 18, width: "100%", maxWidth: 360 }}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>아이디(이메일)</Text>
              <Pressable
                onPress={onCheckDuplicate}
                disabled={!email || checking}
                style={[
                  styles.smallBtn,
                  (!email || checking) && styles.smallBtnDisabled,
                ]}
              >
                <Text style={styles.smallBtnText}>
                  {checking ? "확인중…" : "중복확인"}
                </Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.input}
              placeholder="이메일 주소"
              placeholderTextColor="#94a3b8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setIsDup(null);
              }}
            />
            {isDup === true && (
              <Text style={styles.errorLight}>이미 사용 중이거나 형식이 올바르지 않습니다.</Text>
            )}
            {isDup === false && (
              <Text style={styles.ok}>사용 가능한 아이디입니다.</Text>
            )}
          </View>

          {/* 비밀번호 */}
          <View style={{ width: "100%", maxWidth: 360 }}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={pw}
              onChangeText={setPw}
            />
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="비밀번호 확인"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={pw2}
              onChangeText={setPw2}
            />
            {pwBothTyped && (
              pwMatch ? (
                <Text style={styles.ok}>비밀번호가 일치합니다.</Text>
              ) : (
                <Text style={styles.errorLight}>비밀번호가 다릅니다.</Text>
              )
            )}
          </View>

          {/* 공간 채우기 */}
          <View style={{ flex: 1 }} />

          {/* 진행 점 (● ○ ○) */}
          <View style={styles.dotsWrap}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          {/* 다음으로 버튼 */}
          <Pressable
            onPress={onNext}
            disabled={!canNext}
            style={[
              styles.nextBtn,
              !canNext && styles.nextBtnDisabled,
            ]}
          >
            <Text style={styles.nextBtnText}>다음으로</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ORANGE = "#F97316";
const BLUE = "#CFE8FF";
const BLUE_DARK = "#BFDBFE";

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

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { fontSize: 14, color: "#111827" },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: BLUE_DARK,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  smallBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#B6C7E6",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  smallBtnDisabled: { opacity: 0.5 },
  smallBtnText: { color: "#1F2937", fontSize: 13, fontWeight: "700" },

  ok: { marginTop: 8, color: "#10B981", fontSize: 12 },
  // 연한 빨간 안내
  errorLight: { marginTop: 8, color: "#FCA5A5", fontSize: 12 },

  dotsWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flexDirection: "row",
    marginTop: 24,
    marginBottom: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#E5F0FF",
    borderWidth: 1,
    borderColor: "#D6E6FF",
  },
  dotActive: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },

  nextBtn: {
    alignSelf: "stretch",
    height: 56,
    borderRadius: 28,
    backgroundColor: BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnDisabled: {
    opacity: 0.5,
  },
  nextBtnText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "800",
  },
});
