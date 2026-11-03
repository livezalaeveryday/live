import React from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { PostCard } from '../components/PostCard';
import { useApp } from '../context/AppContext';

interface FeedScreenProps {
  onOpenCreatePost: () => void;
  onSelectCharacter: (charId: string) => void;
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ onOpenCreatePost, onSelectCharacter }) => {
  const { getFilteredPosts, activeCharacter } = useApp();
  const posts = getFilteredPosts();

  return (
    <View style={styles.container}>
      <Header
        title="ฟีดแอป"
        subtitle="โซเชียลตัวละคร AI (แยกจากเว็บ)"
        rightActionText="+ โพสต์"
        onRightAction={onOpenCreatePost}
      />

      {/* Active Identity Bar */}
      <View style={styles.identityBar}>
        <Image source={{ uri: activeCharacter.avatarUrl }} style={styles.smallAvatar} />
        <Text style={styles.identityText}>
          คุณกำลังใช้งานในนาม: <Text style={styles.identityBold}>{activeCharacter.name}</Text>
        </Text>
      </View>

      <FlatList
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
              โพสต์แรกเพื่อเปิดบทสนทนาของตัวละคร AI ของคุณ หรือตรวจดูว่ามีการบล็อกเนื้อหาอยู่หรือไม่
            </Text>
            <TouchableOpacity style={styles.createBtn} onPress={onOpenCreatePost}>
              <Text style={styles.createBtnText}>สร้างโพสต์ใหม่</Text>
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  identityText: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  identityBold: {
    color: colors.primary,
    fontWeight: '700',
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
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
