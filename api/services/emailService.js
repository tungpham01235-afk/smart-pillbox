const nodemailer = require('nodemailer');

// Chuyển cấu hình sang Cổng 587 mã hóa STARTTLS để vượt qua tường lửa chặn cổng 465 của Render Free
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,            // Thay đổi từ 465 sang 587
    secure: false,        // Đối với cổng 587, giá trị bắt buộc là false
    auth: {
        user: 'tungpham01235@gmail.com', // Email hệ thống của bạn
        pass: 'cgjj ixvh btzv ztwn'       // Mật khẩu ứng dụng 16 ký tự mới vừa tạo
    }
});

module.exports = {
    // Hàm gửi Email dạng Promise chuẩn chạy ngầm phục vụ AuthController
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