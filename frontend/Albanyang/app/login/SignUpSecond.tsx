import BottomActionButton from "@/components/buttons/BottomButton";
import AgeDropdown from "@/components/dropdown/AgeDropDownByElement";
import PhoneNumDropdown from "@/components/dropdown/PhoneNumDropDown";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useSignUpStore } from "@/store/useSignUpStore";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';




export default function Signup() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const signUpStore = useSignUpStore();


    const [name, setName] = useState(signUpStore.registerForm.name ?? "");
    const [age, setAge] = useState(signUpStore.registerForm.age ?? null);
    const [frontPhoneNum, setFrontPhoneNum] = useState("010");
    const [phoneNum, setPhoneNum] = useState("");
    //  female : 1, male : 2
    const [gender, setGender] = useState<number|null>(signUpStore.registerForm.gender ?? null);
    // employee : 1 , employer : 2, admin : 100
    const [isAlba, setIsAlba] = useState<number|null>(signUpStore.registerForm.role ?? null);

    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
      setIsDisabled(!(name && age && frontPhoneNum && phoneNum && gender && isAlba));
    },[name, age, frontPhoneNum, phoneNum, gender, isAlba])


    return (

        <SafeAreaView style = {styles.rootContainer}>
          <View style={[{ paddingHorizontal: insets.left ?? 16 }]}>
            <View style = {[{marginTop : insets.top + 8, marginBottom : 24}]}>
              <Pressable
              onPress={() => {
                router.back();

              }}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <Image 
              source = {require("@/assets/images/icon/icon_back.png")}
              style = {styles.icon}/>
              </Pressable>
              <View style ={[styles.headerContainer]}>
                  <Text style ={styles.headerText}>회원가입</Text>
                  <Image
                      source={require("@/assets/images/mascot/mascot_hootface_alba.png")}
                      style={styles.mascot}
                  />
              </View>
            </View>

              
            <View style = {styles.InputContainer}>
                <View style = { styles.smallInputContainer}>
                    <Text style = {styles.smallInputText}>이름</Text>
                     <TextInput
                      style={[styles.inputField]}
                      placeholder="이름"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="none" // 첫 글자 자동 대문자 방지
                      />
                </View>

                <View style = {styles.smallInputContainer}>
                    <Text style = {styles.smallInputText}>나이대</Text>
                      <AgeDropdown
                      value={age}
                      onChange={(v) => setAge(v)}
                      containerStyle={styles.inputField}
                      placeholder="나이대를 선택하세요"
                    />
                </View>

                  <View style = {styles.smallInputContainer}>
                    <Text style = {styles.smallInputText}>전화번호</Text>
                    <View style = {styles.rowDirectionInput}>
                      <PhoneNumDropdown
                      containerStyle={[styles.inputField,{flex:0.3}]}
                      value={frontPhoneNum}
                      onChange={(v) => {setFrontPhoneNum(v)}}
                      placeholder="010"
                      />
                      <TextInput
                      keyboardType="numeric"
                      style={[styles.inputField, {flex : 0.7}]}
                      placeholder="전화번호"
                      value={phoneNum}
                      onChangeText={setPhoneNum}
                      autoCapitalize="none" // 첫 글자 자동 대문자 방지
                      />
                      </View>
                  </View>

                <View style = {styles.smallInputContainer}>
                    <Text style = {styles.smallInputText}>성별</Text>
                    <View style ={styles.rowDirectionNoGapInput}>

                    <Pressable 
                      onPress = {() => {setGender(2)}}
                      style ={({pressed}) => [styles.choicebutton,styles.leftbutton,
                      {backgroundColor : gender === 2 ? colors.main : "transparent"}]}> 
                      <Text style={{
                        fontSize : sizes.normalText,
                        color : gender === 2 ? colors.text.reverse : colors.text.primary
                      }}>남</Text></Pressable>

                      <Pressable 
                      onPress = {() => {setGender(1)}}
                      style ={({pressed}) =>[styles.choicebutton, styles.rightbutton,
                      {backgroundColor : gender === 1 ? colors.main : "transparent"}]}> 
                      <Text style={{
                        fontSize : sizes.normalText,
                        color : gender === 1 ? colors.text.reverse : colors.text.primary
                        }}>여</Text></Pressable>
                    
                    </View> 
                </View>

                <View style = {styles.smallInputContainer}>
                    <Text style = {styles.smallInputText}>알바생/사장님</Text>
                                      <View style ={styles.rowDirectionNoGapInput}>

                    <Pressable 
                      onPress = {() => {setIsAlba(1)}}
                      style ={({pressed}) => [styles.choicebutton,styles.leftbutton,
                      {backgroundColor : isAlba === 1 ? colors.main : "transparent"}]}> 
                      <Text style={{
                        fontSize : sizes.normalText,
                        color : isAlba === 1 ? colors.text.reverse : colors.text.primary
                      }}>알바생</Text></Pressable>

                      <Pressable 
                      onPress = {() => {setIsAlba(2)}}
                      style ={({pressed}) =>[styles.choicebutton, styles.rightbutton,
                      {backgroundColor : isAlba === 2 ? colors.main : "transparent"}
                      ]}> 
                      <Text style={{
                        fontSize : sizes.normalText,
                        color : isAlba === 2 ? colors.text.reverse : colors.text.primary
                      }}>사장님 </Text></Pressable>

                    </View>
                </View>
            </View>


          <View style ={{flex : 1}}/>
          <View style = {[styles.footerContainer, {marginBottom : insets.bottom + 10}]}>
            <View style ={styles.indicator}>
              <View style={[styles.indicatorUnit]}></View>
              <View style={[styles.indicatorUnit, {backgroundColor : colors.accent}]}></View>
              <View style={styles.indicatorUnit}></View>
            </View>
              <BottomActionButton
                label ="다음으로"
                // onPress = {() => {
                //   console.log(frontPhoneNum)
                //   signUpStore.setForm({age : age,  gender:gender!, phone:frontPhoneNum+phoneNum, role:isAlba!, name:name})
                //   router.push("/login/SignUpThird")
                // }}
                // disabled = {isDisabled}
                onPress = {() => {
                  console.log("버튼 클릭됨");
                  console.log("데이터:", {age, gender, isAlba, name, phone: frontPhoneNum+phoneNum});
                  
                  try {
                    signUpStore.setForm({
                      age: age, 
                      gender: gender!, 
                      phone: frontPhoneNum+phoneNum, 
                      role: isAlba!, 
                      name: name
                    });
                    
                    console.log("store 저장 완료");
                    
                    router.push("login/SignUpThird");
                    console.log("라우터 이동 시도");
                  } catch (error) {
                    
                  }
                }}
              />
          </View>
          </View>

        </SafeAreaView>


    );
}

