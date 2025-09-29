import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Pressable, Alert} from "react-native";
import { responsePayslip } from "@/api/payslip/responsePayslip";
import { getPayslipDetail, PayslipDetailData } from "@/api/payslip/getPayslipDetail";

import PayslipDetailModal from "@/app/payslip/common/components/PayslipDetailComponent";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";

interface PayslipModalProps {
    storeId: number;
    payslipId: number;
    storeName: string;
    isResponse: boolean;
    messageId: string;
    closeModal: () => void;
    onUpdate?: () => void;
}

const handlePayslipesponse = async (
    storeId: number,
    payslipId: number, 
    action: boolean,
    messageId: string,
    closeModal: () => void,
    onUpdate?: () => void
) => {
    try {
        await responsePayslip(storeId, payslipId, messageId, action);
         Alert.alert(
            "요청 완료",
            "응답을 전송했습니다.",
            [{ text: "확인", onPress: () => {
                onUpdate?.();
                closeModal()
             }}
            ]
        );
    } catch (error) {
        
         Alert.alert(
            "ERROR",
            "오류가 발생했습니다.",
            [{ text: "확인", onPress: () => closeModal() }]
        );
    }
};


const PayslipModal = ({ storeId, payslipId, storeName, isResponse, messageId, closeModal, onUpdate }: PayslipModalProps) => {
    const [payslipInfo, setPayslipInfo] = useState<PayslipDetailData | null>(null);
    const [modalLoading, setModalLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        const fetchPayslip = async () => {
            try {
                setModalLoading(true);
                setFetchError(false);
                const data = await getPayslipDetail(storeId, payslipId);
                setPayslipInfo(data);
            } catch (err) {
                setFetchError(true);
                setPayslipInfo(null);
            } finally {
                setModalLoading(false);
            }
            };
        fetchPayslip();
    }, [storeId])
    
    if(modalLoading){
        return (
            <View style={{flex:1, alignContent: "center", alignItems: "center", justifyContent: "center"}}>
                <ActivityIndicator/>
                <Text>로딩중..</Text>
            </View>
        )
    }
  

  return (
    <View style={{flex: 1}}>
        
        <View style={styles.dragHandle} />        
        <View style={styles.tabContainer}>
            <Text style={styles.tabText}>{storeName}</Text>
        </View>
            
        <View style={styles.container}>
            {fetchError ? (
                <View style={{flexDirection: "row", paddingTop: 20, justifyContent: "center"}}>
                    <Text style={{ fontSize: sizes.bigText, fontFamily: FONTS.jamsil.medium4, color: colors.reject}}>거절</Text>
                    <Text style={{ fontSize: sizes.bigText, fontFamily: FONTS.jamsil.medium4, color: colors.text.primary}}>한 급여명세서입니다.</Text>
                </View>
            ) : (
                <PayslipDetailModal payslip={payslipInfo} />
            )}
            {
                !isResponse &&  !fetchError && (
                <View style={{ flexDirection: "row", width: '100%', justifyContent: "space-evenly" }}>
                    <Pressable style={[styles.button, { backgroundColor: "#FCC373" }]} onPress={() => handlePayslipesponse(storeId, payslipId, true, messageId, closeModal, onUpdate)}>
                        <Text style={styles.buttonText}>수락</Text>
                    </Pressable>

                    <Pressable style={[styles.button, { backgroundColor: "#FF8787" }]} onPress={() => handlePayslipesponse(storeId, payslipId, false, messageId, closeModal, onUpdate)}>
                        <Text style={styles.buttonText}>거절</Text>
                    </Pressable>
                </View>
            )}
        </View>
    </View>

  );
};

export default PayslipModal;

const styles = StyleSheet.create({
  buttonText: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.thin1, color: 'white' },
  button: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 40 },
  dragHandle: { width: 40, height: 4, backgroundColor: colors.text.secondary, borderRadius: 2, alignSelf: "center", marginBottom: 24 },
  tabContainer: { alignItems: "center", paddingBottom: 16 },
  tabText: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.regular3, color: colors.text.primary, paddingBottom: 10 },
  container: { flex: 1, paddingTop: 20, borderColor: "#D9D9D9", borderWidth: 1, borderRadius: 27, marginHorizontal: 20 }
});
