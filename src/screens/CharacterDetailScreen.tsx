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

  const isMutual = (character.isOwnerFollowing ?? character.isFollowing) &&
                   (character.isOwnerFollowerOfMe ?? character.isFollowerOfMe);
  const isFollowingOwner = character.isOwnerFollowing ?? character.isFollowing;
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
        subtitle={`ผลงานสร้างสรรค์โดย ${character.ownerName}`}
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

        {/* Character Info Card */}
        <View style={styles.profileHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{character.name}</Text>
            {character.isOfficial ? (
              <Badge label="OFFICIAL" variant="official" />
            ) : character.isOwner ? (
              <Badge label="ผลงานของฉัน" variant="gold" />
            ) : (
              <Badge label="ผลงานสมาชิก" variant="muted" />
            )}
          </View>
          <Text style={styles.handle}>{character.handle}</Text>

          <Text style={styles.bio}>{character.bio}</Text>

          {/* Model Alignment: Owner Profile Card (ความสัมพันธ์ติดตาม/DM เป็นระดับผู้ใช้ ตัวละครคือผลงานใต้บัญชีเจ้าของ) */}
          <View style={styles.ownerCard}>
            <View style={styles.ownerTopRow}>
              <Image
                source={{
                  uri:
                    character.ownerAvatarUrl ||
                    'https://livezala.com/media/avatar/default',
                }}
                style={styles.ownerAvatar}
              />
              <View style={styles.ownerInfo}>
                <Text style={styles.ownerTag}>👤 เจ้าของผลงาน (Creator):</Text>
                <Text style={styles.ownerName}>{character.ownerName}</Text>
                {character.ownerHandle && (
                  <Text style={styles.ownerHandle}>{character.ownerHandle}</Text>
                )}
              </View>
            </View>

            <Text style={styles.ownerDescription}>
              ตัวละครนี้สร้างและเผยแพร่ภายใต้บัญชีสมาชิก Livezala ของ {character.ownerName}
            </Text>

            {/* Action Buttons: ติดตามและ DM ระดับผู้ใช้ (เจ้าของ) */}
            <View style={styles.actionRow}>
              {character.isOfficial ? (
                <View style={styles.officialLockedButton}>
                  <Text style={styles.officialLockedText}>
                    🔒 สมาชิกทุกคนติดตาม @live สองทางโดยอัตโนมัติ
                  </Text>
                </View>
              ) : character.isOwner ? (
                <View style={styles.myOwnershipBox}>
                  <Text style={styles.myOwnershipText}>
                    🌟 ตัวละครนี้เป็นผลงานของคุณเอง นำเสนอใต้บัญชีของคุณ
                  </Text>
                </View>
              ) : (
                <>
                  <Button
                    title={isFollowingOwner ? 'กำลังติดตามเจ้าของ' : '+ ติดตามเจ้าของ'}
                    variant={isFollowingOwner ? 'outline' : 'primary'}
                    onPress={handleFollowPress}
                    style={styles.actionBtn}
                  />

                  {/* DM Button with Mutual Check ระดับผู้ใช้ */}
                  <TouchableOpacity
                    style={[styles.dmActionButton, !isMutual && styles.dmActionButtonDisabled]}
                    onPress={() => {
                      if (isMutual) {
                        onOpenDM(character.id);
                      } else {
                        Alert.alert(
                          'การส่งข้อความระหว่างสมาชิก',
                          `ตามกฎความปลอดภัย: ส่งข้อความถึงเจ้าของ (${character.ownerName}) ได้เมื่อทั้งสองฝ่ายกดติดตามกันแล้วเท่านั้น`
                        );
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.dmActionText, !isMutual && styles.dmActionTextDisabled]}>
                      {isMutual ? '💬 ข้อความถึงเจ้าของ' : '🔒 ต้องติดตามกันสองฝ่าย'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity style={styles.blockBtn} onPress={handleBlockPress} activeOpacity={0.7}>
                <Text style={styles.blockBtnText}>🚫 บล็อก</Text>
              </TouchableOpacity>
            </View>
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

        {/* Posts showcasing this character */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionHeader}>📝 โพสต์อวดตัวละครนี้บนฟีด ({characterPosts.length})</Text>
          {characterPosts.length === 0 ? (
            <Text style={styles.noPostsText}>ยังไม่มีโพสต์อวดตัวละครนี้บนฟีด</Text>
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
    flexWrap: 'wrap',
  },
  name: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  handle: {
    color: colors.textSecondary,
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
  ownerCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
  },
  ownerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  ownerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerTag: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  ownerName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  ownerHandle: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  ownerDescription: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
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
  myOwnershipBox: {
    flex: 1,
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  myOwnershipText: {
    color: colors.badgeText,
    fontSize: 12,
    fontWeight: '600',
  },
  officialLockedButton: {
    flex: 1,
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  officialLockedText: {
    color: colors.badgeText,
    fontSize: 12,
    fontWeight: '700',
  },
  dmActionButton: {
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  dmActionButtonDisabled: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.border,
  },
  dmActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  dmActionTextDisabled: {
    color: colors.textSecondary,
  },
  blockBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blockBtnText: {
    color: colors.danger,
    fontSize: 12,
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
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 24,
  },
});
