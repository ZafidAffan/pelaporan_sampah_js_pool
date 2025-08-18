const express = require('express');
const multer = require('multer');
const db = require('./db');
const axios = require('axios');

const router = express.Router();

// Gunakan memoryStorage karena kita hanya kirim buffer ke ImgBB
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware CORS sederhana
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'POST');
  next();
});

// POST /report
router.post('/', upload.single('image'), async (req, res) => {
  const file = req.file;
  const { user_id, description, latitude, longitude, address } = req.body;

  if (!file) {
    return res.status(400).json({ error: 'Gambar tidak ditemukan atau gagal diunggah' });
  }

  if (!user_id || !description || !latitude || !longitude || !address) {
    return res.status(400).json({ error: 'Data tidak lengkap' });
  }

  try {
    // Convert buffer ke base64
    const base64Image = file.buffer.toString('base64');

    // Upload ke ImgBB
    const imgbbApiKey = process.env.IMGBB_API_KEY; // simpan di .env
    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      image: base64Image
    });

    const imageUrl = response.data.data.url;

    // Simpan ke database
    const status = 'pending';
    const created_at = new Date();

    const sql = `INSERT INTO reports 
      (user_id, description, img_url, latitude, longitude, address, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [user_id, description, imageUrl, latitude, longitude, address, status, created_at], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Gagal menyimpan laporan: ' + err.message });
      }

      res.json({ success: true, message: 'Laporan berhasil dikirim', img_url: imageUrl });
    });

  } catch (err) {
    return res.status(500).json({ error: 'Gagal mengunggah ke ImgBB: ' + err.message });
  }
});

module.exports = router;

