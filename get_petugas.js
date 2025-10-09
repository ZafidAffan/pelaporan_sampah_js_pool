// routes/get_petugas.js
const express = require("express");
const pool = require("./db_promise_asyncawait");
const router = express.Router();

router.get("/get-petugas", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT petugas_id, nama, no_hp FROM petugas");
    res.json(rows);
  } catch (err) {
    console.error("❌ Gagal ambil petugas:", err);
    res.status(500).json({ error: "Gagal ambil daftar petugas" });
  }
});

module.exports = router;
