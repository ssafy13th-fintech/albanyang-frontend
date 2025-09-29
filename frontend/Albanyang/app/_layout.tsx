import { FONTS } from '@/constants/fonts/Fonts';
import * as Font from 'expo-font';
import { Slot } from 'expo-router';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { getApp } from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';


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


    const app = getApp();
    // Android 13 이상이면 알림 권한 요청
    const requestNotificationPermission = async () => {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        console.log('Notification permission:', granted);
      } else if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        console.log('iOS notification permission:', authStatus);
      }
    };
    requestNotificationPermission();


    //console.log("token " ,getFcmToken());
    }, []);




  if (!loaded) return null;

  return <Slot />; // ✅ 라우팅 슬롯
}


   // FCM 토큰 가져오기
  export const getFcmToken = async () => {
      try {
        const token = await messaging().getToken();
        console.log('[+] FCM Token:', token);
        return token;
      } catch (err) {
        
      }
    };