import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { PostCard } from '../components/PostCard';
import { PromptPayCheckoutModal } from '../components/PromptPayCheckoutModal';
import { BounceFlatList } from '../components/BounceView';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Post, Character } from '../types';

interface ProfileScreenProps {
  onOpenWordFilters: () => void;
  onOpenBlockedList: () => void;
  onSelectCharacter?: (charId: string) => void;
}

type ProfileTab = 'posts' | 'characters' | 'settings';

const PROFILE_PAGE_SIZE = 3;

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenWordFilters,
  onOpenBlockedList,
  onSelectCharacter,
}) => {
  const { user, signOut, updateCredits } = useAuth();
  const {
    posts,
    wordFilters,
    blockedEntities,
    flavor,
    flavorConfig,
    setFlavor,
    myCharacters,
  } = useApp();

  const [activeProfileTab, setActiveProfileTab] = useState<ProfileTab>('posts');
  const [profilePage, setProfilePage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showPromptPayModal, setShowPromptPayModal] = useState<boolean>(false);

  // User's own posts for Profile Feed (ฟีดโปรไฟล์)
  const myPosts = useMemo(() => {
    return posts.filter(
      (p) =>
        p.ownerId === user?.id ||
        (user?.handle && p.ownerHandle === user.handle) ||
        p.isOfficialOwner === false && p.ownerName === user?.name
    );
  }, [posts, user]);

  // Paginated profile posts for infinite scroll
  const displayedProfilePosts = useMemo(() => {
    return myPosts.slice(0, profilePage * PROFILE_PAGE_SIZE);
  }, [myPosts, profilePage]);

  const hasMore = displayedProfilePosts.length < myPosts.length;

  // Infinite Scroll Trigger for Profile Feed (No manual button)
  const handleEndReached = () => {
    if (activeProfileTab !== 'posts') return;
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setProfilePage((prev) => prev + 1);
      setIsLoadingMore(false);
    }, 600);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setProfilePage(1);
      setIsRefreshing(false);
    }, 500);
  };

  const handleOpenWebAccount = () => {
    Linking.openURL('https://livezala.com');
  };

  const handleOpenDeleteAccount = () => {
    Linking.openURL('https://livezala.com/delete-account');
  };

  const handleSignOut = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ออกจากระบบ', style: 'destructive', onPress: signOut },
    ]);
  };

  const handlePaymentSuccess = (addedCredits: number, packageName: string) => {
    updateCredits(addedCredits);
    setShowPromptPayModal(false);
    Alert.alert(
      '🎉 เติมเครดิตสำเร็จ!',
      `ระบบได้เพิ่ม +${addedCredits.toLocaleString()} เครดิตจากแพ็กเกจ "${packageName}" เข้าบัญชีของคุณเรียบร้อยแล้ว`,
      [{ text: 'ตกลง' }]
    );
  };

  const toggleFlavor = () => {
    const nextFlavor = flavor === 'direct' ? 'play' : 'direct';
    setFlavor(nextFlavor);
  };

  // Profile Header: User info, credits card, and sub-channel navigation tabs
  const renderHeader = () => (
    <View style={styles.headerBlock}>
      {/* User Card */}
      <View style={styles.userCard}>
        <Image
          source={{ uri: user?.avatarUrl || 'https://livezala.com/media/avatar/default' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.name || 'สมาชิก Livezala'}</Text>
          <Text style={styles.userHandle}>{user?.handle || '@foolish_max'}</Text>
          <Text style={styles.userFollowStats}>
            👥 {user?.followerCount ?? 340} ผู้ติดตาม · กำลังติดตาม {user?.followingCount ?? 125}
          </Text>
          <Text style={styles.statusBadge}>🟢 สมาชิกทางการระบบ Livezala</Text>
        </View>
      </View>

      {/* User Credits & Membership Card */}
      <View style={styles.creditCard}>
        <View style={styles.creditHeader}>
          <Text style={styles.creditTitle}>🪙 ยอดเครดิตคงเหลือ</Text>
          <Text style={styles.creditAmount}>{user?.credits.toLocaleString() || '0'} เครดิต</Text>
        </View>
        <View style={styles.membershipRow}>
          <Text style={styles.membershipLabel}>สถานะสมาชิก:</Text>
          <Text style={styles.membershipValue}>สมาชิก Livezala (Active)</Text>
        </View>

        {flavorConfig.allowsInAppPurchase ? (
          <View style={styles.directPurchaseBox}>
            <Text style={styles.directNote}>
              โหมด APK ตรง (livezala.com/mobileapp): สั่งซื้อและชำระเงินผ่าน PromptPay QR ได้ทันที
            </Text>
            <TouchableOpacity
              style={styles.topUpButton}
              onPress={() => setShowPromptPayModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.topUpButtonText}>💳 สั่งซื้อเครดิต (PromptPay QR)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.playStoreBox}>
            <Text style={styles.creditNote}>จัดการบัญชีของคุณที่ livezala.com</Text>
            <TouchableOpacity style={styles.webInfoButton} onPress={handleOpenWebAccount} activeOpacity={0.8}>
              <Text style={styles.webInfoButtonText}>ช่องทางการซื้อ: เว็บไซต์ livezala.com</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Profile Channel Tabs */}
      <View style={styles.tabNavRow}>
        <TouchableOpacity
          style={[styles.tabNavBtn, activeProfileTab === 'posts' && styles.tabNavBtnActive]}
          onPress={() => setActiveProfileTab('posts')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabNavText, activeProfileTab === 'posts' && styles.tabNavTextActive]}>
            📝 ฟีดโพสต์ ({myPosts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabNavBtn, activeProfileTab === 'characters' && styles.tabNavBtnActive]}
          onPress={() => setActiveProfileTab('characters')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabNavText, activeProfileTab === 'characters' && styles.tabNavTextActive]}>
            🎭 ตัวละคร ({myCharacters.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabNavBtn, activeProfileTab === 'settings' && styles.tabNavBtnActive]}
          onPress={() => setActiveProfileTab('settings')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabNavText, activeProfileTab === 'settings' && styles.tabNavTextActive]}>
            ⚙️ ตั้งค่า & บัญชี
          </Text>
        </TouchableOpacity>
      </View>

      {/* Section Subheader based on active tab */}
      {activeProfileTab === 'posts' && (
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>📝 ฟีดโปรไฟล์ของคุณ (Infinite Scroll)</Text>
          <Text style={styles.sectionSubtitle}>
            ผลงานที่คุณเลือกตัวละครมาโพสต์อวดลงฟีด เลื่อนดูได้ไม่จำกัด
          </Text>
        </View>
      )}

      {activeProfileTab === 'characters' && (
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>🎭 ตัวละครผลงานในสังกัด ({myCharacters.length})</Text>
          <Text style={styles.sectionSubtitle}>
            ตัวละคร AI ที่คุณเป็นเจ้าของและเลือกมานำเสนออวดบนฟีด
          </Text>
        </View>
      )}
    </View>
  );

  // Footer component for loading indicator and settings tab content
  const renderFooter = () => {
    if (activeProfileTab === 'posts') {
      if (isLoadingMore) {
        return (
          <View style={styles.footerLoader} testID="profile-loading-indicator">
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.footerLoaderText}>⏳ กำลังโหลดโพสต์โปรไฟล์ถัดไป...</Text>
          </View>
        );
      }
      if (!hasMore && myPosts.length > 0) {
        return (
          <View style={styles.footerEnd}>
            <Text style={styles.footerEndText}>✓ สิ้นสุดรายการโพสต์ในฟีดโปรไฟล์</Text>
          </View>
        );
      }
      return <View style={styles.footerSpacer} />;
    }

    if (activeProfileTab === 'settings') {
      return (
        <View style={styles.settingsContent}>
          {/* Build Flavor Switcher */}
          <View style={styles.flavorCard}>
            <View style={styles.flavorHeader}>
              <Text style={styles.flavorBadgeTitle}>🏷️ Build Flavor: {flavorConfig.badge}</Text>
              <TouchableOpacity style={styles.flavorToggleBadge} onPress={toggleFlavor} activeOpacity={0.7}>
                <Text style={styles.flavorToggleBadgeText}>สลับ Flavor เทสต์ ⇄</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.flavorDescription}>{flavorConfig.description}</Text>
            <Text style={styles.flavorChannelText}>ช่องทาง: {flavorConfig.channel}</Text>
          </View>

          {/* Safety & Content Settings Group */}
          <Text style={styles.groupHeader}>ความปลอดภัยและเนื้อหา (Safety & Moderation)</Text>

          <TouchableOpacity style={styles.menuRow} onPress={onOpenWordFilters} activeOpacity={0.8}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🛡️</Text>
              <View>
                <Text style={styles.menuTitle}>ตัวกรองคำส่วนตัว (Personal Word Filter)</Text>
                <Text style={styles.menuSubtitle}>
                  กรองคำที่คุณไม่ต้องการเห็นในฟีด ({wordFilters.length} คำที่ตั้งไว้)
                </Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuRow} onPress={onOpenBlockedList} activeOpacity={0.8}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🚫</Text>
              <View>
                <Text style={styles.menuTitle}>รายการที่ถูกบล็อก (Blocked Entities)</Text>
                <Text style={styles.menuSubtitle}>
                  จัดการตัวละครและผู้ใช้ที่คุณบล็อกไว้ ({blockedEntities.length} รายการ)
                </Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          {/* Legal & Policy Group */}
          <Text style={styles.groupHeader}>กฎหมายและความเป็นส่วนตัว (Legal & Compliance)</Text>

          <TouchableOpacity style={styles.menuRow} onPress={handleOpenDeleteAccount} activeOpacity={0.8}>
            <View style={styles.menuLeft}>
              <Text style={styles.menuIcon}>🗑️</Text>
              <View>
                <Text style={styles.menuTitle}>คำขอลบบัญชีและข้อมูล (Delete Account)</Text>
                <Text style={styles.menuSubtitle}>ลิงก์ตามคำประกาศความปลอดภัยข้อมูล Google Play</Text>
              </View>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          {/* Sign Out Button */}
          <View style={styles.signOutBox}>
            <Button title="ออกจากระบบ" variant="outline" onPress={handleSignOut} />
            <Text style={styles.versionNote}>
              live Member App · com.livezala.app · v1.0.0 ({flavorConfig.badge})
            </Text>
          </View>
        </View>
      );
    }

    return <View style={styles.footerSpacer} />;
  };

  // Determine list items based on active tab
  const listData = useMemo(() => {
    if (activeProfileTab === 'posts') {
      return displayedProfilePosts;
    }
    if (activeProfileTab === 'characters') {
      return myCharacters;
    }
    return [];
  }, [activeProfileTab, displayedProfilePosts, myCharacters]);

  return (
    <View style={styles.container}>
      <Header title="โปรไฟล์และการตั้งค่า" subtitle="จัดการบัญชีสมาชิกและความปลอดภัย" showLogo />

      <BounceFlatList
        data={listData}
        keyExtractor={(item: any) => item.id}
        renderItem={({ item }: { item: any }) => {
          if (activeProfileTab === 'posts') {
            return (
              <PostCard post={item as Post} onSelectCharacter={onSelectCharacter} />
            );
          }
          if (activeProfileTab === 'characters') {
            const char = item as Character;
            return (
              <TouchableOpacity
                key={char.id}
                style={styles.myCharItem}
                onPress={() => onSelectCharacter && onSelectCharacter(char.id)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: char.avatarUrl }} style={styles.myCharAvatar} />
                <View style={styles.myCharInfo}>
                  <Text style={styles.myCharName}>{char.name}</Text>
                  <Text style={styles.myCharHandle}>{char.handle}</Text>
                  <Text style={styles.myCharBio} numberOfLines={1}>
                    {char.bio}
                  </Text>
                </View>
                <View style={styles.myCharBadge}>
                  <Text style={styles.myCharBadgeText}>ผลงานของคุณ ›</Text>
                </View>
              </TouchableOpacity>
            );
          }
          return null;
        }}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.4}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          activeProfileTab === 'posts' ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>📝</Text>
              <Text style={styles.emptyTitle}>ยังไม่มีโพสต์ในโปรไฟล์ของคุณ</Text>
              <Text style={styles.emptyText}>
                เลือกตัวละคร AI ในสังกัดของคุณ แล้วโพสต์อวดลงฟีดเพื่อเริ่มสร้างผลงาน
              </Text>
            </View>
          ) : activeProfileTab === 'characters' ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🎭</Text>
              <Text style={styles.emptyTitle}>ยังไม่มีตัวละครในสังกัด</Text>
            </View>
          ) : undefined
        }
      />

      {/* AIS / PromptPay Modal for Flavor DIRECT */}
      <PromptPayCheckoutModal
        visible={showPromptPayModal}
        onClose={() => setShowPromptPayModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: 40,
  },
  headerBlock: {
    padding: 16,
    paddingBottom: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  userHandle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  statusBadge: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  creditCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  creditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  creditTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  creditAmount: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  membershipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  membershipLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  membershipValue: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  userFollowStats: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
  directPurchaseBox: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  directNote: {
    color: colors.primary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  topUpButton: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  topUpButtonText: {
    color: colors.black,
    fontSize: 13,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  playStoreBox: {
    marginTop: 6,
  },
  creditNote: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    marginTop: 4,
  },
  webInfoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  webInfoButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  tabNavRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceCard,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tabNavBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabNavBtnActive: {
    backgroundColor: colors.badgeBg,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
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
  sectionHeaderRow: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  myCharItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  myCharAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  myCharInfo: {
    flex: 1,
  },
  myCharName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  myCharHandle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1,
  },
  myCharBio: {
    color: colors.textSecondary,
    fontSize: 10,
    marginTop: 2,
  },
  myCharBadge: {
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  myCharBadgeText: {
    color: colors.badgeText,
    fontSize: 10,
    fontWeight: '700',
  },
  settingsContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  flavorCard: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  flavorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  flavorBadgeTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: 'bold',
  },
  flavorToggleBadge: {
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  flavorToggleBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  flavorDescription: {
    color: colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 4,
  },
  flavorChannelText: {
    color: colors.textSecondary,
    fontSize: 10,
  },
  groupHeader: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    fontSize: 22,
  },
  menuTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  menuSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  menuArrow: {
    color: colors.textMuted,
    fontSize: 20,
    fontWeight: '700',
  },
  signOutBox: {
    marginTop: 24,
    gap: 12,
  },
  versionNote: {
    color: colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 18,
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
  emptyBox: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
