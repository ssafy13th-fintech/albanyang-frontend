import SmallHeader from "@/components/header/SmallHeader";
import NavBar from "@/components/navBar/NavBar";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { useState } from "react";
import { Image, Text, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import PayslipTabBar from "../payslip/common/components/PayslipTabBar";


const datas : string[]  = [
    "메가커피 역삼점",
    "메가커피 역사점",
    "GS 편의점",
    "CU 편의점"
]


export default function MyAttendancePage(){
    const insets = useSafeAreaInsets();
    const [activeTab, setActiveTab] = useState(0);

    return(
        <SafeAreaView style ={{flex:1}}>
            <SmallHeader
                headerText="내 근태 현황"
                headerTextFont={FONTS.jamsil.regular3}
                headerTextSize={sizes.smallTitle}
                isAblaBack = {false}
                paddingBottomLen={12}
            />

            <View style ={{
                elevation:1, 
                shadowColor:colors.shadow,
                height : 50, 
                justifyContent :"center",
                marginBottom :16
            }}>
       
            <PayslipTabBar
                tabs={datas}
                activeTab={activeTab}
                onTabPress={setActiveTab}

            />
            </View>


            
            <View style ={{
                marginHorizontal : insets.right + 16,
                marginBottom : 16
            }}>
                <Text style ={{
                    fontFamily: FONTS.jamsil.regular3,
                    fontSize : sizes.normalText,
                    marginBottom :16
                }}>
                    오늘 근무 현황
                </Text>

                <View style= {{
                    paddingVertical : 24, 
                    paddingHorizontal : 56,
                    backgroundColor : colors.main,
                    borderRadius : 10,
                    flexDirection:"row",
                    alignItems :"center",
                    justifyContent :"center",
                    gap : 24
                }}>
                <View>
                    <Text style ={{fontFamily:FONTS.jamsil.light2}}>
                        From
                    </Text>
                    <Text style ={{
                        fontFamily : FONTS.jamsil.regular3,
                    fontSize : sizes.smallTitle,
                    color : colors.text.reverse
                    }}>
                        am 11:50
                    </Text>
                </View>
                <Image 
                    source = {require("@/assets/images/icon/icon_next.png")}
                    style ={{height : 18, width :12}}
                />
                <View>
                    <Text style ={{fontFamily :FONTS.jamsil.light2}}>
                        To
                    </Text>
                    <Text style ={{
                        fontFamily : FONTS.jamsil.regular3,
                        fontSize : sizes.smallTitle,
                        color : colors.text.reverse
                    }}>
                        am 11:50
                    </Text>
                </View>
                </View>
            </View>

            <Calendar
                style ={{
                    elevation : 3,
                    shadowColor : colors.shadow,
                    marginBottom : 16
                }}
            />  
            
            <NavBar
                role="alba"
            />
{/* 
            <Modal
            onShow={}
            >
                
            </Modal> */}
   
        </SafeAreaView>
                            


    )
}