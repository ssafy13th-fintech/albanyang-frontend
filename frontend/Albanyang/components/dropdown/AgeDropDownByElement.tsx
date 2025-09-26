// components/AgeDropdown.tsx
import { colors } from "@/constants/colors/ColorTheme";
import React, { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type AgeOption = {
  label: string;
  value: number;
};

type AgeDropdownProps = {
  value: number | null;
  onChange: (value: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  // styles.inputField을 바로 덮어쓰지 않도록 button처럼 덧붙일 수 있음
};

const DATA: AgeOption[] = [
  { label: "10대", value: 10 },
  { label: "20대", value: 20 },
  { label: "30대", value: 30 },
  { label: "40대", value: 40 },
  { label: "50대", value: 50 },
  { label: "60대 이상", value: 60 },
];

export default function AgeDropdown({
  value,
  onChange,
  containerStyle,
  placeholder = "선택하세요",
}: AgeDropdownProps) {
  console.log("벨류 :", value)
  const [focus, onFocus] = useState(false);

  return (

      <Dropdown
        data={DATA}
        labelField="label"
        valueField="value"
        value={value}
        onChange={(item) => {
          onChange(item.value);
        }}
        onFocus={()=>onFocus(true)}
        onBlur={() => onFocus(false)}
        placeholder={placeholder}
        // styles.inputField을 그대로 사용하려면 styles를 외부에서 주입하거나
        // 아래처럼 스타일 배열로 기존 스타일을 적용합니다.
        style={[
          containerStyle,
          { 
            borderColor : focus ? colors.accent : colors.main,
            borderWidth : focus ? 2 : 1,
            backgroundColor : focus ? colors.disable : "transparent"

          }
          ]
        }
        iconStyle={{marginTop:8}}
        selectedTextStyle={{ paddingTop : 5,alignItems : "center"}}
        placeholderStyle={{ paddingTop : 5,alignItems : "center"}}
        // 드롭다운 목록 스타일 (필요하면 커스터마이즈)

      />

  );
}