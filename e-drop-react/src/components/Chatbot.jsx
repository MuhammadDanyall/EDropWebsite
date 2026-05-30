import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm E-DROP's AI assistant. How can I help you today?", sender: 'bot', time: new Date().toLocaleTimeString() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [showBadge, setShowBadge] = useState(false);
    const messagesEndRef = useRef(null);

    const responses = {
        services: ["E-DROP offers: E-CAB, E-Shipping, E-Cargo, and Warehousing. Which interests you most?"],
        pricing: ["Our pricing depends on service type, distance, and weight. Contact us at 0925-681111 for a quote."],
        contact: ["You can reach us at 0925-681111, info@edrop.com, or visit Sadar Bazar, Peshawar, KPK."],
        tracking: ["Track your shipment at www.edrop.com/tracking or via our mobile app."],
        bye: ["Thank you for choosing E-DROP! Have a great day! 👋"]
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (text) => {
        const msg = text || inputValue.trim();
        if (!msg) return;

        setMessages(prev => [...prev, { text: msg, sender: 'user', time: new Date().toLocaleTimeString() }]);
        setInputValue('');

        setTimeout(() => {
            const botResponse = generateBotResponse(msg);
            setMessages(prev => [...prev, { text: botResponse, sender: 'bot', time: new Date().toLocaleTimeString() }]);
            if (!isOpen) setShowBadge(true);
        }, 1000);
    };

    const generateBotResponse = (userMsg) => {
        const msg = userMsg.toLowerCase();
        if (msg.includes('service')) return responses.services[0];
        if (msg.includes('price') || msg.includes('cost')) return responses.pricing[0];
        if (msg.includes('contact')) return responses.contact[0];
        if (msg.includes('track')) return responses.tracking[0];
        if (msg.includes('bye') || msg.includes('thanks')) return responses.bye[0];
        return "I can help with services, pricing, tracking, and contact. What would you like to know?";
    };

    return (
        <div id="edrop-chatbot" className="edrop-chatbot" style={{ position: 'fixed', bottom: '20px', right: '24px', zIndex: 1000 }}>
            {/* Simple Inline Styles for design fidelity */}
            <style>{`
                .chatbot-toggle {
                    width: 60px; height: 60px;
                    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                    border-radius: 50%; display: flex; align-items: center; justify-content: center;
                    cursor: pointer; box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3);
                    color: white; font-size: 24px; position: relative;
                }
                .chatbot-window {
                    position: absolute; bottom: 80px; right: 0;
                    width: 350px; height: 500px; background: white;
                    border-radius: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                    display: flex; flex-direction: column; overflow: hidden;
                }
                .chatbot-header {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    color: white; padding: 15px 20px;
                    display: flex; align-items: center; justify-content: space-between;
                }
                .chatbot-messages { flex: 1; padding: 15px; overflow-y: auto; background: #f8f9fa; }
                .message { display: flex; margin-bottom: 15px; }
                .bot-message { flex-direction: row; }
                .user-message { flex-direction: row-reverse; }
                .message-text {
                    background: white; padding: 10px 15px; border-radius: 18px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1); max-width: 80%;
                }
                .user-message .message-text { background: #007bff; color: white; }
                .chatbot-input-area { padding: 15px; background: white; border-top: 1px solid #dee2e6; display: flex; gap: 10px; }
                #chatbot-input { flex: 1; padding: 10px 15px; border: 1px solid #dee2e6; border-radius: 25px; outline: none; }
            `}</style>

            <div className="chatbot-toggle" onClick={() => { setIsOpen(!isOpen); setShowBadge(false); }}>
                <i className="fas fa-robot"></i>
                {showBadge && <span className="notification-badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#dc3545', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>1</span>}
            </div>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-info">
                            <span className="chatbot-name">E-DROP Assistant</span>
                        </div>
                        <button className="chatbot-close" onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`message ${m.sender}-message`}>
                                <div className="message-text">{m.text}</div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chatbot-input-area">
                        <input 
                            type="text" 
                            id="chatbot-input" 
                            placeholder="Type your message..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button onClick={() => handleSend()} style={{ background: '#ff6b35', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}>
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
