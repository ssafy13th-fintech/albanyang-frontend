import { colors } from "@/constants/colors/ColorTheme"
import { FONTS } from "@/constants/fonts/Fonts"
import { sizes } from "@/constants/size/FontSize"
import { StyleSheet, Text, View } from "react-native"



interface AccountCardProps{
    bankname :string,
    bankAccountNum : string,
    existBorder? :boolean
}


export default  function AccountCard(
{
    bankname,
    bankAccountNum,
    existBorder = true,
}:AccountCardProps){
    return(
                  <View style = {[styles.accountCard
,{        borderColor :  existBorder ? colors.accent : "transparent",
        borderStyle : "dashed",
        borderWidth : 1,}
                  ]
                  }>
                            <View style = { { 
                                backgroundColor : colors.main, 
                                borderTopRightRadius : 5,
                                borderTopLeftRadius : 5,
                                width:240, 
                                height:130, 
                                marginVertical : 8
                                }}>
        
                                <View style = {
                                    {
                                        backgroundColor : "white", width : 180, height : 20, 
                                        position : "absolute", top : 30, alignSelf :"center"
                                }}>
                                    </View>
        
                            </View>
                            <View style = {{ marginTop : 8}}>
                            <Text
                            style = {{fontFamily : FONTS.jamsil.regular3,
                                fontSize : sizes.smallText
                            }}
                            >{bankname}
                            <Text
                             style = {{fontFamily : FONTS.jamsil.light2,
                                fontSize : sizes.smallText
                            }}> {bankAccountNum}</Text></Text>
                            </View>
                        </View> 
    )
}


const styles = StyleSheet.create({
        accountCard : {
        marginTop : 16,
        paddingVertical : 16,
        justifyContent : "center",
        alignItems : "center",
        boxShadow : "100"
    }
})