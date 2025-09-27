import { colors as COLORS } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  tabs: string[];
  activeTab: number;
  onTabPress: (index: number) => void;
}

const PayslipTabBar = ({ tabs, activeTab, onTabPress }: Props) => {

  console.log("tab ",tabs)
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            onPress={() => onTabPress(index)}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === index && styles.activeTabText
                ]}
              >
                {tab}
              </Text>
              {activeTab === index && (
                <View style={styles.activeIndicator} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabItem: {
    alignItems: 'center',
    paddingBottom: 10,
    minWidth: 120, // 최소 너비 설정
    // borderColor: 'pink',
    // borderWidth: 1
  },
  tabContent: {
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.jamsil.thin1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 8
  },
  activeTabText: {
    color: COLORS.accent,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    height: 2,
    width: '90%', // 탭 전체 줄
    backgroundColor: COLORS.accent,
  },
});

export default PayslipTabBar;