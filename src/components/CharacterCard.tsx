import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Character } from '../types';
import { colors } from '../theme/colors';
import { Badge } from './Badge';
import { Button } from './Button';
import { useApp } from '../context/AppContext';

interface CharacterCardProps {
  character: Character;
  onPress: () => void;
  onOpenDM?: () => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onPress, onOpenDM }) => {
  const { toggleFollow } = useApp();

  const handleFollowOwner = () => {
    const res = toggleFollow(character.id);
    if (!res.success && res.message) {
      Alert.alert('แจ้งเตือน', res.message);
    }
  };

  const isMutual = (character.isOwnerFollowing ?? character.isFollowing) &&
                   (character.isOwnerFollowerOfMe ?? character.isFollowerOfMe);
  const isFollowingOwner = character.isOwnerFollowing ?? character.isFollowing;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <Image source={{ uri: character.avatarUrl }} style={styles.avatar} />

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
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
        </View>

        {/* Action / Status */}
        {character.isOfficial ? (
          <View style={styles.officialLockBadge}>
            <Text style={styles.officialLockText}>🔒 ติดตามถาวร</Text>
          </View>
        ) : character.isOwner ? (
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerBadgeText}>★ เจ้าของ</Text>
          </View>
        ) : (
          <Button
            title={isFollowingOwner ? 'กำลังติดตามเจ้าของ' : '+ ติดตามเจ้าของ'}
            variant={isFollowingOwner ? 'outline' : 'primary'}
            onPress={handleFollowOwner}
            style={styles.followBtn}
            textStyle={styles.followBtnText}
          />
        )}
      </View>

      {/* Creator / Owner Attribution — Model: ตัวละครแสดงเป็นผลงานของเจ้าของใต้บัญชีเจ้าของ */}
      <View style={styles.creatorBar}>
        <Text style={styles.creatorLabel}>
          👤 เจ้าของผลงาน: <Text style={styles.creatorName}>{character.ownerName}</Text>
          {character.ownerHandle ? ` (${character.ownerHandle})` : ''}
        </Text>
      </View>

      <Text style={styles.bio} numberOfLines={2}>
        {character.bio}
      </Text>

      {/* DNA Highlight and Actions */}
      <View style={styles.footerRow}>
        <View style={styles.dnaSnippet}>
          <Text style={styles.dnaText} numberOfLines={1}>
            🧬 {character.dna.personality}
          </Text>
        </View>

        {/* DM to Owner */}
        {onOpenDM && !character.isOwner && !character.isOfficial && (
          <TouchableOpacity
            style={[styles.dmBtn, !isMutual && styles.dmBtnDisabled]}
            onPress={
              isMutual
                ? onOpenDM
                : () =>
                    Alert.alert(
                      'การส่งข้อความระหว่างสมาชิก',
                      `ตามกฎความปลอดภัย: ส่งข้อความถึงเจ้าของ (${character.ownerName}) ได้เมื่อทั้งสองฝ่ายกดติดตามกันแล้วเท่านั้น`
                    )
            }
            activeOpacity={0.8}
          >
            <Text style={[styles.dmBtnText, !isMutual && styles.dmBtnTextDisabled]}>
              {isMutual ? '💬 ข้อความถึงเจ้าของ' : '🔒 ต้องติดตามกันสองฝ่าย'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  handle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  officialLockBadge: {
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  officialLockText: {
    color: colors.badgeText,
    fontSize: 11,
    fontWeight: '700',
  },
  ownerBadge: {
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  ownerBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  followBtn: {
    height: 34,
    paddingHorizontal: 10,
  },
  followBtnText: {
    fontSize: 11,
  },
  creatorBar: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.primary,
  },
  creatorLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  creatorName: {
    color: colors.primary,
    fontWeight: '700',
  },
  bio: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  dnaSnippet: {
    flex: 1,
  },
  dnaText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
  },
  dmBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dmBtnDisabled: {
    opacity: 0.6,
    borderColor: colors.border,
  },
  dmBtnText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  dmBtnTextDisabled: {
    color: colors.textSecondary,
  },
});
