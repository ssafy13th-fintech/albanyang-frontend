import { getMyStores, MyStoresResponse } from "@/api/Staff";
import { getMyTimesheets, TimesheetItem } from "@/api/Timesheet";
import SmallHeader from "@/components/header/SmallHeader";
import AttendanceDetailModal from "@/components/modal/AttendanceDetailModal";
import NavBar from "@/components/navBar/NavBar";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { GetThisMonthDate, GetTodayDate } from "@/modules/DateTime";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import PayslipTabBar from "../payslip/common/components/PayslipTabBar";

// ====== 여기서 더미 데이터 생성 ======
const dummyTodayTimesheet: TimesheetItem = {
  id: 999,
  commuteDate: "2025-09-27",           // 오늘 날짜
  arrivedAt: "09:30",           // 출근 시간
  leftAt: "18:00",              // 퇴근 시간
  staffId: 123,
  nickname: "테스트 알바생",
};

      // 3) 이번 달 근무 현황 (더미 포함)
const dummyMonthTimesheets: TimesheetItem[] = [
  dummyTodayTimesheet,
  {
    id: 998,
    commuteDate: "2025-09-15",
    arrivedAt: "10:00",
    leftAt: "17:30",
    staffId: 123,
    nickname: "테스트 알바생",
  },
  {
    id: 997,
    commuteDate: "2025-09-18",
    arrivedAt: "09:45",
    leftAt: "18:15",
    staffId: 123,
    nickname: "테스트 알바생",
  },
];


// --- 캘린더 마킹 유틸 함수
function markTimesheetsOnCalendar(timesheets: TimesheetItem[]): Record<string, any> {
  const marks: Record<string, any> = {};
  timesheets.forEach((ts) => {
    marks[ts.commuteDate] = {
      marked: true,
      dotColor: colors.accent,
    };
  });
  return marks;
}

let Isinit = false;

export default function MyAttendancePage() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);

  // --- 지점 캐싱
  const [stores, setStores] = useState<MyStoresResponse["stores"]>([]);
  const [work_place_datas, setWorkPlaceDatas] = useState<string[]>([]);

  // --- 로딩 플래그
  const [loaded, setLoaded] = useState(false);

  // --- 오늘 날짜, 이번 달
  const [today] = useState<string>(GetTodayDate());
  const [thisMonth] = useState<string>(GetThisMonthDate());

  // --- 근태 데이터
  const [thisMonthTimeSheets, setThisMonthTimeSheets] = useState<TimesheetItem[]>([]);
  const [todayTimesheet, setTodayTimesheet] = useState<TimesheetItem | null>(null);

  // --- 캘린더 및 모달
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [selectedTimesheet, setSelectedTimesheet] = useState<TimesheetItem | null>(null);


  // ========== 최초 로딩 ==========
  useEffect(() => {
    const init = async () => {
      try {
        // 1) 지점 로딩
        const res = await getMyStores();
        const stores = res.data?.stores ?? [];
        setStores(stores);
        setWorkPlaceDatas(stores.map((s) => s.name));

        if (stores.length === 0) {
          setWorkPlaceDatas(["예시 지점1", "예시 지점2"]);
          setLoaded(true);
          return;
        }

        // 기본 지점(첫 번째) 기준
        const storeId = stores[0].id;

        // 2) 오늘 근무 현황
        const todayRes = await getMyTimesheets(storeId, { date: today });
        setTodayTimesheet(todayRes.data.timesheets[0] ?? null);

        // 3) 이번 달 근무 현황
        const monthRes = await getMyTimesheets(storeId, { month: thisMonth });
        const timesheets = monthRes.data.timesheets;
        setThisMonthTimeSheets(timesheets);

        // 4) 캘린더 마킹
        const marks: Record<string, any> =  markTimesheetsOnCalendar(timesheets)

        // timesheets.forEach((ts) => {
        //   marks[ts.commuteDate] = {
        //     marked: true,
        //     dotColor: colors.accent,
        //   };
        // });

        setMarkedDates(marks);
      // setTodayTimesheet(dummyTodayTimesheet);
      // setThisMonthTimeSheets(dummyMonthTimesheets);
      // setMarkedDates(markTimesheetsOnCalendar(dummyMonthTimesheets))
    Isinit = true;
      } catch (err) {
        console.warn("init error", err);

      setTodayTimesheet(dummyTodayTimesheet);
      setThisMonthTimeSheets(dummyMonthTimesheets);
      setMarkedDates(markTimesheetsOnCalendar(dummyMonthTimesheets))

      } finally {
        setLoaded(true);
      }
    };

    init();

  }, []);


