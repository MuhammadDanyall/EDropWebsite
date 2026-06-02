const mongoose = require('mongoose');

const AuthLogSchema = new mongoose.Schema({
    email: { type: String, required: true },
    action: { type: String, required: true }, // 'SIGNUP', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'ADMIN_OTP_SENT', 'ADMIN_OTP_FAILED'
    role: { type: String, default: 'customer' },
    ipAddress: { type: String },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuthLog', AuthLogSchema);
