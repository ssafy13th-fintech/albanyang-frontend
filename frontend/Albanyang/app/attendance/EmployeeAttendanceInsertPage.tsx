import SmallHeader from "@/components/header/SmallHeader";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";



export default function EmployeeAttendanceInsertPage(){
    const insets = useSafeAreaInsets();

    return (
        <SafeAreaView >
            <SmallHeader
               headerText={"직원 근태 수정"}
               headerTextFont={FONTS.jamsil.regular3}
               headerTextSize={sizes.smallTitle}
               isAblaBack={true}

            />

        </SafeAreaView>
    
    )

}