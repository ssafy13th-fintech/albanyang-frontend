import React, { useRef, useEffect } from "react";
import { Animated, Dimensions, Modal, PanResponder, ScrollView, StyleSheet, Text, View, } from "react-native";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");
const SCREEN_HEIGHT = WINDOW_HEIGHT - 50;

interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  storeName: string;
}

interface NoticeDetailModalProps {
  visible: boolean;
  notice: Notice | null;
  onClose: () => void;
}

const NoticeDetailModal = ({ visible, notice, onClose }: NoticeDetailModalProps) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [visible]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      gestureState.dy > 0 && gestureState.dy > Math.abs(gestureState.dx),
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) slideAnim.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  if (!notice) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.dragHandle} />
          <View style={styles.tabContainer}>
            <Text style={styles.tabText}>[공지] {notice.storeName}</Text>
          </View>
        
          <ScrollView style={styles.contentContainer}>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.noticeDate}>{notice.date}</Text>
            <Text style={styles.noticeContent}>{notice.content}</Text>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default NoticeDetailModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  container: { backgroundColor: "#F5F5F5", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, minHeight: SCREEN_HEIGHT * 0.9, maxHeight: SCREEN_HEIGHT * 0.9 },
  dragHandle: { width: 40, height: 4, backgroundColor: colors.text.secondary, borderRadius: 2, alignSelf: "center", marginBottom: 24 },
  tabContainer: { alignItems: "center", paddingBottom: 16 },
  tabText: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, paddingBottom: 10 },
  contentContainer: { paddingHorizontal: 20 },
  noticeTitle: { fontSize: sizes.bigText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  noticeContent: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.thin1, color: colors.text.secondary, paddingTop: 15 },
  noticeDate: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, paddingVertical: 5, borderBottomColor: colors.shadow, borderBottomWidth: 0.3 },
});
