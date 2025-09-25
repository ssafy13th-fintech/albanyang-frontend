import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { registerMember } from '@/api/Member';
import NumberButton from '@/components/buttons/NumberButton';
import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';
import { useSignUpStore } from '@/store/useSignUpStore';
import { getFcmToken } from '../_layout';

export default function SignUpAccountPassword() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isConfirmPw , setIsConfirmPw] = useState(false);
  const [error, setError] = useState(false);
  const maxPasswordLength = 6;

  const signUpStore = useSignUpStore();
useEffect(() => {
  (async () => {
    console.log(password, " ", confirmPassword);

    if (password.length === maxPasswordLength && !isConfirmPw) {
      setIsConfirmPw(true);
    } else if (confirmPassword.length === maxPasswordLength && isConfirmPw) {
      if (confirmPassword === password) {
        try{
        console.log("통과 : ", password);

        const fcmtoken = await getFcmToken();
    
            // 로컬에서 payload를 만든 뒤 바로 전송
            const payload = {
            ...signUpStore.registerForm, // 기존 정보
            accountPassword: password,
            token: fcmtoken
            };


        console.log("SIIGNup ", payload)
        await registerMember(payload);

        signUpStore.resetForm();
        router.push("/login/SignUpComplete")
        }
        catch(e ){
            console.error("error " ,e);
        }
      } else {
        console.log("미통과");
        setPassword("");
        setConfirmPassword("");
        setIsConfirmPw(false);
        setError(true);
      }
    }
  })();
}, [password, confirmPassword]);


  const handleNumberPress = (number: string) => {
    if ( !isConfirmPw && password.length < maxPasswordLength) {
      setPassword(prev => prev + number);
    }
    else
        setConfirmPassword(prev => prev + number);
  };

  const handleDelete = () => {
    if (!isConfirmPw && password.length > 0 && !error) {
      setPassword(prev => prev.slice(0, -1));
    }else{
        setConfirmPassword(prev => prev.slice(0, -1));
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
            ((i < password.length && !isConfirmPw) || i < confirmPassword.length) 
                  && styles.passwordDotFilled
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
          <Text style={styles.title}>
            {!isConfirmPw ? "계좌 간편 비밀번호" : "비밀 번호 확인"}
            </Text>
            <Text style={{
                marginTop : 8,
                fontFamily : FONTS.jamsil.light2, fontSize : sizes.smallText, color : colors.reject,
                opacity : error ? 1 : 0
            }}>
            비밀번호 확인이 틀렸습니다. 다시 입력해주세요.
            </Text>
        </View>

        {/* 비밀번호 점들 */}
        <View style={styles.passwordContainer}>
          <View style={styles.passwordDots}>
            {renderPasswordDots()}
          </View>
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
              icon="c" 
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
    marginBottom: 80,
  },
  title: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
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