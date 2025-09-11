// app/beforeLogin/SignUpSecond.tsx
import AgeDropDown from "../../components/ageDropDown/AgeDropDown"; // 위치에 맞게 수정
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

export default function SignUpSecond() {
  const [name, setName] = useState("");
  const [age, setAge] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"M" | "F" | null>(null);
  const [role, setRole] = useState<"worker" | "owner">("worker"); // 알바생 기본

  const canNext = name.trim() && age && phone.trim() && gender;

  const onNext = () => {
    if (!canNext) return;
    router.push("/beforeLogin/SignUpThird");
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
              조금만 더 힘내라 <Text style={styles.accent}>냥!</Text>
            </Text>
            <Text style={styles.title}>
              곧 함께 한다 <Text style={styles.accent}>냥!</Text>
            </Text>
          </View>

          {/* 이름 */}
          <View style={{ marginBottom: 16, width: "100%", maxWidth: 360 }}>
            <Text style={styles.label}>이름</Text>
            <TextInput
              style={styles.input}
              placeholder="이름"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* 나이대 (드롭다운 컴포넌트) */}
          <View style={{ marginBottom: 16, width: "100%", maxWidth: 360 }}>
            <AgeDropDown
              label="나이대"
              value={age}
              onChange={setAge}
              options={["10대", "20대", "30대", "40대", "50대", "60대 이상"]}
              placeholder="나이"
            />
          </View>

          {/* 전화번호 */}
          <View style={{ marginBottom: 16, width: "100%", maxWidth: 360 }}>
            <Text style={styles.label}>전화번호</Text>
            <TextInput
              style={styles.input}
              placeholder="전화번호"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          {/* 성별 */}
          <View style={{ marginBottom: 16, width: "100%", maxWidth: 360 }}>
            <Text style={styles.label}>성별</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable
                onPress={() => setGender("M")}
                style={[
                  styles.genderBtn,
                  gender === "M" && styles.genderBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === "M" && styles.genderTextActive,
                  ]}
                >
                  남
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setGender("F")}
                style={[
                  styles.genderBtn,
                  gender === "F" && styles.genderBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.genderText,
                    gender === "F" && styles.genderTextActive,
                  ]}
                >
                  여
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 유형 (세그먼트) */}
          <View style={{ marginBottom: 24, width: "100%", maxWidth: 360 }}>
            <Text style={styles.label}>유형</Text>
            <View style={styles.segmentWrap}>
              <Pressable
                onPress={() => setRole("worker")}
                style={[
                  styles.segmentItem,
                  role === "worker" && styles.segmentItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    role === "worker" && styles.segmentTextActive,
                  ]}
                >
                  알바생
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setRole("owner")}
                style={[
                  styles.segmentItem,
                  role === "owner" && styles.segmentItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    role === "owner" && styles.segmentTextActive,
                  ]}
                >
                  사장님
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 진행 점 (○ ● ○) */}
          <View style={styles.dotsWrap}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>

          {/* 다음 버튼 */}
          <Pressable
            onPress={onNext}
            disabled={!canNext}
            style={[styles.nextBtn, !canNext && styles.nextBtnDisabled]}
          >
            <Text style={styles.nextBtnText}>다음으로</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ORANGE = "#F97316";
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

  label: { fontSize: 14, color: "#111827", marginBottom: 6 },

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

  // gender
  genderBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  genderBtnActive: {
    borderColor: ORANGE,
    backgroundColor: "#FFF7ED",
  },
  genderText: { color: "#1F2937", fontSize: 15, fontWeight: "700" },
  genderTextActive: { color: ORANGE },

  // segment
  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    padding: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  segmentItem: {
    flex: 1,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentItemActive: {
    backgroundColor: "#FFE4D5",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  segmentText: { color: "#374151", fontSize: 14, fontWeight: "800" },
  segmentTextActive: { color: ORANGE },

  // dots
  dotsWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    flexDirection: "row",
    marginTop: 24,
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

  nextBtn: {
    marginTop: 16,
    alignSelf: "stretch",
    height: 56,
    borderRadius: 28,
    backgroundColor: "#CFE8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { color: "#1F2937", fontSize: 16, fontWeight: "800" },
});
