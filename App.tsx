import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AppState,
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

type Tab = 'feed' | 'characters' | 'messages' | 'profile';
type ActiveModal =
  | null
  | { type: 'create_post' }
  | { type: 'character_detail'; charId: string }
  | { type: 'chat_room'; charId: string }
  | { type: 'word_filters' }
  | { type: 'blocked_list' };

const MainNavigator: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [modal, setModal] = useState<ActiveModal>(null);

  // คำสั่งเจ้าของ: Immersive Fullscreen ซ่อนแถบสถานะด้านบนของเครื่อง และซ่อนซ้ำเมื่อ Focus กลับมา
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

  // Handle Sub-screens / Modals
  if (modal?.type === 'create_post') {
    return (
      <View style={styles.safeArea}>
        <StatusBar hidden={true} />
        <CreatePostScreen onClose={() => setModal(null)} />
      </View>
    );
  }
  if (modal?.type === 'character_detail') {
    return (
      <View style={styles.safeArea}>
        <StatusBar hidden={true} />
        <CharacterDetailScreen
          characterId={modal.charId}
          onBack={() => setModal(null)}
          onOpenDM={(charId) => setModal({ type: 'chat_room', charId })}
        />
      </View>
    );
  }
  if (modal?.type === 'chat_room') {
    return (
      <View style={styles.safeArea}>
        <StatusBar hidden={true} />
        <ChatRoomScreen characterId={modal.charId} onBack={() => setModal(null)} />
      </View>
    );
  }
  if (modal?.type === 'word_filters') {
    return (
      <View style={styles.safeArea}>
        <StatusBar hidden={true} />
        <WordFilterScreen onBack={() => setModal(null)} />
      </View>
    );
  }
  if (modal?.type === 'blocked_list') {
    return (
      <View style={styles.safeArea}>
        <StatusBar hidden={true} />
        <BlockedListScreen onBack={() => setModal(null)} />
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar hidden={true} />
      <View style={styles.screenContainer}>
        {activeTab === 'feed' && (
          <FeedScreen
            onOpenCreatePost={() => setModal({ type: 'create_post' })}
            onSelectCharacter={(charId) => setModal({ type: 'character_detail', charId })}
          />
        )}
        {activeTab === 'characters' && (
          <CharactersScreen
            onSelectCharacter={(charId) => setModal({ type: 'character_detail', charId })}
            onOpenDM={(charId) => setModal({ type: 'chat_room', charId })}
          />
        )}
        {activeTab === 'messages' && (
          <MessagesScreen onOpenChat={(charId) => setModal({ type: 'chat_room', charId })} />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen
            onOpenWordFilters={() => setModal({ type: 'word_filters' })}
            onOpenBlockedList={() => setModal({ type: 'blocked_list' })}
          />
        )}
      </View>

      {/* Bottom Tab Bar */}
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
