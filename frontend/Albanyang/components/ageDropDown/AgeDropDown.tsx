// components/ageDropDown/AgeDropDown.tsx
import { useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  ViewStyle,
  TextStyle,
  Modal,
  Dimensions,
} from "react-native";

type Props = {
  value: string | null;
  onChange: (v: string) => void;
  options?: string[];
  placeholder?: string;
  label?: string;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  textStyle?: TextStyle;
  maxDropdownHeight?: number;      // 기본 260
  overlayColor?: string;           // 배경 터치 닫기 영역 색 (거의 투명)
};

const DEFAULT_AGE_OPTIONS = ["10대", "20대", "30대", "40대", "50대", "60대 이상"];

export default function AgeDropDown({
  value,
  onChange,
  options = DEFAULT_AGE_OPTIONS,
  placeholder = "나이",
  label,
  containerStyle,
  inputStyle,
  textStyle,
  maxDropdownHeight = 260,
  overlayColor = "rgba(0,0,0,0.001)",
}: Props) {
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0, h: 0 });

  const measureAndOpen = () => {
    // 트리거의 화면 좌표 측정 후 모달 오픈
    // (web/ios/android 공통)
    requestAnimationFrame(() => {
      triggerRef.current?.measureInWindow?.((x, y, w, h) => {
        setAnchor({ x, y, w, h });
        setOpen(true);
      });
    });
  };

  const pick = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const close = () => setOpen(false);

  const screenW = Dimensions.get("window").width;

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* 트리거 */}
      <Pressable
        ref={triggerRef}
        onPress={measureAndOpen}
        style={[styles.input, styles.selectRow, inputStyle]}
        hitSlop={6}
      >
        <Text style={[value ? styles.selectText : styles.selectPlaceholder, textStyle]}>
          {value ?? placeholder}
        </Text>
        <Text style={styles.caret}>▾</Text>
      </Pressable>

      {/* 포탈: 항상 맨 위 레이어에 떠서 다른 요소를 덮음 */}
      <Modal visible={open} transparent animationType="none" onRequestClose={close}>
        {/* 바깥을 누르면 닫힘 */}
        <Pressable style={[styles.overlay, { backgroundColor: overlayColor }]} onPress={close}>
          <View pointerEvents="box-none" style={StyleSheet.absoluteFillObject}>
            <View
              style={[
                styles.dropdown,
                {
                  top: anchor.y + anchor.h + 8,                             // 트리거 바로 아래
                  left: Math.max(12, anchor.x),                              // 좌측 여백 보정
                  width: Math.min(anchor.w, screenW - anchor.x - 12),        // 화면 밖 방지
                  maxHeight: maxDropdownHeight,
                },
              ]}
            >
              <FlatList
                data={options}
                keyExtractor={(it) => it}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => pick(item)}
                    style={({ pressed }) => [
                      styles.optionRow,
                      pressed && { backgroundColor: "#F1F5F9" },
                    ]}
                  >
                    <Text style={styles.optionText}>{item}</Text>
                  </Pressable>
                )}
                showsVerticalScrollIndicator
                nestedScrollEnabled
              />
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const BLUE_DARK = "#BFDBFE";

const styles = StyleSheet.create({
  wrap: { width: "100%", maxWidth: 360 },
  label: { fontSize: 14, color: "#111827", marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: BLUE_DARK,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: { color: "#111827" },
  selectPlaceholder: { color: "#94a3b8" },
  caret: { fontSize: 16, color: "#6B7280" },

  overlay: {
    flex: 1,
    justifyContent: "flex-start",
  },

  dropdown: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    overflow: "hidden",
  },
  optionRow: { paddingVertical: 12, paddingHorizontal: 12 },
  optionText: { color: "#111827", fontSize: 14 },
});
