'use strict';
const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Hàm hỗ trợ trả về JSON trong Node thuần
const sendResponse = (res, statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

module.exports = {
    // 1. Đăng ký & Gửi OTP
    register: async (req, res) => {
        try {
            let { name, email, password } = req.body;
            if (!email || !password || !name) return sendResponse(res, 400, { message: 'Vui lòng điền đầy đủ thông tin!' });

            const emailClean = email.toLowerCase().trim();
            const user = await User.findOne({ email: emailClean });

            if (user && user.lastOtpSent && (Date.now() - user.lastOtpSent < 60000)) {
                return sendResponse(res, 429, { message: 'Vui lòng chờ 60 giây để gửi lại mã.' });
            }

            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            await User.updateOne({ email: emailClean }, {
                name, password: hashedPassword, email: emailClean,
                otp, otpExpires: Date.now() + 5 * 60 * 1000, lastOtpSent: Date.now(),
                isVerified: false
            }, { upsert: true });

            await emailService.sendMail(emailClean, 'Mã xác thực Smart Pillbox', `Mã OTP: ${otp}. Hết hạn sau 5 phút.`);
            sendResponse(res, 200, { message: 'Đăng ký thành công! Vui lòng kiểm tra email.' });
        } catch (err) {
            sendResponse(res, 500, { message: 'Lỗi hệ thống: ' + err.message });
        }
    },

    // 2. Xác thực OTP
    verifyOTP: async (req, res) => {
        try {
            const { email, otp } = req.body;
            const user = await User.findOne({ email: email.toLowerCase().trim() });

            if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
                return sendResponse(res, 400, { message: 'OTP không hợp lệ hoặc đã hết hạn!' });
            }

            user.isVerified = true;
            user.otp = null;
            user.otpExpires = null;
            await user.save();

            sendResponse(res, 200, { message: 'Xác thực thành công!' });
        } catch (err) {
            sendResponse(res, 500, { message: 'Lỗi hệ thống: ' + err.message });
        }
    },

    // 3. Đăng nhập
    login: async (req, res) => {
        try {
            let { email, password } = req.body;
            const user = await User.findOne({ email: email.toLowerCase().trim() });

            if (user && user.isLocked()) {
                return sendResponse(res, 403, { message: 'Tài khoản bị khóa. Thử lại sau 15p.' });
            }

            if (!user || !user.isVerified || !bcrypt.compareSync(password, user.password)) {
                if (user) {
                    user.loginAttempts += 1;
                    if (user.loginAttempts >= 5) user.lockUntil = Date.now() + 15 * 60 * 1000;
                    await user.save();
                }
                return sendResponse(res, 401, { message: 'Email hoặc mật khẩu không chính xác!' });
            }

            user.loginAttempts = 0;
            user.lockUntil = null;
            await user.save();

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '30d' });
            sendResponse(res, 200, { token, user: { name: user.name, email: user.email } });
        } catch (err) {
            sendResponse(res, 500, { message: 'Lỗi hệ thống' });
        }
    }
};