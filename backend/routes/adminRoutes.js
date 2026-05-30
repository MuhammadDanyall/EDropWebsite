const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const User = require('../models/user');
const Contact = require('../models/contact');
const Shipment = require('../models/Shipment');
const Cargo = require('../models/Cargo');
const { globalLimiter } = require('../middleware/security');

// Global limiter is already applied in server.js, no need to apply twice

// 1. Configure Nodemailer with your credentials from .env
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 2. Admin Authentication Middleware (Defined ONLY once)
const adminAuth = (req, res, next) => {
    const role = req.header('user-role');
    console.log(`[AdminAuth] Request to ${req.path} - Role: ${role}`);
    if (!role || role !== 'admin') {
        console.warn(`[AdminAuth] Access Denied for role: ${role}`);
        return res.status(403).json({ message: "Access Denied: Admins Only" });
    }
    next();
};

// Apply middleware to all routes below
router.use(adminAuth);

// 3. GET all users
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// 3.5 DELETE user
router.delete('/users/:id', async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error: error.message });
    }
});

// 3.8 PUT update user
router.put('/users/:id', async (req, res) => {
    try {
        const { fullName, phone, role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { fullName, phone, role },
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error: error.message });
    }
});

// 4. GET all messages
router.get('/messages', async (req, res) => {
    try {
        const messages = await Contact.find().sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
});

// 5. POST: The Reply Route
router.post('/reply', async (req, res) => {
    const { messageId, userEmail, replyText, originalMsg } = req.body;

    try {
        const mailOptions = {
            from: `E-DROP Support <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Support Ticket Update - E-DROP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #ff6b35;">E-DROP Customer Support</h2>
                    <p>Regarding your message: "<i>${originalMsg}</i>"</p>
                    <p><strong>Our Response:</strong></p>
                    <p>${replyText}</p>
                    <br>
                    <p>Best Regards,<br>Team E-DROP</p>
                </div>
            `
        };

        // Send email asynchronously so it doesn't block the UI
        transporter.sendMail(mailOptions).catch(err => console.log("Email sending failed:", err));

        // Update status in Database immediately
        await Contact.findByIdAndUpdate(messageId, { status: 'replied' });

        res.json({ success: true, message: "Reply sent successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to process reply", error: error.message });
    }
});

// 6. GET all shipments
router.get('/shipments', async (req, res) => {
    try {
        const shipments = await Shipment.find().sort({ createdAt: -1 });
        res.status(200).json(shipments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching shipments', error: error.message });
    }
});

// 7. PATCH update shipment status
router.patch('/shipments/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const shipment = await Shipment.findById(req.params.id);
        
        if (!shipment) {
            return res.status(404).json({ message: "Shipment not found" });
        }

        shipment.status = status;

        // --- Auto-Location Mapping for SHIPPING (Sea) ---
        const shippingStatusLocs = {
            'Order Submitted': { lat: 25.2048, lng: 55.2708, address: 'Origin Port (Dubai)' },
            'Shipped from Origin': { lat: 15.0000, lng: 65.0000, address: 'In International Waters' },
            'In Cargo Transit': { lat: 20.0000, lng: 67.0000, address: 'Approaching Arabian Sea' },
            'Arrived at Port (Pakistan)': { lat: 24.8607, lng: 67.0011, address: 'Karachi Port' },
            'Out for Delivery': { lat: 24.9000, lng: 67.1000, address: 'Local Distribution Hub' },
            'Delivered': shipment.destinationLocation
        };

        if (shippingStatusLocs[status]) {
            shipment.currentLocation = shippingStatusLocs[status];
        }

        // Recalculate ETA
        const { calculateSmartETA } = require('../services/trackingService');
        const smartETA = calculateSmartETA(shipment.currentLocation, shipment.destinationLocation, shipment.averageSpeed);
        shipment.estimatedArrival = smartETA.etaDate;

        await shipment.save();

        res.status(200).json({ message: "Shipment status updated successfully", shipment });
    } catch (error) {
        res.status(500).json({ message: "Error updating shipment status", error: error.message });
    }
});

// 8. GET all cargo orders
router.get('/cargo', async (req, res) => {
    try {
        const cargoOrders = await Cargo.find().sort({ createdAt: -1 });
        res.status(200).json(cargoOrders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cargo orders', error: error.message });
    }
});

// 9. PATCH update cargo status
router.patch('/cargo/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const cargo = await Cargo.findById(req.params.id);
        
        if (!cargo) {
            return res.status(404).json({ message: "Cargo order not found" });
        }

        cargo.status = status;

        // --- Auto-Location Mapping for CARGO (Land) ---
        const cargoStatusLocs = {
            'Booked': { lat: 31.5204, lng: 74.3587, address: 'Origin Warehouse (Lahore)' },
            'Picked Up': { lat: 31.4504, lng: 74.2587, address: 'Sorting Center (Lahore)' },
            'In Transit': { lat: 30.1575, lng: 71.5249, address: 'On Highway (Near Multan)' },
            'Out for Delivery': { lat: 24.8607, lng: 67.0011, address: 'Delivery Hub (Karachi)' },
            'Delivered': cargo.destinationLocation
        };

        if (cargoStatusLocs[status]) {
            cargo.currentLocation = cargoStatusLocs[status];
        }

        // Recalculate ETA
        const { calculateSmartETA } = require('../services/trackingService');
        const smartETA = calculateSmartETA(cargo.currentLocation, cargo.destinationLocation, cargo.averageSpeed);
        cargo.estimatedArrival = smartETA.etaDate;

        await cargo.save();

        res.status(200).json({ message: "Cargo status updated successfully", cargo });
    } catch (error) {
        res.status(500).json({ message: "Error updating cargo status", error: error.message });
    }
});

// 8. Export the router (ONLY once at the end)
module.exports = router;