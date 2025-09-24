import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from '@/constants/fonts/Fonts';
import { sizes } from '@/constants/size/FontSize';
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
    setInputAccountAuth : (v :string) => void,
    ansAccountAuth : string,
    inputFieldStyle? : StyleProp<TextStyle>
    footerButtonStyle? :StyleProp<ViewStyle>
}



export default function AccountAuthModal(
{
    modalVisible,
    setModalVisible,
    inputAccountAuth,
    setInputAccountAuth,
    ansAccountAuth,
    inputFieldStyle,
    footerButtonStyle
}:AccoutAuthModalProps
) {

    const [isDisabled, setIsDisabled] = useState(true);
    useEffect(()=>{
        setIsDisabled(inputAccountAuth.length==0)
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
          <TextInput
          value = {inputAccountAuth}
          onChangeText={setInputAccountAuth}
          placeholder="인증코드 입력 (기업명 + 인증코드)"
          style = {[inputFieldStyle, {marginTop : 24, marginBottom : 40}]}></TextInput>
          <TouchableOpacity 
          disabled ={isDisabled}
          style = {[{justifyContent : "center",alignSelf :"center",
            backgroundColor : isDisabled ? colors.disable : colors.main
           }, footerButtonStyle] }
          onPress={() => {
            if(inputAccountAuth === ansAccountAuth){
              console.log("계좌 인증 성공")
              setModalVisible(false)
              router.push("/login/SignUpComplete")
            }else{
              console.log("계좌 인증 실패")
            }
          }}>
            <Text style={{color : colors.text.reverse, fontWeight : 600}}>계좌 인증</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    )
}