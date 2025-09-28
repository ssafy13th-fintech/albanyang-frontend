import { ConditionEnum } from "@/app/attendance/EmployeeAttendanceInsertPage";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";

interface CardInfo {
  rest_time? : number,
  condition? : ConditionEnum,
  start_time?  : string,
  finish_time?  : string,
  name? : string,
  work_place? : string
}


export default function AttendanceCard ({
  rest_time = 10,
  condition = ConditionEnum.결근,
  start_time ="12:05",
  finish_time = "20:01",
  name = "정알바",
  work_place = "GS 편의점"
 } : CardInfo)
  {

    const router = useRouter();

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
            }}></View>
        <Text>{attendance_texts.get(condition)}</Text>
        </View>
        <Text></Text>
        <Text style = {{
            fontFamily : FONTS.jamsil.light2,
            color : colors.text.secondary
        }}>휴게 시간 : {rest_time}</Text>
        <Text style = {{fontSize : sizes.smallTitle}}>{start_time} ~ {finish_time}</Text>
        
      </View>
      <View style = {{justifyContent : "space-between"}}>
            <Text style={{  flexWrap : "wrap", textAlign : "right" }}>
            {work_place} 사업장{"\n"}
            {name} 근무자
          </Text>
        {/* <TouchableOpacity
        onPress={ () => {router.push({
          pathname :"/attendance/EmployeeAttendanceInsertPage",
          params : { prop_name : name, prop_restTime : rest_time,prop_condition : condition,
            prop_startTime :start_time, prop_finishTime : finish_time
          } 
        })}}

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
      </TouchableOpacity> */}
      </View>
      </View>
    </View>
  );
}




const attendance_states : Map<ConditionEnum, string> = new Map([
  [ ConditionEnum.결근 , "red"],
   [ConditionEnum.조퇴, "yellow"],
   [ConditionEnum.지각, "yellow"],
   [ConditionEnum.정상 ,"green"]
])

const attendance_texts : Map<ConditionEnum, string> = new Map([
  [ ConditionEnum.결근 , "결근"],
   [ConditionEnum.조퇴, "조퇴"],
   [ConditionEnum.지각, "지각"],
   [ConditionEnum.정상 ,"정상"]
])