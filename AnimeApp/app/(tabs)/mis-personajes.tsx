import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { authHeaders } from '../../services/auth';

// Cambia esto por tu IP local cuando pruebes con Docker
// o por la URL de Railway cuando despliegues
const CONTENT_URL = 'http://192.168.1.100:5000';

type Character = {
  id: number;
  name: string;
  age: string;
  power: string;
  category: string;
  notes: string;
};

export default function MisPersonajesTab() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);

  // Campos del formulario
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [power, setPower] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  // Para saber si estamos editando o creando
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  // ── Cargar personajes al abrir la pantalla ──────────────
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

  // ── Limpiar el formulario ───────────────────────────────
  const clearForm = () => {
    setName('');
    setAge('');
    setPower('');
    setCategory('');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  // ── Crear o Editar personaje ────────────────────────────
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
      if (editingId) {
        // EDITAR — PUT
        await fetch(`${CONTENT_URL}/my-characters/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(data),
        });
        Alert.alert('✅ Guardado', 'Personaje actualizado');
      } else {
        // CREAR — POST
        await fetch(`${CONTENT_URL}/my-characters`, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
        });
        Alert.alert('✅ Creado', 'Personaje añadido');
      }
      clearForm();
      loadCharacters(); // recargar la lista
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'No se pudo guardar';
      Alert.alert('Error', message);
    }
  };

  // ── Rellenar formulario para editar ────────────────────
  const handleEdit = (char: Character) => {
    setName(char.name);
    setAge(char.age);
    setPower(char.power);
    setCategory(char.category);
    setNotes(char.notes);
    setEditingId(char.id);
    setShowForm(true);
  };

  // ── Eliminar personaje ──────────────────────────────────
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

  // ── Renderizar cada personaje de la lista ───────────────
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
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ── Encabezado ── */}
      <View style={styles.header}>
        <Text style={styles.title}>⚔️ Mis personajes</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { clearForm(); setShowForm(!showForm); }}
        >
          <Text style={styles.addBtnText}>{showForm ? '✕ Cerrar' : '+ Nuevo'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── Formulario (se muestra/oculta) ── */}
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

      {/* ── Lista de personajes ── */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },

  // Encabezado
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

  // Formulario
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

  // Lista
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

  // Vacío
  empty: { padding: 60, alignItems: 'center' },
  emptyText: { color: '#333', textAlign: 'center', lineHeight: 26, fontSize: 14 },
});