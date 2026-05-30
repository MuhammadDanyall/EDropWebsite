const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');

// Middleware for Admin only PUT route
const adminAuth = (req, res, next) => {
    const role = req.header('user-role');
    if (!role || role !== 'admin') {
        return res.status(403).json({ message: "Access Denied: Admins Only" });
    }
    next();
};

// 1. GET Website Content (Public)
router.get('/', async (req, res) => {
    try {
        console.log("Fetching site content...");
        let content = await SiteContent.findOne();
        // Fallback: If no document exists, create it with default values
        if (!content) {
            console.log("No content found, creating default SiteContent document...");
            content = await SiteContent.create({});
        }
        res.status(200).json(content);
    } catch (err) {
        console.error("CRITICAL CONTENT ERROR:", err);
        res.status(500).json({ 
            message: "Error fetching content", 
            error: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
        });
    }
});

// 2. PUT Website Content (Admin Only)
router.put('/', adminAuth, async (req, res) => {
    try {
        let content = await SiteContent.findOne();
        if (!content) {
            content = new SiteContent(req.body);
            await content.save();
        } else {
            content = await SiteContent.findByIdAndUpdate(content._id, req.body, { new: true });
        }
        res.status(200).json({ message: "Content updated successfully!", content });
    } catch (err) {
        res.status(500).json({ message: "Error updating content", error: err.message });
    }
});

module.exports = router;
