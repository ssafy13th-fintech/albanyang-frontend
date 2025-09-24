// app/(mainPage)/NextToEmployerMainPage.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';

// ===== 레이아웃 상수 =====
const SIDE_PADDING = 20;
const SECTION_SPACING = 12;

// ===== 타입 =====
type StaffStatus = {
  id: number;
  name: string;
  nickname: string;
  checkInTime?: string;
  checkOutTime?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  status: 'present' | 'late' | 'absent' | 'no-schedule';
  isWorking: boolean;
  hasSchedule: boolean;
  phone?: string;
  email?: string;
  wage?: number;
  joinDate?: string;
};

type Store = {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  employeeCount?: number;
  payday?: number;
  staffs: StaffStatus[];
  totalStaffs: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  noScheduleCount: number;
};

// ===== 상태/라벨 맵 =====
const STATUS = {
  present: { label: '정상 출근', color: '#4CAF50' },
  late: { label: '지각', color: colors.main },
  absent: { label: '결근', color: colors.reject },
  'no-schedule': { label: '스케줄 없음', color: colors.text.secondary },
} as const;

// ===== 목업 데이터 =====
const mockFetchStoreDetail = async (storeId: number): Promise<Store | null> => {
  if (storeId === 1) {
    return {
      id: 1,
      name: 'GS25 강남점',
      address: '서울특별시 강남구 테헤란로 123',
      phone: '02-123-4567',
      employeeCount: 3,
      payday: 25,
      staffs: [
        {
          id: 1,
          name: '김알바',
          nickname: '김김',
          checkInTime: '09:00',
          scheduledStartTime: '09:00',
          scheduledEndTime: '18:00',
          status: 'present',
          isWorking: true,
          hasSchedule: true,
          phone: '010-1234-5678',
          email: 'kim@example.com',
          wage: 12000,
          joinDate: '2024-01-15',
        },
        {
          id: 2,
          name: '이직원',
          nickname: '이이',
          checkInTime: '09:15',
          scheduledStartTime: '09:00',
          scheduledEndTime: '18:00',
          status: 'late',
          isWorking: true,
          hasSchedule: true,
          phone: '010-2345-6789',
          email: 'lee@example.com',
          wage: 13000,
          joinDate: '2024-02-01',
        },
      ],
      totalStaffs: 3,
      presentCount: 1,
      lateCount: 1,
      absentCount: 0,
      noScheduleCount: 1,
    };
  }
  return {
    id: storeId,
    name: `매장 #${storeId}`,
    address: '주소 미등록',
    phone: '전화번호 미등록',
    employeeCount: 0,
    payday: undefined,
    staffs: [],
    totalStaffs: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    noScheduleCount: 0,
  };
};

// ===== 직원 상세 모달 =====
const StaffDetailModal = ({
  visible,
  staff,
  onClose,
}: {
  visible: boolean;
  staff: StaffStatus | null;
  onClose: () => void;
}) => {
  if (!staff) return null;
  const statusMeta = STATUS[staff.status];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>직원 정보</Text>
            <Pressable onPress={onClose} style={styles.modalClose}>
              <Ionicons name="close" size={18} color={colors.text.secondary} />
            </Pressable>
          </View>

          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{staff.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.staffName}>{staff.name}</Text>
              <Text style={styles.staffSub}>닉네임: {staff.nickname}</Text>
              <View style={styles.statusRow}>
                <Text style={styles.staffSub}>{statusMeta.label}</Text>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>전화번호</Text>
            <Text style={styles.infoVal}>{staff.phone || '미등록'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>이메일</Text>
            <Text style={styles.infoVal}>{staff.email || '미등록'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>시급</Text>
            <Text style={styles.infoVal}>{staff.wage?.toLocaleString() || '미설정'}원</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>입사일</Text>
            <Text style={styles.infoVal}>{staff.joinDate || '미등록'}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ===== 메인 =====
export default function NextToEmployerMainPage() {
  const router = useRouter();
  const { storeId, storeName } = useLocalSearchParams<{ storeId?: string; storeName?: string }>();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedStaff, setSelectedStaff] = useState<StaffStatus | null>(null);
  const [staffModalVisible, setStaffModalVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const id = Number(storeId ?? 0);
        const data = await mockFetchStoreDetail(id);
        setStore(data);
      } catch (e) {
        console.error(e);
        Alert.alert('오류', '매장 정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [storeId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>로딩중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { backgroundColor: colors.disable }]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </Pressable>
        <Text style={styles.title}>{store?.name || storeName || '매장 정보'}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 사업장 정보 카드 */}
        <View style={styles.section}>
          <View style={styles.storeCard}>
            <Text style={styles.cardTitle}>사업장 정보</Text>

            <View style={styles.rowBetween}>
              <Text style={styles.dimText}>사업장 이름</Text>
              <Text style={styles.valueText}>{store?.name || '미등록'}</Text>
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.dimText}>주소</Text>
              <Text style={styles.valueText}>{store?.address || '미등록'}</Text>
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.dimText}>전화번호</Text>
              <Text style={styles.valueText}>{store?.phone || '미등록'}</Text>
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.dimText}>상시 근로자 수</Text>
              <Text style={styles.valueText}>{store?.employeeCount ?? 0}명</Text>
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.dimText}>급여 지급일</Text>
              <Text style={styles.valueText}>
                {store?.payday ? `${store.payday}일` : '미설정'}
              </Text>
            </View>
          </View>
        </View>

        {/* 직원 리스트 */}
        <View style={styles.section}>
          <View style={styles.staffCard}>
            <Text style={styles.cardTitle}>직원 목록</Text>

            {store && store.staffs.length > 0 ? (
              <FlatList
                data={store.staffs}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => {
                  const statusMeta = STATUS[item.status];
                  return (
                    <TouchableOpacity
                      style={styles.staffRow}
                      activeOpacity={0.7}
                      onPress={() => {
                        setSelectedStaff(item);
                        setStaffModalVisible(true);
                      }}
                    >
                      <View style={styles.staffLeft}>
                        <Text style={styles.staffNameText}>{item.name}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
                    </TouchableOpacity>
                  );
                }}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>직원이 없습니다</Text>
                <Text style={styles.emptyDesc}>직원을 초대해 보세요.</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* 직원 상세 모달 */}
      <StaffDetailModal
        visible={staffModalVisible}
        staff={selectedStaff}
        onClose={() => setStaffModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ===== 스타일 =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.text.reverse },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 16,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  title: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary },

  section: { marginBottom: SECTION_SPACING, paddingHorizontal: SIDE_PADDING },

  storeCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  staffCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 12,
  },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dimText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  valueText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },

  staffRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  staffLeft: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  staffNameText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  separator: { height: 1, backgroundColor: colors.disable },

  emptyBox: { paddingVertical: 32, alignItems: 'center' },
  emptyTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  emptyDesc: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: colors.text.reverse, borderRadius: 16, padding: 16, width: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  modalClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.disable, alignItems: 'center', justifyContent: 'center' },

  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.main, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },
  staffName: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  staffSub: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  infoKey: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  infoVal: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, textAlign: 'right' },
});
