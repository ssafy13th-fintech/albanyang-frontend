import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Vibration,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';
import NumberButton from '@/components/buttons/NumberButton';

// API imports - 실제 은행 API 연결
import { checkAuthCode, updateDemandDepositAccountTransfer } from '@/api/SSAFYOpenapi';
import { confirmAccountPassword, getMe } from '@/api/Member';
import Constants from 'expo-constants';
import { patchPayslipStatus } from '@/api/payslip/patchPayslipStatus';

export default function PasswordVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const maxPasswordLength = 6;

  // 파라미터로 받은 송금 데이터
  const transferData = params.transferData ? JSON.parse(params.transferData as string) : [];
  const totalAmount = parseInt(params.totalAmount as string) || 0;
  const recipientCount = parseInt(params.recipientCount as string) || 0;

  useEffect(() => {
    if (password.length === maxPasswordLength && !isProcessing) {
      handlePasswordComplete();
    }
  }, [password, isProcessing]);

  const handlePasswordComplete = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      // 실제 계좌 비밀번호 검증 API 호출
      const isValid = await verifyAccountPassword(password);
      
      if (isValid) {
        // 송금 처리 시작
        await processAllTransfers();
      } else {
        setError(true);
        Vibration.vibrate(500);
        
        setTimeout(() => {
          setPassword('');
          setError(false);
        }, 1000);
      }
    } catch (error) {
      
      setError(true);
      Alert.alert('오류', '비밀번호 검증 중 문제가 발생했습니다.');
      setTimeout(() => {
        setPassword('');
        setError(false);
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyAccountPassword = async (pwd: string): Promise<boolean> => {
    try {
      // 1. 내 정보 조회하여 계좌 정보 가져오기
      const memberResponse = await getMe();
      if (memberResponse.code !== 'SUCCESS' || !memberResponse.data?.account) {
        throw new Error('계좌 정보를 찾을 수 없습니다.');
      }

      const userAccount = memberResponse.data.account;
      
      // 2. SSAFY API로 계좌 비밀번호 검증
      // Expo Constants를 사용하여 환경변수 접근
      const API_KEY = Constants.expoConfig?.extra?.ssafyApiKey || 'test-api-key';
      const USER_KEY = Constants.expoConfig?.extra?.ssafyUserKey || 'test-user-key';

      // SSAFY API의 1원 송금 인증 코드 검증 사용
      await confirmAccountPassword(pwd);
      // const response = await checkAuthCode({
      //   apiKey: API_KEY,
      //   userKey: USER_KEY,
      //   accountNo: userAccount,
      //   authText: 'SSAFY', // 고정 인증 텍스트
      //   authCode: pwd // 사용자가 입력한 6자리 비밀번호
      // });

     // console.log('비밀번호 검증 응답:', response);

      // SSAFY API 응답 구조에 따라 성공 여부 판단
      // REC.status가 'SUCCESS'이거나 전체 응답의 code가 성공을 나타내는 경우
      // const isSuccess = response?.REC?.status === 'SUCCESS' || 
      //                  response?.code === 'SUCCESS' ||
      //                  response?.Header?.responseCode === 'H0000';

      return true;
      
    } catch (error) {
      
      
      // 개발 환경에서는 테스트용 비밀번호도 허용
      if (__DEV__) {
        console.warn('개발 환경: 테스트 비밀번호 허용');
        return pwd === '000000' || pwd === '123456';
      }
      
      return false;
    }
  };

  const processAllTransfers = async () => {
    try {
      const successList: any[] = [];
      const failList: any[] = [];

      // 각 직원별로 송금 처리
      for (const item of transferData) {
        try {
          // 실제 송금 API 호출
          console.log(item);
          await patchPayslipStatus(item.storeId, item.payslipId);

          // const result = await transferSalary({
          //   staffId: item.staffId,
          //   account: item.account,
          //   amount: item.amount,
          //   bankName: item.bankName
          // });


          successList.push({
            ...item,
            success: true,
            //transactionNo: result?.transactionNo || Date.now().toString()
          });

          

        } catch (error) {
          
          failList.push({
            ...item,
            success: false,
            error: error
          });
        }
      }

      // 결과에 따라 완료 페이지로 이동
      if (failList.length === 0) {
        // 모두 성공
        router.replace({
          pathname: './SendCompletePage',
          params: {
            successCount: successList.length,
            failCount: 0,
            totalAmount: totalAmount,
            transferDetails: JSON.stringify(successList)
          }
        });
      } else if (successList.length > 0) {
        // 일부 성공
        Alert.alert(
          '송금 부분 완료',
          `${successList.length}명 성공, ${failList.length}명 실패`,
          [
            {
              text: '확인',
              onPress: () => {
                router.replace({
                  pathname: './SendCompletePage',
                  params: {
                    successCount: successList.length,
                    failCount: failList.length,
                    totalAmount: successList.reduce((sum, item) => sum + item.amount, 0),
                    transferDetails: JSON.stringify(successList)
                  }
                });
              }
            }
          ]
        );
      } else {
        // 모두 실패
        Alert.alert(
          '송금 실패',
          '모든 송금이 실패했습니다. 다시 시도해주세요.',
          [
            {
              text: '확인',
              onPress: () => router.push('/(mainPage)/EmployerMainPage')
            }
          ]
        );
      }
    } catch (error) {
      
      Alert.alert('오류', '송금 처리 중 문제가 발생했습니다.');
      router.push('/(mainPage)/EmployerMainPage')
    }
  };

  // 실제 송금 API 함수 (SSAFY API 사용)
  const transferSalary = async (transferInfo: {
    staffId: number;
    account: string;
    amount: number;
    bankName: string;
  }) => {
    try {
      // 1. 내 계좌 정보 조회 (출금 계좌)
      const memberResponse = await getMe();
      if (memberResponse.code !== 'SUCCESS' || !memberResponse.data?.account) {
        throw new Error('출금 계좌 정보를 찾을 수 없습니다.');
      }

      const myAccount = memberResponse.data.account;
      
      // 2. API 키와 사용자 키 가져오기
      const API_KEY = Constants.expoConfig?.extra?.ssafyApiKey || 'test-api-key';
      const USER_KEY = Constants.expoConfig?.extra?.ssafyUserKey || 'test-user-key';

      // 3. SSAFY API로 실제 계좌이체 실행
      const transferResponse = await updateDemandDepositAccountTransfer({
        apiKey: API_KEY,
        userKey: USER_KEY,
        depositAccountNo: transferInfo.account, // 직원 계좌 (입금)
        transactionBalance: transferInfo.amount, // 송금액
        withdrawalAccountNo: myAccount, // 내 계좌 (출금)
        depositTransactionSummary: `급여송금 : ${transferInfo.amount.toLocaleString()}원`,
        withdrawalTransactionSummary: `급여지급 : ${transferInfo.amount.toLocaleString()}원`
      });

      console.log('송금 응답:', transferResponse);

      // 4. 응답 검증
      if (transferResponse?.Header?.responseCode === 'H0000' || 
          transferResponse?.code === 'SUCCESS') {
        
        // 성공 시 거래 고유번호 반환
        const transactionNo = transferResponse?.REC?.[0]?.transactionUniqueNo || 
                             transferResponse?.REC?.transactionUniqueNo ||
                             Date.now().toString();

        return {
          success: true,
          transactionNo: transactionNo,
          accountNo: transferInfo.account,
          amount: transferInfo.amount
        };
      } else {
        throw new Error(`송금 실패: ${transferResponse?.Header?.responseMessage || '알 수 없는 오류'}`);
      }
      
    } catch (error) {
      
      
      // 개발 환경에서는 시뮬레이션 허용
      if (__DEV__) {
        console.warn('개발 환경: 송금 시뮬레이션');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          success: true,
          transactionNo: `TEST_${Date.now()}`,
          accountNo: transferInfo.account,
          amount: transferInfo.amount
        };
      }
      
      throw new Error(`송금 실패: ${error}`);
    }
  };

  const handleNumberPress = (number: string) => {
    if (password.length < maxPasswordLength && !error && !isProcessing) {
      setPassword(prev => prev + number);
    }
  };

  const handleDelete = () => {
    if (password.length > 0 && !error && !isProcessing) {
      setPassword(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (!isProcessing) {
      setPassword('');
      setError(false);
    }
  };

  const renderPasswordDots = () => {
    const dots = [];
    for (let i = 0; i < maxPasswordLength; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.passwordDot,
            i < password.length && styles.passwordDotFilled,
            error && styles.passwordDotError
          ]}
        />
      );
    }
    return dots;
  };

  const ActionButton = ({ 
    icon, 
    onPress, 
    style 
  }: { 
    icon: string; 
    onPress: () => void; 
    style?: any;
  }) => (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        style,
        pressed && styles.actionButtonPressed,
        isProcessing && styles.actionButtonDisabled
      ]}
      onPress={onPress}
      disabled={isProcessing}
    >
      <Text style={[
        styles.actionButtonText,
        isProcessing && styles.actionButtonTextDisabled
      ]}>
        {icon}
      </Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.rootContainer}>
      <View style={styles.container}>
        {/* 뒤로가기 버튼 */}
        <View style={[styles.header, { marginTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && { opacity: 0.5 }
            ]}
            disabled={isProcessing}
          >
            <Image 
              source={require("@/assets/images/icon/icon_back.png")}
              style={styles.backIcon}
            />
          </Pressable>
        </View>

        {/* 제목 */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>계좌 비밀번호 확인</Text>
          <Text style={styles.subtitle}>
            {recipientCount}명에게 {totalAmount.toLocaleString()}원
          </Text>
        </View>

        {/* 비밀번호 점들 */}
        <View style={styles.passwordContainer}>
          <View style={styles.passwordDots}>
            {renderPasswordDots()}
          </View>
          {error && (
            <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
          )}
          {isProcessing && (
            <View style={styles.processingContainer}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.processingText}>송금 처리 중...</Text>
            </View>
          )}
        </View>

        {/* 스페이서 */}
        <View style={styles.spacer} />

        {/* 키패드 */}
        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>
            <NumberButton number="1" onPress={() => handleNumberPress('1')} />
            <NumberButton number="2" onPress={() => handleNumberPress('2')} />
            <NumberButton number="3" onPress={() => handleNumberPress('3')} />
          </View>
          <View style={styles.keypadRow}>
            <NumberButton number="4" onPress={() => handleNumberPress('4')} />
            <NumberButton number="5" onPress={() => handleNumberPress('5')} />
            <NumberButton number="6" onPress={() => handleNumberPress('6')} />
          </View>
          <View style={styles.keypadRow}>
            <NumberButton number="7" onPress={() => handleNumberPress('7')} />
            <NumberButton number="8" onPress={() => handleNumberPress('8')} />
            <NumberButton number="9" onPress={() => handleNumberPress('9')} />
          </View>
          <View style={styles.keypadRow}>
            <ActionButton 
              icon="C" 
              onPress={handleClear}
              style={styles.clearButton}
            />
            <NumberButton number="0" onPress={() => handleNumberPress('0')} />
            <ActionButton 
              icon="←" 
              onPress={handleDelete}
              style={styles.deleteButton}
            />
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={[styles.bottomSpacer, { marginBottom: insets.bottom }]} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.text.reverse,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    marginTop: 8,
  },
  passwordContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  passwordDots: {
    flexDirection: 'row',
    gap: 16,
  },
  passwordDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.disable,
    backgroundColor: 'transparent',
  },
  passwordDotFilled: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  passwordDotError: {
    backgroundColor: colors.reject,
    borderColor: colors.reject,
  },
  errorText: {
    marginTop: 16,
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.reject,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  processingText: {
    marginLeft: 8,
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.accent,
  },
  spacer: {
    flex: 1,
  },
  keypadContainer: {
    backgroundColor: colors.disable,
    borderRadius: 20,
    padding: 24,
    gap: 20,
    marginBottom: 20,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  actionButton: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: sizes.bigTitle,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.reverse,
  },
  actionButtonTextDisabled: {
    color: colors.text.secondary,
  },
  clearButton: {
    backgroundColor: colors.shadow,
  },
  deleteButton: {
    backgroundColor: colors.accent,
  },
  bottomSpacer: {
    height: 20,
  },
});