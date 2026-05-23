import { authHeaders } from './auth';

// ── Anime API (personajes precargados) ──
const BASE_URL = 'http://localhost:3000';

export type Character = {
  id: number;
  name: string;
  age: string;
  power: string;
  images?: string[];
  images_count?: number;
};

export async function getCharacters(category: string): Promise<Character[]> {
  const res = await fetch(`${BASE_URL}/${category}`);
  if (!res.ok) throw new Error('Error al cargar personajes');
  const json = await res.json();
  return json.data;
}

export async function getCharacterWithImages(
  category: string,
  name: string
): Promise<Character> {
  const res = await fetch(`${BASE_URL}/${category}/${encodeURIComponent(name)}`);
  if (!res.ok) {
    if (res.status === 404) throw new Error('Personaje no encontrado');
    throw new Error('Error de conexión con la API');
  }
  const json = await res.json();
  return json.data;
}

export async function searchCharacter(
  category: string,
  query: string
): Promise<Character[]> {
  const res = await fetch(`${BASE_URL}/${category}/search?q=${query}`);
  if (!res.ok) throw new Error('Error en la búsqueda');
  const json = await res.json();
  return json.data;
}

// ── User-Content Service (personajes del usuario + imágenes) ──
const CONTENT_URL = __DEV__
  ? 'http://localhost:5000'
  : 'https://user-content-service-production.up.railway.app';

export async function uploadCharacterImage(
  characterId: number,
  imageBase64: string
): Promise<{ id: number; image_url: string }> {
  const authHeader = await authHeaders();
  const headers = new Headers(authHeader);
  headers.set('Content-Type', 'application/json');
  const res = await fetch(`${CONTENT_URL}/my-characters/${characterId}/images`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ image_base64: imageBase64 }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Error al subir imagen' }));
    throw new Error(err.error);
  }
  const json = await res.json();
  return json.data;
}

export async function deleteCharacterImage(
  characterId: number,
  imageId: number
): Promise<void> {
  const authHeader = await authHeaders();
  const headers = new Headers(authHeader);
  const res = await fetch(`${CONTENT_URL}/my-characters/${characterId}/images/${imageId}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Error al eliminar imagen');
}
