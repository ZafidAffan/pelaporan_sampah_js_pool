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

// contoh route untuk serve file HTML kalo ga di satuin di folder public
// app.get('/admin-login', (req, res) => {
//  res.sendFile(path.join(__dirname, 'admin_login.html'));
// });

// route untuk menjalankan semua html di folder public
app.use(express.static(path.join(__dirname, 'public')));

// Export app ke Vercel
module.exports = app;
