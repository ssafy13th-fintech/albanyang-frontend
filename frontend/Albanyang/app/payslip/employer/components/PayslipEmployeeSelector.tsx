import React, { useState } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { staffs } from '../hooks/useStaffs';

interface Props {
  storeId: string;
  selectedEmployee?: string;
  onSelect?: (employee: any) => void;
  style?: any;
}

const EmployeeDropdown = ({ storeId, selectedEmployee = '전체', onSelect, style }: Props) => {
  const { employees, loading } = staffs(storeId);
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (employee: any) => {
    onSelect?.(employee);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, style]} onPress={() => setShowModal(true)}>
        <Text style={styles.buttonText}>{selectedEmployee}</Text>
        <FontAwesomeIcon icon={faCaretDown} size={16} color="gray" />
      </TouchableOpacity>

      <Modal visible={showModal} transparent onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setShowModal(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            {loading ? (
              <ActivityIndicator size="small" color="#333" />
            ) : (
              employees.map((employee) => (
                <TouchableOpacity key={employee.id} style={styles.option} onPress={() => handleSelect(employee)}>
                  <Text style={styles.optionText}>{employee.name}</Text>
                  {selectedEmployee === employee.name && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    minWidth: 100,
    minHeight: 30,
  },
  buttonText: { fontSize: 14, color: 'black' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 8, padding: 8, minWidth: 160 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  optionText: { fontSize: 14, color: 'black' },
  check: { fontSize: 16, color: 'blue' },
});

export default EmployeeDropdown;
