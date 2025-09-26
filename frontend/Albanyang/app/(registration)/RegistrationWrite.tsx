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
import { useRouter } from 'expo-router';

import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';

// API import
import { createStore } from '@/api/Stores';

const SIDE_PADDING = 20;
const SECTION_SPACING = 16;
const BOTTOM_BUTTON_HEIGHT = 64;

export default function BusinessRegistration() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeCount, setEmployeeCount] = useState<string>('');
  const [payday, setPayday] = useState<string>('');
  const [showPaydayDropdown, setShowPaydayDropdown] = useState(false);
  const [selectedPayday, setSelectedPayday] = useState<string>('');
  const [zipcode, setZipcode] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [showPostcode, setShowPostcode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      zipcode.trim().length > 0 &&
      address1.trim().length > 0 &&
      phone.trim().length > 0 &&
      employeeCount.trim().length > 0 &&
      payday.trim().length > 0 &&
      !isSubmitting
    );
  }, [name, zipcode, address1, phone, employeeCount, payday, isSubmitting]);

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('알림', '입력값을 확인해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 전체 주소 조합
      const fullAddress = address2 
        ? `${address1} ${address2}` 
        : address1;

      const payload = {
        name: name.trim(),
        address: fullAddress,
        officeNumber: phone.trim(),      // phone → officeNumber
        payDay: Number(payday),          // payday → payDay (대문자 D)
        scale: Number(employeeCount),    // employeeCount → scale
      };

      console.log('사업장 등록 요청:', payload);

      const response = await createStore(payload);
      
      console.log('사업장 등록 성공:', response);
      
      Alert.alert(
        '등록 완료', 
        '사업장 등록이 완료되었습니다.',
        [
          {
            text: '확인',
            onPress: () => {
              // 메인 페이지로 이동
              router.replace('/(mainPage)/EmployerMainPage');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('사업장 등록 실패:', error);
      Alert.alert(
        '등록 실패', 
        error instanceof Error ? error.message : '사업장 등록 중 오류가 발생했습니다.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectedAddress = (data: any) => {
    const zonecode = data.zonecode;
    const addr = data.roadAddress || data.address || '';
    setZipcode(zonecode);
    setAddress1(addr);
    setShowPostcode(false);
  };

  const normalizeDigits = (v: string) => v.replace(/[^\d]/g, '');

  const handleBack = () => {
    router.back();
  };

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
            onPress={handleBack}
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
                  editable={!isSubmitting}
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
                  editable={!isSubmitting}
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
                    editable={!isSubmitting}
                  />
                </View>
                <Pressable
                  style={({ pressed }) => [
                    styles.searchBtn, 
                    pressed && styles.searchBtnPressed,
                    isSubmitting && styles.searchBtnDisabled
                  ]}
                  onPress={() => setShowPostcode(true)}
                  disabled={isSubmitting}
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
                  editable={!isSubmitting}
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
                  editable={!isSubmitting}
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
                  editable={!isSubmitting}
                />
              </View>
            </View>

            {/* 급여 지급일 */}
            <View style={styles.field}>
              <Text style={styles.label}>급여 지급일</Text>
              <Pressable 
                style={styles.inputContainer}
                onPress={() => setShowPaydayDropdown(true)}
                disabled={isSubmitting}
              >
                <Text style={[styles.input, !payday && styles.placeholderText]}>
                  {payday ? `${payday}일` : '급여 지급일 선택'}
                </Text>
              </Pressable>
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
          <Text style={[styles.submitText, !canSubmit && styles.submitTextDisabled]}>
            {isSubmitting ? '등록 중...' : '등록하기'}
          </Text>
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

      {/* 급여 지급일 모달 */}
      <Modal visible={showPaydayDropdown} animationType="slide" onRequestClose={() => setShowPaydayDropdown(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.paydayModalHeader}>
            <Pressable
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
              onPress={() => {
                setShowPaydayDropdown(false);
                setSelectedPayday('');
              }}
            >
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </Pressable>
            <Text style={styles.paydayModalTitle}>급여 지급일 선택</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <View style={styles.paydayModalContent}>
            <Text style={styles.paydayModalSubtitle}>매월 급여를 지급할 날짜를 선택해주세요</Text>
            
            <View style={styles.pickerContainer}>
              <ScrollView 
                style={styles.pickerScroll}
                showsVerticalScrollIndicator={false}
                snapToInterval={50}
                decelerationRate="fast"
                contentContainerStyle={styles.pickerScrollContent}
              >
                <View style={styles.pickerPadding} />
                
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  const dayStr = day.toString();
                  const isSelected = selectedPayday === dayStr;
                  const isConfirmed = payday === dayStr;
                  
                  return (
                    <Pressable
                      key={day}
                      style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                      onPress={() => {
                        if (selectedPayday === dayStr) {
                          setPayday(dayStr);
                          setShowPaydayDropdown(false);
                          setSelectedPayday('');
                        } else {
                          setSelectedPayday(dayStr);
                        }
                      }}
                    >
                      <Text style={[
                        styles.pickerItemText,
                        (isSelected || isConfirmed) && styles.pickerItemTextSelected
                      ]}>
                        {day}일
                      </Text>
                    </Pressable>
                  );
                })}
                
                <View style={styles.pickerPadding} />
              </ScrollView>
              
              <View style={styles.pickerOverlay}>
                <View style={styles.pickerIndicator} />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.text.reverse },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIDE_PADDING, paddingVertical: 16 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  backButtonPressed: { backgroundColor: colors.disable },
  title: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary },
  formScroll: { flex: 1 },
  card: { backgroundColor: colors.text.reverse, marginHorizontal: SIDE_PADDING, marginTop: 8, borderRadius: 16, padding: 16, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
  field: { marginBottom: SECTION_SPACING },
  label: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary, marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.disable },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, paddingVertical: 0 },
  placeholderText: { color: colors.text.secondary },
  helperText: { marginTop: 6, fontSize: sizes.smallText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  zipInput: { flex: 1 },
  searchBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchBtnPressed: { backgroundColor: colors.main },
  searchBtnDisabled: { opacity: 0.5 },
  searchBtnText: { fontSize: sizes.smallText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },
  bottomSection: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.text.reverse, paddingHorizontal: SIDE_PADDING, paddingTop: 10, shadowColor: colors.shadow, shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3 },
  submitButton: { height: 52, backgroundColor: colors.accent, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: colors.shadow, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 6 },
  submitButtonPressed: { backgroundColor: colors.main },
  submitButtonDisabled: { backgroundColor: colors.disable, shadowOpacity: 0, elevation: 0 },
  submitText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.bold5, color: colors.text.reverse },
  submitTextDisabled: { color: colors.text.secondary },
  postcodeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIDE_PADDING, paddingVertical: 12, backgroundColor: colors.text.reverse },
  postcodeTitle: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary },
  modalContainer: { flex: 1, backgroundColor: colors.text.reverse },
  paydayModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIDE_PADDING, paddingVertical: 16, backgroundColor: colors.text.reverse, borderBottomWidth: 1, borderBottomColor: colors.disable },
  paydayModalTitle: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary },
  paydayModalContent: { flex: 1, padding: SIDE_PADDING, justifyContent: 'center' },
  paydayModalSubtitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center', marginBottom: 40 },
  pickerContainer: { height: 250, position: 'relative', backgroundColor: colors.disable, borderRadius: 16, overflow: 'hidden' },
  pickerScroll: { flex: 1 },
  pickerScrollContent: { paddingVertical: 0 },
  pickerPadding: { height: 100 },
  pickerItem: { height: 50, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  pickerItemSelected: { backgroundColor: 'transparent' },
  pickerItemText: { fontSize: sizes.middleTitle, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary },
  pickerItemTextSelected: { fontSize: sizes.bigTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary },
  pickerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', pointerEvents: 'none' },
  pickerIndicator: { height: 50, backgroundColor: 'rgba(255, 149, 0, 0.1)', borderTopWidth: 2, borderBottomWidth: 2, borderColor: colors.accent },
});