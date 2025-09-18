// app/employee/EmployeeSearch.tsx
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
  Alert
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

const SIDE_PADDING = 16;

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
              {/* 마스코트 아이콘 */}
              <View style={styles.mascotContainer}>
                <View style={styles.mascotCircle}>
                  <Text style={styles.mascotIcon}>🐱</Text>
                </View>
              </View>
              
              <Text style={styles.modalText1}>
                {selectedEmployees.map(emp => emp.name).join(', ')} 님에게
              </Text>
              <Text style={styles.modalText2}>초대 메시지가 발송되었습니다!</Text>
              
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

  // Add employee modal
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
            <Text style={styles.modalText1}>
              {newEmployeeName} 님에게
            </Text>
            <Text style={styles.modalText2}>초대를 보내시겠습니까?</Text>
            
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

  // 더미 데이터 - 실제로는 API 호출
  const searchResults: Employee[] = searchText.length > 0 ? [
    { id: '1', name: '알바생 1', phone: '010-1234-5678', salary: '10,000원' }
  ] : [];

  const handleBack = () => {
    console.log('뒤로가기');
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  const handleSelectEmployee = (employee: Employee) => {
    if (selectedEmployees.find(emp => emp.id === employee.id)) {
      // 이미 선택된 직원이면 제거
      handleRemoveEmployee(employee.id);
    } else {
      // 새로운 직원 선택
      setSelectedEmployees(prev => [...prev, employee]);
    }
  };

  const handleAddNewEmployee = (name: string) => {
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
      // 새 직원 추가 로직
      console.log('새 직원 추가:', newEmployeeName);
    } else {
      // 초대 완료 로직
      console.log('초대 완료');
    }
  };

  const isEmployeeSelected = (employeeId: string) => {
    return selectedEmployees.find(emp => emp.id === employeeId) !== undefined;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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

      {/* 선택된 직원들 태그 */}
      {selectedEmployees.length > 0 && (
        <View style={styles.selectedSection}>
          {selectedEmployees.map((employee) => (
            <View key={employee.id} style={styles.employeeTag}>
              <Text style={styles.employeeTagText}>{employee.name}</Text>
              <Pressable
                style={styles.removeButton}
                onPress={() => handleRemoveEmployee(employee.id)}
              >
                <Ionicons name="close" size={16} color={colors.text.secondary} />
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* 검색 입력 */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons 
            name="search-outline" 
            size={20} 
            color={colors.text.secondary} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="전화번호를 입력해주세요"
            placeholderTextColor={colors.text.secondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* 검색 결과 리스트 */}
      <View style={styles.resultContainer}>
        {searchResults.length > 0 && (
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
                  <Text style={styles.resultName}>{item.name}</Text>
                </View>
                <Text style={styles.resultSalary}>시급 {item.salary}</Text>
              </Pressable>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* 검색어가 있지만 결과가 없을 때 새 직원 추가 옵션 */}
        {searchText.length > 0 && searchResults.length === 0 && (
          <Pressable
            style={styles.addNewEmployee}
            onPress={() => handleAddNewEmployee(searchText)}
          >
            <View style={styles.addNewLeft}>
              <View style={styles.addIcon}>
                <Ionicons name="person-add-outline" size={20} color={colors.accent} />
              </View>
              <Text style={styles.addNewText}>{searchText} 님을</Text>
            </View>
            <Text style={styles.addNewSubText}>추가하시겠습니까?</Text>
          </Pressable>
        )}
      </View>

      {/* 빈 공간 */}
      <View style={styles.emptySpace} />

      {/* 초대 메시지 보내기 버튼 */}
      <View style={styles.bottomSection}>
        <Pressable
          style={({ pressed }) => [
            styles.inviteButton,
            pressed && styles.inviteButtonPressed
          ]}
          onPress={handleSendInvite}
        >
          <Text style={styles.inviteButtonText}>초대 메시지 보내기</Text>
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  backButtonPressed: {
    backgroundColor: colors.disable,
  },
  title: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
  },

  // 선택된 직원 태그들
  selectedSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 20,
    gap: 8,
  },
  employeeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.disable,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  employeeTagText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  removeButton: {
    padding: 2,
  },

  // 검색 영역
  searchContainer: {
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.disable,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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

  // 검색 결과
  resultContainer: {
    flex: 1,
    paddingHorizontal: SIDE_PADDING,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
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
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.disable,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  resultName: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  resultSalary: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  // 새 직원 추가
  addNewEmployee: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.disable,
    marginTop: 8,
  },
  addNewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addIcon: {
    marginRight: 12,
  },
  addNewText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
  },
  addNewSubText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  // 빈 공간
  emptySpace: {
    minHeight: 20,
  },

  // 하단 버튼 영역
  bottomSection: {
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 20,
  },
  inviteButton: {
    backgroundColor: colors.subAccent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  inviteButtonPressed: {
    backgroundColor: '#0995A3',
    transform: [{ scale: 0.98 }],
  },
  inviteButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.text.reverse,
    borderRadius: 16,
    padding: 0,
    margin: 20,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalContent: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  mascotContainer: {
    marginBottom: 20,
  },
  mascotCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mascotIcon: {
    fontSize: 40,
  },
  modalText1: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalText2: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
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
    borderRadius: 12,
    paddingVertical: 12,
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
    borderRadius: 12,
    paddingVertical: 12,
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