// app/(mainPage)/StoreDetailModal.tsx
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';
import { Store } from '@/api/store/getStore';
import { UpdateStore, putStore } from '@/api/store/UpdateStore';

type Props = {
  visible: boolean;
  store: Store | null;
  onClose: () => void;
  onSave?: (updatedStore: UpdateStore) => void;
};

const StoreDetailModal = ({ visible, store, onClose, onSave }: Props) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [officeNumber, setOfficeNumber] = useState('');
  const [payDay, setPayDay] = useState<number>();
  const [scale, setScale] = useState<'5인 이상' | '5인 미만'>();

  const getScaleCode = (status: '5인 이상' | '5인 미만') => 
    status === '5인 미만' ? 1 : 2;

  useEffect(() => {
    if (store) {
      setName(store.name);
      setAddress(store.address);
      setOfficeNumber(store.officeNumber);
      setPayDay(store.payDay);
      setScale(store.scale);
    }
  }, [store]);

  if (!store) return null;

  const handleClose = () => {
    // 모달 닫힐 때 상태 초기화
    setName(store.name);
    setAddress(store.address);
    setOfficeNumber(store.officeNumber);
    setPayDay(store.payDay);
    setScale(store.scale);
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert('오류', '사업장 이름을 입력하세요.');
    if (!address.trim()) return Alert.alert('오류', '주소를 입력하세요.');
    if (!officeNumber.trim()) return Alert.alert('오류', '전화번호를 입력하세요.');

    const payload: UpdateStore = {
      name: name.trim(),
      address: address.trim(),
      officeNumber: officeNumber.trim(),
      payDay: payDay!,
      scale: getScaleCode(scale!)
    };

    try {
      await putStore(store.id, payload);
      Alert.alert('저장 완료', '사업장 정보가 성공적으로 저장되었습니다.');
      onSave?.({
        ...payload,
        scale: scale!
      });
      handleClose();
    } catch (err) {
      
      Alert.alert('오류', '사업장 정보 저장에 실패했습니다.');
    }
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={handleClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>사업장 정보</Text>
            <Pressable onPress={handleClose} style={styles.modalClose}>
              <FontAwesomeIcon icon={faXmark} size={18} color={colors.text.secondary} />
            </Pressable>
          </View>

          {/* 사업장 이름 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>사업장명</Text>
            <TextInput
              style={styles.inputBox}
              value={name}
              onChangeText={setName}
              placeholder="사업장명 입력"
            />
          </View>

          {/* 주소 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>주소</Text>
            <TextInput
              style={styles.inputBox}
              value={address}
              onChangeText={setAddress}
              placeholder="주소 입력"
            />
          </View>

          {/* 전화번호 */}
          <View style={styles.infoRow}>
            <Text style={styles.infoKey}>전화번호</Text>
            <TextInput
              style={styles.inputBox}
              value={officeNumber}
              onChangeText={setOfficeNumber}
              placeholder="전화번호 입력"
              keyboardType="phone-pad" // 수정: officeNumber-pad → phone-pad
            />
          </View>
            {/* 급여 지급일 */}
            <View style={styles.infoRow}>
            <Text style={styles.infoKey}>급여 지급일</Text>
            <TextInput
                style={styles.inputBox}
                value={payDay?.toString() || ''}
                onChangeText={(text) => setPayDay(Number(text))}
                placeholder="1~31일"
                keyboardType="numeric"
            />
            </View>

            {/* 사업장 규모 */}
            <View style={styles.infoRow}>
            <Text style={styles.infoKey}>사업장 규모</Text>
            <View style={styles.segmentWrap}>
                {(['5인 미만', '5인 이상'] as const).map((s) => (
                <Pressable
                    key={s}
                    style={[
                    styles.segment,
                    scale === s && styles.segmentActive
                    ]}
                    onPress={() => setScale(s)}
                >
                    <Text style={[styles.segmentText, scale === s && styles.segmentTextActive]}>
                    {s}
                    </Text>
                </Pressable>
                ))}
            </View>
            </View>

          {/* 버튼 */}
          <Pressable style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>저장</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export default StoreDetailModal;

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: colors.text.reverse, borderRadius: 16, padding: 16, width: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  modalClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.disable, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, gap: 12 },
  infoKey: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, flex: 1 },
  inputBox: { flex: 2, borderWidth: 1, borderColor: colors.disable, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, textAlign: 'right' },
  saveBtn: { marginTop: 16, backgroundColor: colors.main, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  saveBtnText: { color: colors.text.reverse, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4 },
  segmentWrap: { flex: 2, flexDirection: 'row', backgroundColor: colors.disable, borderRadius: 8, padding: 2 },
    segment: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 6 },
    segmentActive: { backgroundColor: colors.main },
    segmentText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary },
    segmentTextActive: { color: colors.text.reverse, fontFamily: FONTS.jamsil.medium4 },

});
