const express = require("express");
const pool = require("./db_promise_asyncawait");
const router = express.Router();

// Middleware cek login admin
function isAdminLoggedIn(req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.status(401).json({ error: "Anda harus login sebagai admin" });
  }
  next();
}

// GET /admin/laporan
router.get("/laporan", isAdminLoggedIn, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT report_id, user_id, description, img_url, latitude, longitude, address, status, created_at
      FROM reports
      ORDER BY created_at DESC
    `);

    // fallback address
    const formattedRows = rows.map(r => ({
      ...r,
      address: r.address || `Lat: ${r.latitude}, Lng: ${r.longitude}`
    }));

    res.json(formattedRows);
  } catch (err) {
    console.error("Error ambil laporan:", err.message);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

module.exports = router;
