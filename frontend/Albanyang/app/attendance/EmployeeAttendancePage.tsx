import SmallHeader from "@/components/header/SmallHeader";
import NavBar from "@/components/navBar/NavBar";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { CalendarProvider, WeekCalendar } from 'react-native-calendars';
import { Dropdown } from "react-native-element-dropdown";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";


type Type_AttendanceState = {
    state :string,
    color : string
}


const cards = [
  { id: '1', title: 'Item 1' },
  { id: '2', title: 'Item 2' },
  { id: '3', title: 'Item 3' },
  { id: '4', title: 'Item 4' },
];

function MyCard({ title }: { title: string }) {
    const rest_time = 10;
    const condition = "결근";
    const work_time = "12:05~20:03";
    const name = "정알바";
    const work_place ="GS편의점";

    return (
    <View style={{ 
     paddingVertical : 8,
     paddingHorizontal : 8,
     backgroundColor: "white",
     elevation : 6,
     shadowColor : colors.shadow,
     shadowRadius :10,
     borderRadius: 10,
     marginTop : 16,
     }}>
    <View style={{flexDirection : "row",
        justifyContent :"space-between",
    }}>
      <View>
        <View style = {{
            flexDirection : "row", justifyContent :"center", alignItems:"center",
            alignSelf :"flex-start"
        }}>
            <View style ={{backgroundColor : "red",
            borderRadius : 6, 
            width : 12, height : 12,
            marginRight : 8
            }}></View>
        <Text>{condition}</Text>
        </View>
        <Text></Text>
        <Text style = {{
            fontFamily : FONTS.jamsil.light2,
            color : colors.text.secondary
        }}>휴게 시간 : {rest_time}</Text>
        <Text style = {{fontSize : sizes.smallTitle}}>{work_time}</Text>
        
      </View>
      <View style = {{justifyContent : "space-between"}}>
        <Text>{work_place} 사업장 {name} 근무자</Text>
        <TouchableOpacity
        style = {{
            backgroundColor : colors.main,
            alignItems : "center",
            justifyContent : "center",
            width : 50,
            height : 50,
            borderRadius : 10,
            alignSelf :"flex-end"
        }}
        >
            <Text style ={{
                fontFamily : FONTS.jamsil.light2,
                color : colors.text.reverse,
            }}>수정</Text>
      </TouchableOpacity>
      </View>
      </View>
    </View>
  );
}




const attendance_states : Type_AttendanceState[] = [
    { state : "결근", color : "red"},
    { state : "지각", color : "yellow"},
    { state : "지각", color : "yellow"},
    { state : "정상", color :"green"}
]




export default function EmployeeAttendancePage(){

    const insets = useSafeAreaInsets();

    const [date, setDate] = useState("setDate");
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const d = new Date();
        return d.toISOString().slice(0, 10);
    });

        // 선택된 날짜를 마킹용으로 변환
    const marked = {
        [selectedDate]: { selected: true, selectedColor: colors.accent },
    };



    const [val_workplace, setWorkplace] = useState("");
    const [focus, setFocus] = useState(false);

    let data_dropdown_workplaces = [
    { label: "oo 사업장", value: "0" },
    { label: "xx 사업장", value: "1" },
    { label: "aa 사업장", value: "2" },
    { label: "bb 사업장", value: "3" },
    { label: "yy 사업장", value: "4" },
    { label: "zz 사업장", value: "5" },
    ];

    let year=0, month=0, day = 0

  // Provider에서 관리할 date (초기값을 'YYYY-MM-DD' 형식으로)
  const [providerDate, setProviderDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });
  
    return (
        <SafeAreaView style = {{flex:1}}>

        <SmallHeader
            headerText={"직원 근태 현황"}
            headerTextFont={FONTS.jamsil.regular3}
            headerTextSize={sizes.smallTitle}
            isAblaBack = {false}
        />

        <View style ={{flexDirection : "row", alignSelf : "center", marginBottom : 16}}>
            <Text style ={{fontFamily : FONTS.jamsil.regular3,
                fontSize : sizes.normalText
            }}>{year}년 {month}월  {day}일
            </Text>
        </View>
        
        <CalendarProvider
            date={providerDate} // 초기/현재 보여주는 날짜
            onDateChanged={(date, updateSource) => {
            // Provider가 날짜를 바꿀 때 실행됨 (예: 스크롤로 주 변경)
            setProviderDate(date);
            // 필요하면 selectedDate도 같이 변경
            setSelectedDate(date);
            }}
            style= {{
                //이거 설정 안해두면 이유를 모르겠는데 굉장한 마진이 생깁니다.
                display :"contents"
            }}
        >
         <WeekCalendar
          // current는 보이는 초기 날짜 설정(보통 provider와 동기화)
          current={providerDate}
          onDayPress={(day) => {
            console.log("day press !");
            setSelectedDate(day.dateString);
            // Provider의 날짜도 동기화하고 싶으면 setProviderDate(day.dateString);
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
        data={data_dropdown_workplaces}
        labelField="label"
        valueField="value"
        value={val_workplace}
        onChange={(item) => {
          setWorkplace(item);
        }}
        onFocus = {()=>{setFocus(true)}}
        onBlur = {()=>{setFocus(false)}}
        placeholder={"사업장 선택"}
        style={[
          { 
            borderColor : focus ? colors.accent : colors.main,
            borderWidth : focus ? 2 : 1,
            borderRadius : 10,
            backgroundColor : focus ? colors.disable : "transparent",
            marginTop : 16,
            paddingVertical : 8,
            paddingLeft : 8,
            marginHorizontal : insets.left + 8,
            alignContent :"center",
          }]
        }
        iconStyle = {{marginTop:8}}
        selectedTextStyle={{alignItems : "center"}}
        placeholderStyle={{ alignItems : "center"}}
        // 드롭다운 목록 스타일 (필요하면 커스터마이즈)

        />

        <FlatList
            data={cards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <MyCard title={item.title} />}
            
            style = {
                {
                    flex : 1,
                    marginTop : 8,
                    marginHorizontal : insets.left + 16
                }

            }
        />

        <NavBar
        role="alba"
        />
        </SafeAreaView>
    );
}