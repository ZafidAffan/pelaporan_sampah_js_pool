const express = require('express');
const cors = require('cors'); // ✅ import cors
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// === Middleware ===
app.use(express.json());
app.use(cors()); // ✅ Aktifkan CORS untuk semua origin
app.use('/upload', express.static('upload'));

// === ROUTES UMUM ===
app.use('/login', require('./login'));
app.use('/register', require('./register'));
app.use('/report', require('./report'));
app.use('/locations', require('./get_locations'));
app.use('/report-status', require('./get_report_status'));
app.use('/user', require('./get_user'));
app.use('/user-report', require('./get_user_report'));

// === ROUTES PETUGAS ===
app.use('/login_petugas', require('./login_petugas')); // catatan: sengaja berbeda dengan /login
app.use('/register-petugas', require('./register_petugas'));
app.use('/get-tugas', require('./get_tugas'));

// === ROUTES ADMIN ===
app.use('/admin', require('./admin_login'));
app.use('/admin', require('./admin_register'));
app.use('/admin', require('./admin_dashboard'));
app.use('/admin', require('./admin_laporan'));

// === ROUTES ADMIN TAMBAHAN (STATUS & TUGAS) ===
app.use('/admin', require('./update_status'));   // menerima/menolak laporan
app.use('/admin', require('./assign_task'));     // assign tugas ke petugas
app.use('/admin', require('./confirm_done'));    // konfirmasi selesai
app.use('/admin', require('./get_petugas'));     // ambil daftar petugas untuk popup

// === SERVE FILE HTML / PUBLIC ===
// contoh route untuk serve file HTML kalo ga di satuin di folder public
// app.get('/admin-login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'admin_login.html'));
// });

// serve semua file di folder public
app.use(express.static(path.join(__dirname, 'public')));

// === START SERVER (lokal/testing) ===
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));
}

// Export app ke Vercel
module.exports = app;
