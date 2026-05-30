const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, default: 'pending' } // Taake admin dekh sakay ke reply hua ya nahi
}, { timestamps: true });

module.exports = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);