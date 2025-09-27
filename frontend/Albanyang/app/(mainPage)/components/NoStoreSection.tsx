import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

const NoStoreSection = () => {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyTitle}>알바를 구해봅시다!</Text>
        <Text style={styles.emptySubtitle}>등록된 사업장이 없습니다</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
    emptyContent: { alignItems: 'center' },
    emptyTitle: { fontSize: sizes.smallTitle, fontFamily: FONTS.jamsil.bold5, color: colors.text.primary, marginBottom: 8, textAlign: 'center' },
    emptySubtitle: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center' },
});

export default NoStoreSection;

