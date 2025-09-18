// components/navBar/NavBar.tsx
import React, { memo, useMemo } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sizes } from '@/constants/size/FontSize';
import { FONTS } from '@/constants/fonts/Fonts';

type Role = 'alba' | 'sajang';
type TabKey = 'home' | 'calendar' | 'albot' | 'sum' | 'profile';

export type NavBarProps = {
  role: Role;
  activeKey?: TabKey;
  onTabPress?: (key: TabKey, e: GestureResponderEvent) => void;
  borderColor?: string;
  backgroundColor?: string;
  activeLabelColor?: string;
  inactiveLabelColor?: string;
  activeIconColor?: string;
  inactiveIconColor?: string;
};

const ICONS = {
  alba: {
    home: require('../../assets/images/navbaricon/navbar_icon_home_alba.png'),
    calendar: require('../../assets/images/navbaricon/navbar_icon_calendar_alba.png'),
    albot: require('../../assets/images/navbaricon/navbar_icon_AIbot.png'),
    sum: require('../../assets/images/navbaricon/navbar_icon_sum_alba.png'),
    profile: require('../../assets/images/navbaricon/navbar_icon_profile_alba.png'),
  },
  sajang: {
    home: require('../../assets/images/navbaricon/navbar_icon_home_sajang.png'),
    calendar: require('../../assets/images/navbaricon/navbar_icon_calendar_sajang.png'),
    albot: require('../../assets/images/navbaricon/navbar_icon_AIbot.png'),
    sum: require('../../assets/images/navbaricon/navbar_icon_sum_sajang.png'),
    profile: require('../../assets/images/navbaricon/navbar_icon_profile_sajang.png'),
  },
} as const;

const LABELS: Record<Role, Record<TabKey, string>> = {
  alba: { home: '홈', calendar: '캘린더', albot: 'AI 봇', sum: '급여 명세서', profile: '마이페이지' },
  sajang:{ home: '홈', calendar: '캘린더', albot: 'AI 봇', sum: '급여 관리',  profile: '마이페이지' },
};

const TAB_ICON = 24;         // 아이콘 규격
const NAVBAR_TOP = 6;        // 위 패딩
const NAVBAR_BOTTOM_MIN = 8; // insets 없을 때 최소 여백
const SIDE_PADDING = 16;     // 좌우 규격

function NavBar({
  role,
  activeKey,
  onTabPress,
  borderColor = '#E5E5E5',
  backgroundColor = '#FFFFFF',
  activeLabelColor = '#00100F',
  inactiveLabelColor = '#707071',
  activeIconColor = '#00100F',
  inactiveIconColor = '#9BA1A6',
}: NavBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, NAVBAR_BOTTOM_MIN);

  const items = useMemo(
    () => (['home','calendar','albot','sum','profile'] as TabKey[]).map((key) => ({
      key, label: LABELS[role][key], icon: ICONS[role][key],
    })),
    [role]
  );

  return (
    <View
      style={[
        styles.container,
        {
          borderTopColor: borderColor,
          backgroundColor,
          paddingBottom: bottomPad,   // ✅ 기기별 하단 안전영역 반영
          paddingHorizontal: SIDE_PADDING, // ✅ 좌우 16 규격
        },
      ]}
    >
      {items.map((item) => {
        const isActive = activeKey === item.key;
        const isMono = item.key !== 'albot'; // AI 봇만 컬러 유지

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            onPress={(e) => onTabPress?.(item.key, e)}
            activeOpacity={0.8}
          >
            <Image
              source={item.icon}
              resizeMode="contain"
              style={[
                styles.icon,
                isMono && { tintColor: isActive ? activeIconColor : inactiveIconColor },
              ]}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              allowFontScaling={false}
              style={[
                styles.label,
                {
                  color: isActive ? activeLabelColor : inactiveLabelColor,
                  fontSize: sizes?.smallText ?? 12,
                  lineHeight: (sizes?.smallText ?? 12) + 2,
                  fontFamily: FONTS?.jamsil?.regular3,
                },
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default memo(NavBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',   // ✅ 5등분 고르게
    paddingTop: NAVBAR_TOP,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flexBasis: 0,   // ✅ 남은 공간 균등 분배
    flexGrow: 1,
    alignItems: 'center',
  },
  icon: {
    width: TAB_ICON,
    height: TAB_ICON,
    marginBottom: 2,
  },
  label: {
    includeFontPadding: false,
    textAlign: 'center',
    width: '100%',  // ✅ 텍스트 폭 명시 → 줄바꿈 방지
  },
});
