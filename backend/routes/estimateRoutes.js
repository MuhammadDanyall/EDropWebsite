const express = require('express');
const router = express.Router();

/**
 * @route   POST /api/estimate-cost
 * @desc    Calculate shipment cost based on distance, weight, and vehicle type
 * @access  Public
 */
router.post('/calculate', async (req, res) => {
    try {
        const { distance, weight, vehicleType } = req.body;

        // 1. Basic Validation
        if (!distance || !weight || !vehicleType) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields: distance, weight, or vehicleType." 
            });
        }

        // 2. Pricing Configuration
        const BASE_FEE = 500;
        const DIST_RATE = 50; // PKR per km
        const WEIGHT_RATE = 20; // PKR per kg base rate

        // Weight Brackets
        let bracketPremium = 0;
        if (weight > 20) bracketPremium = 600;
        else if (weight > 5) bracketPremium = 300;
        else bracketPremium = 100;

        // Vehicle Multipliers
        const VEHICLE_MULTIPLIERS = {
            'Pickup': 1.0,
            'Truck': 1.5,
            'Ship': 2.5
        };

        const multiplier = VEHICLE_MULTIPLIERS[vehicleType] || 1.0;

        // 3. AI Factor: Dynamic Surge Pricing
        const currentHour = new Date().getHours();
        let surgeFactor = 1.0;
        let aiInsight = "Market demand is currently stable.";

        // Peak Hours Simulation (5 PM to 9 PM)
        if (currentHour >= 17 && currentHour <= 21) {
            surgeFactor = 1.25;
            aiInsight = "High demand detected during peak hours. Surge pricing applied.";
        } else if (currentHour >= 0 && currentHour <= 5) {
            surgeFactor = 0.9;
            aiInsight = "Late night discount applied due to low traffic volume.";
        }

        // 4. Calculate Total
        // Formula: ((Base + (Dist * Rate) + (Weight * Rate) + BracketPremium) * Multiplier) * Surge
        const subtotal = (BASE_FEE + (distance * DIST_RATE) + (weight * WEIGHT_RATE) + bracketPremium);
        const totalCost = Math.round((subtotal * multiplier) * surgeFactor);

        res.json({
            success: true,
            data: {
                baseFee: BASE_FEE,
                subtotal,
                surgeFactor,
                multiplier,
                totalCost,
                currency: "PKR",
                aiInsight
            }
        });

    } catch (error) {
        console.error("Estimation Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;
