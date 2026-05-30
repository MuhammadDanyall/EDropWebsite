const requestLog = new Map();

/**
 * Fraud Detection Middleware
 * Performs rate limiting, pattern matching, and logical consistency checks.
 */
const fraudDetection = (req, res, next) => {
    const ip = req.ip;
    const userId = req.body.userId || 'anonymous';
    const key = `${ip}-${userId}`;
    const now = Date.now();

    // Check 1: Rate Limiting (Max 3 shipment/cargo requests per minute)
    if (!requestLog.has(key)) {
        requestLog.set(key, []);
    }
    let timestamps = requestLog.get(key).filter(t => now - t < 60000);
    timestamps.push(now);
    requestLog.set(key, timestamps);

    if (timestamps.length > 3) {
        return res.status(400).json({ 
            message: "Your request looks suspicious. Please provide valid details.",
            error: "Rate limit exceeded. Too many requests from this user/IP."
        });
    }

    // Extract fields to check
    const { 
        fullName, senderName, receiverName, 
        pickupLocation, deliveryAddress, 
        category, itemType, cargoType, 
        weight 
    } = req.body;
    
    const nameToCheck = fullName || senderName || receiverName || "";
    const addressToCheck = pickupLocation || deliveryAddress || "";
    const typeToCheck = category || itemType || cargoType || "";

    let isSuspicious = false;
    let reason = "";

    // Check 2: Pattern Matching (Repeating characters like 'aaaaa')
    const repeatingCharsRegex = /(.)\1{4,}/; 
    if (repeatingCharsRegex.test(nameToCheck) || repeatingCharsRegex.test(addressToCheck)) {
        isSuspicious = true;
        reason = "Repeating characters detected in name or address.";
    }

    if (isSuspicious) {
        // Mark the request as flagged so the route handler can save it and then return 400
        req.fraudFlagged = true;
        req.fraudReason = reason;
    }

    next();
};

module.exports = fraudDetection;
