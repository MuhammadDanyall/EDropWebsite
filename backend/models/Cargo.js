const mongoose = require('mongoose');

const CargoSchema = new mongoose.Schema({
    senderName: {
        type: String,
        required: true,
        trim: true
    },
    senderEmail: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    senderPhone: {
        type: String,
        required: true
    },
    receiverName: {
        type: String,
        required: true,
        trim: true
    },
    receiverPhone: {
        type: String,
        required: true
    },
    destinationCity: {
        type: String,
        required: true
    },
    deliveryAddress: {
        type: String,
        required: true
    },
    linkedTrackingID: {
        type: String,
        trim: true
    },
    cargoType: {
        type: String,
        required: true
    },
    deliveryPriority: {
        type: String,
        required: true
    },
    specialInstructions: {
        type: String
    },
    trackingID: {
        type: String,
        required: true,
        unique: true
    },
    status: {
        type: String,
        default: 'Order Submitted'
    },
    timeline: {
        booked: { type: Date, default: Date.now },
        picked: { type: Date },
        transit: { type: Date },
        delivered: { type: Date }
    },
    currentLocation: {
        lat: { type: Number, default: 33.6844 }, // Default Islamabad
        lng: { type: Number, default: 73.0479 },
        address: { type: String, default: 'Warehouse' }
    },
    destinationLocation: {
        lat: { type: Number, default: 24.8607 }, // Default Karachi
        lng: { type: Number, default: 67.0011 },
        address: { type: String, default: 'Destination' }
    },
    estimatedArrival: {
        type: Date
    },
    averageSpeed: {
        type: Number,
        default: 50 // km/h for trucks
    },
    flagged: {
        type: Boolean,
        default: false
    },
    fraudReason: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Cargo', CargoSchema);
