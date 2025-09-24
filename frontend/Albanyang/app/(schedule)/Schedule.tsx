import SmallHeader from "@/components/header/SmallHeader";
import NavBar from "@/components/navBar/NavBar";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { useState, useEffect } from "react";
import { 
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text, 
  TextInput,
  TouchableOpacity, 
  View 
} from "react-native";
import { Calendar } from 'react-native-calendars';
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

// API imports (주석 처리)
// import { getStores } from '@/api/Stores';
// import { getStaffList } from '@/api/Staff';
// import { createSchedule, getStoreSchedules, updateSchedule, deleteSchedule } from '@/api/Schedule';

// 목업 데이터
const mockStores: StoreInfo[] = [
  { id: 1, name: 'GS25 강남점' },
  { id: 2, name: 'CU 홍대점' },
  { id: 3, name: '세븐일레븐 신촌점' },
];

const mockStaffList: StaffInfo[] = [
  { id: 1, name: '김알바', nickname: '김김', status: 'SCHEDULED' },
  { id: 2, name: '이직원', nickname: '이이', status: 'SCHEDULED' },
  { id: 3, name: '박근무', nickname: '박박', status: 'SCHEDULED' },
  { id: 4, name: '정사원', nickname: '정정', status: 'SCHEDULED' },
];

const mockSchedules: ScheduleInfo[] = [
  {
    id: 1,
    staffId: 1,
    staffNickname: '김김',
    commuteDate: '2025-01-15',
    workStartTime: '09:00',
    workEndTime: '18:00',
    workHours: 8,
    breakTime: 60,
    overtimeHours: 0,
    nightShiftHours: 0,
    scheduleType: 'NORMAL',
    editable: true
  },
  {
    id: 2,
    staffId: 2,
    staffNickname: '이이',
    commuteDate: '2025-01-15',
    workStartTime: '14:00',
    workEndTime: '22:00',
    workHours: 8,
    breakTime: 60,
    overtimeHours: 1,
    nightShiftHours: 2,
    scheduleType: 'NORMAL',
    editable: true
  }
];

// 타입 정의
interface StoreInfo {
  id: number;
  name: string;
}

interface StaffInfo {
  id: number;
  name: string;
  nickname: string;
  status: string;
}

interface ScheduleInfo {
  id: number;
  staffId: number;
  staffNickname: string;
  commuteDate: string;
  workStartTime: string;
  workEndTime: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightShiftHours: number;
  scheduleType: 'NORMAL' | string;
  editable: boolean;
}

interface ScheduleFormData {
  staffId: number;
  workStartTime: string;
  workEndTime: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightShiftHours: number;
}

