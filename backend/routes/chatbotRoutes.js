const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_INSTRUCTION = `
You are the E-Drop Official Assistant. You are professional, helpful, and concise.

CORE RULES:
1. Multilingual Support: Understand and respond in both English and Roman Urdu (e.g., "Main apki kia madad kar sakta hoon?").
2. Order Tracking: If a user asks about an order, ask for their Order ID. If they provide an ID like "TI-123" or "ECA-123", simulate a lookup and tell them: "Your order is currently in transit and expected to arrive in 2 days."
3. Dynamic Pricing: If asked about rates, explain that:
   - Base Rate: 500 PKR
   - Distance: 50 PKR per KM
   - Weight: 20 PKR per KG
   - Multipliers: Truck (1.5x), Ship (2.5x).
4. Booking: Remind users that booking is ONLY available on the E-Drop Mobile App, not the website.
5. Complaints: If a user mentions "delayed", "damaged", or "complaint", ask for details (Order ID, issue description) and tell them "I have filed a support ticket. Our team will contact you within 24 hours."
6. Contact Information: If the user asks for E-Drop's contact number, email address, or office location, provide the following:
   - Phone/Contact Number: +92 321-125687
   - Email Address: info@edrop.com
   - Office Location: Sadar Bazar, Peshawar, KPK
7. Restrictions: Do not answer questions about politics, sports, or anything unrelated to logistics. If asked, say "I can only assist with E-Drop logistics services."
`;

router.post('/chat', async (req, res) => {
    console.log("Chatbot Request Received:", req.body.message);
    const { message, history } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Loaded GEMINI_API_KEY:", apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND");

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY' || apiKey.includes('YOUR_GEMINI_API_KEY')) {
        console.log("Chatbot Error: Gemini API Key is missing or using placeholder.");
        return res.json({ 
            reply: "AI Assistant is currently offline (API Key missing). Please add your key to the .env file.",
            error: "Missing API Key" 
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-3.1-flash-lite",
            systemInstruction: SYSTEM_INSTRUCTION
        });

        // For older models we included system instructions in history, but we still handle chat messages here
        let chatMessages = history || [];
        if (chatMessages.length === 0) {
            chatMessages.push({
                role: 'user',
                parts: [{ text: "SYSTEM INSTRUCTION: " + SYSTEM_INSTRUCTION + " \n\n Please acknowledge these instructions and wait for my first message." }]
            });
            chatMessages.push({
                role: 'model',
                parts: [{ text: "Understood. I am the E-Drop Official Assistant. I will assist you with logistics, tracking, and complaints in English and Roman Urdu. I will ask for Order IDs for tracking and remind users that booking is only on the mobile app. I will avoid off-topic subjects. How can I help you today?" }]
            });
        }

        const chat = model.startChat({
            history: chatMessages,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Chatbot Gemini Error:", error.message);
        res.status(500).json({ 
            reply: "Sorry, I'm having trouble connecting to my brain right now. " + error.message,
            error: error.message 
        });
    }
});

module.exports = router;
