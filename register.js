const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('./db'); // koneksi ke MySQL

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
  const { email, password, displayName, phone } = req.body;

  // Validasi input
  const required = ['email', 'password', 'displayName'];
  for (let field of required) {
    if (!req.body[field] || req.body[field].trim() === '') {
      return res.status(400).json({ error: `Kolom ${field} wajib diisi` });
    }
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO user (email, password, name, phone) VALUES (?, ?, ?, ?)";
    db.query(sql, [email, hashedPassword, displayName, phone || null], (err, result) => {
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
