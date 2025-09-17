import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useState } from "react";
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
  const [id, setId] = useState("");
    const [pw, setPw] = useState("");
      const [confirmPw, setcConfirmPw] = useState("");

    return (
        
        <SafeAreaView style = {styles.rootContainer}>
          <View style={[{ paddingHorizontal: insets.left ?? 16 }]}>
            <View style = {[{marginTop : insets.top + 24}]}>
              <Image style = {styles.icon}>
              
              </Image>
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
                      style={[styles.inputField,  {flex : 8 }]}
                      placeholder="이메일 주소"
                      value={id}
                      onChangeText={setId}
                      autoCapitalize="none" // 첫 글자 자동 대문자 방지
                      />
                      <Pressable
                        onPress={() => console.log("클릭")}
                        style={({ pressed }) => [
                          styles.button,
                          { 
                            backgroundColor: pressed ? colors.accent : colors.main
                          },
                          ]}>
                          <Text style ={styles.buttonText}>중복 확인</Text>
                      </Pressable>
                    </View>
                    <Text style = {styles.inputError}>이미 존재하는 아이디가 있습니다.</Text>
                </View>
                <View style = {styles.smallInputContainer}>
                    <Text style = {styles.smallInputText}>비밀번호</Text>
                      <TextInput
                      style={styles.inputField}
                      placeholder="비밀번호"
                      value={pw}
                      onChangeText={setPw}
                      autoCapitalize="none" // 첫 글자 자동 대문자 방지
                      />
                    <TextInput
                      style={styles.inputField}
                      placeholder="비밀번호 확인"
                      value={confirmPw}
                      onChangeText={setcConfirmPw}
                      autoCapitalize="none" // 첫 글자 자동 대문자 방지
                      />
                      <Text style = {styles.inputError}>비밀번호가 일치하지 않습니다.</Text>
                </View>
            </View>

          <View style = {styles.footerContainer}>
            <View style ={styles.indicator}>
              <View style={[styles.indicatorUnit, {backgroundColor : colors.accent}]}></View>
              <View style={styles.indicatorUnit}></View>
              <View style={styles.indicatorUnit}></View>
            </View>
            <Pressable
              onPress={() => console.log("클릭")}
              style={({ pressed }) => [
                styles.footerbutton,
                { 
                  backgroundColor: pressed ? colors.accent : colors.main
                },
                ]}>
                <Text style ={ styles.buttonText}>다음으로</Text>
            </Pressable>
          </View>

          </View>

        </SafeAreaView>


    );
}

const styles = StyleSheet.create({
  rootContainer : {
    alignItems :"center"
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
    gap : 16
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
    marginBottom : 40,
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