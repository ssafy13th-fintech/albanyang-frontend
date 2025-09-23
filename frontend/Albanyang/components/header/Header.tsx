import { View, Text } from "react-native";
import { FONTS } from '@/constants/fonts/Fonts';

interface HeaderProps {
  headerText: string;
}

export default function Header({ headerText }: HeaderProps) {
  return (
    <View style={{ paddingVertical: 32, paddingHorizontal: 10, alignItems: "center" }}>
      <Text style={{ fontFamily: FONTS.jamsil.medium4, fontSize: 24 }}>
        {headerText}
      </Text>
    </View>
  );
}
