import { Image, StyleSheet, Text, View } from 'react-native'
import BottomActionButton from '@/components/buttons/BottomButton'
import { colors } from '@/constants/colors/ColorTheme'
import { FONTS } from '@/constants/fonts/Fonts'
import { sizes } from "@/constants/size/FontSize"
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

interface TransferInfo {
  bankName: string;
  accountNumber: string;
  amount: number;
}

export default function TransferComplete() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // URL 파라미터에서 이체 정보 받기
  const transferInfo: TransferInfo = {
    bankName: (params.bankName as string) || "신한",
    accountNumber: (params.accountNumber as string) || "123-456-7890", 
    amount: parseInt(params.amount as string) || 700000
  };

  const handleConfirm = () => {
    // 메인 페이지로 이동
    router.dismissAll();
    router.push("./CheckMemberListPage");
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <View style={[styles.contentContainer, { 
        paddingHorizontal: insets.left === 0 ? 20 : insets.left,
        paddingTop: insets.top + 40
      }]}>
        
        {/* 상단 마스코트 아이콘 */}
        <View style={styles.topSection}>
          <Image
            source={require("@/assets/images/mascot/mascot_good_alba.png")}
            style={styles.mascotIcon}
          />
          
          <Text style={styles.completeTitle}>이체완료</Text>
        </View>

        {/* 여백 */}
        <View style={styles.spacer} />

        {/* 하단 정보 카드 */}
        <View style={styles.bottomSection}>
          <View style={styles.transferInfoCard}>
            <Text style={styles.cardTitle}>정태승</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>받는 계좌</Text>
              <Text style={styles.infoValue}>
                {transferInfo.bankName}{transferInfo.accountNumber}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>보낸금액</Text>
              <Text style={styles.amountValue}>
                {transferInfo.amount.toLocaleString()}원
              </Text>
            </View>
          </View>

          {/* 확인 버튼 */}
          <View style={[styles.buttonContainer, { 
            marginBottom: insets.bottom + 20 
          }]}>
            <BottomActionButton
              label="확인"
              textStyle={{ fontWeight: '600' }}
              onPress={handleConfirm}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5', // 연한 회색 배경
  },
  
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },

  topSection: {
    alignItems: "center",
    marginTop: 60,
  },

  mascotIcon: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 32,
  },

  completeTitle: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    textAlign: "center",
  },

  spacer: {
    flex: 1,
  },

  bottomSection: {
    paddingBottom: 20,
  },

  transferInfoCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 32,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  cardTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    marginBottom: 24,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  infoLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },

  infoValue: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },

  amountValue: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
  },

  buttonContainer: {
    paddingHorizontal: 0,
  },
});