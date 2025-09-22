import { colors } from '@/constants/colors/ColorTheme';
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';


interface LabelTextInputProps{
    titleText : string,
    value : string,
    onChangeText : (v : string) => void,
    placeHolder? : string,
    isDropdown? : boolean
}


/** 
 *  #### 일반적인 텍스트 인풋 컴포넌트입니다.
 * 
 * - titleText : 해당 TextInput이 어떤 목적의 입력필드인지에 대한 title을 지정합니다.
 * - value : textInput에 반영될 반응형 변수
 * - onChangeText  : textInput이 바뀔 때 마다 호출될 콜백 함수
 */
export default function LabelTextInput({
    titleText,
    value,
    onChangeText,
    placeHolder,
    isDropdown = false
}:LabelTextInputProps){

    const [focus, setFocus] = useState(false);

    return (
                <View>
                  <Text style ={{
                    fontFamily : FONTS.jamsil.light2,
                    fontSize : sizes.normalText,
                    marginBottom : 8
                  }}>
                    {titleText}
                  </Text>
                  <TextInput
                    placeholder= {placeHolder}
                    onFocus={() => setFocus(true)}
                    onBlur ={() => setFocus(false)}
                    onChangeText={onChangeText}
                    value = {value}
                    style = {{
                      borderColor : focus ? colors.accent : colors.main,
                      borderRadius : 10,
                      borderWidth : focus ? 2 : 1,
                      paddingLeft : 16,
                      height : 40
                    }}
                  />
                </View>
    )
}