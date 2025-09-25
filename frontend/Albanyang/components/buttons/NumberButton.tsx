import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from "@/constants/size/FontSize";
import { Pressable, StyleSheet, Text } from "react-native";


interface NumberButtonProps{
    number : string,
    onPress :  () => void
}



export default function NumberButton({
    number, onPress
}: NumberButtonProps){
    return(
    <Pressable
      style={({ pressed }) => [
        styles.numberButton,
        pressed && styles.numberButtonPressed
      ]}
      onPress={onPress}
    >
      <Text style={styles.numberButtonText}>{number}</Text>
    </Pressable>
  );
}

  const styles = StyleSheet.create({
      numberButton: {
        flex: 1,
        height: 80,
        borderRadius: 16,
        backgroundColor: colors.text.reverse,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },

        numberButtonPressed: {
          backgroundColor: colors.disable,
          transform: [{ scale: 0.95 }],
        },
          numberButtonText: {
            fontSize: sizes.middleTitle,
            fontFamily: FONTS.jamsil.medium4,
            color: colors.text.primary,
          },
  })