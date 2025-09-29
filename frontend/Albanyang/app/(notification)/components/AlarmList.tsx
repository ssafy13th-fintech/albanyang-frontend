import React, { useEffect, useState } from "react";
import { ScrollView, Pressable, View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { getAlarms } from "@/api/alarm/getAlarms";
import { patchAlarm } from "@/api/alarm/patchAlarm";
import { getNotification, NotificationResponse } from "@/api/notification/getNotification";

import AlarmDetailModal from "./AlarmDetailModal";
import NoticeDetailModal from "./NoticeDetailModal";
import RoleBasedDropdown from "./storeSelector";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEnvelope, faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';

export interface Alarm{
  id: number;
  messageId: string;
  screen: string;
  screenId: string;
  storeId: number;
  storeName: string;
  title: string;
  isRead: boolean;
  isResponse: boolean;
  date: string;
}

const screenMessages: Record<string, string> = {
  ACCEPT_INVITATION: "초대 수락",
  DENY_INVITATION: "합류 거절",
  GET_INVITATION: "합류 요청",
  ACCEPT_PAYSLIP: "급여명세서 수락",
  DENY_PAYSLIP: "급여명세서 거절",
  GET_PAYSLIP: "급여명세서 확인요청",
  NOTIFICATION: "공지"
};

const canOpenModal = [
  "GET_INVITATION",
  "GET_PAYSLIP",
  "NOTIFICATION"
];


export default function AlarmList() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [selectedItemObj, setSelectedItemObj] = useState<any>(null);
  const [selectedNotice, setSelectedNotice] = useState<NotificationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
        try {
          setLoading(true);
          const alarms = await getAlarms();
          setAlarms(alarms.alarmInfos);
        } catch (error) {
        
        } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAlarmPress = async (alarm: Alarm) => {
    try {
      if(!alarm.isRead){
        await patchAlarm(alarm.messageId);

        setAlarms((prev) => 
          prev.map((a) => 
            a.messageId === alarm.messageId ? { ...a, isRead: true} : a
          )
        );
      }
    } catch(err){
      
    }

    setSelectedAlarm(alarm);

    console.log("일단 함수 실행됨");
    
  if (canOpenModal.includes(alarm.screen)) {
    if (alarm.screen === "NOTIFICATION") {
      console.log("공지요 공지-!!!!");
      try {
        const notice = await getNotification(alarm.storeId, Number(alarm.screenId));
        setSelectedNotice(notice);
        setShowNoticeModal(true);
      } catch (error: any) {
        
        Alert.alert("주의", "삭제된 공지입니다.");
      }
    } else {
      setShowAlarmModal(true);
    }
  }

  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 10, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary }}>로딩중...</Text>
      </View>
    );
  }
  return (
    <View style={{ flex: 1, paddingHorizontal: 10, paddingBottom: 100 }}>
      <RoleBasedDropdown
          selectedItem={selectedItemObj?.name || "전체"}
          onSelect={setSelectedItemObj}
          containerStyle={{alignItems: "flex-end",}}
        />
      <ScrollView>
        {alarms
          .filter((alarm) => {
            if (!selectedItemObj) return true; // 선택 안했으면 전체 보여주기
            if (selectedItemObj.id === 'all') return true; 
            return alarm.storeName === selectedItemObj.name;
          })
          .map((alarm) => (
            <Pressable
              key={alarm.id}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => handleAlarmPress(alarm)}
            >
              <View style={styles.cardContainer}>
                <View style={styles.noticeContainer}>
                  <FontAwesomeIcon
                    icon={alarm.isRead ? faEnvelopeOpen : faEnvelope}
                    size={20}
                    color="orange"
                    style={{ marginRight: 10, marginTop: 5 }}
                  />
                  <View>
                    <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                      <Text style={styles.screen}>
                        [{screenMessages[alarm.screen as keyof typeof screenMessages] ?? screenMessages.DEFAULT}]{" "}
                      </Text>
                      <Text style={styles.store}>{alarm.storeName}</Text>
                    </View>
                    <Text style={styles.title}>{alarm.title}</Text>
                  </View>
                </View>
                <View style={styles.dateContainer}>
                  <Text style={styles.date}>{alarm.date.slice(2).replace(/-/g, "/")}</Text>
                </View>
              </View>
            </Pressable>
          ))}
      </ScrollView>


      <AlarmDetailModal
        visible={showAlarmModal}
        alarm = {selectedAlarm}
        onClose={() => {
          setShowAlarmModal(false) 
          setSelectedAlarm(null)
        }}
        onUpdate={(updateAlarm) => {
          setAlarms((prev) => prev.map(a => a.id === updateAlarm.id ? updateAlarm : a));
        }}
      />

      <NoticeDetailModal
        visible={showNoticeModal}
        notice = {selectedNotice}
        onClose={() => {
          setShowNoticeModal(false) 
          setSelectedNotice(null)
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { flex: 1, flexDirection: "column", justifyContent: "space-between", paddingRight: 20 },
  noticeContainer: { flex: 1, flexDirection: "row", justifyContent: "flex-start", paddingHorizontal: 10 },
  dateContainer: { alignItems: "flex-end", paddingTop: 10 },
  card: { marginVertical: 8, paddingVertical: 18, paddingLeft: 10, minHeight: 80, borderBottomColor: "#e5e5e5ff", borderBottomWidth: 1 },
  pressed: { opacity: 0.8 },
  title: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  screen: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, paddingBottom: 5 },
  store: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: "#b3b3b3ff" },
  date: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary }
});

