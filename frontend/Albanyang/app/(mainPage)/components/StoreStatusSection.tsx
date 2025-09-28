// components/StoreStatusSection.tsx
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { StoreDetail, StaffStatus } from "../hook/getStoresDetail";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";


interface Props {
  store: StoreDetail | null;
  stores: StoreDetail[];
  onPressStoreOverview: (store: StoreDetail) => void;
}

export default function StoreStatusSection({ store, stores, onPressStoreOverview }: Props) {
  if (stores.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.statusCard}>
          <View style={styles.emptyStoreContainer}>
            <Text style={styles.emptyStoreTitle}>매장을 추가해보세요</Text>
            <Text style={styles.emptyStoreSubtitle}>첫 매장을 등록하고 직원들을 관리해보세요</Text>
          </View>
        </View>
      </View>
    );
  }

  if (!store) return null;

  const today = new Date().toISOString().split('T')[0];
  const todayStaffs = store.staffs.filter(staff => staff.scheduleDate === today);

  const getStatusColor = (status: StaffStatus['status']) => {
    switch (status) {
      case 'present': return '#4CAF50';
      case 'late': return colors.main;
      case 'absent': return colors.reject;
      case 'no-schedule': return colors.text.secondary;
    }
  };

  const getStatusText = (staff: StaffStatus) => `${staff.checkInTime || '----'} / ${staff.checkOutTime || '----'}`;
  const getScheduleText = (staff: StaffStatus) => `(${staff.scheduledStartTime} / ${staff.scheduledEndTime})`;

  return (
    <View style={styles.section}>
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Pressable onPress={() => store && onPressStoreOverview(store)} hitSlop={8} style={({ pressed }) => [styles.storeHeaderButton, pressed && styles.storeHeaderButtonPressed]}>
            <View style={styles.storeHeaderContent}>
              <Text style={styles.statusTitle}>{store.name} 현황</Text>
              <View style={styles.moreIcon}>
                <View style={styles.dot} /><View style={styles.dot} /><View style={styles.dot} />
              </View>
            </View>
          </Pressable>
          <View style={styles.statusSummary}>
            <Text style={styles.statusCount}>
              출근 {store.presentCount} · 지각 {store.lateCount} · 결근 {store.absentCount}
            </Text>
          </View>
        </View>

        <View style={styles.staffListContainer}>
          {todayStaffs.length === 0 ? (
            <View style={styles.emptyStaffContainer}>
              <Text style={styles.emptyStaffTitle}>오늘 스케줄된 직원이 없습니다</Text>
              <Text style={styles.emptyStaffSubtitle}>스케줄을 등록해보세요</Text>
            </View>
          ) : (
            <>
              <View style={styles.listHeader}>
                <Text style={styles.headerText}>이름</Text>
                <Text style={styles.headerText}>출근시간 / 퇴근시간</Text>
              </View>

              <ScrollView style={styles.scrollableStaffList} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {todayStaffs.map(staff => (
                  <View key={staff.id} style={styles.albaRow}>
                    <View style={styles.nameSection}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(staff.status) }]} />
                      <Text style={styles.albaName}>{staff.name}</Text>
                    </View>
                    <View style={styles.timeSection}>
                      <Text style={styles.workTime}>{getStatusText(staff)}</Text>
                      <Text style={styles.scheduleTime}>{getScheduleText(staff)}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: 12, paddingHorizontal: 20 },
  statusCard: { backgroundColor: colors.text.reverse, borderRadius: 20, padding: 24, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },
  statusHeader: { marginBottom: 20 },
  storeHeaderButton: { borderRadius: 8, padding: 4, marginHorizontal: -4 },
  storeHeaderButtonPressed: { backgroundColor: colors.disable },
  storeHeaderContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  statusTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  moreIcon: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 8 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.text.secondary },
  statusSummary: { flexDirection: 'row' },
  statusCount: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  staffListContainer: { minHeight: 300, maxHeight: 300 },
  emptyStaffContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyStaffTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 8, textAlign: 'center' },
  emptyStaffSubtitle: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center' },
  emptyStoreContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyStoreTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 8, textAlign: 'center' },
  emptyStoreSubtitle: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center' },
  listHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4, paddingHorizontal: 4 },
  headerText: { fontSize: sizes.smallText, color: colors.text.secondary, fontFamily: FONTS.jamsil.regular3 },
  scrollableStaffList: { flex: 1 },
  albaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: colors.disable },
  nameSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  albaName: { fontSize: sizes.normalText, color: colors.text.primary, fontFamily: FONTS.jamsil.regular3 },
  timeSection: { flex: 2, alignItems: 'flex-end' },
  workTime: { fontSize: sizes.smallText, color: colors.text.primary, marginBottom: 4, fontFamily: FONTS.jamsil.regular3 },
  scheduleTime: { fontSize: sizes.smallText, color: colors.text.secondary, fontFamily: FONTS.jamsil.regular3 },
});
