import BottomActionButton from "@/components/buttons/BottomButton";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { router } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function WithDrawPage(){
    const insets  = useSafeAreaInsets();
    
    return (
        // SafeAreaView는 전체 높이 차지
        <SafeAreaView style = {[styles.rootContainer, {paddingHorizontal : 16}]}>
       
            {/* 화면 중앙에 위치시키려면 이 뷰에 flex:1과 세로 정렬 center를 줌 */}
            <View style = {{flex: 1, justifyContent : "center", alignItems : "center", gap: 24}}>
                <Text style ={{
                    fontFamily : FONTS.jamsil.regular3,
                    fontSize : sizes.middleTitle
                }}>회원 탈퇴</Text>

                <Image
                    source={require("@/assets/images/icon/icon_warning.png")}
                    style = {{width : 80, height : 80}}
                />

                <Text style ={{
                    fontFamily : FONTS.jamsil.regular3,
                    lineHeight : 24 ,
                    textAlign : "center"}}>
                    계정을 탈퇴할 시{"\n"}
                    복구할 수 없습니다.{"\n"}
                    정말로 탈퇴하시겠습니까? {"\n"}
                </Text>

                <Text style ={{
                    fontFamily : FONTS.jamsil.regular3,
                    color : colors.shadow,
                    lineHeight : 20,
                    textAlign: "center" // 끝줄 가운데 정렬
                }}>
                    단, 월급 정산 등을 위해 일정 기간 동안 회원 정보가{"\n"}
                    남아 있을 수 있습니다.
                </Text>
            </View>
            
            {/* 하단 버튼 영역: safe area inset 반영 */}
            <View style = {{flexDirection : "row", gap : 16, marginBottom : insets.bottom + 16}}>
                <BottomActionButton 
                    onPress={() => {router.back()}}
                    label="뒤로 가기"
                    containerStyle = {{flex : 1}}
                />
                <BottomActionButton 
                    label = "탈퇴 하기"
                    containerStyle = {{flex :1}}
                    mainColor = {colors.reject}
                    pressColor={colors.accent}
                />
            </View>

        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    rootContainer :{
        flex : 1
    }
});
