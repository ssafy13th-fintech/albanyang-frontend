import { getStores } from "@/api/Stores";
import { getTimesheetsByDate } from "@/api/Timesheet";
import AttendanceCard from "@/components/cards/AttendanceCard";
import NavBar from "@/components/navBar/NavBar";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { GetOtherDate, GetTodayDate } from "@/modules/DateTime";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ConditionEnum } from "./EmployeeAttendanceInsertPage";
import Header from "@/components/header/Header";

interface CardItem {
  id: number;
  condition: ConditionEnum;
  name: string;
  work_place: string;
  work_start?: string | null;
  work_finish?: string | null;
}

interface DropBoxItemType {
  label: string;
  value: string; // storeId
}

export default function EmployeeAttendancePage() {
  const insets = useSafeAreaInsets();

  // 날짜 상태
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [providerDate, setProviderDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // state
  const [cards, setCards] = useState<CardItem[]>([]);
  const [workplaces, setWorkplaces] = useState<DropBoxItemType[]>([]);
  const [val_workplace, setWorkplace] = useState<string>(""); // 선택된 사업장 id
  const [focus, setFocus] = useState(false);

  // 마킹
  const marked = {
    [selectedDate]: { selected: true, selectedColor: colors.accent },
  };

  // 날짜 파싱
  const [year, month, day] = (() => {
    const parts = selectedDate.split('-');
    if (parts.length === 3) return [parts[0], parseInt(parts[1], 10), parseInt(parts[2], 10)];
    return ["0000", 0, 0];
  })();

  /**
   * 근태 데이터 로드 함수
   */
  const loadTimesheets = useCallback(async (storeId: number, date: string) => {
    try {
      const res = await getTimesheetsByDate(storeId, date);
      console.log("res 왔나?", res)
      const timesheets = res.data.timesheets ?? [];

      const newItems: CardItem[] = timesheets.map((item: any) => ({
        id: item.id,
        name: item.nickname ?? "unknown",
        work_place: workplaces.find(w => w.value === String(storeId))?.label ?? "미정",
        condition: item.status,
        work_start: item.arrivedAt,
        work_finish: item.leftAt,
      }));

      setCards(newItems);
    } catch (err) {
      console.error("근태 리스트 로드 실패:", err);
      setCards([]);
    }
  }, [workplaces]);

  /**
   * 사업장 목록 로드 함수
   */
 const loadStores = useCallback(async () => {
  try {
    const res = await getStores();
    const list_store = res.data.stores ?? [];
    const dropdownData: DropBoxItemType[] = list_store.map((s: any) => ({
      label: s.name,
      value: String(s.id),
    }));

    setWorkplaces(dropdownData);

    // 첫 번째 사업장 자동 선택만!
    if (dropdownData.length > 0) {
      const firstStoreId = dropdownData[0].value;
      setWorkplace(firstStoreId); // 여기서는 loadTimesheets 호출 ❌
    }
  } catch (err) {
    console.error("사업장 목록 로드 실패:", err);
  }
}, []);

  // 초기화
  useEffect(() => {
    loadStores();
  }, [loadStores]);

  // // 사업장 변경 시 근태 리스트 다시 로드
  // useEffect(() => {
  //   if (val_workplace) {
  //     const date = selectedDate === GetTodayDate()
  //       ? GetTodayDate()
  //       : GetOtherDate(selectedDate);
  //     loadTimesheets(Number(val_workplace), date);
  //   }
  // }, [val_workplace]);

  // // 날짜 변경 시 근태 리스트 다시 로드
  // useEffect(() => {
  //   if (val_workplace) {
  //     const date = selectedDate === GetTodayDate()
  //       ? GetTodayDate()
  //       : GetOtherDate(selectedDate);
  //     loadTimesheets(Number(val_workplace), date);
  //   }
  // }, [selectedDate]);



useEffect(() => {
  if (val_workplace) {
    const date = selectedDate === GetTodayDate()
      ? GetTodayDate()
      : GetOtherDate(selectedDate);
    loadTimesheets(Number(val_workplace), date);
  }
}, [val_workplace, selectedDate]);


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor : "white" }}>
      <Header headerText="직원 근태 현황"/>

      <View style={{ flexDirection: "row", alignSelf: "center", marginBottom: 16 }}>
        <Text style={{ fontFamily: FONTS.jamsil.regular3, fontSize: sizes.normalText + 2 }}>
          {year}년 {month}월 {day}일
        </Text>
      </View>

      <CalendarProvider
        date={providerDate}
        onDateChanged={(date) => {
          setProviderDate(date);
          setSelectedDate(date);
        }}
        style={{ display: "contents" }}
      >
        <WeekCalendar
          current={providerDate}
          onDayPress={(day) => {
            setSelectedDate(day.dateString);
            setProviderDate(day.dateString);
          }}
          markedDates={marked}
          hideDayNames={false}
          allowShadow={true}
          theme={{
            todayTextColor: "#ff6347",
            dayTextColor: "#222",
            monthTextColor: "#222",
            selectedDayBackgroundColor: colors.accent,
            selectedDayTextColor: colors.text.reverse,
          }}
          style={{ height: 50 }}
        />
      </CalendarProvider>

      <Dropdown
        data={workplaces}
        labelField="label"
        valueField="value"
        value={val_workplace}
        onChange={(item: DropBoxItemType) => {
          setWorkplace(item.value);
        }}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholder={"사업장 선택"}
        style={[
          {
            borderColor: focus ? colors.accent : colors.main,
            borderWidth: focus ? 2 : 1,
            borderRadius: 10,
            backgroundColor: focus ? colors.disable : "transparent",
            marginTop: 16,
            paddingVertical: 8,
            paddingLeft: 8,
            marginHorizontal: insets.left + 8,
            alignContent: "center",
          }
        ]}
        iconStyle={{ marginTop: 8 }}
        selectedTextStyle={{ alignItems: "center" }}
        placeholderStyle={{ alignItems: "center" }}
      />

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) =>
          <AttendanceCard
            condition={ConditionEnum[item.condition as keyof typeof ConditionEnum]}
            name={item.name}
            work_place={item.work_place}
            start_time={item.work_start ?? "-"}
            finish_time={item.work_finish ?? "-"}
          />
        }
        style={{
          flex: 1,
          marginTop: 8,
          marginHorizontal: insets.left + 16,
        }}
          // contentContainerStyle로 content가 남은 공간을 채우게 함
        contentContainerStyle={!cards ? ({
          flexGrow: 1,               // 중요: 비어있을 때도 컨테이너가 남은 영역을 채움
          justifyContent: 'center', // 수직 중앙 정렬
          paddingHorizontal: insets.left + 16, // 기존 marginHorizontal 대체 (선택)
        }) : {

        }}
        ListEmptyComponent={() => (
          <View style={{ flex: 1 ,alignItems: "center", justifyContent: "center", paddingTop: 30 }}>
            <Text
              style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.normalText,
                color: colors.accent,
              }}
            >
              오늘은 근무가 없습니다
            </Text>
          </View>
        )}
      />

      <NavBar role="sajang" />
    </SafeAreaView>
  );
}
