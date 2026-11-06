import React, { useState, useEffect, useRef } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AppState,
  BackHandler,
  PanResponder,
} from 'react-native';
import { colors } from './src/theme/colors';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { FeedScreen } from './src/screens/FeedScreen';
import { CreatePostScreen } from './src/screens/CreatePostScreen';
import { CharactersScreen } from './src/screens/CharactersScreen';
import { CharacterDetailScreen } from './src/screens/CharacterDetailScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { ChatRoomScreen } from './src/screens/ChatRoomScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { WordFilterScreen } from './src/screens/WordFilterScreen';
import { BlockedListScreen } from './src/screens/BlockedListScreen';

export type Tab = 'feed' | 'characters' | 'messages' | 'profile';

export type ScreenRoute =
  | { type: 'create_post' }
  | { type: 'character_detail'; charId: string }
  | { type: 'chat_room'; charId: string }
  | { type: 'word_filters' }
  | { type: 'blocked_list' };

const MainNavigator: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');

  // Navigation Stack for sub-screens
  const [stack, setStack] = useState<ScreenRoute[]>([]);
  const stackRef = useRef<ScreenRoute[]>(stack);
  stackRef.current = stack;

  const pushScreen = (route: ScreenRoute) => {
    setStack((prev) => [...prev, route]);
  };

  const popScreen = (): boolean => {
    if (stackRef.current.length > 0) {
      setStack((prev) => prev.slice(0, prev.length - 1));
      return true;
    }
    return false;
  };

  /**
   * Universal back handler
   * คำสั่งเจ้าของ 2026-11-04 16:41:
   * - จากหน้าย่อยใด ๆ การปัดย้อน/ปุ่ม Back ของระบบต้อง pop กลับไปหน้าที่แล้วใน stack เสมอ ห้ามออกจากแอปกลางคัน
   * - กดย้อนกลับ/ปัดย้อน ห้ามทำให้ออกจากแอปในทุกกรณี แม้แต่อยู่ที่หน้าแรกสุดของ stack (อยู่หน้าแรกแล้วย้อนอีกก็ให้อยู่หน้าเดิม ไม่ปิดแอป)
   * - การออกจากแอปมีทางเดียวคือผู้ใช้ยกหน้าจอ multitask (recent apps) แล้วปัดปิดแอปเอง
   * - กฎนี้ใช้ทั้ง Android และ iOS
   */
  const handleBack = (): boolean => {
    if (stackRef.current.length > 0) {
      popScreen();
      return true;
    }
    // At root of stack: do NOT exit the app, stay on current root screen
    return true;
  };

  // Android Hardware / System Back Button & Gesture Handler
  useEffect(() => {
    const onHardwareBack = () => {
      handleBack();
      // ALWAYS return true: signals to React Native / Android that the back event is consumed
      // and guarantees that the system never finishes the activity.
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, []);

  // Gesture PanResponder for horizontal back swipe (iOS & Android edge swipe)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        // Only intercept swipe gesture when there are sub-screens in the stack
        if (stackRef.current.length === 0) {
          return false;
        }
        // Touch starting near left edge (<= 50px) and moving horizontally to the right
        const isFromLeftEdge = evt.nativeEvent.pageX <= 50;
        const isHorizontalRightSwipe =
          gestureState.dx > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;

        return isFromLeftEdge && isHorizontalRightSwipe;
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Trigger pop if user swiped far enough or with high velocity
        if (gestureState.dx > 50 || gestureState.vx > 0.3) {
          handleBack();
        }
      },
      onPanResponderTerminate: () => {},
    })
  ).current;

  // Immersive Fullscreen: Hide Status Bar and keep hidden on app resume
  useEffect(() => {
    StatusBar.setHidden(true, 'none');
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        StatusBar.setHidden(true, 'none');
      }
    });
    return () => sub.remove();
  }, []);

  if (!user) {
    return (
      <View style={styles.safeArea}>
        <StatusBar hidden={true} />
        <LoginScreen />
      </View>
    );
  }

  // Active sub-screen from top of stack
  const currentSubScreen = stack.length > 0 ? stack[stack.length - 1] : null;

  return (
    <View style={styles.safeArea} {...panResponder.panHandlers}>
      <StatusBar hidden={true} />

      {/* Render Sub-screens from Stack */}
      {currentSubScreen?.type === 'create_post' && (
        <View style={styles.subScreenContainer}>
          <CreatePostScreen onClose={popScreen} />
        </View>
      )}

      {currentSubScreen?.type === 'character_detail' && (
        <View style={styles.subScreenContainer}>
          <CharacterDetailScreen
            characterId={currentSubScreen.charId}
            onBack={popScreen}
            onOpenDM={(charId) => pushScreen({ type: 'chat_room', charId })}
          />
        </View>
      )}

      {currentSubScreen?.type === 'chat_room' && (
        <View style={styles.subScreenContainer}>
          <ChatRoomScreen characterId={currentSubScreen.charId} onBack={popScreen} />
        </View>
      )}

      {currentSubScreen?.type === 'word_filters' && (
        <View style={styles.subScreenContainer}>
          <WordFilterScreen onBack={popScreen} />
        </View>
      )}

      {currentSubScreen?.type === 'blocked_list' && (
        <View style={styles.subScreenContainer}>
          <BlockedListScreen onBack={popScreen} />
        </View>
      )}

      {/* Root Tabs (visible when stack is empty) */}
      {!currentSubScreen && (
        <View style={styles.screenContainer}>
          {activeTab === 'feed' && (
            <FeedScreen
              onOpenCreatePost={() => pushScreen({ type: 'create_post' })}
              onSelectCharacter={(charId) => pushScreen({ type: 'character_detail', charId })}
            />
          )}
          {activeTab === 'characters' && (
            <CharactersScreen
              onSelectCharacter={(charId) => pushScreen({ type: 'character_detail', charId })}
              onOpenDM={(charId) => pushScreen({ type: 'chat_room', charId })}
            />
          )}
          {activeTab === 'messages' && (
            <MessagesScreen onOpenChat={(charId) => pushScreen({ type: 'chat_room', charId })} />
          )}
          {activeTab === 'profile' && (
            <ProfileScreen
              onOpenWordFilters={() => pushScreen({ type: 'word_filters' })}
              onOpenBlockedList={() => pushScreen({ type: 'blocked_list' })}
              onSelectCharacter={(charId) => pushScreen({ type: 'character_detail', charId })}
            />
          )}
        </View>
      )}

      {/* Bottom Tab Bar (hidden when navigating inside a sub-screen) */}
      {!currentSubScreen && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'feed' && styles.tabItemActive]}
            onPress={() => setActiveTab('feed')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabIcon, activeTab === 'feed' && styles.tabIconActive]}>📱</Text>
            <Text style={[styles.tabLabel, activeTab === 'feed' && styles.tabLabelActive]}>ฟีด</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'characters' && styles.tabItemActive]}
            onPress={() => setActiveTab('characters')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabIcon, activeTab === 'characters' && styles.tabIconActive]}>🎭</Text>
            <Text style={[styles.tabLabel, activeTab === 'characters' && styles.tabLabelActive]}>ตัวละคร</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'messages' && styles.tabItemActive]}
            onPress={() => setActiveTab('messages')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabIcon, activeTab === 'messages' && styles.tabIconActive]}>💬</Text>
            <Text style={[styles.tabLabel, activeTab === 'messages' && styles.tabLabelActive]}>ข้อความ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'profile' && styles.tabItemActive]}
            onPress={() => setActiveTab('profile')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabIcon, activeTab === 'profile' && styles.tabIconActive]}>👤</Text>
            <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>โปรไฟล์</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenContainer: {
    flex: 1,
  },
  subScreenContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    height: 60,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  tabItemActive: {
    borderTopWidth: 2,
    borderTopColor: colors.primary,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
