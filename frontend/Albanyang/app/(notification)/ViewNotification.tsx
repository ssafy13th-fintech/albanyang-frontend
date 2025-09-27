import { useState, useEffect } from "react";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, View, Text, Pressable, StyleSheet } from "react-native";

import NoticeList from "./components/NoticeList";
import AlarmList from "./components/AlarmList";
import BackHeader from "@/components/header/BackHeader";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";

export default function NewsPage() {
  const params = useLocalSearchParams<{ tab?: "alarm" | "notice" }>();
  const [activeTab, setActiveTab] = useState<"alarm" | "notice">("alarm");

  useEffect(() => {
    if (params.tab === "notice" || params.tab === "alarm") {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  return (
    <SafeAreaView style={styles.rootContainer}>
      <BackHeader headerText="소식" />

      {/* 탭 */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "alarm" && styles.activeTab]}
          onPress={() => setActiveTab("alarm")}
        >
          <Text style={[styles.tabText, activeTab === "alarm" && styles.activeTabText]}>
            알람
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "notice" && styles.activeTab]}
          onPress={() => setActiveTab("notice")}
        >
          <Text style={[styles.tabText, activeTab === "notice" && styles.activeTabText]}>
            공지
          </Text>
        </Pressable>
      </View>

      {/* 탭별 컨텐츠 */}
      {activeTab === "alarm" ? <AlarmList /> : <NoticeList />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: { flex: 1, backgroundColor: "#FFF" },
  tabContainer: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: colors.disable, marginBottom: 10 },
  tab: { flex: 1, paddingVertical: 16, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: colors.accent },
  tabText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  activeTabText: { color: colors.accent, fontFamily: FONTS.jamsil.medium4 },
});
