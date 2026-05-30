const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const { body, validationResult } = require('express-validator');

// 1. Global Security Headers using Helmet
const securityHeaders = helmet();

// 2. Advanced Rate Limiting
// Global Rate Limiter: 5000 requests per 15 minutes (Relaxed for admin/user usage)
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    message: { message: "Too many requests from this IP, please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth & Admin Rate Limiter: 500 requests per 10 minutes
const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 500,
    message: { message: "Too many login/signup attempts. Please try again after 10 minutes." },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. AI-Based Threat Detection (Heuristic/Pattern Analysis)
const threatLog = new Map(); // Simple in-memory log (IP -> {count, lastRequest})

const aiThreatDetection = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    // Pattern detection for SQLi and XSS
    const suspiciousPatterns = [
        /<script.*?>/i, /javascript:/i, /onload=/i, /onerror=/i, // XSS
        /SELECT\s+.*\s+FROM/i, /UNION\s+SELECT/i, /INSERT\s+INTO/i, /DROP\s+TABLE/i, // SQLi
        /OR\s+1=1/i, /'--/, /"\s*OR\s*"/i // More specific SQLi patterns
    ];

    const bodyString = JSON.stringify(req.body);
    const queryString = JSON.stringify(req.query);
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
        pattern.test(bodyString) || pattern.test(queryString)
    );

    if (isSuspicious) {
        console.warn(`[SECURITY ALERT] Suspicious payload detected from IP: ${ip}`);
        return res.status(403).json({ message: "Request blocked due to suspicious content detected by AI Security Layer." });
    }

    // Unusual Behavior Detection (Rapid Requests to Sensitive Routes)
    const sensitiveRoutes = ['/api/auth/login', '/api/auth/signup', '/api/admin'];
    const isSensitive = sensitiveRoutes.some(route => req.originalUrl.startsWith(route));

    if (isSensitive) {
        const stats = threatLog.get(ip) || { count: 0, lastRequest: 0 };
        
        // If requests are faster than 500ms apart
        if (now - stats.lastRequest < 500) {
            stats.count++;
        } else {
            stats.count = 0;
        }

        stats.lastRequest = now;
        threatLog.set(ip, stats);

        if (stats.count > 50) {
            console.warn(`[SECURITY ALERT] Bot-like behavior detected from IP: ${ip}`);
            return res.status(429).json({ message: "Automated behavior detected. Access restricted." });
        }
    }

    next();
};

// 4. Input Validation & Sanitization Middleware
const validateInputs = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    securityHeaders,
    globalLimiter,
    authLimiter,
    aiThreatDetection,
    validateInputs
};
