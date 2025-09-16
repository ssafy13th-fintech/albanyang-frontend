// AlbaMainPage.tsx
import TempNavBar from '@/components/navBar/TempNavBar';
import { colors } from '@/constants/colors/ColorTheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// 목업 기준 크기
const PANEL_W = 500;
const PANEL_H = 500;
const NAV_BASE_HEIGHT = 60;

// 화면이 더 작은 기기에서도 보기 좋도록 살짝 스케일 다운(필요시 조절/제거)
const SCALE = Math.min(1, SCREEN_W / (PANEL_W + 40));
const W = Math.round(PANEL_W * SCALE);
const H = Math.round(PANEL_H * SCALE);

// 원(타원) 중심을 세로 1/4 지점에 맞추기:
// top = (화면높이 * 0.25) - (패널높이 / 2)
const TOP = SCREEN_H * 0.25 - H / 2;

const HomeScreen = () => {
  // 1) 변수화된 월/금액
  const month = 8; // 예: 8월 → 실제 로직에서 계산/상태값으로 대체
  const amount = 1_000_000; // 서버/상태에서 내려받은 값으로 대체
  const insets = useSafeAreaInsets();
  const navHeight = NAV_BASE_HEIGHT + Math.max(insets.bottom, 8);

  const formattedAmount = new Intl.NumberFormat('ko-KR').format(amount);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={ ({pressed}) => [styles.headerLeft, pressed && styles.pressed]}
          onPress = {() => {console.log("눌렀어요")}}>

          <Ionicons name="location-outline" size={24} color={colors.text.primary} />
          <Text style={styles.headerText}>강남점</Text>
        </Pressable>
        <Pressable style={ ({pressed}) => [styles.headerRight, pressed && styles.pressed]}
          onPress = {() => {console.log("눌렀어요")}}>
          <Ionicons name="bulb-outline" size={24} color={colors.accent} />
        </Pressable>
      </View>

      {/* 2) 타원형 그라데이션 패널 */}
      <LinearGradient
        colors={['#C1E0FF', '#F5F4F5']}      // 위→아래
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.ellipsePanel, { width: W, height: H, top: TOP }]}
      >
        {/* 3) 오른쪽 정렬 텍스트(사이즈: 기본 32, 금액만 35 & 강조색) */}
        <View style={styles.ellipseInner}>
          <Text style={styles.earningLine}>{month}월에</Text>
          <Text style={styles.earningLine}>
            총 <Text style={styles.amount}>{formattedAmount}원</Text>
          </Text>
          <Text style={styles.earningLine}>벌었다냥!</Text>
        </View>
      </LinearGradient>

      {/* Work Status Panel */}
      <View style={styles.panel}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>출근시간</Text>
            <Text style={styles.statusValue}>10:12:25</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>퇴근시간</Text>
            <Text style={styles.statusValue}>근무 중</Text>
          </View>
        </View>

        {/* 출/퇴근 버튼 */}
        <View style={styles.buttonContainer}>
          <Pressable
            android_ripple={{ color: '#ffffff33', borderless: false }}
            style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.pressed]}
            onPress={() => {console.log("출근하기 버튼 누름")}}
          >
            <Text style={styles.primaryText}>출근하기</Text>
          </Pressable>

          <Pressable
            android_ripple={{ color: '#00000014', borderless: false }}
            style={({ pressed }) => [styles.button, styles.secondaryButton, pressed && styles.pressed]}
            onPress={() => {console.log("퇴근하기 버튼 누름")}}
          >
            <Text style={styles.secondaryText}>퇴근하기</Text>
          </Pressable>
        </View>
      </View>

          {/* 내용이 네브바에 가려지지 않도록 바닥에 여유공간 확보 */}
      <View style={{ height: navHeight }} />
      {/* Bottom Cat Button */}
     { <Pressable style={[styles.catButton, { bottom: navHeight + 16 }]} /> }

      {/* Nav */}
      

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.main,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', zIndex : 10},
  headerText: { marginLeft: 5, fontSize: 18, color: colors.text.primary },
  headerRight: { padding: 5 , zIndex : 10},

  /* 타원형 그라데이션 패널 */
  ellipsePanel: {
    position: 'absolute',
    alignSelf: 'center', // X: 가로 중앙
    borderBottomRightRadius : 150,
    borderBottomLeftRadius : 150,
    opacity: 0.8,        // 요구사항: 80%
    paddingHorizontal: 28,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  ellipseInner: {
    width: '100%',
    // 오른쪽 정렬
    alignItems: 'flex-end',
  },
  earningLine: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'right',
    lineHeight: 50,
  },
  amount: {
    fontSize: 35,
    fontWeight: '800',
    color: colors.accent, // 강조색
  },

  panel: {
    backgroundColor: colors.text.reverse,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusItem: { alignItems: 'center', padding: 10 },
  statusLabel: { fontSize: 16, color: colors.text.secondary },
  statusValue: { fontSize: 22, fontWeight: 'bold', color: colors.text.primary, marginTop: 5 },

  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  secondaryButton: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    borderWidth: 1,
  },
  pressed: { opacity: 0.7 },
  primaryText: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  secondaryText: { fontSize: 16, fontWeight: 'bold', color: colors.text.primary },

  catButton: {
    position: 'absolute',
    bottom: 90,
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.main,
    borderWidth: 1,
  },
});

export default HomeScreen;
