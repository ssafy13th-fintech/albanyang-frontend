
import { colors } from '@/constants/colors/ColorTheme';
import { useState } from 'react';
import { StyleProp, TextInput, View, ViewStyle } from 'react-native';
import PhoneNumDropdown from '../dropdown/PhoneNumDropDown';

interface PhoneNumInputProps{
    phoneFirstNum : string,
    phoneLastNum : string,
    onChangePhoneFirstNum : (s :string) => void,
    onChangePhonLastNum : (s : string) =>  void,  
    dropdownContainerStyle : StyleProp<ViewStyle>
}

/**
 * 
 * #### 전화 번호 input을 정의한 compoennt입니다.
 * 
 * @param : PhoneNumInputProps
 * 
 * - phoneFirstNum : 핸드폰 앞 번호의 정보를 담을 state 변수 (010, 011 등의 지역번호)
 * - phoneLastNum : 그 뒤에 들어갈 xxxx-xxxx 형태의 전화번호, 따라서 phoneFirstNum + phoneLastNum가 전화번호임
 * - onChangePhoneFirstNum : 핸드폰 앞 번호가 바뀔 경우의 콜백
 * - onChangePhoneLastNum : 핸드폰 뒷 번호가 바뀔 경우의 콜백
 * - dropdownContainerStyle : 핸드폰 앞 번호 선택이 가능한 드롭다운의 디자인
 */
export default function PhoneNumInput({
    phoneFirstNum,
    phoneLastNum,
    onChangePhoneFirstNum,
    onChangePhonLastNum,
    dropdownContainerStyle
} : PhoneNumInputProps){
    
    const [focus, setFocus] = useState(false);
    

    return (
               <View style={{flexDirection :"row", gap : 10}}>
                  <PhoneNumDropdown
                    containerStyle={[dropdownContainerStyle,{flex:0.3}]}
                    value={phoneFirstNum}
                    onChange={onChangePhoneFirstNum}
                    placeholder="010"
                    />
                  <TextInput
                    onFocus={() => setFocus(true)}
                    onBlur ={() => setFocus(false)}
                    value = {phoneLastNum.replaceAll("-","")}
                    onChangeText={(v) => onChangePhonLastNum(v.replaceAll("-",""))}
                    style = {{
                      borderColor : focus ? colors.accent : colors.main,
                      borderRadius : 10,
                      borderWidth : focus ? 2 : 1,
                      paddingLeft : 16,
                      height : 40,
                      flex : 0.7
                    }}
                    keyboardType="numeric"
                  />
                  </View>
    )
}