import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// ====== 레이아웃 상수 (수정됨) ======
const TOP_PADDING = 16;
const SIDE_PADDING = 20;
const SECTION_SPACING = 24;
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;
const BOTTOM_FIXED_HEIGHT = 120; // 하단 고정 영역 높이

// ====== 타입 정의 ======
interface PaymentItem {
  id: string;
  label: string;
  amount: number;
  isSelected: boolean;
  isDisabled: boolean;
}

// ====== 메인 컴포넌트 ======
export default function SalaryPaymentPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'settlement' | 'cafe'>('settlement');
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([
    {
      id: 'regular',
      label: '큰 태송이',
      amount: 700000,
      isSelected: false,
      isDisabled: false
    },
    {
      id: 'overtime',
      label: '중간 태송이',
      amount: 700000,
      isSelected: false,
      isDisabled: false
    },
    {
      id: 'late',
      label: '작은 태송이',
      amount: 500000,
      isSelected: false,
      isDisabled: true
    }
  ]);

  // 계산된 값들
  const totalSelected = paymentItems
    .filter(item => item.isSelected && !item.isDisabled)
    .reduce((sum, item) => sum + item.amount, 0);

  const handleItemToggle = (id: string) => {
    setPaymentItems(prev => 
      prev.map(item => 
        item.id === id && !item.isDisabled
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    );
  };

  const handlePayment = () => {
    if (totalSelected === 0) {
      Alert.alert('알림', '지급할 항목을 선택해주세요.');
      return;
    }
    
    Alert.alert(
      '급여 지급',
      `총 ${totalSelected.toLocaleString()}원을 지급하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '지급하기', 
          onPress: () => {
            // 여기서 송금 플로우 시작
            router.push('./PasswordPage');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.rootContainer} edges={['top']}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: BOTTOM_FIXED_HEIGHT + 20 }}
      >
        <View style={styles.contentContainer}>
          
          {/* 상단 탭 */}
          <TabSection 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          {/* 제목 섹션 */}
          <TitleSection />

          {/* 급여 항목 리스트 */}
          <PaymentItemsList 
            items={paymentItems}
            onItemToggle={handleItemToggle}
          />

        </View>
      </ScrollView>

      {/* 하단 고정 영역 */}
      <View style={[styles.bottomFixedContainer, { paddingBottom: insets.bottom + NAVBAR_HEIGHT }]}>
        <TotalSection totalAmount={totalSelected} />
        <PaymentButton 
          totalAmount={totalSelected}
          onPress={handlePayment}
        />
      </View>

      <NavBar role="sajang" activeKey="sum" />
    </SafeAreaView>
  );
}

// ====== 서브 컴포넌트들 ======

// 상단 탭 섹션
const TabSection = ({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: 'settlement' | 'cafe';
  onTabChange: (tab: 'settlement' | 'cafe') => void;
}) => {
  return (
    <View style={styles.tabContainer}>
      <Pressable
        style={[
          styles.tab,
          activeTab === 'settlement' && styles.activeTab
        ]}
        onPress={() => onTabChange('settlement')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'settlement' && styles.activeTabText
        ]}>
          편의점
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.tab,
          activeTab === 'cafe' && styles.activeTab
        ]}
        onPress={() => onTabChange('cafe')}
      >
        <Text style={[
          styles.tabText,
          activeTab === 'cafe' && styles.activeTabText
        ]}>
          카페
        </Text>
      </Pressable>
    </View>
  );
};

// 제목 섹션
const TitleSection = () => {
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.monthText}>
        <Text style={styles.monthNumber}>8</Text>월에 나갈 돈!
      </Text>
      <Text style={styles.subtitleText}>
        마음의 준비를 해주세요!
      </Text>
    </View>
  );
};

// 급여 항목 리스트
const PaymentItemsList = ({ 
  items, 
  onItemToggle 
}: { 
  items: PaymentItem[];
  onItemToggle: (id: string) => void;
}) => {
  return (
    <View style={styles.itemsContainer}>
      {items.map((item) => (
        <PaymentItemCard
          key={item.id}
          item={item}
          onToggle={() => onItemToggle(item.id)}
        />
      ))}
    </View>
  );
};

// 개별 급여 항목 카드 (카드형으로 변경)
const PaymentItemCard = ({ 
  item, 
  onToggle 
}: { 
  item: PaymentItem;
  onToggle: () => void;
}) => {
  return (
    <Pressable
      style={[
        styles.itemCard,
        item.isSelected && !item.isDisabled && styles.itemCardSelected,
        item.isDisabled && styles.itemCardDisabled
      ]}
      onPress={item.isDisabled ? undefined : onToggle}
      disabled={item.isDisabled}
    >
      <View style={styles.itemLeft}>
        <View style={[
          styles.checkbox,
          item.isSelected && !item.isDisabled && styles.checkboxSelected,
          item.isDisabled && styles.checkboxDisabled
        ]}>
          {item.isSelected && !item.isDisabled && (
            <Text style={styles.checkmark}>✓</Text>
          )}
          {item.isDisabled && (
            <Text style={styles.disabledMark}>✕</Text>
          )}
        </View>
        <Text style={[
          styles.itemLabel,
          item.isDisabled && styles.itemLabelDisabled
        ]}>
          {item.label}
        </Text>
      </View>
      
      <Text style={[
        styles.itemAmount,
        item.isDisabled && styles.itemAmountDisabled
      ]}>
        {item.amount.toLocaleString()}원
      </Text>
    </Pressable>
  );
};

// 총 지출 섹션 (하단 고정용)
const TotalSection = ({ totalAmount }: { totalAmount: number }) => {
  return (
    <View style={styles.totalCard}>
      <Text style={styles.totalLabel}>총 지출</Text>
      <View style={styles.totalAmountContainer}>
        <Text style={styles.totalNumber}>{totalAmount.toLocaleString()}</Text>
        <Text style={styles.totalUnit}>원</Text>
      </View>
    </View>
  );
};

// 지급 버튼
const PaymentButton = ({ 
  totalAmount, 
  onPress 
}: { 
  totalAmount: number;
  onPress: () => void;
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.paymentButton,
        pressed && styles.paymentButtonPressed,
        totalAmount === 0 && styles.paymentButtonDisabled
      ]}
      onPress={onPress}
      disabled={totalAmount === 0}
    >
      <Text style={[
        styles.paymentButtonText,
        totalAmount === 0 && styles.paymentButtonTextDisabled
      ]}>
        송금 하기
      </Text>
    </Pressable>
  );
};

// ====== 개선된 스타일 ======
const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.text.reverse,
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: TOP_PADDING,
  },

  // 하단 고정 영역
  bottomFixedContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.text.reverse,
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.disable,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  // 탭 섹션
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    backgroundColor: colors.disable,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  tabText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  activeTabText: {
    color: colors.text.reverse,
    fontFamily: FONTS.jamsil.medium4,
  },

  // 제목 섹션
  titleContainer: {
    marginBottom: 32,
  },
  monthText: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    marginBottom: 6,
  },
  monthNumber: {
    color: colors.accent,
    fontFamily: FONTS.jamsil.bold5,
  },
  subtitleText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },

  // 급여 항목 카드 (개선됨)
  itemsContainer: {
    gap: 16,
    marginBottom: 40,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.text.reverse,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.disable,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.disable,
  },
  itemCardDisabled: {
    opacity: 0.5,
    backgroundColor: '#FAFAFA',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.text.primary,
    borderRadius: 6,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text.reverse,
  },
  checkboxSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkboxDisabled: {
    borderColor: colors.text.secondary,
    backgroundColor: colors.disable,
  },
  checkmark: {
    color: colors.text.reverse,
    fontSize: 14,
    fontFamily: FONTS.jamsil.bold5,
  },
  disabledMark: {
    color: colors.text.secondary,
    fontSize: 14,
    fontFamily: FONTS.jamsil.bold5,
  },
  itemLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  itemLabelDisabled: {
    color: colors.text.secondary,
  },
  itemAmount: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.accent,
    textAlign: 'right',
  },
  itemAmountDisabled: {
    color: colors.text.secondary,
  },

  // 총 지출 카드 (개선됨)
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.disable,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
  },
  totalAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalNumber: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.accent,
  },
  totalUnit: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    marginLeft: 4,
  },

  // 지급 버튼 (개선됨)
  paymentButton: {
    backgroundColor: colors.main,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  paymentButtonPressed: {
    backgroundColor: colors.accent,
    transform: [{ scale: 0.98 }],
  },
  paymentButtonDisabled: {
    backgroundColor: colors.disable,
    shadowOpacity: 0,
    elevation: 0,
  },
  paymentButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
  paymentButtonTextDisabled: {
    color: colors.text.secondary,
  },
});