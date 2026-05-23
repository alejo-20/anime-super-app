// URL de tu API en Railway (ya está desplegada)
const BASE_URL = 'anime-api-production-57cf.up.railway.app';

export type Character = {
  id: number;
  name: string;
  age: string;
  power: string;
  images?: string[];
  images_count?: number;
};

// Obtener todos los personajes de una categoría (sin imágenes)
export async function getCharacters(category: string): Promise<Character[]> {
  const res = await fetch(`${BASE_URL}/${category}`);
  if (!res.ok) throw new Error('Error al cargar personajes');
  const json = await res.json();
  return json.data;
}

// Buscar un personaje por nombre exacto (con 4 imágenes reales)
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

// Búsqueda parcial por nombre
export async function searchCharacter(
  category: string,
  query: string
): Promise<Character[]> {
  const res = await fetch(`${BASE_URL}/${category}/search?q=${query}`);
  if (!res.ok) throw new Error('Error en la búsqueda');
  const json = await res.json();
  return json.data;
}