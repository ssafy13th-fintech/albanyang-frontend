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
  Image
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

// 메인 페이지와 통일된 레이아웃 상수
const SIDE_PADDING = 20;
const SECTION_SPACING = 24;

interface Employee {
  id: string;
  name: string;
  phone: string;
  salary: string;
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedEmployees: Employee[];
  type: 'invite' | 'add';
  newEmployeeName?: string;
}

const ActionModal = ({ visible, onClose, onConfirm, selectedEmployees, type, newEmployeeName }: ModalProps) => {
  if (type === 'invite') {
    return (
      <Modal
        transparent={true}
        visible={visible}
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* 마스코트 */}
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
                {selectedEmployees.length === 1 
                  ? `${selectedEmployees[0].name} 님에게 초대 메시지가 발송되었습니다`
                  : `${selectedEmployees.length}명에게 초대 메시지가 발송되었습니다`
                }
              </Text>
              
              <Pressable
                style={({ pressed }) => [
                  styles.confirmButton,
                  pressed && styles.confirmButtonPressed
                ]}
                onPress={onConfirm}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>직원 추가</Text>
            <Text style={styles.modalSubtitle}>
              {newEmployeeName} 님을 초대 목록에 추가하시겠습니까?
            </Text>
            
            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed
                ]}
                onPress={onConfirm}
              >
                <Text style={styles.addButtonText}>추가</Text>
              </Pressable>
              
              <Pressable
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.cancelButtonPressed
                ]}
                onPress={onClose}
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

