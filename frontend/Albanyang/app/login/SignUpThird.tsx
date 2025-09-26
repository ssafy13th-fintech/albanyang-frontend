import { registerMember } from '@/api/Member';
import { inquireTransactionHistoryByUniqueNo, openAccountAuth } from '@/api/SSAFYOpenapi';
import { getFcmToken } from '@/app/_layout';
import BankNameDropDown from '@/components/dropdown/BankNameDropDown';
import AccountAuthModal from '@/components/modal/AccountAuthModal';
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useSignUpStore } from "@/store/useSignUpStore";
import { SSAFY_MAIN_API_KEY, SSAFY_MAIN_USER_ACCOUNT, SSAFY_MAIN_USER_KEY } from '@env';
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
    const [bankName, setBankName] = useState("");
    const [accountNum, setAccountNum] = useState(SSAFY_MAIN_USER_ACCOUNT);
    const [isDisabled, setIsDisabled] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [inputAccountAuth, setInputAccountAuth] = useState("");
    const [inputAccountText, setInputAccountText] = useState("");
    
    const router = useRouter();
    const signUpStore = useSignUpStore();

    const api_key = SSAFY_MAIN_API_KEY
    const user_key = SSAFY_MAIN_USER_KEY
    console.log(api_key +" " + user_key)
    useEffect(()=>{
      setIsDisabled(!bankName  || !accountNum);
    }, [bankName, accountNum])

    return (
        
        <SafeAreaView style = {styles.rootContainer}>
          <View style={[{ paddingHorizontal: insets.left ?? 16 }]}>
            <View style = {[{marginTop : insets.top + 8, marginBottom : 24}]}>
              <Pressable
              onPress={() => {router.back()}}
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
                    <Text style = {styles.smallInputText}>은행(선택)</Text>

                    <BankNameDropDown
                      bankName= {bankName}
                      setBankName={setBankName}
                      placeholder='은행을 선택주세요'
                    />

                </View>

                <View style = {styles.smallInputContainer}>
                    <Text style = {styles.smallInputText}>계좌번호(선택)</Text>

                     <TextInput
                      style={[styles.inputField]}
                      keyboardType='numeric'
                      placeholder="계좌번호"
                      value={accountNum}
                      onChangeText={setAccountNum}
                      autoCapitalize="none" // 첫 글자 자동 대문자 방지
                      />
                </View>

                <View style = {styles.smallInputContainer}>
                <Text style = {{fontSize : sizes.smallText, color : colors.text.secondary}}>
                  계좌를 입력하지 않을 시 {"\n"}서비스 이용에 제한이 있을 수 있습니다.
                </Text>
                </View>
          </View>


          <View style ={{flex : 1}}/>

          <View style = {[styles.footerContainer, {marginBottom : insets.bottom + 16}]}>
            <View style ={styles.indicator}>
              <View style={[styles.indicatorUnit]}></View>
              <View style={[styles.indicatorUnit]}></View>
              <View style={[styles.indicatorUnit, {backgroundColor : colors.accent}]}></View>
            </View>
                        
            <View style ={styles.rowDirectionInput}>
              <Pressable
                onPress={async() => {
                  try{
                  const fcmtoken = await getFcmToken();
                  // console.log("fcm token zz " ,fcmtoken)
                  // signUpStore.setForm({token : fcmtoken, accountNum : null, accountPassword : null});
                      const payload = {
                      ...signUpStore.registerForm, // 기존 정보
                      accountPassword: "",
                      account : "",
                      token: fcmtoken
                      };
                  await registerMember(payload);
                  signUpStore.resetForm();
                  router.push("/login/SignUpComplete")
                  }catch(e){
                    console.error(e)
                  }
                }}
                style={({ pressed }) => [    
                { 
                  borderColor: pressed ? colors.accent :colors.main,
                  backgroundColor : pressed ? colors.disable : "transparent",
                  borderWidth : 2,
                  borderRadius : 30,
                  height : 48,
                  flex : 1,
                  justifyContent :"center",
                  alignItems : "center",
                  paddingBottom : 4
                },
                ]}>
              <Text style ={{fontSize : sizes.normalText, color : colors.main, fontWeight : 600}}>건너뛰기 (완료) </Text>
              </Pressable>  
              <Pressable
                onPress={async () => {
                  try{
                  if(!isSent){
                    console.log("auth!");
                    console.log(api_key,user_key,accountNum)
                      //1원 인증을 보냅니다.
                    const openAuth = await openAccountAuth({
                      apiKey : api_key,
                      userKey: user_key,
                      accountNo : accountNum,
                      authText : 'SSAFY'
                    })
                    //거래 고유번호를 바탕으로 거래 내역을 얻습니다.
                    const transactionUniqueNo = openAuth.REC.transactionUniqueNo
                    console.log("1원 인증 성공 : ", transactionUniqueNo)

                    const res = await inquireTransactionHistoryByUniqueNo({
                      apiKey : api_key,
                      userKey : user_key,
                      accountNo : accountNum,
                      transactionUniqueNo : transactionUniqueNo
                    })

                    console.log("거래 조회 : ", res);
                    //거래 내역을 바탕으로 보낸 코드를 구합니다.
                    //거래 코드와 거래 텍스트를 구분해야함.
                    const code = res.REC.transactionSummary;
                    const authText = code.split(" ")[0];
                    const authCode = code.split(" ")[1];

                    setInputAccountAuth(authCode);
                    setInputAccountText(authText);
                    setIsSent(true);
                  }
                  else{
                      console.log("이미 보냈습니다. 계좌를 확인하세요")
                  }
                  setModalVisible(true)
                }catch(err : any){
                    console.error(err)
                }
                }}
                disabled = {isDisabled}
                style={({ pressed }) => [    
                { 
                  backgroundColor: isDisabled ? colors.disable : pressed ?  colors.accent : colors.main,
                  borderRadius : 30,
                  flex : 1,
                  justifyContent : "center",
                  alignItems :"center",
                  paddingBottom : 4
                },
                
                ]}>
              <Text style ={{fontSize : sizes.normalText, color : colors.text.reverse}}>계좌인증</Text>
              </Pressable>  
            </View>

          </View>
          </View>

      <AccountAuthModal
        inputAccountAuth={inputAccountAuth}
        inputAccountText = {inputAccountText}
        modalVisible={modalVisible}
        setInputAccountAuth={setInputAccountAuth}
        setModalVisible={setModalVisible}
        footerButtonStyle={styles.footerbutton}
        inputFieldStyle={styles.inputField}
        accountNum={accountNum}
        apiKey={api_key}
        userKey={user_key}
        registerRequest = {signUpStore.registerForm}

      />
      
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
    },    
    buttonText : {
      fontSize : 15,
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
  },

  
});