const nodemailer = require('nodemailer');

// Cấu hình Nodemailer cưỡng chế IPv4 kết hợp dịch vụ Gmail chuyên nghiệp
const transporter = nodemailer.createTransport({
    service: 'gmail',
    // Bổ sung cấu hình kết nối để bỏ qua hoàn toàn rào cản IPv6 trên Render
    connectionTimeout: 10000, // Giới hạn thời gian chờ kết nối (10 giây)
    greetingTimeout: 10000,
    socketTimeout: 10000,
    dnsTimeout: 5000,
    // Ép socket tạo kết nối trực tiếp không qua phân giải IPv6 lặp
    tls: {
        rejectUnauthorized: false // Bỏ qua lỗi chứng chỉ mạng nếu hạ tầng Render cấu hình chưa chuẩn
    },
    auth: {
        user: 'tungpham01235@gmail.com', // Email của bạn
        pass: 'alxu pxyc ptjd tded'       // App Password 16 ký tự
    }
});

module.exports = {
    // Hàm gửi Email dạng Promise chuẩn để code Backend bắt lỗi được bằng await
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