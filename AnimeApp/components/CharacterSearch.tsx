import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert
} from 'react-native';
import { getCharacterWithImages } from '../services/api';
import { useAnimeStore } from '../store/animeStore';
import ImageModal from './ImageModal';

type Props = {
  readonly category: string; // ej: 'naruto'
  readonly categoryLabel: string; // ej: 'Naruto'
};

export default function CharacterSearch({ category, categoryLabel }: Props) {
  const [name, setName] = useState('');
  const [character, setCharacter] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const setLastCharacter = useAnimeStore((s) => s.setLastCharacter);

  const handleSearch = async () => {
    if (!name.trim()) { Alert.alert('Escribe un nombre'); return; }
    setLoading(true);
    setError('');
    setCharacter(null);
    try {
      const result = await getCharacterWithImages(category, name.trim());
      setCharacter(result);
      setLastCharacter(category, result); // guarda en resumen
    } catch (e: any) {
      setError(e.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Input + Botón */}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder={`Ej: Naruto, Gon, Luffy...`}
          placeholderTextColor="#666"
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.btn} onPress={handleSearch}>
          <Text style={styles.btnText}>Consultar</Text>
        </TouchableOpacity>
      </View>

      {/* Loading */}
      {loading && <ActivityIndicator color="#ff6b35" style={{ marginTop: 20 }} />}

      {/* Error */}
      {!!error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Resultado */}
      {character && (
        <View style={styles.card}>
          <Text style={styles.charName}>{character.name}</Text>
          <Text style={styles.charDetail}>Edad: {character.age}</Text>
          <Text style={styles.charDetail}>Poder: {character.power}</Text>

          <Text style={styles.imgCount}>
            🖼️ {character.images_count ?? character.images?.length ?? 0} imágenes recuperadas
          </Text>

          <TouchableOpacity
            style={styles.imgBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.imgBtnText}>Ver imágenes</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal */}
      <ImageModal
        visible={modalVisible}
        images={character?.images ?? []}
        characterName={character?.name ?? ''}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  row: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1, backgroundColor: '#1a1a2e', color: '#fff',
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#333', fontSize: 14,
  },
  btn: {
    backgroundColor: '#ff6b35', borderRadius: 8,
    paddingHorizontal: 16, justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  errorBox: {
    backgroundColor: '#2d1515', borderRadius: 8,
    padding: 12, marginTop: 12, borderWidth: 1, borderColor: '#5c2020',
  },
  errorText: { color: '#f87171', fontSize: 13 },
  card: {
    backgroundColor: '#111', borderRadius: 12,
    padding: 18, marginTop: 16, borderWidth: 1, borderColor: '#222',
  },
  charName: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  charDetail: { color: '#aaa', fontSize: 14, marginBottom: 4 },
  imgCount: { color: '#7dd3fc', marginTop: 12, fontSize: 13 },
  imgBtn: {
    backgroundColor: '#7c3aed', borderRadius: 8,
    padding: 12, alignItems: 'center', marginTop: 10,
  },
  imgBtnText: { color: '#fff', fontWeight: 'bold' },
});