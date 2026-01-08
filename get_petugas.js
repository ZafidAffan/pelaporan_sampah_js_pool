const express = require("express");
const pool = require("./db_promise_asyncawait");

const router = express.Router();

// =======================
// CORS (aman untuk Vercel)
// =======================
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// =====================================
// GET /admin/get-petugas?petugas_id=1
// =====================================
router.get("/get-petugas", async (req, res) => {
  try {
    const { petugas_id } = req.query;

    if (!petugas_id) {
      return res.status(400).json({
        message: "petugas_id wajib dikirim",
      });
    }

    const [rows] = await pool.query(
      `SELECT petugas_id, name, email, phone
       FROM petugas
       WHERE petugas_id = ?`,
      [petugas_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Petugas tidak ditemukan",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("❌ Error get_petugas:", err);
    res.status(500).json({
      message: "Gagal mengambil data petugas",
    });
  }
});

module.exports = router;
