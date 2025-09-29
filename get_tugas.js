const express = require('express');
const pool = require('./db_promise_asyncawait');
const router = express.Router();

router.get("/", async (req, res) => {
  const { petugas_id } = req.query;
  if (!petugas_id) return res.status(400).json({ error: "petugas_id wajib" });

  try {
    const [rows] = await pool.query(
      `SELECT tugas_id, report_id, petugas_id, status, assigned_at, 
              completed_at, status_final, verified_by, verified_at
       FROM tugas
       WHERE petugas_id = ? 
       ORDER BY assigned_at DESC`,
      [petugas_id]
    );

    res.json({ tugas: rows }); // ✅ sesuai ekspektasi frontend
  } catch (err) {
    console.error("Error get tugas:", err);
    res.status(500).json({ error: "Gagal mengambil tugas" });
  }
});

module.exports = router;
