const express = require('express');
const router = express.Router();
const db = require('./db');

// Middleware CORS dan JSON
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
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
      return res.status(500).json({ error: 'SQL Error: ' + err.message });
    }

    // Default data
    const data = {
      dilaporkan: 0,
      diproses: 0,
      selesai: 0
    };

    results.forEach(row => {
      if (row.status === 'pending') data.dilaporkan = row.jumlah;
      else if (row.status === 'proses') data.diproses = row.jumlah;
      else if (row.status === 'selesai') data.selesai = row.jumlah;
    });

    res.json(data);
  });
});

module.exports = router;
