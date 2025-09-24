// app/(registration)/BusinessRegistration.tsx
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DaumPostcode from 'react-native-daum-postcode';

import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';

const SIDE_PADDING = 20;
const SECTION_SPACING = 16;
const BOTTOM_BUTTON_HEIGHT = 64;

export default function BusinessRegistration() {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeCount, setEmployeeCount] = useState<string>('');
  const [payday, setPayday] = useState<string>('');
  const [zipcode, setZipcode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [showPostcode, setShowPostcode] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      zipcode.trim().length > 0 &&
      address1.trim().length > 0 &&
      phone.trim().length > 0 &&
      employeeCount.trim().length > 0 &&
      payday.trim().length > 0
    );
  }, [name, zipcode, address1, phone, employeeCount, payday]);

  const handleSubmit = () => {
    if (!canSubmit) {
      Alert.alert('알림', '입력값을 확인해주세요.');
      return;
    }
    const payload = {
      name,
      phone,
      employeeCount: Number(employeeCount),
      payday: Number(payday),
      zipcode,
      address1,
      address2,
    };
    console.log('사업장 등록 요청:', payload);
    Alert.alert('등록 완료', '사업장 등록이 완료되었습니다.');
  };

  const handleSelectedAddress = (data: any) => {
    // data: https://postcode.map.daum.net/guide
    const zonecode = data.zonecode; // 우편번호
    const addr = data.roadAddress || data.address || ''; // 도로명 우선
    setZipcode(zonecode);
    setAddress1(addr);
    setShowPostcode(false);
  };

  // 간단한 숫자 유효성 (전화번호/숫자 필드)
  const normalizeDigits = (v: string) => v.replace(/[^\d]/g, '');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex1}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            onPress={() => console.log('뒤로가기')}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={styles.title}>사업장 등록</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 폼 */}
        <ScrollView
          style={styles.formScroll}
          contentContainerStyle={{ paddingBottom: BOTTOM_BUTTON_HEIGHT + 24 + insets.bottom }}
          keyboardShouldPersistTaps="handled"
        >
          {/* 카드 컨테이너 */}
          <View style={styles.card}>
            {/* 사업장명 */}
            <View style={styles.field}>
              <Text style={styles.label}>사업장 이름</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="알바냥 카페"
                  placeholderTextColor={colors.text.secondary}
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* 전화번호 */}
            <View style={styles.field}>
              <Text style={styles.label}>전화번호</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={18} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="010-1234-5678"
                  placeholderTextColor={colors.text.secondary}
                  value={phone}
                  onChangeText={(v) => setPhone(normalizeDigits(v))}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>
              {phone.length > 0 && phone.length !== 10 && phone.length !== 11 && (
                <Text style={styles.helperText}>숫자만 입력해주세요 (예: 01012345678)</Text>
              )}
            </View>

            {/* 주소 */}
            <View style={styles.field}>
              <Text style={styles.label}>주소</Text>

              {/* 우편번호 + 검색 버튼 */}
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.zipInput]}>
                  <TextInput
                    style={styles.input}
                    placeholder="우편번호"
                    placeholderTextColor={colors.text.secondary}
                    value={zipcode}
                    onChangeText={(v) => setZipcode(normalizeDigits(v))}
                    keyboardType="number-pad"
                    returnKeyType="next"
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [styles.searchBtn, pressed && styles.searchBtnPressed]}
                  onPress={() => setShowPostcode(true)}
                >
                  <Ionicons name="search-outline" size={18} color={colors.text.reverse} />
                  <Text style={styles.searchBtnText}>주소 검색</Text>
                </Pressable>
              </View>

              {/* 기본 주소 */}
              <View style={[styles.inputContainer, { marginTop: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="도로명/지번 주소"
                  placeholderTextColor={colors.text.secondary}
                  value={address1}
                  onChangeText={setAddress1}
                  returnKeyType="next"
                />
              </View>

              {/* 상세 주소 */}
              <View style={[styles.inputContainer, { marginTop: 8 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="상세 주소 (동/호수)"
                  placeholderTextColor={colors.text.secondary}
                  value={address2}
                  onChangeText={setAddress2}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* 상시 근로자 수 */}
            <View style={styles.field}>
              <Text style={styles.label}>상시 근로자 수</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={18} color={colors.text.secondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="예: 5"
                  placeholderTextColor={colors.text.secondary}
                  value={employeeCount}
                  onChangeText={(v) => setEmployeeCount(normalizeDigits(v))}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* 급여 지급일 */}
            <View style={styles.field}>
              <Text style={styles.label}>급여 지급일</Text>
              <View style={styles.paydayRow}>
                {['10', '15', '20', '25', '31'].map((d) => {
                  const selected = payday === d;
                  return (
                    <Pressable
                      key={d}
                      style={[styles.dayChip, selected && styles.dayChipSelected]}
                      onPress={() => setPayday(d)}
                    >
                      <Text style={[styles.dayChipText, selected && styles.dayChipTextSelected]}>{d}일</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 하단 고정 버튼 */}
      <View style={[styles.bottomSection, { paddingBottom: 16 + insets.bottom }]}>
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            !canSubmit && styles.submitButtonDisabled,
            pressed && canSubmit && styles.submitButtonPressed,
          ]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>등록하기</Text>
        </Pressable>
      </View>

      {/* 주소 검색 모달 */}
      <Modal visible={showPostcode} animationType="slide" onRequestClose={() => setShowPostcode(false)}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.text.reverse }}>
          <View style={styles.postcodeHeader}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
              onPress={() => setShowPostcode(false)}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
            <Text style={styles.postcodeTitle}>주소 검색</Text>
            <View style={{ width: 40 }} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.text.reverse },
  flex1: { flex: 1 },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 16,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  backButtonPressed: { backgroundColor: colors.disable },
  title: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary },

  // 폼
  formScroll: { flex: 1 },
  card: {
    backgroundColor: colors.text.reverse,
    marginHorizontal: SIDE_PADDING,
    marginTop: 8,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },

  field: { marginBottom: SECTION_SPACING },
  label: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 8 },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.disable,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  helperText: {
    marginTop: 6,
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  // 주소 - 우편번호 + 검색 버튼
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  zipInput: { flex: 1 },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchBtnPressed: { backgroundColor: colors.main },
  searchBtnText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },

  // 급여 지급일
  paydayRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayChip: {
    borderRadius: 999,
    backgroundColor: colors.disable,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  dayChipSelected: { backgroundColor: colors.accent },
  dayChipText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary },
  dayChipTextSelected: { color: colors.text.reverse, fontFamily: FONTS.jamsil.bold5 },

  // 하단 버튼
  bottomSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.text.reverse,
    paddingHorizontal: SIDE_PADDING,
    paddingTop: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButton: {
    height: 52,
    backgroundColor: colors.accent,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  submitButtonPressed: { backgroundColor: colors.main },
  submitButtonDisabled: { backgroundColor: colors.disable, shadowOpacity: 0, elevation: 0 },
  submitText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },
  submitTextDisabled: { color: colors.text.secondary },

  // 주소 검색 모달
  postcodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 12,
    backgroundColor: colors.text.reverse,
  },
  postcodeTitle: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary },
});
