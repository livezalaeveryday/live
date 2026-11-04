import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { BounceScrollView } from '../components/BounceView';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

interface CreatePostScreenProps {
  onClose: () => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onClose }) => {
  const { myCharacters, activeCharacter, setActiveCharacter, createPost } = useApp();
  const { user } = useAuth();
  const [content, setContent] = useState('');

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert('กรุณากรอกข้อความ', 'พิมพ์เนื้อหาที่คุณต้องการนำเสนอตัวละคร');
      return;
    }
    createPost(content.trim());
    Alert.alert('สำเร็จ', 'เผยแพร่โพสต์อวดตัวละครลงฟีดเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: onClose },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="สร้างโพสต์ใหม่"
        subtitle="โพสต์ในนามของคุณ เลือกตัวละครมาอวดบนฟีด"
        rightActionText="ปิด"
        onRightAction={onClose}
        onBack={onClose}
        showLogo={false}
      />

      <BounceScrollView contentContainerStyle={styles.content}>
        {/* Posting Identity Banner */}
        <View style={styles.authorBanner}>
          <Text style={styles.authorBannerText}>
            👤 โพสต์ในนามเจ้าของ: <Text style={styles.authorName}>{user?.name || 'สมาชิก Livezala'}</Text>
          </Text>
        </View>

        {/* Character Selector */}
        <Text style={styles.sectionLabel}>เลือกตัวละครของคุณที่ต้องการนำเสนอ/อวดบนฟีด</Text>
        <BounceScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.charList}>
          {myCharacters.map((char) => {
            const isSelected = char.id === activeCharacter.id;
            return (
              <TouchableOpacity
                key={char.id}
                style={[styles.charPill, isSelected && styles.charPillSelected]}
                onPress={() => setActiveCharacter(char)}
                activeOpacity={0.8}
              >
                <Image source={{ uri: char.avatarUrl }} style={styles.pillAvatar} />
                <View>
                  <Text style={[styles.pillName, isSelected && styles.pillNameSelected]}>
                    {char.name}
                  </Text>
                  <Text style={styles.pillHandle}>{char.handle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </BounceScrollView>

        {/* Character DNA Banner */}
        <View style={styles.dnaCard}>
          <Text style={styles.dnaTitle}>🧬 อัตลักษณ์ตัวละครที่เลือก (DNA):</Text>
          <Text style={styles.dnaText}>"{activeCharacter.dna.personality}"</Text>
        </View>

        {/* Text Area */}
        <Text style={styles.sectionLabel}>ข้อความบรรยายการอวดตัวละคร</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="เขียนข้อความหรือเรื่องราวเพื่ออวดตัวละครของคุณบนฟีดให้สมาชิกท่านอื่นเห็น..."
            placeholderTextColor={colors.textSecondary}
            value={content}
            onChangeText={setContent}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>
        </View>

        {/* Policy Notice (ทองเข้มตามเว็บหลัก) */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ℹ️ โพสต์จะแสดงในนามของคุณบนฟีดแอปสมาชิก live พร้อมการ์ดแนะนำตัวละครที่คุณเลือก
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title="เผยแพร่โพสต์อวดตัวละคร"
          onPress={handlePost}
          disabled={!content.trim()}
          style={styles.submitBtn}
        />
      </BounceScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  authorBanner: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 14,
  },
  authorBannerText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  authorName: {
    color: colors.primary,
    fontWeight: '700',
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 4,
  },
  charList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  charPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 10,
  },
  charPillSelected: {
    backgroundColor: colors.badgeBg,
    borderColor: colors.primary,
  },
  pillAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  pillName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  pillNameSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  pillHandle: {
    color: colors.textSecondary,
    fontSize: 11,
  },
  dnaCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dnaTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  dnaText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  inputContainer: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    minHeight: 180,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  textInput: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  charCount: {
    alignSelf: 'flex-end',
    color: colors.textSecondary,
    fontSize: 11,
  },
  noticeBox: {
    backgroundColor: colors.badgeBg,
    borderWidth: 1,
    borderColor: colors.badgeBorder,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  noticeText: {
    color: colors.badgeText,
    fontSize: 12,
    lineHeight: 18,
  },
  submitBtn: {
    marginTop: 8,
  },
});
