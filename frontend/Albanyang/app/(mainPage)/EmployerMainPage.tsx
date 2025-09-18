// app/(mainPage)/EmployerMainPage.tsx
import { useState, useRef } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors } from "@/constants/Colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { useRouter } from "expo-router";

// ====== 레이아웃 상수 ======
const TOP_PADDING = 24; // 8×3
const SIDE_PADDING = 16; // 8×2
const EXTRA_BOTTOM = 40; // 8×5
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORE_CARD_WIDTH = SCREEN_WIDTH - (SIDE_PADDING * 2);

interface AlbaStatus {
  id: number;
  name: string;
  time: string;
  subTime: string;
  status: 'green' | 'yellow' | 'red';
}

interface Store {
  id: number;
  name: string;
  albas: AlbaStatus[];
}

// 상단 섹션: 알림 버튼 + 계좌/고양이 (확장 버전)
const TopSection = () => {
  const handleNotification = () => {
    console.log('알림 클릭');
  };

  return (
    <View style={styles.topSectionContainer}>
      {/* 알림 버튼 행 */}
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

      {/* 계좌 + 고양이 행 (확장) */}
      <View style={styles.accountMascotRow}>
        {/* 계좌 정보 카드 (왼쪽) - 확장 */}
        <View style={styles.accountCard}>
          <Text style={styles.accountNumber}>국민 000-0000-000000</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.accountBalance}>7,000,000</Text>
            <Text style={styles.currencyText}>원</Text>
          </View>
        </View>

        {/* 고양이 마스코트 (오른쪽) - 확장 */}
        <View style={styles.mascotContainer}>
          <Text style={styles.mascotMessage}>좋은 하루예요! 😊</Text>
          <Image
            source={require("@/assets/images/mascot/mascot_basic_boss.png")}
            style={styles.mascotImage}
          />
        </View>
      </View>
    </View>
  );
};

