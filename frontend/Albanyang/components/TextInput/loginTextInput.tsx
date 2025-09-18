import { colors } from "@/constants/colors/ColorTheme";
import { useRef, useState } from "react";
import { Animated, StyleSheet, TextInput } from "react-native";

interface LoginTextInputParams {
  placeholder: string;
  value: any;
  setChangeValue: (text: string) => void | undefined;
  isSecure?: boolean;
}

/** 
 * #### login 페이지에 쓰이는 TextInput 컴포넌트입니다.
 *  
 * - placeholder : placeholder 문자
 * - value : input에 반영될 value
 * - setChangeValue : text가 변할 때마다 실행될 콜백 함수
 * - isSecure : 비밀번호 입력처럼 입력 문자를 가리고 싶을 때 사용
 */ 
export default function LoginTextInput({
  placeholder,
  value,
  setChangeValue,
  isSecure = false
}: LoginTextInputParams) {
  const [isFocus, setIsFocus] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current; // 0 = blur, 1 = focus

  const handleFocus = () => {
    setIsFocus(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocus(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  // Animated 스타일 정의
  const animatedStyle = {
    borderColor: borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.main, colors.accent],
    }),
    borderWidth: borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 2],
    }),
  };

  return (
    <Animated.View style={[styles.inputWrapper, animatedStyle]}>
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        value={value}
        onChangeText={setChangeValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={isSecure}
        autoCapitalize="none"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 16,
    alignSelf:"stretch",
    justifyContent: "center",
  },
  inputField: {
    height: "100%",
  },
});
