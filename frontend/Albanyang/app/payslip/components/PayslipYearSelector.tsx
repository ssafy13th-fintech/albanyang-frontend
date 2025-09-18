import { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors as COLORS } from '../../../constants/Colors/ColorTheme';
import { FONTS } from '../../../constants/fonts/Fonts';

interface Props {
    selectedYear: number;
    onYearChange: (year: number) => void;
}

const PayslipYearSelector = ({ selectedYear, onYearChange }: Props) => {
    const [showBottomSheet, setShowBottomSheet] = useState(false);
    const [tempSelectedYear, setTempSelectedYear] = useState(selectedYear);

    // 더미 데이터 (현재 년도 기준으로 -5년 ~ +1년)
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const handlePreviousYear = () => {
        onYearChange(selectedYear - 1);
    };

    const handleNextYear = () => {
        onYearChange(selectedYear + 1);
    };

    const handleConfirm = () => {
        onYearChange(tempSelectedYear);
        setShowBottomSheet(false);
    };

    const handleCancel = () => {
        setTempSelectedYear(selectedYear);
        setShowBottomSheet(false);
    };

    const renderYearItem = ({ item }: { item: number }) => (
        <TouchableOpacity
            style={[
                styles.yearItem,
                item === tempSelectedYear && styles.selectedYearItem
            ]}
            onPress={() => setTempSelectedYear(item)}
        >
            <Text
                style={[
                    styles.yearItemText,
                    item === tempSelectedYear && styles.selectedYearText
                ]}
            >
                {item}년
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.yearSelector}>
                {/* 이전 년도 버튼 */}
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={handlePreviousYear}
                >
                    <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>

                {/* 년도 표시 및 바텀시트 트리거 */}
                <TouchableOpacity
                    style={styles.yearDisplay}
                    onPress={() => setShowBottomSheet(true)}
                >
                    <Text style={styles.selectedYear}>{selectedYear}년</Text>
                    <Text style={styles.dropdownIcon}>▼</Text>
                </TouchableOpacity>

                {/* 다음 년도 버튼 */}
                <TouchableOpacity
                    style={styles.navButton}
                    onPress={handleNextYear}
                >
                    <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
            </View>

            {/* 바텀 시트 모달 */}
            <Modal
                visible={showBottomSheet}
                transparent
                animationType="slide"
                onRequestClose={handleCancel}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={handleCancel}
                >
                    <TouchableOpacity
                        style={styles.bottomSheet}
                        onPress={() => { }} // 바텀시트 내부 클릭 시 닫히지 않도록
                    >
                        {/* 헤더 */}
                        <View style={styles.bottomSheetHeader}>
                            <TouchableOpacity onPress={handleCancel}>
                                <Text style={styles.cancelButton}>취소</Text>
                            </TouchableOpacity>
                            <Text style={styles.bottomSheetTitle}>년도 선택</Text>
                            <TouchableOpacity onPress={handleConfirm}>
                                <Text style={styles.confirmButton}>확인</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 년도 리스트 */}
                        <View style={styles.yearListContainer}>
                            <FlatList
                                data={years}
                                keyExtractor={(item) => item.toString()}
                                renderItem={renderYearItem}
                                showsVerticalScrollIndicator={false}
                                style={styles.yearList}
                            />
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        // borderColor: 'yellow',
        // borderWidth: 1,        
    },
    yearSelector: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    navButton: {
        // paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 4,
    },
    navButtonText: {
        fontSize: 20,
        fontFamily: FONTS.jamsil.thin1,
        color: COLORS.text.secondary,
    },
    yearDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    selectedYear: {
        fontSize: 18,
        fontFamily: FONTS.jamsil.thin1,
        color: COLORS.text.primary,
        marginRight: 8,
    },
    dropdownIcon: {
        fontSize: 12,
        fontFamily: FONTS.jamsil.thin1,
        color: COLORS.text.secondary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheet: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 34, // Safe area for bottom
        minHeight: 400,
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
        fontFamily: FONTS.jamsil.thin1,
        color: COLORS.text.primary,
    },
    cancelButton: {
        fontSize: 16,
        fontFamily: FONTS.jamsil.thin1,
        color: COLORS.text.secondary,
    },
    confirmButton: {
        fontSize: 16,
        fontFamily: FONTS.jamsil.thin1,
        color: COLORS.accent,
    },
    yearListContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    yearList: {
        flex: 1,
    },
    yearItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginVertical: 4,
    },
    selectedYearItem: {
        backgroundColor: COLORS.disable,
    },
    yearItemText: {
        fontSize: 16,
        fontFamily: FONTS.jamsil.thin1,
        color: COLORS.text.primary,
        textAlign: 'center',
    },
    selectedYearText: {
        color: COLORS.accent,
        fontSize: 18,
    },
});

export default PayslipYearSelector