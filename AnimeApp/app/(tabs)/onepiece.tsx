import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import CharacterSearch from '../../components/CharacterSearch';
import { Character, getCharacters } from '../../services/api';

export default function OnePieceTab() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCharacters('onepiece')
      .then(setCharacters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏴‍☠️ One Piece</Text>

      <CharacterSearch category="onepiece" categoryLabel="One Piece" />

      <Text style={styles.subtitle}>Personajes disponibles:</Text>

      {loading ? (
        <ActivityIndicator color="#ff6b35" />
      ) : (
        <FlatList
          data={characters}
          horizontal
          keyExtractor={(item: any) => item.id.toString()}
          renderItem={({ item }: any) => (
            <View style={styles.chip}>
              <Text style={styles.chipText}>{item.name}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    padding: 20,
    paddingBottom: 0,
  },

  subtitle: {
    color: '#666',
    fontSize: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },

  chip: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#333',
  },

  chipText: {
    color: '#aaa',
    fontSize: 12,
  },
});