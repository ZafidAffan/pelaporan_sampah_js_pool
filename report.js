// report.js
const express = require('express');
const mysql = require('mysql2/promise');
const axios = require('axios');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { user_id, description, latitude, longitude, address, image } = req.body;

    // Cek semua field wajib
    if (!user_id || !description || !latitude || !longitude || !address || !image) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    // Ambil API key ImgBB
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      return res.status(500).json({ error: "IMGBB_API_KEY tidak ditemukan di environment" });
    }

    // Upload gambar ke ImgBB
    const uploadResponse = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      new URLSearchParams({ image }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!uploadResponse.data.success) {
      return res.status(400).json({ error: "Gagal upload gambar ke ImgBB" });
    }

    const imageUrl = uploadResponse.data.data.url;

    // Koneksi ke database Railway
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306, // Railway biasanya kasih port custom
    });

    // Insert ke tabel reports (pakai img_url sesuai DB kamu)
    const [result] = await connection.execute(
      `INSERT INTO reports (user_id, description, latitude, longitude, address, img_url, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
      [user_id, description, latitude, longitude, address, imageUrl]
    );

    await connection.end();

    return res.status(200).json({
      success: true,
      message: "Laporan berhasil dikirim",
      report_id: result.insertId,
      image_url: imageUrl,
    });
  } catch (error) {
    console.error("Error di report.js:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Terjadi kesalahan server",
      detail: error.response?.data || error.message,
    });
  }
});

module.exports = router;
