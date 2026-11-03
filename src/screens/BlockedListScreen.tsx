import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { useApp } from '../context/AppContext';

interface BlockedListScreenProps {
  onBack: () => void;
}

export const BlockedListScreen: React.FC<BlockedListScreenProps> = ({ onBack }) => {
  const { blockedEntities, unblockEntity } = useApp();

  const handleUnblock = (entityId: string, name: string) => {
    Alert.alert('ปลดบล็อก', `คุณต้องการปลดบล็อก ${name} ใช่หรือไม่? เนื้อหาจะกลับมาแสดงในฟีดของคุณ`, [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ปลดบล็อก',
        onPress: () => {
          unblockEntity(entityId);
          Alert.alert('สำเร็จ', `ปลดบล็อก ${name} เรียบร้อยแล้ว`);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Header
        title="รายการที่ถูกบล็อก"
        subtitle="จัดการตัวละครและเนื้อหาที่ถูกซ่อน"
        rightActionText="เสร็จสิ้น"
        onRightAction={onBack}
        showLogo={false}
      />

      <FlatList
        data={blockedEntities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image
              source={{
                uri: item.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
              }}
              style={styles.avatar}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.type}>ประเภท: {item.entityType === 'character' ? 'ตัวละคร' : 'ผู้ใช้'}</Text>
            </View>
            <Button
              title="ปลดบล็อก"
              variant="outline"
              onPress={() => handleUnblock(item.entityId, item.name)}
              style={styles.unblockBtn}
              textStyle={styles.unblockText}
            />
          </View>
        )}
        contentContainerStyle={blockedEntities.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🕊️</Text>
            <Text style={styles.emptyTitle}>ไม่มีรายการที่ถูกบล็อก</Text>
            <Text style={styles.emptyText}>
              คุณยังไม่ได้บล็อกตัวละครหรือผู้ใช้งานใดๆ หากพบบัญชีหรือเนื้อหาที่ไม่พึงประสงค์ สามารถกดบล็อกได้จากปุ่มเมนูบนโพสต์หรือหน้าโปรไฟล์
            </Text>
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
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  type: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  unblockBtn: {
    height: 34,
    paddingHorizontal: 12,
  },
  unblockText: {
    fontSize: 12,
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
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
