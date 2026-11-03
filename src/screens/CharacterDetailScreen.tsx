import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { PostCard } from '../components/PostCard';
import { useApp } from '../context/AppContext';

interface CharacterDetailScreenProps {
  characterId: string;
  onBack: () => void;
  onOpenDM: (charId: string) => void;
}

export const CharacterDetailScreen: React.FC<CharacterDetailScreenProps> = ({
  characterId,
  onBack,
  onOpenDM,
}) => {
  const { characters, posts, toggleFollow, blockCharacter } = useApp();
  const character = characters.find((c) => c.id === characterId);

  if (!character) {
    return (
      <View style={styles.container}>
        <Header title="ไม่พบตัวละคร" rightActionText="กลับ" onRightAction={onBack} showLogo={false} />
      </View>
    );
  }

  const isMutual = character.isFollowing && character.isFollowerOfMe;
  const characterPosts = posts.filter((p) => p.characterId === character.id);

  const handleFollowPress = () => {
    const res = toggleFollow(character.id);
    if (!res.success && res.message) {
      Alert.alert('แจ้งเตือน', res.message);
    }
  };

  const handleBlockPress = () => {
    Alert.alert(
      'บล็อกตัวละคร',
      `คุณต้องการบล็อก ${character.name} ใช่หรือไม่? โพสต์และข้อความจากตัวละครนี้จะไม่แสดงอีกต่อไป`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'บล็อก',
          style: 'destructive',
          onPress: () => {
            blockCharacter(character);
            Alert.alert('สำเร็จ', `บล็อก ${character.name} เรียบร้อยแล้ว`, [
              { text: 'ตกลง', onPress: onBack },
            ]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={character.name}
        subtitle={character.handle}
        rightActionText="ย้อนกลับ"
        onRightAction={onBack}
        showLogo={false}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Cover / Profile Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerBackground} />
          <Image source={{ uri: character.avatarUrl }} style={styles.largeAvatar} />
        </View>

        {/* Profile Info Header */}
        <View style={styles.profileHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{character.name}</Text>
            {character.isOfficial && <Badge label="OFFICIAL" variant="official" />}
            {character.isOwner && <Badge label="ตัวละครของฉัน" variant="primary" />}
          </View>
          <Text style={styles.handle}>{character.handle}</Text>

          <Text style={styles.bio}>{character.bio}</Text>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <Text style={styles.statItem}>
              <Text style={styles.statBold}>{character.followerCount.toLocaleString()} </Text>
              ผู้ติดตาม
            </Text>
            <Text style={styles.statItem}>
              <Text style={styles.statBold}>{character.followingCount.toLocaleString()} </Text>
              กำลังติดตาม
            </Text>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionRow}>
            {character.isOfficial ? (
              <View style={styles.officialLockedButton}>
                <Text style={styles.officialLockedText}>🔒 สมาชิกทุกคนติดตาม @live สองทางโดยอัตโนมัติ</Text>
              </View>
            ) : (
              <Button
                title={character.isFollowing ? 'กำลังติดตาม' : '+ ติดตาม'}
                variant={character.isFollowing ? 'outline' : 'primary'}
                onPress={handleFollowPress}
                style={styles.actionBtn}
              />
            )}

            {/* DM Button with Mutual Check */}
            <TouchableOpacity
              style={[styles.dmActionButton, !isMutual && styles.dmActionButtonDisabled]}
              onPress={() => {
                if (isMutual) {
                  onOpenDM(character.id);
                } else {
                  Alert.alert(
                    'ไม่สามารถส่งข้อความได้',
                    'ตามกฎความปลอดภัยของระบบ: คุณจะสามารถเริ่มส่งข้อความ (DM) ได้ต่อเมื่อทั้งสองฝ่ายกดติดตามซึ่งกันและกันแล้วเท่านั้น'
                  );
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.dmActionText, !isMutual && styles.dmActionTextDisabled]}>
                {isMutual ? '💬 ส่งข้อความ (DM)' : '🔒 ต้องติดตามกันสองฝ่าย'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.blockBtn} onPress={handleBlockPress} activeOpacity={0.7}>
              <Text style={styles.blockBtnText}>🚫 บล็อก</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DNA Information Card */}
        <View style={styles.dnaSection}>
          <Text style={styles.sectionHeader}>🧬 อัตลักษณ์ตัวละคร (Character DNA - Single Source of Truth)</Text>
          <View style={styles.dnaGrid}>
            <View style={styles.dnaItem}>
              <Text style={styles.dnaKey}>บุคลิกภาพ (Personality):</Text>
              <Text style={styles.dnaVal}>{character.dna.personality}</Text>
            </View>
            <View style={styles.dnaItem}>
              <Text style={styles.dnaKey}>ปูมหลัง (Lore):</Text>
              <Text style={styles.dnaVal}>{character.dna.lore}</Text>
            </View>
            <View style={styles.dnaItem}>
              <Text style={styles.dnaKey}>สไตล์ภาพ (Visual Style):</Text>
              <Text style={styles.dnaVal}>{character.dna.visualStyle}</Text>
            </View>
            <View style={styles.dnaItem}>
              <Text style={styles.dnaKey}>สถานะความถูกต้อง (Canon):</Text>
              <Text style={styles.dnaVal}>{character.dna.isCanon ? 'Verified Canon' : 'User Custom'}</Text>
            </View>
          </View>
        </View>

        {/* Posts by this character */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionHeader}>📝 โพสต์ในฟีดแอป ({characterPosts.length})</Text>
          {characterPosts.length === 0 ? (
            <Text style={styles.noPostsText}>ตัวละครนี้ยังไม่มีโพสต์ในฟีดแอป</Text>
          ) : (
            characterPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  bannerContainer: {
    position: 'relative',
    height: 120,
    backgroundColor: colors.surface,
  },
  bannerBackground: {
    height: 80,
    backgroundColor: colors.surfaceElevated,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.surfaceCard,
    position: 'absolute',
    bottom: 0,
    left: 20,
    backgroundColor: colors.surfaceCard,
  },
  profileHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  handle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 10,
  },
  bio: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  statsBar: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16,
  },
  statItem: {
    color: colors.textMuted,
    fontSize: 13,
  },
  statBold: {
    color: colors.text,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: 120,
  },
  officialLockedButton: {
    flex: 1,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: colors.info,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  officialLockedText: {
    color: colors.info,
    fontSize: 12,
    fontWeight: '700',
  },
  dmActionButton: {
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  dmActionButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
  },
  dmActionText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  dmActionTextDisabled: {
    color: colors.textMuted,
  },
  blockBtn: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blockBtnText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  dnaSection: {
    padding: 20,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionHeader: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  dnaGrid: {
    gap: 10,
  },
  dnaItem: {
    backgroundColor: colors.surfaceCard,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dnaKey: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  dnaVal: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  postsSection: {
    paddingTop: 16,
  },
  noPostsText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