// 매장 현황 스크롤 컴포넌트
const StoreScrollSection = () => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();
  
  const [stores] = useState<Store[]>([
    {
      id: 1,
      name: '메가커피 선릉점',
      albas: [
        { id: 1, name: '알바 1', time: '07:50 / ----', subTime: '(08:00 / 13:00)', status: 'green' },
        { id: 2, name: '알바 2', time: '08:10 / ----', subTime: '(08:00 / 13:00)', status: 'yellow' },
        { id: 3, name: '알바 3', time: '---- / ----', subTime: '(08:00 / 13:00)', status: 'red' }
      ]
    },
    // 매장이 하나일 때는 매장 추가 카드만 보여주기
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return '#4CAF50';  // 출근 (녹색 유지)
      case 'yellow': return colors.main;  // 지각 (메인 주황색)
      case 'red': return colors.reject;  // 결근 (빨간색)
      default: return colors.text.secondary;
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const page = Math.round(contentOffset / STORE_CARD_WIDTH);
    setCurrentPage(page);
  };

  const handleAddStore = () => {
    console.log('매장 추가');
    router.push("/store/StoreRegistration"); 
  };

  const handleStorePress = (storeId: number) => {
    console.log('매장 상세:', storeId);
  };

  return (
    <View style={styles.storeScrollContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={STORE_CARD_WIDTH}
        decelerationRate="fast"
      >
        {/* 기존 매장들 */}
        {stores.map((store) => (
          <Pressable
            key={store.id}
            style={styles.storeCard}
            onPress={() => handleStorePress(store.id)}
          >
            <View style={styles.storeHeader}>
              <Text style={styles.storeTitle}>{store.name}</Text>
            </View>

            <View style={styles.statusHeader}>
              <Text style={styles.headerText}>이름</Text>
              <Text style={styles.headerText}>출근시간 / 퇴근시간</Text>
            </View>

            {store.albas.map((alba) => (
              <View key={alba.id} style={styles.statusRow}>
                <View style={styles.nameSection}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(alba.status) }]} />
                  <Text style={styles.workerName}>{alba.name}</Text>
                </View>
                <View style={styles.timeSection}>
                  <Text style={styles.workTime}>{alba.time}</Text>
                  <Text style={styles.scheduleTime}>{alba.subTime}</Text>
                </View>
              </View>
            ))}
          </Pressable>
        ))}

        {/* 매장 추가 카드 */}
        <Pressable
          style={[styles.storeCard, styles.addStoreCard]}
          onPress={handleAddStore}
        >
          <View style={styles.addStoreContent}>
            <Ionicons name="add-circle-outline" size={48} color={colors.main} />
            <Text style={styles.addStoreText}>매장 추가</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* 페이지 인디케이터 */}
      {(stores.length > 0 || true) && (
        <View style={styles.pageIndicator}>
          {[...stores, { id: 'add' }].map((_, index) => (
            <View
              key={index}
              style={[
                styles.dotIndicator,
                currentPage === index && styles.activeDot
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

// 액션 버튼 컴포넌트
const ActionButtonsComponent = () => {
  const handleWriteNotice = () => {
    console.log('공지쓰기 클릭');
  };

  const handleInvite = () => {
    console.log('초대하기 클릭');
  };

  return (
    <View style={styles.actionContainer}>
      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed
        ]}
        onPress={handleWriteNotice}
      >
        <Text style={styles.actionIcon}>📢</Text>
        <Text style={styles.actionText}>공지 쓰기</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.actionButton,
          pressed && styles.actionButtonPressed
        ]}
        onPress={handleInvite}
      >
        <Text style={styles.actionIcon}>✉️</Text>
        <Text style={styles.actionText}>초대하기</Text>
      </Pressable>
    </View>
  );
};

export default function EmployerMainPage() {
  return (
    <SafeAreaView style={styles.rootContainer} edges={['top']}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TopSection />
        <StoreScrollSection />
        <ActionButtonsComponent />
      </ScrollView>

      <View style={styles.navBarWrapper}>
        <NavBar
          role="sajang"
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
    backgroundColor: colors.text.reverse, // #ffffff (흰색 배경)
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: colors.text.reverse, // #ffffff (흰색 배경)
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: TOP_PADDING,
    paddingBottom: NAVBAR_HEIGHT + EXTRA_BOTTOM,
    minHeight: '100%',
  },

  // --- 상단 섹션 (알림 + 계좌/고양이) - 확장 ---
  topSectionContainer: {
    paddingHorizontal: SIDE_PADDING,
    marginBottom: 16, // 32 -> 40 증가
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18, // 16 -> 24 증가
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
  },
  notificationButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  accountMascotRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // center -> flex-start로 변경
    gap: 20, // 16 -> 20 증가
    minHeight: 160, // 최소 높이 추가
  },
  accountCard: {
    flex: 1.2, // flex: 1 -> 1.2로 증가 (더 넓게)
    backgroundColor: colors.text.reverse,
    borderRadius: 20, // 16 -> 20 증가
    borderWidth: 2,
    borderColor: colors.main,
    paddingVertical: 32, // 20 -> 32 대폭 증가
    paddingHorizontal: 28, // 24 -> 28 증가
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 }, // 그림자 높이 증가
    shadowOpacity: 0.25, // 그림자 진하게
    shadowRadius: 6, // 그림자 크기 증가
    elevation: 8, // 안드로이드 그림자 증가
  },
  // 새로운 스타일들 추가 / 기존 키 업데이트
  accountLabel: {
    fontSize: sizes.smallText, // 12
    color: colors.text.secondary,
    marginBottom: 6,
    fontFamily: FONTS.jamsil.regular3,
    fontWeight: '500',
  },
  accountNumber: {
    fontSize: sizes.smallText + 2, // 14 (12 + 2)
    color: colors.text.secondary,
    marginBottom: 16, // 8 -> 16 증가
    fontFamily: FONTS.jamsil.regular3,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8, // 새로 추가
  },
  accountBalance: {
    fontSize: sizes.middleTitle, // 32 (가장 큰 크기)
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    marginRight: 4,
  },
  currencyText: {
    fontSize: sizes.normalText, // 18
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
  },
  accountActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  miniActionButton: {
    backgroundColor: colors.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  miniActionText: {
    fontSize: sizes.smallText, // 12
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.reverse, // 흰색
  },
  // 마스코트 컨테이너 확장
  mascotContainer: {
    flex: 0.8, // 새로 추가
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 16,
  },
  mascotImage: {
    width: 120, // 96 -> 120 대폭 증가
    height: 120, // 96 -> 120 대폭 증가
    resizeMode: 'contain',
    marginTop: 8, // 새로 추가
  },
  mascotMessage: {
    fontSize: sizes.smallText, // 12
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
    backgroundColor: colors.disable,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: -16,
  },

  // --- 매장 스크롤 섹션 ---
  storeScrollContainer: {
    marginBottom: 32, // 8×4
  },
  storeCard: {
    width: STORE_CARD_WIDTH,
    backgroundColor: colors.text.reverse, // #ffffff
    borderRadius: 16, // 8×2
    borderWidth: 2,
    borderColor: colors.main, // #FCC373
    paddingVertical: 28, // 증가 (20 -> 28)
    paddingHorizontal: 24, // 8×3
    marginHorizontal: SIDE_PADDING,
    shadowColor: colors.shadow, // #A29F9F
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 220, // 최소 높이 추가
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // 증가
  },
  storeTitle: {
    fontSize: sizes.normalText, // 18
    fontFamily: FONTS.jamsil.bold5, // The-Jamsil-5-Bold
    color: colors.text.primary, // #00100F
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8, // 8×1
  },
  headerText: {
    fontSize: sizes.smallText, // 12
    color: colors.text.secondary, // #707071
    fontFamily: FONTS.jamsil.regular3, // The-Jamsil-3-Regular
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14, // 증가 (10 -> 14)
    paddingHorizontal: 8, // 8×1
    borderBottomWidth: 1,
    borderBottomColor: colors.disable, // #F9F7F1
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusDot: {
    width: 8, // 8×1
    height: 8, // 8×1
    borderRadius: 4,
    marginRight: 12,
  },
  workerName: {
    fontSize: sizes.normalText, // 18
    color: colors.text.primary, // #00100F
    fontFamily: FONTS.jamsil.regular3, // The-Jamsil-3-Regular
  },
  timeSection: {
    flex: 2,
    alignItems: 'flex-end',
  },
  workTime: {
    fontSize: sizes.smallText, // 12
    color: colors.text.primary, // #00100F
    marginBottom: 4,
    fontFamily: FONTS.jamsil.regular3, // The-Jamsil-3-Regular
  },
  scheduleTime: {
    fontSize: sizes.smallText, // 12
    color: colors.text.secondary, // #707071
    fontFamily: FONTS.jamsil.regular3, // The-Jamsil-3-Regular
  },

  // --- 매장 추가 카드 ---
  addStoreCard: {
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  addStoreContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48, // 8×6
  },
  addStoreText: {
    marginTop: 16, // 8×2
    fontSize: sizes.normalText, // 18
    fontFamily: FONTS.jamsil.regular3, // The-Jamsil-3-Regular
    color: colors.main, // #FCC373
  },

  // --- 페이지 인디케이터 ---
  pageIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16, // 8×2
    gap: 8, // 8×1
  },
  dotIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.main, // #FCC373 (테두리)
    backgroundColor: 'transparent', // 투명 배경
  },
  activeDot: {
    backgroundColor: colors.main, // #FCC373 (채워진 점)
    borderColor: colors.main, // #FCC373
  },

  // --- 액션 버튼 ---
  actionContainer: {
    flexDirection: 'row',
    gap: 16, // 8×2
    paddingHorizontal: SIDE_PADDING,
    marginBottom: 24, // 8×3
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.text.reverse, // #ffffff
    borderRadius: 16, // 8×2
    borderWidth: 2,
    borderColor: colors.main, // #FCC373
    paddingVertical: 28, // 증가 (20 -> 28)
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8, // 8×1
    shadowColor: colors.shadow, // #A29F9F
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    minHeight: 80, // 최소 높이 추가
  },
  actionButtonPressed: {
    backgroundColor: colors.disable, // #F9F7F1 (연한 베이지 - 프레스 효과)
    transform: [{ scale: 0.98 }],
  },
  actionIcon: {
    fontSize: 28, // 증가 (24 -> 28)
  },
  actionText: {
    fontSize: sizes.normalText, // 18
    color: colors.text.primary, // #00100F
    fontFamily: FONTS.jamsil.medium4, // The-Jamsil-4-Medium
  },

  // --- NavBar 고정 ---
  navBarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: EXTRA_BOTTOM,
  },
});
