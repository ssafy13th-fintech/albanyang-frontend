import { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

export default function SignUpAgree() {
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTos, setAgreeTos] = useState(true);       // 샘플 스샷처럼 체크 ON
  const [agreePriv, setAgreePriv] = useState(true);      // 샘플 스샷처럼 체크 ON
  const [agreeMkt, setAgreeMkt] = useState(false);       // 선택 항목

  const requiredOk = agreeTos && agreePriv;

  const toggleAll = () => {
    const next = !agreeAll;
    setAgreeAll(next);
    setAgreeTos(next);
    setAgreePriv(next);
    setAgreeMkt(next);
  };

  // TODO: 다음 화면이 정해지면 라우팅 경로만 바꿔주세요.
  const onNext = () => {
    if (!requiredOk) return;
    router.push("/beforeLogin/SignUpFirst");
    console.log("동의 완료 → 다음 단계로");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* 인사 */}
        <View style={{ marginBottom: 24 }}>
          <Text style={styles.hello}>
            OOO님!{"\n"}
            만나서 반갑다 <Text style={styles.accent}>냥!</Text> 🐱
          </Text>
        </View>

        {/* 동의 카드 */}
        <View style={styles.card}>
          {/* 전체 동의 */}
          <Row
            checked={agreeAll}
            onPress={toggleAll}
            label="약관 전체동의"
            bold
          />

          <Divider />

          {/* 필수 1: 이용약관 동의 */}
          <Row
            checked={agreeTos}
            onPress={() => {
              const v = !agreeTos;
              setAgreeTos(v);
              setAgreeAll(v && agreePriv && agreeMkt);
            }}
            label="이용약관 동의(필수)"
            chevron
          />

          <Divider />

          {/* 필수 2: 개인정보 수집 및 이용동의 */}
          <Row
            checked={agreePriv}
            onPress={() => {
              const v = !agreePriv;
              setAgreePriv(v);
              setAgreeAll(v && agreeTos && agreeMkt);
            }}
            label="개인정보 수집 및 이용동의(필수)"
            chevron
          />

          <Divider />

          {/* 선택: 마케팅 수신 동의 */}
          <View>
            <Row
              checked={agreeMkt}
              onPress={() => {
                const v = !agreeMkt;
                setAgreeMkt(v);
                setAgreeAll(v && agreeTos && agreePriv);
              }}
              label="E-mail 및 SMS 광고성 정보 수신동의(선택)"
            />
            <Text style={styles.subNote}>
              다양한 프로모션 소식 및 신규 매장 정보를 보내 드립니다.
            </Text>
          </View>
        </View>

        {/* 다음 버튼 */}
        <Pressable
          onPress={onNext}
          disabled={!requiredOk}
          style={({ pressed }) => [
            styles.nextBtn,
            !requiredOk && styles.nextBtnDisabled,
            pressed && requiredOk ? { opacity: 0.9, transform: [{ scale: 0.997 }] } : null,
          ]}
        >
          <Text style={styles.nextBtnText}>다음</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

/** 체크 행 (간단한 커스텀 체크박스 + 옵션 화살표) */
function Row({
  checked,
  onPress,
  label,
  chevron,
  bold,
}: {
  checked: boolean;
  onPress: () => void;
  label: string;
  chevron?: boolean;
  bold?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={[styles.rowLabel, bold && { fontWeight: "800" }]}>{label}</Text>
      {chevron && <Text style={styles.chevron}>›</Text>}
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const ORANGE = "#F97316";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  hello: {
    fontSize: 26,
    lineHeight: 34,
    fontWeight: "800",
    color: "#0F172A",
  },
  accent: { color: ORANGE },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    // 살짝 떠보이게
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowLabel: { flex: 1, fontSize: 16, color: "#111827" },
  chevron: { fontSize: 22, color: "#9CA3AF", marginLeft: 8 },

  divider: { height: 1, backgroundColor: "#F1F5F9" },

  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.6,
    borderColor: "#94A3B8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  checkboxOn: {
    backgroundColor: "#10B981", // 스샷의 초록 체크 느낌
    borderColor: "#10B981",
  },
  checkMark: {
    color: "#fff",
    fontWeight: "900",
    lineHeight: 18,
  },

  subNote: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    fontSize: 12,
    color: "#6B7280",
  },

  nextBtn: {
    marginTop: 18,
    height: 50,
    borderRadius: 14,
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  nextBtnDisabled: { backgroundColor: "#FEC6A1" },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
