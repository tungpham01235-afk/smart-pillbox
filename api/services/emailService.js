'use strict';
const { Resend } = require('resend');

// Khởi tạo Resend với API Key lấy từ biến môi trường
// Đảm bảo bạn đã đặt RESEND_API_KEY trong file .env
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = {
    sendMail: async (to, subject, textContent) => {
        try {
            const data = await resend.emails.send({
                from: 'Smart Pillbox <onboarding@resend.dev>', // Email mặc định của Resend
                to: to,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #007bff; text-align: center;">Xác Thực Smart Pillbox</h2>
                        <p>Xin chào,</p>
                        <p>Bạn đang thực hiện xác thực trên hệ thống <b>Smart Pillbox</b>.</p>
                        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #007bff; margin: 20px 0; border-radius: 4px; border: 1px dashed #007bff;">
                            ${textContent.replace(/[^0-9]/g, '')}
                        </div>
                        <p style="font-size: 12px; color: #6c757d; text-align: center; margin-top: 30px;">
                            Mã OTP này có hiệu lực trong vòng 5 phút.<br>
                            © 2026 Smart Pillbox System. All rights reserved.
                        </p>
                    </div>
                `
            });
            console.log("🚀 Email đã được gửi qua Resend API:", data.id);
            return data;
        } catch (error) {
            console.error("❌ Lỗi gửi Mail qua Resend:", error);
            throw error; // Ném lỗi để controller xử lý
        }
    }
};