import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert, ActivityIndicator,
  ScrollView, Image, Modal, Dimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { authHeaders } from '../../services/auth';
import { uploadCharacterImage, deleteCharacterImage } from '../../services/api';

const CONTENT_URL = __DEV__
  ? 'http://localhost:5000'
  : 'https://user-content-service-production.up.railway.app';

type Character = {
  id: number;
  name: string;
  age: string;
  power: string;
  category: string;
  notes: string;
  images?: string[];
  images_count?: number;
};

export default function MisPersonajesTab() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [power, setPower] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [uploadingChar, setUploadingChar] = useState<number | null>(null);

  useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    setLoading(true);
    try {
      const authHeader = await authHeaders();
      const headers = new Headers(authHeader);
      const res = await fetch(`${CONTENT_URL}/my-characters`, { headers });
      const json = await res.json();
      setCharacters(json.data || []);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'No se pudieron cargar los personajes';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setName('');
    setAge('');
    setPower('');
    setCategory('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
    setPendingImage(null);
  };

  const handleSave = async () => {
    if (!name.trim() || !category.trim()) {
      Alert.alert('Faltan datos', 'El nombre y la categoría son obligatorios');
      return;
    }

    const data = { name, age, power, category, notes };
    const authHeader = await authHeaders();
    const headers = new Headers(authHeader);
    headers.set('Content-Type', 'application/json');

    try {
      let charId = editingId;

      if (editingId) {
        await fetch(`${CONTENT_URL}/my-characters/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        });
        Alert.alert('Guardado', 'Personaje actualizado');
      } else {
        const res = await fetch(`${CONTENT_URL}/my-characters`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        const json = await res.json();
        charId = json.data?.id;
        Alert.alert('Creado', 'Personaje añadido');
      }

      if (pendingImage && charId) {
        try {
          await uploadCharacterImage(charId, pendingImage);
        } catch {
          Alert.alert('Aviso', 'Personaje guardado pero no se pudo subir la imagen');
        }
      }

      clearForm();
      loadCharacters();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'No se pudo guardar';
      Alert.alert('Error', message);
    }
  };

  const handleEdit = (char: Character) => {
    setName(char.name);
    setAge(char.age);
    setPower(char.power);
    setCategory(char.category);
    setNotes(char.notes);
    setEditingId(char.id);
    setShowForm(true);
  };

  const handleDelete = (id: number, charName: string) => {
    Alert.alert(
      'Eliminar personaje',
      `¿Seguro que quieres eliminar a ${charName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const authHeader = await authHeaders();
            const headers = new Headers(authHeader);
            await fetch(`${CONTENT_URL}/my-characters/${id}`, {
              method: 'DELETE',
              headers,
            });
            loadCharacters();
          },
        },
      ]
    );
  };

  const pickFormImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    const base64 = result.assets[0].base64;
    const mimeType = result.assets[0].mimeType || 'image/jpeg';
    setPendingImage(`data:${mimeType};base64,${base64}`);
  };

  const pickImage = async (characterId: number) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled || !result.assets?.[0]?.base64) return;

    setUploadingChar(characterId);
    try {
      const base64 = result.assets[0].base64;
      const mimeType = result.assets[0].mimeType || 'image/jpeg';
      await uploadCharacterImage(characterId, `data:${mimeType};base64,${base64}`);
      loadCharacters();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al subir imagen';
      Alert.alert('Error', msg);
    } finally {
      setUploadingChar(null);
    }
  };

  const handleDeleteImage = async (characterId: number, imageId: number) => {
    Alert.alert(
      'Eliminar imagen',
      '¿Seguro que quieres eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCharacterImage(characterId, imageId);
              loadCharacters();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar la imagen');
            }
          },
        },
      ]
    );
  };

  // Modal de imágenes
  const [modalImages, setModalImages] = useState<string[]>([]);
  const [modalCharName, setModalCharName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const openImageModal = (images: string[], charName: string) => {
    setModalImages(images);
    setModalCharName(charName);
    setModalVisible(true);
  };

  const renderCharacter = ({ item }: { item: Character }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.charName}>{item.name}</Text>
          <Text style={styles.charCat}>📁 {item.category}</Text>
        </View>
        <View style={styles.cardBtns}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => handleEdit(item)}
          >
            <Text style={styles.editBtnText}>✏️ Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id, item.name)}
          >
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      {!!item.age   && <Text style={styles.detail}>Edad: {item.age}</Text>}
      {!!item.power && <Text style={styles.detail}>Poder: {item.power}</Text>}
      {!!item.notes && <Text style={styles.notes}>{item.notes}</Text>}

      <View style={styles.imageSection}>
        <View style={styles.imageRow}>
          {item.images?.slice(0, 3).map((url, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => openImageModal(item.images || [], item.name)}
            >
              <Image source={{ uri: url }} style={styles.thumb} />
            </TouchableOpacity>
          ))}
          {item.images && item.images.length > 3 && (
            <TouchableOpacity
              style={styles.moreBadge}
              onPress={() => openImageModal(item.images ?? [], item.name)}
            >
              <Text style={styles.moreBadgeText}>+{item.images.length - 3}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.imageActions}>
          <TouchableOpacity
            style={styles.addImgBtn}
            onPress={() => pickImage(item.id)}
            disabled={uploadingChar === item.id}
          >
            {uploadingChar === item.id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.addImgBtnText}>📷 Agregar imagen</Text>
            )}
          </TouchableOpacity>
          {(item.images?.length ?? 0) > 0 && (
            <TouchableOpacity
              style={styles.viewImgBtn}
              onPress={() => openImageModal(item.images || [], item.name)}
            >
              <Text style={styles.viewImgBtnText}>
                🖼️ Ver ({item.images?.length || 0})
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚔️ Mis personajes</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { clearForm(); setShowForm(!showForm); }}
        >
          <Text style={styles.addBtnText}>{showForm ? '✕ Cerrar' : '+ Nuevo'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <ScrollView style={styles.form}>
          <Text style={styles.formTitle}>
            {editingId ? '✏️ Editar personaje' : '➕ Nuevo personaje'}
          </Text>

          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej: Goku"
            placeholderTextColor="#555"
          />

          <Text style={styles.label}>Categoría *</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Ej: Dragon Ball"
            placeholderTextColor="#555"
          />

          <Text style={styles.label}>Edad</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="Ej: 30"
            placeholderTextColor="#555"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Poder / Técnica</Text>
          <TextInput
            style={styles.input}
            value={power}
            onChangeText={setPower}
            placeholder="Ej: Kamehameha"
            placeholderTextColor="#555"
          />

          <Text style={styles.label}>Notas adicionales</Text>
          <TextInput
            style={[styles.input, styles.inputMulti]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Datos relevantes del personaje..."
            placeholderTextColor="#555"
            multiline
            numberOfLines={3}
          />

          {/* ── Imagen ── */}
          <Text style={styles.label}>Imagen</Text>
          <TouchableOpacity style={styles.formImgBtn} onPress={pickFormImage}>
            {pendingImage ? (
              <Image source={{ uri: pendingImage }} style={styles.formImgPreview} />
            ) : (
              <Text style={styles.formImgBtnText}>📷 Seleccionar imagen</Text>
            )}
          </TouchableOpacity>
          {pendingImage && (
            <TouchableOpacity onPress={() => setPendingImage(null)}>
              <Text style={styles.removeImgText}>✕ Quitar imagen</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>
              {editingId ? '💾 Guardar cambios' : '✅ Crear personaje'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={clearForm}>
            <Text style={styles.cancelBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {loading ? (
        <ActivityIndicator color="#ff6b35" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={characters}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCharacter}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Aún no tienes personajes.{'\n'}Presiona "+ Nuevo" para crear uno.
              </Text>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalCharName}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={modalImages}
              numColumns={2}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={styles.modalGrid}
              renderItem={({ item }) => (
                <View style={styles.modalImgWrapper}>
                  <Image source={{ uri: item }} style={styles.modalImg} resizeMode="cover" />
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.modalEmpty}>No hay imágenes disponibles</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMB_SIZE = 60;
const MODAL_IMG_SIZE = (SCREEN_WIDTH - 48) / 2;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  addBtn: {
    backgroundColor: '#ff6b35', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  form: {
    backgroundColor: '#111', margin: 12, borderRadius: 12,
    padding: 18, borderWidth: 1, borderColor: '#1e1e2e',
    maxHeight: 420,
  },
  formTitle: {
    color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 16,
  },
  label: { color: '#888', fontSize: 12, marginBottom: 4, marginTop: 10 },
  input: {
    backgroundColor: '#1a1a2e', color: '#fff', borderRadius: 8,
    padding: 12, borderWidth: 1, borderColor: '#333', fontSize: 14,
  },
  inputMulti: { height: 80, textAlignVertical: 'top' },
  saveBtn: {
    backgroundColor: '#7c3aed', borderRadius: 8,
    padding: 14, alignItems: 'center', marginTop: 16,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  cancelBtn: { padding: 12, alignItems: 'center', marginTop: 6 },
  cancelBtnText: { color: '#555', fontSize: 13 },
  formImgBtn: {
    backgroundColor: '#1a1a2e', borderRadius: 8, marginTop: 4,
    padding: 12, borderWidth: 1, borderColor: '#333',
    borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center',
    height: 100, overflow: 'hidden',
  },
  formImgBtnText: { color: '#666', fontSize: 13 },
  formImgPreview: { width: '100%', height: '100%', borderRadius: 6 },
  removeImgText: { color: '#ef4444', fontSize: 12, textAlign: 'center', marginTop: 4 },

  list: { padding: 12 },
  card: {
    backgroundColor: '#111', borderRadius: 12, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#1e1e2e',
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 8,
  },
  charName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  charCat: { color: '#7c3aed', fontSize: 12, marginTop: 2 },
  cardBtns: { flexDirection: 'row', gap: 8 },
  editBtn: {
    backgroundColor: '#1e2a1e', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#22c55e',
  },
  editBtnText: { color: '#22c55e', fontSize: 12, fontWeight: 'bold' },
  deleteBtn: {
    backgroundColor: '#2a1e1e', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: '#ef4444',
  },
  deleteBtnText: { fontSize: 14 },
  detail: { color: '#888', fontSize: 13, marginBottom: 2 },
  notes: {
    color: '#555', fontSize: 12, marginTop: 6,
    fontStyle: 'italic', borderTopWidth: 1,
    borderTopColor: '#1e1e2e', paddingTop: 6,
  },

  imageSection: { marginTop: 10 },
  imageRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  thumb: {
    width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 8,
    backgroundColor: '#1a1a2e',
  },
  moreBadge: {
    width: THUMB_SIZE, height: THUMB_SIZE, borderRadius: 8,
    backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#333',
  },
  moreBadgeText: { color: '#7c3aed', fontWeight: 'bold', fontSize: 16 },
  imageActions: {
    flexDirection: 'row', gap: 8, marginTop: 8,
  },
  addImgBtn: {
    backgroundColor: '#1e0a3c', borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#7c3aed', minWidth: 120, alignItems: 'center',
  },
  addImgBtnText: { color: '#a78bfa', fontSize: 12, fontWeight: 'bold' },
  viewImgBtn: {
    backgroundColor: '#0f1a2e', borderRadius: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#3b82f6',
  },
  viewImgBtnText: { color: '#60a5fa', fontSize: 12, fontWeight: 'bold' },

  empty: { padding: 60, alignItems: 'center' },
  emptyText: { color: '#333', textAlign: 'center', lineHeight: 26, fontSize: 14 },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#0f0f1a', borderTopLeftRadius: 20,
    borderTopRightRadius: 20, maxHeight: '85%', paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: '#222',
  },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalCloseBtn: {
    backgroundColor: '#222', borderRadius: 20,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { color: '#fff', fontSize: 16 },
  modalGrid: { padding: 8 },
  modalImgWrapper: { margin: 6, borderRadius: 10, overflow: 'hidden' },
  modalImg: { width: MODAL_IMG_SIZE, height: MODAL_IMG_SIZE },
  modalEmpty: { color: '#666', textAlign: 'center', marginTop: 40 },
});
