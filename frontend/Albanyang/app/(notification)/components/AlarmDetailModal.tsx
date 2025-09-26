import React, { useRef, useEffect } from "react";
import { Animated, Dimensions, Modal, PanResponder, StyleSheet, View } from "react-native";

import InvitationModal from "./invitationModal";
import PayslipModal from "./PayslipModal";

const { height: WINDOW_HEIGHT } = Dimensions.get("window");
const SCREEN_HEIGHT = WINDOW_HEIGHT - 50;

export interface Alarm {
  id: number;
  messageId: string;
  screen: string;
  screenId: string;
  storeId: number;
  storeName: string;
  title: string;
  isRead: boolean;
  isResponse: boolean;
  date: string;
}

interface AlarmDetailModalProps {
  visible: boolean;
  alarm: Alarm | null;
  onClose: () => void;
  onUpdate?: (updatedAlarm: Alarm) => void;
}

const AlarmDetailModal = ({ visible, alarm, onClose, onUpdate }: AlarmDetailModalProps) => {
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

  if (!alarm) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
          {...panResponder.panHandlers}
        >
          {alarm.screen === "GET_INVITATION" ? (
            <InvitationModal
              storeId={Number(alarm.storeId)}
              isResponse={alarm.isResponse}
              closeModal={onClose}
              onUpdate={() => onUpdate?.({ ...alarm, isResponse: true, isRead: true })}
            />
          ) : alarm.screen === "GET_PAYSLIP" ? (
            <PayslipModal
              storeId={Number(alarm.storeId)}
              payslipId={Number(alarm.screenId)}
              storeName={alarm.storeName}
              isResponse={alarm.isResponse}
              messageId={alarm.messageId}
              closeModal={onClose}
              onUpdate={() => onUpdate?.({ ...alarm, isResponse: true, isRead: true })}
            />
          ) : null}

        </Animated.View>
      </View>
    </Modal>
  );
};

export default AlarmDetailModal;

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  container: { backgroundColor: "#F5F5F5", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, minHeight: SCREEN_HEIGHT * 0.9, maxHeight: SCREEN_HEIGHT * 0.9 },
});
