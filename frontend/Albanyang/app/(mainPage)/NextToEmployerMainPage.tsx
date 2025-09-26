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
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet as RNStyleSheet,
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
  name: string;          // 본명 (조회 전용)
  nickname: string;      // 수정 가능
  status: '재직' | '퇴사'; // 수정 가능 (둘 중 하나)
  isWorking: boolean;
  phone?: string;
  email?: string;
  wage?: number;         // 수정 가능
  joinDate?: string;
  weeklyDays?: number;   // 조회 전용
  dailyHours?: number;   // 조회 전용
};

type Store = {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  employeeCount?: number;
  payday?: number;
  staffs: StaffStatus[];
};

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
          status: '재직',
          isWorking: true,
          phone: '010-1234-5678',
          email: 'kim@example.com',
          wage: 12000,
          joinDate: '2024-01-15',
          weeklyDays: 5,
          dailyHours: 8,
        },
        {
          id: 2,
          name: '이직원',
          nickname: '이이',
          status: '퇴사',
          isWorking: false,
          phone: '010-2345-6789',
          email: 'lee@example.com',
          wage: 13000,
          joinDate: '2024-02-01',
          weeklyDays: 3,
          dailyHours: 6,
        },
      ],
    };
  }
  return null;
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
  const [editMode, setEditMode] = useState(false);
  const [nickname, setNickname] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState<'재직' | '퇴사'>('재직');
  const [wage, setWage] = useState('');

  useEffect(() => {
    if (staff) {
      setNickname(staff.nickname);
      setEmploymentStatus(staff.status);
      setWage(staff.wage ? String(staff.wage) : '');
      setEditMode(false); // 모달 열릴 때는 항상 조회 모드
    }
  }, [staff]);

  if (!staff) return null;

  const handleSave = () => {
    // TODO: 실제 저장 API 연동
    Alert.alert('저장됨', `닉네임: ${nickname}\n고용상태: ${employmentStatus}\n시급: ${wage}`);
    setEditMode(false);
    onClose();
  };

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

          {/* 본명 (조회 전용) */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>본명</Text>
            <Text style={styles.infoVal}>{staff.name}</Text>
          </View>

          {/* 닉네임 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>닉네임</Text>
            {editMode ? (
              <TextInput
                style={styles.inputBox}
                value={nickname}
                onChangeText={setNickname}
                placeholder="닉네임 입력"
              />
            ) : (
              <Text style={styles.infoVal}>{staff.nickname}</Text>
            )}
          </View>

          {/* 고용상태: 세그먼트 버튼 (재직/퇴사) */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>고용상태</Text>
            {editMode ? (
              <View style={styles.segmentWrap}>
                {(['재직', '퇴사'] as const).map((opt) => (
                  <Pressable
                    key={opt}
                    onPress={() => setEmploymentStatus(opt)}
                    style={[styles.segment, employmentStatus === opt && styles.segmentActive]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        employmentStatus === opt && styles.segmentTextActive,
                      ]}
                    >
                      {opt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={styles.infoVal}>{staff.status}</Text>
            )}
          </View>

          {/* 시급 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>시급</Text>
            {editMode ? (
              <TextInput
                style={styles.inputBox}
                value={wage}
                onChangeText={setWage}
                keyboardType="numeric"
                placeholder="시급 입력"
              />
            ) : (
              <Text style={styles.infoVal}>
                {staff.wage ? `${staff.wage.toLocaleString()}원` : '미설정'}
              </Text>
            )}
          </View>

          {/* 주간근무일수 (조회) */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>주간근무일수</Text>
            <Text style={styles.infoVal}>
              {staff.weeklyDays ? `${staff.weeklyDays}일` : '미등록'}
            </Text>
          </View>

          {/* 하루근무시간 (조회) */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>하루근무시간</Text>
            <Text style={styles.infoVal}>
              {staff.dailyHours ? `${staff.dailyHours}시간` : '미등록'}
            </Text>
          </View>

          {/* 버튼 */}
          {editMode ? (
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>저장</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.editBtn} onPress={() => setEditMode(true)}>
              <Text style={styles.editBtnText}>수정</Text>
            </Pressable>
          )}
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

  // 필터 & 드롭다운 상태
  const [filter, setFilter] = useState<'전체' | '재직' | '퇴사'>('전체');
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const filteredStaffs =
    filter === '전체'
      ? store?.staffs || []
      : store?.staffs.filter((s) => s.status === filter) || [];

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

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
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

        {/* 직원 리스트 카드 */}
        <View style={styles.section}>
          <View style={styles.staffCard}>
            {/* 타이틀 + 드롭다운 우측 */}
            <View style={styles.staffHeader}>
              <Text style={styles.cardTitle}>직원 목록</Text>

              <View>
                <Pressable
                  style={styles.dropdownBtn}
                  onPress={() => setDropdownOpen((p) => !p)}
                >
                  <Text style={styles.dropdownText}>{filter}</Text>
                  <Ionicons
                    name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.text.primary}
                  />
                </Pressable>

                {dropdownOpen && (
                  <>
                    {/* 뒤 터치 차단 & 바깥 클릭시 닫힘 */}
                    <Pressable
                      onPress={() => setDropdownOpen(false)}
                      style={[
                        RNStyleSheet.absoluteFillObject,
                        {
                          top: 0,
                          left: -1000,
                          right: -1000,
                          bottom: -1000,
                          zIndex: 900,
                        },
                      ]}
                    />
                    <View style={styles.dropdownMenu}>
                      {['전체', '재직', '퇴사'].map((f) => (
                        <Pressable
                          key={f}
                          style={styles.dropdownItem}
                          onPress={() => { setFilter(f as any); setDropdownOpen(false); }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              filter === f && { fontWeight: 'bold' },
                            ]}
                          >
                            {f}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
              </View>
            </View>

            {filteredStaffs.length > 0 ? (
              <FlatList
                data={filteredStaffs}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
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
                      <Text style={styles.staffSubText}>({item.status})</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>직원이 없습니다</Text>
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
    elevation: 4,
  },
  staffCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    overflow: 'visible', // 드롭다운이 카드 밖으로 나가도 보이게
  },
  staffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative', // 드롭다운 absolute 기준점
  },

  cardTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
  },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dimText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  valueText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },

  // 직원 리스트
  staffRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  staffLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 8 },
  staffNameText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  staffSubText: { fontSize: sizes.smallText, color: colors.text.secondary },
  separator: { height: 1, backgroundColor: colors.disable },

  emptyBox: { paddingVertical: 32, alignItems: 'center' },
  emptyTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },

  // 모달
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: colors.text.reverse, borderRadius: 16, padding: 16, width: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  modalClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.disable, alignItems: 'center', justifyContent: 'center' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, gap: 12 },
  infoKey: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, flex: 1 },
  infoVal: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, textAlign: 'right', flex: 2 },
  inputBox: {
    flex: 2,
    borderWidth: 1,
    borderColor: colors.disable,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    textAlign: 'right',
  },

  // 세그먼트(고용상태)
  segmentWrap: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: colors.disable,
    borderRadius: 8,
    padding: 2,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentActive: {
    backgroundColor: colors.main,
  },
  segmentText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  segmentTextActive: {
    color: colors.text.reverse,
    fontFamily: FONTS.jamsil.medium4,
  },

  // 모달 버튼
  editBtn: { marginTop: 16, backgroundColor: colors.disable, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  editBtnText: { color: colors.text.primary, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4 },
  saveBtn: { marginTop: 16, backgroundColor: colors.main, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  saveBtnText: { color: colors.text.reverse, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4 },

  // 드롭다운
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.disable,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dropdownText: {
    marginRight: 6,
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: colors.text.reverse,
    borderRadius: 12,
    paddingVertical: 4,
    // 항상 맨 위
    zIndex: 1000,      // iOS
    elevation: 20,     // Android
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 12, alignItems: 'flex-start', },
  dropdownItemText: { fontSize: sizes.smallText, color: colors.text.primary },
});
