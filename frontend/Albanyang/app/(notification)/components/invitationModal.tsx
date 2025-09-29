import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Pressable, Alert} from "react-native";
import { getStore } from "@/api/store/getStore";
import { responseInvitation } from "@/api/staff/responseInvitation";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";


export interface Alarm{
  id: number;
  messageId: String;
  screen: String;
  title: String;
  isRead: boolean;
  isResponse: boolean;
  date: String;
}

interface InvitationModalProps {
    storeId: number;
    isResponse: boolean;
    closeModal: () => void;
    onUpdate?: () => void;
}

const handleInvitationResponse = async (
    action: boolean, 
    storeId: number, 
    closeModal: () => void,
    onUpdate?: () => void
) => {
    try {
        await responseInvitation(storeId, action);
         Alert.alert(
            "요청 완료",
            "응답을 전송했습니다.",
            [{ text: "확인", onPress: () => {
                onUpdate?.();
                closeModal()
            } 
        }]
        );
    } catch (error) {
        
         Alert.alert(
            "ERROR",
            "오류가 발생했습니다.",
            [{ text: "확인", onPress: () => closeModal() }]
        );
    }
};


const InvitationModal = ({ storeId, isResponse, closeModal, onUpdate }: InvitationModalProps) => {
    const [storeInfo, setStoreInfo] = useState<any>(null);
    const [modalLoading, setModalLoading] = useState(true);

    useEffect(() => {
        const fetchStore = async () => {
            try {
                setModalLoading(true);
                const data = await getStore(storeId);
                setStoreInfo(data);
            } catch (err) {
                
            } finally {
                setModalLoading(false);
            }
            };
            fetchStore();
        }, [storeId]
    )
    
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
            <Text style={styles.tabText}>합류 요청</Text>
        </View>
        
            
        <View style={styles.container}>
            <View style={{paddingBottom: 5}}>
                <Text style={styles.noticeTitle}>{storeInfo.name}</Text>
            </View>

            <View style={styles.contentContainer}>
                <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 5}}>
                    <Text style={styles.label}>전화번호: </Text> 
                    <Text style={styles.value}>{storeInfo.officeNumber}</Text>
                </View>

                <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 5}}>
                    <Text style={styles.label}>주소: </Text> 
                    <Text style={styles.value}>{storeInfo.address}</Text>
                </View>

                <View style={{flexDirection: "row", alignItems: "center", paddingVertical: 5}}>
                    <Text style={styles.label}>월급일: </Text> 
                    <Text style={styles.value}>{storeInfo.payDay}</Text>
                </View>
            </View>
        
            {
                !isResponse && 
                <View style={{ flexDirection: "row", width: '100%', justifyContent: "space-evenly" }}>
                    <Pressable style={[styles.button, { backgroundColor: "#FCC373" }]} onPress={() => handleInvitationResponse(true, storeId, closeModal, onUpdate)}>
                        <Text style={styles.buttonText}>수락</Text>
                    </Pressable>

                    <Pressable style={[styles.button, { backgroundColor: "#FF8787" }]} onPress={() => handleInvitationResponse(false, storeId, closeModal, onUpdate)}>
                        <Text style={styles.buttonText}>거절</Text>
                    </Pressable>
                </View>
            }

            
        </View>
    </View>

  );
};

export default InvitationModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    buttonText: {
        fontSize: sizes.smallTitle,
        fontFamily: FONTS.jamsil.thin1,
        color: 'white',
    },
    button: {
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 40
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: colors.text.secondary,
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 24,
    },
    tabContainer: {
        alignItems: "center",
        paddingBottom: 16,
    },
    tabText: {
        fontSize: sizes.smallTitle,
        fontFamily: FONTS.jamsil.regular3,
        color: colors.text.primary,
        paddingBottom: 10
    },
    container: {
        paddingTop: 20,
        justifyContent: "center",
        alignContent: "center",
        alignItems: "center",
        borderColor: "#D9D9D9",
        borderWidth: 1,
        borderRadius: 27,
        marginHorizontal: 30,
        paddingVertical: 30
    },
    contentContainer: {
        paddingTop: 15,
        paddingBottom: '100%'
    },
    label: {
        fontSize: 16,
        fontFamily: FONTS.jamsil.regular3,
        color: colors.text.secondary,
    },
    value: {
        fontSize: sizes.bigText,
        fontFamily: FONTS.jamsil.regular3,
        color: colors.text.primary,
    },
    noticeTitle: {
        fontSize: 22,
        fontFamily: FONTS.jamsil.bold5,
        color: colors.text.primary,
    },
    noticeContent: {
        fontSize: sizes.normalText,
        fontFamily: FONTS.jamsil.thin1,
        color: colors.text.secondary,
        paddingTop: 15
    },
    noticeDate: {
        fontSize: sizes.smallText,
        fontFamily: FONTS.jamsil.regular3,
        color: colors.text.secondary,
        paddingVertical: 5,
        borderBottomColor: colors.shadow,
        borderBottomWidth: 0.3
    },
});
