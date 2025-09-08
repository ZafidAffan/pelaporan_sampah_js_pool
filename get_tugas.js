const express = require('express');
const pool = require('./db_promise_asyncawait');
const router = express.Router();

router.get("/", async (req, res) => {
  const { petugas_id } = req.query;
  if (!petugas_id) return res.status(400).json({ error: "petugas_id wajib" });

  try {
    const [rows] = await pool.query(
      "SELECT * FROM tugas WHERE petugas_id = ?",
      [petugas_id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil tugas" });
  }
});

module.exports = router;
