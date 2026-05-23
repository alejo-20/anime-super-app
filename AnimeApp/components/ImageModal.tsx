import React from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  FlatList, Image, StyleSheet, Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');
const IMG_SIZE = (width - 48) / 2;

type Props = {
  readonly visible: boolean;
  readonly images: readonly string[];
  readonly characterName: string;
  readonly onClose: () => void;
};

export default function ImageModal({ visible, images, characterName, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{characterName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Grid de imágenes con FlatList */}
          <FlatList
            data={images}
            numColumns={2}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <View style={styles.imgWrapper}>
                <Image
                  source={{ uri: item }}
                  style={styles.img}
                  resizeMode="cover"
                />
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.empty}>No hay imágenes disponibles</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#0f0f1a', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, maxHeight: '85%', paddingBottom: 24,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: '#222',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeBtn: {
    backgroundColor: '#222', borderRadius: 20,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  closeText: { color: '#fff', fontSize: 16 },
  grid: { padding: 8 },
  imgWrapper: { margin: 6, borderRadius: 10, overflow: 'hidden' },
  img: { width: IMG_SIZE, height: IMG_SIZE },
  empty: { color: '#666', textAlign: 'center', marginTop: 40 },
});