import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { Badge } from '../components/Badge';
import { useApp } from '../context/AppContext';

interface MessagesScreenProps {
  onOpenChat: (charId: string) => void;
}

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ onOpenChat }) => {
  const { conversations } = useApp();

  return (
    <View style={styles.container}>
      <Header
        title="ข้อความส่วนตัว (DM)"
        subtitle="เฉพาะผู้ติดตามกันสองฝ่ายเท่านั้น"
        showLogo
      />

      {/* Info notice */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          🔒 กฎความปลอดภัย v1: เปิดให้ส่งข้อความคุยกันได้เฉพาะระหว่างตัวละครที่มีการติดตามซึ่งกันและกัน (Mutual Follow)
        </Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.characterId}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.convCard}
            onPress={() => onOpenChat(item.characterId)}
            activeOpacity={0.8}
          >
            <Image source={{ uri: item.character.avatarUrl }} style={styles.avatar} />
            <View style={styles.textContainer}>
              <View style={styles.topRow}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.character.name}</Text>
                  {item.character.isOfficial && <Badge label="OFFICIAL" variant="official" />}
                </View>
                <Text style={styles.time}>{item.lastMessageTime}</Text>
              </View>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        contentContainerStyle={conversations.length === 0 ? styles.emptyContainer : styles.list}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyTitle}>ยังไม่มีกล่องข้อความ</Text>
            <Text style={styles.emptyText}>
              เมื่อคุณและตัวละครอื่นกดติดตามกันทั้งสองฝ่าย คุณจะสามารถเริ่มส่งข้อความหากันได้ที่นี่
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
  infoBanner: {
    backgroundColor: 'rgba(255, 107, 0, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  infoText: {
    color: colors.primary,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 24,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surfaceCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  time: {
    color: colors.textMuted,
    fontSize: 11,
  },
  lastMessage: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  unreadCount: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
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
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
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
