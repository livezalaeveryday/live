import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';

interface CreatePostScreenProps {
  onClose: () => void;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ onClose }) => {
  const { myCharacters, activeCharacter, setActiveCharacter, createPost } = useApp();
  const [content, setContent] = useState('');

  const handlePost = () => {
    if (!content.trim()) {
      Alert.alert('กรุณากรอกข้อความ', 'พิมพ์เนื้อหาที่คุณต้องการโพสต์');
      return;
    }
    createPost(content.trim());
    Alert.alert('สำเร็จ', 'โพสต์เนื้อหาลงฟีดแอปเรียบร้อยแล้ว', [
      { text: 'ตกลง', onPress: onClose },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="สร้างโพสต์ใหม่"
        subtitle="โพสต์ในนามตัวละคร AI"
        rightActionText="ปิด"
        onRightAction={onClose}
        showLogo={false}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Character Selector */}
        <Text style={styles.sectionLabel}>เลือกตัวตนที่ใช้โพสต์ (DNA ตัวละคร)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.charList}>
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
        </ScrollView>

        {/* Character DNA Banner */}
        <View style={styles.dnaCard}>
          <Text style={styles.dnaTitle}>🧬 อัตลักษณ์ตัวละคร (DNA):</Text>
          <Text style={styles.dnaText}>"{activeCharacter.dna.personality}"</Text>
        </View>

        {/* Text Area */}
        <Text style={styles.sectionLabel}>เนื้อหาโพสต์</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="กำลังคิดอะไรอยู่? แสดงความคิดเห็นในมุมมองของตัวละครนี้..."
            placeholderTextColor={colors.textMuted}
            value={content}
            onChangeText={setContent}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{content.length}/1000</Text>
        </View>

        {/* Policy Notice */}
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            ℹ️ โพสต์นี้จะแสดงเฉพาะบนฟีดแอปสมาชิก live (com.livezala.app) โดยแยกเด็ดขาดจากฟีดหน้าเว็บ livezala.com
          </Text>
        </View>

        {/* Submit Button */}
        <Button
          title="เผยแพร่โพสต์"
          onPress={handlePost}
          disabled={!content.trim()}
          style={styles.submitBtn}
        />
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
    padding: 16,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 6,
  },
  charList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  charPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    marginRight: 10,
  },
  charPillSelected: {
    backgroundColor: colors.surfaceElevated,
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
    color: colors.textMuted,
    fontSize: 11,
  },
  dnaCard: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
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
    color: colors.textMuted,
    fontSize: 11,
  },
  noticeBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  noticeText: {
    color: colors.info,
    fontSize: 12,
    lineHeight: 17,
  },
  submitBtn: {
    marginTop: 8,
  },
});
