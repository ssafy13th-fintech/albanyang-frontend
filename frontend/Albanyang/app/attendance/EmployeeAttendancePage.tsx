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



interface CardInfo {
  rest_time? : number,
  condition? : string,
  work_time?  : string,
  name? : string,
  work_place? : string
}


function MyCard({
  rest_time = 10,
  condition = "결근",
  work_time ="12:05~20:01",
  name = "정알바",
  work_place = "GS 편의점"
 } : CardInfo) {

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
            <View style ={{
              backgroundColor : attendance_states.get(condition) ,
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




const attendance_states : Map<string, string> = new Map([
  [ "결근" , "red"],
   ["지각" ,"yellow"],
   ["정상" , "green"]
])


const cards = [
  { id: '1', condition: '결근', name : "정태승", work_place : "GS" },
  { id: '2', condition: '정상', name : "김철수", work_place : "GS" },
  { id: '3', contidion: '정상', name : "김싸피", work_place : "CU" },
  { id: '4', condition: '지각', name : "이싸피", work_place : "CU" },
];



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
    { label: "oo 사업장", value: "oo 사업장" },
    { label: "xx 사업장", value: "xx 사업장" },
    { label: "aa 사업장", value: "aa 사업장" },
    { label: "bb 사업장", value: "bb 사업장" },
    { label: "yy 사업장", value: "yy 사업장" },
    { label: "zz 사업장", value: "zz 사업장" },
    ];

    let year="0000", month=0, day = 0

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
                fontSize : sizes.normalText + 2
            }}>{year}년 {month}월 {day}일
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
        />

        <FlatList
            data={cards}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => 
            <MyCard 
            condition = {item.condition}
            name={item.name} 
            work_place={item.work_place}
            />}
            
            style = {
                {
                    flex : 1,
                    marginTop : 8,
                    marginHorizontal : insets.left + 16
                }

            }
        />

        <NavBar
        role="sajang"
        />
        </SafeAreaView>
    );
}