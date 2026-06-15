'use strict';
const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

module.exports = {
    // 1. Logic Đăng ký tài khoản thông minh
    register: async (req, res) => {
        try {
            let { name, email, password } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
            }

            let salt = bcrypt.genSaltSync(10);
            let hashedPassword = bcrypt.hashSync(password, salt);
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

            if (existingUser) {
                if (existingUser.isVerified) {
                    return res.status(400).json({ message: 'Email này đã được sử dụng và kích hoạt!' });
                }

                existingUser.name = name;
                existingUser.password = hashedPassword;
                existingUser.otp = otp;
                await existingUser.save();

                // ĐÃ SỬA: Thêm AWAIT để đảm bảo luồng xử lý đồng bộ và ổn định
                await emailService.sendMail(
                    email, 
                    'Mã xác thực lại tài khoản Smart Pillbox', 
                    `Bạn vừa yêu cầu đăng ký lại. Mã OTP mới của bạn là: ${otp}`
                );

                return res.status(200).json({ 
                    status: "PENDING_VERIFICATION",
                    message: 'Email đã đăng ký trước đó nhưng chưa xác thực. Mã OTP mới đã được gửi!',
                    email: existingUser.email
                });
            }

            let newUser = new User({
                name,
                password: hashedPassword,
                email: email.toLowerCase().trim(),
                otp: otp,
                isVerified: false
            });

            await newUser.save();

            // ĐÃ SỬA: Thêm AWAIT để đảm bảo luồng xử lý đồng bộ và ổn định
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
            console.error("❌ Lỗi tại register controller:", err);
            res.status(500).json({ message: 'Lỗi hệ thống trong quá trình gửi mail: ' + err.message });
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
                return res.status(404).json({ message: 'Không tìm thấy thông tin tài khoản!' });
            }
            
            if (user.isVerified) {
                return res.status(400).json({ message: 'Tài khoản đã được xác thực trước đó!' });
            }

            if (user.otp !== otp.trim()) {
                return res.status(400).json({ message: 'Mã OTP không chính xác!' });
            }

            user.isVerified = true;
            user.otp = null; 
            await user.save();

            res.status(200).json({ message: 'Xác thực tài khoản thành công!' });
        } catch (err) {
            res.status(500).json({ message: 'Lỗi hệ thống: ' + err.message });
        }
    },

    // 3. Logic Đăng nhập cải tiến
    login: async (req, res) => {
        try {
            let { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
            }

            const user = await User.findOne({ email: email.toLowerCase().trim() });
            
            if (!user) return res.status(400).json({ message: 'Email này chưa được đăng ký!' });
            
            if (!user.isVerified) {
                return res.status(403).json({ 
                    status: "UNVERIFIED",
                    message: 'Tài khoản chưa xác thực OTP!' 
                });
            }

            let isMatch = bcrypt.compareSync(password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không chính xác!' });

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