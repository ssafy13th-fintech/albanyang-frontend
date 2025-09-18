// import React from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
// import { Image } from 'expo-image';
// import { Ionicons } from '@expo/vector-icons';

// // 프로젝트의 Colors와 Fonts 상수들을 import (실제 경로에 맞게 수정)
// // import Colors from '@/constants/Colors';
// // import { FontSize } from '@/constants/FontSize';

// // 임시로 색상 정의 (실제로는 constants/Colors.ts에서 가져오기)
// const Colors = {
//   primary: '#FF9500',
//   background: '#F8F8F8',
//   white: '#FFFFFF',
//   text: '#333333',
//   gray: '#888888',
//   lightGray: '#F0F0F0',
//   green: '#4CAF50',
//   yellow: '#FFC107',
//   red: '#F44336'
// };

// const AlbaMainPage = () => {
//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
//       <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
//         {/* 헤더 영역 - 마스코트와 계좌 정보 */}
//         <View style={styles.header}>
//           <View style={styles.profileSection}>
//             {/* 마스코트 이미지 - 실제 프로젝트에서는 assets/images/mascot 폴더의 이미지 사용 */}
//             <Image 
//               source={require('@/assets/images/mascot/mascot_basic_alba.png')}
//               style={styles.mascot}
//               contentFit="contain"
//             />
//             <View style={styles.accountInfo}>
//               <View style={styles.accountCard}>
//                 <Text style={styles.accountNumber}>국민 000-0000-000000</Text>
//                 <Text style={styles.balance}>7,000,000 원</Text>
//               </View>
//             </View>
//           </View>
//         </View>

//         {/* 매니저 선택창 */}
//         <View style={styles.managerSection}>
//           <Text style={styles.sectionTitle}>매니저 선택창</Text>
          
//           <View style={styles.managerList}>
//             {/* 알바 1 */}
//             <View style={styles.managerItem}>
//               <View style={[styles.statusDot, { backgroundColor: Colors.green }]} />
//               <View style={styles.managerInfo}>
//                 <Text style={styles.managerName}>알바 1</Text>
//                 <View style={styles.timeInfo}>
//                   <Text style={styles.timeText}>07:50</Text>
//                   <Text style={styles.timeSlash}> / </Text>
//                   <Text style={styles.timeTotal}>----</Text>
//                 </View>
//                 <Text style={styles.timeDetail}>(08:00 / 13:00)</Text>
//               </View>
//               <Text style={styles.workTimeLabel}>출근시간 / 퇴근시간</Text>
//             </View>

//             {/* 알바 2 */}
//             <View style={styles.managerItem}>
//               <View style={[styles.statusDot, { backgroundColor: Colors.yellow }]} />
//               <View style={styles.managerInfo}>
//                 <Text style={styles.managerName}>알바 2</Text>
//                 <View style={styles.timeInfo}>
//                   <Text style={styles.timeText}>08:10</Text>
//                   <Text style={styles.timeSlash}> / </Text>
//                   <Text style={styles.timeTotal}>----</Text>
//                 </View>
//                 <Text style={styles.timeDetail}>(08:00 / 13:00)</Text>
//               </View>
//               <Text style={styles.workTimeLabel}>출근시간 / 퇴근시간</Text>
//             </View>

//             {/* 알바 3 */}
//             <View style={styles.managerItem}>
//               <View style={[styles.statusDot, { backgroundColor: Colors.red }]} />
//               <View style={styles.managerInfo}>
//                 <Text style={styles.managerName}>알바 3</Text>
//                 <View style={styles.timeInfo}>
//                   <Text style={styles.timeText}>----</Text>
//                   <Text style={styles.timeSlash}> / </Text>
//                   <Text style={styles.timeTotal}>----</Text>
//                 </View>
//                 <Text style={styles.timeDetail}>(08:00 / 13:00)</Text>
//               </View>
//               <Text style={styles.workTimeLabel}>출근시간 / 퇴근시간</Text>
//             </View>
//           </View>
//         </View>

//         {/* 하단 액션 버튼들 */}
//         <View style={styles.bottomButtons}>
//           <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
//             <Ionicons name="notifications-outline" size={24} color={Colors.primary} />
//             <Text style={styles.buttonText}>공지 사항</Text>
//           </TouchableOpacity>

