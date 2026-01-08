const express = require("express");
const pool = require("./db_promise_asyncawait");

const router = express.Router();

// =======================
// CORS
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

    res.json(rows); // <-- mengembalikan array semua petugas
  } catch (err) {
    console.error("❌ Error get_petugas:", err);
    res.status(500).json({
      message: "Gagal mengambil data petugas",
    });
  }
});

module.exports = router;
