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

// 외부에서 하단 패딩 계산에 쓰는 기준 높이(디자인 스펙)
export const NAVBAR_BASE_HEIGHT = 56;

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
  sajang: { home: '홈', calendar: '캘린더', albot: 'AI 봇', sum: '급여 관리', profile: '마이페이지' },
};

// 컬러 아이콘을 유지할 탭들 (tintColor 적용하지 않음)
const COLOR_PRESERVED_TABS: TabKey[] = ['albot'];

const TAB_ICON = 24;
const NAVBAR_TOP = 6;
const NAVBAR_BOTTOM_MIN = 8;
const SIDE_PADDING = 16;

// 폰트 폴백 함수
const getFontFamily = () => {
  try {
    return FONTS?.jamsil?.regular3 || 'System';
  } catch {
    return 'System';
  }
};

// 폰트 사이즈 폴백 함수
const getFontSize = () => {
  try {
    return sizes?.smallText || 12;
  } catch {
    return 12;
  }
};

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
  
  // 안전한 하단 패딩 계산
  const bottomPad = Math.max(insets.bottom || 0, NAVBAR_BOTTOM_MIN);
  const totalHeight = NAVBAR_BASE_HEIGHT + bottomPad;

  const items = useMemo(
    () => (['home', 'calendar', 'albot', 'sum', 'profile'] as TabKey[]).map((key) => ({
      key,
      label: LABELS[role][key],
      icon: ICONS[role][key],
      preserveColor: COLOR_PRESERVED_TABS.includes(key),
    })),
    [role]
  );

  const fontSize = getFontSize();
  const fontFamily = getFontFamily();

  return (
    <View
      style={[
        styles.container,
        {
          height: totalHeight,
          paddingBottom: bottomPad,
          paddingTop: NAVBAR_TOP,
          paddingHorizontal: SIDE_PADDING,
          borderTopColor: borderColor,
          backgroundColor,
        },
      ]}
    >
      {items.map((item) => {
        const isActive = activeKey === item.key;
        const shouldApplyTint = !item.preserveColor;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: isActive }}
            onPress={(e) => onTabPress?.(item.key, e)}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Image
                source={item.icon}
                resizeMode="contain"
                style={[
                  styles.icon,
                  shouldApplyTint && {
                    tintColor: isActive ? activeIconColor : inactiveIconColor,
                  },
                ]}
              />
            </View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              allowFontScaling={false}
              style={[
                styles.label,
                {
                  color: isActive ? activeLabelColor : inactiveLabelColor,
                  fontSize,
                  lineHeight: fontSize + 2,
                  fontFamily,
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
    justifyContent: 'space-around', // 더 균등한 간격
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1, // 정확히 균등 분할
    alignItems: 'center',
    paddingHorizontal: 4, // 최소 간격 보장
  },
  iconContainer: {
    width: TAB_ICON,
    height: TAB_ICON,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  icon: {
    width: TAB_ICON,
    height: TAB_ICON,
  },
  label: {
    includeFontPadding: false,
    textAlign: 'center',
    width: '100%',
  },
});