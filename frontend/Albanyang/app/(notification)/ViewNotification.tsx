import React, { useState, useRef } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from "expo-router";

import { colors } from "@/constants/colors/ColorTheme";
import { FONTS } from "@/constants/fonts/Fonts";
import { sizes } from '@/constants/size/FontSize';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// 타입 정의
interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  isRead: boolean;
  isImportant: boolean;
}

interface NoticeDetailModalProps {
  visible: boolean;
  notice: Notice | null;
  onClose: () => void;
  onShowOptions: () => void;
}

interface NoticeOptionsModalProps {
  visible: boolean;
  notice: Notice | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// 샘플 데이터
const sampleNotices: Notice[] = [
  {
    id: 1,
    title: "갑자기의 비율",
    content: "금일 매상세를 를인양하요",
    date: "4월 3일",
    isRead: false,
    isImportant: true
  },
  {
    id: 2,
    title: "해당자의 비율",
    content: "금일 매상세를 를인양하요",
    date: "5월 3일",
    isRead: false,
    isImportant: false
  },
  {
    id: 3,
    title: "해당자의 비율",
    content: "금일 매상세를 를인양하요",
    date: "5월 3일",
    isRead: true,
    isImportant: false
  }
];

// 공지사항 상세 모달
const NoticeDetailModal = ({ visible, notice, onClose, onShowOptions }: NoticeDetailModalProps) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
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

  if (!notice) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Animated.View
          style={[modalStyles.container, { transform: [{ translateY: slideAnim }] }]}
          {...panResponder.panHandlers}
        >
          <View style={modalStyles.dragHandle} />
          
          {/* 헤더 */}
          <View style={modalStyles.header}>
            <Pressable onPress={onClose} style={modalStyles.backButton}>
              <Image 
                source={require("@/assets/images/icon/icon_back.png")}
                style={modalStyles.backIcon}
              />
            </Pressable>
            
            <Text style={modalStyles.headerTitle}>소식</Text>
            
            <Pressable onPress={onShowOptions} style={modalStyles.moreButton}>
              <Text style={modalStyles.moreIcon}>⋯</Text>
            </Pressable>
          </View>

          {/* 탭 */}
          <View style={modalStyles.tabContainer}>
            <View style={[modalStyles.tab, modalStyles.activeTab]}>
              <Text style={[modalStyles.tabText, modalStyles.activeTabText]}>일반</Text>
            </View>
            <View style={modalStyles.tab}>
              <Text style={modalStyles.tabText}>공지</Text>
            </View>
          </View>

          {/* 공지사항 상세 내용 */}
          <ScrollView style={modalStyles.contentContainer} showsVerticalScrollIndicator={false}>
            <View style={modalStyles.noticeDetailCard}>
              <View style={modalStyles.noticeHeader}>
                <View style={modalStyles.categoryBadge}>
                  <Text style={modalStyles.categoryText}>업무공지</Text>
                </View>
                <Text style={modalStyles.noticeDate}>{notice?.date || ''}</Text>
              </View>
              
              <Text style={modalStyles.noticeTitle}>{notice?.title || ''}</Text>
              <Text style={modalStyles.noticeContent}>{notice?.content || ''}</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// 공지사항 옵션 모달
const NoticeOptionsModal = ({ visible, notice, onClose, onEdit, onDelete }: NoticeOptionsModalProps) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
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

