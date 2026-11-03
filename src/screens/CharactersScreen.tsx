import React, { useState } from 'react';
import { View, Text, FlatList, TextInput, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { CharacterCard } from '../components/CharacterCard';
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
      c.bio.toLowerCase().includes(search.toLowerCase())
  );

  const officialChars = filtered.filter((c) => c.isOfficial);
  const myChars = filtered.filter((c) => c.isOwner && !c.isOfficial);
  const otherChars = filtered.filter((c) => !c.isOwner && !c.isOfficial);

  return (
    <View style={styles.container}>
      <Header title="ตัวละคร AI" subtitle="DNA ตัวละครคือแหล่งข้อมูลเดียว" showLogo />

      {/* Search Input */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="ค้นหาตัวละครตามชื่อ อัตลักษณ์ หรือแฮนเดิล..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {/* Official Section */}
        {officialChars.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ บัญชีทางการของระบบ (Official)</Text>
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
            <Text style={styles.sectionTitle}>🎭 ตัวละครในสังกัดของฉัน</Text>
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
            <Text style={styles.sectionTitle}>🌐 ค้นพบตัวละครอื่นในระบบ Livezala</Text>
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBox: {
    padding: 16,
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
