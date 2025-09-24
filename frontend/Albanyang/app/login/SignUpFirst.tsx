import { deleteToken } from "@/api/authorization/AuthTokenStorage";
import BottomActionButton from "@/components/buttons/BottomButton";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useSignUpStore } from "@/store/useSignUpStore";
import { useRouter } from 'expo-router';
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
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const signUpStore = useSignUpStore();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pwRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@[₩\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@[₩\]^_`{|}~]{8,30}$/;
    // 이메일 형식, 특수문자/숫자/영문자 포함 8~30자리
    // 허용 특수문자 : !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~

    const [id, setId] = useState(signUpStore.registerForm.email ?? "");
    const [pw, setPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

    //ID 가 유효한지
    const [validID, setValidID] = useState(false);
    const [validPw, setValidPw] = useState(true);
    const [isSamePw, setIsSamePw] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);

    
    useEffect(() => {
      // console.log("pw : " + pw + " confirmPw : " + confirmPw
      //   + " is same : " + (pw == confirmPw)
      // )
      const same = pw === confirmPw;
      const validIdNow = emailRegex.test(id) && id.length > 0;
      const validPwNow = pwRegex.test(pw);

      setIsSamePw(same);
      setValidID(validIdNow);
      setValidPw(validPwNow);
      setIsDisabled(!(validIdNow && validPwNow && same));

      // console.log("disable : "  + isDisabled
      //   + " validID : " + validID
      //   + " validPw : " + validPw
      //   + " isSamePw : " + isSamePw
      // )
    }, [id, pw, confirmPw]);


    return (
        
        <SafeAreaView style = {styles.rootContainer}>
          <View style={[{ paddingHorizontal: insets.left ?? 16 }]}>
            
            <View style = {[{marginTop : insets.top + 8, marginBottom : 24}]}>
                            <Pressable
                            onPress={() => {
                              signUpStore.resetForm();
                              router.back()
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
                  >
                </Image>
              </View>
            </View>

              
            <View style = {styles.InputContainer}>
                <View style = { styles.smallInputContainer}>

                    <Text style = {styles.smallInputText}>아이디(이메일)</Text>
                    
                    <View style={[styles.emailInput]}>
                     <TextInput
                      style={[styles.inputField,  {flex : 2 }]}
                      placeholder="이메일 주소 (최대 40글자)"
                      value={id}
                      onChangeText={(s)=>{
                        setId(s)
                      }
                      }
                      maxLength={40}
                      autoCapitalize="none" // 첫 글자 자동 대문자 방지
                      />
                      <Pressable
                        onPress={() => console.log("클릭")}
                        style={({ pressed }) => [
                          styles.button,
                          { 
                            backgroundColor: pressed ? colors.accent : colors.main,
                            flex : 1
                          },
                          ]}>
                          <Text style ={styles.buttonText}>중복 확인</Text>
                      </Pressable>
                    </View>
                    <Text style = {styles.inputError}>이미 존재하는 이메일이 있습니다.</Text>
                </View>
                <View style = {styles.smallInputContainer}>
                    <Text style = {styles.smallInputText}>비밀번호</Text>
                    <View style = {{gap : 16}}>
                      
                      <View>
                      <TextInput
                      style={styles.inputField}
                      placeholder="비밀번호"
                      value={pw}
                      onChangeText={
                        (v) =>{
                        setPw(v)
                        }
                      }
                      autoCapitalize="none" // 첫 글자 자동 대문자 방지
                      secureTextEntry
                      />
                     <Text style = {[styles.inputError,
                        {
                          opacity : validPw ? 0 : 1,
                          display : validPw ? "none" : "flex"
                        } 
                      ]}
                    >비밀번호는 8자 이상, 영문자, 숫자, 특수문자를 포함해야 합니다.</Text>
                    </View>
                    <View>
                    <TextInput
                      style={styles.inputField}
                      placeholder="비밀번호 확인"
                      value={confirmPw}
                      onChangeText={(v) => {
                 
                        setConfirmPw(v)
                        console.log("confirmPw : " + confirmPw + " pw : " + pw)
                      }}
                      autoCapitalize="none" // 첫 글자 자동 대문자 방지
                      secureTextEntry  //비밀번호 안보이게 막기
                      />
              
                      <Text style = {[styles.inputError,
                        {opacity : (confirmPw === pw || confirmPw.length === 0 ||  !validPw) ? 0 : 1} 
                      ]}
                      >비밀번호가 일치하지 않습니다.
                      </Text>
                      </View>
                </View>
            </View>
          </View>
          
          <View style ={{flex : 1}}/>
          <View style = {[styles.footerContainer, {marginBottom : insets.bottom + 10}]}>
            <View style ={styles.indicator}>
              <View style={[styles.indicatorUnit, {backgroundColor : colors.accent}]}></View>
              <View style={styles.indicatorUnit}></View>
              <View style={styles.indicatorUnit}></View>
            </View>
              <BottomActionButton
                label ="다음으로"
                onPress = {async () => {
                  await deleteToken();
                  signUpStore.setForm({email : id, password : pw})
                  router.push("/login/SignUpSecond")
                }}
                disabled = {isDisabled}
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
  emailInput : {
    flexDirection : "row",
    justifyContent : "center",
    gap : 8
  },
    inputField : {
      paddingLeft : 16,
      borderWidth : 1,
      borderRadius : 10,
      borderColor : colors.main,
      height : 40
    },
    inputError : {
      color : colors.reject,
      fontSize : sizes.smallText,
      opacity : 0,
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
});