import { Href, router} from "expo-router"
import {
    Text,
    TouchableOpacity,
    View
} from "react-native"
import { FONTS } from '@/constants/fonts/Fonts';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

interface BackHeaderProps{
    headerText :string;
    backTo?: string | { pathname: string; params?: Record<string, any> };
}

/**
 * #### 작은 헤더 컴포넌트 입니다.
 * 
 * - **headerText** : 헤더에 쓰일 글씨입니다.
*/
export default function BackHeader({headerText, backTo} : BackHeaderProps) {
    const handleBack = () => {
        if(!backTo) return router.back();

        if(typeof backTo === 'string') router.replace(backTo as any);
        else {
            router.replace({
                pathname: backTo.pathname as any,
                params: backTo.params
            })
        }
    }
    return (
        <View style ={{flexDirection : "row", paddingVertical: 32, paddingHorizontal: 10,
            alignItems : "center"
        }}>
        <TouchableOpacity onPress={handleBack}>
            <FontAwesomeIcon icon={faChevronLeft} size={24} color='gray' />
        </TouchableOpacity>
        <View style = {{flex:1}}/>
        <Text style={{
            fontFamily : FONTS.jamsil.medium4,
            fontSize : 24,
            justifyContent : "center",

        }}>{headerText}</Text>
        <View style = {{flex:1}}/>
        <View style = {{width:24}}/>
        </View>
    )
}