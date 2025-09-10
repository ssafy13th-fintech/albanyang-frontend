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
import { Link } from "expo-router"; // ← 라우팅 안정화를 위해 Link 사용

export default function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  const showError = false;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* 배경 데코 (입체감+광택 버블) */}
      <Bubble style={styles.bubbleTR} />
      <Bubble style={styles.bubbleBL} size="lg" />

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.container, { zIndex: 1 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤딩 */}
          <View style={{ marginBottom: 28 }}>
            <Text style={styles.title}>
              반갑다 <Text style={styles.accent}>냥!</Text>
            </Text>
            <Text style={styles.title}>오늘도</Text>
            <Text style={styles.title}>
              열심히 일하자 <Text style={styles.accent}>냥!</Text>
            </Text>
          </View>

          {/* 입력 필드들 */}
          <View style={{ gap: 14, width: "100%", maxWidth: 320 }}>
            <TextInput
              style={styles.input}
              placeholder="아이디"
              placeholderTextColor="#94a3b8"
              value={id}
              onChangeText={setId}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="패스워드"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              value={pw}
              onChangeText={setPw}
            />
            {showError && (
              <Text style={styles.error}>
                잘못 입력하셨습니다. 다시 입력해주세요
              </Text>
            )}
          </View>

          {/* 로그인 버튼 */}
          <Pressable
            onPress={() => {}}
            style={({ pressed }) => [
              styles.loginBtn,
              pressed && { opacity: 0.9, transform: [{ scale: 0.996 }] },
            ]}
          >
            <Text style={styles.loginBtnText}>로그인</Text>
          </Pressable>

          {/* 회원가입 이동: 히트박스 크게 + Link(asChild) */}
          <Link href="/beforeLogin/SignUpAgree" asChild>
            <Pressable style={styles.signUpBtn} hitSlop={14}>
              <Text style={styles.signUpText}>회원 가입</Text>
            </Pressable>
          </Link>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Glossy Bubble (광택/입체감) */
function Bubble({
  style,
  size = "md",
}: {
  style?: any;
  size?: "md" | "lg";
}) {
  const dim = size === "lg" ? 260 : 220;

  return (
    // 배경은 터치 비활성화
    <View pointerEvents="none" style={[style, { width: dim, height: dim }]}>
      {/* rim */}
      <View
        style={{
          position: "absolute",
          width: dim,
          height: dim,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "#B7D3FB",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 0, // Android에서 터치 덮임 방지
        }}
      />
      {/* base */}
      <View
        style={{
          position: "absolute",
          width: dim,
          height: dim,
          borderRadius: 999,
          backgroundColor: BUBBLE,
        }}
      />
      {/* main highlight */}
      <View
        style={{
          position: "absolute",
          left: dim * 0.14,
          top: dim * 0.12,
          width: dim * 0.55,
          height: dim * 0.35,
          borderRadius: dim,
          backgroundColor: "#ffffff",
          opacity: 0.24,
          transform: [{ rotate: "-20deg" }],
          shadowColor: "#fff",
          shadowOpacity: 0.6,
          shadowRadius: 8,
          shadowOffset: { width: -2, height: -2 },
        }}
      />
      {/* sub highlight */}
      <View
        style={{
          position: "absolute",
          right: dim * 0.12,
          bottom: dim * 0.1,
          width: dim * 0.35,
          height: dim * 0.22,
          borderRadius: dim,
          backgroundColor: "#ffffff",
          opacity: 0.1,
          transform: [{ rotate: "15deg" }],
        }}
      />
    </View>
  );
}

const ORANGE = "#F97316";
const BUBBLE = "#CFE8FF";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: "800",
    color: "#111827",
  },
  accent: { color: ORANGE },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  error: { color: "#EF4444", fontSize: 12, marginTop: 6 },

  loginBtn: {
    marginTop: 18,
    width: "100%",
    maxWidth: 320,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#B6C7E6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  loginBtnText: { color: "#111827", fontSize: 16, fontWeight: "700" },

  // 회원가입 (텍스트형 버튼 → 히트박스 확장)
  signUpBtn: {
    marginTop: 28,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
  },
  signUpText: { color: "#6B7280", fontSize: 16 },

  // 배경 버블 위치
  bubbleTR: {
    position: "absolute",
    right: -60,
    top: 300,
  },
  bubbleBL: {
    position: "absolute",
    left: -80,
    bottom: -40,
  },
});
