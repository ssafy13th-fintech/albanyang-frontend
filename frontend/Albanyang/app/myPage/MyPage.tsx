import { Text } from "@react-navigation/elements";
import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { Mascot } from "@/constants/images/mascot";
import { sizes } from "@/constants/size/FontSize";


export default function MyPage() {
    const insets = useSafeAreaInsets();
    let [name , setName] = useState("김알바");
    const [phoneNum, setPhoneNum] = useState("010-0000-0000")
    const [age , setAge] = useState("30대")
    const [gender, setGender] = useState("성별")
    const [email, setEmail] = useState("testEmail@gmail.com")
    const [bankname, setBankName] = useState<string|null>("국민")
    const [bankAccountNum, setBankAccountNum] = useState<string|null>("000-0000-000000")
    const isAlba = 1;


    const mascot_path = isAlba === 1 ? Mascot.mascot_basic_alba : Mascot.mascot_basic_boss;
    const isAlbaShowInfo = isAlba === 1 ? "알바생" : "사장님";
    // const isAccountExist = bankname === null  || bankAccountNum === null ?   

    const items = ["내 정보 수정", "계좌 등록 및 수정", "통계", "회원 탈퇴"]
    const views = [];


    for(let i=0; i<items.length; ++i){
        
        views.push(<Pressable style={({pressed})=>[{
            flexDirection : "row",
            alignItems :"center",
            paddingVertical : 24,
            backgroundColor : pressed ? colors.disable : "transparent"
        }]}>
            <Image
                source={require("@/assets/images/icon/icon_insert.png")}
                style = {{width : 24, height : 24, marginRight :16}}
            />
            <Text style = 
            {{
                fontFamily : FONTS.jamsil.regular3,
                fontSize : sizes.normalText
            }} 
            key={i}>{items[i]}</Text>
            <View style = {{flex:1}}></View>
            <Text style = {{
                fontFamily : FONTS.jamsil.regular3,
                fontSize : sizes.normalText
            }}>{">"}</Text>
            </Pressable>)
        if(i < items.length-1){
            views.push(<View style = {{
                borderBottomWidth:1,
                borderColor : colors.shadow,
                opacity : 0.5
            }}>

            </View>)
        }

    }

    return (
        <SafeAreaView style = {{flex :1}}>
        <ScrollView
            contentContainerStyle = {{padding: 16}}
        > 
            <View style = {[styles.introduceCard, {flexDirection : "row"}]}>
                <View>
                <View style = {{flexDirection : "row", marginBottom : 18}}>
                <Text style = {{
                    fontFamily : FONTS.jamsil.medium4,
                    fontSize : sizes.middleTitle
                }}>{name}   
                <Text style ={
                    {
                        fontFamily : FONTS.jamsil.medium4,
                        fontSize : sizes.smallTitle
                    } 
                }>  {isAlbaShowInfo}</Text>
                </Text>
                </View>

                <View style = {{gap : 8, marginTop : 18, paddingVertical : 8}}>
                    <Text style = {{fontFamily:FONTS.jamsil.light2}}>전화번호 : <Text style = {{fontFamily :FONTS.jamsil.light2}}>{phoneNum}</Text></Text>
                    <Text style = {{fontFamily:FONTS.jamsil.light2}}>나이 : <Text style = {{fontFamily :FONTS.jamsil.light2}}>{age}</Text></Text>
                    <Text style = {{fontFamily:FONTS.jamsil.light2}}>이메일 : <Text style = {{fontFamily :FONTS.jamsil.light2}}>{email}</Text></Text>
                    <Text style = {{fontFamily:FONTS.jamsil.light2}}>성별 : <Text style = {{fontFamily :FONTS.jamsil.light2}}>{gender}</Text></Text>
                </View>
                </View>
                <Image
                    source ={mascot_path}
                    style = {{marginLeft : 10}}
                >
                </Image>

            </View>
        
            <View style = {{paddingVertical : 16}}>
                <Text style ={{
                    fontFamily :FONTS.jamsil.regular3,
                    fontSize : sizes.normalText
                    }}>등록된 <Text style ={{
                    fontFamily :FONTS.jamsil.regular3,
                    fontSize : sizes.normalText,
                    color : colors.main
                    }} >입금</Text>계좌</Text>

                <View style = {styles.accountCard}>
                    <View style = { { 
                        backgroundColor : colors.main, 
                        borderTopRightRadius : 5,
                        borderTopLeftRadius : 5,
                        width:240, 
                        height:130, 
                        marginVertical : 8
                        }}></View>
                    <View style = { { marginTop : 8}}>
                    <Text
                    style = {{fontFamily : FONTS.jamsil.regular3,
                        fontSize : sizes.smallText
                    }}
                    >{bankname} 
                    <Text
                     style = {{fontFamily : FONTS.jamsil.light2,
                        fontSize : sizes.smallText
                    }}
                    
                    >   {bankAccountNum}</Text></Text>
                    </View>
                </View>
            </View>

            <View style = {{marginVertical : 16}}>
                    {views}
            </View>
        </ScrollView>
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    introduceCard :{
        backgroundColor : colors.main,
        borderRadius : 10,
        paddingTop : 32,
        paddingHorizontal : 16,
        paddingBottom : 16,
        marginBottom :24
    },
    accountCard : {
        borderColor : colors.accent,
        borderStyle : "dashed",
        borderWidth : 1,
        marginTop : 16,
        paddingVertical : 16,
        justifyContent : "center",
        alignItems : "center",
        boxShadow : "100"
    }
    

})