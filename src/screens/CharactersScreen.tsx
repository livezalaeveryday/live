import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { CharacterCard } from '../components/CharacterCard';
import { BounceScrollView } from '../components/BounceView';
import { useApp } from '../context/AppContext';

interface CharactersScreenProps {
  onSelectCharacter: (charId: string) => void;
  onOpenDM: (charId: string) => void;
}

export const CharactersScreen: React.FC<CharactersScreenProps> = ({
  onSelectCharacter,
  onOpenDM,
}) => {
  const { characters } = useApp();
  const [search, setSearch] = useState('');

  const filtered = characters.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.handle.toLowerCase().includes(search.toLowerCase()) ||
      c.bio.toLowerCase().includes(search.toLowerCase()) ||
      (c.ownerName && c.ownerName.toLowerCase().includes(search.toLowerCase()))
  );

  const officialChars = filtered.filter((c) => c.isOfficial);
  const myChars = filtered.filter((c) => c.isOwner && !c.isOfficial);
  const otherChars = filtered.filter((c) => !c.isOwner && !c.isOfficial);

  return (
    <View style={styles.container}>
      <Header
        title="ตัวละคร AI"
        subtitle="ผลงานตัวละครที่สมาชิกสร้างและนำเสนอ"
        showLogo
      />

      {/* Model Definition Banner */}
      <View style={styles.modelBanner}>
        <Text style={styles.modelBannerText}>
          🎭 ตัวละครแสดงเป็นผลงานของเจ้าของใต้บัญชีตนเอง ไม่ใช่บัญชีสมาชิกอิสระ
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาตัวละครตามชื่อ อัตลักษณ์ หรือชื่อเจ้าของ..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <BounceScrollView contentContainerStyle={styles.list}>
        {/* Official Section */}
        {officialChars.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ ตัวละครทางการของระบบ (Official Character)</Text>
            {officialChars.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onPress={() => onSelectCharacter(char.id)}
                onOpenDM={() => onOpenDM(char.id)}
              />
            ))}
          </View>
        )}

        {/* My Characters Section */}
        {myChars.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎭 ตัวละครผลงานของฉัน (My Creations)</Text>
            {myChars.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onPress={() => onSelectCharacter(char.id)}
                onOpenDM={() => onOpenDM(char.id)}
              />
            ))}
          </View>
        )}

        {/* Discover Section */}
        {otherChars.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌐 ผลงานตัวละครของสมาชิกท่านอื่น (Community Creations)</Text>
            {otherChars.map((char) => (
              <CharacterCard
                key={char.id}
                character={char}
                onPress={() => onSelectCharacter(char.id)}
                onOpenDM={() => onOpenDM(char.id)}
              />
            ))}
          </View>
        )}
      </BounceScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modelBanner: {
    backgroundColor: colors.badgeBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.badgeBorder,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modelBannerText: {
    color: colors.badgeText,
    fontSize: 11,
    fontWeight: '600',
  },
  searchBox: {
    padding: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.surfaceCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
});
