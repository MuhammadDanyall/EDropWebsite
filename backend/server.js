const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors()); // Enables React and Node communication
app.use(express.json()); // Allows server to parse JSON data

const { securityHeaders, globalLimiter, aiThreatDetection } = require('./middleware/security');

app.use(securityHeaders); // Secure HTTP headers
app.use(globalLimiter); // Global rate limiting
app.use(aiThreatDetection); // Heuristic threat detection

// Routes Link
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/shipments', require('./routes/shipmentRoutes'));
app.use('/api/cargo', require('./routes/cargoRoutes'));
app.use('/api/estimate', require('./routes/estimateRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

// Database Connection & Admin Seeding
mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("MongoDB Connected Successfully... ");

        // Seed Default Admin
        const User = require('./models/user');
        const bcrypt = require('bcryptjs');
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const defaultAdmin = new User({
                fullName: 'Super Admin',
                email: 'admin@edrop.com',
                password: hashedPassword,
                phone: '0000000000',
                role: 'admin'
            });
            await defaultAdmin.save();
            console.log("✅ Default Admin Created: admin@edrop.com / admin123");
        }
    })
    .catch(err => console.log("Database Error: ", err));

// Render require dynamically assigned ports
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`-----------------------------------------------`);
    console.log(`Server is running on port: ${PORT} 🚀`);
    console.log(`-----------------------------------------------`);
});