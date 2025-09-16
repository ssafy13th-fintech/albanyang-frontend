import * as Font from 'expo-font';
import { FONTS } from '@/constants/fonts/Fonts'
import { useState, useEffect } from 'react';
import 'react-native-reanimated';
import { Slot } from 'expo-router';

export default function RootLayout() {
  const [loaded, setLoaded]  = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        [FONTS.jamsil.light2]: require('../assets/fonts/The-Jamsil-2-Light.ttf'),
        [FONTS.jamsil.regular3]: require('../assets/fonts/The-Jamsil-3-Regular.ttf'),
        [FONTS.jamsil.medium4] : require('../assets/fonts/The-Jamsil-4-Medium.ttf'),
        [FONTS.jamsil.bold5] : require('../assets/fonts/The-Jamsil-5-Bold.ttf')
      });
      setLoaded(true);
    }
    loadFonts();
  }, []);

  if (!loaded) return null;

  return <Slot />; // ✅ 라우팅 슬롯
}
