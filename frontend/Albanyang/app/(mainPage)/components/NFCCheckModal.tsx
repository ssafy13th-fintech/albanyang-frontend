import { Alert, Animated, Dimensions, Pressable, StyleSheet, Text, View, Modal, PanResponder } from "react-native";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useEffect, useRef, useState } from "react";
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props{
  visible: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
  isCheckIn: boolean;
}

const checkNFCAvailability = async (): Promise<{available: boolean, message: string}> => {
  try {
    const isSupported = await NfcManager.isSupported();
    if (!isSupported) {
      return { available: false, message: '이 기기는 NFC를 지원하지 않습니다.' };
    }

    const isEnabled = await NfcManager.isEnabled();
    if (!isEnabled) {
      return { available: false, message: 'NFC가 비활성화되어 있습니다. 설정에서 NFC를 활성화해주세요.' };
    }

    return { available: true, message: 'NFC 사용 가능' };
  } catch (error) {
    return { available: false, message: 'NFC 상태 확인 중 오류가 발생했습니다.' };
  }
};

const readNFCTag = async (): Promise<boolean> => {
  try {
    await NfcManager.start();
    
    const isEnabled = await NfcManager.isEnabled();
    if (!isEnabled) {
      console.log('NFC가 비활성화되어 있습니다.');
      return false;
    }

    await NfcManager.requestTechnology(NfcTech.Ndef, {
      alertMessage: 'NFC 태그에 휴대폰을 가까이 대주세요',
    });
    
    const tag = await NfcManager.getTag();
    console.log('NFC Tag detected:', tag);

    const isValidTag = validateStoreTag(tag);
    return isValidTag;
    
  } catch (error) {
    console.error('NFC 읽기 실패:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('cancelled') || errorMessage.includes('timeout')) {
      return false;
    }
    return false;
  } finally {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.log('NFC 해제 중 오류:', error);
    }
  }
};

const validateStoreTag = (tag: any): boolean => {
  try {
    if (!tag || !tag.id) {
      console.log('유효하지 않은 태그');
      return false;
    }

    console.log('태그 ID:', tag.id);
    console.log('태그 타입:', tag.techTypes);

    return true;
    
  } catch (error) {
    console.error('태그 검증 중 오류:', error);
    return false;
  }
};

const NFCCheckModal = ({ visible, onClose, onSuccess, isCheckIn }: Props) => {
  const [nfcStatus, setNfcStatus] = useState<'waiting' | 'checking' | 'success' | 'error' | 'disabled'>('waiting');
  const [statusMessage, setStatusMessage] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('ko-KR', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (visible) {
      checkInitialNFCStatus();
    }
  }, [visible]);

  const checkInitialNFCStatus = async () => {
    const nfcCheck = await checkNFCAvailability();
    if (!nfcCheck.available) {
      setNfcStatus('disabled');
      setStatusMessage(nfcCheck.message);
    } else {
      setNfcStatus('waiting');
      setStatusMessage(`아직 ${isCheckIn ? '출근' : '퇴근'}하지 않았어요`);
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: SCREEN_HEIGHT,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();
    }
  }, [visible]);

  useEffect(() => {
    if (nfcStatus === 'checking') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      scaleAnim.setValue(1);
    }
  }, [nfcStatus]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return gestureState.dy > 0 && gestureState.dy > Math.abs(gestureState.dx);
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        onClose();
      } else {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  const handleNFCCheck = async () => {
    if (nfcStatus === 'disabled') {
      const nfcCheck = await checkNFCAvailability();
      if (!nfcCheck.available) {
        setStatusMessage(nfcCheck.message);
        return;
      } else {
        setNfcStatus('waiting');
        setStatusMessage(`아직 ${isCheckIn ? '출근' : '퇴근'}하지 않았어요`);
        return;
      }
    }

    setNfcStatus('checking');
    setStatusMessage('NFC 태그를 확인 중...');
    
    try {
      const isValid = await readNFCTag();
      if (isValid) {
        setNfcStatus('success');
        setStatusMessage(`${isCheckIn ? '출근' : '퇴근'} 완료!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setNfcStatus('error');
        setStatusMessage('NFC 인식 실패. 다시 시도해주세요.');
        setTimeout(() => {
          setNfcStatus('waiting');
          setStatusMessage(`아직 ${isCheckIn ? '출근' : '퇴근'}하지 않았어요`);
        }, 2000);
      }
    } catch (error) {
      setNfcStatus('error');
      setStatusMessage('NFC 인식 실패. 다시 시도해주세요.');
      setTimeout(() => {
        setNfcStatus('waiting');
        setStatusMessage(`아직 ${isCheckIn ? '출근' : '퇴근'}하지 않았어요`);
      }, 2000);
    }
  };

  const getButtonText = () => {
    switch (nfcStatus) {
      case 'waiting': return `${isCheckIn ? '출근' : '퇴근'} 체크`;
      case 'checking': return '확인 중...';
      case 'success': return '완료';
      case 'error': return '재시도';
      case 'disabled': return 'NFC 설정 확인';
      default: return '';
    }
  };

  const getButtonColor = () => {
    switch (nfcStatus) {
      case 'waiting': return isCheckIn ? colors.subAccent : colors.main;
      case 'checking': return colors.text.secondary;
      case 'success': return '#4CAF50';
      case 'error': return colors.reject;
      case 'disabled': return colors.reject;
      default: return colors.main;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Animated.View
          style={[modalStyles.container, { transform: [{ translateY: slideAnim }] }]}
          {...panResponder.panHandlers}
        >
          <View style={modalStyles.dragHandle} />
          
          <View style={modalStyles.header}>
            <Text style={modalStyles.dayText}>월</Text>
            <View style={[modalStyles.dateCircle, { backgroundColor: isCheckIn ? colors.subAccent : colors.main }]}>
              <Text style={modalStyles.dateText}>{new Date().getDate()}</Text>
            </View>
            <Text style={modalStyles.dayText}>화</Text>
          </View>

          <Text style={modalStyles.timeText}>{currentTime}</Text>

          <Text style={[
            modalStyles.statusText,
            nfcStatus === 'success' && { color: '#4CAF50' },
            nfcStatus === 'error' && { color: colors.reject },
            nfcStatus === 'disabled' && { color: colors.reject }
          ]}>
            {statusMessage}
          </Text>

          <View style={modalStyles.nfcContainer}>
            <Ionicons
              name="wifi" 
              size={80} 
              color={nfcStatus === 'disabled' ? colors.reject : colors.text.secondary} 
            />
            <Text style={modalStyles.nfcLabel}>NFC</Text>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              style={[
                modalStyles.checkButton,
                { backgroundColor: getButtonColor() },
                nfcStatus === 'checking' && modalStyles.checkButtonDisabled
              ]}
              onPress={handleNFCCheck}
              disabled={nfcStatus === 'checking' || nfcStatus === 'success'}
            >
              <Text style={modalStyles.checkButtonText}>{getButtonText()}</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.text.reverse,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 32,
    paddingTop: 12,
    paddingBottom: 40,
    minHeight: 400,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.text.secondary,
    borderRadius: 2,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 20,
  },
  dayText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },
  dateCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: sizes.middleTitle,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
  timeText: {
    fontSize: 48,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    marginBottom: 16,
  },
  statusText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  nfcContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  nfcLabel: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
    marginTop: 8,
  },
  checkButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 24,
    minWidth: 200,
    alignItems: 'center',
  },
  checkButtonDisabled: {
    opacity: 0.7,
  },
  checkButtonText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.reverse,
  },
});

export default NFCCheckModal;