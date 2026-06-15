const nodemailer = require('nodemailer');

// Cấu hình Nodemailer sử dụng tên miền chuẩn của Gmail (Sẽ được xử lý IPv4 qua bản vá tại server.js)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Tên miền gốc chuẩn của Google
    port: 465,              // Cổng bảo mật mã hóa SSL/TLS
    secure: true,           // Luôn luôn là true đối với cổng 465
    auth: {
        user: 'tungpham01235@gmail.com', // Email hệ thống của bạn
        pass: 'alxu pxyc ptjd tded'       // Mật khẩu ứng dụng 16 ký tự
    }
});

module.exports = {
    // Hàm gửi Email dạng Promise chuẩn phục vụ cho các tác vụ chạy ngầm bên AuthController
    sendMail: (to, subject, text) => {
        return new Promise((resolve, reject) => {
            transporter.sendMail({
                from: '"Smart Pillbox" <tungpham01235@gmail.com>',
                to: to,
                subject: subject,
                text: text
            }, (error, info) => {
                if (error) {
                    console.error("❌ Lỗi gửi Mail chi tiết nội bộ:", error);
                    return reject(error);
                }
                console.log("🚀 Mail đã được gửi đi thành công:", info.response);
                resolve(info);
            });
        });
    }
};