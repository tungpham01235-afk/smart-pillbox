'use strict';
const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

module.exports = {
    // 1. Logic Đăng ký tài khoản thông minh (Hỗ trợ Re-send OTP nếu chưa verified)
    register: async (req, res) => {
        try {
            let { name, email, password } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
            }

            // Mã hóa mật khẩu chuẩn bị sẵn
            let salt = bcrypt.genSaltSync(10);
            let hashedPassword = bcrypt.hashSync(password, salt);

            // Tạo mã OTP ngẫu nhiên 6 chữ số
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            // KIỂM TRA LOGIC ĐỒNG BỘ:
            const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

            if (existingUser) {
                // Kịch bản A: Email đã xác thực hoàn toàn rồi -> Chặn không cho đăng ký trùng
                if (existingUser.isVerified) {
                    return res.status(400).json({ message: 'Email này đã được sử dụng và kích hoạt!' });
                }

                // Kịch bản B: Email đã đăng ký nhưng chưa OTP thành công -> Ghi đè thông tin mới và gửi lại OTP
                existingUser.name = name;
                existingUser.password = hashedPassword;
                existingUser.otp = otp;
                await existingUser.save();

                await emailService.sendMail(
                    email, 
                    'Mã xác thực lại tài khoản Smart Pillbox', 
                    `Bạn vừa yêu cầu đăng ký lại. Mã OTP mới của bạn là: ${otp}`
                );

                return res.status(200).json({ 
                    status: "PENDING_VERIFICATION",
                    message: 'Email đã đăng ký trước đó nhưng chưa xác thực. Mã OTP mới đã được gửi lại vào hòm thư!',
                    email: existingUser.email
                });
            }

            // Kịch bản C: Người dùng mới tinh -> Tạo mới dữ liệu thông thường
            let newUser = new User({
                name,
                password: hashedPassword,
                email: email.toLowerCase().trim(),
                otp: otp,
                isVerified: false
            });

            await newUser.save();

            // Gửi OTP qua email cho tài khoản mới tinh
            await emailService.sendMail(
                email, 
                'Mã xác thực tài khoản Smart Pillbox', 
                `Chào mừng bạn đến với Smart Pillbox. Mã OTP của bạn là: ${otp}`
            );

            res.status(201).json({ 
                status: "NEW_REGISTRATION",
                message: 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP xác thực.' 
            });

        } catch (err) {
            res.status(500).json({ message: 'Lỗi hệ thống: ' + err.message });
        }
    },

    // 2. Logic Xác thực OTP chuyên nghiệp
    verifyOTP: async (req, res) => {
        try {
            const { email, otp } = req.body;
            
            if (!email || !otp) {
                return res.status(400).json({ message: 'Thiếu email hoặc mã OTP!' });
            }

            const user = await User.findOne({ email: email.toLowerCase().trim() });

            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản cần xác thực!' });
            }
            
            if (user.isVerified) {
                return res.status(400).json({ message: 'Tài khoản này vốn đã được xác thực từ trước, bạn hãy tiến hành đăng nhập!' });
            }

            if (user.otp !== otp.trim()) {
                return res.status(400).json({ message: 'Mã OTP không chính xác hoặc đã hết hạn!' });
            }

            // Chuyển đổi trạng thái sang verified và dọn sạch trường OTP
            user.isVerified = true;
            user.otp = null; 
            await user.save();

            res.status(200).json({ message: 'Xác thực tài khoản thành công! Bạn đã có thể đăng nhập ngay.' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi hệ thống: ' + err.message });
        }
    },

    // 3. Logic Đăng nhập cải tiến
    login: async (req, res) => {
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ email và mật khẩu!' });
            }

            const user = await User.findOne({ email: email.toLowerCase().trim() });
            
            if (!user) return res.status(400).json({ message: 'Email này chưa được đăng ký thành viên!' });
            
            // Nếu cố tình đăng nhập khi chưa xác thực OTP, chặn lại nhắc kiểm tra mail
            if (!user.isVerified) {
                return res.status(403).json({ 
                    status: "UNVERIFIED",
                    message: 'Tài khoản chưa được xác thực mã OTP! Vui lòng kiểm tra email hoặc nhấn đăng ký lại để nhận mã.' 
                });
            }

            let isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Mật khẩu đăng nhập không chính xác!' });

            // Ký token bảo mật thời hạn 30 ngày
            let token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'SECRET_BACKUP_KEY', { expiresIn: '30d' });
            
            res.status(200).json({
                message: 'Đăng nhập thành công!',
                token: token,
                user: { id: user._id, name: user.name, email: user.email }
            });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi hệ thống: ' + err.message });
        }
    }
};