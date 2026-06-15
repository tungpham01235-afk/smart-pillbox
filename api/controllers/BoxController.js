'use strict';
const Box = require('../models/BoxModel');
const Log = require('../models/LogModel');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BoxSchema = new Schema({
    boxId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    ownerId: { 
        type: String, 
        required: true 
    },
    // Đây là phần quan trọng nhất để khớp với Controller của bạn
    alarms: [{
        time: { type: String, required: true },         // Ví dụ: "08:00"
        medicineName: { type: String, required: true }, // Ví dụ: "Vitamin C"
        active: { type: Boolean, default: true }       // Trạng thái bật/tắt
    }]
}, { timestamps: true }); // Tự động lưu thời gian tạo/cập nhật

module.exports = mongoose.model('Box', BoxSchema);
module.exports = {
    // 1. Tính năng bảo mật quét mã QR: Liên kết ID tủ thuốc với tài khoản người dùng
    bindBox: (req, res) => {
        let boxIdFromQR = req.body.boxId;
        let userId = req.user.userId; 

        Box.findOne({ boxId: boxIdFromQR })
            .then(box => {
                if (!box) {
                    let newBox = new Box({ boxId: boxIdFromQR, ownerId: userId, alarms: [] });
                    return newBox.save();
                }
                if (box.ownerId) {
                    return res.status(400).json({ message: 'Thiết bị này đã có chủ sở hữu!' });
                }
                box.ownerId = userId;
                return box.save();
            })
            .then(updatedBox => res.json({ message: 'Liên kết thiết bị thành công!', box: updatedBox }))
            .catch(err => res.status(500).json({ error: err.message }));
    },

    // 2. Lấy thông tin cấu hình (giờ hẹn, tên thuốc) - Dùng cho ESP32 và App Mobile
    getBoxConfig: (req, res) => {
        Box.findOne({ boxId: req.params.boxId, ownerId: req.user.userId })
            .then(box => {
                if (!box) return res.status(404).json({ message: 'Không tìm thấy thiết bị!' });
                res.json(box);
            })
            .catch(err => res.status(500).json({ error: err.message }));
    },

    // 3. Cập nhật lịch thuốc (Tên thuốc, Giờ, Trạng thái) từ App/Web
    // Dữ liệu body gửi lên cần dạng: { "alarms": [{ "time": "08:00", "medicineName": "Paracetamol", "active": true }] }
    updateAlarms: (req, res) => {
        let boxId = req.params.boxId;
        let updatedAlarms = req.body.alarms; 

        Box.findOneAndUpdate(
            { boxId: boxId, ownerId: req.user.userId },
            { $set: { alarms: updatedAlarms } },
            { new: true }
        )
        .then(updatedBox => {
            if (!updatedBox) return res.status(404).json({ message: 'Cập nhật thất bại!' });
            res.json({ message: 'Cập nhật cấu hình thành công!', alarms: updatedBox.alarms });
        })
        .catch(err => res.status(500).json({ error: err.message }));
    },

    // 4. Đồng bộ Log từ ESP32 bắn lên (Tự động)
    savePillLog: (req, res) => {
        let newLog = new Log({
            boxId: req.body.boxId,
            action: req.body.action || 'Uống thuốc', 
            status: req.body.status || 'Đã uống',
            createdAt: new Date()
        });

        newLog.save()
            .then(savedLog => res.json({ message: 'Đồng bộ log thành công!', log: savedLog }))
            .catch(err => res.status(500).json({ error: err.message }));
    },

    // 5. Lấy lịch sử Logs để hiển thị lên bảng Dashboard
    getBoxLogs: (req, res) => {
        Log.find({ boxId: req.params.boxId })
            .sort({ createdAt: -1 })
            .then(logs => res.json(logs))
            .catch(err => res.status(500).json({ error: err.message }));
    }
};