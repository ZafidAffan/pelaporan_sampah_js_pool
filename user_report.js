// user_report.js
const express = require('express');
const db = require('./db'); // pastikan db.js sudah ada
const router = express.Router();

// GET /user-report?user_id=1
router.get('/', (req, res) => {
  const userId = req.query.user_id;

  if (!userId) {
    return res.status(400).json({ error: 'user_id wajib dikirim' });
  }

  // Query database langsung di sini
  const sql = `
    SELECT report_id, description, address, status, img_url, created_at 
    FROM reports 
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('DB Error:', err);
      return res.status(500).json({ error: 'Gagal mengambil laporan', detail: err.message });
    }

    const reports = results.map(row => ({
      report_id: row.report_id,
      description: row.description,
      address: row.address,
      status: row.status,
      image_path: row.img_url, // untuk Flutter
      created_at: row.created_at
    }));

    res.json({ success: true, reports });
  });
});

module.exports = router;