export default function EmployeeSearch() {
  const [searchText, setSearchText] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'invite' | 'add'>('invite');
  const [newEmployeeName, setNewEmployeeName] = useState('');

  // 더미 데이터
  const searchResults: Employee[] = searchText.length > 0 ? [
    { id: '1', name: '김민수', phone: '010-1234-5678', salary: '10,000원' },
    { id: '2', name: '이영희', phone: '010-2345-6789', salary: '11,000원' }
  ] : [];

  const handleBack = () => {
    console.log('뒤로가기');
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const handleSelectEmployee = (employee: Employee) => {
    if (selectedEmployees.find(emp => emp.id === employee.id)) {
      handleRemoveEmployee(employee.id);
    } else {
      setSelectedEmployees(prev => [...prev, employee]);
    }
  };

  const handleAddNewEmployee = (name: string) => {
    const phoneRegex = /^010-?\d{4}-?\d{4}$/;
    if (!phoneRegex.test(name.replace(/-/g, ''))) {
      Alert.alert('알림', '올바른 전화번호 형식을 입력해주세요.\n예: 010-1234-5678');
      return;
    }

    setNewEmployeeName(name);
    setModalType('add');
    setShowModal(true);
  };

  const handleSendInvite = () => {
    if (selectedEmployees.length === 0) {
      Alert.alert('알림', '선택된 직원이 없습니다.');
      return;
    }
    setModalType('invite');
    setShowModal(true);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    if (modalType === 'add') {
      const newEmployee: Employee = {
        id: `new_${Date.now()}`,
        name: newEmployeeName,
        phone: newEmployeeName,
        salary: '미정'
      };
      setSelectedEmployees(prev => [...prev, newEmployee]);
      setSearchText('');
      setNewEmployeeName('');
    } else {
      setSelectedEmployees([]);
      setSearchText('');
      console.log('초대 완료', selectedEmployees);
    }
  };

  const isEmployeeSelected = (employeeId: string) => {
    return selectedEmployees.find(emp => emp.id === employeeId) !== undefined;
  };

  const formatPhoneNumber = (phone: string) => {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed
            ]}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.title}>직원 찾기</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 검색 카드 */}
        <View style={styles.searchSection}>
          <View style={styles.searchCard}>
            <Text style={styles.searchLabel}>전화번호로 직원 검색</Text>
            <View style={styles.searchInputContainer}>
              <Ionicons 
                name="search-outline" 
                size={20} 
                color={colors.text.secondary} 
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="010-1234-5678"
                placeholderTextColor={colors.text.secondary}
                value={searchText}
                onChangeText={setSearchText}
                keyboardType="phone-pad"
                returnKeyType="search"
              />
              {searchText.length > 0 && (
                <Pressable
                  style={styles.clearButton}
                  onPress={() => setSearchText('')}
                >
                  <Ionicons name="close-circle" size={20} color={colors.text.secondary} />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* 선택된 직원들 카드 */}
        {selectedEmployees.length > 0 && (
          <View style={styles.selectedSection}>
            <View style={styles.selectedCard}>
              <View style={styles.selectedHeader}>
                <Text style={styles.selectedTitle}>
                  선택된 직원
                </Text>
                <Text style={styles.selectedCount}>
                  {selectedEmployees.length}명
                </Text>
              </View>
              <View style={styles.tagContainer}>
                {selectedEmployees.map((employee) => (
                  <View key={employee.id} style={styles.employeeTag}>
                    <Text style={styles.employeeTagText}>
                      {employee.name}
                    </Text>
                    <Pressable
                      style={styles.removeButton}
                      onPress={() => handleRemoveEmployee(employee.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="close" size={16} color={colors.text.secondary} />
                    </Pressable>
                  </View>
                ))}
              </View>
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
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[
                        styles.resultItem,
                        isEmployeeSelected(item.id) && styles.selectedResultItem
                      ]}
                      onPress={() => handleSelectEmployee(item)}
                    >
                      <View style={styles.resultLeft}>
                        <View style={[
                          styles.checkbox,
                          isEmployeeSelected(item.id) && styles.checkedBox
                        ]}>
                          {isEmployeeSelected(item.id) && (
                            <Ionicons name="checkmark" size={16} color={colors.text.reverse} />
                          )}
                        </View>
                        <View style={styles.employeeInfo}>
                          <Text style={styles.resultName}>{item.name}</Text>
                          <Text style={styles.resultPhone}>
                            {formatPhoneNumber(item.phone)}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.salaryBadge}>
                        <Text style={styles.resultSalary}>시급 {item.salary}</Text>
                      </View>
                    </Pressable>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </>
            ) : searchText.length > 0 ? (
              <>
                <Text style={styles.resultTitle}>새 직원 추가</Text>
                <Pressable
                  style={styles.addNewEmployee}
                  onPress={() => handleAddNewEmployee(searchText)}
                >
                  <View style={styles.addNewLeft}>
                    <View style={styles.addIconContainer}>
                      <Ionicons name="person-add-outline" size={24} color={colors.accent} />
                    </View>
                    <View style={styles.addNewInfo}>
                      <Text style={styles.addNewText}>{searchText}</Text>
                      <Text style={styles.addNewSubText}>초대 목록에 추가하기</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
                </Pressable>
              </>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="search" size={48} color={colors.text.secondary} />
                </View>
                <Text style={styles.emptyStateTitle}>직원을 찾아보세요</Text>
                <Text style={styles.emptyStateText}>
                  전화번호를 입력하여 직원을 검색하거나{'\n'}새로운 직원을 초대할 수 있습니다
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 하단 고정 버튼 */}
        <View style={styles.bottomSection}>
          <Pressable
            style={({ pressed }) => [
              styles.inviteButton,
              selectedEmployees.length === 0 && styles.inviteButtonDisabled,
              pressed && selectedEmployees.length > 0 && styles.inviteButtonPressed
            ]}
            onPress={handleSendInvite}
            disabled={selectedEmployees.length === 0}
          >
            <Text style={[
              styles.inviteButtonText,
              selectedEmployees.length === 0 && styles.inviteButtonTextDisabled
            ]}>
              초대 메시지 보내기 {selectedEmployees.length > 0 && `(${selectedEmployees.length})`}
            </Text>
          </Pressable>
        </View>

        {/* 모달 */}
        <ActionModal
          visible={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleModalConfirm}
          selectedEmployees={selectedEmployees}
          type={modalType}
          newEmployeeName={newEmployeeName}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text.reverse,
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  backButtonPressed: {
    backgroundColor: colors.disable,
  },
  title: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
  },

  // 검색 섹션
  searchSection: {
    paddingHorizontal: SIDE_PADDING,
    marginBottom: SECTION_SPACING,
  },
  searchCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  searchLabel: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.disable,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  clearButton: {
    padding: 4,
  },

  // 선택된 직원 섹션
  selectedSection: {
    paddingHorizontal: SIDE_PADDING,
    marginBottom: SECTION_SPACING,
  },
  selectedCard: {
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
  },
  selectedCount: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.accent,
    backgroundColor: colors.disable,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  employeeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.disable,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  employeeTagText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  removeButton: {
    padding: 2,
  },

  // 검색 결과 섹션
  resultSection: {
    flex: 1,
    paddingHorizontal: SIDE_PADDING,
    marginBottom: SECTION_SPACING,
  },
  resultCard: {
    flex: 1,
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  resultTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 16,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  selectedResultItem: {
    backgroundColor: colors.disable,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.text.secondary,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  employeeInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 4,
  },
  resultPhone: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },
  salaryBadge: {
    backgroundColor: colors.disable,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultSalary: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },

  // 새 직원 추가
  addNewEmployee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.disable,
  },
  addNewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.text.reverse,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addNewInfo: {
    flex: 1,
  },
  addNewText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 2,
  },
  addNewSubText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  // 빈 상태
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.disable,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: sizes.smallText * 1.5,
  },

  // 하단 버튼
  bottomSection: {
    // paddingHorizontal: SIDE_PADDING,
    // paddingVertical: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.text.reverse,
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 20,
    // 그림자 추가로 시각적 분리
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  inviteButton: {
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  inviteButtonPressed: {
    backgroundColor: colors.main,
    transform: [{ scale: 0.98 }],
  },
  inviteButtonDisabled: {
    backgroundColor: colors.disable,
    shadowOpacity: 0,
    elevation: 0,
  },
  inviteButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
  inviteButtonTextDisabled: {
    color: colors.text.secondary,
  },

  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.text.reverse,
    borderRadius: 20,
    margin: 20,
    maxWidth: 320,
    width: '90%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  modalContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  mascotContainer: {
    marginBottom: 24,
  },
  mascotCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  modalTitle: {
    fontSize: sizes.smallTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: sizes.normalText * 1.4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  confirmButtonPressed: {
    backgroundColor: colors.main,
    transform: [{ scale: 0.98 }],
  },
  confirmButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
  addButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  addButtonPressed: {
    backgroundColor: colors.main,
    transform: [{ scale: 0.98 }],
  },
  addButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
  cancelButton: {
    backgroundColor: colors.disable,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  cancelButtonPressed: {
    backgroundColor: '#E8E6E0',
    transform: [{ scale: 0.98 }],
  },
  cancelButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.secondary,
  },
});