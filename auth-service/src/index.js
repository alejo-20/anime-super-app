const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// En producción usa una DB real (PostgreSQL). Aquí usamos array para simplicidad
const users = [];

const SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_cambiar';

// REGISTRO
app.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });
  if (users.find(u => u.email === email))
    return res.status(400).json({ error: 'Email ya registrado' });

  const hashed = await bcrypt.hash(password, 10);
  const user = { id: Date.now(), email, name, password: hashed };
  users.push(user);
  res.json({ message: 'Usuario creado', id: user.id });
});

// LOGIN
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// RUTA PROTEGIDA — verificar sesión
app.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No autorizado' });
  try {
    const token = auth.split(' ')[1]; // "Bearer TOKEN"
    const payload = jwt.verify(token, SECRET);
    const user = users.find(u => u.id === payload.id);
    res.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

app.listen(4000, () => console.log('auth-service en puerto 4000'));