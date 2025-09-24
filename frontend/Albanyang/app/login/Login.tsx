import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { login } from "@/api/auth";
import LoginTextInput from "@/components/TextInput/loginTextInput";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useRouter } from "expo-router";


export default function Login() {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const insets = useSafeAreaInsets();
  const router = useRouter();


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
            <LoginTextInput
              //placeholder="비밀번호"
              label="비밀번호"
              value = {pw}
              setChangeValue={setPw}
              isSecure={true}
              />   
              <Text style = {styles.inputError}>잘못된 정보를 입력하셨습니다.</Text>
    
            <Pressable
            onPress={async() => {
              console.log("login pressed2 : " + id + " / " + pw);
              const response = await login({email : id, password : pw});
              console.log("response2 : " + JSON.stringify(response));
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
      alignItems : "center"
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
      display : "none"
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