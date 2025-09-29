import { inquireTransactionHistoryByUniqueNo, openAccountAuth } from "@/api/SSAFYOpenapi";
import BottomActionButton from "@/components/buttons/BottomButton";
import AccountCard from "@/components/cards/AccountCard";
import BackHeader from "@/components/header/BackHeader";
import AccountAuthModal from "@/components/modal/AccountAuthModal";
import LabelTextInput from "@/components/textInput/LabelTextInput";
import { colors } from "@/constants/colors/ColorTheme";
import { useSignUpStore } from "@/store/useSignUpStore";
import { SSAFY_MAIN_API_KEY, SSAFY_MAIN_USER_ACCOUNT, SSAFY_MAIN_USER_KEY } from "@env";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function MyAccountInsertion(){
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const signUpStore = useSignUpStore();
    const [bank, setBank] = useState("한국 은행");
    const [accountNum, setAccountNum] = useState(SSAFY_MAIN_USER_ACCOUNT);
    
    // Modal 관련 상태
    const [modalVisible, setModalVisible] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [inputAccountAuth, setInputAccountAuth] = useState("");
    const [inputAccountText, setInputAccountText] = useState("");

    const api_key = SSAFY_MAIN_API_KEY;
    const user_key = SSAFY_MAIN_USER_KEY;

    const handleAccountAuth = async () => {
      console.log("ㅋㅋㅋ")
        try {
            if(!isSent){
              
                const openAuth = await openAccountAuth({
                    apiKey: api_key,
                    userKey: user_key,
                    accountNo: accountNum,
                    authText: 'SSAFY'
                });
              
                const transactionUniqueNo = openAuth.REC.transactionUniqueNo;
                console.log("1원 인증 성공 : ", transactionUniqueNo);

                const res = await inquireTransactionHistoryByUniqueNo({
                    apiKey: api_key,
                    userKey: user_key,
                    accountNo: accountNum,
                    transactionUniqueNo: transactionUniqueNo
                });

                console.log("거래 조회 : ", res);
                console.log(signUpStore.registerForm)
                const code = res.REC.transactionSummary;
                const authText = code.split(" ")[0];
                const authCode = code.split(" ")[1];

                setInputAccountAuth(authCode);
                setInputAccountText(authText);
                setIsSent(true);
            } else {
                console.log("이미 보냈습니다. 계좌를 확인하세요");
            }
            setModalVisible(true);
        } catch(err: any){
            
        }
    }

    return (
        <SafeAreaView style = {[styles.rootContainer, {paddingHorizontal : insets.left + 16}]}>
            <BackHeader
            headerText="계좌 추가 및 수정"
            />
            <View style ={{
                borderColor : colors.main,
                borderWidth : 1,
                borderStyle :"dashed",
                padding : 24,
                justifyContent : "center",
                alignContent : "center",
                marginBottom : 40
            }}>
                <AccountCard
                    bankname={bank}
                    bankAccountNum={accountNum}
                    existBorder = {false}
                    enableLink ={false}
                />
            </View>

            <View style ={{gap : 24}}>
                <LabelTextInput
                    titleText="은행"
                    disabled ={true}
                    onChangeText={(s) => {setBank(s)}}
                    value={bank}
                    placeHolder="은행 이름"
                />

                <LabelTextInput
                    titleText="계좌 번호"
                    onChangeText={(s) => {setAccountNum(s)}}
                    value={accountNum}
                    placeHolder="계좌 번호"
                />
            </View>

            <View style ={{flex : 1}}/>
            <View style = {[styles.footerContainer, {
                flexDirection : "row",
                marginBottom : insets.bottom + 10}
            ]}>
                <BottomActionButton
                    containerStyle = {{flex:1}}
                    label ="뒤로 가기"
                    onPress = {() => router.push("/")}
                />
                <BottomActionButton
                    containerStyle = {{flex : 1}}
                    label ="계좌 인증"
                    onPress = {async ()=>{
                      console.log("계좌 인증 시작")
                      await handleAccountAuth()
                    }}
                />
            </View>

            {/* 계좌 인증 모달 */}
            <AccountAuthModal
                inputAccountAuth={inputAccountAuth}
                inputAccountText={inputAccountText}
                modalVisible={modalVisible}
                setInputAccountAuth={setInputAccountAuth}
                setModalVisible={setModalVisible}
                footerButtonStyle={{height:40, borderRadius:20, paddingHorizontal:16}}
                inputFieldStyle={{paddingLeft:16, borderWidth:1, borderRadius:10, height:40}}
                accountNum={accountNum}
                apiKey={api_key}
                userKey={user_key}
                registerRequest={signUpStore.registerForm}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
  rootContainer : {
    flex : 1
  },
  footerContainer : {
    alignItems :"center",
    justifyContent :"center",
    gap : 12,
    marginBottom : 0,
  },
});
