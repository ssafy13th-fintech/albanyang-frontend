//AlbaMainPage.tsx
// HomeScreen.js
import { colors } from '@/constants/Colors/ColorTheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
// Import your custom navigation bar component
import CustomNavBar from '@/components/navBar/NavBar';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Pressable style={styles.headerLeft}>
          <Ionicons name="location-outline" size={24} color={colors.text.primary} />
          <Text style={styles.headerText}>강남점</Text>
        </Pressable>
        <Pressable style={styles.headerRight}>
          <Ionicons name="bulb-outline" size={24} color={colors.accent} />
        </Pressable>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <Text style={styles.earningText}>8월에</Text>
        <Text style={styles.totalEarning}>
          <Text style={{ color: colors.accent }}>1,000,000원</Text>
          <Text> 벌었다냥!</Text>
        </Text>
      </View>

      {/* Work Status Panel */}
      <View style={styles.panel}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>출근시간</Text>
            <Text style={styles.statusValue}>10:12:25</Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>퇴근시간</Text>
            <Text style={styles.statusValue}>근무 중</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Pressable style={[styles.button, styles.primaryButton]}>
            <Text style={styles.buttonText}>출근하기</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.secondaryButton]}>
            <Text style={styles.buttonText}>퇴근하기</Text>
          </Pressable>
        </View>
      </View>

      {/* Bottom Cat Button */}
      <Pressable style={styles.catButton}>
        {/*  */}
      </Pressable>

      {/* Navigation Bar */}
      <CustomNavBar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 5,
    fontSize: 18,
    color: colors.text.primary,
  },
  headerRight: {
    padding: 5,
  },
  mainContent: {
    backgroundColor: colors.main,
    padding: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    borderRadius: 20,
    height: '40%',
    justifyContent: 'center',
    borderColor: colors.border,
    borderWidth: 1,
  },
  earningText: {
    fontSize: 20,
    color: colors.text.secondary,
    marginBottom: 10,
  },
  totalEarning: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  panel: {
    backgroundColor: colors.panel,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    padding: 20,
    borderColor: colors.border,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusItem: {
    alignItems: 'center',
    padding: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  statusValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: colors.accent,
  },
  secondaryButton: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white', // You can adjust this for the secondary button if needed
  },
  catButton: {
    position: 'absolute',
    bottom: 90, // Position above the navigation bar
    right: 25,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff', // Or based on the cat image background
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colors.border,
    borderWidth: 1,
  },
});

export default HomeScreen;
