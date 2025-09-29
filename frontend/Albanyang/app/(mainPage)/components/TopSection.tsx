// components/TopSection.tsx - 알림 기능 포함 개선 버전

import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { FontAwesome } from '@expo/vector-icons';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { getMe, getMemberMonthlyIncome } from "@/api/Member";
import { getMyAlarms } from "@/api/Alarms";
import { useRouter } from "expo-router";

export interface AccountInfo {
  hasAccount: boolean;
  bankName?: string;
  accountNumber?: string;
  balance?: number;
}

export interface UserAccountInfo {
  hasAccount: boolean;
  accountNumber?: string | null;
}

export interface SalaryInfo {
  monthlyEarning: number;
  month: string;
}

interface EmployerProps {
  accountInfo: AccountInfo | null;
  notificationCount: number;
  onNotificationPress: () => void;
}

interface EmployeeProps{
  salaryInfo: SalaryInfo | null;
}

export const fetchAccountInfo = async (): Promise<AccountInfo | null> => {
  try {
    const userData = await getMe();
    
    if (!userData.data.account) {
      return { hasAccount: false };
    }
    
    return {
      hasAccount: true,
      bankName: "싸피",
      accountNumber: userData.data.account,
      balance: 1500000
    };
  } catch (error) {
    
    return null;
  }
};

export const fetchUserAccountInfo = async (): Promise<UserAccountInfo> => {
  try {
    const userData = await getMe();
    return {
      hasAccount: !!userData.data.account,
      accountNumber: userData.data.account
    };
  } catch (error) {
    
    return { hasAccount: false };
  }
};

