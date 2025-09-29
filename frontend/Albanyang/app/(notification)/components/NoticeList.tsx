import React, { useEffect, useState } from "react";
import { ScrollView, Pressable, View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { getNotifications } from "@/api/notification/getNotifications";
import { getOwnerStores } from "@/api/store/getOwnerStores";
import { getRoleFromToken } from "@/api/authorization/AuthTokenStorage";
import { deleteNotification } from "@/api/notification/deleteNotification";

import NoticeDetailModal from "./NoticeDetailModal";
import RoleBasedDropdown from "./storeSelector";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLightbulb } from '@fortawesome/free-regular-svg-icons';
import { getStaffStores } from "@/api/store/getStaffStores";


export interface Notice {
    id: number;
    title: string;
    date: string;
    storeName: string;
    content: string;
}

export interface Notification{
    id: number;
    storeId:  number;
    storeName: string;
    title: string;
    content: string;
    date: string;
}


export default function NoticeList() {
  const [notices, setNotices] = useState<Notification[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notification | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItemObj, setSelectedItemObj] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const fetchedRole = await getRoleFromToken();
      setRole(fetchedRole);
    })();
  }, []);

    useEffect(() => {
      (async () => {
          try {
            setLoading(true);
            const role = await getRoleFromToken();
            const stores = role === "EMPLOYER"? await getOwnerStores() : await getStaffStores();

            let allNotices: Notification[] = [];
            for (const store of stores) {
              const notices = await getNotifications(Number(store.id));
              console.log("언제");
              const mapped = notices.infos.map((n: Notice) => ({
                  ...n, storeId: Number(store.id),
              }));

              allNotices = [...allNotices, ...mapped];
            }

            setNotices(allNotices);
          } catch (error) {
            
          } finally {
          setLoading(false);
        }
      }
    )();
  }, []);

  const handleNoticePress = (notice: Notification) => {
    setSelectedNotice(notice);
    setShowDetailModal(true);
  };

  const handleNoticeLongPress = (notice: Notification) => {
    Alert.alert(
      "삭제 확인",
      "이 공지를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "삭제", 
          style: "destructive",
          onPress: () => handleDeleteNotice(notice.id, notice.storeId)
        }
      ]
    );
  };

  const handleDeleteNotice = async (noticeId: number, storeId: number) => {
    try {
      await deleteNotification(storeId, noticeId);
      setNotices(prev => prev.filter(n => n.id !== noticeId));
      Alert.alert("삭제 완료", "공지사항이 삭제되었습니다.");
    } catch (error) {
      
      Alert.alert("오류", "공지사항 삭제 중 오류가 발생했습니다.");
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
        {notices
          .filter((notice) => {
            if (!selectedItemObj) return true;
            if (selectedItemObj.id === 'all') return true; 
            return notice.storeName === selectedItemObj.name;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map((notice) => (
            <Pressable
              key={notice.id}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              onPress={() => handleNoticePress(notice)}
              onLongPress={role === "EMPLOYER" ? () => handleNoticeLongPress(notice) : undefined}
            >
              <View style={styles.cardContainer}>
                <View style={styles.noticeContainer}>
                  <FontAwesomeIcon icon={faLightbulb} size={20} color="orange" style={{ marginRight: 10 }} />
                  <Text style={styles.title}>[{notice.storeName}] {notice.title}</Text>
                </View>
                <View style={styles.dateContainer}>
                  <Text style={styles.date}>{notice.date.slice(2).replace(/-/g, '/')}</Text>
                </View>
              </View>
            </Pressable>
          ))}
      </ScrollView>


      <NoticeDetailModal
        visible={showDetailModal}
        notice = {selectedNotice}
        onClose={() => setShowDetailModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: { flex: 1, flexDirection: "column", justifyContent: "space-between", paddingRight: 20 },
  noticeContainer: { flex: 1, flexDirection: "row", justifyContent: "flex-start", paddingHorizontal: 10 },
  dateContainer: { alignItems: "flex-end" },
  card: { marginVertical: 8, paddingVertical: 18, paddingLeft: 10, minHeight: 80, borderBottomColor: "#e5e5e5ff", borderBottomWidth: 1 },
  pressed: { opacity: 0.8 },
  title: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  date: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
});

