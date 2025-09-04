// admin_laporan.js
const express = require("express");
const pool = require("./db"); // koneksi MySQL
const router = express.Router();

// halaman daftar laporan
router.get("/", async (req, res) => {
  try {
    // ambil semua laporan
    const [rows] = await pool.query("SELECT * FROM reports ORDER BY report_id DESC");

    // ambil data admin dari session (simulasi)
    const adminName = req.session?.admin_name || "Admin";

    res.render("admin_laporan", {
      currentPage: "admin_laporan",
      adminName,
      reports: rows
    });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).send("Terjadi kesalahan koneksi database.");
  }
});

module.exports = router;
