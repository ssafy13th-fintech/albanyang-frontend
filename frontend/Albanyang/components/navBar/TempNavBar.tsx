// components/navBar/TempNavBar.tsx
import { colors } from '@/constants/Colors/ColorTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type NavItem = { name: string; icon: IconName };

const navItems: NavItem[] = [
  { name: 'Home', icon: 'home-outline' },
  { name: 'Calendar', icon: 'calendar-outline' },
  { name: 'Account', icon: 'cash-outline' },
  { name: 'Profile', icon: 'person-outline' },
];

const NAV_BASE_HEIGHT = 60; // 기본 높이 (원래 80 → 하단 inset 포함되므로 살짝 줄임)

export default function TempNavBar() {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8); // 홈 인디케이터/내비바 보정

  return (
    <View
      style={[
        styles.navBar,
        {
          paddingBottom: bottomPad,
          height: NAV_BASE_HEIGHT + bottomPad,
        },
      ]}
    >
      {navItems.map((item, index) => (
        <Pressable key={index} style={styles.navItem} android_ripple={{ color: '#00000014' }}>
          <Ionicons
            name={item.icon}
            size={24}
            color={item.name === 'Home' ? colors.accent : colors.text.secondary}
          />
          <Text style={[styles.navText, item.name === 'Home' && styles.activeNavText]}>
            {item.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute', // ← 바닥 고정
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 10,
    // 살짝 그림자 주고 싶다면:
    // elevation: 8,
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 12,
    // shadowOffset: { width: 0, height: -2 },
  },
  navItem: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  navText: { fontSize: 12, marginTop: 5, color: colors.text.secondary },
  activeNavText: { color: colors.accent },
});
