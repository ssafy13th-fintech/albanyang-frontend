// components/navBar/NavBar.tsx
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';
import { useRouter } from 'expo-router';
import React, { memo, useMemo } from 'react';
import {
  GestureResponderEvent,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type Role = 'alba' | 'sajang';
export type TabKey = 'home' | 'calendar' | 'albot' | 'sum' | 'profile';

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
  alba: { home: '홈', calendar: '근태 조회', albot: 'AI 봇', sum: '급여 명세서', profile: '마이페이지' },
  sajang: { home: '홈', calendar: '근태 관리', albot: 'AI 봇', sum: '급여 관리', profile: '마이페이지' },
};

const ROUTES: Record<Role, Record<TabKey, string>> = {
  alba: {
    home: '/(mainPage)/EmployeeMainPage',
    calendar: '/attendance/MyAttendancePage',
    albot: '/ChatBot',
    sum: '/payslip/employee/PayslipListEmployee',
    profile: '/myPage/MyPage',
  },
  sajang: {
    home: '/(mainPage)/EmployerMainPage',
    calendar: '/schedule',
    albot: '/ChatBot',
    sum: '/salary-management',
    profile: '/myPage/MyPage',
  },
};

const COLOR_PRESERVED_TABS: TabKey[] = ['albot'];

const TAB_ICON = 24;
const NAVBAR_TOP = 6;
const NAVBAR_BOTTOM_MIN = 8;
const SIDE_PADDING = 16;

const getFontFamily = () => {
  try {
    return FONTS?.jamsil?.regular3 || 'System';
  } catch {
    return 'System';
  }
};

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
  const router = useRouter();

  const bottomPad = Math.max(insets.bottom || 0, NAVBAR_BOTTOM_MIN);
  const totalHeight = NAVBAR_BASE_HEIGHT + bottomPad;

  const items = useMemo(
    () => (['home', 'calendar', 'albot', 'sum', 'profile'] as TabKey[]).map((key) => ({
      key,
      label: LABELS[role][key],
      icon: ICONS[role][key],
      route: ROUTES[role][key],
      preserveColor: COLOR_PRESERVED_TABS.includes(key),
    })),
    [role]
  );

  const fontSize = getFontSize();
  const fontFamily = getFontFamily();

  const handleTabPress = (key: TabKey, route: string, e: GestureResponderEvent) => {
    if (onTabPress) {
      onTabPress(key, e);
    }
    if (activeKey !== key) {
      try {
        router.push(route);
      } catch (error) {
        console.warn(`Failed to navigate to ${route}:`, error);
      }
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: totalHeight,
          paddingBottom: bottomPad + 8,
          paddingTop: NAVBAR_TOP,
          paddingHorizontal: SIDE_PADDING,
          borderTopColor: borderColor,
          backgroundColor,
          zIndex: 999,
          elevation: 12,
        },
      ]}
      pointerEvents="auto"
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
            onPress={(e) => handleTabPress(item.key, item.route, e)}
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
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
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
