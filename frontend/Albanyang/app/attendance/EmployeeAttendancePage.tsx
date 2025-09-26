import { getStores } from "@/api/Stores";
import { getTimesheetsByDate } from "@/api/TimeSheet";
import AttendanceCard from "@/components/cards/AttendanceCard";
import SmallHeader from "@/components/header/SmallHeader";
import NavBar from "@/components/navBar/NavBar";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { GetTodayDate } from "@/modules/DateTime";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ConditionEnum } from "./EmployeeAttendanceInsertPage";

interface CardItem {
  id: number;
  condition: ConditionEnum;
  name: string;
  work_place: string;
  work_start?: string | null;
  work_finish?: string | null;
}

interface DropBoxItemType{
  label: string;
  value: string;
}

const initialCards: CardItem[] = [
  { id: 1, condition: ConditionEnum.결근, name: "정태승", work_place: "GS", work_start: "12:00", work_finish: "17:05" },
  { id: 2, condition: ConditionEnum.정상, name: "김철수", work_place: "GS", work_start: "11:08", work_finish: "17:03" },
  { id: 3, condition: ConditionEnum.조퇴, name: "김싸피", work_place: "CU", work_start: "10:08", work_finish: "17:03" },
  { id: 4, condition: ConditionEnum.지각, name: "이싸피", work_place: "CU", work_start: "10:05", work_finish: "17:06" },
];

export default function EmployeeAttendancePage(){
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // 날짜 상태
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [providerDate, setProviderDate] = useState<string>(() => new Date().toISOString().slice(0,10));

  // cards와 workplaces는 state로 관리
  const [cards, setCards] = useState<CardItem[]>(initialCards);
  const [workplaces, setWorkplaces] = useState<DropBoxItemType[]>([]);
  const [val_workplace, setWorkplace] = useState<string>(""); // 선택된 value
  const [focus, setFocus] = useState(false);

  // 마킹
  const marked = {
    [selectedDate]: { selected: true, selectedColor: colors.accent },
  };

  // selectedDate로 year/month/day 파싱 (화면용)
  const [year, month, day] = (() => {
    const parts = selectedDate.split('-'); // YYYY-MM-DD
    if (parts.length === 3) return [parts[0], parseInt(parts[1],10), parseInt(parts[2],10)];
    return ["0000", 0, 0];
  })();

  // 타임시트 로드 (selectedDate 기준으로 불러오려면 selectedDate를 deps에 넣으세요)
  useEffect(() => {
    const initialize = async () =>{
      try {
        const today = GetTodayDate(); // GetTodayDate() 가 YYYY-MM-DD 반환한다고 가정
        const res = await getTimesheetsByDate(1, today); // 한 번만 await
        const todayTimeSheet = res.data.timesheets ?? [];

        // 서버 데이터에서 CardItem으로 매핑 (arrivedAt -> start, leftAt -> finish 가 일반적)
        const newItems: CardItem[] = todayTimeSheet.map((item: any) => ({
          id: item.id,
          name: item.nickname ?? "unknown",
          work_place: item.storeName ?? "미정",
          condition: ConditionEnum.정상, // 서버에 condition 정보가 있다면 적절히 매핑
          work_start: item.arrivedAt ?? null,
          work_finish: item.leftAt ?? null,
        }));

        // 상태에 추가 (기존 initialCards + newItems 등으로 합치기)
        // 필요하면 덮어쓰거나 필터링하세요
        setCards((prev) => {
          // 중복 방지: 같은 id가 있으면 교체
          const map = new Map<number, CardItem>();
          prev.forEach(p => map.set(p.id, p));
          newItems.forEach(n => map.set(n.id, n));
          return Array.from(map.values());
        });
      } catch (err) {
        console.error("타임시트 로드 실패:", err);
      }
    };
    initialize();
  }, []); // 날짜 변경시 다시 불러오려면 [selectedDate]로 변경

  // 사업장 목록 로드
  useEffect(() => {
    const initialize = async() => {
      try {
        const res = await getStores();
        const list_store = res.data.stores ?? [];
        const dropdownData: DropBoxItemType[] = list_store.map((s: any) => ({ label: s.name, value: String(s.id) }));
        setWorkplaces(dropdownData);
      } catch (err) {
        console.error("사업장 목록 로드 실패:", err);
      }
    }
    initialize();
  }, []);

  return (
    <SafeAreaView style={{flex:1}}>
      <SmallHeader
        headerText={"직원 근태 현황"}
        headerTextFont={FONTS.jamsil.regular3}
        headerTextSize={sizes.smallTitle}
        isAblaBack={false}
      />

      <View style={{flexDirection:"row", alignSelf:"center", marginBottom:16}}>
        <Text style={{fontFamily:FONTS.jamsil.regular3, fontSize: sizes.normalText + 2}}>
          {year}년 {month}월 {day}일
        </Text>
      </View>

      <CalendarProvider
        date={providerDate}
        onDateChanged={(date, updateSource) => {
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
          setWorkplace(item.value); // item 전체가 아니라 value만 저장
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
            condition={item.condition}
            name={item.name}
            work_place={item.work_place}
            start_time={item.work_start ?? "-"}
            finish_time={item.work_finish ?? "-"}
          />
        }
        style={{
          flex: 1,
          marginTop: 8,
          marginHorizontal: insets.left + 16
        }}
      />

      <NavBar role="sajang" />
    </SafeAreaView>
  );
}
