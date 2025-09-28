import { Image, StyleSheet, Text, View, ScrollView, Modal, Alert } from 'react-native'
import BottomActionButton from '@/components/buttons/BottomButton'
import { colors } from '@/constants/colors/ColorTheme'
import { FONTS } from '@/constants/fonts/Fonts'
import { sizes } from "@/constants/size/FontSize"
import { useRouter, useLocalSearchParams } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'

interface TransferDetail {
  staffId: number;
  name: string;
  amount: number;
  account?: string;
  bankName?: string;
  success: boolean;
  transactionNo?: string;
}

export default function TransferComplete() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // URL 파라미터에서 송금 정보 받기
  const successCount = parseInt(params.successCount as string) || 0;
  const failCount = parseInt(params.failCount as string) || 0;
  const totalAmount = parseInt(params.totalAmount as string) || 0;
  const transferDetails = params.transferDetails 
    ? JSON.parse(params.transferDetails as string) as TransferDetail[]
    : [];

  const handleConfirm = () => {
    if (failCount === 0) {
      // 모든 송금이 성공한 경우 성공 모달 표시
      setShowSuccessModal(true);
    } else {
      // 일부 실패가 있는 경우 바로 메인으로 이동
      goToMain();
    }
  };

  const goToMain = () => {
    // 메인 페이지로 이동
    router.dismissAll();
    router.push("/(mainPage)/EmployerMainPage");
  };

  const handleRetry = () => {
    // 실패한 건만 다시 시도 - 이전 페이지로 돌아가기
    Alert.alert(
      '다시 시도',
      '실패한 송금을 다시 시도하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '다시 시도', 
          onPress: () => {
            // 실패한 항목들만 필터링하여 이전 페이지로 전달
            const failedItems = transferDetails.filter(item => !item.success);
            router.back();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.rootContainer}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { 
          paddingHorizontal: insets.left === 0 ? 20 : insets.left,
          paddingTop: insets.top + 40
        }]}
      >
        
        {/* 상단 마스코트 아이콘 */}
        <View style={styles.topSection}>
          <Image
            source={
              failCount === 0 
                ? require("@/assets/images/mascot/mascot_smileface_boss.png")
                : require("@/assets/images/mascot/mascot_sadface_boss.png")
            }
            style={styles.mascotIcon}
          />
          
          <Text style={styles.completeTitle}>
            {failCount === 0 ? '송금 완료' : '송금 부분 완료'}
          </Text>
          
          {failCount > 0 && (
            <Text style={styles.warningText}>
              {failCount}건의 송금이 실패했습니다
            </Text>
          )}
        </View>

        {/* 송금 요약 정보 */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>송금 결과</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>성공</Text>
            <Text style={styles.successValue}>
              {successCount}건
            </Text>
          </View>
          
          {failCount > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>실패</Text>
              <Text style={styles.failValue}>
                {failCount}건
              </Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>이 송금액</Text>
            <Text style={styles.totalValue}>
              {totalAmount.toLocaleString()}원
            </Text>
          </View>
        </View>

        {/* 송금 상세 내역 */}
        {transferDetails.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.detailTitle}>송금 내역</Text>
            {transferDetails.map((detail, index) => (
              <View key={index} style={[
                styles.detailCard,
                !detail.success && styles.detailCardFailed
              ]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailLeft}>
                    <View style={styles.nameRow}>
                      <Text style={styles.detailName}>{detail.name}</Text>
                      <View style={[
                        styles.statusBadge,
                        detail.success ? styles.successBadge : styles.failBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          detail.success ? styles.successText : styles.failText
                        ]}>
                          {detail.success ? '성공' : '실패'}
                        </Text>
                      </View>
                    </View>
                    {detail.bankName && detail.account && (
                      <Text style={styles.detailAccount}>
                        {detail.bankName} ****{detail.account.slice(-4)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.detailRight}>
                    <Text style={styles.detailAmount}>
                      {detail.amount.toLocaleString()}원
                    </Text>
                    {detail.transactionNo && detail.success && (
                      <Text style={styles.transactionNo}>
                        거래번호: {detail.transactionNo.slice(-6)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 여백 */}
        <View style={styles.spacer} />

      </ScrollView>

      {/* 하단 버튼 */}
      <View style={[styles.buttonContainer, { 
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 20
      }]}>
        {failCount > 0 ? (
          <View style={styles.buttonRow}>
            <View style={styles.buttonWrapper}>
              <BottomActionButton
                label="다시 시도"
                textStyle={{ fontWeight: '600' }}
                onPress={handleRetry}
                style={styles.retryButton}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <BottomActionButton
                label="확인"
                textStyle={{ fontWeight: '600' }}
                onPress={handleConfirm}
              />
            </View>
          </View>
        ) : (
          <BottomActionButton
            label="확인"
            textStyle={{ fontWeight: '600' }}
            onPress={handleConfirm}
          />
        )}
      </View>

      {/* 성공 모달 */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Image
              source={require("@/assets/images/mascot/mascot_smileface_boss.png")}
              style={styles.modalMascot}
            />
            <Text style={styles.modalTitle}>송금이 완료되었습니다!</Text>
            <Text style={styles.modalMessage}>
              {successCount}명에게 총 {totalAmount.toLocaleString()}원이{'\n'}
              성공적으로 송금되었습니다.
            </Text>
            <BottomActionButton
              label="확인"
              onPress={() => {
                setShowSuccessModal(false);
                goToMain();
              }}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  scrollView: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 120,
  },

  topSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 32,
  },

  mascotIcon: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 24,
  },

  completeTitle: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    textAlign: "center",
  },

  warningText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.reject,
    marginTop: 8,
  },

  summaryCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  summaryTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  summaryLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  successValue: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.subAccent,
  },

  failValue: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.reject,
  },

  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.disable,
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },

  totalLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
  },

  totalValue: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.accent,
  },

  detailSection: {
    marginTop: 24,
  },

  detailTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 12,
    paddingHorizontal: 8,
  },

  detailCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.subAccent,
  },

  detailCardFailed: {
    borderLeftColor: colors.reject,
    backgroundColor: '#FFF5F5',
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  detailLeft: {
    flex: 1,
    marginRight: 12,
  },

  detailRight: {
    alignItems: 'flex-end',
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  detailName: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    marginRight: 8,
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  successBadge: {
    backgroundColor: colors.subAccent,
  },

  failBadge: {
    backgroundColor: colors.reject,
  },

  statusText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.medium4,
  },

  successText: {
    color: colors.text.reverse,
  },

  failText: {
    color: colors.text.reverse,
  },

  detailAccount: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.light2,
    color: colors.text.secondary,
    marginTop: 2,
  },

  detailAmount: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    textAlign: 'right',
  },

  transactionNo: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.light2,
    color: colors.text.secondary,
    marginTop: 2,
    textAlign: 'right',
  },

  spacer: {
    height: 40,
  },

  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.text.reverse,
    borderTopWidth: 1,
    borderTopColor: colors.disable,
    paddingTop: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },

  buttonWrapper: {
    flex: 1,
  },

  retryButton: {
    backgroundColor: colors.text.secondary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  modalContent: {
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  modalMascot: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },

  modalMessage: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  modalButton: {
    width: '100%',
    marginTop: 8,
  },
});