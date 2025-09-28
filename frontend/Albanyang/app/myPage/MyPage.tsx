import { Text } from "@react-navigation/elements";
import { useState } from "react";
import { Image, ImageSourcePropType, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { deleteToken } from "@/api/authorization/AuthTokenStorage";
import PanelMenuButton from "@/components/buttons/PanelMenuButton";
import AccountCard from "@/components/cards/AccountCard";
import NavBar from "@/components/navBar/NavBar";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { Mascot } from "@/constants/images/mascot";
import { sizes } from "@/constants/size/FontSize";
import { useMemberStore } from "@/store/useMemberStore";
import { router } from "expo-router";

interface PanelMenuItems{
    title : string,
    icon : ImageSourcePropType,
    action : ()=>void
}

export default function MyPage() {
    const insets = useSafeAreaInsets();
    const myInfo = useMemberStore();
    
    let [name , setName] = useState(myInfo.memberForm.name);
    const [phoneNum, setPhoneNum] = useState(myInfo.memberForm.phone)
    const [age , setAge] = useState(myInfo.memberForm.age)
    const [gender, setGender] = useState(myInfo.memberForm.gender)
    const [email, setEmail] = useState(myInfo.memberForm.email)
    const [bankname, setBankName] = useState<string|null>("한국은행")
    const [bankAccountNum, setBankAccountNum] = useState<string|null>(myInfo.memberForm.account);
    console.log("계좌 ",bankAccountNum)
    const isAlba = myInfo.memberForm.role === 'alba' ? 1 : 0

    const mascot_path = isAlba === 1 ? Mascot.mascot_basic_alba : Mascot.mascot_basic_boss;
    const isAlbaShowInfo = isAlba === 1 ? "알바생" : "사장님";
    // const isAccountExist = bankname === null  || bankAccountNum === null ?   

    const items : PanelMenuItems[] = [
        { title : "내 정보 수정", 
        icon : require("@/assets/images/icon/icon_insert.png"),
        action : () => {router.push("/myPage/MyInfoInsertionPage")}
        },
        { title : "계좌 등록 및 수정", 
        icon : require("@/assets/images/icon/icon_insert.png"),
            action : () => {router.push("/myPage/MyAccountInsertionPage")} },
        { title : "로그 아웃" , 
        icon : require("@/assets/images/icon/icon_insert.png"),
            action : async () => {
                await deleteToken();
                alert("로그아웃 되었습니다.")
                router.replace("/login/Login")
            } },
        { title : "회원 탈퇴", 
        icon : require("@/assets/images/icon/icon_insert.png"),
    action : () => {router.push("/myPage/WithDrawPage")} },
    ]
    const views : React.JSX.Element[] = [];


    for(let i=0; i<items.length; ++i){
        views.push(
            <PanelMenuButton
            buttonAction = {items[i].action}
            icon={items[i].icon}
            menuText= {items[i].title}
            key = {i}
            />
        )
        if(i < items.length-1){
            views.push(<View
                key={`divider-${i}`}
                style = {{
                borderBottomWidth:1,
                borderColor : colors.shadow,
                opacity : 0.5
            }}>
            </View>)
        }
    }

    return (
        <SafeAreaView style = {{flex :1, backgroundColor : "white"}}>
        <ScrollView
            contentContainerStyle = {{paddingHorizontal: 16}
        }
        > 
        <View style ={{
            elevation : 10, 
            backgroundColor : colors.main,
            borderRadius : 10,
            shadowRadius : 10,
            shadowColor :colors.shadow,
            marginBottom :24,
        }}>
            <View style = {[styles.introduceCard, {flexDirection : "row"}]}>
                <View style = {{flex : 1}}>
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
                    <Text style = {{fontFamily:FONTS.jamsil.light2}}>-전화번호 : <Text style = {{fontFamily :FONTS.jamsil.light2}}>{phoneNum}</Text></Text>
                    <Text style = {{fontFamily:FONTS.jamsil.light2}}>-나이 : <Text style = {{fontFamily :FONTS.jamsil.light2}}>{age}</Text></Text>
                    <Text style = {{fontFamily:FONTS.jamsil.light2}}>-이메일 : <Text style = {{fontFamily :FONTS.jamsil.light2}}>{email}</Text></Text>
                    <Text style = {{fontFamily:FONTS.jamsil.light2}}>-성별 : <Text style = {{fontFamily :FONTS.jamsil.light2}}>{gender}</Text></Text>
                </View>
                </View>

                <Image
                    source ={mascot_path}
                    style = {{marginLeft : 10, alignSelf : "center"}}
                >
                    
                </Image>

            </View>
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


              {bankAccountNum ?(
                    
                <AccountCard
                    bankname={bankname!}
                    bankAccountNum={bankAccountNum}
                />
                
                ) :(
                    <View style= {[styles.accountCard,
                        {paddingVertical : 36, paddingHorizontal : 16}]
                    }>
                    
                    <TouchableOpacity
                        onPress={() => {
                            router.push("/myPage/MyAccountInsertionPage")
                        }}
                        style = {{
                            
                            flexDirection : "row",
                            paddingVertical : 16,
                            paddingHorizontal : 8,
                            borderRadius : 20
                        }}
                    >
                    <Image
                        source ={require("@/assets/images/mascot/mascot_sadface_line.png")}
                        style = {
                            {
                                height : 118,
                                width :118
                            }
                        }
                    >
                    </Image>
                    <View style ={{ alignItems :"flex-end", gap : 8 }}>
                    <Text style ={{fontFamily : FONTS.jamsil.medium4,
                    fontSize : sizes.smallTitle
                    }}>계좌가 없어요...</Text>
                    <Text style ={{
                        fontFamily : FONTS.jamsil.regular3,
                        fontSize : sizes.normalText,
                        color : colors.accent}}>새 계좌 등록하기</Text>
                    </View>
                    </TouchableOpacity>

                    </View>
                    
                ) }

            </View>

            <View style = {{marginVertical : 16}}>
                    {views}
            </View>
        <View style = {{paddingBottom : 24}}></View>
        </ScrollView>
        <NavBar
            role={myInfo.memberForm.role!}
        />
        </SafeAreaView>

    )
}

const styles = StyleSheet.create({
    introduceCard :{
        //backgroundColor : colors.main,
        paddingVertical : 32,
        paddingHorizontal : 12,
       
    },
    accountCard : {
        borderColor : colors.main,
        borderRadius : 10, 
        borderWidth: 1,
        marginTop : 16,
        paddingVertical : 16,
        justifyContent : "center",
        alignItems : "center",
        boxShadow : "100"
    }
})