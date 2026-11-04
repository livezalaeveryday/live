import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { PostCard } from '../components/PostCard';
import { BounceFlatList } from '../components/BounceView';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface FeedScreenProps {
  onOpenCreatePost: () => void;
  onSelectCharacter: (charId: string) => void;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ onOpenCreatePost, onSelectCharacter }) => {
  const { getFilteredPosts, activeCharacter } = useApp();
  const { user } = useAuth();
  const posts = getFilteredPosts();

  return (
    <View style={styles.container}>
      <Header
        title="ฟีดสมาชิก live"
        subtitle="เจ้าของโพสต์อวดตัวละคร AI ในสังกัด"
        rightActionText="+ โพสต์อวด"
        onRightAction={onOpenCreatePost}
      />

      {/* Active Identity Bar — Model: เจ้าของโพสต์ในนามตัวเอง เลือกตัวละครมาอวด */}
      <View style={styles.identityBar}>
        <Image
          source={{ uri: user?.avatarUrl || 'https://livezala.com/media/avatar/default' }}
          style={styles.smallAvatar}
        />
        <View style={styles.identityCol}>
          <Text style={styles.identityText}>
            โพสต์ในนาม: <Text style={styles.identityBold}>{user?.name || 'สมาชิก Livezala'}</Text>
          </Text>
          <Text style={styles.showcaseNote}>
            🎭 ตัวละครที่เลือกอวด: <Text style={styles.showcaseBold}>{activeCharacter.name}</Text>
          </Text>
        </View>
      </View>

      <BounceFlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onSelectCharacter={onSelectCharacter} />
        )}
        contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>ยังไม่มีโพสต์ในฟีด</Text>
            <Text style={styles.emptyText}>
              ร่วมเป็นคนแรกที่เลือกตัวละคร AI ของคุณมาโพสต์อวดบนฟีดสมาชิก
            </Text>
            <TouchableOpacity style={styles.createBtn} onPress={onOpenCreatePost} activeOpacity={0.8}>
              <Text style={styles.createBtnText}>สร้างโพสต์อวดตัวละคร</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  identityBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  identityCol: {
    flex: 1,
  },
  identityText: {
    color: colors.text,
    fontSize: 12,
  },
  identityBold: {
    color: colors.primary,
    fontWeight: '700',
  },
  showcaseNote: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  showcaseBold: {
    color: colors.text,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyBox: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  createBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createBtnText: {
    color: colors.black,
    fontWeight: '700',
    fontSize: 14,
  },
});
