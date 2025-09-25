import { RegisterRequest } from '@/api/Member';
import { checkAuthCode } from '@/api/SSAFYOpenapi';
import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';
import { useSignUpStore } from '@/store/useSignUpStore';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  StyleProp,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import Modal from 'react-native-modal';


interface AccoutAuthModalProps{
    modalVisible : boolean,
    setModalVisible : (v : boolean) => void,
    inputAccountAuth : string,
    inputAccountText : string,
    setInputAccountAuth : (v :string) => void,
    registerRequest : RegisterRequest
    accountNum : string,
    apiKey : string,
    userKey :string,
    inputFieldStyle? : StyleProp<TextStyle>
    footerButtonStyle? :StyleProp<ViewStyle>
}



export default function AccountAuthModal(
{
    modalVisible,
    setModalVisible,
    inputAccountAuth,
    inputAccountText,
    setInputAccountAuth,
    registerRequest,
    accountNum,
    apiKey,
    userKey,
    inputFieldStyle,
    footerButtonStyle
}:AccoutAuthModalProps
) {
   const signUpStore = useSignUpStore();
    const [isDisabled, setIsDisabled] = useState(true);
    const [isWrong, setIsWrong] = useState(false);

    useEffect(()=>{
        setIsDisabled(inputAccountAuth.length===0)
    }, [inputAccountAuth])

    return(
      <Modal
        isVisible={modalVisible}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        swipeDirection="down"  // 👈 아래로 스와이프하면 닫힘
        onSwipeComplete={() => setModalVisible(false)}
        onBackdropPress={() => setModalVisible(false)} // 바깥 클릭 시 닫기
        style={{ justifyContent: 'flex-end', margin: 0 }} // 하단 모달 스타일
      >
        <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20
         }}>
          <Text style={{ 
            marginTop  : 8,
            marginBottom: 16,
            fontFamily : FONTS.jamsil.regular3,
            fontSize : sizes.smallTitle,
            lineHeight : 32,
            textAlign :"left"
           }}>1원 인증으로{"\n"}간단하게 계좌 인증해요 </Text>

           <Text
            style = {{fontFamily :FONTS.jamsil.light2, fontSize : sizes.smallText, lineHeight : 16, textAlign : "left"}}
           >입력하신 계좌번호로 1원을 보냈습니다.{"\n"}인증코드를 입력해주세요.</Text>
          
          <View style ={{marginTop : 24, marginBottom : 40, gap :8}}>

          <TextInput
          value = {inputAccountAuth}
          onChangeText={setInputAccountAuth}
          placeholder="인증코드 입력 (인증코드)"
          style = {[inputFieldStyle]}></TextInput>
           <Text style = {{fontFamily : FONTS.jamsil.light2, fontSize : sizes.smallText,
            color : colors.reject, opacity : isWrong ? 1 : 0
           }}>인증번호가 일치하지 않습니다</Text>
          </View>

          <TouchableOpacity 
          disabled ={isDisabled}
          style = {[{justifyContent : "center",alignSelf :"center",
            backgroundColor : isDisabled ? colors.disable : colors.main
           }, footerButtonStyle] }
          onPress={async() => {
            try{
                  const ans = await checkAuthCode({
                    apiKey : apiKey, userKey : userKey,
                    accountNo : accountNum , 
                    authText : inputAccountText,
                    authCode  :  inputAccountAuth,
                  })

                  console.log("ans : ",ans)
                  if(ans.REC.status === 'SUCCESS'){
                    console.log("계좌 인증 성공")
                    //patchAccount({account : accountNum})
                    setModalVisible(false)
                    signUpStore.setForm({account : accountNum})
                    router.push("/login/SignUpAccountPasswordPage")  //데체 왜 ./을 해야 빨간줄이 사라짐?
                                                  //절대경로 앞에 인식이 잘 안되는 문제..
                   }else{
                    setIsWrong(true);
                    console.log("계좌 인증 실패")
                  }
                }catch(e : any){
                  setIsWrong(true);
                }
          }}>
            <Text style={{color : colors.text.reverse, fontWeight : 600}}>계좌 인증</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    )
}