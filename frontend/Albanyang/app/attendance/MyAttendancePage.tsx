import { getMyStores } from "@/api/Staff";
import { getMyTimesheets, TimesheetItem } from "@/api/Timesheet";
import SmallHeader from "@/components/header/SmallHeader";
import NavBar from "@/components/navBar/NavBar";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { GetThisMonthDate, GetTodayDate } from "@/modules/DateTime";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import PayslipTabBar from "../payslip/common/components/PayslipTabBar";

// --- (예시) 날짜로 근태 조회하는 함수: 실제 API로 대체하세요
async function getAttendanceByDate(dateYMD: string) {
  // TODO: 실제 API 호출로 교체
  // 예시 응답 형태:
  // { status: 'ok', data: { date: '2025-09-26', startTime: '09:00', endTime: '18:00', status: '출근' } }
  return new Promise((res) =>
    setTimeout(
      () =>
        res({
          status: "ok",
          data: {
            date: dateYMD,
            startTime: "09:00",
            endTime: "18:00",
            status: Math.random() > 0.5 ? "출근" : "결근", // 더미
          },
        }),
      300
    )
  );
}

export default function MyAttendancePage() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  const [work_place_datas, setWorkPlaceDatas] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  // --- 오늘 날짜, 선택된 날짜, 모달, 마킹, 선택 날짜의 근태 데이터
  const [today, setToday] = useState<string>(GetTodayDate());
  const [thisMonth , setThisMonth] = useState<string>(GetThisMonthDate());
  const [thisMonthTimeSheets, setThisMonthTimeSheets] = useState<TimesheetItem[]>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [attendanceForSelectedDate, setAttendanceForSelectedDate] = useState<any>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // --- 컴포넌트 마운트 시: 지점 목록 + 오늘 근태 조회
  useEffect(() => {
    const api_working_points = async () => {
      try {
        const res = await getMyStores();
        const stores = res.data?.stores ?? [];

        // 원래 코드에서 루프가 잘못되어 있어서 수정:
        const work_places: string[] = [];
        for (let i = 0; i < stores.length; ++i) {
          work_places.push(stores[i].name);
        }

        if (work_places.length < 1) {
          work_places.push("예시 지점1");
          work_places.push("예시 지점2");
        }

        setWorkPlaceDatas(work_places);

        // 오늘 근태 자동 조회
        await fetchAttendanceForDate(today);

        // (옵션) 이미 존재하는 근태들을 마킹하고 싶으면 여기에 markedDates 세팅
        // 예: 여러 날짜에 dots 표시하려면 아래처럼 설정할 수 있음
        // setMarkedDates({
        //   [today]: { marked: true, dotColor: 'green' },
        //   ['2025-09-20']: { marked: true, dotColor: 'red' }
        // });

      } catch (err) {
        console.warn("getMyStores error", err);
      } finally {
        setLoaded(true);
      }
    };
    api_working_points();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 처음 마운트 시 1회


    useEffect(()=>{
        const api_today_attendance = async()=>{
            const timesheets = (await getMyTimesheets(0, {month : GetThisMonthDate()})).data.timesheets
            console.log(GetThisMonthDate, "의 timesheets ",timesheets)
            setThisMonthTimeSheets(timesheets);
        }

        api_today_attendance();
    },[])




    
  // --- 특정 날짜 근태 조회 함수
  const fetchAttendanceForDate = async (dateYMD: string) => {
    setLoadingAttendance(true);
    try {
      const resp: any = await getAttendanceByDate(dateYMD); // 실제 구현으로 교체
      if (resp?.status === "ok") {
        setAttendanceForSelectedDate(resp.data);
      } else {
        setAttendanceForSelectedDate(null);
      }
    } catch (e) {
      console.warn("attendance fetch error", e);
      setAttendanceForSelectedDate(null);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // --- 캘린더 날짜 클릭 핸들러
  const onDayPress = async (day: { dateString: string }) => {
    const date = day.dateString; // YYYY-MM-DD
    setSelectedDate(date);

    // 마킹: 이전 마크 유지하면서 선택한 날짜 강조
    const newMarked = {
      ...markedDates,
      [date]: {
        ...(markedDates[date] ?? {}),
        selected: true,
        selectedColor: colors.main, // react-native-calendars는 custom color 사용 가능
      },
    };
    // 이전에 선택된 날짜의 selected를 해제
    if (selectedDate && selectedDate !== date) {
      if (newMarked[selectedDate]) {
        delete newMarked[selectedDate].selected;
        delete newMarked[selectedDate].selectedColor;
      }
    }
    setMarkedDates(newMarked);

    // 선택한 날짜의 근태 정보 불러오기
    await fetchAttendanceForDate(date);

    // 모달 오픈
    setModalVisible(true);
  };

  if (!loaded)
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <SmallHeader
        headerText="내 근태 현황"
        headerTextFont={FONTS.jamsil.regular3}
        headerTextSize={sizes.smallTitle}
        isAblaBack={false}
        paddingBottomLen={12}
      />

      <View
        style={{
          elevation: 1,
          shadowColor: colors.shadow,
          height: 50,
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <PayslipTabBar tabs={work_place_datas} activeTab={activeTab} onTabPress={setActiveTab} />
      </View>

      <View
        style={{
          marginHorizontal: insets.right + 16,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.jamsil.regular3,
            fontSize: sizes.normalText,
            marginBottom: 16,
          }}
        >
          오늘 근무 현황 ({today})
        </Text>

        <View
          style={{
            paddingVertical: 24,
            paddingHorizontal: 56,
            backgroundColor: colors.main,
            borderRadius: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <View>
            <Text style={{ fontFamily: FONTS.jamsil.light2 }}>From</Text>
            <Text
              style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.smallTitle,
                color: colors.text.reverse,
              }}
            >
              am 11:50
            </Text>
          </View>
          <Image source={require("@/assets/images/icon/icon_next.png")} style={{ height: 18, width: 12 }} />
          <View>
            <Text style={{ fontFamily: FONTS.jamsil.light2 }}>To</Text>
            <Text
              style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.smallTitle,
                color: colors.text.reverse,
              }}
            >
              am 11:50
            </Text>
          </View>
        </View>
      </View>

      <Calendar
        style={{
          elevation: 3,
          shadowColor: colors.shadow,
          marginBottom: 16,
        }}
        onDayPress={onDayPress}
        markedDates={markedDates}
        // markingType="multi-dot" // 필요에 따라 마킹 타입 변경 가능
      />

      <NavBar role="alba" />

      {/* =========== Modal (간단한 예시) =========== */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "white", borderRadius: 12, padding: 16 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>선택한 날짜: {selectedDate}</Text>

            {loadingAttendance ? (
              <ActivityIndicator />
            ) : attendanceForSelectedDate ? (
              <View>
                <Text>상태: {attendanceForSelectedDate.status}</Text>
                <Text>출근: {attendanceForSelectedDate.startTime}</Text>
                <Text>퇴근: {attendanceForSelectedDate.endTime}</Text>
              </View>
            ) : (
              <Text>해당 날짜의 근태 정보가 없습니다.</Text>
            )}

            <TouchableOpacity
              style={{ marginTop: 12, alignSelf: "flex-end" }}
              onPress={() => {
                setModalVisible(false);
              }}
            >
              <Text style={{ color: colors.main }}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
