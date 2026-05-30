import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuthGate } from '../hooks/useAuthGate';
import RestrictedAccessModal from '../components/RestrictedAccessModal';
import CostEstimator from '../components/CostEstimator';
import PaymentModal from '../components/PaymentModal';
import '../styles/eship.css';
import { API_BASE_URL } from '../config';

const EShipping = ({ onAuthClick }) => {
    const { isAuthAlertOpen, setIsAuthAlertOpen, handleRestrictedClick } = useAuthGate();

    const [siteContent, setSiteContent] = useState({
        shippingHeroTitle: "TRACK AND TRACE\nWITH EASE!",
        shippingDescription: "Easily track and trace your delivery journey from dispatch to destination with E-Shipping."
    });

    // New Shipment Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        country: '',
        productName: '',
        category: '',
        value: '',
        weight: '',
        quantity: '1',
        originCountry: '',
        pickupLocation: '',
        destinationCity: '',
        preferredPort: '',
        shippingType: '',
        notes: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submissionSuccess, setSubmissionSuccess] = useState(null);
    const [formError, setFormError] = useState(null);

    // Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(5000);

    // Scroll to error when it appears
    useEffect(() => {
        if (formError) {
            const formElement = document.querySelector('.shipment-professional-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [formError]);



    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [error, setError] = useState(false);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const location = useLocation();

    // Check URL to automatically open modal
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('book') === 'true' || location.hash === '#booking-form') {
            setIsModalOpen(true);
        }
    }, [location]);

    // Mock data removed as we are now using the live API

    const handleTrack = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.get(`${API_BASE_URL}/api/shipments/track/${trackingNumber}`);
            if (res.data.success) {
                setTrackingResult(res.data.shipment);
                setError(false);
            }
        } catch (err) {
            console.error("Tracking Error:", err);
            setTrackingResult(null);
            setError(true);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        // Validation: Quantity must be greater than 0
        if (parseInt(formData.quantity) <= 0) {
            alert("Quantity must be greater than 0.");
            return;
        }

        // Calculate a dummy payment amount based on weight
        const weight = parseFloat(formData.weight) || 1;
        setPaymentAmount(Math.max(5000, weight * 450));
        
        // Open payment modal instead of submitting directly
        setIsPaymentModalOpen(true);
    };

    const executeSubmission = async () => {
        setSubmitting(true);
        setIsPaymentModalOpen(false);
        try {
            const res = await axios.post(`${API_BASE_URL}/api/shipments/add`, formData);
            if (res.data.success) {
                setSubmissionSuccess(res.data.trackingID);
                setFormData({
                    fullName: '', email: '', phone: '', country: '',
                    productName: '', category: '', value: '', weight: '', quantity: '1',
                    originCountry: '', pickupLocation: '', destinationCity: '', preferredPort: '', shippingType: '', notes: ''
                });
            }
        } catch (err) {
            console.error("Error booking shipment:", err);
            const errorMsg = err.response?.data?.message || "Error occurred while booking shipment. Please try again.";
            setFormError(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.animate-on-scroll');
            elements.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.9) {
                    el.classList.add('animate-visible');
                }
            });
        };
        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll();

        // Fetch Dynamic Content
        const fetchContent = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/content`);
                if (res.data) {
                    setSiteContent(res.data);
                }
            } catch (err) {
                console.error("Error fetching shipping content:", err);
            }
        };
        fetchContent();

        return () => window.removeEventListener('scroll', animateOnScroll);
    }, []);

    return (
        <main id="eshipping-page">
            <section className="hero-wrapper">
                <div className="hero-content">
                    <div className="container">
                        <h1>{siteContent.shippingHeroTitle.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                                {line.includes('EASE!') ? <span className="highlight">{line}</span> : line}
                                {i < siteContent.shippingHeroTitle.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}</h1>
                        <p>{siteContent.shippingDescription}</p>
                        <div className="hero-btns mt-10">
                            <button onClick={(e) => handleRestrictedClick(e) && setIsModalOpen(true)} className="cta-button" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}>Order Shipment</button>
                        </div>
                    </div>
                </div>
            </section>



            <section className="track-shipping-section-modern animate-on-scroll" id="tracking">
                <div className="container">
                    <div className="tracking-hero">
                        <div className="tracking-hero-content">
                            <h2>Track Your <span className="highlight">Shipment</span></h2>
                            <p>Monitor your package delivery in real-time with our advanced tracking system.</p>
                        </div>
                        <div className="tracking-hero-visual">
                            <div className="tracking-icon-large">
                                <i className="fas fa-route"></i>
                            </div>
                        </div>
                    </div>

                    <div className="booking-card glass-morph !mt-0">
                        <div className="section-header text-center">
                            <h2 className="section-title">Track Your <span className="highlight">Shipment</span></h2>
                            <p className="section-subtitle">Enter your tracking number to get real-time updates.</p>
                        </div>
                        
                        <form className="mt-8" onSubmit={(e) => handleRestrictedClick(e) && handleTrack(e)}>
                            <div className="form-grid">
                                <div className="form-group-full">
                                    <label>Tracking Number</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., TI-0001"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-submit-container">
                                <button type="submit" className="cta-button !w-full">Track Shipment</button>
                            </div>
                        </form>
                    </div>

                    {trackingResult && (
                        <div className="tracking-results-modern" style={{ display: 'block' }}>
                            <div className="results-header">
                                <div className="status-badge">
                                    <i className="fas fa-truck"></i>
                                    <span>{trackingResult.status.toUpperCase()}</span>
                                </div>
                                <div className="tracking-info">
                                    <h3>Tracking #<strong>{trackingResult.trackingID}</strong></h3>
                                    <p>Product: <span>{trackingResult.productName}</span></p>
                                    {trackingResult.estimatedArrival && (
                                        <p className="eta-display">
                                            <i className="fas fa-clock"></i> Estimated Arrival: 
                                            <strong> {new Date(trackingResult.estimatedArrival).toLocaleString()}</strong>
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="progress-steps">
                                {[
                                    { key: 'booked', label: 'Order Placed', icon: 'check-circle' },
                                    { key: 'picked', label: 'Picked Up', icon: 'box' },
                                    { key: 'transit', label: 'In Transit', icon: 'truck' },
                                    { key: 'delivered', label: 'Delivered', icon: 'check-double' }
                                ].map((step) => {
                                    const date = trackingResult.timeline ? trackingResult.timeline[step.key] : null;
                                    const isCompleted = Boolean(date);
                                    const isActive = !date && trackingResult.status === step.label;
                                    return (
                                        <div
                                            key={step.key}
                                            className={`step${isCompleted ? ' completed' : ''}${isActive ? ' active' : ''}`}
                                        >
                                            <div className="step-icon">
                                                <i className={`fas fa-${step.icon}`}></i>
                                            </div>
                                            <span>{step.label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="timeline-details-modern">
                                {[
                                    {
                                        key: 'booked',
                                        icon: 'calendar-check',
                                        title: 'Order Placed',
                                        desc: 'Your shipment has been booked and is being prepared for pickup.'
                                    },
                                    {
                                        key: 'picked',
                                        icon: 'box-open',
                                        title: 'Picked Up',
                                        desc: 'Your package has been collected from the origin location.'
                                    },
                                    {
                                        key: 'transit',
                                        icon: 'route',
                                        title: 'In Transit',
                                        desc: 'Your shipment is currently in transit.'
                                    },
                                    {
                                        key: 'delivered',
                                        icon: 'check-circle',
                                        title: 'Delivered',
                                        desc: 'Your package has been successfully delivered to the destination.'
                                    }
                                ].map((item) => {
                                    const date = trackingResult.timeline ? trackingResult.timeline[item.key] : null;
                                    const isActive = Boolean(date);
                                    return (
                                        <div key={item.key} className={`timeline-item-modern${isActive ? ' active' : ''}`}>
                                            <div className="timeline-dot"></div>
                                            <div className="timeline-content-modern">
                                                <h4><i className={`fas fa-${item.icon}`}></i> {item.title}</h4>
                                                <p>Date: {date ? new Date(date).toLocaleDateString() : '--'}</p>
                                                <p className="timeline-desc">{item.desc}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="cargo-live-map-container">
                                <div className="map-header">
                                    <h4><i className="fas fa-map-marked-alt"></i> Live Smart Tracking (AI Powered)</h4>
                                    <span className="live-badge"><span className="pulse-dot"></span> Live GPS Tracking</span>
                                </div>
                                <div className="map-view">
                                    {(() => {
                                        const seaCoords = {
                                            'Lahore': { top: '35%', left: '75%' },
                                            'Karachi': { top: '65%', left: '68%' },
                                            'Islamabad': { top: '25%', left: '70%' },
                                            'Multan': { top: '50%', left: '65%' },
                                            'Peshawar': { top: '20%', left: '60%' }
                                        };

                                        const targetCity = trackingResult.destinationCity;
                                        // On a world sea map, Pakistan is towards the middle-right
                                        const coords = seaCoords[targetCity] || { top: '50%', left: '50%' };
                                        
                                        let finalTop = coords.top;
                                        let finalLeft = coords.left;
                                        let isMoving = false;

                                        if (trackingResult.status === 'Order Submitted') {
                                            finalTop = '70%'; finalLeft = '20%'; // Far origin (e.g. China/Dubai)
                                        } else if (trackingResult.status === 'Picked Up' || trackingResult.status === 'Processing') {
                                            finalTop = '65%'; finalLeft = '35%'; // Entering International Waters
                                        } else if (['In Transit', 'In Cargo Transit', 'Shipped from Origin'].includes(trackingResult.status)) {
                                            finalTop = '60%'; finalLeft = '50%'; // Middle of the Ocean
                                            isMoving = true;
                                        } else if (['Arrived at Port (Pakistan)', 'Out for Delivery'].includes(trackingResult.status)) {
                                            finalTop = '75%'; finalLeft = '65%'; // Near Karachi Port
                                            isMoving = true;
                                        }

                                        return (
                                            <div 
                                                className={`map-pin status-${trackingResult.status.toLowerCase().replace(/\s+/g, '-')} ${isMoving ? 'is-moving' : ''}`}
                                                style={{ '--pin-top': finalTop, '--pin-left': finalLeft }}
                                            >
                                                <div className="pin-ripple"></div>
                                                <div className="pin-icon"><i className="fas fa-ship"></i></div>
                                                <div className="pin-label">{isMoving ? `Ship moving to ${targetCity}` : `Vessel at ${targetCity}`}</div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>

                            <div className="shipment-cards-grid">
                                <div className="detail-card">
                                    <div className="card-icon">
                                        <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div className="card-content">
                                        <h5>Route Information</h5>
                                        <p><strong>From:</strong> <span>{trackingResult.originCountry}, {trackingResult.pickupLocation}</span></p>
                                        <p><strong>To:</strong> <span>{trackingResult.destinationCity}</span></p>
                                    </div>
                                </div>
                                <div className="detail-card">
                                    <div className="card-icon">
                                        <i className="fas fa-calendar-alt"></i>
                                    </div>
                                    <div className="card-content">
                                        <h5>Details</h5>
                                        <p><strong>Status:</strong> <span>{trackingResult.status}</span></p>
                                        <p><strong>Date:</strong> <span>{new Date(trackingResult.createdAt || (trackingResult.timeline && trackingResult.timeline.booked)).toLocaleDateString()}</span></p>
                                    </div>
                                </div>
                                <div className="detail-card">
                                    <div className="card-icon">
                                        <i className="fas fa-boxes"></i>
                                    </div>
                                    <div className="card-content">
                                        <h5>Package Info</h5>
                                        <p><strong>Category:</strong> <span>{trackingResult.category}</span></p>
                                        <p><strong>Weight/Qty:</strong> <span>{trackingResult.weight} kg / {trackingResult.quantity} pcs</span></p>
                                    </div>
                                </div>
                                <div className="detail-card">
                                    <div className="card-icon">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div className="card-content">
                                        <h5>Sender Info</h5>
                                        <p><strong>Name:</strong> <span>{formData.fullName || 'Customer'}</span></p>
                                        <p><strong>Phone:</strong> <span>{formData.phone || 'N/A'}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="tracking-error-modern" style={{ display: 'block' }}>
                            <div className="error-content">
                                <div className="error-icon">
                                    <i className="fas fa-search-minus"></i>
                                </div>
                                <div className="error-text">
                                    <h4>Tracking Number Not Found</h4>
                                    <p>Please check your tracking number and try again.</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </section>

            {/* Booking Form Modal */}
            {isModalOpen && (
                <div className="booking-modal-overlay">
                    <div className="booking-modal-content">
                        <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                            <i className="fas fa-times"></i>
                        </button>
                        <section id="booking-form" className="booking-section">
                <div className="container">
                    <div className="booking-card glass-morph">
                        <div className="section-header text-center">
                            <h2 className="section-title">New <span className="highlight">Shipping Order</span></h2>
                            <p className="section-subtitle">Fill in the details below to book your shipment.</p>
                        </div>

                        {submissionSuccess ? (
                            <div className="success-overlay animate-visible scale-in">
                                <div className="success-content text-center">
                                    <div className="success-icon"><i className="fas fa-check-circle"></i></div>
                                    <h3>Order Submitted!</h3>
                                    <p>Your shipment has been successfully booked.</p>
                                    <div className="tracking-id-box">
                                        <span>Tracking ID:</span>
                                        <strong>{submissionSuccess}</strong>
                                    </div>
                                    <button onClick={() => setSubmissionSuccess(null)} className="cta-button">Book Another</button>
                                </div>
                            </div>
                        ) : (
                            <form className="shipment-professional-form" onSubmit={handleFormSubmit}>
                                {formError && (
                                    <div className="form-error-box fade-in">
                                        <i className="fas fa-exclamation-triangle"></i>
                                        <span>{formError}</span>
                                        <button type="button" className="close-error" onClick={() => setFormError(null)}>&times;</button>
                                    </div>
                                )}
                                <div className="form-grid">
                                    {/* Personal Info */}
                                    <div className="form-group-full">
                                        <h3 className="group-title"><i className="fas fa-user"></i> Contact Information</h3>
                                    </div>
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input type="text" name="fullName" value={formData.fullName} onChange={handleFormChange} placeholder="Muhammad Danyal" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="danyal@gmail.com" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} placeholder="+92 300 0000000" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input type="text" name="country" value={formData.country} onChange={handleFormChange} placeholder="Pakistan" required />
                                    </div>

                                    {/* Shipment Info */}
                                    <div className="form-group-full">
                                        <h3 className="group-title"><i className="fas fa-box"></i> Package Details</h3>
                                    </div>
                                    <div className="form-group">
                                        <label>Product Name</label>
                                        <input type="text" name="productName" value={formData.productName} onChange={handleFormChange} placeholder="Laptop, Car, etc." required />
                                    </div>
                                    <div className="form-group">
                                        <label>Category</label>
                                        <select name="category" value={formData.category} onChange={handleFormChange} required>
                                            <option value="">Select Category</option>
                                            <option value="General Goods">General Goods</option>
                                            <option value="Vehicle">Vehicle</option>
                                            <option value="Motorcycle/Bike">Motorcycle/Bike</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Vehicle Parts">Vehicle Parts</option>
                                            <option value="Machinery">Machinery</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Value (Rs.)</label>
                                        <input type="number" name="value" value={formData.value} onChange={handleFormChange} placeholder="eg: 250000" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Weight (kg)</label>
                                        <input type="number" name="weight" value={formData.weight} onChange={handleFormChange} placeholder="Total Weight" step="0.1" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Quantity</label>
                                        <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} placeholder="Units" min="1" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Shipping Type</label>
                                        <select name="shippingType" value={formData.shippingType} onChange={handleFormChange} required>
                                            <option value="">Select Shipping Type</option>
                                            <option value="Full Container">Full Container</option>
                                            <option value="Shared Container">Shared Container</option>
                                        </select>
                                    </div>

                                    {/* Logistics Info */}
                                    <div className="form-group-full">
                                        <h3 className="group-title"><i className="fas fa-truck-loading"></i> Logistics & Route</h3>
                                    </div>
                                    <div className="form-group">
                                        <label>Origin Country</label>
                                        <input type="text" name="originCountry" value={formData.originCountry} onChange={handleFormChange} placeholder="Country of Origin" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Pickup Location</label>
                                        <input type="text" name="pickupLocation" value={formData.pickupLocation} onChange={handleFormChange} placeholder="Full Address" required />
                                    </div>
                                    <div className="form-group">
                                        <label>Destination City</label>
                                        <select name="destinationCity" value={formData.destinationCity} onChange={handleFormChange} required>
                                            <option value="">Select City</option>
                                            <option value="Lahore">Lahore</option>
                                            <option value="Karachi">Karachi</option>
                                            <option value="Islamabad">Islamabad</option>
                                            <option value="Peshawar">Peshawar</option>
                                            <option value="Quetta">Quetta</option>
                                            <option value="Multan">Multan</option>
                                            <option value="Faisalabad">Faisalabad</option>
                                            <option value="Rawalpindi">Rawalpindi</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Preferred Port</label>
                                        <select name="preferredPort" value={formData.preferredPort} onChange={handleFormChange} required>
                                            <option value="">Select Port</option>
                                            <option value="Karachi Port">Karachi Port</option>
                                            <option value="Gwadar Port">Gwadar Port</option>
                                        </select>
                                    </div>
                                    <div className="form-group-full" style={{ gridColumn: '1 / -1' }}>
                                        <label>Additional Notes (Optional)</label>
                                        <textarea name="notes" value={formData.notes} onChange={handleFormChange} placeholder="Any specific instructions or remarks for your shipment..." style={{ width: '100%', padding: '14px 18px', border: '1px solid #ddd', borderRadius: '10px', fontSize: '1rem', color: '#333', backgroundColor: '#fafafa', resize: 'vertical', minHeight: '100px' }}></textarea>
                                    </div>

                                </div>
                                <div className="form-submit-container mt-10">
                                    <button type="submit" className="cta-button w-full" disabled={submitting}>
                                        {submitting ? 'Processing...' : 'Proceed to Payment'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </section>
            </div>
            </div>
            )}

            <section className="how-shipping-works animate-on-scroll">
                <div className="container">
                    <h2 className="section-title">How <span className="highlight">E-Shipping</span> Works</h2>
                    <div className="shipping-process-grid">
                        {[
                            { icon: 'box', title: '1. Book', text: 'Choose service and enter details.' },
                            { icon: 'truck', title: '2. Pickup', text: 'Our agent picks up your parcel.' },
                            { icon: 'route', title: '3. Track', text: 'Monitor journey in real-time.' },
                            { icon: 'check-circle', title: '4. Deliver', text: 'Safe delivery to destination.' }
                        ].map((p, i) => (
                            <div key={i} className="process-card">
                                <div className="process-icon"><i className={`fas fa-${p.icon}`}></i></div>
                                <h3>{p.title}</h3>
                                <p>{p.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="services-offered animate-on-scroll">
                <div className="container">
                    <h2 className="section-title">Our <span className="highlight">Shipping Services</span></h2>
                    <div className="services-grid">
                        {[
                            {
                                icon: 'shipping-fast',
                                title: 'Express Delivery',
                                text: 'Fastest delivery within 24-48 hours for urgent shipments.',
                                items: ['Same day pickup', 'Real-time tracking', 'Insurance included']
                            },
                            {
                                icon: 'truck-moving',
                                title: 'Standard Delivery',
                                text: 'Reliable delivery within 3-5 business days.',
                                items: ['Cost-effective rates', 'Door-to-door service', 'Basic insurance']
                            },
                            {
                                icon: 'warehouse',
                                title: 'Warehousing',
                                text: 'Secure storage solutions for your inventory needs.',
                                items: ['Climate-controlled storage', 'Inventory management', 'Order fulfillment']
                            }
                        ].map((s, i) => (
                            <div key={i} className="service-offered-card">
                                <div className="service-icon">
                                    <i className={`fas fa-${s.icon}`}></i>
                                </div>
                                <h3>{s.title}</h3>
                                <p>{s.text}</p>
                                <ul>
                                    {s.items.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>



            {/* 7. Why Choose Us */}
            <section className="why-choose-us animate-on-scroll">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose <span className="highlight">E-Shipping?</span></h2>
                        <p className="section-subtitle">Experience reliable, secure, and efficient parcel delivery services tailored for your needs.</p>
                    </div>
                    <div className="why-choose-grid">
                        {[
                            { icon: 'shipping-fast', title: 'Fast Delivery' },
                            { icon: 'shield-alt', title: 'Secure Packaging' },
                            { icon: 'map-marked-alt', title: 'Nationwide' },
                            { icon: 'hand-holding-usd', title: 'Affordable' },
                            { icon: 'clock', title: '24/7 Support' },
                            { icon: 'box-open', title: 'Door-to-Door' }
                        ].map((w, i) => (
                            <div key={i} className="why-choose-card">
                                <div className="why-choose-icon"><i className={`fas fa-${w.icon}`}></i></div>
                                <h3>{w.title}</h3>
                                <p>Reliable service tailored for your needs.</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="cost-estimator-section py-20 bg-gray-50/50">
                <div className="container px-4">
                    <CostEstimator />
                </div>
            </section>

            {/* Download App Section */}
            <section className="animate-on-scroll" style={{ padding: '100px 0', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '50px' }}>
                        <div className="animate-on-scroll fade-in-left" style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'white', marginBottom: '20px', letterSpacing: '-1px' }}>Get the E-Drop App Today!</h2>
                            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', marginBottom: '40px', lineHeight: '1.7' }}>
                                Experience fast, reliable, and secure shipping by downloading our app from your preferred store!
                            </p>
                            
                            {/* App Store Badges */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
                                <a href="/pictures/edrop.apk" download style={{ textDecoration: 'none' }}>
                                    <img src="/pictures/google_store.png" alt="Download on Google Play" style={{ height: '60px', borderRadius: '10px', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
                                </a>
                                <a href="#" style={{ textDecoration: 'none' }}>
                                    <img src="/pictures/apple_store.png" alt="Download on App Store" style={{ height: '60px', borderRadius: '10px', transition: 'transform 0.3s ease' }} onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.target.style.transform = 'scale(1)'} />
                                </a>
                            </div>

                            {/* Direct APK Download Button */}
                            <div>
                                <a href="/pictures/edrop.apk" download style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '15px 35px', background: 'linear-gradient(135deg, #ff6b35, #ff8c42)', color: 'white', fontWeight: '700', fontSize: '1.1rem', borderRadius: '50px', textDecoration: 'none', boxShadow: '0 10px 30px rgba(255, 107, 53, 0.3)', transition: 'all 0.3s ease' }} onMouseEnter={(e) => {e.target.style.transform = 'translateY(-3px)'; e.target.style.boxShadow = '0 15px 40px rgba(255, 107, 53, 0.4)'}} onMouseLeave={(e) => {e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 10px 30px rgba(255, 107, 53, 0.3)'}}>
                                    <i className="fas fa-download"></i>
                                    Download APK Directly
                                </a>
                            </div>
                        </div>
                        
                        <div className="animate-on-scroll fade-in-right" style={{ flex: 1, minWidth: '300px', textAlign: 'center' }}>
                            <img src="/pictures/phone_app.png" alt="E-Drop Mobile App" style={{ maxWidth: '100%', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }} />
                        </div>
                    </div>
                </div>
            </section>

            <RestrictedAccessModal 
                isOpen={isAuthAlertOpen} 
                onClose={() => setIsAuthAlertOpen(false)} 
                onLoginClick={onAuthClick} 
            />

            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={executeSubmission}
                amount={paymentAmount}
                paymentFor="Shipping Order"
            />
        </main>
    );
};

export default EShipping;
