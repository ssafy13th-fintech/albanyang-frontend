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
import { useLocalSearchParams, useRouter } from "expo-router";

import NavBar, { NAVBAR_BASE_HEIGHT } from '@/components/navBar/NavBar';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// API imports
import { getStaffList, StaffInfo, getStaffDetail, StaffDetailResponse } from '@/api/Staff';
import { getPayslipsByMonth, PayslipSummary } from '@/api/EmployerPaylips';
import { getMemberByPhone } from '@/api/Member';

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
  account?: string;
  bankName?: string;
  phone?: string;
  payslipStatus?: string;
}

// ====== 유틸리티 함수 ======
const getPreviousMonth = (): string => {
  const now = new Date();
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
};

// 현재 월로 변경하려면 이 함수를 사용
const getCurrentMonth = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// ====== 메인 컴포넌트 ======
export default function CheckMemberListPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'settlement' | 'cafe'>('settlement');
  const [isLoading, setIsLoading] = useState(false);
  const { storeId } = useLocalSearchParams();
  const [paymentItems, setPaymentItems] = useState<StaffMemberItem[]>([]);
  
  // 전월 기준으로 설정 (현재 월로 하려면 getCurrentMonth() 사용)
  const targetMonth = getPreviousMonth();

  // 직원 목록 및 급여명세서 상태 조회
  useEffect(() => {
    if (storeId) {
      fetchStaffAndPayslipData();
    }
  }, [storeId, activeTab]);

  const fetchStaffAndPayslipData = async () => {
    setIsLoading(true);
    try {
      // 1. 직원 목록 조회
      const staffResponse = await getStaffList(Number(storeId));
      if (staffResponse.code !== 'SUCCESS' || !staffResponse.data) {
        throw new Error('직원 목록 조회 실패');
      }

      const staffList = staffResponse.data.staffInfoRes;

      // 2. 해당 월의 급여명세서 목록 조회
      const payslipResponse = await getPayslipsByMonth(Number(storeId), targetMonth);
      const payslips = payslipResponse?.data?.payslips || [];

      // 3. 각 직원별로 상세 정보 및 급여명세서 상태 매핑
      const staffPromises = staffList.map(async (staff: StaffInfo) => {
        try {
          // 직원 상세 정보 조회는 현재 API 구조상 phone이 없을 수 있으므로 주석 처리
          // const detailResponse = await getStaffDetail(Number(storeId), staff.id);
          // const staffDetail = detailResponse?.data;

          // 해당 직원의 급여명세서 찾기
          const staffPayslip = payslips.find((payslip: PayslipSummary) => 
            payslip.staffName === staff.name || payslip.staffNickName === staff.nickname
          );

          // 계좌 정보는 임시로 비활성화 (phone 정보가 없으므로)
          // let accountInfo = null;
          // if (staffDetail?.phone) {
          //   try {
          //     const memberResponse = await getMemberByPhone(staffDetail.phone);
          //     accountInfo = memberResponse?.data;
          //   } catch (error) {
          //     console.warn(`${staff.name}의 계좌 정보 조회 실패:`, error);
          //   }
          // }

          // 급여명세서 상태에 따른 활성화/비활성화 결정
          const hasConfirmedPayslip = staffPayslip?.status === 'CONFIRMED' || 
                                    staffPayslip?.status === 'ACCEPTED' ||
                                    staffPayslip?.status === 'APPROVED';

          return {
            id: staff.id,
            name: staff.name,
            nickname: staff.nickname,
            amount: staffPayslip ? calculateNetSalary(staffPayslip) : 0,
            isSelected: false,
            isDisabled: !hasConfirmedPayslip || staff.status !== 'ACTIVE',
            account: '001-1234-5678', // 임시 계좌번호
            bankName: '싸피',
            phone: undefined, // 임시로 undefined
            payslipStatus: staffPayslip?.status || 'NO_PAYSLIP'
          } as StaffMemberItem;

        } catch (error) {
          console.error(`${staff.name} 정보 처리 중 오류:`, error);
          return {
            id: staff.id,
            name: staff.name,
            nickname: staff.nickname,
            amount: 0,
            isSelected: false,
            isDisabled: true,
            account: '정보 조회 실패',
            bankName: '싸피',
            payslipStatus: 'ERROR'
          } as StaffMemberItem;
        }
      });

      const processedStaff = await Promise.all(staffPromises);
      setPaymentItems(processedStaff);

    } catch (error) {
      console.error('데이터 조회 실패:', error);
      Alert.alert('오류', '직원 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 급여명세서에서 실수령액 계산 (임시 로직)
  const calculateNetSalary = (payslip: PayslipSummary): number => {
    // 실제로는 PayslipSummary에 netSalary 정보가 없으므로
    // 상세 조회 API를 추가로 호출하거나 다른 방식으로 계산 필요
    // 여기서는 임시로 고정값 사용
    return 2500000; // 임시값
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
            const transferData = selectedItems.map(item => ({
              staffId: item.id,
              name: item.name,
              amount: item.amount,
              account: item.account,
              bankName: item.bankName
            }));
            
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.rootContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>직원 정보를 불러오는 중...</Text>
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
          <TitleSection targetMonth={targetMonth} />

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
const TitleSection = ({ targetMonth }: { targetMonth: string }) => {
  const [year, month] = targetMonth.split('-');
  
  return (
    <View style={styles.titleContainer}>
      <Text style={styles.monthText}>
        <Text style={styles.monthNumber}>{parseInt(month)}월</Text> 급여 지급
      </Text>
      <Text style={styles.subtitleText}>
        {year}년 {parseInt(month)}월 급여명세서 확인 완료된 직원만 선택 가능
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
  const getStatusText = () => {
    switch (item.payslipStatus) {
      case 'CONFIRMED':
      case 'ACCEPTED': 
      case 'APPROVED':
        return '급여명세서 확인 완료';
      case 'PENDING':
      case 'SENT':
        return '급여명세서 미확인';
      case 'NO_PAYSLIP':
        return '급여명세서 없음';
      case 'ERROR':
        return '정보 조회 실패';
      default:
        return '상태 확인 필요';
    }
  };

  const getStatusColor = () => {
    if (item.isDisabled) return colors.text.secondary;
    return colors.subAccent;
  };

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
        <View style={styles.itemInfo}>
          <Text style={[
            styles.itemLabel,
            item.isDisabled && styles.itemLabelDisabled
          ]}>
            {item.name}
          </Text>
          <Text style={styles.itemSubLabel}>
            {item.nickname}
          </Text>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>
      
      <View style={styles.itemRight}>
        <Text style={[
          styles.itemAmount,
          item.isDisabled && styles.itemAmountDisabled
        ]}>
          {item.amount.toLocaleString()}원
        </Text>
        {item.account && (
          <Text style={styles.accountText}>
            {item.bankName} ****{item.account.slice(-4)}
          </Text>
        )}
      </View>
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
    color: colors.text.secondary,
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
  itemInfo: {
    flex: 1,
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
  statusText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.light2,
    marginTop: 4,
  },
  itemLabelDisabled: {
    color: colors.text.secondary,
  },
  itemRight: {
    alignItems: 'flex-end',
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
  accountText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.light2,
    color: colors.text.secondary,
    marginTop: 4,
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