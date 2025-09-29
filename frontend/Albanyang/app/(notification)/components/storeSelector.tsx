import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getOwnerStores } from '@/api/store/getOwnerStores';
import { getStaffStores } from '@/api/store/getStaffStores';
import { getRoleFromToken } from '@/api/authorization/AuthTokenStorage';

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';

interface Props {
  selectedItem: string;
  onSelect?: (item: any) => void;
  style?: any;
  containerStyle?: any;
}

const RoleBasedDropdown = ({ selectedItem, onSelect, style, containerStyle }: Props) => {
  const [showModal, setShowModal] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // ✅ 처음엔 로딩

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const role = await getRoleFromToken();

        if (selectedItem === "매장을 선택해주세요") {
          const storeList = await getOwnerStores();
          setData(storeList);
        } else if (selectedItem === "전체") {
          if (role === "EMPLOYER") {
            const storeList = await getOwnerStores();
            setData([{ id: "all", name: "전체" }, ...storeList]);
          } else if (role === "EMPLOYEE") {
            const storeList = await getStaffStores();
            setData([{ id: "all", name: "전체" }, ...storeList]);
          }
        }
      } catch (err) {
        
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // ✅ 마운트될 때 한 번 실행

  const handleSelect = (item: any) => {
    onSelect?.(item);
    setShowModal(false);
  };

  return (
    <View style={containerStyle}>
      <TouchableOpacity style={[styles.button, style]} onPress={() => setShowModal(true)}>
        <Text style={styles.buttonText}>{selectedItem}</Text>
        <FontAwesomeIcon icon={faCaretDown} size={16} color="gray" />
      </TouchableOpacity>

      <Modal visible={showModal} transparent onRequestClose={() => setShowModal(false)}>
        <TouchableOpacity style={styles.overlay} onPress={() => setShowModal(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            {loading ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <ActivityIndicator size="small" color={colors.main} />
              </View>
            ) : (
              data.map((item) => (
                <TouchableOpacity key={item.id} style={styles.option} onPress={() => handleSelect(item)}>
                  <Text style={styles.optionText}>{item.name}</Text>
                  {selectedItem === item.name && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              ))
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};


export default RoleBasedDropdown;

const styles = StyleSheet.create({
  button: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, minWidth: 100, minHeight: 30 },
  buttonText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.thin1, color: colors.text.secondary },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', borderRadius: 8, padding: 8, minWidth: 160 },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  optionText: { fontSize: 14, color: 'black' },
  check: { fontSize: 16, color: 'blue' },
});