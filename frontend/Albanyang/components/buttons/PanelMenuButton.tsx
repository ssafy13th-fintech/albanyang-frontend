import { colors } from "@/constants/colors/ColorTheme"
import { FONTS } from "@/constants/fonts/Fonts"
import { sizes } from "@/constants/size/FontSize"
import { Image, ImageSourcePropType, Pressable, Text, View } from "react-native"

interface PanelMenuButtonProps{
    key? : any,
    menuText : string,
    icon : ImageSourcePropType
}
export default function PanelMenuButton({
    key="",
    menuText,
    icon
} :PanelMenuButtonProps){
    return(
        <Pressable style={({pressed})=>[{
                    flexDirection : "row",
                    alignItems :"center",
                    paddingVertical : 24,
                    backgroundColor : pressed ? colors.disable : "transparent"
                }]}>
                    <Image
                        source={icon}
                        style = {{width : 24, height : 24, marginRight :16}}/>

                    <Text 
                    style = {{
                        fontFamily : FONTS.jamsil.regular3,
                        fontSize : sizes.normalText
                    }} 
                    key={key}>
                        {menuText}
                    </Text>

                    <View style = {{flex:1}}/>
                    <Text style = {{
                        fontFamily : FONTS.jamsil.regular3,
                        fontSize : sizes.normalText
                    }}>{">"}</Text>
                    </Pressable>
                    
    )
}