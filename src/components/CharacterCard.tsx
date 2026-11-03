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

  const handleFollowPress = () => {
    const res = toggleFollow(character.id);
    if (!res.success && res.message) {
      Alert.alert('แจ้งเตือน', res.message);
    }
  };

  const isMutual = character.isFollowing && character.isFollowerOfMe;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.topRow}>
        <Image source={{ uri: character.avatarUrl }} style={styles.avatar} />

        <View style={styles.infoCol}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{character.name}</Text>
            {character.isOfficial && <Badge label="OFFICIAL" variant="official" />}
            {character.isOwner && <Badge label="ของฉัน" variant="primary" />}
          </View>
          <Text style={styles.handle}>{character.handle}</Text>
        </View>

        {/* Follow Button */}
        {character.isOfficial ? (
          <View style={styles.officialLockBadge}>
            <Text style={styles.officialLockText}>🔒 ติดตามถาวร</Text>
          </View>
        ) : (
          <Button
            title={character.isFollowing ? 'กำลังติดตาม' : '+ ติดตาม'}
            variant={character.isFollowing ? 'outline' : 'primary'}
            onPress={handleFollowPress}
            style={styles.followBtn}
            textStyle={styles.followBtnText}
          />
        )}
      </View>

      <Text style={styles.bio} numberOfLines={2}>
        {character.bio}
      </Text>

      {/* Stats and DM Capability */}
      <View style={styles.footerRow}>
        <View style={styles.stats}>
          <Text style={styles.statItem}>
            <Text style={styles.statBold}>{character.followerCount.toLocaleString()} </Text>
            ผู้ติดตาม
          </Text>
          <Text style={styles.statItem}>
            <Text style={styles.statBold}>{character.followingCount.toLocaleString()} </Text>
            กำลังติดตาม
          </Text>
        </View>

        {/* DM Status */}
        {onOpenDM && (
          <TouchableOpacity
            style={[styles.dmBtn, !isMutual && styles.dmBtnDisabled]}
            onPress={isMutual ? onOpenDM : () => Alert.alert('DM ถูกล็อก', 'สามารถส่งข้อความได้เมื่อทั้งสองฝ่ายติดตามกันแล้วเท่านั้น')}
            activeOpacity={0.8}
          >
            <Text style={[styles.dmBtnText, !isMutual && styles.dmBtnTextDisabled]}>
              {isMutual ? '💬 ส่งข้อความ' : '🔒 ต้องติดตามกันก่อน'}
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
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  handle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  officialLockBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: colors.info,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  officialLockText: {
    color: colors.info,
    fontSize: 11,
    fontWeight: '700',
  },
  followBtn: {
    height: 34,
    paddingHorizontal: 12,
  },
  followBtnText: {
    fontSize: 12,
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
  },
  stats: {
    flexDirection: 'row',
    gap: 14,
  },
  statItem: {
    color: colors.textMuted,
    fontSize: 12,
  },
  statBold: {
    color: colors.text,
    fontWeight: '700',
  },
  dmBtn: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  dmBtnDisabled: {
    opacity: 0.6,
    borderColor: colors.border,
  },
  dmBtnText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  dmBtnTextDisabled: {
    color: colors.textMuted,
  },
});
