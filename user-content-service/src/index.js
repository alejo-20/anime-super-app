const express = require('express');
const cors = require('cors');
const supabase = require('./supabase');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// ── Auth middleware con Supabase ──
async function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });

  if (!supabase) {
    // Fallback: aceptar tokens de memoria
    if (!token.startsWith('fallback_token_')) return res.status(401).json({ error: 'Token inválido' });
    const id = token.split('_')[2];
    req.user = { id };
    return next();
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return res.status(401).json({ error: 'Token inválido' });
    req.user = { id: user.id, email: user.email };
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// ── Fallback en memoria ──
let fallbackCharacters = [];
let fallbackImages = [];
let fallbackNextId = 1;
let fallbackImgNextId = 1;
let useFallback = false;

// ── HELPERS ──

async function getMyCharacters(userId) {
  if (!supabase || useFallback) return fallbackCharacters.filter(c => c.userId === userId);
  try {
    const { data } = await supabase
      .from('user_characters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  } catch {
    useFallback = true;
    return fallbackCharacters.filter(c => c.userId === userId);
  }
}

async function getCharacterById(userId, charId) {
  if (!supabase || useFallback) return fallbackCharacters.find(c => c.id === charId && c.userId === userId) || null;
  try {
    const { data } = await supabase
      .from('user_characters')
      .select('*')
      .eq('id', charId)
      .eq('user_id', userId)
      .single();
    return data || null;
  } catch {
    useFallback = true;
    return fallbackCharacters.find(c => c.id === charId && c.userId === userId) || null;
  }
}

async function createCharacter(userId, fields) {
  if (!supabase || useFallback) {
    const char = { id: fallbackNextId++, userId, ...fields };
    fallbackCharacters.push(char);
    return char;
  }
  try {
    const { data, error } = await supabase
      .from('user_characters')
      .insert({ user_id: userId, ...fields })
      .select()
      .single();
    if (error) throw error;
    return { ...data, userId: data.user_id };
  } catch (err) {
    useFallback = true;
    const char = { id: fallbackNextId++, userId, ...fields };
    fallbackCharacters.push(char);
    return char;
  }
}

async function updateCharacter(userId, charId, fields) {
  if (!supabase || useFallback) {
    const idx = fallbackCharacters.findIndex(c => c.id === charId && c.userId === userId);
    if (idx === -1) return null;
    fallbackCharacters[idx] = { ...fallbackCharacters[idx], ...fields, updated_at: new Date().toISOString() };
    return fallbackCharacters[idx];
  }
  try {
    const { data, error } = await supabase
      .from('user_characters')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', charId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return { ...data, userId: data.user_id };
  } catch {
    useFallback = true;
    const idx = fallbackCharacters.findIndex(c => c.id === charId && c.userId === userId);
    if (idx === -1) return null;
    fallbackCharacters[idx] = { ...fallbackCharacters[idx], ...fields, updated_at: new Date().toISOString() };
    return fallbackCharacters[idx];
  }
}

async function deleteCharacter(userId, charId) {
  if (!supabase || useFallback) {
    const before = fallbackCharacters.length;
    fallbackCharacters = fallbackCharacters.filter(c => !(c.id === charId && c.userId === userId));
    fallbackImages = fallbackImages.filter(i => i.character_id !== charId);
    return fallbackCharacters.length < before;
  }
  try {
    const { error } = await supabase
      .from('user_characters')
      .delete()
      .eq('id', charId)
      .eq('user_id', userId);
    return !error;
  } catch {
    useFallback = true;
    const before = fallbackCharacters.length;
    fallbackCharacters = fallbackCharacters.filter(c => !(c.id === charId && c.userId === userId));
    return fallbackCharacters.length < before;
  }
}

async function getCharacterImages(charId) {
  if (!supabase || useFallback) return fallbackImages.filter(i => i.character_id === charId);
  try {
    const { data } = await supabase
      .from('character_images')
      .select('*')
      .eq('character_id', charId)
      .order('created_at', { ascending: true });
    return data || [];
  } catch {
    useFallback = true;
    return fallbackImages.filter(i => i.character_id === charId);
  }
}

async function addImageToCharacter(charId, imageUrl) {
  if (!supabase || useFallback) {
    const img = { id: fallbackImgNextId++, character_id: charId, image_url: imageUrl, created_at: new Date().toISOString() };
    fallbackImages.push(img);
    return img;
  }
  try {
    const { data, error } = await supabase
      .from('character_images')
      .insert({ character_id: charId, image_url: imageUrl })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    useFallback = true;
    const img = { id: fallbackImgNextId++, character_id: charId, image_url: imageUrl, created_at: new Date().toISOString() };
    fallbackImages.push(img);
    return img;
  }
}

async function removeImage(imageId) {
  if (!supabase || useFallback) {
    const before = fallbackImages.length;
    fallbackImages = fallbackImages.filter(i => i.id !== imageId);
    return fallbackImages.length < before;
  }
  try {
    const { error } = await supabase
      .from('character_images')
      .delete()
      .eq('id', imageId);
    return !error;
  } catch {
    useFallback = true;
    const before = fallbackImages.length;
    fallbackImages = fallbackImages.filter(i => i.id !== imageId);
    return fallbackImages.length < before;
  }
}

async function uploadToSupabase(base64Data, filename) {
  if (!supabase) return null;
  const base64 = base64Data.includes('base64,') ? base64Data.split('base64,')[1] : base64Data;
  const buffer = Buffer.from(base64, 'base64');
  const filePath = `characters/${filename}`;

  const { error } = await supabase.storage
    .from('character-images')
    .upload(filePath, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    console.error('Error subiendo a Supabase Storage:', error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('character-images')
    .getPublicUrl(filePath);

  return urlData?.publicUrl || null;
}

// ── RUTAS ──

app.get('/my-characters', auth, async (req, res) => {
  try {
    const chars = await getMyCharacters(req.user.id);
    const charsWithImages = await Promise.all(chars.map(async (c) => {
      const images = await getCharacterImages(c.id);
      return { ...c, images: images.map(i => i.image_url), images_count: images.length };
    }));
    res.json({ data: charsWithImages });
  } catch {
    res.status(500).json({ error: 'Error al cargar personajes' });
  }
});

app.post('/my-characters', auth, async (req, res) => {
  const { name, age, power, category, notes } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Nombre y categoría son requeridos' });
  try {
    const char = await createCharacter(req.user.id, { name, age, power, category, notes });
    res.status(201).json({ data: char });
  } catch {
    res.status(500).json({ error: 'Error al crear personaje' });
  }
});

app.put('/my-characters/:id', auth, async (req, res) => {
  const { name, age, power, category, notes } = req.body;
  try {
    const updated = await updateCharacter(req.user.id, +req.params.id, { name, age, power, category, notes });
    if (!updated) return res.status(404).json({ error: 'No encontrado' });
    res.json({ data: updated });
  } catch {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

app.delete('/my-characters/:id', auth, async (req, res) => {
  try {
    const ok = await deleteCharacter(req.user.id, +req.params.id);
    if (!ok) return res.status(404).json({ error: 'No encontrado' });
    res.json({ message: 'Eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

app.get('/my-characters/:id/images', auth, async (req, res) => {
  try {
    const char = await getCharacterById(req.user.id, +req.params.id);
    if (!char) return res.status(404).json({ error: 'Personaje no encontrado' });
    const images = await getCharacterImages(+req.params.id);
    res.json({ data: images });
  } catch {
    res.status(500).json({ error: 'Error al cargar imágenes' });
  }
});

app.post('/my-characters/:id/images', auth, async (req, res) => {
  const { image_base64 } = req.body;
  if (!image_base64) return res.status(400).json({ error: 'image_base64 es requerido' });

  try {
    const char = await getCharacterById(req.user.id, +req.params.id);
    if (!char) return res.status(404).json({ error: 'Personaje no encontrado' });

    const filename = `user_${req.user.id}_char_${req.params.id}_${Date.now()}.jpg`;
    let imageUrl = null;

    if (supabase) {
      imageUrl = await uploadToSupabase(image_base64, filename);
    }

    if (!imageUrl) {
      imageUrl = image_base64;
    }

    const img = await addImageToCharacter(+req.params.id, imageUrl);
    res.status(201).json({ data: img });
  } catch {
    res.status(500).json({ error: 'Error al subir imagen' });
  }
});

app.delete('/my-characters/:characterId/images/:imageId', auth, async (req, res) => {
  try {
    const char = await getCharacterById(req.user.id, +req.params.characterId);
    if (!char) return res.status(404).json({ error: 'Personaje no encontrado' });
    const ok = await removeImage(+req.params.imageId);
    if (!ok) return res.status(404).json({ error: 'Imagen no encontrada' });
    res.json({ message: 'Imagen eliminada' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`user-content-service en puerto ${PORT}`));