export default function ScheduleManagementPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // 상태 관리
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [schedules, setSchedules] = useState<ScheduleInfo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  
  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDateForModal, setSelectedDateForModal] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  
  // 폼 데이터
  const [selectedStaff, setSelectedStaff] = useState<StaffInfo | null>(null);
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [workHours, setWorkHours] = useState(8);
  const [breakTime, setBreakTime] = useState(60);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [nightShiftHours, setNightShiftHours] = useState(0);

  // 로딩 상태
  const [loading, setLoading] = useState(true);
  const [focus, setFocus] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 매장 선택시 직원 목록 로드
  useEffect(() => {
    if (selectedStore) {
      loadStaffList();
      loadSchedules();
    }
  }, [selectedStore, selectedDate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // 목업 데이터 사용
      setStores(mockStores);
      
      // URL 파라미터에서 매장 정보가 있으면 설정
      if (params.storeId) {
        const paramStore = mockStores.find(store => store.id === Number(params.storeId));
        if (paramStore) {
          setSelectedStore(paramStore);
        }
      } else if (mockStores.length > 0) {
        setSelectedStore(mockStores[0]);
      }
      
      console.log('목업 데이터 로드 완료');
    } catch (error) {
      console.error('초기 데이터 로드 실패:', error);
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadStaffList = async () => {
    if (!selectedStore) return;
    
    try {
      // 목업 데이터 사용
      setStaffList(mockStaffList);
      console.log('목업 직원 데이터 로드:', mockStaffList);
    } catch (error) {
      console.error('직원 목록 로드 실패:', error);
    }
  };

  const loadSchedules = async () => {
    if (!selectedStore || !selectedDate) return;
    
    try {
      // 선택된 날짜의 스케줄만 필터링
      const filteredSchedules = mockSchedules.filter(
        schedule => schedule.commuteDate === selectedDate
      );
      setSchedules(filteredSchedules);
      console.log(`${selectedDate} 스케줄 로드:`, filteredSchedules);
    } catch (error) {
      console.error('스케줄 로드 실패:', error);
      setSchedules([]);
    }
  };

  // 날짜별 스케줄 표시를 위한 마킹 데이터 생성
  const getMarkedDates = () => {
    const marked: any = {};
    
    // 선택된 날짜 마킹
    marked[selectedDate] = {
      selected: true,
      selectedColor: colors.accent,
      selectedTextColor: colors.text.reverse
    };
    
    // 스케줄이 있는 날짜 마킹 (여기서는 현재 날짜만 표시하지만, 
    // 실제로는 월별 데이터를 받아와서 처리해야 함)
    if (schedules.length > 0) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        marked: true,
        dotColor: colors.main
      };
    }
    
    return marked;
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (day: any) => {
    console.log('날짜 선택:', day.dateString);
    setSelectedDate(day.dateString);
  };

  // 날짜 클릭하여 날짜 변경 (모달은 열지 않음)
  const handleDatePress = (day: any) => {
    console.log('날짜 프레스:', day.dateString);
    setSelectedDate(day.dateString);
    // 모달 관련 코드 제거
    // setSelectedDateForModal(day.dateString);
    // resetForm();
    // setIsEditMode(false);
    // setModalVisible(true);
  };

  // 폼 리셋
  const resetForm = () => {
    setSelectedStaff(null);
    setWorkStartTime('09:00');
    setWorkEndTime('18:00');
    setWorkHours(8);
    setBreakTime(60);
    setOvertimeHours(0);
    setNightShiftHours(0);
    setEditingScheduleId(null);
  };

  // 스케줄 추가/수정 (목업)
  const handleSaveSchedule = async () => {
    if (!selectedStore || !selectedStaff || !selectedDateForModal) {
      Alert.alert('알림', '필수 정보를 모두 입력해주세요.');
      return;
    }

    try {
      console.log('스케줄 저장:', {
        store: selectedStore.name,
        staff: selectedStaff.name,
        date: selectedDateForModal,
        workTime: `${workStartTime} - ${workEndTime}`,
        isEditMode
      });

      // 목업 데이터 처리
      if (isEditMode && editingScheduleId) {
        Alert.alert('성공', '스케줄이 수정되었습니다. (목업)');
      } else {
        Alert.alert('성공', '스케줄이 추가되었습니다. (목업)');
      }

      setModalVisible(false);
      // loadSchedules(); // 실제로는 새로고침 필요
    } catch (error) {
      console.error('스케줄 저장 실패:', error);
      Alert.alert('오류', '스케줄 저장에 실패했습니다.');
    }
  };

  // 스케줄 삭제 (목업)
  const handleDeleteSchedule = async (scheduleId: number, staffId: number) => {
    if (!selectedStore) return;

    Alert.alert(
      '삭제 확인',
      '정말로 이 스케줄을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('스케줄 삭제:', scheduleId);
              Alert.alert('성공', '스케줄이 삭제되었습니다. (목업)');
              // loadSchedules(); // 실제로는 새로고침 필요
            } catch (error) {
              console.error('스케줄 삭제 실패:', error);
              Alert.alert('오류', '스케줄 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  // 스케줄 수정 모드로 전환
  const handleEditSchedule = (schedule: ScheduleInfo) => {
    const staff = staffList.find(s => s.id === schedule.staffId);
    if (staff) {
      setSelectedStaff(staff);
      setWorkStartTime(schedule.workStartTime);
      setWorkEndTime(schedule.workEndTime);
      setWorkHours(schedule.workHours);
      setBreakTime(schedule.breakTime);
      setOvertimeHours(schedule.overtimeHours);
      setNightShiftHours(schedule.nightShiftHours);
      setEditingScheduleId(schedule.id);
      setSelectedDateForModal(schedule.commuteDate);
      setIsEditMode(true);
      setModalVisible(true);
    }
  };

  // 매장 드롭다운 데이터 변환
  const storeDropdownData = stores.map(store => ({
    label: store.name,
    value: store.id
  }));

  // 직원 드롭다운 데이터 변환
  const staffDropdownData = staffList.map(staff => ({
    label: `${staff.name} (${staff.nickname})`,
    value: staff.id
  }));

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{
          fontFamily: FONTS.jamsil.regular3,
          fontSize: sizes.normalText,
          color: colors.text.secondary
        }}>로딩중...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.text.reverse }}>
      <SmallHeader
        headerText="스케줄 관리"
        headerTextFont={FONTS.jamsil.regular3}
        headerTextSize={sizes.smallTitle}
        isAblaBack={true}
      />

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* 매장 선택 드롭다운 */}
        <View style={{ marginHorizontal: 16, marginVertical: 16 }}>
          <Dropdown
            data={storeDropdownData}
            labelField="label"
            valueField="value"
            value={selectedStore?.id}
            onChange={(item) => {
              const store = stores.find(s => s.id === item.value);
              setSelectedStore(store || null);
              console.log('매장 선택:', store?.name);
            }}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            placeholder="매장을 선택하세요"
            style={{
              borderColor: focus ? colors.accent : colors.main,
              borderWidth: focus ? 2 : 1,
              borderRadius: 10,
              backgroundColor: focus ? colors.disable : "transparent",
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
            selectedTextStyle={{
              fontFamily: FONTS.jamsil.regular3,
              fontSize: sizes.normalText,
              color: colors.text.primary
            }}
            placeholderStyle={{
              fontFamily: FONTS.jamsil.light2,
              fontSize: sizes.normalText,
              color: colors.text.secondary
            }}
          />
        </View>

        {/* 월별 달력 */}
        {selectedStore && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <Calendar
              current={selectedDate}
              onDayPress={handleDatePress}
              onDayLongPress={handleDatePress}
              markedDates={getMarkedDates()}
              firstDay={0}
              theme={{
                backgroundColor: 'white',
                calendarBackground: 'white',
                textSectionTitleColor: colors.text.primary,
                selectedDayBackgroundColor: colors.accent,
                selectedDayTextColor: colors.text.reverse,
                todayTextColor: colors.accent,
                dayTextColor: colors.text.primary,
                textDisabledColor: colors.text.secondary,
                dotColor: colors.main,
                selectedDotColor: colors.text.reverse,
                arrowColor: colors.accent,
                monthTextColor: colors.text.primary,
                textDayFontFamily: FONTS.jamsil.light2,
                textMonthFontFamily: FONTS.jamsil.regular3,
                textDayHeaderFontFamily: FONTS.jamsil.light2,
              }}
              style={{
                borderRadius: 10,
                elevation: 2,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            />
          </View>
        )}

        {/* 선택된 날짜의 스케줄 목록 */}
        {selectedStore && (
          <View style={{ marginHorizontal: 16, marginBottom: 100 }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 16 
            }}>
              <Text style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.normalText,
                color: colors.text.primary
              }}>
                {selectedDate} 스케줄
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: colors.main,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
                onPress={() => {
                  setSelectedDateForModal(selectedDate);
                  resetForm();
                  setIsEditMode(false);
                  setModalVisible(true);
                }}
              >
                <Text style={{
                  fontFamily: FONTS.jamsil.regular3,
                  fontSize: sizes.smallText,
                  color: colors.text.reverse
                }}>+ 추가</Text>
              </TouchableOpacity>
            </View>

            {schedules.length === 0 ? (
              <View style={{
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 20,
                alignItems: 'center',
                elevation: 2,
              }}>
                <Text style={{
                  fontFamily: FONTS.jamsil.light2,
                  fontSize: sizes.normalText,
                  color: colors.text.secondary
                }}>등록된 스케줄이 없습니다</Text>
              </View>
            ) : (
              <FlatList
                data={schedules}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={{
                    backgroundColor: 'white',
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 8,
                    elevation: 2,
                    shadowColor: colors.shadow,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontFamily: FONTS.jamsil.medium4,
                          fontSize: sizes.normalText,
                          color: colors.text.primary,
                          marginBottom: 4
                        }}>
                          {item.staffNickname}
                        </Text>
                        <Text style={{
                          fontFamily: FONTS.jamsil.light2,
                          fontSize: sizes.smallText,
                          color: colors.text.secondary,
                          marginBottom: 2
                        }}>
                          근무시간: {item.workStartTime} - {item.workEndTime} ({item.workHours}시간)
                        </Text>
                        <Text style={{
                          fontFamily: FONTS.jamsil.light2,
                          fontSize: sizes.smallText,
                          color: colors.text.secondary
                        }}>
                          휴게: {item.breakTime}분 | 연장: {item.overtimeHours}시간 | 야간: {item.nightShiftHours}시간
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          style={{
                            backgroundColor: colors.subAccent,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                          }}
                          onPress={() => handleEditSchedule(item)}
                        >
                          <Text style={{
                            fontFamily: FONTS.jamsil.regular3,
                            fontSize: sizes.smallText,
                            color: colors.text.reverse
                          }}>수정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            backgroundColor: colors.reject,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                          }}
                          onPress={() => handleDeleteSchedule(item.id, item.staffId)}
                        >
                          <Text style={{
                            fontFamily: FONTS.jamsil.regular3,
                            fontSize: sizes.smallText,
                            color: colors.text.reverse
                          }}>삭제</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* 스케줄 추가/수정 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: 20,
            margin: 20,
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            width: '90%',
            maxHeight: '80%',
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={{
                fontFamily: FONTS.jamsil.medium4,
                fontSize: sizes.normalText,
                color: colors.text.primary,
                marginBottom: 20,
                textAlign: 'center'
              }}>
                {isEditMode ? '스케줄 수정' : '스케줄 추가'} - {selectedDateForModal}
              </Text>

              {/* 직원 선택 */}
              <Text style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.smallText,
                color: colors.text.primary,
                marginBottom: 8
              }}>직원 선택</Text>
              <Dropdown
                data={staffDropdownData}
                labelField="label"
                valueField="value"
                value={selectedStaff?.id}
                onChange={(item) => {
                  const staff = staffList.find(s => s.id === item.value);
                  setSelectedStaff(staff || null);
                }}
                placeholder="직원을 선택하세요"
                style={{
                  borderColor: colors.main,
                  borderWidth: 1,
                  borderRadius: 8,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  marginBottom: 16,
                }}
              />

              {/* 근무 시간 */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.smallText,
                    color: colors.text.primary,
                    marginBottom: 8
                  }}>시작 시간</Text>
                  <TextInput
                    value={workStartTime}
                    onChangeText={setWorkStartTime}
                    placeholder="09:00"
                    style={{
                      borderColor: colors.main,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      fontFamily: FONTS.jamsil.regular3,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.smallText,
                    color: colors.text.primary,
                    marginBottom: 8
                  }}>종료 시간</Text>
                  <TextInput
                    value={workEndTime}
                    onChangeText={setWorkEndTime}
                    placeholder="18:00"
                    style={{
                      borderColor: colors.main,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      fontFamily: FONTS.jamsil.regular3,
                    }}
                  />
                </View>
              </View>

              {/* 근무 정보 */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.smallText,
                    color: colors.text.primary,
                    marginBottom: 8
                  }}>근무 시간</Text>
                  <TextInput
                    value={workHours.toString()}
                    onChangeText={(text) => setWorkHours(parseInt(text) || 0)}
                    placeholder="8"
                    keyboardType="numeric"
                    style={{
                      borderColor: colors.main,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      fontFamily: FONTS.jamsil.regular3,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.smallText,
                    color: colors.text.primary,
                    marginBottom: 8
                  }}>휴게 시간(분)</Text>
                  <TextInput
                    value={breakTime.toString()}
                    onChangeText={(text) => setBreakTime(parseInt(text) || 0)}
                    placeholder="60"
                    keyboardType="numeric"
                    style={{
                      borderColor: colors.main,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      fontFamily: FONTS.jamsil.regular3,
                    }}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.smallText,
                    color: colors.text.primary,
                    marginBottom: 8
                  }}>연장 근무(시간)</Text>
                  <TextInput
                    value={overtimeHours.toString()}
                    onChangeText={(text) => setOvertimeHours(parseInt(text) || 0)}
                    placeholder="0"
                    keyboardType="numeric"
                    style={{
                      borderColor: colors.main,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      fontFamily: FONTS.jamsil.regular3,
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.smallText,
                    color: colors.text.primary,
                    marginBottom: 8
                  }}>야간 근무(시간)</Text>
                  <TextInput
                    value={nightShiftHours.toString()}
                    onChangeText={(text) => setNightShiftHours(parseInt(text) || 0)}
                    placeholder="0"
                    keyboardType="numeric"
                    style={{
                      borderColor: colors.main,
                      borderWidth: 1,
                      borderRadius: 8,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      fontFamily: FONTS.jamsil.regular3,
                    }}
                  />
                </View>
              </View>

              {/* 버튼들 */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.text.secondary,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.normalText,
                    color: colors.text.reverse
                  }}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.main,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                  }}
                  onPress={handleSaveSchedule}
                >
                  <Text style={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.normalText,
                    color: colors.text.reverse
                  }}>
                    {isEditMode ? '수정' : '추가'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}