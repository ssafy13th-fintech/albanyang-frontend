import { colors } from "@/constants/colors/ColorTheme"
import { FONTS } from "@/constants/fonts/Fonts"
import { Text, TouchableOpacity, View } from "react-native"


export interface AttendaceScrollProps{
    activeTab : number,
    setHeaderTitle : (s : string) => void,
    setActiveTab : (i : number) => void
}

export default function AttendanceScroll ({
    activeTab,
    setHeaderTitle,
    setActiveTab

}:AttendaceScrollProps){
    
    return (
    
              <View
                style={{
                  elevation: 1,
                  shadowColor: colors.shadow,
                  height: 50,
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                {/* <PayslipTabBar tabs={["직원 근태 관리", "스케쥴 관리"]} activeTab={activeTab!} onTabPress={setActiveTab} /> */}
              
                <View style={{flexDirection : "row",  borderBottomWidth:0.25, borderColor :colors.shadow,
                }}>
                {["직원 근태 관리", "스케쥴 관리"].map((tab, index)=> (
                    <TouchableOpacity
                    onPress={() => {
                setHeaderTitle(tab)
                      setActiveTab(index)}}
                    key={index}
                    style ={{
                      flex : 0.5, alignSelf :"center", alignItems :"center",
                      borderBottomWidth : 1,
                      borderBottomColor : activeTab === index ? colors.accent : colors.shadow,
                      paddingBottom : 8,
                      zIndex : 5
                    }}
                    ><Text key={index} style={{
                      color : activeTab === index ? colors.accent : colors.text.secondary,
                      fontFamily : FONTS.jamsil.light2,
                      fontSize : 16
                    }}> {tab} </Text>
                    </TouchableOpacity>
                ))}
                </View>
              </View>
    )
}