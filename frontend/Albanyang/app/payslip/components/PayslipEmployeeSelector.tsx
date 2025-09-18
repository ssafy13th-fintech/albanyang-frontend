import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  employees?: { id: string; name: string; }[];
  selectedEmployee?: string;
  onSelect?: (employee: any) => void;
  style?: any;
}

const EmployeeDropdown = ({
  employees = [
    { id: 'all', name: '전체' },
    { id: 'kim', name: '김알바' },
    { id: 'park', name: '박알바' }
  ],
  selectedEmployee = '전체',
  onSelect,
  style
}: Props) => {
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (employee: any) => {
    if (onSelect) {
      onSelect(employee);
    }
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {/* 드롭다운 버튼 */}
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={() => setShowModal(true)}
      >
        <Text style={styles.buttonText}>{selectedEmployee}</Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* 모달 */}
      <Modal
        visible={showModal}
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            {employees.map((employee) => (
              <TouchableOpacity
                key={employee.id}
                style={styles.option}
                onPress={() => handleSelect(employee)}
              >
                <Text style={styles.optionText}>{employee.name}</Text>
                {selectedEmployee === employee.name && (
                  <Text style={styles.check}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // borderColor: 'pink',
    // borderWidth: 1,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    minWidth: 120,
  },
  buttonText: {
    fontSize: 14,
    color: 'black',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    minWidth: 160,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  optionText: {
    fontSize: 14,
    color: 'black',
  },
  check: {
    fontSize: 16,
    color: 'blue',
  },
});

export default EmployeeDropdown;