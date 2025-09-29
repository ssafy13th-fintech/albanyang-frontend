// app/invite/FindAlba.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// API imports
import { getMemberByPhone } from '@/api/Member';
import { sendStaffInvitation } from '@/api/Staff';
import BackHeader from '@/components/header/BackHeader';

const SIDE_PADDING = 20;
const SECTION_SPACING = 16;
const BOTTOM_BUTTON_HEIGHT = 64;

interface Employee {
  name: string;
  phone: string;
  email: string;
  wage: number;
}

interface SearchResult {
  name: string;
  phone: string;
  email: string;
}

// 시급 입력 모달
const WageInputModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  employeeName 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onConfirm: (wage: number) => void;
  employeeName: string;
}) => {
  const [wage, setWage] = useState('');

  const handleConfirm = () => {
    const wageNumber = parseInt(wage.replace(/[^\d]/g, ''));
    if (!wageNumber || wageNumber < 0) {
      Alert.alert('알림', '올바른 시급을 입력해주세요.');
      return;
    }
    onConfirm(wageNumber);
    setWage('');
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>시급 입력</Text>
            <Text style={styles.modalSubtitle}>{employeeName} 님의 시급을 입력해주세요</Text>

            <View style={styles.wageInputContainer}>
              <TextInput
                style={styles.wageInput}
                placeholder="예: 10000"
                placeholderTextColor={colors.text.secondary}
                value={wage}
                onChangeText={(text) => setWage(text.replace(/[^\d]/g, ''))}
                keyboardType="number-pad"
                returnKeyType="done"
                autoFocus
              />
              <Text style={styles.wageUnit}>원</Text>
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}
                onPress={handleConfirm}
              >
                <Text style={styles.addButtonText}>확인</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
                onPress={() => {
                  setWage('');
                  onClose();
                }}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 최종 확인 모달
const ConfirmModal = ({ 
  visible, 
  storeName,
  onClose, 
  onConfirm, 
  selectedEmployees,
  isLoading
}: { 
  visible: boolean; 
  storeName: string;
  onClose: () => void; 
  onConfirm: () => void;
  selectedEmployees: Employee[];
  isLoading: boolean;
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { maxWidth: 360 }]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{storeName}</Text>
            <Text style={styles.modalSubtitle}>
              {selectedEmployees.length}명에게 초대 메시지를 보내시겠습니까?
            </Text>

            <View style={styles.confirmList}>
              {selectedEmployees.map((emp, index) => (
                <View key={index} style={styles.confirmItem}>
                  <View style={styles.confirmItemLeft}>
                    <Text style={styles.confirmName}>{emp.name}</Text>
                    <Text style={styles.confirmPhone}>{emp.phone}</Text>
                  </View>
                  <Text style={styles.confirmWage}>시급 {emp.wage.toLocaleString()}원</Text>
                </View>
              ))}
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.addButton, 
                  pressed && styles.addButtonPressed,
                  isLoading && styles.buttonDisabled
                ]}
                onPress={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.text.reverse} />
                ) : (
                  <Text style={styles.addButtonText}>보내기</Text>
                )}
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton, 
                  pressed && styles.cancelButtonPressed,
                  isLoading && styles.buttonDisabled
                ]}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 완료 모달
