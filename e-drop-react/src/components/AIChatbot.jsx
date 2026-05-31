import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', text: 'Hello! I am your E-Drop Assistant. Main apki kia madad kar sakta hoon?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMessage = { role: 'user', text: message };
        setChatHistory(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            const historyForGemini = chatHistory
                .filter((msg, idx) => !(idx === 0 && msg.role === 'model'))
                .map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.text }]
                }));

            const res = await axios.post(`${API_BASE_URL}/api/chatbot/chat`, {
                message: message,
                history: historyForGemini
            });

            setChatHistory(prev => [...prev, { role: 'model', text: res.data.reply }]);
        } catch (error) {
            console.error("Full Chat Error:", error);
            const errorMsg = error.response?.data?.reply || "Connection to AI server failed. Please ensure the backend is running.";
            setChatHistory(prev => [...prev, { role: 'model', text: errorMsg }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatbot-container">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`chatbot-toggle-btn ${isOpen ? 'open' : ''}`}
                aria-label="Toggle chat"
            >
                {isOpen ? (
                    <i className="fas fa-times"></i>
                ) : (
                    <i className="fas fa-headset"></i>
                )}
            </button>

            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-header-icon">
                            <i className="fas fa-robot"></i>
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <div className="chatbot-header-title">E-Drop Support</div>
                            <div className="chatbot-header-status">
                                <span className="chatbot-status-dot"></span>
                                <span style={{ animation: 'pulse 2s infinite' }}>Online</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="chatbot-close-btn"
                            aria-label="Close chat"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div className="chatbot-messages-area" ref={scrollRef}>
                        {chatHistory.map((msg, index) => (
                            <div key={index} className={`chatbot-message-row ${msg.role === 'user' ? 'user-row' : 'model-row'}`}>
                                {msg.role === 'model' && (
                                    <div className="chatbot-avatar">
                                        <i className="fas fa-robot"></i>
                                    </div>
                                )}
                                <div className={`chatbot-message-bubble ${msg.role === 'user' ? 'user-bubble' : 'model-bubble'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="chatbot-message-row model-row">
                                <div className="chatbot-avatar">
                                    <i className="fas fa-robot"></i>
                                </div>
                                <div className="chatbot-message-bubble model-bubble loading-bubble">
                                    <div className="typing-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} className="chatbot-input-area">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="chatbot-input"
                        />
                        <button 
                            type="submit" 
                            className="chatbot-send-btn"
                            disabled={isLoading || !message.trim()}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
                
                .chatbot-container {
                    position: fixed;
                    bottom: 25px;
                    right: 25px;
                    z-index: 99999;
                    font-family: 'Poppins', sans-serif;
                }
                
                .chatbot-toggle-btn {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                    color: white;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(255, 107, 53, 0.45);
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    font-size: 24px;
                }
                
                .chatbot-toggle-btn:hover {
                    transform: scale(1.1);
                }
                
                .chatbot-toggle-btn.open {
                    transform: rotate(90deg) scale(0.9);
                }
                
                .chatbot-toggle-btn.open:hover {
                    transform: rotate(90deg) scale(0.95);
                }
                
                .chatbot-window {
                    position: absolute;
                    bottom: 80px;
                    right: 0;
                    width: 380px;
                    height: 550px;
                    background-color: #ffffff;
                    border-radius: 24px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    border: 1px solid rgba(0,0,0,0.06);
                    z-index: 100000;
                    animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .chatbot-header {
                    padding: 18px 22px;
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }
                
                .chatbot-header-icon {
                    width: 42px;
                    height: 42px;
                    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    font-size: 18px;
                }
                
                .chatbot-header-title {
                    font-weight: 700;
                    font-size: 15px;
                    margin-bottom: 2px;
                }
                
                .chatbot-header-status {
                    font-size: 11px;
                    color: rgba(255,255,255,0.7);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .chatbot-status-dot {
                    width: 8px;
                    height: 8px;
                    background-color: #4ade80;
                    border-radius: 50%;
                    box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
                }
                
                .chatbot-close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    padding: 5px;
                    border-radius: 50%;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    width: 32px;
                    height: 32px;
                }
                
                .chatbot-close-btn:hover {
                    background: rgba(255,255,255,0.1);
                }
                
                .chatbot-messages-area {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    background-color: #fafbfc;
                }
                
                .chatbot-message-row {
                    display: flex;
                    width: 100%;
                    align-items: flex-end;
                }
                
                .chatbot-message-row.user-row {
                    justify-content: flex-end;
                }
                
                .chatbot-message-row.model-row {
                    justify-content: flex-start;
                }
                
                .chatbot-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    margin-right: 10px;
                    flex-shrink: 0;
                }
                
                .chatbot-avatar i {
                    font-size: 14px;
                    color: white;
                }
                
                .chatbot-message-bubble {
                    max-width: 78%;
                    padding: 12px 16px;
                    border-radius: 18px;
                    font-size: 14px;
                    line-height: 1.5;
                    word-wrap: break-word;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                
                .chatbot-message-bubble.user-bubble {
                    background-color: #ff6b35;
                    color: #ffffff;
                    border-bottom-right-radius: 4px;
                }
                
                .chatbot-message-bubble.model-bubble {
                    background-color: #ffffff;
                    color: #333333;
                    border-bottom-left-radius: 4px;
                }
                
                .chatbot-message-bubble.loading-bubble {
                    padding: 15px 18px;
                }
                
                .chatbot-input-area {
                    padding: 16px;
                    background-color: white;
                    display: flex;
                    gap: 12px;
                    border-top: 1px solid #f0f0f0;
                    align-items: center;
                }
                
                .chatbot-input {
                    flex: 1;
                    padding: 14px 18px;
                    background-color: #f5f7fa;
                    border: 1px solid #e9ecef;
                    border-radius: 50px;
                    outline: none;
                    font-size: 14px;
                    transition: all 0.3s ease;
                }
                
                .chatbot-input:focus {
                    border-color: #ff6b35;
                    background-color: #ffffff;
                    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
                }
                
                .chatbot-send-btn {
                    background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 48px;
                    height: 48px;
                    cursor: pointer;
                    font-size: 16px;
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);
                    flex-shrink: 0;
                }
                
                .chatbot-send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    box-shadow: none;
                }
                
                .chatbot-send-btn:not(:disabled):hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(255, 107, 53, 0.4);
                }
                
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                .typing-dots { display: flex; gap: 4px; }
                .typing-dots span {
                    width: 8px; height: 8px; background: #999; border-radius: 50%;
                    animation: bounce 1.2s infinite ease-in-out;
                }
                .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
                .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

                /* Full Responsiveness on screens <= 576px */
                @media (max-width: 576px) {
                    .chatbot-container {
                        bottom: 15px;
                        right: 15px;
                    }
                    
                    .chatbot-toggle-btn {
                        width: 50px;
                        height: 50px;
                        font-size: 20px;
                        box-shadow: 0 6px 20px rgba(255, 107, 53, 0.35);
                    }
                    
                    .chatbot-window {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        width: 100vw;
                        height: 100vh;
                        height: 100dvh;
                        border-radius: 0;
                        border: none;
                        box-shadow: none;
                        z-index: 999999;
                        animation: slideUpMobile 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    
                    .chatbot-header {
                        padding: calc(15px + env(safe-area-inset-top, 0px)) 18px 15px 18px;
                    }
                    
                    .chatbot-messages-area {
                        padding: 15px;
                        gap: 12px;
                    }
                    
                    .chatbot-message-bubble {
                        max-width: 85%;
                        padding: 10px 14px;
                        font-size: 13.5px;
                    }
                    
                    .chatbot-input-area {
                        padding: 12px 14px calc(12px + env(safe-area-inset-bottom, 0px)) 14px;
                        gap: 8px;
                    }
                    
                    .chatbot-input {
                        padding: 12px 16px;
                        font-size: 16px; /* Avoid iOS auto-zoom */
                    }
                    
                    .chatbot-send-btn {
                        width: 42px;
                        height: 42px;
                        font-size: 14px;
                    }
                }
                
                @keyframes slideUpMobile {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AIChatbot;