// --- 탭 변경 시 근태 데이터 로딩
useEffect(() => {
  const loadTimesheetsForStore = async () => {
    if (!stores.length) return;

    const storeId = stores[activeTab].id;

    try {
      // 오늘 근태
      const todayRes = await getMyTimesheets(storeId, { date: today });
      setTodayTimesheet(todayRes.data.timesheets[0] ?? null);

      // 이번 달 근태
      const monthRes = await getMyTimesheets(storeId, { month: thisMonth });
      const timesheets = monthRes.data.timesheets;
      setThisMonthTimeSheets(timesheets);

      // 캘린더 마킹
      const marks: Record<string, any> = {};
      timesheets.forEach((ts) => {
        marks[ts.commuteDate] = {
          marked: true,
          dotColor: colors.main,
        };
      });

      //console.log("time sheeet" , timesheets)
      setMarkedDates(marks);
      //       setTodayTimesheet(dummyTodayTimesheet);
      // setThisMonthTimeSheets(dummyMonthTimesheets);
      // setMarkedDates(markTimesheetsOnCalendar(dummyMonthTimesheets))

    } catch (err) {
      console.warn("loadTimesheetsForStore error", err);
      // setTodayTimesheet(null);
      // setThisMonthTimeSheets([]);
      // setMarkedDates({});
      
      setTodayTimesheet(dummyTodayTimesheet);
      setThisMonthTimeSheets(dummyMonthTimesheets);
      setMarkedDates(markTimesheetsOnCalendar(dummyMonthTimesheets))
    }
  };

  if(!Isinit) {
    console.log("load not yet")
    return
  }
  loadTimesheetsForStore();
}, [activeTab, stores]); // activeTab이 바뀔 때마다 실행



  // ========== 날짜 클릭 ==========
  const onDayPress = async (day: { dateString: string }) => {
    const date = day.dateString;
    setSelectedDate(date);

    const found = thisMonthTimeSheets.find((ts) => ts.commuteDate === date) ?? null;
    setSelectedTimesheet(found);

    // 마킹 (선택 강조)
    const newMarked = {
      ...markedDates,
      [date]: {
        ...(markedDates[date] ?? {}),
        selected: true,
        selectedColor: colors.main,
      },
    };
    if (selectedDate && selectedDate !== date) {
      if (newMarked[selectedDate]) {
        delete newMarked[selectedDate].selected;
        delete newMarked[selectedDate].selectedColor;
      }
    }
    setMarkedDates(newMarked);

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

      {/* 지점 탭 */}
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

      {/* 오늘 근무 현황 */}
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
            marginBottom : 16,
            gap: 24,
          }}
        >

        {todayTimesheet ? (
        <View>
          <View>
            <Text style={{ fontFamily: FONTS.jamsil.light2 }}>From</Text>
            <Text
              style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.smallTitle,
                color: colors.text.reverse,
              }}
            >
              {todayTimesheet?.arrivedAt ?? "-"}
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
              {todayTimesheet?.leftAt ?? "-"}
            </Text>
          </View>
          </View>
        ) :(
          <View>
              <Text style = {{fontFamily :FONTS.jamsil.regular3, fontSize : sizes.normalText}}>오늘 근무는 없습니다</Text>
          </View>
        )}

        </View>
      </View>

      {/* 캘린더 */}
      <Calendar
        style={{
          elevation: 3,
          shadowColor: colors.shadow,
          marginBottom: 16,
        }}
        onDayPress={onDayPress}
        markedDates={markedDates}
        onMonthChange={async (month) => {
          console.log("month ", month, "activeTab ", activeTab )
          try {
            //if (!activeTab) return;

            const newMonth = `${month.year}-${String(month.month).padStart(2, "0")}`;
            console.log("선택된 지점:", activeTab, "새로운 month:", newMonth);

            // 새로운 달 근태 조회
            const res = await getMyTimesheets(stores[activeTab].id, { month: newMonth });
            const timesheets = res?.data?.timesheets ?? [];

            setThisMonthTimeSheets(timesheets);
            setMarkedDates(markTimesheetsOnCalendar(timesheets));
          } catch (err) {
            console.warn("onMonthChange error", err);
          }
        }}
      />

      <NavBar role="alba" />

      <AttendanceDetailModal
        modalVisible= {modalVisible}
        setModalVisible={setModalVisible}
        selectedDate={selectedDate!}
        activeTab={activeTab}
        selectedTimesheet={selectedTimesheet!}
        stores={stores}
      />

      
    </SafeAreaView>
  );
}
