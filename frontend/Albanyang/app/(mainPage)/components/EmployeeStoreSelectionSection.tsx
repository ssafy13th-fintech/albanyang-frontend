import React from "react";
import { ScrollView, Pressable, Text, View, StyleSheet } from "react-native";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { Store } from "@/api/store/getStaffStores";

interface EmployeeProps{
  stores: Store[], 
  selectedStoreIndex: number, 
  onStoreSelect: (index: number) => void,
  onStoreInfoPress: (storeId: number, storeName: string) => void
}


export default function EmployeeStoreSelectionSection({ stores, selectedStoreIndex, onStoreSelect, onStoreInfoPress }: EmployeeProps) {
  return (
    <View style={styles.section}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storeTabContainer}
      >
        {stores.map((store, index) => (
          <Pressable
            key={store.id}
            style={[
              styles.storeTab,
              selectedStoreIndex === index && styles.activeStoreTab
            ]}
            onPress={() => onStoreSelect(index)}
          >
            <Text style={[
              styles.storeTabText,
              selectedStoreIndex === index && styles.activeStoreTabText
            ]}>
              {store.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      
      <Pressable 
        style={styles.detailButton}
        onPress={() => onStoreInfoPress(Number(stores[selectedStoreIndex].id), stores[selectedStoreIndex].name)}
      >
        <Text style={styles.detailButtonText}>상세보기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginBottom: 12, paddingHorizontal: 20 },
  storeTabContainer: { flexDirection: 'row', gap: 4, paddingHorizontal: 4 },
  storeTab: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', minWidth: 120, alignItems: 'center' },
  activeStoreTab: { borderBottomColor: colors.accent },
  storeTabText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.text.secondary, textAlign: 'center' },
  activeStoreTabText: { color: colors.accent, fontFamily: FONTS.jamsil.medium4 },
  addStoreTab: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', minWidth: 120, alignItems: 'center' },
  addStoreTabText: { fontSize: sizes.normalText, fontFamily: FONTS.jamsil.regular3, color: colors.main, textAlign: 'center' },
  detailButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  detailButtonText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.reverse,
  },
});