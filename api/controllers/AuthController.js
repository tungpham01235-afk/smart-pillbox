'use strict';
const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService'); // Giả định bạn đã tạo file này

module.exports = {
    // 1. Logic Đăng ký tài khoản với OTP
    register: async (req, res) => {
        try {
            let { name, email, password } = req.body;

            if (!email || !password || !name) {
                return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
            }

            // Tạo mã OTP ngẫu nhiên 6 chữ số
            const otp = Math.floor(100000 + Math.random() * 900000).toString();

            let salt = bcrypt.genSaltSync(10);
            let hashedPassword = bcrypt.hashSync(password, salt);

            let newUser = new User({
                name,
                password: hashedPassword,
                email,
                otp: otp,
                isVerified: false
            });

            await newUser.save();

            // Gửi OTP qua email
            await emailService.sendMail(email, 'Mã xác thực tài khoản Smart Pillbox', `Mã OTP của bạn là: ${otp}`);

            res.json({ message: 'Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP xác thực.' });
        } catch (err) {
            if (err.code === 11000) {
                return res.status(400).json({ message: 'Email này đã được sử dụng!' });
            }
            res.status(500).json({ message: err.message });
        }
    },

    // 2. Logic Xác thực OTP
    verifyOTP: async (req, res) => {
        try {
            const { email, otp } = req.body;
            const user = await User.findOne({ email });

            if (!user) return res.status(400).json({ message: 'Không tìm thấy tài khoản!' });
            if (user.otp !== otp) return res.status(400).json({ message: 'Mã OTP không chính xác!' });

            user.isVerified = true;
            user.otp = null; // Xóa mã sau khi xác thực thành công
            await user.save();

            res.json({ message: 'Xác thực tài khoản thành công! Bạn đã có thể đăng nhập.' });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    // 3. Logic Đăng nhập (Kiểm tra trạng thái xác thực)
    login: async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            
            if (!user) return res.status(400).json({ message: 'Email chưa được đăng ký!' });
            if (!user.isVerified) return res.status(400).json({ message: 'Tài khoản chưa được xác thực! Vui lòng kiểm tra email.' });

            let isMatch = bcrypt.compareSync(req.body.password, user.password);
            if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không chính xác!' });

            let token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
            
            res.json({
                message: 'Đăng nhập thành công!',
                token: token,
                user: { id: user._id, name: user.name, email: user.email }
            });
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    }
};