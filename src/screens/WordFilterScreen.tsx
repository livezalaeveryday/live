import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { BounceFlatList } from '../components/BounceView';
import { useApp } from '../context/AppContext';

interface WordFilterScreenProps {
  onBack: () => void;
}

export const WordFilterScreen: React.FC<WordFilterScreenProps> = ({ onBack }) => {
  const { wordFilters, addWordFilter, removeWordFilter, filterText } = useApp();
  const [newKeyword, setNewKeyword] = useState('');
  const [testText, setTestText] = useState('ตัวอย่างข้อความทดสอบการกรอง');

  const handleAdd = () => {
    if (!newKeyword.trim()) return;
    addWordFilter(newKeyword.trim());
    setNewKeyword('');
  };

  const handleRemove = (id: string, keyword: string) => {
    Alert.alert('ลบคำกรอง', `ต้องการลบคำว่า "${keyword}" ออกจากตัวกรองใช่หรือไม่?`, [
      { text: 'ยกเลิก', style: 'cancel' },
      { text: 'ลบ', style: 'destructive', onPress: () => removeWordFilter(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="ตัวกรองคำส่วนตัว"
        subtitle="ซ่อนหรือเซนเซอร์คำที่ไม่ต้องการเห็น"
        rightActionText="เสร็จสิ้น"
        onRightAction={onBack}
        onBack={onBack}
        showLogo={false}
      />

      <View style={styles.content}>
        {/* Description Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            🛡️ คำที่คุณเพิ่มในรายการนี้จะถูกเซนเซอร์เป็น (***) โดยอัตโนมัติเมื่อปรากฏในโพสต์หรือความคิดเห็นในฟีดของคุณ
          </Text>
        </View>

        {/* Add Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="พิมพ์คำที่ต้องการกรอง..."
            placeholderTextColor={colors.textMuted}
            value={newKeyword}
            onChangeText={setNewKeyword}
          />
          <Button
            title="+ เพิ่มคำ"
            onPress={handleAdd}
            disabled={!newKeyword.trim()}
            style={styles.addBtn}
          />
        </View>

        {/* Word Filters List */}
        <Text style={styles.listHeader}>รายการคำที่กำลังกรอง ({wordFilters.length} คำ)</Text>
        <BounceFlatList
          data={wordFilters}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.wordPill}>
              <Text style={styles.wordText}>"{item.keyword}"</Text>
              <TouchableOpacity
                onPress={() => handleRemove(item.id, item.keyword)}
                style={styles.deleteIconBox}
              >
                <Text style={styles.deleteIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={wordFilters.length === 0 ? styles.emptyContainer : styles.listGrid}
          ListEmptyComponent={
            <Text style={styles.emptyText}>ยังไม่มีคำในตัวกรอง เพิ่มคำแรกด้านบนเพื่อเริ่มใช้งาน</Text>
          }
        />

        {/* Interactive Live Preview */}
        <View style={styles.previewBox}>
          <Text style={styles.previewHeader}>🔬 เครื่องมือทดสอบตัวกรองสด (Live Test):</Text>
          <TextInput
            style={styles.previewInput}
            value={testText}
            onChangeText={setTestText}
            placeholder="พิมพ์ข้อความทดสอบ..."
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.previewOutputBox}>
            <Text style={styles.previewOutputLabel}>ผลลัพธ์ที่จะแสดงในฟีดของคุณ:</Text>
            <Text style={styles.previewOutputText}>{filterText(testText)}</Text>
          </View>
        </View>
      </View>
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
    flex: 1,
  },
  banner: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 14,
  },
  addBtn: {
    height: 44,
  },
  listHeader: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  listGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 8,
  },
  wordText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  deleteIconBox: {
    padding: 2,
  },
  deleteIcon: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
  previewBox: {
    marginTop: 'auto',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  previewHeader: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  previewInput: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: colors.text,
    fontSize: 13,
    marginBottom: 8,
  },
  previewOutputBox: {
    backgroundColor: colors.surfaceCard,
    padding: 10,
    borderRadius: 6,
  },
  previewOutputLabel: {
    color: colors.textMuted,
    fontSize: 11,
    marginBottom: 4,
  },
  previewOutputText: {
    color: colors.success,
    fontSize: 14,
    fontWeight: '600',
  },
});
