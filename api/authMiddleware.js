'use strict';
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
    // Tìm mã Token trong phần Header của request gửi lên từ điện thoại
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ message: 'Không tìm thấy Token bảo mật. Truy cập bị từ chối!' });
    }

    try {
        // Tiến hành giải mã Token bằng mã khóa bí mật trong .env
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Gán ID tài khoản đã xác thực vào request để dùng tiếp ở Controller
        next(); // Token đúng, cho phép đi tiếp vào Controller xử lý dữ liệu
    } catch (err) {
        res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn sử dụng!' });
    }
};