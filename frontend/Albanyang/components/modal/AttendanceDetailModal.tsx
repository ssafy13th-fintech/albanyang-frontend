
import { MyStoresResponse } from "@/api/Staff";
import { TimesheetItem } from "@/api/Timesheet";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";



interface AttendanceDetailModalProps{
    modalVisible : boolean,
    setModalVisible : (v:boolean) => void,
    selectedDate : string,
    activeTab : number,
    stores : MyStoresResponse["stores"],
    selectedTimesheet : TimesheetItem
}


export default function AttendanceDetailModal({
    modalVisible,
    setModalVisible,
    selectedDate,
    stores,
    activeTab,
    selectedTimesheet,
} : AttendanceDetailModalProps){

    return(
           <Modal
                  isVisible={modalVisible}
                  onSwipeComplete={() => setModalVisible(false)}
                  swipeDirection="down"
                  animationIn="slideInUp"
                  animationOut="slideOutDown"
                  style={{ justifyContent: "flex-end", margin: 0 }} // 하단 모달 스타일
                >
                  <View style={{ backgroundColor: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20 }}>
                    <View style ={{gap : 24}}>
                    <Text style ={{fontFamily : FONTS.jamsil.medium4, fontSize : sizes.smallTitle,
                      alignSelf : "center"
                    }}>근태 현황 (상세) </Text>
                    <Text style={{ fontFamily :  FONTS.jamsil.regular3, 
                      fontSize : sizes.normalText,
                      paddingBottom : 32  }}>
                      선택한 날짜: {selectedDate}
                    </Text>
                    </View>
        
                    {/* {loaded ? (
                      <ActivityIndicator /> */}
               
                      {selectedTimesheet ? (
                      <View style ={{gap : 16}}>
                        <Text style = {{fontFamily : FONTS.jamsil.light2 }}>- 지점: {stores[activeTab].name}</Text>
                        <Text style = {{fontFamily : FONTS.jamsil.light2 }}>- 출근: {selectedTimesheet.arrivedAt ?? "-"}</Text>
                        <Text style = {{fontFamily : FONTS.jamsil.light2 }}>- 퇴근: {selectedTimesheet.leftAt ?? "-"}</Text>
                      </View>
                    ) : (
                      <View style ={{paddingBottom : 16}}>
                      <Text style ={{fontFamily : FONTS.jamsil.light2, 
                        fontSize : sizes.normalText,
                        alignSelf : "center"}}>해당 날짜의 근태 정보가 없습니다.</Text>
                      </View>
                    )}
        
                    <TouchableOpacity
                      style={{ marginTop: 16, alignSelf: "flex-end" }}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={{ color: colors.main }}>닫기</Text>
                    </TouchableOpacity>
                  </View>
                </Modal>
    )
}