const express = require('express');
const router = express.Router();
const Contact = require('../models/contact');

router.post('/send', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        res.status(201).json({ message: "Your message has been received! We will contact you soon. " });
    } catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
});

module.exports = router;