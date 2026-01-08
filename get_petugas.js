// get_petugas.js
const express = require("express");
const pool = require("./db_promise_asyncawait");

const router = express.Router();

// =======================
// CORS (aman untuk Vercel)
// =======================
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// =====================================
// GET /admin/get-petugas
// Ambil semua petugas
// =====================================
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT petugas_id, name, email, phone
       FROM petugas
       ORDER BY name ASC`
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "Belum ada data petugas" });
    }

    res.json(rows); // Kembalikan array semua petugas
  } catch (err) {
    console.error("❌ Error get_petugas:", err);
    res.status(500).json({ message: "Gagal mengambil data petugas", error: err.message });
  }
});

module.exports = router;
