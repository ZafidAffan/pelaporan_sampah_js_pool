// report.js
const express = require('express');
const mysql = require('mysql2/promise');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');

const router = express.Router();

// setup multer (simpan file di memori sementara)
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { user_id, description, latitude, longitude, address } = req.body;

    // cek field
    if (!user_id || !description || !latitude || !longitude || !address || !req.file) {
      return res.status(400).json({ error: "Semua field wajib diisi" });
    }

    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      return res.status(500).json({ error: "IMGBB_API_KEY tidak ditemukan di environment" });
    }

    // convert file buffer ke base64
    const imageBase64 = req.file.buffer.toString("base64");

    // upload ke ImgBB
    const uploadResponse = await axios.post(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      new URLSearchParams({ image: imageBase64 }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!uploadResponse.data.success) {
      return res.status(400).json({ error: "Gagal upload gambar ke ImgBB" });
    }

    const imageUrl = uploadResponse.data.data.url;

    // koneksi ke database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    });

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
