const express = require('express');
const router = express.Router();
const Cargo = require('../models/Cargo');
const fraudDetection = require('../middleware/fraudDetection');

// Helper function to generate sequential tracking ID like EC-0001
const generateCargoTrackingID = async () => {
    try {
        const lastCargo = await Cargo.findOne().sort({ createdAt: -1 });
        let nextNumber = 1;
        
        if (lastCargo && lastCargo.trackingID) {
            const match = lastCargo.trackingID.match(/EC-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        
        const paddedNumber = String(nextNumber).padStart(4, '0');
        return `EC-${paddedNumber}`;
    } catch (error) {
        console.error('Error generating cargo tracking ID:', error);
        throw error;
    }
};

// @route   POST /api/cargo/add
// @desc    Add a new cargo order
router.post('/add', fraudDetection, async (req, res) => {
    try {
        const cargoData = req.body;
        const trackingID = await generateCargoTrackingID();

        const newCargo = new Cargo({
            ...cargoData,
            trackingID,
            status: 'Order Submitted',
            flagged: req.fraudFlagged || false,
            fraudReason: req.fraudReason || null
        });

        await newCargo.save();

        if (req.fraudFlagged) {
            return res.status(400).json({
                success: false,
                message: 'Your request looks suspicious. Please provide valid details.',
                reason: req.fraudReason
            });
        }

        res.status(201).json({
            success: true,
            message: 'Cargo order submitted successfully!',
            trackingID: newCargo.trackingID,
            cargo: newCargo
        });
    } catch (err) {
        console.error('Error adding cargo:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while booking cargo.',
            error: err.message
        });
    }
});

// @route   GET /api/cargo/track/:id
// @desc    Get cargo details by tracking ID
router.get('/track/:id', async (req, res) => {
    try {
        const trackingID = req.params.id.toUpperCase();
        const cargo = await Cargo.findOne({ trackingID });

        if (!cargo) {
            return res.status(404).json({
                success: false,
                message: 'Cargo not found with this tracking ID.'
            });
        }

        res.status(200).json({
            success: true,
            cargo
        });
    } catch (err) {
        console.error('Error tracking cargo:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching cargo.',
            error: err.message
        });
    }
});

module.exports = router;
