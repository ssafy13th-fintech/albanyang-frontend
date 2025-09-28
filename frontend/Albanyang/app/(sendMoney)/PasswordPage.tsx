import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Image,
  Vibration,
  Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';

// API imports
import { checkAuthCode } from '@/api/SSAFYOpenapi';

export default function PasswordVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const maxPasswordLength = 6;

  // 파라미터로 받은 송금 데이터
  const transferData = params.transferData ? JSON.parse(params.transferData as string) : [];
  const totalAmount = parseInt(params.totalAmount as string) || 0;
  const recipientCount = parseInt(params.recipientCount as string) || 0;

  useEffect(() => {
    if (password.length === maxPasswordLength) {
      handlePasswordComplete();
    }
  }, [password]);

  const handlePasswordComplete = async () => {
    try {
      // 실제로는 계좌 비밀번호 검증 API 호출
      const isValid = await verifyAccountPassword(password);
      
      if (isValid) {
        // 송금 처리 시작
        await processAllTransfers();
      } else {
        setError(true);
        Vibration.vibrate(500);
        Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
        setTimeout(() => {
          setPassword('');
          setError(false);
        }, 1000);
      }
    } catch (error) {
      console.error('비밀번호 검증 오류:', error);
      setError(true);
      Alert.alert('오류', '비밀번호 검증 중 문제가 발생했습니다.');
      setTimeout(() => {
        setPassword('');
        setError(false);
      }, 1000);
    }
  };

  const verifyAccountPassword = async (pwd: string): Promise<boolean> => {
    try {
      // 실제로는 SSAFY API의 계좌 비밀번호 검증 사용
      // 여기서는 테스트용으로 000000 사용
      
      // const response = await checkAuthCode({
      //   apiKey: 'your-api-key',
      //   userKey: 'user-key',
      //   accountNo: 'account-number',
      //   authText: 'SSAFY',
      //   authCode: pwd
      // });
      
      return pwd === '000000'; // 테스트용
    } catch (error) {
      console.error('계좌 비밀번호 검증 실패:', error);
      return false;
    }
  };

  const processAllTransfers = async () => {
    try {
      const successList = [];
      const failList = [];

      // 각 직원별로 송금 처리
      for (const item of transferData) {
        try {
          // 실제 송금 API 호출
          // const result = await transferSalary({
          //   staffId: item.staffId,
          //   account: item.account,
          //   amount: item.amount,
          //   bankName: item.bankName
          // });

          // 테스트용 - 성공 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 500));
          
          successList.push({
            ...item,
            success: true,
            transactionNo: Date.now().toString()
          });

        } catch (error) {
          console.error(`${item.name} 송금 실패:`, error);
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
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (error) {
      console.error('송금 처리 중 오류:', error);
      Alert.alert('오류', '송금 처리 중 문제가 발생했습니다.');
      router.back();
    }
  };

  const handleNumberPress = (number: string) => {
    if (password.length < maxPasswordLength && !error) {
      setPassword(prev => prev + number);
    }
  };

  const handleDelete = () => {
    if (password.length > 0 && !error) {
      setPassword(prev => prev.slice(0, -1));
    }
  };

  const handleClear = () => {
    setPassword('');
    setError(false);
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

  const NumberButton = ({ number, onPress }: { number: string; onPress: () => void }) => (
    <Pressable
      style={({ pressed }) => [
        styles.numberButton,
        pressed && styles.numberButtonPressed
      ]}
      onPress={onPress}
    >
      <Text style={styles.numberButtonText}>{number}</Text>
    </Pressable>
  );

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
        pressed && styles.actionButtonPressed
      ]}
      onPress={onPress}
    >
      <Text style={styles.actionButtonText}>{icon}</Text>
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
  numberButton: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.text.reverse,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  numberButtonPressed: {
    backgroundColor: colors.disable,
    transform: [{ scale: 0.95 }],
  },
  numberButtonText: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
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
  actionButtonText: {
    fontSize: sizes.bigTitle,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.reverse,
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