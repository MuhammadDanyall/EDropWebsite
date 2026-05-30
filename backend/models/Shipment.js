const mongoose = require('mongoose');

const ShipmentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    originCountry: {
        type: String,
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    destinationCity: {
        type: String,
        required: true
    },
    preferredPort: {
        type: String,
        required: true
    },
    shippingType: {
        type: String,
        required: true
    },
    notes: {
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
    flagged: {
        type: Boolean,
        default: false
    },
    fraudReason: {
        type: String
    },
    // Smart Tracking Fields
    currentLocation: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    destinationLocation: {
        lat: { type: Number },
        lng: { type: Number },
        address: { type: String }
    },
    estimatedArrival: {
        type: Date
    },
    averageSpeed: {
        type: Number,
        default: 60 // km/h
    }
}, { timestamps: true });

module.exports = mongoose.model('Shipment', ShipmentSchema);
