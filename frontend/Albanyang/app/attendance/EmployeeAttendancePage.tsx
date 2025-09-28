import { getStoreSchedules } from "@/api/Schedule";
import { getStores } from "@/api/Stores";
import { getTimesheetsByDate } from "@/api/Timesheet";
import SmallHeader from "@/components/header/SmallHeader";
import NavBar from "@/components/navBar/NavBar";
import AttendanceScroll from "@/components/scroll/AttendanceScroll";
import EmployerAttendanceSubPage, { CardItem } from "@/components/subpage/EmployerAttendanceSubPage";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { GetOtherDate, GetTodayDate } from "@/modules/DateTime";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";
import Modal from "react-native-modal"; // modal for schedule list
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ConditionEnum } from "./EmployeeAttendanceInsertPage";

interface DropBoxItemType {
  label: string;
  value: number; // storeId
}

export interface Schedule {
  id: number;
  commuteDate: string; // yyyy-mm-dd
  workStartTime: string;
  workEndTime: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightShiftHours: number;
  scheduleType: "NORMAL" | "SUBSTITUTE";
  editable: boolean;
  storeId: number;
  staffId: number;
  staffNickname: string;
}

export default function EmployeeAttendancePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [headerTitle, setHeaderTitle] = useState("직원 근태 관리");
  // 날짜 상태
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [providerDate, setProviderDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // state
  const [cards, setCards] = useState<CardItem[]>([]);
  const [workplaces, setWorkplaces] = useState<DropBoxItemType[]>([]);
  const [val_workplace, setWorkplace] = useState<number>(0); // 선택된 사업장 id
  const [focus, setFocus] = useState(false);

  // schedules
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [scheduleByDate, setScheduleByDate] = useState<Record<string, Schedule[]>>({});
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [thisMonth, setThisMonth] = useState<string>(() => new Date().toISOString().slice(0, 7)); // yyyy-mm

  const [activeTab, setActiveTab] = useState<number>(0);

  // modal for selected day
  const [modalVisible, setModalVisible] = useState(false);
  const [modalDate, setModalDate] = useState<string>("");

  // 날짜 파싱
  const [year, month, day] = (() => {
    const parts = selectedDate.split("-");
    if (parts.length === 3) return [parts[0], parseInt(parts[1], 10), parseInt(parts[2], 10)];
    return ["0000", 0, 0];
  })();

  /**
   * 근태 데이터 로드 함수
   */
  const loadTimesheets = useCallback(async (storeId: number, date: string) => {
    try {
      const res = await getTimesheetsByDate(storeId, date);
      console.log("res 왔나?", res);
      const timesheets = res.data.timesheets ?? [];

      const newItems: CardItem[] = timesheets.map((item: any) => ({
        id: item.id,
        name: item.nickname ?? "unknown",
        work_place: workplaces.find((w) => w.value === storeId)?.label ?? "미정",
        condition: ConditionEnum.정상, // 서버 condition 매핑 필요 시 수정
        work_start: item.arrivedAt,
        work_finish: item.leftAt,
      }));

      setCards(newItems);

      if (newItems.length === 0)
        setCards([
          {
            condition: ConditionEnum.정상,
            id: 1,
            name: "오뚜기",
            work_place: "메가커피 역삼대로",
            work_finish: "14:10",
            work_start: "09:03",
          },
        ]);
    } catch (err) {
      console.error("근태 리스트 로드 실패:", err);
      setCards([]);
    }
  }, [workplaces]);

  /**
   * 스케줄(한 달치) 로드 함수
   */
  const loadSchedules = useCallback(async (storeId?: number, month?: string) => {
    if (!storeId) return;
    try {
      console.log("스케쥴 로딩 :", storeId , month);
      const res = await getStoreSchedules(storeId, month);
      const list: Schedule[] = (res.data && res.data.schedules) ?? [];
      setSchedules(list);
      console.log("스케쥴 리스트 결과 ",list)

      // group by date yyyy-mm-dd
      const byDate: Record<string, Schedule[]> = {};
      list.forEach((s) => {
        const d = s.commuteDate;
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push(s);
      });
      setScheduleByDate(byDate);

      // build markedDates: if any schedule on a date -> show dot
      const newMarked: Record<string, any> = {};
      // keep currently selected date highlighted
      newMarked[selectedDate] = { selected: true, selectedColor: colors.accent };

      Object.keys(byDate).forEach((d) => {
        // if there is already a selected marker for this date keep selection
        if (d === selectedDate) return; // already set
        newMarked[d] = { marked: true, dotColor: colors.accent };
      });

      setMarkedDates(newMarked);
    } catch (err) {
      console.error("스케줄 로드 실패:", err);
      setSchedules([]);
      setScheduleByDate({});
      setMarkedDates({ [selectedDate]: { selected: true, selectedColor: colors.accent } });
    }
  }, [selectedDate]);

  /**
   * 사업장 목록 로드 함수
   */
  const loadStores = useCallback(async () => {
    try {
      const res = await getStores();
      const list_store = res.data.stores ?? [];
      const dropdownData: DropBoxItemType[] = list_store.map((s: any) => ({
        label: s.name,
        value: s.id,
      }));

      setWorkplaces(dropdownData);

      // 첫 번째 사업장 자동 선택만!
      if (dropdownData.length > 0) {
        const firstStoreId = dropdownData[0].value;
        setWorkplace(firstStoreId);
      }
    } catch (err) {
      console.error("사업장 목록 로드 실패:", err);
    }
  }, []);

  // 초기화
  useEffect(() => {
    loadStores();
  }, [loadStores]);

  // load when workplace or selectedDate changes
  useEffect(() => {
    if (val_workplace) {
      const date = selectedDate === GetTodayDate() ? GetTodayDate() : GetOtherDate(selectedDate);
      if (activeTab === 0) loadTimesheets(Number(val_workplace), date);
      else {
        // schedule tab -> load thisMonth's schedules
        loadSchedules(Number(val_workplace), thisMonth);
      }
    }
  }, [val_workplace, activeTab, thisMonth]);


  // load when workplace or selectedDate changes
  useEffect(() => {
    if (val_workplace &&   activeTab ===0) {
      const date = selectedDate === GetTodayDate() ? GetTodayDate() : GetOtherDate(selectedDate);
        loadTimesheets(Number(val_workplace), date);

    }
  }, [selectedDate]);



  // when activeTab switches to schedule tab, ensure schedules are loaded
  useEffect(() => {
    if (activeTab === 1 && val_workplace) {
      loadSchedules(Number(val_workplace), thisMonth);
    }
  }, [activeTab]);

  // handler when user changes calendar month
  const onMonthChange = (monthObj: { year: number; month: number; timestamp?: number; dateString?: string }) => {
    // monthObj.month is number 1..12 -> build yyyy-mm
    const mm = monthObj.month < 10 ? `0${monthObj.month}` : `${monthObj.month}`;
    const yyyy_mm = `${monthObj.year}-${mm}`;
    setThisMonth(yyyy_mm);
    if (val_workplace) loadSchedules(val_workplace, yyyy_mm);
  };

  const onDayPress = (dayObj: { dateString: string }) => {
    setSelectedDate(dayObj.dateString);
    setModalDate(dayObj.dateString);
    // open modal (even if no schedules, per requirement show "스케줄이 없습니다")
    setModalVisible(true);
  };

  const renderScheduleItem = ({ item }: { item: Schedule }) => {
    return (
      <TouchableOpacity>
      <View style={[styles.scheduleItem]}>
        <View style={{ flex: 1, gap :16 }}>
          <Text style={[styles.rowText,{height : 24}]}>{item.commuteDate} • {item.staffNickname}</Text>
          <Text style={styles.subText}>{item.scheduleType === 'NORMAL' ? '일반' : '대타'}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap :16 }}>
          <Text style={[styles.rowText,{height : 24}]}>{item.workStartTime} - {item.workEndTime}</Text>
          <Text style={styles.subText}>휴게: {item.breakTime}분 • 지점: {item.storeId}</Text>
        </View>
      </View>
      </TouchableOpacity>
    );
  };

  const schedulesForModal = useMemo(() => scheduleByDate[modalDate] ?? [], [scheduleByDate, modalDate]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <SmallHeader
        headerText={headerTitle}
        headerTextFont={FONTS.jamsil.regular3}
        headerTextSize={sizes.smallTitle}
        isAblaBack={false}
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

        <AttendanceScroll activeTab={activeTab} setActiveTab={setActiveTab} setHeaderTitle={setHeaderTitle} />

      </View>

      <View style={{ flexDirection: "row", alignSelf: "center", marginBottom: 16 }}>
        <Text style={{ fontFamily: FONTS.jamsil.regular3, fontSize: sizes.normalText + 2 }}>
          {year}년 {month}월 {day}일
        </Text>
      </View>

      {activeTab == 0 ? (
        <EmployerAttendanceSubPage
          cards={cards}
          focus={focus}
          markedDates={markedDates}
          selectedDate={selectedDate}
          providerDate={providerDate}
          setFocus={setFocus}
          setProviderDate={setProviderDate}
          setSelectedDate={setSelectedDate}
          setWorkplace={setWorkplace}
          workplaces={workplaces}
          val_workplace={val_workplace}
        />
      ) : (
        <View>
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
                marginHorizontal: 16,
                marginBottom: 16,
              },
            ]}
            iconStyle={{ alignSelf: "center" }}
            selectedTextStyle={{ alignItems: "center" }}
            placeholderStyle={{ alignItems: "center" }}
          />

          <Calendar
            style={{
              elevation: 3,
              shadowColor: colors.shadow,
              marginBottom: 16,
            }}
            markedDates={markedDates}
            onDayPress={onDayPress}
            onMonthChange={onMonthChange}
          />
        </View>
      )}

      <NavBar role="sajang" />

      {/* Modal for schedules */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        style={{ margin: 0 }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{modalDate} 스케줄</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>닫기</Text>
            </TouchableOpacity>
          </View>

          {schedulesForModal.length === 0 ? (
            <View style={{ padding: 20 }}>
              <Text>스케줄이 없습니다.</Text>
            </View>
          ) : (
            <FlatList
              data={schedulesForModal}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderScheduleItem}
              contentContainerStyle={{ paddingBottom: 60 }}
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: sizes.normalText,
    fontFamily :FONTS.jamsil.medium4
  },
  closeText: {
    color: colors.accent,
    fontWeight: '600',
  },
  scheduleItem: {
    flexDirection: 'row',
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowText: {
    fontSize: sizes.smallText,
    fontFamily : FONTS.jamsil.light2
  },
  subText: {
    fontSize: 12,
    color: '#666',
  },
});
