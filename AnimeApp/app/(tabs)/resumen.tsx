import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAnimeStore } from '../../store/animeStore';
import ImageModal from '../../components/ImageModal';

const CATEGORIES = [
  { id: 'saintseiya', label: 'Saint Seiya', emoji: '⚡' },
  { id: 'hunterxhunter', label: 'Hunter x Hunter', emoji: '🎯' },
  { id: 'onepiece', label: 'One Piece', emoji: '☠️' },
  { id: 'naruto', label: 'Naruto', emoji: '🍃' },
];

export default function ResumenTab() {
  const lastCharacters = useAnimeStore((s) => s.lastCharacters);
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalName, setModalName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  // Reúne todas las imágenes de todos los personajes consultados
  const allImages = Object.values(lastCharacters)
    .filter(Boolean)
    .flatMap((c: any) => c?.images ?? []);

  const openModal = (images: string[], name: string) => {
    setModalImages(images);
    setModalName(name);
    setModalVisible(true);
  };

  const hasAny = Object.values(lastCharacters).some(Boolean);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📋 Resumen</Text>
      <Text style={styles.sub}>Últimos personajes consultados por categoría</Text>

      {!hasAny && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Aún no consultaste personajes.{'\n'}Ve a cada categoría y busca uno.
          </Text>
        </View>
      )}

      {CATEGORIES.map(({ id, label, emoji }) => {
        const char = lastCharacters[id];
        if (!char) return null;
        return (
          <View key={id} style={styles.card}>
            <Text style={styles.catLabel}>{emoji} {label}</Text>
            <Text style={styles.charName}>{char.name}</Text>
            <Text style={styles.detail}>Edad: {char.age}</Text>
            <Text style={styles.detail}>Poder: {char.power}</Text>
            {char.images && (
              <TouchableOpacity
                style={styles.imgBtn}
                onPress={() => openModal(char.images!, char.name)}
              >
                <Text style={styles.imgBtnText}>Ver imágenes ({char.images.length})</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}

      {allImages.length > 0 && (
        <TouchableOpacity
          style={styles.allBtn}
          onPress={() => openModal(allImages, 'Todos los personajes')}
        >
          <Text style={styles.allBtnText}>
            🖼️ Ver TODAS las imágenes ({allImages.length} total)
          </Text>
        </TouchableOpacity>
      )}

      <ImageModal
        visible={modalVisible}
        images={modalImages}
        characterName={modalName}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', padding: 20, paddingBottom: 4 },
  sub: { color: '#555', fontSize: 12, paddingHorizontal: 20, marginBottom: 16 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#444', textAlign: 'center', lineHeight: 24 },
  card: {
    backgroundColor: '#111', borderRadius: 12, margin: 12,
    marginBottom: 0, padding: 18, borderWidth: 1, borderColor: '#1e1e2e',
  },
  catLabel: { color: '#7c3aed', fontSize: 12, fontWeight: 'bold', marginBottom: 6 },
  charName: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  detail: { color: '#888', fontSize: 13, marginBottom: 2 },
  imgBtn: {
    backgroundColor: '#1e0a3c', borderRadius: 8, padding: 10,
    alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: '#7c3aed',
  },
  imgBtnText: { color: '#a78bfa', fontWeight: 'bold', fontSize: 13 },
  allBtn: {
    backgroundColor: '#ff6b35', borderRadius: 12, margin: 16,
    padding: 16, alignItems: 'center',
  },
  allBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});