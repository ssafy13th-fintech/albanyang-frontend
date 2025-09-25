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

// 목업 데이터
const mockStores = [
  { id: 1, name: 'GS25 강남점' },
  { id: 2, name: 'CU 홍대점' },
  { id: 3, name: '세븐일레븐 신촌점' },
];

const mockStaffList = [
  { id: 1, name: '김알바', nickname: '김김', status: 'SCHEDULED' },
  { id: 2, name: '이직원', nickname: '이이', status: 'SCHEDULED' },
  { id: 3, name: '박근무', nickname: '박박', status: 'SCHEDULED' },
  { id: 4, name: '정사원', nickname: '정정', status: 'SCHEDULED' },
];

const mockSchedules = [
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

export default function ScheduleManagementPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  // 상태 관리
  const [stores, setStores] = useState(mockStores);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [staffList, setStaffList] = useState(mockStaffList);
  const [schedules, setSchedules] = useState(mockSchedules);
  
  // 직원 중심 상태
  const [selectedStaff, setSelectedStaff] = useState<StaffInfo | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7); // YYYY-MM
  });
  
  // 모달 상태
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingScheduleId, setEditingScheduleId] = useState<number | null>(null);
  
  // 스케줄 정보
  const [workStartTime, setWorkStartTime] = useState('09:00');
  const [workEndTime, setWorkEndTime] = useState('18:00');
  const [workHours, setWorkHours] = useState(8);
  const [breakTime, setBreakTime] = useState(60);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [nightShiftHours, setNightShiftHours] = useState(0);

  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(false);

  // 초기 데이터 로드
  useEffect(() => {
    loadInitialData();
  }, []);

  // 매장 선택시 직원 목록 로드
  useEffect(() => {
    if (selectedStore) {
      loadStaffList();
    }
  }, [selectedStore]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      setStores(mockStores);
      
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
      setStaffList(mockStaffList);
      console.log('목업 직원 데이터 로드:', mockStaffList);
    } catch (error) {
      console.error('직원 목록 로드 실패:', error);
    }
  };

  // 날짜별 스케줄 표시를 위한 마킹 데이터 생성
  const getMarkedDates = () => {
    const marked: any = {};
    
    // 선택된 날짜들 마킹 (다중 선택)
    selectedDates.forEach(date => {
      marked[date] = {
        selected: true,
        selectedColor: colors.accent,
        selectedTextColor: colors.text.reverse
      };
    });
    
    // 선택된 직원의 기존 스케줄이 있는 날짜 마킹
    if (selectedStaff) {
      const staffSchedules = mockSchedules.filter(s => s.staffId === selectedStaff.id);
      staffSchedules.forEach(schedule => {
        if (!marked[schedule.commuteDate]) {
          marked[schedule.commuteDate] = {};
        }
        marked[schedule.commuteDate] = {
          ...marked[schedule.commuteDate],
          marked: true,
          dotColor: colors.main
        };
      });
    }
    
    return marked;
  };

  // 날짜 다중 선택 핸들러
  const handleDatePress = (day: any) => {
    const dateString = day.dateString;
    
    setSelectedDates(prev => {
      if (prev.includes(dateString)) {
        // 이미 선택된 날짜면 제거
        return prev.filter(date => date !== dateString);
      } else {
        // 새로운 날짜 추가
        return [...prev, dateString].sort();
      }
    });
  };

  // 폼 리셋
  const resetForm = () => {
    setSelectedDates([]);
    setWorkStartTime('09:00');
    setWorkEndTime('18:00');
    setWorkHours(8);
    setBreakTime(60);
    setOvertimeHours(0);
    setNightShiftHours(0);
    setEditingScheduleId(null);
  };

  // 스케줄 추가
  const handleSaveSchedule = async () => {
    if (!selectedStore || !selectedStaff || selectedDates.length === 0) {
      Alert.alert('알림', '직원과 날짜를 선택해주세요.');
      return;
    }

    try {
      console.log('다중 날짜 스케줄 저장:', {
        store: selectedStore.name,
        staff: selectedStaff.name,
        dates: selectedDates,
        workTime: `${workStartTime} - ${workEndTime}`,
      });

      Alert.alert('성공', `${selectedStaff.name}의 ${selectedDates.length}일 스케줄이 추가되었습니다. (목업)`);
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error('스케줄 저장 실패:', error);
      Alert.alert('오류', '스케줄 저장에 실패했습니다.');
    }
  };

  // 스케줄 삭제
  const handleDeleteSchedule = async (scheduleId: number, staffId: number) => {
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
            } catch (error) {
              console.error('스케줄 삭제 실패:', error);
              Alert.alert('오류', '스케줄 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  };

  // 전체 선택된 날짜 해제
  const clearSelectedDates = () => {
    setSelectedDates([]);
  };

  // 매장 드롭다운 데이터
  const storeDropdownData = stores.map(store => ({
    label: store.name,
    value: store.id
  }));

  // 직원 드롭다운 데이터
  const staffDropdownData = staffList.map(staff => ({
    label: `${staff.name} (${staff.nickname})`,
    value: staff.id
  }));

  // 선택된 직원의 스케줄 필터링
  const getStaffSchedules = () => {
    if (!selectedStaff) return [];
    return mockSchedules.filter(s => s.staffId === selectedStaff.id);
  };

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
        {/* 매장 선택 */}
        <View style={{ marginHorizontal: 16, marginVertical: 16 }}>
          <Dropdown
            data={storeDropdownData}
            labelField="label"
            valueField="value"
            value={selectedStore?.id}
            onChange={(item) => {
              const store = stores.find(s => s.id === item.value);
              setSelectedStore(store || null);
              setSelectedStaff(null); // 매장 변경시 직원 선택 초기화
              resetForm();
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

        {/* 직원 선택 */}
        {selectedStore && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <Text style={{
              fontFamily: FONTS.jamsil.regular3,
              fontSize: sizes.normalText,
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
                resetForm(); // 직원 변경시 선택된 날짜 초기화
                console.log('직원 선택:', staff?.name);
              }}
              placeholder="직원을 선택하세요"
              style={{
                borderColor: colors.main,
                borderWidth: 1,
                borderRadius: 10,
                backgroundColor: "transparent",
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
        )}

        {/* 달력 */}
        {selectedStaff && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <View style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 12 
            }}>
              <Text style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.normalText,
                color: colors.text.primary
              }}>
                근무 날짜 선택 ({selectedDates.length}일 선택됨)
              </Text>
              {selectedDates.length > 0 && (
                <TouchableOpacity
                  onPress={clearSelectedDates}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: colors.text.secondary,
                    borderRadius: 6,
                  }}
                >
                  <Text style={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.smallText,
                    color: colors.text.reverse
                  }}>전체 해제</Text>
                </TouchableOpacity>
              )}
            </View>

            <Calendar
              current={currentMonth}
              onDayPress={handleDatePress}
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

        {/* 선택된 날짜 리스트 */}
        {selectedDates.length > 0 && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <Text style={{
              fontFamily: FONTS.jamsil.regular3,
              fontSize: sizes.normalText,
              color: colors.text.primary,
              marginBottom: 8
            }}>선택된 날짜</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={{
                backgroundColor: colors.disable,
                borderRadius: 8,
                padding: 8,
              }}
            >
              {selectedDates.map(date => (
                <TouchableOpacity
                  key={date}
                  onPress={() => handleDatePress({ dateString: date })}
                  style={{
                    backgroundColor: colors.main,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    marginRight: 8,
                  }}
                >
                  <Text style={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize: sizes.smallText,
                    color: colors.text.reverse
                  }}>{date} ✕</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 스케줄 입력 및 저장 버튼 */}
        {selectedDates.length > 0 && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.accent,
                paddingVertical: 16,
                borderRadius: 10,
                alignItems: 'center',
              }}
              onPress={() => setModalVisible(true)}
            >
              <Text style={{
                fontFamily: FONTS.jamsil.medium4,
                fontSize: sizes.normalText,
                color: colors.text.reverse
              }}>
                스케줄 시간 설정하기
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 선택된 직원의 기존 스케줄 목록 */}
        {selectedStaff && (
          <View style={{ marginHorizontal: 16, marginBottom: 100 }}>
            <Text style={{
              fontFamily: FONTS.jamsil.regular3,
              fontSize: sizes.normalText,
              color: colors.text.primary,
              marginBottom: 12
            }}>
              {selectedStaff.name}의 기존 스케줄
            </Text>

            {getStaffSchedules().length === 0 ? (
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
                data={getStaffSchedules()}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={{
                    backgroundColor: 'white',
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 8,
                    elevation: 2,
                  }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontFamily: FONTS.jamsil.medium4,
                          fontSize: sizes.normalText,
                          color: colors.text.primary,
                          marginBottom: 4
                        }}>
                          {item.commuteDate}
                        </Text>
                        <Text style={{
                          fontFamily: FONTS.jamsil.light2,
                          fontSize: sizes.smallText,
                          color: colors.text.secondary,
                        }}>
                          {item.workStartTime} - {item.workEndTime} ({item.workHours}시간)
                        </Text>
                      </View>
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
                )}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* 스케줄 시간 설정 모달 */}
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
                {selectedStaff?.name}의 스케줄 설정
              </Text>

              <Text style={{
                fontFamily: FONTS.jamsil.light2,
                fontSize: sizes.smallText,
                color: colors.text.secondary,
                marginBottom: 16,
                textAlign: 'center'
              }}>
                선택된 {selectedDates.length}일에 동일한 스케줄이 적용됩니다
              </Text>

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
                    {selectedDates.length}일 스케줄 저장
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