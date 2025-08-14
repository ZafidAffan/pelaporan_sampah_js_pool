const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('./db'); // koneksi ke MySQL pool

// Middleware CORS (optional jika sudah global di app)
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// POST /register
router.post('/', async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validasi input
  const required = ['name', 'email', 'password'];
  for (let field of required) {
    if (!req.body[field] || req.body[field].trim() === '') {
      return res.status(400).json({ error: `Kolom ${field} wajib diisi` });
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO user (name, email, phone, password) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, phone || null, hashedPassword], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Gagal menyimpan data: ' + err.message });
      }

      res.json({
        message: 'Registrasi berhasil',
        userId: result.insertId
      });
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal hash password' });
  }
});

module.exports = router;
