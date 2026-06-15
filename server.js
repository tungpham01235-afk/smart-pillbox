require('dotenv').config(); // Load cấu hình từ file .env

// =========================================================================
// 🛠️ BẢN VÁ CƯỠNG CHẾ MẠNG IPV4 TOÀN CỤC - ĐÁNH BAY LỖI ENETUNREACH TRÊN RENDER
const dns = require('dns');
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
} else {
    // Giải pháp dự phòng bọc hàm lookup nếu Node.js trên Render là phiên bản cũ
    const { lookup } = dns;
    dns.lookup = (hostname, options, callback) => {
        if (typeof options === 'function') {
            callback = options;
            options = {};
        } else if (typeof options === 'number') {
            options = { family: options };
        }
        options = options || {};
        options.family = 4; // Cưỡng chế socket hệ thống chỉ sử dụng IPv4
        return lookup(hostname, options, callback);
    };
}
// =========================================================================

const express = require('express');
const cors = require('cors'); // 1. Khai báo thư viện CORS để sửa lỗi chặn trình duyệt
const app = express();

const port = process.env.PORT || 3000;

// Kết nối Cơ sở dữ liệu MongoDB thông qua file cấu hình riêng
const db = require('./api/db');

// 2. Kích hoạt Middleware CORS (Bắt buộc phải đặt TRƯỚC khi định nghĩa routes)
app.use(cors()); 

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
app.listen(port, () => {
    console.log('🚀 RESTful API Smart Pillbox Server started on port: ' + port);
});