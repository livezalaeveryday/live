import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { PostCard } from '../components/PostCard';
import { BounceFlatList } from '../components/BounceView';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Post } from '../types';

interface FeedScreenProps {
  onOpenCreatePost: () => void;
  onSelectCharacter: (charId: string) => void;
}

const PAGE_SIZE = 4;

export const FeedScreen: React.FC<FeedScreenProps> = ({ onOpenCreatePost, onSelectCharacter }) => {
  const { getFilteredPosts, activeCharacter, characters } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'explore' | 'following'>('explore');
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Raw filtered posts from AppContext (respects personal word filters and auto-hiding >= 10 reports)
  const allFilteredPosts = getFilteredPosts();

  // Tab filtering: explore (all) vs following (characters followed by user)
  const candidatePosts = useMemo(() => {
    if (activeTab === 'following') {
      const followedCharIds = new Set(characters.filter((c) => c.isFollowing).map((c) => c.id));
      return allFilteredPosts.filter((p) => followedCharIds.has(p.characterId));
    }
    return allFilteredPosts;
  }, [allFilteredPosts, activeTab, characters]);

  // Paginated displayed posts for infinite scroll
  const displayedPosts = useMemo(() => {
    return candidatePosts.slice(0, page * PAGE_SIZE);
  }, [candidatePosts, page]);

  const hasMore = displayedPosts.length < candidatePosts.length;

  // Infinite Scroll Trigger (Auto-fetch next batch without manual button)
  const handleEndReached = () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 600);
  };

  // Pull-to-refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setPage(1);
      setIsRefreshing(false);
    }, 500);
  };

  const renderFooter = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.footerLoader} testID="feed-loading-indicator">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.footerLoaderText}>⏳ กำลังโหลดโพสต์ถัดไป...</Text>
        </View>
      );
    }
    if (!hasMore && candidatePosts.length > 0) {
      return (
        <View style={styles.footerEnd}>
          <Text style={styles.footerEndText}>✓ สิ้นสุดฟีดสาธารณะ แสดงโพสต์ครบถ้วนแล้ว</Text>
        </View>
      );
    }
    return <View style={styles.footerSpacer} />;
  };

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

      {/* Feed Sub-channel Tabs: สำรวจ (Explore) vs กำลังติดตาม (Following) */}
      <View style={styles.tabNavRow}>
        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'explore' && styles.tabNavBtnActive]}
          onPress={() => {
            if (activeTab !== 'explore') {
              setActiveTab('explore');
              setPage(1);
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabNavText, activeTab === 'explore' && styles.tabNavTextActive]}>
            🌐 ฟีดทั้งหมด (Explore)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabNavBtn, activeTab === 'following' && styles.tabNavBtnActive]}
          onPress={() => {
            if (activeTab !== 'following') {
              setActiveTab('following');
              setPage(1);
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabNavText, activeTab === 'following' && styles.tabNavTextActive]}>
            👥 กำลังติดตาม (Following)
          </Text>
        </TouchableOpacity>
      </View>

      <BounceFlatList
        data={displayedPosts}
        keyExtractor={(item: Post) => item.id}
        renderItem={({ item }: { item: Post }) => (
          <PostCard post={item} onSelectCharacter={onSelectCharacter} />
        )}
        contentContainerStyle={displayedPosts.length === 0 ? styles.emptyContainer : styles.listContent}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyTitle}>
              {activeTab === 'following' ? 'ยังไม่มีโพสต์จากตัวละครที่ติดตาม' : 'ยังไม่มีโพสต์ในฟีด'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'following'
                ? 'กดติดตามตัวละครในสังกัดสมาชิกเพื่อรับชมการอวดผลงานใหม่ๆ'
                : 'ร่วมเป็นคนแรกที่เลือกตัวละคร AI ของคุณมาโพสต์อวดบนฟีดสมาชิก'}
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
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabNavBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabNavBtnActive: {
    borderBottomColor: colors.primary,
    backgroundColor: colors.badgeBg,
  },
  tabNavText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabNavTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 32,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  footerLoaderText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  footerEnd: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerEndText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  footerSpacer: {
    height: 16,
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
