import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetNotification } from "./hooks/useGetNotification";
import { useLocalSearchParams } from "expo-router";

import BackHeader from "@/components/header/BackHeader";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

export default function NoticeRegistration() {
    const params = useLocalSearchParams();
    const storeId = Number(params.storeId);
    const notificationId = Number(params.notificationId);
    
    const { getNotice, loading, error, data } = useGetNotification();

    useEffect(() => {
        console.error(storeId + " + " + notificationId);
        if(!storeId || !notificationId) return;
        getNotice(storeId, notificationId);
        console.error(data);
    }, [storeId, notificationId]);

  return (
    <SafeAreaView style={styles.rootContainer}>
      <BackHeader headerText="공지사항" 
        backTo={{ pathname: "/ViewNotification", params: { tab: "notice" } }} />
      <View style={styles.container}>
        {loading && <ActivityIndicator size="large" color={colors.main} />}
        {error && <Text style={{ color: "red" }}>{error.message}</Text>}

        {!loading && !error && data && (
          <>
            <View style={styles.inputSection}>
              <Text style={styles.titleInput}>[{data.storeName}] {data.title}</Text>
              <Text style={styles.dateInput}>{data.date}</Text>
            </View>
            <Text style={styles.contentInput}>{data.content}</Text>

          </>
        )}
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: "#FFF" },
  container: { flex: 1, paddingHorizontal: 20, gap: 24 },
  inputSection: { gap: 8 },
  dateInput: { paddingLeft: 5, fontFamily: FONTS.jamsil.thin1, color: colors.text.secondary, borderBottomColor: colors.shadow, borderBottomWidth: 0.3, paddingBottom: 10 },
  titleInput: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.thin1, color: colors.text.primary },
  contentInput: { paddingBottom: 16, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.thin1, color: colors.text.primary },
});
