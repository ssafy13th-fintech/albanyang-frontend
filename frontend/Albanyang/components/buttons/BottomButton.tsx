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

export type BottomActionMode = "spacer" | "absolute";

export interface BottomActionButtonProps {
  label?: string;
  onPress?: (event: GestureResponderEvent) => void;
  bottomGap?: number; // 안전영역 제외하고 바닥에서 떨어질 거리 (default 40)
  mode?: BottomActionMode; // 'spacer' (flow) or 'absolute' (fixed)
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * 재사용 가능한 하단 액션 버튼
 * - mode 'spacer'일 때: 부모에 flex:1이 있어야 푸시되어 하단에 배치됩니다.
 * - mode 'absolute'일 때: position absolute로 화면 하단에 고정됩니다.
 */
export default function BottomActionButton({
  label = "다음으로",
  onPress,
  bottomGap = 40,
  mode = "spacer",
  containerStyle,
  buttonStyle,
  textStyle,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
}: BottomActionButtonProps) {
  const insets = useSafeAreaInsets();
  const computedBottom = (insets.bottom ?? 0) + bottomGap;

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

  if (mode === "absolute") {
    return (
      <View
        style={[
          styles.absoluteWrapper,
          // bottom must be numeric; set via inline style
          { bottom: computedBottom },
          containerStyle,
        ]}
        // make sure parent is relative (SafeAreaView by default is fine)
        pointerEvents={disabled ? "none" : "auto"}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? colors.accent : colors.main, opacity: disabled ? 0.6 : 1 },
            buttonStyle,
          ]}
        >
          {content}
        </Pressable>
      </View>
    );
  }

  // spacer mode: flow layout. marginBottom로 안전영역 + gap 적용
  return (
    <View style={[styles.spacerWrapper, { marginBottom: computedBottom }, containerStyle]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: pressed ? colors.accent : colors.main, opacity: disabled ? 0.6 : 1 },
          buttonStyle,
        ]}
        disabled={disabled || loading}
      >
        {content}
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
    height: 40,
    borderRadius: 20,
    alignSelf: "stretch",
    paddingHorizontal: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: sizes.normalText,
    color: colors.text.reverse,
  },
  iconSlot: {

  },
});
