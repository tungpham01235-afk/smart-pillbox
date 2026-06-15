'use strict';
const mongoose = require('mongoose');

// Cấu trúc một cữ hẹn giờ cơ bản
const AlarmSchema = new mongoose.Schema({
    time: { type: String, default: "00:00" },   // Định dạng "HH:MM" để phần cứng dễ đối chiếu
    pillName: { type: String, default: "" },   // Tên thuốc cần uống
    isEnabled: { type: Boolean, default: false } // Trạng thái Bật/Tắt cữ hẹn
});

// Cấu trúc tổng thể của Tủ thuốc liên kết với một User
const BoxSchema = new mongoose.Schema({
    boxId: { type: String, required: true, unique: true }, // Mã QR dán dưới đáy tủ thuốc
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', default: null }, // ID người sở hữu tủ thuốc
    alarms: {
        sang: { type: AlarmSchema, default: () => ({}) },
        trua: { type: AlarmSchema, default: () => ({}) },
        toi: { type: AlarmSchema, default: () => ({}) }
    }
});

module.exports = mongoose.model('Boxes', BoxSchema);