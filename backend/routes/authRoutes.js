const express = require('express');
const router = express.Router();
const User = require('../models/user');
const nodemailer = require('nodemailer');
const { authLimiter, validateInputs } = require('../middleware/security');
const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const https = require('https');

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

// Helper function to send emails via Brevo API
const sendBrevoEmail = async (to, subject, html) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            sender: { email: process.env.BREVO_USER || process.env.EMAIL_USER || 'no-reply@edrop.com' },
            to: [{ email: to }],
            subject: subject,
            htmlContent: html
        });

        const options = {
            hostname: 'api.brevo.com',
            path: '/v3/smtp/email',
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    console.log('✅ Email sent via Brevo API');
                    resolve();
                } else {
                    console.error('❌ Brevo API Error:', body);
                    reject(new Error('Failed to send email via Brevo API'));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Brevo API Request Error:', error);
            reject(error);
        });

        req.write(data);
        req.end();
    });
};

// Choose email sending method based on available env vars
let sendEmail;
if (process.env.BREVO_API_KEY) {
    // Use Brevo API if API key is provided
    console.log('📧 Using Brevo API for emails');
    sendEmail = async (to, subject, html, text) => {
        await sendBrevoEmail(to, subject, html);
    };
} else if (process.env.BREVO_USER && process.env.BREVO_PASS) {
    // Use Brevo SMTP if credentials are provided
    console.log('📧 Using Brevo SMTP for emails');
    const transporter = nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.BREVO_USER,
            pass: process.env.BREVO_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    sendEmail = async (to, subject, html, text) => {
        await transporter.sendMail({
            from: process.env.BREVO_USER || process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html,
            text: text || html.replace(/<[^>]*>/g, '')
        });
    };
} else {
    // Fallback to Gmail if nothing else
    console.log('📧 Using Gmail for emails (not recommended for production)');
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    sendEmail = async (to, subject, html, text) => {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html,
            text: text || html.replace(/<[^>]*>/g, '')
        });
    };
}

// Verify email setup is ready
console.log('✅ Email system initialized');
if (process.env.BREVO_API_KEY) {
    console.log('   → Using Brevo API');
} else if (process.env.BREVO_USER && process.env.BREVO_PASS) {
    console.log('   → Using Brevo SMTP');
} else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('   → Using Gmail (not recommended for production)');
} else {
    console.warn('   ⚠️  No email credentials found - emails will fail');
}

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

            // ALWAYS LOG OTP TO CONSOLE FIRST (for development/production debugging)
            console.log("=");
            console.log("=");
            console.log(`🔐 ADMIN LOGIN OTP GENERATED: ${otp}`);
            console.log(`📧 Recipient: ${user.email}`);
            console.log(`⏰ Expires: 5 minutes`);
            console.log("=");
            console.log("=");
            
            // Send Email
            const mailOptions = {
                from: process.env.EMAIL_USER,
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
            
            try {
                await sendEmail(
                    user.email,
                    "Admin Dashboard Login OTP",
                    mailOptions.html
                );
                console.log("✅ OTP Email Sent Successfully");
            } catch (error) {
                console.error("❌ OTP Email Failed to Send");
                console.error("Error message:", error.message);
                console.error("Full error:", JSON.stringify(error, null, 2));
                console.log("⚠️  But don't worry! You can still use the OTP logged above.");
            }

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

        // ALWAYS LOG OTP TO CONSOLE FIRST
        console.log("=");
        console.log("=");
        console.log(`🔑 PASSWORD RESET OTP GENERATED: ${otp}`);
        console.log(`📧 Recipient: ${email}`);
        console.log(`⏰ Expires: 10 minutes`);
        console.log("=");
        console.log("=");

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'E-Drop Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}\nIt is valid for 10 minutes.`
        };

        try {
            await sendEmail(
                email,
                "E-Drop Password Reset OTP",
                `<div>Your OTP for password reset is: <strong>${otp}</strong><br>It is valid for 10 minutes.</div>`,
                mailOptions.text
            );
            console.log("✅ Password Reset OTP Email Sent Successfully");
            res.status(200).json({ message: "OTP sent to your email! " });
        } catch (error) {
            console.error("❌ Password Reset OTP Email Failed to Send");
            console.error("Error message:", error.message);
            console.error("Full error:", JSON.stringify(error, null, 2));
            console.log("⚠️  But don't worry! You can still use the OTP logged above.");
            return res.status(500).json({ 
                message: "Error sending email. Please try again later or check server logs.",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    } catch (err) {
        console.error("Forgot Password Server Error:", err);
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