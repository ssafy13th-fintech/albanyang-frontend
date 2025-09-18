import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

// 프로젝트의 Colors 상수들을 import (실제 경로에 맞게 수정)
// import Colors from '@/constants/Colors';

// 임시로 색상 정의
const Colors = {
  primary: '#FF9500',
  background: '#F8F8F8',
  white: '#FFFFFF',
  text: '#333333',
  gray: '#888888',
  lightGray: '#F0F0F0',
  darkGray: '#666666',
  orange: '#FF6B35'
};

const AlbaWorkAttendance = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // 실시간 시계
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleClockIn = () => {
    // 출근 로직 구현
    console.log('출근 처리');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      
      {/* 헤더 - 알림 버튼 */}
      <View style={styles.header}>
        <View style={styles.placeholder} />
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* 메인 컨텐츠 */}
      <View style={styles.mainContent}>
        
        {/* 상단 정보 */}
        <View style={styles.topInfo}>
          <Text style={styles.monthText}>8월에</Text>
          <View style={styles.salaryInfo}>
            <Text style={styles.salaryLabel}>총</Text>
            <Text style={styles.salaryAmount}>1,000,000원</Text>
          </View>
          <Text style={styles.earnedText}>벌었습니다!</Text>
        </View>

        {/* 마스코트 */}
        <View style={styles.mascotContainer}>
          <Image 
            source={require('@/assets/images/mascot/mascot_work_alba.png')}
            style={styles.mascot}
            contentFit="contain"
          />
        </View>

        {/* 시간 정보 박스 */}
        <View style={styles.timeInfoBox}>
          <View style={styles.timeRow}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>출근시간</Text>
              <Text style={styles.timeValue}>{formatTime(currentTime)}</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>퇴근시간</Text>
              <Text style={styles.timeValue}>근무 중</Text>
            </View>
          </View>
        </View>

        {/* 출근하기 버튼 */}
        <TouchableOpacity 
          style={styles.clockInButton} 
          onPress={handleClockIn}
          activeOpacity={0.8}
        >
          <Text style={styles.clockInButtonText}>출근하기</Text>
        </TouchableOpacity>

      </View>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color={Colors.primary} />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar-outline" size={24} color={Colors.gray} />
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="card-outline" size={24} color={Colors.gray} />
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color={Colors.gray} />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  placeholder: {
    width: 24,
  },
  notificationButton: {
    padding: 4,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  monthText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
    // fontFamily: 'The-Jamsil-3-Regular',
  },
  salaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  salaryLabel: {
    fontSize: 20,
    color: Colors.text,
    marginRight: 8,
    // fontFamily: 'The-Jamsil-4-Medium',
  },
  salaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.orange,
    // fontFamily: 'The-Jamsil-5-Bold',
  },
  earnedText: {
    fontSize: 18,
    color: Colors.text,
    // fontFamily: 'The-Jamsil-3-Regular',
  },
  mascotContainer: {
    marginVertical: 40,
  },
  mascot: {
    width: 120,
    height: 150,
  },
  timeInfoBox: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 40,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.lightGray,
    marginHorizontal: 20,
  },
  timeLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
    // fontFamily: 'The-Jamsil-3-Regular',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    // fontFamily: 'The-Jamsil-4-Medium',
  },
  clockInButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 60,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  clockInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    // fontFamily: 'The-Jamsil-4-Medium',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 4,
    // fontFamily: 'The-Jamsil-2-Light',
  },
  activeNavText: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});

export default AlbaWorkAttendance;