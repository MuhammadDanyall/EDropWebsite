const express = require('express');
const router = express.Router();
const User = require('../models/user');
const nodemailer = require('nodemailer');
const { authLimiter, validateInputs } = require('../middleware/security');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');

// Validation Schemas
const signupValidation = [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    validateInputs
];

const loginValidation = [
    body('email').trim().notEmpty().withMessage('Email or Phone is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validateInputs
];

// Apply stricter rate limit to all auth routes
router.use(authLimiter);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    return regex.test(password);
};

router.post('/signup', signupValidation, async (req, res) => {
    try {
        const { fullName, email, password, phone, role } = req.body;
        
        // Basic validation
        if (!fullName || !email || !password || !phone) {
            return res.status(400).json({ message: "All fields are required! " });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ 
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." 
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({ message: "This email is already registered! Please use another email or Login." });
        }

        // Check if phone already exists
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ message: "This phone number is already registered! Please use another phone number or Login." });
        }

        const newUser = new User({
            fullName,
            email: email.toLowerCase(),
            password,
            phone,
            role
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully! " });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Email or Phone number already registered! " });
        }
        console.error("Signup Error Detailed:", err);
        res.status(400).json({ message: "Error occurred: " + err.message });
    }
});

// LOGIN ROUTE
router.post('/login', loginValidation, async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email/Phone and Password are required! " });
        }

        // 1. Check if user exists (By Email OR Phone)
        const loginQuery = email.includes('@') 
            ? { email: email.toLowerCase() } 
            : { $or: [{ email: email.toLowerCase() }, { phone: email }] };

        const user = await User.findOne(loginQuery);
        
        if (!user) return res.status(400).json({ message: "User not found! Please Signup first. " });

        // 2. Check password (Support both plain text and bcrypt hash)
        let isMatch = false;
        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            isMatch = user.password === password;
        }

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password! Please try again." });
        }

        // 3. If everything is correct
        if (user.role === 'admin') {
            // Generate 6-digit OTP for Admin 2FA
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.resetPasswordOtp = otp;
            user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 mins expiry
            await user.save();

            // Send Email
            const mailOptions = {
                from: `E-DROP SECURITY <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'Admin Dashboard Login OTP',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ff6b35; border-radius: 10px;">
                        <h2 style="color: #ff6b35;">Security Verification</h2>
                        <p>You are attempting to access the Admin Dashboard.</p>
                        <p style="font-size: 1.5rem; font-weight: bold; background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</p>
                        <p>This code is valid for 5 minutes.</p>
                    </div>
                `
            };
            transporter.sendMail(mailOptions);
            console.log(`[ADMIN LOGIN OTP]: ${otp}`);

            return res.status(200).json({
                success: true,
                otpRequired: true,
                message: "OTP sent to admin email."
            });
        }

        res.status(200).json({
            message: "Login Successful! Welcome ",
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
        });

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});
// FORGOT PASSWORD
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found!" });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOtp = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
        await user.save();

        console.log(`[TESTING OTP for ${email}]: ${otp}`); // For debugging

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'E-Drop Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}\nIt is valid for 10 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email Error:", error);
                return res.status(500).json({ message: "Error sending email." });
            }
            res.status(200).json({ message: "OTP sent to your email! " });
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// VERIFY ADMIN LOGIN OTP
router.post('/verify-admin-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() },
            role: 'admin'
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired OTP! " });

        // Clear OTP and complete login
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "OTP Verified! Access Granted.",
            user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOtp: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired OTP! " });

        if (!validatePassword(newPassword)) {
            return res.status(400).json({ 
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character." 
            });
        }

        // Update password and clear OTP
        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Password reset successfully! You can now login." });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;