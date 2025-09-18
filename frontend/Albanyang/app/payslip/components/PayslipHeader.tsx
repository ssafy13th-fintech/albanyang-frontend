
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FONTS } from '../../../constants/fonts/Fonts';

const PayslipHeader = () => {
    return (
        <SafeAreaView style={styles.header}>
                <Text style={styles.headerTitle}>급여명세서 목록</Text>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30, 
        paddingHorizontal: 16
        // backgroundColor: 'pink'
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: FONTS.jamsil.thin1,
    },
});

export default PayslipHeader;