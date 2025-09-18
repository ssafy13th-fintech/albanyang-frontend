// app/(mainPage)/AlbaMainPage.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// ====== 레이아웃 상수 ======
const TOP_PADDING = 24;
const SIDE_PADDING = 16;
const EXTRA_BOTTOM = 40;
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;

export default function AlbaMainPage() {
  const [isWorking, setIsWorking] = useState(true); // 현재 근무 중 상태
  
  const handleNotification = () => {
    console.log('알림 클릭');
  };

  const handleAttendance = () => {
    setIsWorking(!isWorking);
    console.log(isWorking ? '퇴근 처리' : '출근 처리');
  };

  return (
    <SafeAreaView style={styles.rootContainer} edges={['top']}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단 알림 버튼 */}
        <View style={styles.notificationRow}>
          <View style={{ flex: 1 }} />
          <Pressable
            style={({ pressed }) => [
              styles.notificationButton,
              pressed && styles.notificationButtonPressed
            ]}
            onPress={handleNotification}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* 마스코트와 수익 정보 */}
        <View style={styles.mascotSection}>
          <Image
            source={require("@/assets/images/mascot/mascot_good_alba.png")}
            style={styles.mascotImage}
          />
          <Text style={styles.monthText}>8월에</Text>
          <View style={styles.salaryContainer}>
            <Text style={styles.salaryLabel}>총 </Text>
            <Text style={styles.salaryAmount}>1,000,000</Text>
            <Text style={styles.currencyText}>원</Text>
          </View>
          <Text style={styles.earnedText}>벌었습니다!</Text>
        </View>

        {/* 출퇴근 시간 표시 */}
        <View style={styles.timeSection}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>출근시간</Text>
            <Text style={styles.timeValue}>10:12:25</Text>
          </View>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>퇴근시간</Text>
            <Text style={styles.timeValue}>근무 중</Text>
          </View>
        </View>

        {/* 출근하기 버튼 */}
        <View style={styles.buttonSection}>
          <Pressable
            style={({ pressed }) => [
              styles.attendanceButton,
              pressed && styles.attendanceButtonPressed
            ]}
            onPress={handleAttendance}
          >
            <Text style={styles.attendanceButtonText}>출근하기</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.navBarWrapper}>
        <NavBar
          role="alba"
          activeKey="home"
          onTabPress={(key) => {
            console.log('탭 클릭:', key);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.text.reverse,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.text.reverse,
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: TOP_PADDING,
    paddingBottom: NAVBAR_HEIGHT + EXTRA_BOTTOM,
    paddingHorizontal: SIDE_PADDING,
  },

  // 상단 알림 버튼
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
  },
  notificationButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  // 마스코트 섹션
  mascotSection: {
    alignItems: 'center',
    marginBottom: 60,
  },
  mascotImage: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  monthText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    marginBottom: 8,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  salaryLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  salaryAmount: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.accent,
  },
  currencyText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  earnedText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },

  // 출퇴근 시간 섹션
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 80,
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    marginBottom: 12,
  },
  timeValue: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
  },

  // 출근 버튼 섹션
  buttonSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  attendanceButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  attendanceButtonPressed: {
    backgroundColor: colors.main,
    transform: [{ scale: 0.98 }],
  },
  attendanceButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },

  // NavBar 고정
  navBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: EXTRA_BOTTOM,
  },
});