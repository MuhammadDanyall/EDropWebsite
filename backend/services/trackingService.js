/**
 * Smart Tracking Logic
 * Calculates dynamic ETA based on distance, speed, and simulated external factors.
 */

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
};

const calculateSmartETA = (currentPos, destPos, avgSpeed) => {
    const distance = calculateDistance(currentPos.lat, currentPos.lng, destPos.lat, destPos.lng);
    
    // AI-like Simulation Logic:
    // Factors in random traffic/weather delays (5% to 30% extra time)
    const delayFactor = 1 + (Math.random() * 0.25 + 0.05); 
    
    const hours = (distance / avgSpeed) * delayFactor;
    const etaMs = Date.now() + (hours * 60 * 60 * 1000);
    
    return {
        distance: distance.toFixed(2),
        etaDate: new Date(etaMs),
        delayPercentage: ((delayFactor - 1) * 100).toFixed(1)
    };
};

module.exports = {
    calculateSmartETA,
    calculateDistance
};
