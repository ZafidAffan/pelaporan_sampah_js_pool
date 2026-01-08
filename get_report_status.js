// get_report_status.js
const express = require('express');
const router = express.Router();
const db = require('./db'); // pastikan ini file koneksi database MySQL-mu

// Middleware CORS dan JSON
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // biar bisa diakses dari Flutter / browser
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Content-Type', 'application/json');
  next();
});

// GET /report-status?user_id=123
router.get('/', (req, res) => {
  const user_id = req.query.user_id;

  if (!user_id) {
    return res.status(400).json({ error: 'User ID tidak ditemukan' });
  }

  const sql = `
    SELECT status, COUNT(*) AS jumlah 
    FROM reports 
    WHERE user_id = ? 
    GROUP BY status
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error('SQL Error:', err);
      return res.status(500).json({ error: 'SQL Error: ' + err.message });
    }

    // Default data
    const data = {
      dilaporkan: 0, // pending
      diproses: 0,   // diterima
      selesai: 0
    };

    results.forEach(row => {
      switch (row.status) {
        case 'pending':
          data.dilaporkan = row.jumlah;
          break;
        case 'diterima':
          data.diproses = row.jumlah;
          break;
        case 'proses':
          data.selesai = row.jumlah;
          break;
        default:
          console.warn('Status tidak dikenali:', row.status);
      }
    });

    res.json(data);
  });
});

module.exports = router;
