// Albayang/(schedule)/Schedule.tsx

import SmallHeader from "@/components/header/SmallHeader";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

//  API 모듈
import * as StoreApi from "@/api/Stores";
import * as StaffApi from "@/api/Staff";
import * as ScheduleApi from "@/api/Schedule";
import * as PayslipApi from "@/api/EmployerPaylips";

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
  scheduleType: "NORMAL" | string;
  editable: boolean;
}

export default function ScheduleManagementPage() {
  const params = useLocalSearchParams();

  // 상태 관리
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [schedules, setSchedules] = useState<ScheduleInfo[]>([]);

  const [selectedStaff, setSelectedStaff] = useState<StaffInfo | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7); // YYYY-MM
  });

  // 모달/폼
  const [modalVisible, setModalVisible] = useState(false);
  const [workStartTime, setWorkStartTime] = useState("09:00");
  const [workEndTime, setWorkEndTime] = useState("18:00");
  const [workHours, setWorkHours] = useState(8); // 표시만, 전송 X
  const [breakTime, setBreakTime] = useState(60);
  const [overtimeHours, setOvertimeHours] = useState(0); // 수정 시에만 사용
  const [nightShiftHours, setNightShiftHours] = useState(0); // 표시만, 전송 X

  const [loading, setLoading] = useState(false);
  const [focus, setFocus] = useState(false);
  const [selectedPayslipMonth, setSelectedPayslipMonth] = useState(() => {
    const today = new Date();
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;
  });

  // =========================
  // 초기 로드: 매장 목록
  // =========================
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 사장: getStores(), 직원: getMyStores()
        // 상황에 맞게 하나만 쓰면 됨. 여기선 우선 사장 기준(getStores) → 빈 경우 me 호출.
        let storeRes = await StoreApi.getStores();
        let storeList = storeRes?.data?.stores ?? [];

        if (!storeList.length) {
          const meRes = await StaffApi.getMyStores();
          storeList = meRes?.data?.stores ?? [];
        }

        setStores(storeList);

        // 파라미터 storeId 우선 선택
        let initial: StoreInfo | null = null;
        if (params.storeId) {
          const byParam = storeList.find((s) => s.id === Number(params.storeId));
          if (byParam) initial = byParam as StoreInfo;
        }
        if (!initial && storeList.length > 0) {
          initial = storeList[0] as StoreInfo;
        }
        setSelectedStore(initial);
      } catch (error: any) {
        console.error("초기 데이터 로드 실패:", error);
        Alert.alert("오류", error?.message ?? "데이터를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // 매장 선택 → 직원 목록 불러오기
  // =========================
  useEffect(() => {
    if (!selectedStore) return;
    (async () => {
      try {
        setLoading(true);
        const res = await StaffApi.getStaffList(selectedStore.id);
        const list = res?.data?.staffInfoRes ?? [];
        setStaffList(list as StaffInfo[]);
        setSelectedStaff(null);
        setSelectedDates([]);
      } catch (error: any) {
        console.error("직원 목록 로드 실패:", error);
        Alert.alert("오류", error?.message ?? "직원 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedStore]);

  // =========================
  // 월/매장 변경 시 월별 스케줄 조회
  // =========================
  const fetchMonthlySchedules = useCallback(async () => {
    if (!selectedStore) return;
    try {
      setLoading(true);
      const res = await ScheduleApi.getStoreSchedules(selectedStore.id, currentMonth);
      const list = res?.data?.schedules ?? [];
      setSchedules(list as ScheduleInfo[]);
    } catch (error: any) {
      console.error("스케줄 조회 실패:", error);
      Alert.alert("오류", error?.message ?? "스케줄을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [selectedStore, currentMonth]);

  useEffect(() => {
    fetchMonthlySchedules();
  }, [fetchMonthlySchedules]);

  // =========================
  // 급여명세서 생성 및 전송
  // =========================
  const handleGenerateAndSendPayslip = async () => {
    if (!selectedStore || !selectedStaff) return;
    
    Alert.alert(
      "급여명세서 생성 및 전송",
      `${selectedStaff.name}에게 ${selectedPayslipMonth}월 급여명세서를 생성하고 전송하시겠습니까?`,
      [
        { text: "취소", style: "cancel" },
        {
          text: "생성 및 전송",
          onPress: async () => {
            try {
              setLoading(true);
              
              // 1단계: 급여명세서 자동 생성
              const generateRes = await PayslipApi.generatePayslip({
                storeId: selectedStore.id,
                staffId: selectedStaff.id,
                month: selectedPayslipMonth // 선택된 월 사용
              });
              
              if (generateRes.code === 'SUCCESS' && generateRes.data) {
                const payslipId = generateRes.data.id;
                
                // 2단계: 생성된 급여명세서 전송
                const sendRes = await PayslipApi.sendPayslip(selectedStore.id, payslipId, selectedStaff.id);
                
                if (sendRes.code === 'SUCCESS') {
                  Alert.alert(
                    "성공", 
                    `${selectedStaff.name}에게 ${selectedPayslipMonth}월 급여명세서가 생성되고 전송되었습니다.\n총 급여: ${generateRes.data.payslipDetails.netSalary.toLocaleString()}원`
                  );
                } else {
                  Alert.alert("오류", "급여명세서 전송에 실패했습니다.");
                }
              } else {
                Alert.alert("오류", "급여명세서 생성에 실패했습니다.");
              }
            } catch (error: any) {
              console.error("급여명세서 처리 실패:", error);
              Alert.alert("오류", error?.message ?? "급여명세서 처리에 실패했습니다.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // 급여명세서 월 선택용 데이터 생성
  const generateMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    
    // 최근 12개월 생성 (현재 월 포함)
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const displayText = `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
      
      months.push({
        label: displayText,
        value: yearMonth
      });
    }
    
    return months;
  };

  const payslipMonthOptions = useMemo(() => generateMonthOptions(), []);

  // =========================
  // 캘린더 표시용 마킹 데이터
  // =========================
  const getMarkedDates = useCallback(() => {
    const marked: Record<string, any> = {};

    // 선택된 날짜 하이라이트
    selectedDates.forEach((date) => {
      marked[date] = {
        selected: true,
        selectedColor: colors.accent,
        selectedTextColor: colors.text.reverse,
      };
    });

    // 선택된 직원의 기존 스케줄 표시 (dot)
    if (selectedStaff) {
      schedules
        .filter((s) => s.staffId === selectedStaff.id)
        .forEach((schedule) => {
          if (!marked[schedule.commuteDate]) marked[schedule.commuteDate] = {};
          marked[schedule.commuteDate] = {
            ...marked[schedule.commuteDate],
            marked: true,
            dotColor: colors.main,
          };
        });
    }

    return marked;
  }, [selectedDates, selectedStaff, schedules]);

  // 날짜 다중 선택
  const handleDatePress = (day: any) => {
    const dateString = day.dateString;
    setSelectedDates((prev) => {
      if (prev.includes(dateString)) {
        return prev.filter((d) => d !== dateString);
      }
      return [...prev, dateString].sort();
    });
  };

  // 월 변경
  const handleMonthChange = (m: { year: number; month: number }) => {
    const y = m.year;
    const mm = String(m.month).padStart(2, "0");
    setCurrentMonth(`${y}-${mm}`);
  };

  // 폼 리셋
  const resetForm = () => {
    setSelectedDates([]);
    setWorkStartTime("09:00");
    setWorkEndTime("18:00");
    setWorkHours(8);
    setBreakTime(60);
    setOvertimeHours(0);
    setNightShiftHours(0);
  };

  // 스케줄 생성
  const handleSaveSchedule = async () => {
    if (!selectedStore || !selectedStaff || selectedDates.length === 0) {
      Alert.alert("알림", "직원과 날짜를 선택해주세요.");
      return;
    }
    try {
      setLoading(true);
      await ScheduleApi.createSchedule(selectedStore.id, selectedStaff.id, {
        commuteDates: selectedDates,
        workStartTime,
        workEndTime,
        breakTime,
        scheduleType: "NORMAL",
      });
      await fetchMonthlySchedules();
      Alert.alert("성공", `${selectedStaff.name}의 ${selectedDates.length}일 스케줄이 추가되었습니다.`);
      setModalVisible(false);
      resetForm();
    } catch (error: any) {
      console.error("스케줄 저장 실패:", error);
      Alert.alert("오류", error?.message ?? "스케줄 저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 스케줄 삭제
  const handleDeleteSchedule = async (scheduleId: number, staffId: number) => {
    Alert.alert("삭제 확인", "정말로 이 스케줄을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            if (!selectedStore) return;
            await ScheduleApi.deleteSchedule(selectedStore.id, staffId, scheduleId);
            await fetchMonthlySchedules();
            Alert.alert("성공", "스케줄이 삭제되었습니다.");
          } catch (error: any) {
            console.error("스케줄 삭제 실패:", error);
            Alert.alert("오류", error?.message ?? "스케줄 삭제에 실패했습니다.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // 전체 선택된 날짜 해제
  const clearSelectedDates = () => setSelectedDates([]);

  // 드롭다운 데이터
  const storeDropdownData = useMemo(
    () => stores.map((store) => ({ label: store.name, value: store.id })),
    [stores]
  );
  const staffDropdownData = useMemo(
    () =>
      staffList.map((staff) => ({
        label: `${staff.name} (${staff.nickname})`,
        value: staff.id,
      })),
    [staffList]
  );

  // 선택된 직원의 기존 스케줄 목록
  const staffSchedules = useMemo(() => {
    if (!selectedStaff) return [];
    return schedules.filter((s) => s.staffId === selectedStaff.id);
  }, [selectedStaff, schedules]);

  if (loading && !stores.length) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            fontFamily: FONTS.jamsil.regular3,
            fontSize: sizes.normalText,
            color: colors.text.secondary,
          }}
        >
          로딩중...
        </Text>
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
              const store = stores.find((s) => s.id === item.value) || null;
              setSelectedStore(store);
              setSelectedStaff(null);
              resetForm();
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
              color: colors.text.primary,
            }}
            placeholderStyle={{
              fontFamily: FONTS.jamsil.light2,
              fontSize: sizes.normalText,
              color: colors.text.secondary,
            }}
          />
        </View>

        {/* 직원 선택 */}
        {selectedStore && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <Text
              style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.normalText,
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              직원 선택
            </Text>
            <Dropdown
              data={staffDropdownData}
              labelField="label"
              valueField="value"
              value={selectedStaff?.id}
              onChange={(item) => {
                const staff = staffList.find((s) => s.id === item.value) || null;
                setSelectedStaff(staff);
                setSelectedDates([]);
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
                color: colors.text.primary,
              }}
              placeholderStyle={{
                fontFamily: FONTS.jamsil.light2,
                fontSize: sizes.normalText,
                color: colors.text.secondary,
              }}
            />
          </View>
        )}

        {/* 급여명세서 생성 및 전송 섹션 */}
        {selectedStore && selectedStaff && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            {/* 급여명세서 월 선택 */}
            <Text
              style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.normalText,
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              급여명세서 생성 월 선택
            </Text>
            <Dropdown
              data={payslipMonthOptions}
              labelField="label"
              valueField="value"
              value={selectedPayslipMonth}
              onChange={(item) => setSelectedPayslipMonth(item.value)}
              placeholder="급여명세서 생성 월을 선택하세요"
              style={{
                borderColor: colors.subAccent,
                borderWidth: 1,
                borderRadius: 10,
                backgroundColor: "transparent",
                paddingVertical: 12,
                paddingHorizontal: 16,
                marginBottom: 12,
              }}
              selectedTextStyle={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.normalText,
                color: colors.text.primary,
              }}
              placeholderStyle={{
                fontFamily: FONTS.jamsil.light2,
                fontSize: sizes.normalText,
                color: colors.text.secondary,
              }}
            />
            
            {/* 급여명세서 생성 및 전송 버튼 */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.subAccent,
                paddingVertical: 16,
                borderRadius: 10,
                alignItems: "center",
                opacity: loading ? 0.6 : 1,
              }}
              onPress={handleGenerateAndSendPayslip}
              disabled={loading}
            >
              <Text
                style={{
                  fontFamily: FONTS.jamsil.medium4,
                  fontSize: sizes.normalText,
                  color: colors.text.reverse,
                }}
              >
                {selectedStaff.name}에게 {payslipMonthOptions.find(opt => opt.value === selectedPayslipMonth)?.label} 급여명세서 생성 및 전송
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 달력 */}
        {selectedStaff && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.jamsil.regular3,
                  fontSize: sizes.normalText,
                  color: colors.text.primary,
                }}
              >
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
                  <Text
                    style={{
                      fontFamily: FONTS.jamsil.regular3,
                      fontSize: sizes.smallText,
                      color: colors.text.reverse,
                    }}
                  >
                    전체 해제
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Calendar
              current={currentMonth}
              onDayPress={handleDatePress}
              onMonthChange={handleMonthChange}
              markedDates={getMarkedDates()}
              firstDay={0}
              theme={{
                backgroundColor: "white",
                calendarBackground: "white",
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
        {selectedStaff && selectedDates.length > 0 && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <Text
              style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.normalText,
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              선택된 날짜
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{
                backgroundColor: colors.disable,
                borderRadius: 8,
                padding: 8,
              }}
            >
              {selectedDates.map((date) => (
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
                  <Text
                    style={{
                      fontFamily: FONTS.jamsil.regular3,
                      fontSize: sizes.smallText,
                      color: colors.text.reverse,
                    }}
                  >
                    {date} ✕
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* 스케줄 입력 및 저장 버튼 */}
        {selectedStaff && selectedDates.length > 0 && (
          <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
            <TouchableOpacity
              style={{
                backgroundColor: colors.accent,
                paddingVertical: 16,
                borderRadius: 10,
                alignItems: "center",
              }}
              onPress={() => setModalVisible(true)}
            >
              <Text
                style={{
                  fontFamily: FONTS.jamsil.medium4,
                  fontSize: sizes.normalText,
                  color: colors.text.reverse,
                }}
              >
                스케줄 시간 설정하기
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 선택된 직원의 기존 스케줄 목록 */}
        {selectedStaff && (
          <View style={{ marginHorizontal: 16, marginBottom: 100 }}>
            <Text
              style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.normalText,
                color: colors.text.primary,
                marginBottom: 12,
              }}
            >
              {selectedStaff.name}의 기존 스케줄
            </Text>

            {staffSchedules.length === 0 ? (
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: 10,
                  padding: 20,
                  alignItems: "center",
                  elevation: 2,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.jamsil.light2,
                    fontSize: sizes.normalText,
                    color: colors.text.secondary,
                  }}
                >
                  등록된 스케줄이 없습니다
                </Text>
              </View>
            ) : (
              <FlatList
                data={staffSchedules}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 10,
                      padding: 16,
                      marginBottom: 8,
                      elevation: 2,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: FONTS.jamsil.medium4,
                            fontSize: sizes.normalText,
                            color: colors.text.primary,
                            marginBottom: 4,
                          }}
                        >
                          {item.commuteDate}
                        </Text>
                        <Text
                          style={{
                            fontFamily: FONTS.jamsil.light2,
                            fontSize: sizes.smallText,
                            color: colors.text.secondary,
                          }}
                        >
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
                        <Text
                          style={{
                            fontFamily: FONTS.jamsil.regular3,
                            fontSize: sizes.smallText,
                            color: colors.text.reverse,
                          }}
                        >
                          삭제
                        </Text>
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
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 20,
              padding: 20,
              margin: 20,
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              width: "90%",
              maxHeight: "80%",
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  fontFamily: FONTS.jamsil.medium4,
                  fontSize: sizes.normalText,
                  color: colors.text.primary,
                  marginBottom: 20,
                  textAlign: "center",
                }}
              >
                {selectedStaff?.name}의 스케줄 설정
              </Text>

              <Text
                style={{
                  fontFamily: FONTS.jamsil.light2,
                  fontSize: sizes.smallText,
                  color: colors.text.secondary,
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                선택된 {selectedDates.length}일에 동일한 스케줄이 적용됩니다
              </Text>

              {/* 근무 시간 */}
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.jamsil.regular3,
                      fontSize: sizes.smallText,
                      color: colors.text.primary,
                      marginBottom: 8,
                    }}
                  >
                    시작 시간
                  </Text>
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
                  <Text
                    style={{
                      fontFamily: FONTS.jamsil.regular3,
                      fontSize: sizes.smallText,
                      color: colors.text.primary,
                      marginBottom: 8,
                    }}
                  >
                    종료 시간
                  </Text>
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
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.jamsil.regular3,
                      fontSize: sizes.smallText,
                      color: colors.text.primary,
                      marginBottom: 8,
                    }}
                  >
                    근무 시간
                  </Text>
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
                  <Text
                    style={{
                      fontFamily: FONTS.jamsil.regular3,
                      fontSize: sizes.smallText,
                      color: colors.text.primary,
                      marginBottom: 8,
                    }}
                  >
                    휴게 시간(분)
                  </Text>
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

              <View style={{ flexDirection: "row", gap: 10, marginBottom: 20 }}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: FONTS.jamsil.regular3,
                      fontSize: sizes.smallText,
                      color: colors.text.primary,
                      marginBottom: 8,
                    }}
                  >
                    연장 근무(시간)
                  </Text>
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
                  <Text
                    style={{
                      fontFamily: FONTS.jamsil.regular3,
                      fontSize: sizes.smallText,
                      color: colors.text.primary,
                      marginBottom: 8,
                    }}
                  >
                    야간 근무(시간)
                  </Text>
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
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.text.secondary,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.jamsil.regular3,
                      fontSize: sizes.normalText,
                      color: colors.text.reverse,
                    }}
                  >
                    취소
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: colors.main,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: "center",
                  }}
                  onPress={handleSaveSchedule}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.jamsil.regular3,
                      fontSize: sizes.normalText,
                      color: colors.text.reverse,
                    }}
                  >
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