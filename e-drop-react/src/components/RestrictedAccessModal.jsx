import React from 'react';

const RestrictedAccessModal = ({ isOpen, onClose, onLoginClick }) => {
    if (!isOpen) return null;

    return (
        <div className="auth-alert-overlay" onClick={onClose}>
            <div className="auth-alert-card animate-pop-in" onClick={(e) => e.stopPropagation()}>
                <div className="auth-alert-icon">
                    <i className="fas fa-lock"></i>
                </div>
                <h3>Login Required</h3>
                <p>Please login first to access this feature. If you don't have an account, please sign up and login to continue.</p>
                <div className="auth-alert-actions">
                    <button className="auth-alert-btn secondary" onClick={onClose}>Later</button>
                    <button className="auth-alert-btn primary" onClick={() => {
                        onClose();
                        onLoginClick('login');
                    }}>Login Now</button>
                </div>
            </div>
        </div>
    );
};

export default RestrictedAccessModal;
