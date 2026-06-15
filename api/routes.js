'use strict';

module.exports = function(app) {
    let authCtrl = require('./controllers/AuthController');
    let boxCtrl = require('./controllers/BoxController');
    let checkAuth = require('./authMiddleware'); // Bộ gác cổng bảo mật

    // Nhóm 1: Tuyến đường xác thực (Đăng ký, Xác thực OTP, Đăng nhập)
    app.route('/api/auth/signup')
        .post(authCtrl.register);

    // MỚI: Route để nhập mã OTP kích hoạt tài khoản
    app.route('/api/auth/verify')
        .post(authCtrl.verifyOTP);

    app.route('/api/auth/login')
        .post(authCtrl.login);

    // Nhóm 2: Tuyến đường bảo mật liên kết mã QR thiết bị tủ thuốc
    app.route('/api/box/bind')
        .post(checkAuth, boxCtrl.bindBox);

    // Nhóm 3: Tuyến đường quản lý cấu hình tủ
    app.route('/api/box/:boxId')
        .get(checkAuth, boxCtrl.getBoxConfig)
        .put(checkAuth, boxCtrl.updateAlarms);

    // Nhóm 4: Tuyến đường làm việc với lịch sử hoạt động uống thuốc (Logs)
    app.route('/api/logs/:boxId')
        .get(checkAuth, boxCtrl.getBoxLogs);

    // Tuyến đường này ESP32 tự động gửi log lên, KHÔNG cần checkAuth
    app.route('/api/logs/sync')
        .post(boxCtrl.savePillLog); 
};