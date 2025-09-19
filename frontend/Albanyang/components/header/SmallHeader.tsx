import {
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native"

interface SmallHeaderProps{
    paddingTopLen :number,
    paddingBottomLen? : number,
    headerText :string,
    headerTextFont : string,
    headerTextSize : number
}

/**
 * #### 작은 헤더 컴포넌트 입니다.
 * 
 * 뒤로가기와 제목으로 구성되어있습니다. 작은 헤더를 사용 할 때는 되도록 바닥 네비게이션을 쓰지 마세여
 * 
 * - **paddingTopLen** : 윗쪽 방향 패딩 길이, 이는 윗쪽 safe zone 으로 부터 얼만큼 밀어낼지를 의미합니다
 * - **paddingBottomLen** : 아랫 방향 패딩 길이, 이는 자기 아래 content와 header와 얼만큼의 거리를 벌릴지를 의미합니다.
 * - **headerText** : 헤더에 쓰일 글씨입니다.
 * - **headerTextFont** : 헤더의 폰트입니다.
 * - **headerTextSize** : 헤더의 크기값입니다. 
*/

export default function SmallHeader({
    paddingTopLen,
    paddingBottomLen = 0,
    headerText,
    headerTextFont,
    headerTextSize,
} : SmallHeaderProps) {
    return (
        <View style ={{flexDirection : "row", paddingTop : paddingTopLen, paddingBottom : paddingBottomLen,
            alignItems : "center"
        }}>
        <TouchableOpacity>
            <Image
                source = {require("@/assets/images/icon/icon_back.png")}
                style = {{width : 24, height : 20}}
            />
        </TouchableOpacity>
        <View style = {{flex:1}}/>
        <Text style={{
            fontFamily : headerTextFont,
            fontSize : headerTextSize,
            justifyContent : "center",

        }}>{headerText}</Text>
        <View style = {{flex:1}}/>
        <View style = {{width:24}}/>
        </View>
    )
}