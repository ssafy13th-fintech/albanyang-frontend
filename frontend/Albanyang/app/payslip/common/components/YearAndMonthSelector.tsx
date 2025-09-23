import { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors as COLORS } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight, faChevronLeft, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface Props {
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
}

const ITEM_HEIGHT = 50;

const YearAndMonthSelector = ({ selectedYear, selectedMonth, onYearChange, onMonthChange }: Props) => {
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [step, setStep] = useState<'year' | 'month'>('year');
  const [tempSelectedYear, setTempSelectedYear] = useState(selectedYear);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      onYearChange(selectedYear - 1);
      onMonthChange(12);
    } else {
      onMonthChange(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onYearChange(selectedYear + 1);
      onMonthChange(1);
    } else {
      onMonthChange(selectedMonth + 1);
    }
  };

  const handleYearSelect = (year: number) => {
    setTempSelectedYear(year);
    setStep('month');
  };

  const handleMonthSelect = (month: number) => {
    onYearChange(tempSelectedYear);
    onMonthChange(month);
    setShowBottomSheet(false);
    setStep('year');
  };

  const handleCancel = () => {
    setTempSelectedYear(selectedYear);
    setShowBottomSheet(false);
    setStep('year');
  };

  const handleBackToYear = () => {
    setStep('year');
  };

  // 연도 리스트: 현재 기준 과거 20년
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  // 선택된 연도 중심으로 스크롤
  const initialIndex = years.indexOf(tempSelectedYear);

  return (
    <View style={styles.container}>
      <View style={styles.yearSelector}>
        <TouchableOpacity style={styles.navButton} onPress={handlePreviousMonth}>
          <FontAwesomeIcon icon={faChevronLeft} size={20} color="gray" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.yearDisplay} onPress={() => setShowBottomSheet(true)}>
          <Text style={styles.selectedYear}>{selectedYear}년</Text>
          <Text style={styles.selectedMonth}>{selectedMonth}월</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleNextMonth}>
          <FontAwesomeIcon icon={faChevronRight} size={20} color="gray" />
        </TouchableOpacity>
      </View>

      <Modal visible={showBottomSheet} transparent animationType="slide" onRequestClose={handleCancel}>
        <TouchableOpacity style={styles.modalOverlay} onPress={handleCancel}>
          <TouchableOpacity style={styles.bottomSheet} onPress={() => {}}>
            
            <View style={styles.bottomSheetHeader}>
              <TouchableOpacity
                onPress={step === 'month' ? handleBackToYear : undefined}
                style={styles.backButton}
              >
                <FontAwesomeIcon icon={faArrowLeft} size={18} color={step === 'year' ? '#fff' : COLORS.text.primary}/>
              </TouchableOpacity>

              <Text style={styles.bottomSheetTitle}>
                {step === 'year' ? '년도 선택' : `${tempSelectedYear}년`}
              </Text>

              <TouchableOpacity onPress={handleCancel}>
                <Text style={styles.cancelButton}>취소</Text>
              </TouchableOpacity>
            </View>

            {/* 연도 선택 화면 */}
            {step === 'year' ? (
              <FlatList
                data={years}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.yearItem, item === tempSelectedYear && styles.selectedYearItem]}
                    onPress={() => handleYearSelect(item)}
                  >
                    <Text style={[styles.yearItemText, item === tempSelectedYear && styles.selectedYearText]}>
                      {item}년
                    </Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: ITEM_HEIGHT * 5 }}
                contentContainerStyle={{ paddingVertical: 10 }}
                initialScrollIndex={initialIndex}
                getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
              />
            ) : (
              // 월 선택 화면 (3x4 버튼)
              <View style={styles.monthGrid}>
                {months.map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthItem,
                      month === selectedMonth && tempSelectedYear === selectedYear ? styles.selectedYearItem : null,
                    ]}
                    onPress={() => handleMonthSelect(month)}
                  >
                    <Text style={styles.yearItemText}>{month}월</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: 8, paddingTop: 20 },
  yearSelector: { flexDirection: 'row', alignItems: 'center' },
  navButton: {},
  yearDisplay: { flexDirection: 'row', alignItems: 'center' },
  selectedYear: { fontSize: 20, fontFamily: FONTS.jamsil.medium4, color: COLORS.text.primary, paddingRight: 8 },
  selectedMonth: { fontSize: 20, fontFamily: FONTS.jamsil.medium4, color: COLORS.text.primary },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34, minHeight: 300, maxHeight: 400 },
  bottomSheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },

  bottomSheetTitle: { fontSize: 18, fontFamily: FONTS.jamsil.medium4, color: COLORS.text.primary, textAlign: 'center', flex: 1 },

  cancelButton: { fontSize: 16, fontFamily: FONTS.jamsil.thin1, color: COLORS.text.secondary },

  backButton: { flexDirection: 'row', alignItems: 'center', width: 40, justifyContent: 'center' },

  yearItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  selectedYearItem: { backgroundColor: COLORS.accent, borderRadius: 8 },
  yearItemText: { fontSize: 16, fontFamily: FONTS.jamsil.thin1, color: COLORS.text.primary, textAlign: 'center' },
  selectedYearText: { color: '#fff', fontWeight: 'bold' },

  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  monthItem: { width: '30%', marginVertical: 8, paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});

export default YearAndMonthSelector;