  if (!notice) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <Animated.View
          style={[modalStyles.optionsContainer, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* 헤더 */}
          <View style={modalStyles.header}>
            <Pressable onPress={onClose} style={modalStyles.backButton}>
              <Image 
                source={require("@/assets/images/icon/icon_back.png")}
                style={modalStyles.backIcon}
              />
            </Pressable>
            
            <Text style={modalStyles.headerTitle}>소식</Text>
            
            <View style={modalStyles.headerSpacer} />
          </View>

          {/* 탭 */}
          <View style={modalStyles.tabContainer}>
            <View style={[modalStyles.tab, modalStyles.activeTab]}>
              <Text style={[modalStyles.tabText, modalStyles.activeTabText]}>일반</Text>
            </View>
            <View style={modalStyles.tab}>
              <Text style={modalStyles.tabText}>공지</Text>
            </View>
          </View>

          {/* 옵션 카드 */}
          <View style={modalStyles.optionsCard}>
            <View style={modalStyles.optionsHeader}>
              <Text style={modalStyles.optionsTitle}>새로운 공지가 도착했어요</Text>
              <Text style={modalStyles.optionsSubtitle}>[공지의회 액션공지] 알려 드립니다.</Text>
            </View>
            
            <View style={modalStyles.optionsActions}>
              <Pressable style={modalStyles.optionButton} onPress={onEdit}>
                <Text style={modalStyles.optionText}>수정</Text>
              </Pressable>
              
              <Pressable style={modalStyles.optionButton} onPress={onDelete}>
                <Text style={modalStyles.optionText}>삭제</Text>
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// 메인 컴포넌트
export default function NewsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'normal' | 'notice'>('normal');
  const [notices, setNotices] = useState<Notice[]>(sampleNotices);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  const handleNoticePress = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowDetailModal(true);
    
    // 읽음 처리
    if (!notice.isRead) {
      setNotices(prevNotices => 
        prevNotices.map(n => 
          n.id === notice.id ? { ...n, isRead: true } : n
        )
      );
    }
  };

  const handleShowOptions = () => {
    setShowDetailModal(false);
    setTimeout(() => setShowOptionsModal(true), 300);
  };

  const handleEdit = () => {
    setShowOptionsModal(false);
    // 편집 페이지로 이동
    if (selectedNotice) {
      router.push({
        pathname: "./EditNotice",
        params: { noticeId: selectedNotice.id }
      });
    }
  };

