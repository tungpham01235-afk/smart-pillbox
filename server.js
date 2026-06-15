require('dotenv').config(); // Load cấu hình từ file .env
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;

// Kết nối Cơ sở dữ liệu MongoDB thông qua file cấu hình riêng
const db = require('./api/db');

// Middleware hỗ trợ đọc và bóc tách dữ liệu JSON gửi từ App lên
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));
// Nhúng toàn bộ bản đồ đường dẫn API vào server
let routes = require('./api/routes');
routes(app);

// Xử lý bảo mật: Nếu người dùng/App gọi sai đường dẫn thì báo lỗi 404
app.use(function(req, res) {
    res.status(404).send({ url: req.originalUrl + ' not found' });
});

// Bật máy chủ lắng nghe kết nối
app.listen(port);
console.log('🚀 RESTful API Smart Pillbox Server started on: ' + port);