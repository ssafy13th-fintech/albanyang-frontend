import { useState, useEffect } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  ScrollView,
  ActivityIndicator
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// API imports
import { getStaffList, StaffInfo } from '@/api/Staff';
import { getStoreById } from '@/api/Stores';
import { 
  inquireTransactionHistoryList,
  generateInstitutionTransactionUniqueNo 
} from '@/api/SSAFYOpenapi';

// ====== 레이아웃 상수 ======
const TOP_PADDING = 16;
const SIDE_PADDING = 20;
const SECTION_SPACING = 24;
const NAVBAR_HEIGHT = NAVBAR_BASE_HEIGHT;
const BOTTOM_FIXED_HEIGHT = 120;

// ====== 타입 정의 ======
interface StaffMemberItem {
  id: number;
  name: string;
  nickname: string;
  amount: number;
  isSelected: boolean;
  isDisabled: boolean;
  account?: string; // 계좌번호
  bankName?: string; // 은행명
}

// ====== 메인 컴포넌트 ======
export default function SalaryPaymentPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'settlement' | 'cafe'>('settlement');
  const [isLoading, setIsLoading] = useState(false);
  const [storeId, setStoreId] = useState<number>(1); // 실제로는 context나 params에서 받아야 함
  const [paymentItems, setPaymentItems] = useState<StaffMemberItem[]>([]);

  // 직원 목록 조회
  useEffect(() => {
    fetchStaffMembers();
  }, [storeId, activeTab]);

  const fetchStaffMembers = async () => {
    setIsLoading(true);
    try {
      // 직원 목록 조회
      const response = await getStaffList(storeId);
      
      if (response.code === 'SUCCESS' && response.data) {
        const staffList = response.data.staffInfoRes;
        
        // 직원 정보를 결제 아이템으로 변환
        const items: StaffMemberItem[] = staffList.map((staff: StaffInfo) => ({
          id: staff.id,
          name: staff.name,
          nickname: staff.nickname,
          amount: 700000, // 실제로는 급여명세서 API에서 가져와야 함
          isSelected: false,
          isDisabled: staff.status !== 'ACTIVE',
          account: '123-456-7890', // 실제로는 회원 정보 API에서 가져와야 함
          bankName: '신한'
        }));
        
        setPaymentItems(items);
      }
    } catch (error) {
      console.error('직원 목록 조회 실패:', error);
      Alert.alert('오류', '직원 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 계산된 값들
  const totalSelected = paymentItems
    .filter(item => item.isSelected && !item.isDisabled)
    .reduce((sum, item) => sum + item.amount, 0);

  const selectedItems = paymentItems.filter(item => item.isSelected && !item.isDisabled);

  const handleItemToggle = (id: number) => {
    setPaymentItems(prev => 
      prev.map(item => 
        item.id === id && !item.isDisabled
          ? { ...item, isSelected: !item.isSelected }
          : item
      )
    );
  };

  const handlePayment = async () => {
    if (selectedItems.length === 0) {
      Alert.alert('알림', '지급할 항목을 선택해주세요.');
      return;
    }
    
    Alert.alert(
      '급여 지급',
      `${selectedItems.length}명에게 총 ${totalSelected.toLocaleString()}원을 지급하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '지급하기', 
          onPress: () => {
            // 송금 정보를 파라미터로 전달
            const transferData = selectedItems.map(item => ({
              staffId: item.id,
              name: item.name,
              amount: item.amount,
              account: item.account,
              bankName: item.bankName
            }));
            
            // PasswordPage로 이동하면서 송금 데이터 전달
            router.push({
              pathname: './PasswordPage',
              params: {
                transferData: JSON.stringify(transferData),
                totalAmount: totalSelected,
                recipientCount: selectedItems.length
              }
            });
          }
        }
      ]
    );
  };

  // 송금 처리 함수 (PasswordPage에서 비밀번호 검증 후 호출)
  const processTransfers = async (transferData: any[]) => {
    setIsLoading(true);
    const results = [];
    
    try {
      for (const item of transferData) {
        try {
          // SSAFY API를 통한 송금 처리
          // 실제 구현시에는 백엔드 API를 통해 처리하는 것이 안전
          const transactionNo = generateInstitutionTransactionUniqueNo();
          
          // 여기에 실제 송금 API 호출
          // const result = await transferMoney({
          //   accountNo: item.account,
          //   amount: item.amount,
          //   transactionNo,
          //   // ... 기타 필요한 파라미터
          // });
          
          results.push({
            staffId: item.staffId,
            success: true,
            transactionNo
          });
          
        } catch (error) {
          console.error(`${item.name} 송금 실패:`, error);
          results.push({
            staffId: item.staffId,
            success: false,
            error
          });
        }
      }
      
      // 모든 송금 처리 완료
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (failCount === 0) {
        // 모두 성공
        router.push({
          pathname: './SendCompletePage',
          params: {
            successCount,
            totalAmount: totalSelected
          }
        });
      } else {
        // 일부 실패
        Alert.alert(
          '송금 부분 완료',
          `${successCount}명 송금 성공, ${failCount}명 송금 실패`,
          [
            { 
              text: '확인', 
              onPress: () => {
                router.push({
                  pathname: './SendCompletePage',
                  params: {
                    successCount,
                    failCount,
                    totalAmount: totalSelected * (successCount / transferData.length)
                  }
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('송금 처리 중 오류:', error);
      Alert.alert('오류', '송금 처리 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.rootContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>처리 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

          {/* 직원 목록 */}
          <PaymentItemsList 
            items={paymentItems}
            onItemToggle={handleItemToggle}
          />

        </View>
      </ScrollView>

      {/* 하단 고정 영역 */}
      <View style={[styles.bottomFixedContainer, { paddingBottom: insets.bottom + NAVBAR_HEIGHT }]}>
        <TotalSection 
          totalAmount={totalSelected} 
          selectedCount={selectedItems.length}
        />
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
  const currentMonth = new Date().getMonth() + 1;
  
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.monthText}>
        <Text style={styles.monthNumber}>{currentMonth}</Text>월 급여 지급
      </Text>
      <Text style={styles.subtitleText}>
        직원을 선택하여 급여를 지급하세요
      </Text>
    </View>
  );
};

// 직원 목록
const PaymentItemsList = ({ 
  items, 
  onItemToggle 
}: { 
  items: StaffMemberItem[];
  onItemToggle: (id: number) => void;
}) => {
  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>등록된 직원이 없습니다</Text>
      </View>
    );
  }

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

// 개별 직원 카드
const PaymentItemCard = ({ 
  item, 
  onToggle 
}: { 
  item: StaffMemberItem;
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
        <View>
          <Text style={[
            styles.itemLabel,
            item.isDisabled && styles.itemLabelDisabled
          ]}>
            {item.name}
          </Text>
          <Text style={styles.itemSubLabel}>
            {item.nickname}
          </Text>
        </View>
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

// 총 지출 섹션
const TotalSection = ({ 
  totalAmount, 
  selectedCount 
}: { 
  totalAmount: number;
  selectedCount: number;
}) => {
  return (
    <View style={styles.totalCard}>
      <View>
        <Text style={styles.totalLabel}>총 지급액</Text>
        <Text style={styles.selectedCount}>{selectedCount}명 선택</Text>
      </View>
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
        송금하기
      </Text>
    </Pressable>
  );
};

// ====== 스타일 ======
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
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

  // 직원 카드
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
  itemSubLabel: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.light2,
    color: colors.text.secondary,
    marginTop: 2,
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

  // 빈 상태
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  // 총 지출 카드
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
  selectedCount: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.light2,
    color: colors.text.secondary,
    marginTop: 4,
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

  // 지급 버튼
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