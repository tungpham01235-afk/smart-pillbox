const nodemailer = require('nodemailer');

// Cấu hình Nodemailer với App Password bạn vừa tạo
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tungpham01235@gmail.com', // Email của bạn
        pass: 'alxu pxyc ptjd tded'            // 16 ký tự bạn đã lấy (viết liền không dấu cách)
    }
});

module.exports = {
    // Hàm gửi Email
    sendMail: (to, subject, text) => {
        return transporter.sendMail({
            from: '"Smart Pillbox" <tungpham01235@gmail.com>',
            to: to,
            subject: subject,
            text: text
        });
    }
};