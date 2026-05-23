import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_URL = 'https://auth-service-production-43a0.up.railway.app';
const TOKEN_KEY = 'anime_jwt_token';
const USER_KEY = 'anime_user';

async function saveItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function removeItem(key: string) {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}

export async function register(email: string, password: string, name: string) {
  const res = await fetch(`${AUTH_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al registrarse');
  return json;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${AUTH_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Error al iniciar sesión');
  await saveItem(TOKEN_KEY, json.token);
  await saveItem(USER_KEY, JSON.stringify(json.user));
  return json;
}

export async function logout() {
  try {
    await removeItem(TOKEN_KEY);
    await removeItem(USER_KEY);
  } catch (e) {
    if (Platform.OS === 'web') {
      localStorage.clear();
    }
  }
}

export async function getToken(): Promise<string | null> {
  return getItem(TOKEN_KEY);
}

export async function getCurrentUser() {
  const raw = await getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function authHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}