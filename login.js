const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('./db'); // pool dari db.js

// CORS middleware
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// POST /login
router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Kolom email dan password wajib diisi' });
  }

  const sql = "SELECT user_id, password, name FROM user WHERE email = ?";
  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'SQL Error: ' + err.message });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Email tidak ditemukan' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, match) => {
      if (err) return res.status(500).json({ error: 'Error bcrypt: ' + err.message });

      if (!match) {
        return res.status(401).json({ error: 'Password salah' });
      }

      res.json({
        message: 'Login berhasil',
        userId: user.user_id,
        displayName: user.name
      });
    });
  });
});

module.exports = router;
