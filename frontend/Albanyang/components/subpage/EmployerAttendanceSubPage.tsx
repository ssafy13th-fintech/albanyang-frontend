import { ConditionEnum } from "@/app/attendance/EmployeeAttendanceInsertPage";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { FlatList, Text, View } from "react-native";
import { CalendarProvider, WeekCalendar } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AttendanceCard from "../cards/AttendanceCard";

export interface CardItem {
  id: number;
  condition: ConditionEnum
  name: string;
  work_place: string;
  work_start?: string | null;
  work_finish?: string | null;
}

export interface DropBoxItemType {
  label: string;
  value: number;
}

interface EmployeeAttendanceSubPageProps {
  providerDate: string;
  selectedDate: string;
  markedDates: Record<string, any>;
  workplaces: DropBoxItemType[];
  val_workplace: number;
  focus: boolean;
  setFocus: (val: boolean) => void;
  setWorkplace: (val: number) => void;
  cards: CardItem[];
  setSelectedDate: (date: string) => void;
  setProviderDate: (date: string) => void;
}

export default function EmployerAttendanceSubPage(props: EmployeeAttendanceSubPageProps) {
  const {
    providerDate,
    selectedDate,
    markedDates,
    workplaces,
    val_workplace,
    focus,
    setFocus,
    setWorkplace,
    cards,
    setSelectedDate,
    setProviderDate
  } = props;

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
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
          markedDates={markedDates}
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
        onChange={(item: DropBoxItemType) => setWorkplace(item.value)}
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
            marginHorizontal : 16
          }
        ]}
        iconStyle={{alignSelf : "center" }}
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
          <View style={{ alignItems: "center", alignSelf : "center", marginTop : 48 }}>
            <Text
              style={{
                fontFamily: FONTS.jamsil.regular3,
                fontSize: sizes.normalText,
                color: colors.disable,
              }}
            >
              오늘은 근무가 없습니다
            </Text>
          </View>
        )}
      />
    </View>
  );
}
