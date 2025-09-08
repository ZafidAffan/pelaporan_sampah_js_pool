// routes/get_tugas.js
const express = require("express");
const pool = require("./db_promise_asyncawait"); // koneksi MySQL async/await
const router = express.Router();

// GET daftar tugas berdasarkan petugas_id
// Endpoint: GET /tasks?petugas_id=<id>
router.get("/tasks", async (req, res) => {
  try {
    const { petugas_id } = req.query;

    if (!petugas_id) {
      return res.status(400).json({ error: "petugas_id wajib disertakan" });
    }

    const [rows] = await pool.query(
      `SELECT tugas_id, report_id, description, status, assigned_at 
       FROM tugas 
       WHERE petugas_id = ?`,
      [petugas_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("❌ Error get tugas:", err);
    res.status(500).json({
      error: "Gagal mengambil daftar tugas",
      detail: err.message,
    });
  }
});

module.exports = router;
