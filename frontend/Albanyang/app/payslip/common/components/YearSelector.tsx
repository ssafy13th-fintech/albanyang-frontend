import { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors as COLORS } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

interface Props {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const ITEM_HEIGHT = 50;

const YearSelector = ({ selectedYear, onYearChange }: Props) => {
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  // 선택된 연도 중심으로 스크롤
  const initialIndex = years.indexOf(selectedYear);

  const handleYearSelect = (year: number) => {
    onYearChange(year);
    setShowBottomSheet(false);
  };

  const handleCancel = () => {
    setShowBottomSheet(false);
  };

  const handlePreviousYear = () => {
    onYearChange(selectedYear - 1);
  };

  const handleNextYear = () => {
    onYearChange(selectedYear + 1);
  };

  return (
    <View style={styles.container}>
      {/* 좌우 버튼 + 선택된 연도 표시 */}
      <View style={styles.yearSelector}>
        <TouchableOpacity style={styles.navButton} onPress={handlePreviousYear}>
          <FontAwesomeIcon icon={faChevronLeft} size={20} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.yearDisplay} onPress={() => setShowBottomSheet(true)}>
          <Text style={styles.selectedYear}>{selectedYear}년</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleNextYear}>
          <FontAwesomeIcon icon={faChevronRight} size={20} color="gray" />
        </TouchableOpacity>
      </View>

      {/* 연도 선택 모달 */}
      <Modal
        visible={showBottomSheet}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={handleCancel}>
          <TouchableOpacity style={styles.bottomSheet} onPress={() => {}}>
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>년도 선택</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelButton}>취소</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={years}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.yearItem, item === selectedYear && styles.selectedYearItem]}
                  onPress={() => handleYearSelect(item)}
                >
                  <Text style={[styles.yearItemText, item === selectedYear && styles.selectedYearText]}>
                    {item}년
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: ITEM_HEIGHT * 5 }}
              contentContainerStyle={{ paddingVertical: 10 }}
              initialScrollIndex={initialIndex >= 0 ? initialIndex : 0}
              getItemLayout={(_, index) => ({
                length: ITEM_HEIGHT,
                offset: ITEM_HEIGHT * index,
                index,
              })}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 8, paddingTop: 20 },
  yearSelector: { flexDirection: 'row', alignItems: 'center' },
  navButton: { paddingHorizontal: 8 },
  yearDisplay: { flexDirection: 'row', alignItems: 'center' },
  selectedYear: {
    fontSize: 20,
    fontFamily: FONTS.jamsil.medium4,
    color: COLORS.text.primary,
    paddingHorizontal: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    minHeight: 300,
    maxHeight: 400,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontFamily: FONTS.jamsil.medium4,
    color: COLORS.text.primary,
    textAlign: 'center',
    flex: 1,
  },
  cancelButton: {
    fontSize: 16,
    fontFamily: FONTS.jamsil.thin1,
    color: COLORS.text.secondary,
  },
  yearItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  selectedYearItem: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
  },
  yearItemText: {
    fontSize: 16,
    fontFamily: FONTS.jamsil.thin1,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  selectedYearText: { color: '#fff', fontWeight: 'bold' },
});

export default YearSelector;
