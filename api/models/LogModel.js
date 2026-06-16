'use strict';
const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    boxId: { type: String, required: true },
    slot: { type: String, enum: ['sang', 'chieu', 'toi', 'unknown'], required: true }, // Cữ uống
    status: { type: String, required: true }, // "Đúng giờ" hoặc "Mở tủ sai cữ" (Theo thuật toán ESP32)
    timeLog: { type: Date, default: Date.now } // Thời gian máy chủ nhận dữ liệu
});

module.exports = mongoose.model('Logs', LogSchema);