export function EmployerTopSection({ accountInfo, notificationCount, onNotificationPress }: EmployerProps) {
  return (
    <View style={employerStyles.section}>
      <View style={employerStyles.notificationRow}>
        <View style={{ flex: 1 }} />
        <Pressable
          style={({ pressed }) => [employerStyles.notificationButton, pressed && employerStyles.notificationButtonPressed]}
          onPress={onNotificationPress}
        >
          <FontAwesome name="bell-o" size={24} color={colors.text.primary} />
          {notificationCount > 0 && (
            <View style={employerStyles.notificationBadge}>
              <Text style={employerStyles.notificationBadgeText}>{notificationCount > 99 ? '99+' : notificationCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={employerStyles.accountCard}>
        <View style={employerStyles.accountInfo}>
          {accountInfo?.hasAccount ? (
            <>
              <Text style={employerStyles.accountNumber}>{`${accountInfo.bankName} ${accountInfo.accountNumber}`}</Text>
              <Text style={employerStyles.accountLabel}>계좌 잔액</Text>
              <View style={employerStyles.balanceContainer}>
                <Text style={employerStyles.accountBalance}>{accountInfo.balance?.toLocaleString()}</Text>
                <Text style={employerStyles.currencyText}>원</Text>
              </View>
            </>
          ) : (
            <View style={employerStyles.noAccountContainer}>
              <Text style={employerStyles.noAccountTitle}>계좌를 등록해주세요</Text>
              <Text style={employerStyles.noAccountSubtitle}>마이페이지에서 계좌를 등록해주세요</Text>
            </View>
          )}
        </View>
        <View style={employerStyles.mascotContainer}>
          <Text style={employerStyles.mascotMessage}>
            {accountInfo?.hasAccount ? '좋은 하루예요!' : '계좌 등록하고\n시작해보세요!'}
          </Text>
          <Image
            source={require("@/assets/images/mascot/mascot_basic_boss.png")}
            style={employerStyles.mascotImage}
          />
        </View>
      </View>
    </View>
  );
}

export function EmployeeTopSection({ salaryInfo }: EmployeeProps) {
  const router = useRouter();
  const [alarmCount, setAlarmCount] = useState(0);

  // 알림 개수 조회
  useEffect(() => {
    const fetchAlarmCount = async () => {
      try {
        const alarmsResponse = await getMyAlarms();
        const unreadAlarms = alarmsResponse.data?.alarmInfos?.filter(alarm => !alarm.isRead) || [];
        setAlarmCount(unreadAlarms.length);
      } catch (error) {
        
        setAlarmCount(0);
      }
    };

    fetchAlarmCount();
    
    // 30초마다 알림 개수 업데이트
    const interval = setInterval(fetchAlarmCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationPress = () => {
    router.push('/ViewNotification');
  };

  return (
    <View style={employeeStyles.section}>
      <View style={employeeStyles.notificationRow}>
        <View style={{ flex: 1 }} />
        <Pressable
          style={({ pressed }) => [
            employeeStyles.notificationButton,
            pressed && employeeStyles.notificationButtonPressed
          ]}
          onPress={handleNotificationPress}
        >
          <FontAwesome name="bell-o" size={24} color={colors.text.primary} />
          {alarmCount > 0 && (
            <View style={employeeStyles.notificationBadge}>
              <Text style={employeeStyles.notificationBadgeText}>
                {alarmCount > 99 ? '99+' : alarmCount}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      <View style={employeeStyles.salaryCard}>
        <View style={employeeStyles.salaryContent}>
          <Text style={employeeStyles.monthText}>{salaryInfo?.month || '이번 달'}에</Text>
          <View style={employeeStyles.salaryAmountRow}>
            <Text style={employeeStyles.salaryLabel}>총 </Text>
            <Text style={employeeStyles.salaryAmount}>{salaryInfo?.monthlyEarning.toLocaleString() || '0'}</Text>
            <Text style={employeeStyles.currencyText}>원</Text>
          </View>
          <Text style={employeeStyles.earnedText}>벌었습니다!</Text>
        </View>
        
        <View style={employeeStyles.mascotContainer}>
          <Image
            source={require("@/assets/images/mascot/mascot_good_alba.png")}
            style={employeeStyles.mascotImage}
          />
        </View>
      </View>
    </View>
  );
}

const employerStyles = StyleSheet.create({
  section: { marginBottom: 12, paddingHorizontal: 20 },
  notificationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  notificationButton: { padding: 8, borderRadius: 8, position: 'relative' },
  notificationButtonPressed: { backgroundColor: 'rgba(0,0,0,0.05)' },
  notificationBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: colors.reject, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  notificationBadgeText: { color: colors.text.reverse, fontSize: 10, fontFamily: FONTS.jamsil.bold5 },
  accountCard: { flexDirection: 'row', backgroundColor: colors.text.reverse, borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },
  accountInfo: { flex: 1 },
  accountLabel: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, marginBottom: 8 },
  accountNumber: { fontSize: sizes.smallText, color: colors.text.secondary, marginBottom: 4, fontFamily: FONTS.jamsil.regular3 },
  balanceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  accountBalance: { fontSize: sizes.middleTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary, marginRight: 4 },
  currencyText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  noAccountContainer: { flex: 1 },
  noAccountTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 4 },
  noAccountSubtitle: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  mascotContainer: { alignItems: 'center', justifyContent: 'center' },
  mascotMessage: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center', backgroundColor: colors.disable, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 8 },
  mascotImage: { width: 100, height: 100, resizeMode: 'contain' },
});

const employeeStyles = StyleSheet.create({
  section: { marginBottom: 32, paddingHorizontal: 20 },
  notificationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  notificationButton: { padding: 8, borderRadius: 8, position: 'relative' },
  notificationButtonPressed: { backgroundColor: 'rgba(0,0,0,0.05)' },
  notificationBadge: { position: 'absolute', top: 4, right: 4, backgroundColor: colors.reject, borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  notificationBadgeText: { color: colors.text.reverse, fontSize: 10, fontFamily: FONTS.jamsil.bold5 },
  salaryCard: { flexDirection: 'row', backgroundColor: colors.text.reverse, borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },
  salaryContent: { flex: 1 },
  monthText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, marginBottom: 4 },
  salaryAmountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 8 },
  salaryLabel: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  salaryAmount: { fontSize: sizes.middleTitle, fontFamily: FONTS.jamsil.bold5, color: colors.accent },
  currencyText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  earnedText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  mascotContainer: { alignItems: 'center', justifyContent: 'center' },
  mascotImage: { width: 100, height: 100, resizeMode: 'contain' }
});