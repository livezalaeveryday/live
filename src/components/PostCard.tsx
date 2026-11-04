import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Post } from '../types';
import { colors } from '../theme/colors';
import { Badge } from './Badge';
import { useApp } from '../context/AppContext';

interface PostCardProps {
  post: Post;
  onSelectCharacter?: (characterId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onSelectCharacter }) => {
  const { likePost, reportPost, blockCharacter, filterText } = useApp();
  const [menuVisible, setMenuVisible] = useState(false);

  const filteredContent = filterText(post.content);

  const handleReport = () => {
    setMenuVisible(false);
    Alert.alert(
      'รายงานเนื้อหา',
      'คุณต้องการรายงานโพสต์นี้ว่าไม่เหมาะสมใช่หรือไม่? (หากได้รับการรายงานครบ 10 ครั้ง โพสต์จะถูกซ่อนจากระบบอัตโนมัติ)',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ยืนยันรายงาน',
          style: 'destructive',
          onPress: () => {
            reportPost(post.id, 'Inappropriate content');
            Alert.alert('สำเร็จ', 'ส่งรายงานเรียบร้อยแล้ว');
          },
        },
      ]
    );
  };

  const handleBlock = () => {
    setMenuVisible(false);
    Alert.alert(
      'บล็อกตัวละคร',
      `คุณต้องการบล็อก ${post.character.name} ใช่หรือไม่? คุณจะไม่เห็นโพสต์หรือข้อความจากตัวละครนี้อีก`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'บล็อก',
          style: 'destructive',
          onPress: () => {
            blockCharacter(post.character);
            Alert.alert('สำเร็จ', `บล็อก ${post.character.name} แล้ว`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      {/* Header: Owner Posting in Their Own Name */}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <Image
            source={{ uri: post.ownerAvatarUrl || post.character.avatarUrl }}
            style={styles.avatar}
          />
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{post.ownerName || post.character.name}</Text>
              {post.isOfficialOwner || post.character.isOfficial ? (
                <Badge label="OFFICIAL" variant="official" />
              ) : (
                <Badge label="เจ้าของผลงาน" variant="gold" />
              )}
            </View>
            <Text style={styles.handle}>
              {post.ownerHandle || post.character.handle} · {post.createdAt}
            </Text>
          </View>
        </View>

        {/* 3-dots Menu Button */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(!menuVisible)}
          activeOpacity={0.7}
        >
          <Text style={styles.menuDots}>•••</Text>
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {menuVisible && (
        <View style={styles.menuDropdown}>
          <TouchableOpacity style={styles.menuItem} onPress={handleBlock}>
            <Text style={styles.menuItemTextDanger}>🚫 บล็อกตัวละครนี้ ({post.character.name})</Text>
          </TouchableOpacity>
          <View style={styles.menuDivider} />
          <TouchableOpacity style={styles.menuItem} onPress={handleReport}>
            <Text style={styles.menuItemTextDanger}>⚠️ รายงานโพสต์ (รายงานแล้ว: {post.reportCount}/10)</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Body Content */}
      <Text style={styles.content}>{filteredContent}</Text>

      {/* Character Showcase Card: 'เลือกตัวละครของตัวเองมาโพสต์ลงฟีด เพื่ออวด' */}
      <TouchableOpacity
        style={styles.showcaseCard}
        onPress={() => onSelectCharacter && onSelectCharacter(post.character.id)}
        activeOpacity={0.85}
      >
        <Image source={{ uri: post.character.avatarUrl }} style={styles.showcaseAvatar} />
        <View style={styles.showcaseContent}>
          <View style={styles.showcaseTagRow}>
            <Text style={styles.showcaseBadgeText}>🎭 ตัวละครที่นำเสนอ:</Text>
            <Text style={styles.showcaseCharName}>{post.character.name}</Text>
            <Text style={styles.showcaseCharHandle}>{post.character.handle}</Text>
          </View>
          <Text style={styles.showcaseCharBio} numberOfLines={1}>
            {post.character.bio}
          </Text>
        </View>
        <Text style={styles.showcaseArrow}>ดูผลงาน ›</Text>
      </TouchableOpacity>

      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
      )}

      {/* Actions Bar */}
      <View style={styles.actionsBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => likePost(post.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionIcon, post.isLiked && styles.likedIcon]}>
            {post.isLiked ? '♥' : '♡'}
          </Text>
          <Text style={[styles.actionLabel, post.isLiked && styles.likedLabel]}>
            {post.likeCount}
          </Text>
        </TouchableOpacity>

        <View style={styles.actionBtn}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionLabel}>{post.commentCount}</Text>
        </View>

        {post.reportCount > 0 && (
          <View style={styles.reportBadge}>
            <Text style={styles.reportText}>⚠️ รายงาน {post.reportCount}/10</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 16,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  authorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  handle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  menuButton: {
    padding: 8,
  },
  menuDots: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '900',
  },
  menuDropdown: {
    position: 'absolute',
    top: 50,
    right: 16,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: 4,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 8,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  menuItemTextDanger: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  content: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  showcaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    gap: 10,
  },
  showcaseAvatar: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  showcaseContent: {
    flex: 1,
  },
  showcaseTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  showcaseBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  showcaseCharName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  showcaseCharHandle: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  showcaseCharBio: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  showcaseArrow: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: colors.surfaceElevated,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    color: colors.textSecondary,
    fontSize: 18,
  },
  likedIcon: {
    color: colors.primary,
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  likedLabel: {
    color: colors.primary,
  },
  reportBadge: {
    marginLeft: 'auto',
    backgroundColor: colors.dangerMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reportText: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '600',
  },
});
