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
        <div style={styles.container}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                style={{
                    ...styles.toggleBtn,
                    transform: isOpen ? 'rotate(90deg) scale(0.9)' : 'rotate(0deg) scale(1)'
                }}
                onMouseEnter={(e) => e.target.style.transform = isOpen ? 'rotate(90deg) scale(0.95)' : 'scale(1.1)'}
                onMouseLeave={(e) => e.target.style.transform = isOpen ? 'rotate(90deg) scale(0.9)' : 'scale(1)'}
            >
                {isOpen ? (
                    <i className="fas fa-times"></i>
                ) : (
                    <i className="fas fa-headset"></i>
                )}
            </button>

            {isOpen && (
                <div style={styles.window}>
                    <div style={styles.header}>
                        <div style={styles.headerIcon}>
                            <i className="fas fa-robot"></i>
                        </div>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <div style={styles.headerTitle}>E-Drop Support</div>
                            <div style={styles.headerStatus}>
                                <span style={styles.statusDot}></span>
                                <span style={{ animation: 'pulse 2s infinite' }}>Online</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                fontSize: '18px',
                                cursor: 'pointer',
                                padding: '5px',
                                borderRadius: '50%',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <div style={styles.messagesArea} ref={scrollRef}>
                        {chatHistory.map((msg, index) => (
                            <div key={index} style={{
                                ...styles.messageRow,
                                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                            }}>
                                {msg.role === 'model' && (
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '10px',
                                        flexShrink: 0
                                    }}>
                                        <i className="fas fa-robot" style={{ fontSize: '14px', color: 'white' }}></i>
                                    </div>
                                )}
                                <div style={{
                                    ...styles.messageBubble,
                                    backgroundColor: msg.role === 'user' ? '#ff6b35' : '#ffffff',
                                    color: msg.role === 'user' ? '#ffffff' : '#333333',
                                    borderBottomLeftRadius: msg.role === 'model' ? '4px' : '18px',
                                    borderBottomRightRadius: msg.role === 'user' ? '4px' : '18px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                }}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '10px',
                                    flexShrink: 0
                                }}>
                                    <i className="fas fa-robot" style={{ fontSize: '14px', color: 'white' }}></i>
                                </div>
                                <div style={{ ...styles.messageBubble, backgroundColor: '#ffffff', padding: '15px 18px' }}>
                                    <div className="typing-dots">
                                        <span></span><span></span><span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSend} style={styles.inputArea}>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type your message..."
                            style={styles.input}
                        />
                        <button 
                            type="submit" 
                            style={{
                                ...styles.sendBtn,
                                opacity: isLoading || !message.trim() ? 0.5 : 1,
                                cursor: isLoading || !message.trim() ? 'not-allowed' : 'pointer'
                            }} 
                            disabled={isLoading || !message.trim()}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            )}

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
                .typing-dots { display: flex; gap: 4px; }
                .typing-dots span {
                    width: 8px; height: 8px; background: #999; border-radius: 50%;
                    animation: bounce 1.2s infinite ease-in-out;
                }
                .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
                .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
            `}</style>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        bottom: '25px',
        right: '25px',
        zIndex: 99999,
        fontFamily: "'Poppins', sans-serif"
    },
    toggleBtn: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 8px 25px rgba(255, 107, 53, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '24px'
    },
    window: {
        position: 'absolute',
        bottom: '80px',
        right: '0',
        width: '380px',
        height: '550px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.06)'
    },
    header: {
        padding: '18px 22px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '14px'
    },
    headerIcon: {
        width: '42px',
        height: '42px',
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px'
    },
    headerTitle: {
        fontWeight: '700',
        fontSize: '15px',
        marginBottom: '2px'
    },
    headerStatus: {
        fontSize: '11px',
        color: 'rgba(255,255,255,0.7)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    statusDot: {
        width: '8px',
        height: '8px',
        backgroundColor: '#4ade80',
        borderRadius: '50%',
        boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)'
    },
    messagesArea: {
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: '#fafbfc'
    },
    messageRow: {
        display: 'flex',
        width: '100%',
        alignItems: 'flex-end'
    },
    messageBubble: {
        maxWidth: '78%',
        padding: '12px 16px',
        borderRadius: '18px',
        fontSize: '14px',
        lineHeight: '1.5',
        wordWrap: 'break-word'
    },
    inputArea: {
        padding: '16px',
        backgroundColor: 'white',
        display: 'flex',
        gap: '12px',
        borderTop: '1px solid #f0f0f0'
    },
    input: {
        flex: 1,
        padding: '14px 18px',
        backgroundColor: '#f5f7fa',
        border: '1px solid #e9ecef',
        borderRadius: '50px',
        outline: 'none',
        fontSize: '14px',
        transition: 'border-color 0.3s, box-shadow 0.3s'
    },
    sendBtn: {
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        cursor: 'pointer',
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
    }
};

export default AIChatbot;
