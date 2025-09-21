// components/AgeDropdown.tsx
import { colors } from "@/constants/colors/ColorTheme";
import React, { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

type PhoneNumOption = {
  label: string;
  value: string;
};

type Props = {
  value: string | null;
  onChange: (value: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  placeholder?: string;
  // styles.inputField을 바로 덮어쓰지 않도록 button처럼 덧붙일 수 있음
};

const DATA: PhoneNumOption[] = [
  { label: "010", value: "010" },
  { label: "011", value: "011" },
  { label: "016", value: "016" },
  { label: "017", value: "017" },
  { label: "019", value: "019" },
];

export default function PhoneNumDropdown({
  value,
  onChange,
  containerStyle,
  placeholder = "선택하세요",
}: Props) {

  const [focus, setFocus] = useState(false);

  return (

      <Dropdown
        data={DATA}
        labelField="label"
        valueField="value"
        value={value}
        onChange={(item) => {
          onChange(item.value);
        }}
        onFocus = {()=>{setFocus(true)}}
        onBlur = {()=>{setFocus(false)}}
        placeholder={placeholder}
        style={[
          containerStyle,
           {
            borderColor : focus ? colors.accent : colors.main,
            borderWidth : focus ? 2 : 1, 
            backgroundColor : focus ? colors.disable : "transparent"
          }]}
        iconStyle = {{marginTop:8}}
        selectedTextStyle={{ paddingTop : 5,alignItems : "center"}}
        placeholderStyle={{ paddingTop : 5,alignItems : "center"}}
        // 드롭다운 목록 스타일 (필요하면 커스터마이즈)

      />

  );
}