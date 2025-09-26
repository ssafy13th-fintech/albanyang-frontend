import { Image, StyleSheet, Text, View } from 'react-native'

import BottomActionButton from '@/components/buttons/BottomButton'
import { colors } from '@/constants/colors/ColorTheme'
import { FONTS } from '@/constants/fonts/Fonts'
import { sizes } from "@/constants/size/FontSize"
import { useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export default function SignupComplete() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    return (
        <SafeAreaView style = {styles.rootContainer}>
            <View style={[{ 
                paddingHorizontal: insets.left === 0 ? 16 : insets.left,
                width : "100%"
             }]}>
            
            <Text style = { {
                fontSize : sizes.middleTitle,
                fontFamily : FONTS.jamsil.regular3,
                marginTop : insets.top + 96,
                alignSelf : 'baseline',
            }}>반갑습니다!!{"\n"}
                <Text style={
                {
                    fontFamily : FONTS.jamsil.medium4,
                    color : colors.accent
                }
            }>알바냥</Text>에{"\n"}어서오세요!!</Text>
            
            <Image
            source={require("@/assets/images/mascot/mascot_basic_alba.png")}
            style ={{width : 160, height : 240, marginTop : 40, alignSelf: "center"}}
            >
                
            </Image>

            </View>
            <View style ={{flex : 1}}/>
            <View style = {[styles.footerContainer, {paddingHorizontal : 16, marginBottom : insets.bottom + 10}]}>
            <BottomActionButton
                label ="로그인 페이지로 가기"
                textStyle = {{fontWeight : 600}}
                onPress = {() => {
                    router.dismissAll();
                    router.push("/login/Login")
                }}
            />
            </View>
        </SafeAreaView>
    )
}


const styles = StyleSheet.create({
  rootContainer : {
    alignItems :"center",
    flex : 1,
  },
  
  footerContainer : {
    alignItems :"stretch",
    justifyContent :"center",
    marginBottom : 0,
    width : "100%"
  },

}
)