import BottomActionButton from "@/components/buttons/BottomButton";
import SmallHeader from "@/components/header/SmallHeader";
import LabelTextInput from "@/components/TextInput/LabelTextInput";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";



export default function MyAccountInsertion(){
    const insets = useSafeAreaInsets();
    
    const [bank, setBank] = useState("");
    const [accountNum, setAccountNum] = useState("");
    
    const router = useRouter();

    return (
        <SafeAreaView style = {[styles.rootContainer, {paddingHorizontal : insets.left + 16}]}>
            <SmallHeader
                headerText={"계좌 추가 및 수정"}
                headerTextFont={FONTS.jamsil.regular3}
                headerTextSize={sizes.smallTitle}
                paddingBottomLen={56}
            />

        <View style = {{
            borderColor : colors.main,
            borderWidth : 1,
            borderStyle :"dashed",
            padding : 24,
            justifyContent : "center",
            alignContent : "center",
            marginBottom : 40
        }}>
            <View style = {{
                backgroundColor : colors.accent,
                width : 264,
                height : 138,
                borderTopLeftRadius : 10,
                borderTopRightRadius : 10
            }}/>
        </View>
        
        
        <View style ={{gap : 24}}>
            <LabelTextInput
                titleText="은행"
                onChangeText={(s) => {setBank(s)}}
                value={bank}
                placeHolder="은행 이름"
            />

          <LabelTextInput
                titleText="계좌 번호"
                onChangeText={(s) => {setBank(s)}}
                value={bank}
                placeHolder="계좌 번호"
            />
        </View>


          <View style ={{flex : 1}}/>
          <View style = {[styles.footerContainer, {
            flexDirection : "row",
            marginBottom : insets.bottom + 10}
            ]}>

             <BottomActionButton
                containerStyle = {{flex:1}}
                label ="뒤로 가기"
                onPress = {() => router.push("/")}
              />
              <BottomActionButton
                containerStyle = {{flex : 1}}
                label ="계좌 인증"
                onPress = {() => router.push("/")}
              />
          </View>

        </SafeAreaView>

    )

}

const styles = StyleSheet.create({
  rootContainer : {
    flex : 1
  },
    footerContainer : {
    alignItems :"center",
    justifyContent :"center",
    gap : 12,
    marginBottom : 0,
  },

})