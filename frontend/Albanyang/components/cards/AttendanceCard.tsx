import { ConditionEnum } from "@/app/attendance/EmployeeAttendanceInsertPage";
import { colors } from "@/constants/colors/ColorTheme";
import { Text, View } from "react-native";

interface CardInfo {
  condition? : ConditionEnum,
  start_time?  : string,
  finish_time?  : string,
  name? : string,
  work_place? : string
}


// 시간 문자열을 "HH:MM:SS.sss" -> "HH:MM"으로 변환
const formatTime = (time: string) => {
  if (time == '-') return "-"; // null/undefined 대비
  const [hour, minute] = time.split(":"); // ":" 기준으로 나눔
  return `${hour}시 ${minute}분`;
};


export default function AttendanceCard ({
  condition = ConditionEnum.예정,
  start_time ="12:05",
  finish_time = "20:01",
  name = "정알바",
  work_place = "GS 편의점"
 } : CardInfo)
  {
    return (
    <View style={{ 
     paddingVertical : 16,
     paddingHorizontal : 16,
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
            backgroundColor : attendance_states.get(condition),
            borderRadius : 6, 
            width : 12, height : 12,
            marginRight : 8
            }}/>
        <Text>{attendance_texts.get(condition)}</Text>
        </View>
        <Text></Text>
        <Text style = {{fontSize : 22}}>{formatTime(start_time)} ~ {formatTime(finish_time)}</Text>
        
      </View>
      <View style = {{justifyContent : "space-between"}}>
            <Text style={{  flexWrap : "wrap", textAlign : "right" }}>
            {work_place} 사업장{"\n"}
            {name} 근무자
          </Text>
      </View>
      </View>
    </View>
  );
}




const attendance_states : Map<ConditionEnum, string> = new Map([
  [ConditionEnum.결근, "red"],
  [ConditionEnum.조퇴, "yellow"],
  [ConditionEnum.지각, "yellow"],
  [ConditionEnum.정상,"green"],
  [ConditionEnum.예정, "pink"],
])

const attendance_texts : Map<ConditionEnum, string> = new Map([
   [ConditionEnum.결근, "결근"],
   [ConditionEnum.조퇴, "조퇴"],
   [ConditionEnum.지각, "지각"],
   [ConditionEnum.정상, "정상"],
   [ConditionEnum.예정, "예정"],
])