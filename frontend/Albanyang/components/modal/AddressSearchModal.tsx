// app/components/AddressSearchModal.tsx
import React from 'react';
import { Modal, SafeAreaView, View, Pressable, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DaumPostcode from 'react-native-daum-postcode';
import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (zonecode: string, address: string) => void;
};

export default function AddressSearchModal({ visible, onClose, onSelectAddress }: Props) {
  const handleSelectedAddress = (data: any) => {
    const zonecode = data.zonecode;
    const addr = data.roadAddress || data.address || '';
    onSelectAddress(zonecode, addr);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.text.reverse }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: colors.text.reverse }}>
          <Pressable onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={{ fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary }}>주소 검색</Text>
          <View style={{ width: 24 }} />
        </View>

        <DaumPostcode
          onSelected={handleSelectedAddress}
          onError={(e) => {
            console.log(e);
            Alert.alert('오류', '주소 검색 중 문제가 발생했습니다.');
          }}
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    </Modal>
  );
}
