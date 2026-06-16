require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const authController = require('./controllers/authController'); // Giả sử bạn để file ở đây

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ DB Error:', err));

const server = http.createServer((req, res) => {
    // Thiết lập CORS header cho mọi request
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    // Xử lý Body của request
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        const data = body ? JSON.parse(body) : {};
        req.body = data;

        // Routing thủ công
        if (req.url === '/api/register' && req.method === 'POST') {
            authController.register(req, res);
        } else if (req.url === '/api/verify-otp' && req.method === 'POST') {
            authController.verifyOTP(req, res);
        } else if (req.url === '/api/login' && req.method === 'POST') {
            authController.login(req, res);
        } else {
            res.writeHead(404);
            res.end(JSON.stringify({ message: 'Not Found' }));
        }
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Node.js Server running on port ${process.env.PORT || 3000}`);
});