import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '../services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name);
      Alert.alert('✅ Cuenta creada', 'Ya puedes iniciar sesión');
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎌 Crear cuenta</Text>
      <Text style={styles.sub}>Regístrate para continuar</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#555"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#555"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#555"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Crear cuenta</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/')}>
        <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#0a0a0f',
    justifyContent: 'center', padding: 32,
  },
  title: {
    fontSize: 32, fontWeight: 'bold', color: '#fff',
    textAlign: 'center', marginBottom: 8,
  },
  sub: { color: '#555', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#111', color: '#fff', borderRadius: 10,
    padding: 14, marginBottom: 12, borderWidth: 1,
    borderColor: '#222', fontSize: 15,
  },
  btn: {
    backgroundColor: '#7c3aed', borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#ff6b35', textAlign: 'center', marginTop: 20 },
});