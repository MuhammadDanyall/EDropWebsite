const express = require('express');
const router = express.Router();
const Shipment = require('../models/Shipment');
const fraudDetection = require('../middleware/fraudDetection');

// Helper function to generate sequential tracking ID like TI-0001
const generateTrackingID = async () => {
    try {
        // Find the latest shipment to get the current highest tracking ID
        const lastShipment = await Shipment.findOne().sort({ createdAt: -1 });
        
        let nextNumber = 1;
        
        if (lastShipment && lastShipment.trackingID) {
            // Extract the numeric part from IDs like "TI-0005"
            const match = lastShipment.trackingID.match(/TI-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        
        // Format the number with leading zeros (e.g., 0001)
        const paddedNumber = String(nextNumber).padStart(4, '0');
        return `TI-${paddedNumber}`;
    } catch (error) {
        console.error('Error generating tracking ID:', error);
        throw error;
    }
};

// @route   POST /api/shipments/add
// @desc    Add a new shipment and generate tracking ID
router.post('/add', fraudDetection, async (req, res) => {
    try {
        const shipmentData = req.body;
        
        // Validation: Quantity must be greater than 0
        if (!shipmentData.quantity || parseInt(shipmentData.quantity) <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 0.'
            });
        }

        // Generate a unique sequential tracking ID
        const trackingID = await generateTrackingID();

        const newShipment = new Shipment({
            ...shipmentData,
            trackingID,
            status: 'Order Submitted',
            flagged: req.fraudFlagged || false,
            fraudReason: req.fraudReason || null
        });

        await newShipment.save();

        if (req.fraudFlagged) {
            return res.status(400).json({
                success: false,
                message: 'Your request looks suspicious. Please provide valid details.',
                reason: req.fraudReason
            });
        }

        res.status(201).json({
            success: true,
            message: 'Shipment added successfully!',
            trackingID: newShipment.trackingID,
            shipment: newShipment
        });
    } catch (err) {
        console.error('Error adding shipment:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while adding shipment.',
            error: err.message
        });
    }
});

// @route   GET /api/shipments/track/:id
// @desc    Get shipment details by tracking ID
router.get('/track/:id', async (req, res) => {
    try {
        const trackingID = req.params.id.toUpperCase();
        const shipment = await Shipment.findOne({ trackingID });

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found with this tracking ID.'
            });
        }

        res.status(200).json({
            success: true,
            shipment
        });
    } catch (err) {
        console.error('Error tracking shipment:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching shipment.',
            error: err.message
        });
    }
});

const { calculateSmartETA } = require('../services/trackingService');

// ... (existing code)

// @route   PATCH /api/shipments/update-location/:trackingID
// @desc    Update current location and recalculate smart ETA
router.patch('/update-location/:trackingID', async (req, res) => {
    try {
        const { lat, lng, address } = req.body;
        const trackingID = req.params.trackingID.toUpperCase();

        const shipment = await Shipment.findOne({ trackingID });
        if (!shipment) return res.status(404).json({ message: "Shipment not found" });

        // If destination is not set, we can't calculate ETA properly
        // For demo purposes, we'll assume a fixed destination if none exists
        const dest = shipment.destinationLocation.lat 
            ? shipment.destinationLocation 
            : { lat: 24.8607, lng: 67.0011, address: 'Karachi Port' }; // Default Karachi Port

        const smartETA = calculateSmartETA({ lat, lng }, dest, shipment.averageSpeed);

        // Update Shipment in DB
        shipment.currentLocation = { lat, lng, address };
        shipment.estimatedArrival = smartETA.etaDate;
        await shipment.save();

        res.status(200).json({
            success: true,
            message: "Location updated and ETA recalculated",
            data: {
                currentLocation: shipment.currentLocation,
                estimatedArrival: shipment.estimatedArrival,
                distanceRemaining: smartETA.distance,
                delayFactor: smartETA.delayPercentage
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
