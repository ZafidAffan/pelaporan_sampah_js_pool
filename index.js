const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const path = require('path');

app.use(express.json());
app.use('/upload', express.static('upload'));

app.use('/login', require('./login'));
app.use('/register', require('./register'));
app.use('/report', require('./report'));
app.use('/locations', require('./get_locations'));
app.use('/report-status', require('./get_report_status'));
app.use('/user', require('./get_user'));
app.use('/user-report', require('./get_user_report'));

app.use('/admin', require('./admin_login'));
app.use('/admin', require('./admin_register'));
app.use('/admin', require('./admin_dashboard'));  
app.use('/admin', require('./admin_laporan'));

// === ROUTES ADMIN TAMBAHAN (STATUS & TUGAS) ===
app.use('/admin', require('./update_status'));   // menerima/menolak laporan
app.use('/admin', require('./assign_task'));     // assign tugas ke petugas
app.use('/admin', require('./confirm_done'));    // konfirmasi selesai
app.use('/admin', require('./get_petugas'));     // ambil daftar petugas untuk popup

// === ROUTES PETUGAS ===

app.use('/login-petugas', require('./login_petugas'));
app.use('/register-petugas', require('./register_petugas'));
app.use('/get-petugas', require('./get_petugas'));


// contoh route untuk serve file HTML kalo ga di satuin di folder public
// app.get('/admin-login', (req, res) => {
//  res.sendFile(path.join(__dirname, 'admin_login.html'));
// });



// route untuk menjalankan semua html di folder public
app.use(express.static(path.join(__dirname, 'public')));

// Export app ke Vercel
module.exports = app;
