import { colors } from "@/constants/colors/ColorTheme";
import { sizes } from "@/constants/size/FontSize";
import { useState } from "react";
import { StyleProp, TextProps } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type BankOption = {
  label: string;
  value: number;
};

const DATA: BankOption[] = [
  { label: "한국은행", value: 100 },
  { label: "국민은행", value: 101 },
  { label: "신한은행", value: 102 },
  { label: "농협은행", value: 103 },
];

interface BankNameDropDownProps{
    bankName : string,
    setBankName : (s :string) => void;
    placeholder :string,
    containerStyle? : StyleProp<TextProps>,
}



export default function BankNameDropDown({
    bankName,
    setBankName,
    placeholder,
    containerStyle

} : BankNameDropDownProps){

    const [focus, setFocus] = useState(false);

    return(
            <Dropdown
                data={DATA}
                labelField="label"
                valueField="value"
                value={bankName}
                onChange={(item) => {
                    setBankName(item.value);
                }}
                onFocus={()=>setFocus(true)}
                onBlur={() => setFocus(false)}
                placeholder={placeholder}
                // styles.inputField을 그대로 사용하려면 styles를 외부에서 주입하거나
                // 아래처럼 스타일 배열로 기존 스타일을 적용합니다.
                style={[
                    containerStyle,
                    { 
                    borderColor : focus ? colors.accent : colors.main,
                    borderWidth : focus ? 2 : 1,
                    backgroundColor : focus ? colors.disable : "transparent",
                    borderRadius : 10,
                    paddingLeft : 8,
                    height : 40
                    }
                    ]
                }
                iconStyle={{marginTop:8}}
                selectedTextStyle={{ alignItems : "center", justifyContent : "center",
                    fontSize : sizes.normalText,
                    color :colors.text.primary
                }}
                containerStyle = {{borderRadius : 10}}
                placeholderStyle={{ alignItems : "center", justifyContent :"center",
                    fontSize : sizes.smallText,
                    color : colors.text.secondary
                }}
                // 드롭다운 목록 스타일 (필요하면 커스터마이즈)

                />
    )
}