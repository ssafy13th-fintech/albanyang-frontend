import BottomActionButton from "@/components/buttons/BottomButton";
import SmallHeader from "@/components/header/SmallHeader";
import LabelTextInput from "@/components/textInput/LabelTextInput";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { useRouter } from "expo-router";
import { useState } from "react";
import { SafeAreaView, Text, TextInput, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { useSafeAreaInsets } from "react-native-safe-area-context";


export enum ConditionEnum{
    "정상" = 0,
    "지각" = 1,
    "조퇴" = 2,
    "결근" = 3
}

export const CONDITION_DATA = [
  { label: "정상", value: "0" },
  { label: "지각", value: "1" },
  { label: "조퇴", value: "2" },
  { label: "결근", value: "3" },
];



interface EmployeeAttendanceInsertProps {
    prop_name : string,
    prop_date : string,
    prop_restTime : string,
    prop_condition : ConditionEnum,
    prop_startTime : string,
    prop_finishTime : string,

}

export default function EmployeeAttendanceInsertPage({
    prop_condition,
    prop_date,
    prop_finishTime,
    prop_name,
    prop_restTime,
    prop_startTime
} : EmployeeAttendanceInsertProps){
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [name, setName] = useState(prop_name);
    const [date, setDate] = useState(prop_date)
    const [restTime , setRestTime] = useState(prop_restTime);
    const [condition, setCondition] = useState(prop_condition);
    const [focus1, setFocus1] =  useState(false);
    const [focus2, setFocus2] =  useState(false);
    const [startTime, setStartTime] = useState(prop_startTime);
    const [finishTime, setFinishTime] = useState(prop_finishTime);


    return (
        <SafeAreaView style = {{flex:1, marginHorizontal : insets.left +16}}>

        <SmallHeader
            headerText={"직원 근태 수정"}
            headerTextFont={FONTS.jamsil.regular3}
            headerTextSize={sizes.smallTitle}
            isAblaBack = {true}
            paddingTopLen={48}
        />
        <View style ={{gap:16}}>
        <LabelTextInput
        placeHolder="이름"
        titleText="근무자 명"
        onChangeText={(s)=>{setName(s)}}
        value={name}
        />
        <LabelTextInput
        placeHolder="근무 날짜 선택"
        titleText="근무 날짜"
        onChangeText={(s)=>{setDate(s)}}
        value={date}
        />

        <View>
        <Text style = {{
            fontFamily : FONTS.jamsil.thin1,
            fontSize : sizes.normalText,
            marginBottom : 8,
        }}>근무 시간</Text>
        <View style={{flexDirection :"row"}}>
            <TextInput
            value = {startTime}
            onChangeText={(v) => {setStartTime(v)}}
            style = {{
                        borderColor : focus1 ? colors.accent : colors.main,
                        borderRadius : 10,
                        borderWidth : focus1 ? 2 : 1,
                        paddingLeft : 16,
                        height : 40,
                        flex :1,
                }}
            />
            <Text style = {{ alignSelf:"center"}}> ~ </Text>
            <TextInput
                value = {finishTime}
                onChangeText={(v) => {setFinishTime(v)}}
                style = {{
                        borderColor : focus1 ? colors.accent : colors.main,
                        borderRadius : 10,
                        borderWidth : focus1 ? 2 : 1,
                        paddingLeft : 16,
                        height : 40,
                        flex : 1
                }}
            />
            </View>
        </View>

        <LabelTextInput
        placeHolder="정태승"
        titleText="휴게 시간"
        onChangeText={(s)=>{setRestTime(s)}}
        value={restTime}
        />
        
        <Text style ={{
            fontFamily : FONTS.jamsil.light2,
            fontSize : sizes.normalText
        }}>근태 상태</Text>
        <Dropdown
        data={CONDITION_DATA}
        labelField="label"
        valueField="value"
        value={condition}
        onChange={(item) => {
            setCondition(item.value);
        }}
        onFocus={()=>setFocus2(true)}
        onBlur={() => setFocus2(false)}
        placeholder="젠장"
        // styles.inputField을 그대로 사용하려면 styles를 외부에서 주입하거나
        // 아래처럼 스타일 배열로 기존 스타일을 적용합니다.
        style={[,
            { 
                borderColor : focus2 ? colors.accent : colors.main,
                borderWidth : focus2 ? 2 : 1,
                borderRadius : 10,
                paddingLeft : 16,
                paddingBottom : 8,
                alignContent :"center",
                height : 40,

            }]
        }
        iconStyle={{marginTop:8}}
        selectedTextStyle={{ paddingTop : 5,alignItems : "center"}}
        placeholderStyle={{ paddingTop : 5,alignItems : "center"}}
        // 드롭다운 목록 스타일 (필요하면 커스터마이즈)
        />
        
        <LabelTextInput
        placeHolder="정태승"
        titleText="근무 상태"
        onChangeText={(s)=>{setName(s)}}
        value={name}
        />
        </View>

        <View style={{flex:1}}/>


        <View style ={{marginBottom : insets.bottom + 16}}>
        <BottomActionButton
            label ="수정 완료"
            onPress={ () => {router.push("./attendance/EmployeeAttendancePage")}}
        ></BottomActionButton>
        </View>
        </SafeAreaView>
    
    )

}