  const handleDelete = () => {
    setShowOptionsModal(false);
    Alert.alert(
      "공지 삭제",
      "정말로 이 공지를 삭제하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        { 
          text: "삭제", 
          style: "destructive",
          onPress: () => {
            if (selectedNotice) {
              setNotices(prevNotices => 
                prevNotices.filter(n => n.id !== selectedNotice.id)
              );
              setSelectedNotice(null);
            }
          }
        }
      ]
    );
  };

  const filteredNotices = notices.filter(notice => 
    activeTab === 'normal' ? !notice.isImportant : notice.isImportant
  );

  return (
    <SafeAreaView style={styles.rootContainer}>
      <View style={[styles.container, { 
        paddingHorizontal: insets.left === 0 ? 20 : insets.left,
        paddingTop: insets.top + 8
      }]}>
        
        {/* 헤더 */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.backButtonPressed
            ]}
          >
            <Image 
              source={require("@/assets/images/icon/icon_back.png")}
              style={styles.backIcon}
            />
          </Pressable>
          
          <Text style={styles.headerTitle}>소식</Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* 탭 */}
        <View style={styles.tabContainer}>
          <Pressable 
            style={[styles.tab, activeTab === 'normal' && styles.activeTab]}
            onPress={() => setActiveTab('normal')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'normal' && styles.activeTabText
            ]}>일반</Text>
          </Pressable>
          
          <Pressable 
            style={[styles.tab, activeTab === 'notice' && styles.activeTab]}
            onPress={() => setActiveTab('notice')}
          >
            <Text style={[
              styles.tabText, 
              activeTab === 'notice' && styles.activeTabText
            ]}>공지</Text>
          </Pressable>
        </View>

        {/* 공지사항 목록 */}
        <ScrollView style={styles.noticeList} showsVerticalScrollIndicator={false}>
          {filteredNotices.map((notice) => (
            <Pressable
              key={notice.id}
              style={({ pressed }) => [
                styles.noticeCard,
                !notice.isRead && styles.unreadNoticeCard,
                pressed && styles.noticeCardPressed
              ]}
              onPress={() => handleNoticePress(notice)}
            >
              <View style={styles.noticeIcon}>
                <Text style={styles.noticeIconText}>📢</Text>
              </View>
              
              <View style={styles.noticeContent}>
                <View style={styles.noticeHeader}>
                  <Text style={styles.noticeCategory}>
                    {notice.isImportant ? "중요공지" : "업무공지"}
                  </Text>
                  <Text style={styles.noticeDate}>{notice.date}</Text>
                </View>
                
                <Text style={[
                  styles.noticeTitle,
                  !notice.isRead && styles.unreadNoticeTitle
                ]}>
                  {notice.title}
                </Text>
                
                <Text style={styles.noticePreview}>{notice.content}</Text>
              </View>
            </Pressable>
          ))}
          
          {filteredNotices.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'normal' ? '일반 소식이 없습니다' : '공지사항이 없습니다'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* 모달들 */}
      <NoticeDetailModal
        visible={showDetailModal}
        notice={selectedNotice}
        onClose={() => setShowDetailModal(false)}
        onShowOptions={handleShowOptions}
      />
      
      <NoticeOptionsModal
        visible={showOptionsModal}
        notice={selectedNotice}
        onClose={() => setShowOptionsModal(false)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },

  container: {
    flex: 1,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 16,
  },

  backButton: {
    padding: 8,
    borderRadius: 8,
  },

  backButtonPressed: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },

  backIcon: {
    width: 24,
    height: 24,
  },

  headerTitle: {
    flex: 1,
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    textAlign: "center",
  },

  headerSpacer: {
    width: 40,
  },

  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
    marginBottom: 24,
  },

  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  activeTab: {
    borderBottomColor: colors.accent,
  },

  tabText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  activeTabText: {
    color: colors.accent,
    fontFamily: FONTS.jamsil.medium4,
  },

  noticeList: {
    flex: 1,
  },

  noticeCard: {
    flexDirection: "row",
    backgroundColor: colors.text.reverse,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  unreadNoticeCard: {
    backgroundColor: colors.main,
  },

  noticeCardPressed: {
    opacity: 0.8,
  },

  noticeIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },

  noticeIconText: {
    fontSize: 20,
  },

  noticeContent: {
    flex: 1,
  },

  noticeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  noticeCategory: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  noticeDate: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  noticeTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    marginBottom: 4,
  },

  unreadNoticeTitle: {
    fontFamily: FONTS.jamsil.bold5,
  },

  noticePreview: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  container: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    minHeight: SCREEN_HEIGHT * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },

  optionsContainer: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    minHeight: SCREEN_HEIGHT * 0.6,
  },

  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.text.secondary,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 24,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 16,
  },

  backButton: {
    padding: 8,
    borderRadius: 8,
  },

  backIcon: {
    width: 24,
    height: 24,
  },

  headerTitle: {
    flex: 1,
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
    textAlign: "center",
  },

  moreButton: {
    padding: 8,
    borderRadius: 8,
  },

  moreIcon: {
    fontSize: 20,
    color: colors.text.primary,
  },

  headerSpacer: {
    width: 40,
  },

  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.disable,
    marginBottom: 24,
    marginHorizontal: 20,
  },

  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  activeTab: {
    borderBottomColor: colors.accent,
  },

  tabText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  activeTabText: {
    color: colors.accent,
    fontFamily: FONTS.jamsil.medium4,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  noticeDetailCard: {
    backgroundColor: colors.main,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
  },

  noticeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  categoryBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  categoryText: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.reverse,
  },

  noticeDate: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  noticeTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    marginBottom: 12,
  },

  noticeContent: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.primary,
    lineHeight: 24,
  },

  optionsCard: {
    backgroundColor: colors.main,
    borderRadius: 16,
    padding: 24,
    margin: 20,
  },

  optionsHeader: {
    marginBottom: 20,
  },

  optionsTitle: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.bold5,
    color: colors.text.primary,
    marginBottom: 8,
  },

  optionsSubtitle: {
    fontSize: sizes.smallText,
    fontFamily: FONTS.jamsil.regular3,
    color: colors.text.secondary,
  },

  optionsActions: {
    flexDirection: "row",
    gap: 12,
  },

  optionButton: {
    flex: 1,
    backgroundColor: colors.text.reverse,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  optionText: {
    fontSize: sizes.normalText,
    fontFamily: FONTS.jamsil.medium4,
    color: colors.text.primary,
  },
});