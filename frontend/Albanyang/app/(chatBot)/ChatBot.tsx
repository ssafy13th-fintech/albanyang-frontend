import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { getChatbotHistories, sendChatbotQuery } from '@/api/Chatbot';
import NavBar, { Role } from "@/components/navBar/NavBar";
import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';
import { useMemberStore } from "@/store/useMemberStore";

// 메시지 타입 정의
interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function ChatbotPage() {
  const memberStore = useMemberStore();
  const myRole = memberStore.memberForm.role;

  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const [role, setRole] = useState<Role>(myRole ? myRole : 'alba');

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 챗봇 내역 로드
  useEffect(() => {
    loadChatHistory();
  }, []);

  // 새 메시지가 추가될 때 스크롤을 맨 아래로
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // 챗봇 내역 로드 함수
  const loadChatHistory = async () => {
    try {
      setIsLoading(true);
      console.log('챗봇 내역 로드 시작');
      
      const response = await getChatbotHistories(undefined, 20);
      console.log('챗봇 내역 API 응답:', response);
      
      if (response.data?.chatbotHistories && response.data.chatbotHistories.length > 0) {
        console.log('기존 내역 발견:', response.data.chatbotHistories.length, '개');
        // 기존 내역이 있는 경우
        const historyMessages: Message[] = [];
        
        response.data.chatbotHistories.forEach((history) => {
          // 사용자 메시지 추가
          historyMessages.push({
            id: history.chatbotId * 2,
            text: history.userMessage,
            isBot: false,
            timestamp: new Date()
          });
          
          // 봇 메시지 추가
          historyMessages.push({
            id: history.chatbotId * 2 + 1,
            text: history.chatbotMessage,
            isBot: true,
            timestamp: new Date()
          });
        });
        setMessages(historyMessages);
      } else {
        console.log('기존 내역 없음, 초기 환영 메시지 표시');
        // 내역이 없는 경우 초기 환영 메시지
        setMessages([{
          id: 1,
          text: "반가워요, 알바냥이에요!\n무엇을 도와드릴까요?",
          isBot: true,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('챗봇 내역 로드 오류:', error);
      console.log('오류 상세 정보:', JSON.stringify(error, null, 2));
      
      // 오류 시 초기 환영 메시지
      setMessages([{
        id: 1,
        text: "반가워요, 알바냥이에요!\n무엇을 도와드릴까요?",
        isBot: true,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText.trim(),
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText("");
    setIsTyping(true);

    try {
      console.log('챗봇 메시지 전송 시작:', currentInput);
      // API 호출
      const response = await sendChatbotQuery(currentInput);
      console.log('챗봇 API 전체 응답:', JSON.stringify(response, null, 2));
      console.log('응답 데이터 구조:', response.data);
      
      if (response.data?.chatbotMessage) {
        console.log('정상 챗봇 응답:', response.data.chatbotMessage);
        const botResponse: Message = {
          id: Date.now() + 1,
          text: response.data.chatbotMessage,
          isBot: true,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        console.log('챗봇 응답 데이터 없음. 전체 응답:', response);
        console.log('response.data:', response.data);
        console.log('response.data.chatbotMessage:', response.data?.chatbotMessage);
        
        // API 오류 시 오류 메시지
        const errorResponse: Message = {
          id: Date.now() + 1,
          text: "죄송해요, 현재 서비스에 문제가 있어요. 잠시 후 다시 시도해주세요.",
          isBot: true,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (error) {
      console.error('챗봇 API 오류:', error);
      console.log('상세 에러 정보:', JSON.stringify(error, null, 2));
      
      let errorMessage = "네트워크 연결을 확인해주세요. 인터넷 연결이 불안정합니다.";
      
      const errorString = error instanceof Error ? error.message : String(error);
      console.log('에러 메시지:', errorString);
      
      if (errorString.includes('timeout') || errorString.includes('ECONNABORTED')) {
        errorMessage = "응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
        console.log('타임아웃 에러 감지');
      } else if (errorString.includes('status')) {
        errorMessage = "서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.";
        console.log('상태 코드 에러 감지');
      }
      
      // 네트워크 오류 시 오류 메시지
      const errorResponse: Message = {
        id: Date.now() + 1,
        text: errorMessage,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading && (
            <View style={[styles.messageWrapper, styles.botMessageWrapper]}>
              <View style={[styles.messageBubble, styles.botBubble]}>
                <Text style={[styles.messageText, styles.botText]}>
                  대화 내역을 불러오고 있어요...
                </Text>
              </View>
            </View>
          )}

          {!isLoading && messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.isBot ? styles.botMessageWrapper : styles.userMessageWrapper
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  message.isBot ? styles.botBubble : styles.userBubble
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isBot ? styles.botText : styles.userText
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </View>
          ))}
          
          {isTyping && (
            <View style={[styles.messageWrapper, styles.botMessageWrapper]}>
              <View style={[styles.messageBubble, styles.botBubble]}>
                <Text style={[styles.messageText, styles.botText]}>
                  답변을 준비하고 있어요...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { paddingBottom: 12 }]}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="메시지를 입력해주세요."
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              multiline
              returnKeyType="send"
            />
            <Pressable
              style={[
                styles.sendButton,
                (!inputText.trim() || isTyping) && styles.sendButtonDisabled
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() || isTyping}
            >
              <Text style={styles.sendButtonText}>➤</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

              <NavBar
              role={role}
              ></NavBar>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.disable,
  },
  keyboardView: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageWrapper: {
    marginBottom: 12,
  },
  botMessageWrapper: {
    alignItems: 'flex-start',
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  botBubble: {
    backgroundColor: colors.text.reverse,
    borderBottomLeftRadius: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: colors.main,
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    lineHeight: 22,
  },
  botText: {
    color: colors.text.primary,
  },
  userText: {
    color: colors.text.primary,
  },
  inputContainer: {
    backgroundColor: colors.text.reverse,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: colors.text.secondary,
  },
  sendButtonText: {
    fontSize: 18,
    color: colors.text.reverse,
  },
});