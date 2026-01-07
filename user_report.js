const express = require("express");
const db = require("./db");
const router = express.Router();

// === CORS Middleware ===
router.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// GET laporan user by user_id
router.get("/", (req, res) => {
  const userId = req.query.user_id;
  if (!userId) return res.status(400).json({ error: "user_id wajib" });

  const sql = `
    SELECT report_id, description, address, status, img_url, created_at 
    FROM reports 
    WHERE user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ DB Error:", err);
      return res.status(500).json({ error: "Gagal mengambil data", detail: err.message });
    }

    const reports = results.map(row => ({
      report_id: row.report_id,
      description: row.description,
      address: row.address,
      status: row.status,
      image_path: row.img_url,
      created_at: row.created_at
    }));

    res.json(reports);
  });
});

module.exports = router;
