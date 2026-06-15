const nodemailer = require('nodemailer');

// Quay lại cấu hình Gmail gốc của bạn kèm theo tăng mạnh thời gian chờ Timeout
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tungpham01235@gmail.com',     // Email hệ thống của bạn
        pass: 'cgjjixvhbtzvztwn'             // Mật khẩu ứng dụng 16 ký tự của bạn (viết liền)
    },
    // Tăng thời gian Timeout để Render có đủ thời gian xử lý kết nối mạng
    connectionTimeout: 50000, // 50 giây chờ kết nối (mặc định chỉ có vài giây)
    greetingTimeout: 50000,   // 50 giây chờ phản hồi chào hỏi từ máy chủ Google
    timeout: 50000,           // 50 giây cho toàn bộ tiến trình gửi
    pool: true                // Sử dụng kết nối duy trì (Pool) để các lượt gửi sau không phải kết nối lại từ đầu
});

module.exports = {
    sendMail: (to, subject, text) => {
        return new Promise((resolve, reject) => {
            transporter.sendMail({
                from: '"Smart Pillbox" <tungpham01235@gmail.com>', 
                to: to,
                subject: `[Smart Pillbox] ${subject}`,
                // Giữ cả dạng text và html cũ để đảm bảo mail trường hay mail thường đều đọc được
                text: text, 
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #007bff; text-align: center;">Xác Thực Tài Khoản Smart Pillbox</h2>
                        <p>Xin chào,</p>
                        <p>Bạn đang thực hiện đăng ký tài khoản trên hệ thống tủ thuốc thông minh <b>Smart Pillbox</b>.</p>
                        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff; margin: 20px 0; border-radius: 4px; border: 1px dashed #007bff;">
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
                console.log("🚀 Mail đã được gửi đi thành công qua Gmail:", info.response);
                resolve(info);
            });
        });
    }
};