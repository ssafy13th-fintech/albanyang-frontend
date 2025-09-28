// components/ActionSection.tsx
import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { Store } from "@/api/store/getOwnerStores";
import { useRouter } from "expo-router";

interface Props {
  selectedStore: Store | null;
  onWriteNotice: () => void;
  onSchedule: () => void;
  onInvite: () => void;
  onSend: () => void;
}

export default function ActionSection({ selectedStore, onWriteNotice, onSchedule, onInvite, onSend }: Props) {
  const router = useRouter();
  return (
    <View style={styles.section}>
      <View style={styles.actionContainer}>
        <Pressable style={({ pressed }) => [styles.circleActionButton, pressed && styles.actionButtonPressed]} onPress={onWriteNotice}>
          <View style={styles.circleActionIconContainer}><Text style={styles.actionIcon}>📢</Text></View>
          <Text style={styles.actionText}>공지쓰기</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.circleActionButton, pressed && styles.actionButtonPressed]} onPress={onSchedule}>
          <View style={styles.circleActionIconContainer}><Text style={styles.actionIcon}>📅</Text></View>
          <Text style={styles.actionText}>스케줄</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.circleActionButton, pressed && styles.actionButtonPressed]} onPress={onInvite}>
          <View style={styles.circleActionIconContainer}><Text style={styles.actionIcon}>✉️</Text></View>
          <Text style={styles.actionText}>초대</Text>
        </Pressable>
        
        <Pressable style={({ pressed }) => [styles.circleActionButton, pressed && styles.actionButtonPressed]} onPress={onSend}>
          <View style={styles.circleActionIconContainer}><Text style={styles.actionIcon}>✉️</Text></View>
          <Text style={styles.actionText}>송금</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 12, paddingHorizontal: 20 },
  actionContainer: { flexDirection: 'row', justifyContent: 'space-around', gap: 12 },
  circleActionButton: { flex: 1, backgroundColor: colors.text.reverse, borderRadius: 30, padding: 20, alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6, aspectRatio: 1 },
  actionButtonPressed: { backgroundColor: colors.disable, transform: [{ scale: 0.95 }] },
  circleActionIconContainer: { marginBottom: 8 },
  actionIcon: { fontSize: 28 },
  actionText: { fontSize: sizes.smallText, color: colors.text.primary, fontFamily: FONTS.jamsil.medium4, textAlign: 'center' },
});
