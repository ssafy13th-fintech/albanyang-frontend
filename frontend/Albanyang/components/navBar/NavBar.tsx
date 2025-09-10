//NavBar
// components/CustomNavBar.js
import { colors } from '@/constants/Colors/ColorTheme';
import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Ionicons 컴포넌트의 'name' prop 타입을 직접 가져옵니다.
type IconName = ComponentProps<typeof Ionicons>['name'];

// NavItem 타입을 IconName을 사용하여 재정의합니다.
type NavItem = {
  name: string;
  icon: IconName;
};

// 재정의된 NavItem 타입을 navItems 배열에 적용합니다.
const navItems: NavItem[] = [
  { name: 'Home', icon: 'home-outline' },
  { name: 'Calendar', icon: 'calendar-outline' },
  { name: 'Account', icon: 'cash-outline' },
  { name: 'Profile', icon: 'person-outline' },
];

const CustomNavBar = () => {
  return (
    <View style={styles.navBar}>
      {navItems.map((item, index) => (
        <Pressable key={index} style={styles.navItem}>
          <Ionicons
            name={item.icon}
            size={24}
            color={item.name === 'Home' ? colors.accent : colors.text.secondary}
          />
          <Text
            style={[
              styles.navText,
              item.name === 'Home' && styles.activeNavText,
            ]}>
            {item.name}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.panel,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 80,
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    marginTop: 5,
    color: colors.text.secondary,
  },
  activeNavText: {
    color: colors.accent,
  },
});

export default CustomNavBar;