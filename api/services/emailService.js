const nodemailer = require('nodemailer');

// Cấu hình ép buộc sử dụng kết nối IPv4 (family: 4) để khắc phục triệt để lỗi ENETUNREACH trên Render
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Dùng lại tên miền chuẩn của Gmail
    port: 465,
    secure: true, // Cổng 465 yêu cầu secure là true
    // Ép buộc kết nối ở tầng Socket của hệ thống
    family: 4,    // 4 = Cưỡng chế chỉ sử dụng IPv4; loại bỏ hoàn toàn IPv6
    auth: {
        user: 'tungpham01235@gmail.com', // Email của bạn
        pass: 'alxu pxyc ptjd tded'       // Mật khẩu ứng dụng 16 ký tự
    }
});

module.exports = {
    // Hàm gửi Email dạng Promise chuẩn để chạy ngầm
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