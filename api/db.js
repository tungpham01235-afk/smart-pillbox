'use strict';
const mongoose = require('mongoose');

// Kích hoạt chế độ debug để theo dõi các câu lệnh truy vấn xuống MongoDB trong Terminal
mongoose.set('debug', false);

// Kết nối database dựa trên chuỗi URL bảo mật trong .env
// Nếu process.env.MONGODB_URI bị lỗi, hãy đảm bảo bạn đã load file .env (dùng dotenv)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
      console.log('👉 Kết nối MongoDB thành công!');
      console.log('🔗 Đang kết nối tới URI: ' + process.env.MONGODB_URI);
  })
  .catch((err) => console.error('❌ Lỗi kết nối database: ', err));

module.exports = mongoose;