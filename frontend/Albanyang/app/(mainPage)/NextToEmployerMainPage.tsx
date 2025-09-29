// app/(mainPage)/NextToEmployerMainPage.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View, StyleSheet as RNStyleSheet, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';

import StaffDetailModal from '../(staff)/StaffDetailModal';
import BackHeader from '@/components/header/BackHeader';
import StoreDetailModal from '../(store)/StoreDetailModal';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronUp, faChevronDown, faPencilSquare } from '@fortawesome/free-solid-svg-icons';

import { getStore, Store } from '@/api/store/getStore';
import { getStaffs } from '@/api/staff/getStaffs';
import { getStaff, StaffDetail } from '@/api/staff/getStaff';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';

// ===== 레이아웃 상수 =====
const SIDE_PADDING = 20;
const SECTION_SPACING = 20;

// ===== 메인 =====
export default function NextToEmployerMainPage() {
  const { storeId, storeName } = useLocalSearchParams<{ storeId?: string; storeName?: string }>();

  const [store, setStore] = useState<Store | null>(null);
  const [staffs, setStaffs] = useState<StaffDetail[]>();
  const [loading, setLoading] = useState(true);

  const [selectedStaff, setSelectedStaff] = useState<StaffDetail | null>(null);
  const [staffModalVisible, setStaffModalVisible] = useState(false);
  const [storeModalVisible, setStoreModalVisible] = useState(false);

  // 필터 & 드롭다운 상태
  const [filter, setFilter] = useState<'전체' | '예정' | '재직' | '퇴사'>('전체');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const store = await getStore(Number(storeId));
        setStore(store);

        const staffs = await getStaffs(storeId!);

        const detailedStaffs: StaffDetail[] = await Promise.all(
          staffs.map(async (staff) => {
            const detail = await getStaff(Number(storeId), staff.id);
            return { ...staff, ...detail };
          })
        );
        setStaffs(detailedStaffs);

      } catch (e) {
        
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

  const filteredStaffs = filter === '전체' ? staffs : staffs!.filter((s) => s.status === filter);
  console.log(staffs);
  console.log(filteredStaffs);


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader headerText={store?.name || storeName || '매장 정보'}/>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 사업장 정보 카드 */}
        <View style={styles.section}>
          <View style={styles.storeCard}>
            <View style={{flexDirection: "row", paddingBottom: 10, alignItems: "center" }}>
              <Text style={styles.cardTitle}>사업장 정보</Text>
              <Pressable onPress={() => {
                setStoreModalVisible(true);
                console.log("클릭");
                console.log(store);
              }
               } >
                <FontAwesomeIcon icon={faPenToSquare} size={14} color={colors.text.secondary} />
              </Pressable>
            </View>

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
              <Text style={styles.valueText}>{store?.officeNumber || '미등록'}</Text>
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.dimText}>급여 지급일</Text>
              <Text style={styles.valueText}>
                {store?.payDay ? `${store.payDay}일` : '미등록'}
              </Text>
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.dimText}>사업장 규모</Text>
              <Text style={styles.valueText}>
                {store?.scale ? store.scale : '미등록'}
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
                  <FontAwesomeIcon
                    icon={dropdownOpen ? faChevronUp : faChevronDown}
                    size={10}
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
                      {['전체', '재직', '예정', '퇴사'].map((f) => (
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

            {filteredStaffs!.length > 0 ? (
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
      {store && staffModalVisible && selectedStaff && storeId &&  (
        <StaffDetailModal
          visible={staffModalVisible}
          storeId={storeId}
          staff={selectedStaff}
          onClose={() => setStaffModalVisible(false)}
          onSave={(updatedStaff) => {
            setStaffs(prev => prev?.map(s => (s.id === updatedStaff.id ? updatedStaff : s)));
            setSelectedStaff(null);
          }}
        />
      )}

      {/*사업장 상세 모달*/}
      {storeModalVisible && (
        <StoreDetailModal
          visible={storeModalVisible}
          store={store}
          onClose={() => setStoreModalVisible(false)}
          onSave={(updatedStore) => { setStore(updatedStore); }}
        />
      )}


    </SafeAreaView>
  );
}

// ===== 스타일 =====
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.text.reverse },
  section: { marginBottom: SECTION_SPACING, paddingHorizontal: SIDE_PADDING },
  storeCard: { backgroundColor: colors.text.reverse, borderRadius: 16, padding: 16, elevation: 4 },
  staffCard: { backgroundColor: colors.text.reverse, borderRadius: 16, padding: 16, elevation: 4, overflow: 'visible' },
  staffHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', position: 'relative' },
  cardTitle: { fontSize: sizes.bigText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, paddingRight: 5 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dimText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  valueText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  staffRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  staffLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', columnGap: 8 },
  staffNameText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  staffSubText: { fontSize: sizes.smallText, color: colors.text.secondary },
  separator: { height: 1, backgroundColor: colors.disable },
  emptyBox: { paddingVertical: 32, alignItems: 'center' },
  emptyTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: colors.text.reverse, borderRadius: 16, padding: 16, width: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  modalClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.disable, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, gap: 12 },
  infoKey: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, flex: 1 },
  infoVal: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, textAlign: 'right', flex: 2 },
  inputBox: { flex: 2, borderWidth: 1, borderColor: colors.disable, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, textAlign: 'right' },
  segmentWrap: { flex: 2, flexDirection: 'row', backgroundColor: colors.disable, borderRadius: 8, padding: 2 },
  segment: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 6 },
  segmentActive: { backgroundColor: colors.main },
  segmentText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  segmentTextActive: { color: colors.text.reverse, fontFamily: FONTS.jamsil.medium4 },
  editBtn: { marginTop: 16, backgroundColor: colors.disable, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  editBtnText: { color: colors.text.primary, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4 },
  saveBtn: { marginTop: 16, backgroundColor: colors.main, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  saveBtnText: { color: colors.text.reverse, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4 },
  dropdownBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.disable, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  dropdownText: { marginRight: 6, fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  dropdownMenu: { position: 'absolute', top: 36, right: 0, backgroundColor: colors.text.reverse, borderRadius: 12, paddingVertical: 4, zIndex: 1000, elevation: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  dropdownItem: { paddingVertical: 8, paddingHorizontal: 12, alignItems: 'flex-start' },
  dropdownItemText: { fontSize: sizes.smallText, color: colors.text.primary }
});
