import { getMe, updateMember, UpdateMemberRequest } from "@/api/member";
import BottomActionButton from "@/components/buttons/BottomButton";
import AgeDropdown from "@/components/dropdown/AgeDropDownByElement";
import SmallHeader from "@/components/header/SmallHeader";
import LabelTextInput from "@/components/textInput/LabelTextInput";
import PhoneNumInput from "@/components/textInput/PhoneNumInput";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useMemberStore } from "@/store/useMemberStore";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export const DATA = {
  TEENS: 10,
  TWENTIES: 20,
  THIRTIES: 30,
  FORTIES: 40,
  FIFTIES: 50,
  SISTIES: 60,
} as const;
type AgeKey = keyof typeof DATA; // "TEENS" | "TWENTIES" | ...


export default function MyInfoInsertion() {
    const insets = useSafeAreaInsets();
    const memberStore  = useMemberStore();
    const myInfo = memberStore.memberForm;
      // useEffect(() => {
      //   const fetchUser = async () => {
      //     try {
      //       const res = await getMe();
      //       memberStore.setForm({name :res.data.name, account : res.data.account,
      //         age : res.data.age, email : res.data.email, gender : res.data.gender, phone : res.data.phone
      //       })
      //     } catch (error) {
      //       console.error("getMe 실패:", error);
      //       // 인증 실패 시 로그인 페이지로 이
      //     }
      //   };

      //   fetchUser();
      // }, []);
  
    console.log(myInfo.age)
    const [name, setName] = useState(myInfo.name);
    let ageKey: AgeKey | undefined = myInfo.age as AgeKey | undefined;
    const initialAgeNumber = ageKey ? DATA[ageKey] : DATA.TEENS;
    const [ageIdx, setAgeIdx] = useState<number>(initialAgeNumber);
    const [phoneFirstNum, setPhoneFirstNum] = useState(myInfo.phone.substring(0,3));
    const [phoneLastNum, setPhoneLastNum] = useState(myInfo.phone.substring(3, myInfo.phone.length));
    //  female : 1, male : 2
    const [gender, setGender] = useState<number|null>(myInfo.gender=== "FEMALE" ? 1 : 2);

    const router = useRouter();

    return (
        <SafeAreaView style = {[styles.rootContainer, {paddingHorizontal : insets.left + 16}]}>
         
         <SmallHeader
            headerTextFont={FONTS.jamsil.regular3}
            headerTextSize={sizes.smallTitle}
            headerText = {"내 정보 수정"}
            paddingTopLen={32}
            paddingBottomLen={32}
         />

        <View style = {{gap :24, marginTop :24}}>
          <LabelTextInput
              titleText="사용자 명"
              value = {name}
              onChangeText={(s) => setName(s)}
          />

         <View>
          <Text style ={{
            fontFamily : FONTS.jamsil.light2,
            fontSize : sizes.normalText,
            marginBottom : 8
          }}>
            전화번호
          </Text>

        <PhoneNumInput
          phoneFirstNum={phoneFirstNum}
          phoneLastNum={phoneLastNum}
          onChangePhoneFirstNum={(v) => {setPhoneFirstNum(v)}}
          onChangePhonLastNum={(v) => {setPhoneLastNum(v)}}
          dropdownContainerStyle = {styles.inputField}
        /> 
        </View>


        <View>
          <Text style ={{
            fontFamily : FONTS.jamsil.light2,
            fontSize : sizes.normalText,
            marginBottom : 8
          }}>
            나이대
          </Text>
          <AgeDropdown
            containerStyle = {styles.inputField}
            value = {ageIdx}
            onChange={(v) =>  {setAgeIdx(v)}}
            placeholder="나잇대를 선택하세요"
          />
        </View>

        <View>
              <Text style ={{
                fontFamily : FONTS.jamsil.light2,
                fontSize : sizes.normalText,
                marginBottom : 8
              }}>
                성별
              </Text>
              <View style ={{flexDirection : "row"}}>
              <TouchableOpacity
                onPress={() => setGender(2)}
                style ={[styles.doubleButton, 
                  {
                    borderRightWidth : 0.5,
                    borderTopLeftRadius : 10,
                    justifyContent : "center",
                    borderBottomLeftRadius : 10,
                    backgroundColor : gender === 2 ? colors.main : "transparent"
                }]}
              ><Text style ={{
                fontSize : sizes.normalText,
                    color : gender === 2 ? colors.text.reverse : colors.text.primary
                }}>남</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setGender(1)}
                style ={[styles.doubleButton, {
                    borderLeftWidth : 0.5,
                    borderTopRightRadius : 10,
                    justifyContent : "center",
                    borderBottomRightRadius : 10,
                    backgroundColor : gender === 1 ? colors.main : "transparent"
                }]}
              ><Text style ={{
                fontSize : sizes.normalText,
                 color : gender === 1 ? colors.text.reverse : colors.text.primary
                }}>여</Text>
              </TouchableOpacity>
              </View>
            </View>
        </View>

          <View style ={{flex : 1}}/>
          <View style = {[styles.footerContainer, {marginBottom : insets.bottom + 10}]}>
              <BottomActionButton
                label ="수정하기"
                onPress = {async () => {
                  // 요청 바디 타입들
                // export interface UpdateMemberRequest {
                //   name?: string;
                //   phone?: string;
                //   gender?: number;
                //   age?: number;
                // }
                try{
                  const req : UpdateMemberRequest = {
                    name : name,
                    phone : phoneFirstNum+phoneLastNum,
                    gender : gender!,
                    age : ageIdx
                  }
                  console.log("req  : ", req)
                  await updateMember(req);
                  
                  const myInfo = await getMe();
                  
                  memberStore.setForm({
                    name : myInfo.data.name,
                    phone : myInfo.data.phone,
                    gender : myInfo.data.gender,
                    age : myInfo.data.age
                  });
                  alert("회원 정보 수정에 성공 했습니다.")



                  router.push("/myPage/MyPage")
                }catch(e){
                  alert(e);
                }
                }}
              />
          </View>
        </SafeAreaView>


    );
}

const styles = StyleSheet.create({
  rootContainer : {
    flex : 1
  },
  headerContainer :{
    flexDirection:"row",
    justifyContent : "center",
    alignItems : "center",
    gap : 120
  },

  inputField : {
      paddingLeft : 16,
      borderWidth : 1,
      borderRadius : 10,
      paddingBottom : 10,
      borderColor : colors.main,
      height : 40
  },
  doubleButton : {
      flex:1, 
      borderWidth : 1,
      borderColor : colors.main,
      paddingLeft : 16,
      paddingBottom : 5,
      height :40
  },
  footerContainer : {
    alignItems :"center",
    justifyContent :"center",
    gap : 12,
    marginBottom : 0,
  },

  footerbutton :{
      backgroundColor : colors.main,
      justifyContent : "center",
      alignItems : "center",
      height : 40,
      borderRadius : 20,
      paddingHorizontal : 16,
      alignSelf :"stretch",
      fontSize : sizes.normalText
    },    

});