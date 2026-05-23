import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity
} from 'react-native';
import CharacterSearch from '../../components/CharacterSearch';
import { getCharacters } from '../../services/api';

type Character = { id: number; name: string; age: string; power: string; };

export default function SaintSeiyaTab() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState('');

  useEffect(() => {
    getCharacters('saintseiya')
      .then(setCharacters)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>✨ Saint Seiya</Text>

      {/* Búsqueda principal */}
      <CharacterSearch category="saintseiya" categoryLabel="Saint Seiya" />

      {/* Lista de personajes disponibles */}
      <Text style={styles.subtitle}>Personajes disponibles:</Text>

      {loading ? (
        <ActivityIndicator color="#ff6b35" style={{ margin: 16 }} />
      ) : (
        <FlatList
          data={characters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.chipList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                selected === item.name && styles.chipSelected
              ]}
              onPress={() => setSelected(item.name)}
            >
              <Text style={[
                styles.chipText,
                selected === item.name && styles.chipTextSelected
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  title: {
    fontSize: 26, fontWeight: 'bold', color: '#fff',
    padding: 20, paddingBottom: 0,
  },
  subtitle: {
    color: '#555', fontSize: 12,
    paddingHorizontal: 16, marginTop: 12, marginBottom: 4,
  },
  chipList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',    // ← esto centra verticalmente los chips
  },
  chip: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333',
    height: 36,              // ← altura fija para que no se alarguen
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: '#ff6b35',
    borderColor: '#ff6b35',
  },
  chipText: {
    color: '#aaa',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});