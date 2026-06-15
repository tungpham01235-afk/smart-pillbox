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
        unique: true 
    },
    // Các trường bổ sung cho việc xác thực
    otp: { 
        type: String, 
        default: null 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    }
}, { timestamps: true }); // Dấu ngoặc nhọn này đóng cho schema, tiếp theo là config object

module.exports = mongoose.model('Users', UserSchema);