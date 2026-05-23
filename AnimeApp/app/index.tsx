import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { login, getCurrentUser } from '../services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Si ya hay sesión, ir directo a las tabs
  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) router.replace('/(tabs)/saintseiya');
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Completa los campos'); return; }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/saintseiya');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎌 AnimeApp</Text>
      <Text style={styles.sub}>Inicia sesión para continuar</Text>

      <TextInput
        style={styles.input} placeholder="Email" placeholderTextColor="#555"
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"
      />
      <TextInput
        style={styles.input} placeholder="Contraseña" placeholderTextColor="#555"
        value={password} onChangeText={setPassword} secureTextEntry
      />

      <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Iniciar sesión</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/register')}>
        <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', padding: 32 },
  title: { fontSize: 36, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 8 },
  sub: { color: '#555', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#111', color: '#fff', borderRadius: 10,
    padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#222', fontSize: 15,
  },
  btn: {
    backgroundColor: '#ff6b35', borderRadius: 10, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { color: '#7c3aed', textAlign: 'center', marginTop: 20 },
});