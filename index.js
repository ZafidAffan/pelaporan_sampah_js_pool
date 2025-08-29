const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

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

// Export app ke Vercel
module.exports = app;
