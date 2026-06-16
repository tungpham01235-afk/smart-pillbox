'use strict';
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true, // Tối ưu: tự động chuyển email về chữ thường
        trim: true       // Tối ưu: tự động cắt bỏ khoảng trắng thừa
    },
    
    // --- Cấu trúc bảo mật OTP ---
    otp: { 
        type: String, 
        default: null 
    },
    otpExpires: { 
        type: Date, 
        default: null 
    },
    lastOtpSent: { 
        type: Date, 
        default: null 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },

    // --- Cấu trúc bảo mật Đăng nhập (Brute-force protection) ---
    loginAttempts: { 
        type: Number, 
        default: 0 
    },
    lockUntil: { 
        type: Date, 
        default: null 
    }
}, { timestamps: true });

// Tối ưu: Thêm một phương thức kiểm tra xem tài khoản có đang bị khóa không
UserSchema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

module.exports = mongoose.model('Users', UserSchema);