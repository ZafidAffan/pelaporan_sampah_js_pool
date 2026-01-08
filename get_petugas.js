// routes/get_petugas.js
const express = require("express");
const pool = require("./db_promise_asyncawait");
const router = express.Router();

/*
👤 GET PETUGAS BY ID
Endpoint:
GET /get_petugas?petugas_id=1
*/
router.get("/", async (req, res) => {
  const { petugas_id } = req.query;

  // Validasi
  if (!petugas_id) {
    return res.status(400).json({
      error: "petugas_id wajib dikirim",
    });
  }

  try {
    console.log("📡 [SERVER] Ambil data petugas:", petugas_id);

    const [rows] = await pool.query(
      `
      SELECT 
        petugas_id,
        name,
        email,
        phone
      FROM petugas
      WHERE petugas_id = ?
      `,
      [petugas_id]
    );

    // Jika tidak ditemukan
    if (rows.length === 0) {
      return res.status(404).json({
        error: "Petugas tidak ditemukan",
      });
    }

    // Kirim 1 object (bukan array)
    res.json(rows[0]);
  } catch (err) {
    console.error("❌ [SERVER] Gagal ambil petugas:", err);
    res.status(500).json({
      error: "Gagal mengambil data petugas",
      detail: err.message,
    });
  }
});

module.exports = router;