const styles = StyleSheet.create({
  rootContainer : {
    alignItems :"center",
    flex : 1
  },
  section :{
    width: '100%'
  },
  headerContainer :{
    flexDirection:"row",
    justifyContent : "center",
    alignItems : "center",
    gap : 120
  },
  headerText :{
    fontFamily : FONTS.jamsil.regular3,
    fontSize : sizes.middleTitle
  },
  icon : {
    width : 24,
    height : 24
  },
  mascot : {
    width :80,
    height : 80
  },
  InputContainer : {
    gap : 16
  },
  smallInputContainer : {
    gap : 8
  },
  smallInputText : {
    fontFamily : FONTS.jamsil.light2,
    fontSize : sizes.normalText
  },
  rowDirectionInput : {
    flexDirection : "row",
    justifyContent : "center",
    gap : 8
  },
  rowDirectionNoGapInput : {
    flexDirection : "row",
    justifyContent : "center",
    alignContent : "stretch"
  },
    inputField : {
      paddingLeft : 16,
      borderWidth : 1,
      borderRadius : 10,
      paddingBottom : 10,
      borderColor : colors.main,
      height : 40
    },
    inputError : {
      color : colors.reject,
      fontSize : sizes.smallText,
      opacity : 0
    },
    button :{
      backgroundColor : colors.main,
      justifyContent : "center",
      alignItems : "center",
      height : 40,
      borderRadius : 20,
      paddingHorizontal : 16
    },    
    buttonText : {
      fontSize : sizes.normalText,
      color : colors.text.reverse  
    },

  footerContainer : {
    alignItems :"center",
    justifyContent :"center",
    gap : 12,
    marginBottom : 0,
  },

  indicator : {
    flexDirection :"row",
    gap : 8
  },
  indicatorUnit : {
    width : 14,
    height : 14,
    borderWidth : 1,
    borderColor : colors.accent,
    borderRadius : 7
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
  choicebutton :{
    flex : 0.5,
    height : 40,
    borderWidth : 1,
    borderRightWidth : 0.5,
    justifyContent:"center",
    paddingLeft :10,
    paddingBottom :5,
    borderColor : colors.main,
  },
  leftbutton :{
    borderTopLeftRadius : 10,
    borderBottomLeftRadius : 10,
  },
  rightbutton: {
    borderTopRightRadius : 10,
    borderBottomRightRadius : 10,
  }
});