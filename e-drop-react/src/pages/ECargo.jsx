import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthGate } from '../hooks/useAuthGate';
import RestrictedAccessModal from '../components/RestrictedAccessModal';
import CostEstimator from '../components/CostEstimator';
import SmartMap from '../components/SmartMap';
import PaymentModal from '../components/PaymentModal';
import '../styles/ecargo.css';
import { API_BASE_URL } from '../config';

const ECargo = ({ userRole, onAuthClick }) => {
    const { isAuthAlertOpen, setIsAuthAlertOpen, handleRestrictedClick } = useAuthGate();
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [error, setError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [formError, setFormError] = useState(null);

    // Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(15000);

    // Scroll to error when it appears
    useEffect(() => {
        if (formError) {
            const formElement = document.querySelector('.shipment-professional-form');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [formError]);

    // Cargo Booking Form State
    const [formData, setFormData] = useState({
        senderName: '',
        senderEmail: '',
        senderPhone: '',
        receiverName: '',
        receiverPhone: '',
        destinationCity: '',
        deliveryAddress: '',
        linkedTrackingID: '',
        cargoType: '',
        deliveryPriority: '',
        specialInstructions: ''
    });

    const [siteContent, setSiteContent] = useState({
        cargoHeroTitle: "FOCUS ON PARTNERSHIP AND TRUST",
        cargoDescription: "E-DROP is your trusted supply chain partner, dedicated to moving goods safely, efficiently, and on schedule with specialized freight solutions."
    });

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();

        // Calculate a dummy payment amount based on priority
        let baseAmount = 15000;
        if (formData.deliveryPriority === 'Urgent') baseAmount += 5000;
        if (formData.deliveryPriority === 'Fragile Handling') baseAmount += 3000;
        
        setPaymentAmount(baseAmount);
        setIsPaymentModalOpen(true);
    };

    const executeBookingSubmission = async () => {
        setIsSubmitting(true);
        setIsPaymentModalOpen(false);

        try {
            const res = await axios.post(`${API_BASE_URL}/api/cargo/add`, formData);
            if (res.data.success) {
                setBookingSuccess(res.data.trackingID);
                setFormData({
                    senderName: '', senderEmail: '', senderPhone: '',
                    receiverName: '', receiverPhone: '', destinationCity: '',
                    deliveryAddress: '', linkedTrackingID: '', cargoType: '',
                    deliveryPriority: '', specialInstructions: ''
                });
            }
        } catch (err) {
            console.error("Error booking cargo:", err);
            const errorMsg = err.response?.data?.message || "Error occurred while booking cargo. Please try again.";
            setFormError(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackingNumber) return;

        try {
            const res = await axios.get(`${API_BASE_URL}/api/cargo/track/${trackingNumber}`);
            if (res.data.success) {
                setTrackingResult(res.data.cargo);
                setError(false);
            }
        } catch (err) {
            console.error("Tracking error:", err);
            setTrackingResult(null);
            setError(true);
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
                console.error("Error fetching cargo content:", err);
            }
        };
        fetchContent();

        // Auto-fill user details if logged in
        const user = JSON.parse(sessionStorage.getItem('user'));
        if (user) {
            setFormData(prev => ({
                ...prev,
                senderName: user.fullName || '',
                senderEmail: user.email || '',
                senderPhone: user.phone || ''
            }));
        }

        return () => window.removeEventListener('scroll', animateOnScroll);
    }, []);

    return (
        <main id="ecargo-page">
            <section className="cargo-hero">
                <div className="hero-content">
                    <div className="container">
                        <div className="cargo-hero-left">
                            <h1>{siteContent.cargoHeroTitle}</h1>
                            <p>{siteContent.cargoDescription}</p>
                            <div className="hero-btns mt-10">
                                <button onClick={(e) => handleRestrictedClick(e) && setIsBookingModalOpen(true)} className="cta-button-large" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Book Cargo Order</button>
                                <a href="#tracking" className="cta-button-large secondary ml-4">Track Cargo</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="track-cargo-section-modern animate-on-scroll" id="tracking">
                <div className="container">
                    <div className="tracking-hero">
                        <div className="tracking-hero-content">
                            <h2>Track Your <span className="highlight">Cargo</span></h2>
                            <p>Monitor your freight shipment in real-time with our advanced tracking system.</p>
                        </div>
                        <div className="tracking-hero-visual">
                            <div className="tracking-icon-large">
                                <i className="fas fa-route"></i>
                            </div>
                        </div>
                    </div>

                    <div className="booking-card glass-morph !mt-0">
                        <div className="section-header text-center">
                            <h2 className="section-title">Track Your <span className="highlight">Cargo</span></h2>
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
                                    <p>Receiver: <span>{trackingResult.receiverName}</span></p>
                                    {trackingResult.estimatedArrival && (
                                        <p className="eta-display-cargo" style={{
                                            background: 'rgba(255, 107, 53, 0.1)',
                                            padding: '8px 15px',
                                            borderRadius: '8px',
                                            color: '#ff6b35',
                                            fontSize: '0.9rem',
                                            marginTop: '10px',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            border: '1px dashed #ff6b35'
                                        }}>
                                            <i className="fas fa-clock"></i> ETA: 
                                            <strong> {new Date(trackingResult.estimatedArrival).toLocaleString()}</strong>
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="progress-steps">
                                {[
                                    { key: 'booked', label: 'Booked', icon: 'check-circle' },
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
                                        title: 'Order Booked',
                                        desc: 'Your cargo shipment has been booked and is being prepared for pickup.'
                                    },
                                    {
                                        key: 'picked',
                                        icon: 'box-open',
                                        title: 'Picked Up',
                                        desc: 'Your cargo has been collected from the origin location and loaded for transport.'
                                    },
                                    {
                                        key: 'transit',
                                        icon: 'route',
                                        title: 'In Transit',
                                        desc: 'Your shipment is currently in transit and being monitored via GPS tracking.'
                                    },
                                    {
                                        key: 'delivered',
                                        icon: 'check-circle',
                                        title: 'Delivered',
                                        desc: 'Your cargo has been successfully delivered to the destination.'
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
                                    <h4><i className="fas fa-map-marked-alt"></i> Live Route & Location</h4>
                                    <span className="live-badge"><span className="pulse-dot"></span> Live GPS Tracking</span>
                                </div>
                                <div className="map-view-real">
                                    <SmartMap shipment={trackingResult} />
                                </div>
                            </div>

                            <div className="shipment-cards-grid">
                                <div className="detail-card">
                                    <div className="card-icon">
                                        <i className="fas fa-map-marker-alt"></i>
                                    </div>
                                    <div className="card-content">
                                        <h5>Route Information</h5>
                                        <p><strong>From:</strong> <span>Pakistan</span></p>
                                        <p><strong>To:</strong> <span>{trackingResult.destinationCity}</span></p>
                                        <p><strong>Address:</strong> <span style={{ fontSize: '0.8rem' }}>{trackingResult.deliveryAddress}</span></p>
                                    </div>
                                </div>
                                <div className="detail-card">
                                    <div className="card-icon">
                                        <i className="fas fa-calendar-alt"></i>
                                    </div>
                                    <div className="card-content">
                                        <h5>Details</h5>
                                        <p><strong>Status:</strong> <span>{trackingResult.status}</span></p>
                                        <p><strong>Priority:</strong> <span>{trackingResult.deliveryPriority}</span></p>
                                    </div>
                                </div>
                                <div className="detail-card">
                                    <div className="card-icon">
                                        <i className="fas fa-boxes"></i>
                                    </div>
                                    <div className="card-content">
                                        <h5>Cargo Info</h5>
                                        <p><strong>Type:</strong> <span>{trackingResult.cargoType}</span></p>
                                        <p><strong>Shipment Ref:</strong> <span>{trackingResult.linkedTrackingID || 'N/A'}</span></p>
                                    </div>
                                </div>
                                <div className="detail-card">
                                    <div className="card-icon">
                                        <i className="fas fa-user"></i>
                                    </div>
                                    <div className="card-content">
                                        <h5>Recipient</h5>
                                        <p><strong>Name:</strong> <span>{trackingResult.receiverName}</span></p>
                                        <p><strong>Phone:</strong> <span>{trackingResult.receiverPhone}</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="tracking-actions">
                                <button className="cta-button" style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '8px' }}>
                                    <i className="fas fa-download"></i> Download Receipt
                                </button>
                                <button className="cta-button" style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '8px' }}>
                                    <i className="fas fa-phone"></i> Contact Support
                                </button>
                                <button className="cta-button" style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '8px' }}>
                                    <i className="fas fa-share"></i> Share Tracking
                                </button>
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


            <section className="cargo-services animate-on-scroll">
                <div className="container">
                    <div className="services-header">
                        <span className="segment-eyebrow">What We Move</span>
                        <h2 className="segment-main-title">Service <span className="highlight">Segments</span></h2>
                        <p className="section-subtitle">Focused solutions for every type of cargo movement — built for speed, safety and scale.</p>
                    </div>
                    <div className="service-segments">
                        {[
                            {
                                num: '01',
                                title: 'Commercial Freight',
                                text: 'Full truckload, LTL and bulk cargo shipments managed end to end with precision and reliability.'
                            },
                            {
                                num: '02',
                                title: 'Household Relocation',
                                text: 'Complete home and office moving solutions with white-glove handling for your most valued possessions.'
                            },
                            {
                                num: '03',
                                title: 'Specialized E‑Waste',
                                text: 'Specialized handling for high-value electronics, including laptops, mobiles, and batteries.'
                            },
                            {
                                num: '04',
                                title: 'Custom Solutions',
                                text: "Bespoke logistics strategies designed specifically around your industry's unique operational needs."
                            }
                        ].map((segment) => (
                            <div key={segment.num} className="service-segment-card">
                                <div className="segment-card-glow" />
                                <div className="segment-top-row">
                                    <div className="service-segment-badge">{segment.num}</div>
                                </div>
                                <div className="service-segment-content">
                                    <h4 className="service-segment-title">{segment.title}</h4>
                                    <p className="service-segment-text">{segment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="services-header">
                        <h2 className="section-title">Global <span className="highlight">Logistics Solutions</span></h2>
                        <p className="section-subtitle">Experience our comprehensive freight and supply chain services designed for businesses of all sizes.</p>
                    </div>

                    <div className="services-grid">
                        {[
                            {
                                num: '01',
                                icon: 'plane',
                                title: 'On-Time Delivery Service',
                                text: 'Rapid and economical worldwide air cargo services ensuring your goods reach their destination when promised.',
                                features: [
                                    'Express air freight options',
                                    'Global network coverage',
                                    'Real-time shipment tracking',
                                    'Competitive pricing'
                                ]
                            },
                            {
                                num: '02',
                                icon: 'shield-alt',
                                title: 'Safety & Reliable Service',
                                text: 'Fast, reliable, and friendly service tailored to meet your specific customer requirements with high safety standards.',
                                features: [
                                    'Professional handling',
                                    'Secure packaging',
                                    'Insurance coverage',
                                    'Quality assurance'
                                ]
                            },
                            {
                                num: '03',
                                icon: 'truck-moving',
                                title: 'The Complete Solution',
                                text: 'Specialized transport options including Express Full Load, LTL, and Groupage services for comprehensive logistics needs.',
                                features: [
                                    'Full truckload services',
                                    'LTL shipping solutions',
                                    'Consolidated shipments',
                                    'Custom logistics planning'
                                ]
                            }
                        ].map((s, i) => (
                            <div key={i} className="service-card animate-on-scroll fade-in-up">
                                <div className="service-number">{s.num}</div>
                                <div className="service-icon"><i className={`fas fa-${s.icon}`}></i></div>
                                <h3>{s.title}</h3>
                                <p>{s.text}</p>
                                <ul className="service-features">
                                    {s.features.map((f, fi) => (
                                        <li key={fi}>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="why-choose-cargo animate-on-scroll">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose <span className="highlight">E-CARGO?</span></h2>
                        <p className="section-subtitle">Discover why businesses trust us with their most valuable cargo.</p>
                    </div>
                    <div className="features-grid">
                        {[
                            {
                                icon: 'clock',
                                title: 'Time-Critical Deliveries',
                                text: 'Reliable on-time performance with express delivery options for urgent shipments.'
                            },
                            {
                                icon: 'globe',
                                title: 'Global Reach',
                                text: 'Comprehensive network covering major trade routes worldwide with local expertise.'
                            },
                            {
                                icon: 'handshake',
                                title: 'Trusted Partnerships',
                                text: 'Long-standing relationships with leading carriers and suppliers for optimal service.'
                            },
                            {
                                icon: 'chart-line',
                                title: 'Cost Efficiency',
                                text: 'Competitive rates with transparent pricing and volume discounts for regular customers.'
                            },
                            {
                                icon: 'headset',
                                title: '24/7 Support',
                                text: 'Dedicated account managers and round-the-clock customer service availability.'
                            },
                            {
                                icon: 'certificate',
                                title: 'Quality Assurance',
                                text: 'Stringent quality controls and compliance with international shipping standards.'
                            }
                        ].map((f, i) => (
                            <div key={i} className="feature-card">
                                <div className="feature-icon"><i className={`fas fa-${f.icon}`}></i></div>
                                <h3>{f.title}</h3>
                                <p>{f.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="services-overview animate-on-scroll">
                <div className="container">
                    <h2 className="section-title">Our <span className="highlight">Service Portfolio</span></h2>
                    <div className="overview-grid">
                        {[
                            {
                                icon: 'ship',
                                title: 'Ocean Freight',
                                text: 'Cost-effective sea freight solutions for bulk cargo and container shipments.'
                            },
                            {
                                icon: 'truck',
                                title: 'Road Transport',
                                text: 'Comprehensive road freight services with door-to-door delivery capabilities.'
                            },
                            {
                                icon: 'warehouse',
                                title: 'Warehousing',
                                text: 'Secure storage and distribution solutions with inventory management systems.'
                            },
                            {
                                icon: 'boxes',
                                title: 'Project Cargo',
                                text: 'Specialized handling for oversized and complex project shipments.'
                            },
                            {
                                icon: 'route',
                                title: 'Supply Chain',
                                text: 'End-to-end supply chain management and consulting services.'
                            }
                        ].map((o, i) => (
                            <div key={i} className="overview-card">
                                <div className="overview-icon"><i className={`fas fa-${o.icon}`}></i></div>
                                <h3>{o.title}</h3>
                                <p>{o.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3.5 Cargo Fleet Showcase */}
            <section className="cargo-fleet-section animate-on-scroll">
                <div className="container">
                    <div className="fleet-header">
                        <span className="segment-eyebrow">Our Vehicles</span>
                        <h2 className="segment-main-title">Logistics <span className="highlight">Fleet</span></h2>
                        <p className="section-subtitle">Modern, well-maintained vehicles specialized for all types of cargo movement.</p>
                    </div>

                    <div className="cargo-fleet-container animate-on-scroll fade-in-up">
                        <div className="cargo-fleet-image-wrapper">
                            <img src="/pictures/edrop4.jpeg" alt="E-Drop Cargo Fleet" />
                            <div className="fleet-overlay-content">
                                <div className="fleet-stat-badge">
                                    <i className="fas fa-truck-loading"></i>
                                    <span>High Capacity</span>
                                </div>
                                <div className="fleet-stat-badge">
                                    <i className="fas fa-shield-alt"></i>
                                    <span>Secure Transit</span>
                                </div>
                            </div>
                        </div>
                        <div className="cargo-fleet-info">
                            <h3>Heavy Duty Logistics</h3>
                            <p>Our expansive fleet is equipped to handle everything from small parcels to large industrial equipment, ensuring your cargo reaches its destination safely and on schedule.</p>
                            <div className="fleet-features-grid">
                                <div className="fleet-feat"><i className="fas fa-check-circle"></i> Climate Control</div>
                                <div className="fleet-feat"><i className="fas fa-check-circle"></i> Experienced Crew</div>
                                <div className="fleet-feat"><i className="fas fa-check-circle"></i> 24/7 Availability</div>
                            </div>
                        </div>
                    </div>
                </div>
                <style>{`
                    .cargo-fleet-section {
                        padding: 100px 0;
                        background: radial-gradient(circle at top right, #fff 0%, #f4f4f4 100%);
                    }
                    .fleet-header {
                        text-align: center;
                        margin-bottom: 50px;
                    }
                    .cargo-fleet-container {
                        display: flex;
                        align-items: center;
                        gap: 50px;
                        background: white;
                        padding: 20px;
                        border-radius: 30px;
                        box-shadow: 0 40px 80px rgba(0,0,0,0.08);
                    }
                    .cargo-fleet-image-wrapper {
                        flex: 1.2;
                        position: relative;
                        height: 450px;
                        border-radius: 20px;
                        overflow: hidden;
                    }
                    .cargo-fleet-image-wrapper img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .fleet-overlay-content {
                        position: absolute;
                        top: 20px;
                        left: 20px;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .fleet-stat-badge {
                        background: rgba(255, 107, 53, 0.9);
                        color: white;
                        padding: 8px 15px;
                        border-radius: 10px;
                        font-weight: 600;
                        font-size: 0.9rem;
                        backdrop-filter: blur(5px);
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        box-shadow: 0 10px 20px rgba(0,0,0,0.1);
                    }
                    .cargo-fleet-info {
                        flex: 1;
                        padding-right: 20px;
                    }
                    .cargo-fleet-info h3 {
                        font-size: 2.2rem;
                        margin-bottom: 20px;
                        color: #111;
                    }
                    .cargo-fleet-info p {
                        font-size: 1.1rem;
                        color: #555;
                        line-height: 1.7;
                        margin-bottom: 30px;
                    }
                    .fleet-features-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 15px;
                    }
                    .fleet-feat {
                        font-weight: 600;
                        color: #333;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    .fleet-feat i {
                        color: #ff6b35;
                    }
                    @media (max-width: 992px) {
                        .cargo-fleet-container {
                            flex-direction: column;
                            padding: 15px;
                        }
                        .cargo-fleet-image-wrapper {
                            width: 100%;
                            height: 350px;
                        }
                        .cargo-fleet-info {
                            padding: 20px;
                        }
                    }
                `}</style>
            </section>

            <section className="cost-estimator-section py-20 bg-gray-50/50">
                <div className="container px-4">
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-2">Cost Estimator</h2>
                        <p className="text-gray-500">Calculate your charges instantly.</p>
                    </div>
                    <CostEstimator />
                </div>
            </section>



            <section className="cargo-cta animate-on-scroll">
                <div className="container">
                    <div className="cta-content">
                        <h2>Send Your Items Without Any Worry.</h2>
                        <p>Message our team today and let us handle your delivery from start to finish.</p>
                        <button onClick={(e) => handleRestrictedClick(e) && setIsBookingModalOpen(true)} className="cta-button-large" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Get a Quote</button>
                    </div>
                </div>
            </section>

            {/* Booking Form Modal */}
            {isBookingModalOpen && (
                <div className="booking-modal-overlay">
                    <div className="booking-modal-content">
                        <button className="close-modal-btn" onClick={() => { setIsBookingModalOpen(false); setBookingSuccess(null); }}>
                            <i className="fas fa-times"></i>
                        </button>
                        <section className="booking-section">
                            <div className="container">
                                <div className="booking-card glass-morph">
                                    <div className="section-header text-center">
                                        <h2 className="section-title">New <span className="highlight">Cargo Booking</span></h2>
                                        <p className="section-subtitle">Fill in the details below to book your cargo delivery.</p>
                                    </div>

                                    {bookingSuccess ? (
                                        <div className="success-overlay animate-visible scale-in">
                                            <div className="success-content text-center">
                                                <div className="success-icon"><i className="fas fa-check-circle"></i></div>
                                                <h3>Order Submitted!</h3>
                                                <p>Your cargo shipment has been successfully booked.</p>
                                                <div className="tracking-id-box">
                                                    <span>Tracking ID:</span>
                                                    <strong>{bookingSuccess}</strong>
                                                </div>
                                                <button onClick={() => setBookingSuccess(null)} className="cta-button-large w-full">Book Another</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form className="shipment-professional-form" onSubmit={handleBookingSubmit}>
                                            {formError && (
                                                <div className="form-error-box fade-in">
                                                    <i className="fas fa-exclamation-triangle"></i>
                                                    <span>{formError}</span>
                                                    <button type="button" className="close-error" onClick={() => setFormError(null)}>&times;</button>
                                                </div>
                                            )}
                                            <div className="form-grid">

                                                {/* Cargo Details */}
                                                <div className="form-group-full">
                                                    <h3 className="group-title"><i className="fas fa-boxes"></i> Cargo Details</h3>
                                                </div>
                                                <div className="form-group">
                                                    <label>Cargo Type *</label>
                                                    <select name="cargoType" value={formData.cargoType} onChange={handleFormChange} required>
                                                        <option value="">-- Select --</option>
                                                        <option value="General Goods">General Goods</option>
                                                        <option value="Electronics">Electronics</option>
                                                        <option value="Furniture">Furniture</option>
                                                        <option value="Auto Parts">Auto Parts</option>
                                                        <option value="Textiles">Textiles</option>
                                                    </select>
                                                </div>
                                                <div className="form-group">
                                                    <label>Delivery Priority *</label>
                                                    <select name="deliveryPriority" value={formData.deliveryPriority} onChange={handleFormChange} required>
                                                        <option value="">-- Select --</option>
                                                        <option value="Standard">Standard</option>
                                                        <option value="Urgent">Urgent</option>
                                                        <option value="Fragile Handling">Fragile Handling</option>
                                                    </select>
                                                </div>
                                                <div className="form-group form-group-full">
                                                    <label>Special Instructions</label>
                                                    <textarea name="specialInstructions" value={formData.specialInstructions} onChange={handleFormChange} placeholder="e.g. Fragile, handle with care" style={{ width: '100%', padding: '14px 18px', border: '1px solid #ddd', borderRadius: '10px', minHeight: '80px' }}></textarea>
                                                </div>

                                                {/* Receiver Info */}
                                                <div className="form-group-full">
                                                    <h3 className="group-title"><i className="fas fa-id-card"></i> Receiver Details</h3>
                                                </div>
                                                <div className="form-group">
                                                    <label>Receiver Name *</label>
                                                    <input type="text" name="receiverName" value={formData.receiverName} onChange={handleFormChange} placeholder="Full Name" required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Contact Number *</label>
                                                    <input type="tel" name="receiverPhone" value={formData.receiverPhone} onChange={handleFormChange} placeholder="+92 300 0000000" required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Destination City *</label>
                                                    <select name="destinationCity" value={formData.destinationCity} onChange={handleFormChange} required>
                                                        <option value="">-- Select City --</option>
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
                                                    <label>Full Delivery Address *</label>
                                                    <input type="text" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleFormChange} placeholder="Street, area, city" required />
                                                </div>

                                                {/* Sender Info */}
                                                <div className="form-group-full">
                                                    <h3 className="group-title"><i className="fas fa-user"></i> Contact Information</h3>
                                                </div>
                                                <div className="form-group">
                                                    <label>Full Name *</label>
                                                    <input type="text" name="senderName" value={formData.senderName} onChange={handleFormChange} placeholder="Your Name" required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Email Address *</label>
                                                    <input type="email" name="senderEmail" value={formData.senderEmail} onChange={handleFormChange} placeholder="your@email.com" required />
                                                </div>
                                                <div className="form-group">
                                                    <label>Phone Number *</label>
                                                    <input type="tel" name="senderPhone" value={formData.senderPhone} onChange={handleFormChange} placeholder="+92 300 0000000" required />
                                                </div>
                                            </div>
                                            <div className="form-submit-container mt-10">
                                                <button type="submit" className="cta-button-large w-full" disabled={isSubmitting}>
                                                    {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
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

            {/* Download App Section */}
            <section className="animate-on-scroll" style={{ padding: '100px 0', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '50px' }}>
                        <div className="animate-on-scroll fade-in-left" style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'white', marginBottom: '20px', letterSpacing: '-1px' }}>Get the E-Drop App Today!</h2>
                            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', marginBottom: '40px', lineHeight: '1.7' }}>
                                Experience reliable, secure, and efficient cargo delivery by downloading our app from your preferred store!
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
                onSuccess={executeBookingSubmission}
                amount={paymentAmount}
                paymentFor="Cargo Booking"
            />
        </main>
    );
};

export default ECargo;