//           <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
//             <Ionicons name="mail-outline" size={24} color={Colors.primary} />
//             <Text style={styles.buttonText}>초대하기</Text>
//           </TouchableOpacity>
//         </View>

//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Colors.background,
//   },
//   scrollView: {
//     flex: 1,
//     paddingHorizontal: 20,
//   },
//   header: {
//     paddingTop: 60,
//     paddingBottom: 30,
//   },
//   profileSection: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 20,
//   },
//   mascot: {
//     width: 80,
//     height: 100,
//   },
//   accountInfo: {
//     flex: 1,
//   },
//   accountCard: {
//     backgroundColor: Colors.white,
//     padding: 20,
//     borderRadius: 15,
//     borderWidth: 2,
//     borderColor: Colors.primary,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   accountNumber: {
//     fontSize: 14,
//     color: Colors.gray,
//     marginBottom: 8,
//     // fontFamily: 'The-Jamsil-3-Regular', // 실제 프로젝트에서 주석 해제
//   },
//   balance: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: Colors.text,
//     // fontFamily: 'The-Jamsil-5-Bold', // 실제 프로젝트에서 주석 해제
//   },
//   managerSection: {
//     marginBottom: 30,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: Colors.text,
//     marginBottom: 20,
//     // fontFamily: 'The-Jamsil-4-Medium', // 실제 프로젝트에서 주석 해제
//   },
//   managerList: {
//     backgroundColor: Colors.white,
//     borderRadius: 15,
//     borderWidth: 2,
//     borderColor: Colors.primary,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   managerItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: Colors.lightGray,
//   },
//   statusDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginRight: 15,
//   },
//   managerInfo: {
//     flex: 1,
//   },
//   managerName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: Colors.text,
//     marginBottom: 4,
//     // fontFamily: 'The-Jamsil-4-Medium', // 실제 프로젝트에서 주석 해제
//   },
//   timeInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 2,
//   },
//   timeText: {
//     fontSize: 14,
//     color: Colors.text,
//     // fontFamily: 'The-Jamsil-3-Regular', // 실제 프로젝트에서 주석 해제
//   },
//   timeSlash: {
//     fontSize: 14,
//     color: Colors.gray,
//     // fontFamily: 'The-Jamsil-3-Regular', // 실제 프로젝트에서 주석 해제
//   },
//   timeTotal: {
//     fontSize: 14,
//     color: Colors.text,
//     // fontFamily: 'The-Jamsil-3-Regular', // 실제 프로젝트에서 주석 해제
//   },
//   timeDetail: {
//     fontSize: 12,
//     color: Colors.gray,
//     // fontFamily: 'The-Jamsil-2-Light', // 실제 프로젝트에서 주석 해제
//   },
//   workTimeLabel: {
//     fontSize: 12,
//     color: Colors.gray,
//     // fontFamily: 'The-Jamsil-2-Light', // 실제 프로젝트에서 주석 해제
//   },
//   bottomButtons: {
//     flexDirection: 'row',
//     gap: 15,
//     paddingBottom: 40,
//   },
//   actionButton: {
//     flex: 1,
//     backgroundColor: Colors.white,
//     borderRadius: 15,
//     borderWidth: 2,
//     borderColor: Colors.primary,
//     paddingVertical: 20,
//     paddingHorizontal: 15,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   buttonText: {
//     fontSize: 16,
//     color: Colors.primary,
//     marginTop: 8,
//     fontWeight: 'bold',
//     // fontFamily: 'The-Jamsil-4-Medium', // 실제 프로젝트에서 주석 해제
//   },
// });

// export default AlbaMainPage;

import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { colors } from "@/constants/Colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";

