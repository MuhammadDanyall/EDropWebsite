import React, { useState, useEffect } from 'react';
import '../styles/paymentModal.css';

const PaymentModal = ({ isOpen, onClose, onSuccess, amount = 5000, paymentFor = "Order" }) => {
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [verificationStatus, setVerificationStatus] = useState('idle'); // 'idle', 'verifying', 'success'
    
    // Form State
    const [transactionId, setTransactionId] = useState('');
    const [fileName, setFileName] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setVerificationStatus('idle');
            setPaymentMethod('bank');
            setTransactionId('');
            setFileName('');
        }
    }, [isOpen]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    };

    const handlePayment = (e) => {
        e.preventDefault();
        
        if (!transactionId || !fileName) {
            alert("Please provide BOTH a Transaction ID and upload a payment screenshot for verification.");
            return;
        }

        setVerificationStatus('verifying');

        // Simulate admin/system verification delay (4 seconds)
        setTimeout(() => {
            setVerificationStatus('success');
            
            // Wait a moment before closing and triggering success callback
            setTimeout(() => {
                onSuccess();
            }, 1500);
        }, 4000);
    };

    const getAccountDetails = () => {
        switch(paymentMethod) {
            case 'bank':
                return {
                    title: "E-Drop Logistics",
                    number: "0123 4567 8910 1112",
                    bank: "Meezan Bank"
                };
            case 'easypaisa':
                return {
                    title: "E-Drop Logistics",
                    number: "0300 1234567",
                    bank: "EasyPaisa"
                };
            case 'jazzcash':
                return {
                    title: "E-Drop Logistics",
                    number: "0300 7654321",
                    bank: "JazzCash"
                };
            default:
                return {};
        }
    };

    const account = getAccountDetails();

    if (!isOpen) return null;

    return (
        <div className="payment-modal-overlay">
            <div className={`payment-modal-container ${verificationStatus === 'success' ? 'success-state' : ''}`}>
                <button className="payment-close-btn" onClick={onClose} disabled={verificationStatus !== 'idle'}>
                    <i className="fas fa-times"></i>
                </button>

                {verificationStatus === 'idle' && (
                    <>
                        <div className="payment-header">
                            <h2>Verify Payment</h2>
                            <p>Please send your payment to our account and submit the proof for verification.</p>
                            <div className="payment-amount">
                                <span>Total to Pay</span>
                                <h3>Rs. {amount.toLocaleString()}</h3>
                            </div>
                        </div>

                        <div className="payment-methods">
                            <button 
                                className={`method-btn ${paymentMethod === 'bank' ? 'active' : ''}`}
                                type="button"
                                onClick={() => setPaymentMethod('bank')}
                            >
                                <i className="fas fa-university"></i> Bank
                            </button>
                            <button 
                                className={`method-btn ${paymentMethod === 'easypaisa' ? 'active' : ''}`}
                                type="button"
                                onClick={() => setPaymentMethod('easypaisa')}
                            >
                                <i className="fas fa-mobile-alt"></i> EasyPaisa
                            </button>
                            <button 
                                className={`method-btn ${paymentMethod === 'jazzcash' ? 'active' : ''}`}
                                type="button"
                                onClick={() => setPaymentMethod('jazzcash')}
                            >
                                <i className="fas fa-wallet"></i> JazzCash
                            </button>
                        </div>

                        <div className="account-details-box">
                            <h4>Send Payment To:</h4>
                            <div className="detail-row">
                                <span>{paymentMethod === 'bank' ? 'Bank Name' : 'Wallet'}:</span>
                                <strong>{account.bank}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Account Title:</span>
                                <strong>{account.title}</strong>
                            </div>
                            <div className="detail-row">
                                <span>Account Number:</span>
                                <strong>{account.number}</strong>
                            </div>
                        </div>

                        <form onSubmit={handlePayment} className="payment-form">
                            <div className="manual-verification-section">
                                <div className="form-group">
                                    <label>Transaction ID (TID)</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. 123456789012" 
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                    />
                                </div>
                                <div className="divider-text">OR</div>
                                <div className="form-group">
                                    <label>Upload Screenshot</label>
                                    <div className="file-upload-wrapper">
                                        <input 
                                            type="file" 
                                            id="payment-screenshot" 
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="file-input-hidden"
                                        />
                                        <label htmlFor="payment-screenshot" className="file-upload-btn">
                                            <i className="fas fa-cloud-upload-alt"></i> {fileName ? 'Change Screenshot' : 'Choose File'}
                                        </label>
                                        <span className="file-name">{fileName || 'No file chosen'}</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="payment-submit-btn"
                            >
                                <span><i className="fas fa-check-circle"></i> Submit for Verification</span>
                            </button>
                        </form>
                    </>
                )}

                {verificationStatus === 'verifying' && (
                    <div className="verification-loading-state">
                        <div className="pulse-loader">
                            <div className="pulse-circle"></div>
                            <i className="fas fa-shield-alt shield-icon"></i>
                        </div>
                        <h3>Verifying Transaction</h3>
                        <p>Our system is checking your transaction details. This usually takes a few moments.</p>
                        <div className="verification-progress">
                            <div className="progress-bar-inner animate-progress"></div>
                        </div>
                    </div>
                )}

                {verificationStatus === 'success' && (
                    <div className="payment-success-animation">
                        <div className="success-checkmark">
                            <div className="check-icon">
                                <span className="icon-line line-tip"></span>
                                <span className="icon-line line-long"></span>
                                <div className="icon-circle"></div>
                                <div className="icon-fix"></div>
                            </div>
                        </div>
                        <h3>Payment Verified!</h3>
                        <p>Your transaction has been confirmed. Submitting your {paymentFor.toLowerCase()} now...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentModal;
