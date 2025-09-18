// app/(mainPage)/EmployerMainPage.tsx
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from "@/constants/Colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import NavBar from '@/components/navBar/NavBar';

// ====== 레이아웃 상수 ======
const TOP_PADDING = 24;        // 상태바 감안한 상단 여백
const SIDE_PADDING = 16;       // 좌/우 세이프 여백
const EXTRA_BOTTOM = 40;       // 제스처/하드키 영역 고려 추가 여백
const NAVBAR_HEIGHT = 60;      // NavBar 대략 높이(겹침 방지용 padding 계산)

// 계좌 정보 컴포넌트
const AccountStatusComponent = () => {
  return (
    <View style={styles.accountContainer}>
      <View style={styles.mascotSection}>
        <Image
          source={require("@/assets/images/mascot/mascot_basic_boss.png")}
          style={styles.mascotImage}
        />
      </View>
      <View style={styles.accountInfoSection}>
        <View style={styles.accountCard}>
          <Text style={styles.accountNumber}>국민 000-0000-000000</Text>
          <Text style={styles.accountBalance}>7,000,000 원</Text>
        </View>
      </View>
    </View>
  );
};

// 매장 현황 컴포넌트
const StoreStatusComponent = () => {
  const [storeData] = useState([
    { id: 1, name: '알바 1', time: '07:50 / ----', subTime: '(08:00 / 13:00)', status: 'green' },
    { id: 2, name: '알바 2', time: '08:10 / ----', subTime: '(08:00 / 13:00)', status: 'yellow' },
    { id: 3, name: '알바 3', time: '---- / ----', subTime: '(08:00 / 13:00)', status: 'red' }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return '#4CAF50';
      case 'yellow': return '#FFC107';
      case 'red': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <View style={styles.storeStatusContainer}>
      <Text style={styles.storeTitle}>메거커피 선릉점</Text>

      <View style={styles.statusHeader}>
        <Text style={styles.headerText}>이름</Text>
        <Text style={styles.headerText}>출근시간 / 퇴근시간</Text>
      </View>

      {storeData.map((item) => (
        <View key={item.id} style={styles.statusRow}>
          <View style={styles.nameSection}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.workerName}>{item.name}</Text>
          </View>
          <View style={styles.timeSection}>
            <Text style={styles.workTime}>{item.time}</Text>
            <Text style={styles.scheduleTime}>{item.subTime}</Text>
          </View>
        </View>
      ))}

      {/* 우측 이동 아이콘(디자인 시안의 > 표시) */}
      <View pointerEvents="none" style={styles.chevronWrap}>
        <Text style={styles.chevron}>›</Text>
      </View>
    </View>
  );
};

// 액션 버튼 컴포넌트
const ActionButtonsComponent = () => {
  return (
    <View style={styles.actionContainer}>
      <Pressable 
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: pressed ? colors.accent : 'transparent' }
        ]}
        onPress={() => console.log('공지쓰기 클릭')}
      >
        <Text style={styles.actionIcon}>📝</Text>
        <Text style={styles.actionText}>공지 쓰기</Text>
      </Pressable>
      
      <Pressable 
        style={({ pressed }) => [
          styles.actionButton,
          { backgroundColor: pressed ? colors.accent : 'transparent' }
        ]}
        onPress={() => console.log('초대하기 클릭')}
      >
        <Text style={styles.actionIcon}>✉️</Text>
        <Text style={styles.actionText}>초대하기</Text>
      </Pressable>
    </View>
  );
};

export default function EmployerMainPage() {
  return (
    <SafeAreaView style={styles.rootContainer}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: TOP_PADDING,
            paddingLeft: SIDE_PADDING,
            paddingRight: SIDE_PADDING,
            // NavBar 높이 + 추가 하단 여백
            paddingBottom: NAVBAR_HEIGHT + EXTRA_BOTTOM,
          }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <AccountStatusComponent />
        <StoreStatusComponent />
        <ActionButtonsComponent />
      </ScrollView>

      {/* 실제 네브바 (밝은 테마) */}
      <View style={styles.navBarWrapper}>
        <NavBar
          role="sajang"
          activeKey="home"
          // 밝은 기본값 → props 안 넘기면 흰 배경/연한 보더로 렌더
          onTabPress={(key) => {
            console.log('탭 클릭:', key);
            // TODO: router.push(...) 연결
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContainer: { flex: 1 },
  contentContainer: {
    flexGrow: 1,
    gap: 20,
  },

  // --- 계좌 정보 ---
  accountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mascotSection: { flex: 1 },
  mascotImage: { width: 80, height: 80 },
  accountInfoSection: { flex: 2 },
  accountCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.main,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  accountNumber: {
    fontSize: sizes.smallText,
    color: '#666',
    marginBottom: 8
  },
  accountBalance: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.regular3,
    color: '#000'
  },

  // --- 매장 현황 ---
  storeStatusContainer: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.main,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  storeTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    marginBottom: 16,
    color: '#000'
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8
  },
  headerText: {
    fontSize: sizes.smallText,
    color: '#666'
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12
  },
  workerName: {
    fontSize: sizes.normalText,
    color: '#000'
  },
  timeSection: {
    flex: 2,
    alignItems: 'flex-end'
  },
  workTime: {
    fontSize: sizes.smallText,
    color: '#000',
    marginBottom: 2
  },
  scheduleTime: {
    fontSize: sizes.smallText,
    color: '#999'
  },

  // 우측 > 표시 (시안 맞춤)
  chevronWrap: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  chevron: {
    fontSize: 28,
    color: colors.subAccent,
  },

  // --- 액션 버튼 ---
  actionContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.main,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  actionText: {
    fontSize: sizes.normalText,
    color: '#000'
  },

  // --- NavBar 고정 ---
  navBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0, // SafeAreaView 내부라서 여기 0이면 안전영역까지 포함됨
  },
});
