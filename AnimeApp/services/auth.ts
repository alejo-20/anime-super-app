import * as SecureStore from 'expo-secure-store';

// Cambia esto cuando despliegues el auth-service en Railway
const AUTH_URL = 'auth-service-production-43a0.up.railway.app';

const TOKEN_KEY = 'anime_jwt_token';
const USER_KEY = 'anime_user';

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
  // Guardar token de forma segura en el teléfono
  await SecureStore.setItemAsync(TOKEN_KEY, json.token);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(json.user));
  return json;
}

export async function logout() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function getCurrentUser() {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

// Para llamadas autenticadas: añade el token en la cabecera
export async function authHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}