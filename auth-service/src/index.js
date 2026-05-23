const express = require('express');
const cors = require('cors');
const { supabaseAdmin, supabaseAnon } = require('./supabase');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Fallback en memoria si no hay Supabase
let fallbackUsers = [];
let nextFallbackId = 1;
let useFallback = false;

async function findUserByEmail(email) {
  if (!supabaseAdmin || useFallback) return fallbackUsers.find(u => u.email === email) || null;
  try {
    const { data } = await supabaseAdmin.from('users').select('*').eq('email', email).single();
    return data || null;
  } catch {
    useFallback = true;
    return fallbackUsers.find(u => u.email === email) || null;
  }
}

async function findUserById(id) {
  if (!supabaseAdmin || useFallback) return fallbackUsers.find(u => u.id === id) || null;
  try {
    const { data } = await supabaseAdmin.from('users').select('*').eq('id', id).single();
    return data || null;
  } catch {
    useFallback = true;
    return fallbackUsers.find(u => u.id === id) || null;
  }
}

app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

  try {
    if (supabaseAdmin) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: name || '' },
      });
      if (authError) return res.status(400).json({ error: authError.message });

      const user = authData.user;
      return res.json({ message: 'Usuario creado', id: user.id });
    }

    // Fallback en memoria
    if (fallbackUsers.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }
    const user = { id: String(nextFallbackId++), email, name: name || '' };
    fallbackUsers.push(user);
    res.json({ message: 'Usuario creado', id: user.id });
  } catch (e) {
    res.status(500).json({ error: 'Error al registrar' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

  try {
    if (supabaseAnon) {
      const { data, error } = await supabaseAnon.auth.signInWithPassword({ email, password });
      if (error) return res.status(401).json({ error: 'Credenciales incorrectas' });

      const user = await findUserById(data.user.id);
      res.json({
        token: data.session.access_token,
        user: { id: data.user.id, email: data.user.email, name: user?.name || '' },
      });
      return;
    }

    // Fallback en memoria
    const user = fallbackUsers.find(u => u.email === email);
    if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = `fallback_token_${user.id}_${Date.now()}`;
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No autorizado' });

  const token = auth.split(' ')[1];

  try {
    if (supabaseAdmin) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) return res.status(401).json({ error: 'Token inválido' });

      const profile = await findUserById(user.id);
      res.json({ user: { id: user.id, email: user.email, name: profile?.name || '' } });
      return;
    }

    // Fallback en memoria
    if (token.startsWith('fallback_token_')) {
      const id = token.split('_')[2];
      const user = fallbackUsers.find(u => u.id === id);
      if (!user) return res.status(401).json({ error: 'Token inválido' });
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
      return;
    }
    res.status(401).json({ error: 'Token inválido' });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`auth-service en puerto ${PORT}`));
