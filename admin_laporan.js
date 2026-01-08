// admin_laporan.js
const express = require("express");
const pool = require("./db_promise_asyncawait");
const fetch = require("node-fetch"); // npm i node-fetch@2
const router = express.Router();

// Middleware cek admin login
function isAdminLoggedIn(req, res, next) {
  if (!req.session || !req.session.admin_id) {
    return res.status(401).json({ error: "Anda harus login sebagai admin" });
  }
  next();
}

// Fungsi reverse geocoding pakai Nominatim OSM
async function getAddressFromLatLng(lat, lng) {
  if (!lat || !lng) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    const response = await fetch(url, { headers: { "User-Agent": "AdminDashboard/1.0" } });
    if (!response.ok) return null;
    const data = await response.json();
    return data.display_name || null;
  } catch (err) {
    console.error("❌ Error reverse geocoding:", err.message);
    return null;
  }
}

// GET /admin/laporan
router.get("/laporan", isAdminLoggedIn, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT report_id, user_id, description, img_url, latitude, longitude, address, status, created_at
      FROM reports
      ORDER BY created_at DESC
    `);

    const formattedRows = [];

    for (const r of rows) {
      let address = r.address;
      
      // Jika alamat kosong, lakukan reverse geocoding
      if (!address && r.latitude && r.longitude) {
        address = await getAddressFromLatLng(r.latitude, r.longitude);
      }

      formattedRows.push({
        report_id: r.report_id,
        user_id: r.user_id,
        description: r.description,
        img_url: r.img_url || null,
        latitude: r.latitude || null,
        longitude: r.longitude || null,
        address: address,
        status: r.status,
        created_at: r.created_at
      });
    }

    res.json(formattedRows);
  } catch (err) {
    console.error("Error ambil laporan:", err.message);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

module.exports = router;
