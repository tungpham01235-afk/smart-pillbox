const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Bắt buộc false đối với cổng 587
    auth: {
        user: 'tungpham01235@gmail.com', // Email hệ thống của bạn
        pass: 'cgjj ixvh btzv ztwn'       // Mật khẩu ứng dụng 16 ký tự mới
    }
});

module.exports = {
    sendMail: (to, subject, text) => {
        return new Promise((resolve, reject) => {
            // Thiết kế lại cấu trúc Email chuẩn hóa để vượt qua bộ lọc Spam/Silent Drop của Google
            transporter.sendMail({
                // 1. Phần Tên hiển thị PHẢI trùng khớp hoặc đi liền với địa chỉ Email gửi để tránh bị đánh giá giả mạo
                from: '"tungpham01235" <tungpham01235@gmail.com>', 
                to: to,
                subject: `[Smart Pillbox] ${subject}`, // Thêm tag nhận diện ở tiêu đề
                // 2. Chuyển từ dạng văn bản thuần (text) sang định dạng HTML chuẩn để chứng minh đây là thư hệ thống hợp pháp
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #007bff; text-align: center;">Xác Thực Tài Khoản Smart Pillbox</h2>
                        <p>Xin chào,</p>
                        <p>Bạn đang thực hiện đăng ký tài khoản trên hệ thống tủ thuốc thông minh <b>Smart Pillbox</b>.</p>
                        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333; margin: 20px 0; border-radius: 4px; border: 1px dashed #007bff;">
                            ${text}
                        </div>
                        <p style="font-size: 12px; color: #6c757d; text-align: center; margin-top: 30px;">
                            Mã OTP này có hiệu lực trong vòng 5 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.<br>
                            © 2026 Smart Pillbox System. All rights reserved.
                        </p>
                    </div>
                `
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