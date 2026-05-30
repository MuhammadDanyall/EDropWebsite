import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthGate } from '../hooks/useAuthGate';
import RestrictedAccessModal from '../components/RestrictedAccessModal';

const About = ({ onAuthClick }) => {
    const { isAuthAlertOpen, setIsAuthAlertOpen, handleRestrictedClick } = useAuthGate();
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [siteContent, setSiteContent] = useState({
        aboutPageStory: "E-Drop is a multi-service digital platform designed to simplify transportation and logistics by combining cab, cargo, and shipping services in one system.",
        aboutPageMission: "To provide exceptional user convenience through reliable, efficient, and innovative transportation and logistics services.",
        aboutPageVision: "To become Pakistan's leading transportation and logistics platform, continuously expanding our services."
    });

    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);

        // Preloader timeout
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        // Scroll animation logic (Intersection Observer)
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Add animate-visible for the About section if needed
                    entry.target.classList.add('animate-visible');
                }
            });
        }, observerOptions);

        // Common classes used in original script.js or styles.css for animations
        const animatedElements = document.querySelectorAll('.section, .animate-on-scroll, .problem-card, .solution-card, .service-item, .tech-item, .why-item, .mission-card, .vision-card');
        animatedElements.forEach(el => observer.observe(el));

        // Fetch Dynamic Content
        const fetchContent = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/content');
                if (res.data) {
                    setSiteContent(res.data);
                }
            } catch (err) {
                console.error("Error fetching about page content:", err);
            }
        };
        fetchContent();

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, []);

    return (
        <div id="about-page-wrapper">
            {/* Premium Preloader */}
            {loading && (
                <div id="preloader">
                    <div className="preloader-content">
                        <div className="loader-truck">
                            <img 
                                src="/pictures/logo.jpeg" 
                                alt="E-Drop Logo"
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)' }}
                            />
                        </div>
                        <div className="loader-track">
                            <div className="loader-progress"></div>
                        </div>
                        <div className="loader-text">E-DROP</div>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <section className="about-hero">
                <div className="section-content">
                    <h1>E-DROP</h1>
                    <div className="tagline">"One Platform for Transportation & Logistics Solutions"</div>
                    <div className="intro">
                        E-Drop is a comprehensive digital platform that revolutionizes transportation and logistics by bringing
                        together multiple essential services under one unified system, making transportation seamless and
                        efficient for users across Pakistan.
                    </div>
                </div>
            </section>

            <section className="section who-we-are">
                <div className="section-content">
                    <h2>Who <span>We Are</span></h2>
                    <div className="who-we-are-text">
                        <p>{siteContent.aboutPageStory}</p>
                    </div>
                </div>
                <style>{`
                    .who-we-are-text {
                        max-width: 800px;
                        margin: 0 auto;
                        text-align: center;
                        font-size: 1.2rem;
                        line-height: 1.8;
                        color: #666;
                    }
                `}</style>
            </section>

            {/* Video Presentation Section */}
            <section className="section about-video-section">
                <div className="section-content">
                    <h2>Experience <span>E-Drop</span></h2>
                    <div className="about-video-container animate-on-scroll">
                        <div className="video-glass-overlay"></div>
                        <video 
                            id="aboutMainVideo"
                            src="/pictures/edrop_video.mp4" 
                            autoPlay 
                            muted={isMuted} 
                            loop 
                            playsInline 
                            className="about-page-video"
                        />
                        <div className="video-content-overlay">
                            <div className="play-hint">
                                <i className="fas fa-play-circle"></i>
                                <span>Watch Our Journey</span>
                            </div>
                            <button 
                                className="video-sound-toggle"
                                onClick={() => setIsMuted(!isMuted)}
                                title={isMuted ? "Unmute" : "Mute"}
                            >
                                <i className={isMuted ? "fas fa-volume-mute" : "fas fa-volume-up"}></i>
                            </button>
                        </div>
                    </div>
                </div>
                <style>{`
                    .about-video-section {
                        padding: 100px 20px;
                        background: linear-gradient(rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), url("/pictures/about_bg.png");
                        background-size: cover;
                        background-position: center;
                        background-attachment: fixed;
                        position: relative;
                    }
                    .about-video-container {
                        position: relative;
                        max-width: 1000px;
                        margin: 40px auto;
                        border-radius: 28px;
                        overflow: hidden;
                        box-shadow: 0 40px 80px rgba(0,0,0,0.15);
                        aspect-ratio: 16/9;
                        border: 4px solid rgba(255, 255, 255, 0.4);
                        backdrop-filter: blur(10px);
                    }
                    .about-page-video {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .about-video-container:hover .about-page-video {
                        transform: scale(1.05);
                    }
                    .video-glass-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: linear-gradient(135deg, rgba(255, 107, 53, 0.05) 0%, rgba(0,0,0,0.1) 100%);
                        pointer-events: none;
                        z-index: 1;
                    }
                    .video-content-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 2;
                        pointer-events: none;
                    }
                    .play-hint {
                        position: absolute;
                        bottom: 40px;
                        left: 40px;
                        display: flex;
                        align-items: center;
                        gap: 15px;
                        color: white;
                        font-weight: 600;
                        letter-spacing: 0.5px;
                        text-shadow: 0 2px 10px rgba(0,0,0,0.5);
                        background: rgba(255, 107, 53, 0.9);
                        padding: 12px 28px;
                        border-radius: 50px;
                        backdrop-filter: blur(10px);
                        box-shadow: 0 8px 30px rgba(255, 107, 53, 0.3);
                        transition: all 0.3s ease;
                        pointer-events: auto;
                        cursor: default;
                    }
                    .play-hint:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 12px 40px rgba(255, 107, 53, 0.4);
                        background: #ff6b35;
                    }
                    .video-sound-toggle {
                        position: absolute;
                        bottom: 40px;
                        right: 40px;
                        width: 54px;
                        height: 54px;
                        border-radius: 50%;
                        background: rgba(255, 255, 255, 0.2);
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255, 255, 255, 0.3);
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 1.2rem;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                        pointer-events: auto;
                        z-index: 10;
                    }
                    .video-sound-toggle:hover {
                        background: rgba(255, 107, 53, 0.9);
                        transform: scale(1.1);
                        box-shadow: 0 15px 40px rgba(255, 107, 53, 0.4);
                    }
                    .play-hint i {
                        font-size: 1.4rem;
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.1); opacity: 0.8; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </section>

            {/* Problem Statement & Solution */}
            <section className="section problem-solution">
                <div className="section-content">
                    <div className="container">
                        <div className="problem-card">
                            <h3><i className="fas fa-exclamation-triangle me-2"></i>Problem Statement</h3>
                            <p>Users currently rely on multiple applications for ride booking, cargo delivery, and shipping
                                services, which creates inconvenience and inefficiency.</p>
                            <p>The fragmented approach leads to higher costs, longer wait times, and poor user experience across
                                different transportation needs.</p>
                            <p>Small businesses and individual users struggle to find reliable, affordable solutions for their
                                diverse transportation requirements.</p>
                        </div>
                        <div className="solution-card">
                            <h3><i className="fas fa-lightbulb me-2"></i>Our Solution</h3>
                            <p>E-Drop provides a unified solution where users can access multiple transportation and logistics
                                services through a single platform.</p>
                            <p>Our integrated approach combines ride-hailing, cargo transportation, and shipping services,
                                creating a seamless user experience.</p>
                            <p>Future scalability ensures we can expand services and features as user needs evolve and
                                technology advances.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Overview */}
            <section className="section services-overview">
                <div className="section-content">
                    <h2>Our <span>Services</span></h2>
                    <p className="services-subtitle">A comprehensive overview
                        of transportation and logistics solutions</p>

                    <div className="services-grid">
                        <div className="service-item">
                            <i className="fas fa-taxi"></i>
                            <h4>E-Cab</h4>
                            <p>Reliable ride-hailing service connecting passengers with drivers for safe and comfortable
                                transportation.</p>
                        </div>
                        <div className="service-item">
                            <i className="fas fa-truck"></i>
                            <h4>E-Cargo</h4>
                            <p>Efficient freight and cargo transportation solutions for businesses and individuals.</p>
                        </div>
                        <div className="service-item">
                            <i className="fas fa-shipping-fast"></i>
                            <h4>E-Shipping</h4>
                            <p>Fast and secure parcel delivery services ensuring timely and safe package transportation.</p>
                        </div>
                    </div>
                </div>
                <style>{`
                    .services-subtitle {
                        text-align: center;
                        font-size: 1.1rem;
                        color: #666;
                        margin-bottom: 3rem;
                    }
                `}</style>
            </section>

            <section className="section mission-vision">
                <div className="section-content">
                    <h2>Mission & <span>Vision</span></h2>
                    <div className="container">
                        <div className="mission-card">
                            <h3><i className="fas fa-bullseye me-2"></i>Our Mission</h3>
                            <p>{siteContent.aboutPageMission}</p>
                        </div>
                        <div className="vision-card">
                            <h3><i className="fas fa-eye me-2"></i>Our Vision</h3>
                            <p>{siteContent.aboutPageVision}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Technology We Use */}
            <section className="section technology">
                <div className="section-content">
                    <h2>Technology <span>We Use</span></h2>
                    <p className="tech-subtitle">Built with modern
                        technologies for optimal performance and scalability</p>

                    <div className="tech-grid">
                        <div className="tech-item">
                            <i className="fab fa-react"></i>
                            <h4>React.js</h4>
                            <p>Modern JavaScript library for building interactive user interfaces</p>
                        </div>
                        <div className="tech-item">
                            <i className="fab fa-node-js"></i>
                            <h4>Node.js & Express</h4>
                            <p>Server-side JavaScript runtime and web application framework</p>
                        </div>
                        <div className="tech-item">
                            <i className="fas fa-database"></i>
                            <h4>MongoDB</h4>
                            <p>NoSQL database for flexible and scalable data storage</p>
                        </div>
                        <div className="tech-item">
                            <i className="fas fa-mobile-alt"></i>
                            <h4>Flutter</h4>
                            <p>Cross-platform mobile app development framework</p>
                        </div>
                        <div className="tech-item">
                            <i className="fas fa-code"></i>
                            <h4>REST APIs</h4>
                            <p>Application Programming Interfaces for seamless integration</p>
                        </div>
                        <div className="tech-item">
                            <i className="fas fa-map-marked-alt"></i>
                            <h4>Maps Integration</h4>
                            <p>Location services and real-time tracking capabilities</p>
                        </div>
                    </div>
                </div>
                <style>{`
                    .tech-subtitle {
                        text-align: center;
                        font-size: 1.1rem;
                        color: #666;
                        margin-bottom: 3rem;
                    }
                `}</style>
            </section>

            {/* Why E-Droop */}
            <section className="section why-edroop">
                <div className="section-content">
                    <h2>Why <span>E-Drop?</span></h2>
                    <p className="why-subtitle">What makes us the
                        preferred choice for transportation and logistics</p>

                    <div className="why-grid">
                        <div className="why-item">
                            <i className="fas fa-unity"></i>
                            <h4>One Platform</h4>
                            <p>Access all transportation services from a single, unified platform instead of managing multiple
                                applications.</p>
                        </div>
                        <div className="why-item">
                            <i className="fas fa-expand-arrows-alt"></i>
                            <h4>Scalable System</h4>
                            <p>Built with scalability in mind, our platform can grow and adapt to increasing user demands and
                                new requirements.</p>
                        </div>
                        <div className="why-item">
                            <i className="fas fa-rocket"></i>
                            <h4>Future-Ready</h4>
                            <p>Designed with cutting-edge technology to incorporate future innovations and emerging
                                transportation trends.</p>
                        </div>
                        <div className="why-item">
                            <i className="fas fa-user-friends"></i>
                            <h4>User-Centric Design</h4>
                            <p>Every feature and service is designed with the user experience as the top priority, ensuring ease
                                of use and satisfaction.</p>
                        </div>
                    </div>
                </div>
                <style>{`
                    .why-subtitle {
                        text-align: center;
                        font-size: 1.1rem;
                        color: #666;
                        margin-bottom: 3rem;
                    }
                `}</style>
            </section>

            {/* Closing Section — Premium Redesign */}
            <section className="closing-section">
                {/* Animated floating orbs */}
                <div className="closing-orb closing-orb-1"></div>
                <div className="closing-orb closing-orb-2"></div>
                <div className="closing-orb closing-orb-3"></div>

                <div className="section-content closing-inner">
                    <div className="closing-badge">OUR PROMISE</div>
                    <h2>Redefining <span>Transportation</span> &amp; <span>Logistics</span></h2>
                    <p>E-Drop aims to redefine transportation and logistics through innovation, technology, and user-focused
                        solutions that make mobility seamless and efficient for everyone in Pakistan.</p>

                    <div className="closing-highlights">
                        <div className="closing-highlight-item">
                            <i className="fas fa-bolt"></i>
                            <span>Fast Delivery</span>
                        </div>
                        <div className="closing-highlight-item">
                            <i className="fas fa-shield-alt"></i>
                            <span>100% Secure</span>
                        </div>
                        <div className="closing-highlight-item">
                            <i className="fas fa-headset"></i>
                            <span>24/7 Support</span>
                        </div>
                    </div>

                    <Link to="/#contact" className="closing-cta-btn" onClick={(e) => !handleRestrictedClick(e) && e.preventDefault()}>
                        <span>Get In Touch</span>
                        <i className="fas fa-arrow-right"></i>
                    </Link>
                </div>
            </section>

            <RestrictedAccessModal 
                isOpen={isAuthAlertOpen} 
                onClose={() => setIsAuthAlertOpen(false)} 
                onLoginClick={onAuthClick} 
            />

            {/* Custom Styles for Animation visible state if not in main CSS */}
            <style>{`
                .section, .animate-on-scroll, .problem-card, .solution-card, .service-item, .tech-item, .why-item, .mission-card, .vision-card {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .section.visible, .animate-on-scroll.visible, .problem-card.visible, .solution-card.visible, .service-item.visible, .tech-item.visible, .why-item.visible, .mission-card.visible, .vision-card.visible {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
        </div>
    );
};

export default About;
