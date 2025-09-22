import { colors } from "@/constants/colors/ColorTheme";
import { sizes } from "@/constants/size/FontSize";
import React, { ReactNode } from "react";
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export interface BottomActionButtonProps {
  label?: string;
  onPress?: (event: GestureResponderEvent) => void;
  bottomGap?: number; // 안전영역 제외하고 바닥에서 떨어질 거리 (default 40)
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  mainColor? : string;
  pressColor? : string;
}


export default function BottomActionButton({
  label = "다음으로",
  onPress,
  bottomGap = 0,
  containerStyle,
  buttonStyle = null,
  textStyle,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  mainColor = colors.main,
  pressColor =  colors.accent
}: BottomActionButtonProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <>
      {leftIcon ? <View style={styles.iconSlot}>{leftIcon}</View> : null}
      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <Text style={[styles.buttonText, textStyle]} numberOfLines={1}>
          {label}
        </Text>
      )}
      {rightIcon ? <View style={styles.iconSlot}>{rightIcon}</View> : null}
    </>
  );

  // spacer mode: flow layout. marginBottom로 안전영역 + gap 적용
  return (
    <View style={[styles.spacerWrapper, { marginBottom: 0 }, containerStyle]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? pressColor : mainColor, 
            opacity: disabled ? 0.6 : 1 },
          buttonStyle,
        ]}
        disabled={disabled || loading}
      >
      <Text style = {{fontWeight : 500}}>{content}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  spacerWrapper: {
    alignSelf: "stretch",
    alignItems: "center",
    justifyContent: "center",
  },
  absoluteWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    // bottom: set dynamically
    alignItems: "center",
    zIndex: 999,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    borderRadius: 30,
    alignSelf: "stretch",
    paddingHorizontal: 16,
  },
  buttonText: {
    fontSize: sizes.normalText,
    color: colors.text.reverse,
  },
  iconSlot: {

  },
});