const SuccessModal = ({ visible, onClose, count }: { visible: boolean; onClose: () => void; count: number }) => {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.mascotContainer}>
              <View style={styles.mascotCircle}>
                <Image
                  source={require("@/assets/images/mascot/mascot_good_alba.png")}
                  style={styles.mascotImage}
                />
              </View>
            </View>

            <Text style={styles.modalTitle}>초대 완료!</Text>
            <Text style={styles.modalSubtitle}>
              {count}명에게 초대 메시지가 발송되었습니다
            </Text>

            <Pressable
              style={({ pressed }) => [styles.confirmButton, pressed && styles.confirmButtonPressed]}
              onPress={onClose}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function FindAlba() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const storeId = Number(params.storeId);
  const storeName = params.storeName

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [showWageModal, setShowWageModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentSearchResult, setCurrentSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSearch = async () => {
    if (searchText.length < 10) return;

    try {
      setIsSearching(true);
      const phone = searchText.replace(/-/g, '');
      const response = await getMemberByPhone(phone);
      
      if (response.data) {
        setSearchResults([{
          name: response.data.name,
          phone: response.data.phone,
          email: response.data.email || ''
        }]);
      } else {
        setSearchResults([]);
        Alert.alert('알림', '검색 결과가 없습니다.');
      }
    } catch (error) {
      
      setSearchResults([]);
      
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemoveEmployee = (index: number) => {
    setSelectedEmployees(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectEmployee = (result: SearchResult) => {
    // 이미 선택된 경우 제거
    const existingIndex = selectedEmployees.findIndex(emp => emp.email === result.email);
    if (existingIndex !== -1) {
      handleRemoveEmployee(existingIndex);
      return;
    }

    // 시급 입력 모달 표시
    setCurrentSearchResult(result);
    setShowWageModal(true);
  };

  const handleWageConfirm = (wage: number) => {
    if (currentSearchResult) {
      setSelectedEmployees(prev => [...prev, {
        ...currentSearchResult,
        wage
      }]);
      setShowWageModal(false);
      setCurrentSearchResult(null);
    }
  };

  const handleSendInvite = () => {
    if (selectedEmployees.length === 0) {
      Alert.alert('알림', '선택된 직원이 없습니다.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    try {
      setIsSending(true);

      // 각 직원에게 초대 전송
      for (const employee of selectedEmployees) {
        await sendStaffInvitation(storeId, employee.wage, employee.email);
      }

      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      
      Alert.alert('오류', '초대 메시지 전송 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setSelectedEmployees([]);
    setSearchText('');
    setSearchResults([]);
    router.back();
  };

  const isEmployeeSelected = (email: string) =>
    selectedEmployees.find(emp => emp.email === email) !== undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* 헤더 */}
        <BackHeader headerText='직원 찾기' />

        {/* 검색 카드 */}
        <View style={styles.searchSection}>
          <Text style={{fontSize: 24, fontFamily: FONTS.jamsil.regular3, paddingBottom: 20, textAlign: "center"}}>{storeName}</Text>
          <View style={styles.searchCard}>
            <Text style={styles.searchLabel}>전화번호로 직원 검색</Text>

            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.text.secondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="01012345678"
                placeholderTextColor={colors.text.secondary}
                value={searchText}
                onChangeText={setSearchText}
                keyboardType="phone-pad"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {searchText.length > 0 && (
                <Pressable style={styles.clearButton} onPress={() => {
                  setSearchText('');
                  setSearchResults([]);
                }}>
                  <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
                </Pressable>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.searchButton,
                pressed && styles.searchButtonPressed,
                (searchText.length < 10 || isSearching) && styles.searchButtonDisabled
              ]}
              onPress={handleSearch}
              disabled={searchText.length < 10 || isSearching}
            >
              {isSearching ? (
                <ActivityIndicator color={colors.text.reverse} size="small" />
              ) : (
                <Text style={styles.searchButtonText}>검색</Text>
              )}
            </Pressable>
          </View>
        </View>

        {/* 선택된 직원 칩 */}
        {selectedEmployees.length > 0 && (
          <View style={styles.chipsSection}>
            <View style={styles.selectedChipsRow}>
              {selectedEmployees.map((employee, index) => (
                <View key={index} style={styles.chip}>
                  <Text style={styles.chipText}>{employee.name}</Text>
                  <Pressable
                    onPress={() => handleRemoveEmployee(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    style={styles.chipClose}
                  >
                    <Ionicons name="close" size={14} color={colors.text.secondary} />
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 검색 결과 카드 */}
        <View style={styles.resultSection}>
          <View style={styles.resultCard}>
            {searchResults.length > 0 ? (
              <>
                <Text style={styles.resultTitle}>검색 결과</Text>
                <FlatList
                  data={searchResults}
                  keyExtractor={(item, index) => `${item.email}-${index}`}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.resultItem,
                        isEmployeeSelected(item.email) && styles.selectedResultItem
                      ]}
                      onPress={() => handleSelectEmployee(item)}
                    >
                      <View style={styles.resultLeft}>
                        <View style={[
                          styles.checkbox,
                          isEmployeeSelected(item.email) && styles.checkedBox
                        ]}>
                          {isEmployeeSelected(item.email) && (
                            <Ionicons name="checkmark" size={14} color={colors.text.reverse} />
                          )}
                        </View>
                        <View style={styles.employeeInfo}>
                          <Text style={styles.resultName}>{item.name}</Text>
                          <Text style={styles.resultPhone}>
                            {item.phone}
                          </Text>
                        </View>
                      </View>
                      {isEmployeeSelected(item.email) && (
                        <View style={styles.salaryBadge}>
                          <Text style={styles.resultSalary}>
                            시급 {selectedEmployees.find(e => e.email === item.email)?.wage.toLocaleString()}원
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  )}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  contentContainerStyle={{
                    paddingBottom: BOTTOM_BUTTON_HEIGHT + 24 + insets.bottom
                  }}
                />
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="search" size={40} color={colors.text.secondary} />
                </View>
                <Text style={styles.emptyStateTitle}>직원을 찾아보세요</Text>
                <Text style={styles.emptyStateText}>
                  전화번호를 입력하여 직원을 검색하고{'\n'}초대할 수 있습니다
                </Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* 하단 고정 버튼 */}
      <View style={[styles.bottomSection, { paddingBottom: 16 + insets.bottom }]}>
        <Pressable
          style={({ pressed }) => [
            styles.inviteButton,
            selectedEmployees.length === 0 && styles.inviteButtonDisabled,
            pressed && selectedEmployees.length > 0 && styles.inviteButtonPressed
          ]}
          onPress={handleSendInvite}
          disabled={selectedEmployees.length === 0}
        >
          <Text
            style={[
              styles.inviteButtonText,
              selectedEmployees.length === 0 && styles.inviteButtonTextDisabled
            ]}
          >
            초대 메시지 보내기 {selectedEmployees.length > 0 && `(${selectedEmployees.length})`}
          </Text>
        </Pressable>
      </View>

      {/* 모달들 */}
      <WageInputModal
        visible={showWageModal}
        onClose={() => {
          setShowWageModal(false);
          setCurrentSearchResult(null);
        }}
        onConfirm={handleWageConfirm}
        employeeName={currentSearchResult?.name || ''}
      />

      <ConfirmModal
        visible={showConfirmModal}
        storeName={storeName}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSend}
        selectedEmployees={selectedEmployees}
        isLoading={isSending}
      />

      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        count={selectedEmployees.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.text.reverse },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIDE_PADDING, paddingVertical: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  backButtonPressed: { backgroundColor: colors.disable },
  title: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary },
  searchSection: { paddingHorizontal: SIDE_PADDING, marginBottom: 8 },
  searchCard: { backgroundColor: colors.text.reverse, borderRadius: 16, padding: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  searchLabel: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, marginBottom: 20 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.disable, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, paddingVertical: 0 },
  clearButton: { padding: 2 },
  searchButton: { backgroundColor: colors.accent, borderRadius: 12, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  searchButtonPressed: { backgroundColor: colors.main },
  searchButtonDisabled: { backgroundColor: colors.disable },
  searchButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },
  chipsSection: { paddingHorizontal: SIDE_PADDING, marginTop: 4, marginBottom: 8 },
  selectedChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.disable, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  chipClose: { marginLeft: 6, padding: 2 },
  resultSection: { flex: 1, paddingHorizontal: SIDE_PADDING, marginBottom: SECTION_SPACING },
  resultCard: { flex: 1, backgroundColor: colors.text.reverse, borderRadius: 16, padding: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  resultTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 12 },
  resultItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, marginBottom: 8 },
  selectedResultItem: { backgroundColor: colors.disable },
  resultLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: colors.text.secondary, borderRadius: 5, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  checkedBox: { backgroundColor: colors.accent, borderColor: colors.accent },
  employeeInfo: { flex: 1 },
  resultName: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 2 },
  resultPhone: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  salaryBadge: { backgroundColor: colors.disable, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  resultSalary: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
  emptyState: { justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
  emptyIconContainer: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.disable, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyStateTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 6 },
  emptyStateText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center', lineHeight: sizes.smallText * 1.4 },
  bottomSection: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.text.reverse, paddingHorizontal: SIDE_PADDING, paddingTop: 10, shadowColor: colors.shadow, shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  inviteButton: { height: 52, backgroundColor: colors.accent, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
  inviteButtonPressed: { backgroundColor: colors.main },
  inviteButtonDisabled: { backgroundColor: colors.disable, shadowOpacity: 0, elevation: 0 },
  inviteButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },
  inviteButtonTextDisabled: { color: colors.text.secondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: colors.text.reverse, borderRadius: 16, margin: 20, maxWidth: 320, width: '90%', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 10 },
  modalContent: { alignItems: 'center', paddingVertical: 28, paddingHorizontal: 24 },
  mascotContainer: { marginBottom: 20 },
  mascotCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.main, justifyContent: 'center', alignItems: 'center' },
  mascotImage: { width: 54, height: 54, resizeMode: 'contain' },
  modalTitle: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary, textAlign: 'center', paddingBottom: 20},
  modalSubtitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center', paddingBottom: 20, lineHeight: sizes.normalText * 1.4 },
  wageInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.disable, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 24, width: '100%' },
  wageInput: { flex: 1, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, paddingVertical: 0 },
  wageUnit: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginLeft: 8 },
  buttonRow: { flexDirection: 'row', gap: 10 },
  confirmButton: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28 },
  confirmButtonPressed: { backgroundColor: colors.main, transform: [{ scale: 0.98 }] },
  confirmButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },
  addButton: { backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 22 },
  addButtonPressed: { backgroundColor: colors.main, transform: [{ scale: 0.98 }] },
  addButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },
  cancelButton: { backgroundColor: colors.disable, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 22 },
  cancelButtonPressed: { backgroundColor: '#E8E6E0', transform: [{ scale: 0.98 }] },
  cancelButtonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.bold5, color: colors.text.secondary },
  buttonDisabled: { opacity: 0.5 },
  confirmList: { width: '100%', maxHeight: 200, marginBottom: 20 },
  confirmItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.disable },
  confirmItemLeft: { flex: 1 },
  confirmName: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 2 },
  confirmPhone: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  confirmWage: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.bold5, color: colors.accent },
});