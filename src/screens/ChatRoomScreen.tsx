import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { BounceFlatList } from '../components/BounceView';
import { useApp } from '../context/AppContext';

interface ChatRoomScreenProps {
  characterId: string;
  onBack: () => void;
}

interface MessageItem {
  id: string;
  text: string;
  isMe: boolean;
  time: string;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ characterId, onBack }) => {
  const { characters, activeCharacter, sendMessage, blockCharacter } = useApp();
  const character = characters.find((c) => c.id === characterId);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'm1',
      text: character?.id === 'char_official_live'
        ? 'ยินดีต้อนรับสู่ระบบ live ข้อความส่วนตัวเปิดให้บริการเฉพาะคู่ที่ติดตามกันสองฝ่าย'
        : 'สวัสดีครับ/ค่ะ มีอะไรให้ประสานงานหรือแลกเปลี่ยนข้อมูลไหมคะ?',
      isMe: false,
      time: '10:00',
    },
  ]);

  if (!character) {
    return (
      <View style={styles.container}>
        <Header title="ไม่พบตัวละคร" rightActionText="กลับ" onRightAction={onBack} onBack={onBack} showLogo={false} />
      </View>
    );
  }

  const isMutual = character.isFollowing && character.isFollowerOfMe;

  const handleSend = () => {
    if (!input.trim()) return;

    if (!isMutual) {
      Alert.alert('ข้อผิดพลาด', 'ไม่สามารถส่งข้อความได้เนื่องจากไม่ได้ติดตามกันทั้งสองฝ่าย');
      return;
    }

    const newMsg: MessageItem = {
      id: 'm_' + Date.now(),
      text: input.trim(),
      isMe: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    sendMessage(character.id, input.trim());
    setInput('');
  };

  const handleBlock = () => {
    Alert.alert(
      'บล็อกการสนทนา',
      `ต้องการบล็อก ${character.name} และหยุดรับข้อความใช่หรือไม่?`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'บล็อก',
          style: 'destructive',
          onPress: () => {
            blockCharacter(character);
            Alert.alert('สำเร็จ', 'บล็อกตัวละครเรียบร้อยแล้ว', [{ text: 'ตกลง', onPress: onBack }]);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={character.name}
        subtitle={isMutual ? '🟢 กำลังเชื่อมต่อ (Mutual Follow)' : '🔴 ขาดการติดตามสองทาง'}
        rightActionText="บล็อก"
        onRightAction={handleBlock}
        onBack={onBack}
        showLogo={false}
      />

      {/* Messages Feed */}
      <BounceFlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.bubbleWrapper, item.isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
            {!item.isMe && (
              <Image source={{ uri: character.avatarUrl }} style={styles.bubbleAvatar} />
            )}
            <View style={[styles.bubble, item.isMe ? styles.myBubble : styles.theirBubble]}>
              <Text style={[styles.bubbleText, item.isMe ? styles.myBubbleText : styles.theirBubbleText]}>
                {item.text}
              </Text>
              <Text style={[styles.bubbleTime, item.isMe ? styles.myBubbleTime : styles.theirBubbleTime]}>
                {item.time}
              </Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder={isMutual ? 'พิมพ์ข้อความ...' : 'ต้องติดตามกันสองฝ่ายจึงจะพิมพ์ได้'}
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          editable={isMutual}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!input.trim() || !isMutual) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || !isMutual}
          activeOpacity={0.8}
        >
          <Text style={styles.sendText}>ส่ง</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  bubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-end',
    gap: 8,
  },
  myBubbleWrapper: {
    justifyContent: 'flex-end',
  },
  theirBubbleWrapper: {
    justifyContent: 'flex-start',
  },
  bubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceElevated,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  myBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  theirBubble: {
    backgroundColor: colors.surfaceElevated,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  myBubbleText: {
    color: colors.white,
  },
  theirBubbleText: {
    color: colors.text,
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  myBubbleTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirBubbleTime: {
    color: colors.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.text,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: colors.surfaceElevated,
    opacity: 0.5,
  },
  sendText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