export default function EmployerHome() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentWrapper}
        showsVerticalScrollIndicator={false}
      >
        {/* 상단: 마스코트 + 계좌 */}
        <View style={styles.topRow}>
          <Image
            source={require("@/assets/images/mascot/mascot_smileface_boss.png")}
            style={styles.bossImage}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            {/* 알림 */}
            <View style={styles.bellRow}>
              {/* TODO: 알림 아이콘 추가 */}
            </View>
            {/* 계좌 카드 */}
            <View style={[styles.balanceCard, { borderColor: colors.main }]}>
              <View style={styles.accountRow}>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.smallText,
                    marginRight: 12,
                  }}
                >
                  국민
                </Text>
                <Text
                  style={{
                    color: colors.text.primary,
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.smallText,
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  000-0000-000000
                </Text>
              </View>
              <Text
                style={{
                  color: colors.text.primary,
                  fontFamily: FONTS.jamsil.bold5,
                  fontSize: sizes.middleTitle,
                }}
              >
                7,000,000 원
              </Text>
            </View>
          </View>
        </View>

        {/* 근태 박스 */}
        <View style={styles.attendanceWrap}>
          <View style={[styles.attendanceCard, { borderColor: colors.main }]}>
            <Text
              style={{
                color: colors.text.primary,
                fontFamily: FONTS.jamsil.bold5,
                fontSize: sizes.normalText,
                marginBottom: 16,
              }}
            >
              메가커피 선릉점
            </Text>

            <View style={styles.tableHeader}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontFamily: FONTS.jamsil.medium4,
                  fontSize: sizes.smallText,
                  width: 80,
                }}
              >
                이름
              </Text>
              <Text
                style={{
                  color: colors.text.primary,
                  fontFamily: FONTS.jamsil.medium4,
                  fontSize: sizes.smallText,
                  flex: 1,
                }}
              >
                출근시간 / 퇴근시간
              </Text>
            </View>

            <AttendanceRow
              dotColor="#66D39E"
              name="알바 1"
              time="07:50 / --:--"
              sub="(08:00 / 13:00)"
            />
            <AttendanceRow
              dotColor="#EABF63"
              name="알바 2"
              time="08:10 / --:--"
              sub="(08:00 / 13:00)"
            />
            <AttendanceRow
              dotColor="#D85353"
              name="알바 3"
              time="--:-- / --:--"
              sub="(08:00 / 13:00)"
              noBottomMargin
            />
          </View>

          {/* TODO: 우측 화살표 아이콘 추가 */}
        </View>

        {/* CTA 버튼 2개 */}
        <View style={styles.ctaRow}>
          <CTAButton title="공지 쓰기" />
          <CTAButton title="초대하기" />
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function AttendanceRow({
  dotColor,
  name,
  time,
  sub,
  noBottomMargin = false,
}: {
  dotColor: string;
  name: string;
  time: string;
  sub: string;
  noBottomMargin?: boolean;
}) {
  return (
    <View style={[styles.row, !noBottomMargin && { marginBottom: 10 }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text
        style={{
          color: colors.text.primary,
          fontFamily: FONTS.jamsil.regular3,
          fontSize: sizes.smallText,
          width: 80,
        }}
      >
        {name}
      </Text>
      <View style={{ alignItems: "center" }}>
        <Text
          style={{
            color: colors.text.primary,
            fontFamily: FONTS.jamsil.regular3,
            fontSize: sizes.smallText,
          }}
        >
          {time}
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontFamily: FONTS.jamsil.regular3,
            fontSize: sizes.smallText - 2,
          }}
        >
          {sub}
        </Text>
      </View>
    </View>
  );
}

function CTAButton({ title }: { title: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.ctaBtn, { borderColor: colors.main }]}
    >
      <Text
        style={{
          color: colors.text.primary,
          fontFamily: FONTS.jamsil.medium4,
          fontSize: sizes.normalText,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.disable },
  scroll: { flex: 1 },
  contentWrapper: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 },

  /** 상단 */
  topRow: { flexDirection: "row", marginBottom: 24 },
  bossImage: { width: 110, height: 165, marginRight: 16 },
  bellRow: { alignItems: "flex-end", marginBottom: 8, height: 28 },
  balanceCard: {
    backgroundColor: colors.disable,
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },

  /** 근태 카드 */
  attendanceWrap: { marginTop: 8, marginBottom: 24 },
  attendanceCard: {
    backgroundColor: colors.disable,
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 16, marginLeft: 6 },

  /** CTA */
  ctaRow: { flexDirection: "row", gap: 12 },
  ctaBtn: {
    flex: 1,
    alignItems: "center",
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 18,
    justifyContent: "center",
    backgroundColor: colors.disable,
  },
});