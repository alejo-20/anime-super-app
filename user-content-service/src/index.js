const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = process.env.JWT_SECRET || 'mi_secreto_super_seguro_cambiar';

// Middleware de autenticación
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autorizado' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// En producción usa PostgreSQL. Aquí usamos array por simplicidad
let characters = [];
let nextId = 1;

// GET — listar todos los personajes del usuario
app.get('/my-characters', auth, (req, res) => {
  const mine = characters.filter(c => c.userId === req.user.id);
  res.json({ data: mine });
});

// POST — crear personaje
app.post('/my-characters', auth, (req, res) => {
  const { name, age, power, category, notes } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Nombre y categoría son requeridos' });
  const char = { id: nextId++, userId: req.user.id, name, age, power, category, notes };
  characters.push(char);
  res.status(201).json({ data: char });
});

// PUT — editar personaje
app.put('/my-characters/:id', auth, (req, res) => {
  const idx = characters.findIndex(c => c.id === +req.params.id && c.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  characters[idx] = { ...characters[idx], ...req.body };
  res.json({ data: characters[idx] });
});

// DELETE — eliminar personaje
app.delete('/my-characters/:id', auth, (req, res) => {
  const before = characters.length;
  characters = characters.filter(c => !(c.id === +req.params.id && c.userId === req.user.id));
  if (characters.length === before) return res.status(404).json({ error: 'No encontrado' });
  res.json({ message: 'Eliminado' });
});

app.listen(5000, () => console.log('user-content-service en puerto 5000'));