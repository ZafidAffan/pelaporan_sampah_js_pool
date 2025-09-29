const express = require('express');
const pool = require('./db_promise_asyncawait');
const router = express.Router();

// ✅ Middleware CORS manual (biar sama kayak login.js masyarakat)
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // izinkan semua origin
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200); // preflight request
  next();
});

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

    res.json({ tugas: rows }); // ✅ hasil sesuai ekspektasi frontend
  } catch (err) {
    console.error("Error get tugas:", err);
    res.status(500).json({ error: "Gagal mengambil tugas" });
  }
});

module.exports = router;
