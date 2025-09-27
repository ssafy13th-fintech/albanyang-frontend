import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { login } from "@/api/Auth";
import { saveToken, TokenDecodeObject } from "@/api/authorization/AuthTokenStorage";
import { getMe } from "@/api/Member";
import LoginTextInput from "@/components/textInput/loginTextInput";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useMemberStore } from "@/store/useMemberStore";
import { useRouter } from "expo-router";
import { jwtDecode } from "jwt-decode";


export default function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loginStatus, setLoginStatus] = useState("")
  const [errorText, setErrorText] = useState("");
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const memberStore = useMemberStore();
  

  return (
      <SafeAreaView style={styles.rootcontainer}>
        <View style = 
        {[styles.titleContainer, 
        {marginTop : insets.top + 64}]}>
                <Text style = { styles.titleText }>어서오세요!{"\n"}
                  <Text style = { styles.accentText}>알바냥</Text>입니다!</Text> 
                  <Image
                  source={require("@/assets/images/mascot/mascot_smileface_alba.png")}
                  style = {styles.mascot}
                  >
                  </Image>
        </View>
        <View style = {styles.inputSection}>
        <View style = {styles.inputContainer}>
            <LoginTextInput
              //placeholder="아이디"
              label ="아이디"
              value = {id}
              setChangeValue={setId}
              isSecure={false}
              />    
              <View style ={{width :"100%"}}>
            <LoginTextInput
              //placeholder="비밀번호"
              label="비밀번호"
              value = {pw}
              setChangeValue={setPw}
              isSecure={true}
              />   
              <Text style = {styles.inputError}>{errorText}</Text>
           </View>
            <Pressable
            onPress={async() => {
              //console.error("login pressed2 : " + id + " / " + pw);
              try{
                const response = await login({email : id, password : pw});

                //token 디코딩
                await saveToken(response.data.accessToken)
                const decode = jwtDecode(response.data.accessToken) as TokenDecodeObject
                console.log("decode msg ",decode.role)

                //내 정보 가져오기
                const me = await getMe();
                memberStore.setForm(me.data);  
                memberStore.setForm({role : decode.role === "EMPLOYEE" ? 'alba' : 'sajang'})               
               // console.log("my uinfo ", me);

               if(decode.role === "EMPLOYEE"){
                  router.replace("/EmployeeMainPage");
               }
               else if(decode.role === "EMPLOYER"){
                  router.replace("/EmployerMainPage");
               }

              }
              catch(e : any){
                 console.log("error :", e);
                 setErrorText("로그인 정보를 잘못 입력하셨습니다");
              }
            }}
            style={({ pressed }) => [
              styles.button,
              { 
                backgroundColor: pressed ? colors.accent : colors.main
              },
             ] 
            }
           >
            <Text style ={ styles.buttonText}>로그인</Text>
        </Pressable>
        </View>

            
        <Pressable onPress={() => router.push("/login/SignUpFirst")} 
        style = {({pressed}) => [styles.toSignUp]}>
         <Text style={styles.toSignUpText}>회원가입</Text>
        </Pressable>
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    
    rootcontainer: {
      //backgroundColor : colors.subAccent,    
      alignItems : "center",
      backgroundColor: "#FFF"
    },
    titleContainer :{
      flexDirection : "row",
      alignItems :"stretch",
      gap : 32,
    },
    titleText: {
        fontSize: sizes.middleTitle,
        fontFamily : FONTS.jamsil.regular3,
        lineHeight : 40
    },
    mascot : {
      width : 80,
      height : 80
    },
    accentText : {
      color : colors.main
    },
    inputSection :{
        paddingHorizontal : 8,
        paddingVertical : 16,
        marginTop : 32,
        marginBottom : 16,
    },
    inputContainer :{
      gap : 24,
      alignItems:"center",
    },
    inputField : {
      width : 300,
      paddingLeft : 16,
      borderWidth : 1,
      borderRadius : 10,
      borderColor : colors.main,
      height : 48
    },
    inputError : {
      paddingTop : 8,
      color : colors.reject,
      fontSize : sizes.smallText,

    },
    button :{
      backgroundColor : colors.main,
      justifyContent : "center",
      alignItems : "center",
      width : 300,
      height : 48,
      borderRadius : 30,
      paddingHorizontal : 32,
    },
    buttonText : {
      fontSize : sizes.normalText,
      color : colors.text.reverse  
    },
    toSignUp :{
      marginTop : 48,
      
    },
    toSignUpText : {
      fontFamily : FONTS.jamsil.regular3,
      fontSize : sizes.normalText,
      color : colors.main
    }
});