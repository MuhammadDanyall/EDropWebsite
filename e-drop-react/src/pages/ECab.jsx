import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthGate } from '../hooks/useAuthGate';
import RestrictedAccessModal from '../components/RestrictedAccessModal';
import '../styles/ecab.css';
import '../styles/mobile-fixes.css';
import { API_BASE_URL } from '../config';

const ECab = ({ onAuthClick }) => {
    const { isAuthAlertOpen, setIsAuthAlertOpen, handleRestrictedClick } = useAuthGate();
    const [quoteData, setQuoteData] = useState({
        pickup: '',
        dropoff: '',
        rideType: 'AC'
    });
    const [estimate, setEstimate] = useState(null);
    const [siteContent, setSiteContent] = useState({
        ecabHeroTitle: "WE ARE FAST, RELIABLE, AND SAFE",
        ecabDescription: "Ride with E-Cab to get to your end destination on time, safely, and at a minimal cost."
    });

    const handleQuoteSubmit = (e) => {
        e.preventDefault();
        // New Pricing: 60 Rs per km + 15 Rs eDrop share
        const ratePerKm = 60;
        const eDropShare = 15;
        const mockDistance = Math.floor(Math.random() * 15) + 5; // 5-20 km
        const fare = (mockDistance * ratePerKm) + eDropShare;

        setEstimate({
            total: fare,
            distance: mockDistance,
            rate: ratePerKm,
            base: eDropShare
        });
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
                const res = await axios.get('${API_BASE_URL}/api/content');
                if (res.data) {
                    setSiteContent(res.data);
                }
            } catch (err) {
                console.error("Error fetching ecab content:", err);
            }
        };
        fetchContent();

        return () => window.removeEventListener('scroll', animateOnScroll);
    }, []);

    return (
        <main id="ecab-page">
            {/* 1. Hero Section */}
            <section className="ecab-hero-map">
                <div className="map-overlay">
                    <div className="hero-map-content">
                        <h1>{siteContent.ecabHeroTitle}</h1>
                        <p>{siteContent.ecabDescription}</p>
                    </div>
                </div>
            </section>

            {/* 2. Mobile App Interface */}
            <section className="mobile-app-section animate-on-scroll">
                <div className="container app-interface-container">
                    <div className="app-info animate-on-scroll fade-in-left">
                        <h2>Real-Time Tracking & Communication</h2>
                        <p>Our app provides a seamless experience for tracking your ride and staying in touch with your driver.</p>
                        <div className="features-list">
                            <div className="feature-item"><i className="fas fa-map-marker-alt"></i><span>Accurate Location Header</span></div>
                            <div className="feature-item"><i className="fas fa-route"></i><span>Live GPS Map</span></div>
                            <div className="feature-item"><i className="fas fa-car-side"></i><span>Driver Arrival Updates</span></div>
                            <div className="feature-item"><i className="fas fa-phone-alt"></i><span>Instant Call & Message</span></div>
                        </div>
                    </div>
                    <div className="mobile-app-ui">
                        <img src="/pictures/Mobile_app.jpeg" alt="Mobile App UI" className="app-screenshot" />
                        <div className="driver-arrival-card">
                            <div className="driver-info">
                                <img src="/pictures/driver_profile.png" alt="Driver" className="driver-profile-pic" />
                                <div className="driver-details-text">
                                    <p> Cabe on his way</p>
                                    <span className="location-header">Kohat University, Kohat</span>
                                </div>
                            </div>
                            <div className="eta-actions">
                                <span className="eta-timer">1 min</span>
                                <div className="action-icons">
                                    <a href="#"><i className="fas fa-phone"></i></a>
                                    <a href="#"><i className="fas fa-comment"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Steps */}
            <section className="how-ride-works animate-on-scroll">
                <div className="container">
                    <h2 className="section-title">How Your Ride <span className="orange-highlight">Works</span></h2>
                    <div className="how-it-works-grid">
                        {[
                            { icon: 'mobile-alt', title: '1. Launch App', text: 'Open the E-Drop app and select the Ride icon.' },
                            { icon: 'map-marker-alt', title: '2. Pickup Details', text: 'Choose your vehicle type and locations.' },
                            { icon: 'car-side', title: '3. The Ride', text: 'A GPS-tracked, security-vetted partner is assigned.' },
                            { icon: 'wallet', title: '4. Payment', text: 'Pay with cash or E-Drop Wallet.' }
                        ].map((s, i) => (
                            <div key={i} className="service-card animate-on-scroll fade-in-up">
                                <div className="icon-wrapper"><i className={`fas fa-${s.icon}`}></i></div>
                                <h3>{s.title}</h3>
                                <p>{s.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. Why Choose Us */}
            <section className="why-choose-us animate-on-scroll">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose <span className="orange-highlight">E-CAB?</span></h2>
                        <p className="section-subtitle">Discover what makes us the preferred choice for riders across Pakistan.</p>
                    </div>
                    <div className="why-choose-grid">
                        {[
                            { icon: 'shield-alt', title: 'Safety First', text: 'Drivers undergo thorough background checks.' },
                            { icon: 'clock', title: 'Lightning Fast', text: 'Picked up within minutes with smart matching.' },
                            { icon: 'wallet', title: 'Affordable Rates', text: 'Competitive pricing with transparent fares.' },
                            { icon: 'user-friends', title: 'Professional Drivers', text: 'Experienced and courteous drivers.' },
                            { icon: 'map-marked-alt', title: 'Nationwide Coverage', text: 'Available in major cities across Pakistan.' },
                            { icon: 'headset', title: '24/7 Support', text: 'Round-the-clock customer support.' }
                        ].map((w, i) => (
                            <div key={i} className="why-choose-card">
                                <div className="why-choose-icon"><i className={`fas fa-${w.icon}`}></i></div>
                                <h3>{w.title}</h3>
                                <p>{w.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* 4.5 Our Premium Fleet Showcase */}
            <section className="ecab-fleet-section animate-on-scroll">
                <div className="container">
                    <h2 className="section-title">Experience Our <span className="orange-highlight">Premium Fleet</span></h2>
                    <p className="section-subtitle">Comfort, safety, and style in every ride.</p>

                    <div className="fleet-grid">
                        {/* Elite Cab Card */}
                        <div className="fleet-card animate-on-scroll fade-in-left">
                            <div className="fleet-image-wrapper">
                                <img src="/pictures/edrop1.jpeg" alt="E-Drop Premium Cab" />
                                <div className="fleet-badge">E-CABE ELITE</div>
                            </div>
                            <div className="fleet-details">
                                <h3>Elite Comfort</h3>
                                <p>Spacious interiors and premium amenities for your most important journeys.</p>
                                <div className="fleet-stats">
                                    <span><i className="fas fa-users"></i> 4 Seats</span>
                                    <span><i className="fas fa-snowflake"></i> Riksha </span>
                                </div>
                            </div>
                        </div>

                        {/* Smart Cab Card */}
                        <div className="fleet-card animate-on-scroll fade-in-right">
                            <div className="fleet-image-wrapper">
                                <img src="/pictures/edrop2.jpeg" alt="E-Drop Smart Cab" />
                                <div className="fleet-badge">E-CABE SMART</div>
                            </div>
                            <div className="fleet-details">
                                <h3>Smart Mobility</h3>
                                <p>Reliable and efficient transportation for your daily commute through the city.</p>
                                <div className="fleet-stats">
                                    <span><i className="fas fa-users"></i> 4 Seats</span>
                                    <span><i className="fas fa-gas-pump"></i> Eco-Friendly</span>
                                    <span><i className="fas fa-snowflake"></i> Fully AC</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section Specific Styling */}
                <style>{`
                    .ecab-fleet-section {
                        padding: 100px 0;
                        background: #fbfbfb;
                    }
                    .fleet-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                        gap: 30px;
                        margin-top: 50px;
                    }
                    .fleet-card {
                        background: white;
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.05);
                        transition: all 0.4s ease;
                        border: 1px solid #eee;
                    }
                    .fleet-card:hover {
                        transform: translateY(-10px);
                        box-shadow: 0 30px 60px rgba(0,0,0,0.1);
                    }
                    .fleet-image-wrapper {
                        position: relative;
                        height: 300px;
                        overflow: hidden;
                    }
                    .fleet-image-wrapper img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.6s ease;
                    }
                    .fleet-card:hover .fleet-image-wrapper img {
                        transform: scale(1.1);
                    }
                    .fleet-badge {
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: #ff6b35;
                        color: white;
                        padding: 8px 20px;
                        border-radius: 30px;
                        font-weight: 700;
                        font-size: 0.85rem;
                        box-shadow: 0 10px 20px rgba(255, 107, 53, 0.3);
                    }
                    .fleet-details {
                        padding: 30px;
                    }
                    .fleet-details h3 {
                        font-size: 1.5rem;
                        margin-bottom: 15px;
                        color: #1a1a1a;
                    }
                    .fleet-details p {
                        color: #666;
                        margin-bottom: 25px;
                        line-height: 1.6;
                    }
                    .fleet-stats {
                        display: flex;
                        gap: 20px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                    }
                    .fleet-stats span {
                        color: #444;
                        font-weight: 600;
                        font-size: 1rem;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    .fleet-stats i {
                        color: #ff6b35;
                    }
                    @media (max-width: 768px) {
                        .fleet-grid {
                            grid-template-columns: 1fr;
                        }
                        .fleet-image-wrapper {
                            height: 250px;
                        }
                    }
                `}</style>
            </section>

            {/* 5. Get Quote Section */}
            <section className="ecab-quote-section animate-on-scroll">
                <div className="container">
                    <div className="quote-card">
                        <div className="quote-header">
                            <p>Enter your details below to get an instant fare estimate for your journey.</p>
                        </div>
                        <form className="quote-form" onSubmit={(e) => handleRestrictedClick(e) && handleQuoteSubmit(e)}>
                            <div className="form-group">
                                <label><i className="fas fa-map-marker-alt"></i> Pickup Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter pickup area"
                                    value={quoteData.pickup}
                                    onChange={(e) => setQuoteData({ ...quoteData, pickup: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-map-pin"></i> Drop-off Location</label>
                                <input
                                    type="text"
                                    placeholder="Enter destination area"
                                    value={quoteData.dropoff}
                                    onChange={(e) => setQuoteData({ ...quoteData, dropoff: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label><i className="fas fa-car"></i> Ride Type</label>
                                <select
                                    value={quoteData.rideType}
                                    onChange={(e) => setQuoteData({ ...quoteData, rideType: e.target.value })}
                                >
                                    <option value="Mini">E-Mini</option>
                                    <option value="AC">E-Cab AC</option>
                                    <option value="Rickshaw">E-Rickshaw</option>
                                    <option value="Cargo">E-Cargo Lite</option>
                                </select>
                            </div>
                            <button type="submit" className="quote-btn">Calculate Fare</button>
                        </form>

                        {estimate && (
                            <div className="estimate-result animate-on-scroll fade-in-up">
                                <div className="estimate-val">
                                    <span>Estimated Fare</span>
                                    <h3>Rs. {estimate.total}</h3>
                                </div>
                                <div className="estimate-details-breakdown">
                                    <p><i className="fas fa-route"></i> Estimated Distance: <strong>{estimate.distance} km</strong></p>
                                    <p><i className="fas fa-tag"></i> Rate: <strong>Rs. {estimate.rate}/km</strong></p>
                                    <p><i className="fas fa-plus-circle"></i> Base Fare: <strong>Rs. {estimate.base}</strong></p>
                                </div>
                                <p className="disclaimer">Standard rates apply. Actual fare may vary based on traffic and time.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 6. Download App */}
            <section className="download-app-ecab animate-on-scroll" style={{ padding: '100px 0', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '50px' }}>
                        <div className="animate-on-scroll fade-in-left" style={{ flex: 1, minWidth: '300px' }}>
                            <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'white', marginBottom: '20px', letterSpacing: '-1px' }}>Get the E-Drop App Today!</h2>
                            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', marginBottom: '40px', lineHeight: '1.7' }}>
                                Experience fast, reliable, and safe rides by downloading our app from your preferred store!
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
                            <img src="/pictures/phone_app.png" alt="Phone" style={{ maxWidth: '100%', height: 'auto', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))' }} />
                        </div>
                    </div>
                </div>
            </section>

            <RestrictedAccessModal
                isOpen={isAuthAlertOpen}
                onClose={() => setIsAuthAlertOpen(false)}
                onLoginClick={onAuthClick}
            />
        </main>
    );
};

export default ECab;
