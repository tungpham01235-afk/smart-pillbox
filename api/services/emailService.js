const nodemailer = require('nodemailer');

// Thay đổi cấu hình dùng trực tiếp IPv4 của Gmail nhằm triệt tiêu hoàn toàn lỗi ENETUNREACH trên Render Free
const transporter = nodemailer.createTransport({
    host: '74.125.200.108', // Địa chỉ IPv4 trực tiếp của máy chủ smtp.gmail.com
    port: 465,
    secure: true, // Cổng 465 bắt buộc cấu hình secure là true
    auth: {
        user: 'tungpham01235@gmail.com', // Email của bạn
        pass: 'alxu pxyc ptjd tded'       // Mật khẩu ứng dụng 16 ký tự
    }
});

module.exports = {
    // Hàm gửi Email dạng Promise chuẩn để log lỗi chạy ngầm mượt mà
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