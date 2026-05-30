import React, { useEffect } from 'react';

const TermsConditions = () => {
    useEffect(() => {
        window.scrollTo(0, 0);

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => observer.observe(el));

        // Immediately show hero elements
        const heroContent = document.querySelector('.terms-hero-content');
        if (heroContent) {
            setTimeout(() => {
                heroContent.classList.add('visible');
            }, 100);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div id="terms-conditions-page">
            <style>{`
                :root {
                    --primary-orange: #ff6b35;
                    --primary-gradient: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
                    --bg-color: #f4f7f6;
                    --text-main: #2b2d42;
                    --text-muted: #6c757d;
                    --glass-bg: rgba(255, 255, 255, 0.95);
                }

                #terms-conditions-page {
                    background-color: var(--bg-color);
                    font-family: 'Poppins', sans-serif;
                    color: var(--text-main);
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                }

                .terms-hero {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    padding: 80px 20px 150px 20px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .terms-hero::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -10%;
                    width: 500px;
                    height: 500px;
                    background: radial-gradient(circle, rgba(255, 107, 53, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
                    border-radius: 50%;
                    z-index: 1;
                }

                .terms-hero::after {
                    content: '';
                    position: absolute;
                    bottom: -20%;
                    right: -5%;
                    width: 400px;
                    height: 400px;
                    background: radial-gradient(circle, rgba(255, 140, 66, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
                    border-radius: 50%;
                    z-index: 1;
                }

                .terms-hero-content {
                    position: relative;
                    z-index: 2;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .terms-hero h1 {
                    font-size: 3rem;
                    font-weight: 800;
                    color: #ffffff;
                    margin-bottom: 15px;
                    line-height: 1.2;
                    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                }

                .terms-hero .last-updated {
                    font-size: 1.1rem;
                    color: #a0aab2;
                    font-weight: 400;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 8px 20px;
                    border-radius: 20px;
                    backdrop-filter: blur(5px);
                }

                .terms-main {
                    max-width: 850px;
                    margin: -100px auto 80px auto;
                    position: relative;
                    z-index: 5;
                    padding: 0 20px;
                }

                .terms-card {
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 24px;
                    padding: 50px 60px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
                    border: 1px solid white;
                }

                .terms-intro {
                    font-size: 1.15rem;
                    color: var(--text-muted);
                    line-height: 1.8;
                    margin-bottom: 40px;
                    text-align: center;
                    font-weight: 400;
                }

                .terms-grid {
                    display: grid;
                    gap: 25px;
                }

                .term-section {
                    position: relative;
                    padding: 30px;
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border: 1px solid #f0f0f0;
                    border-left: 4px solid var(--primary-orange);
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                }

                .term-section:hover {
                    transform: translateY(-5px) scale(1.02);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
                    border-color: rgba(255, 107, 53, 0.2);
                    border-left-color: #ff8c42;
                }

                .term-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 15px;
                    gap: 15px;
                }

                .term-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(255, 107, 53, 0.1);
                    color: var(--primary-orange);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                    transition: all 0.3s ease;
                }

                .term-section:hover .term-icon {
                    background: var(--primary-gradient);
                    color: white;
                    box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
                }

                .term-section h2 {
                    font-size: 1.3rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                    line-height: 1.3;
                }

                .term-section p {
                    margin: 0;
                    font-size: 1.05rem;
                    color: var(--text-muted);
                    line-height: 1.7;
                    text-align: left;
                }

                .fade-in-up {
                    opacity: 0;
                    transform: translateY(30px);
                    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
                }

                .fade-in-up.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                @media (max-width: 768px) {
                    .terms-hero { padding: 100px 20px 100px 20px; }
                    .terms-hero h1 { font-size: 2.2rem; }
                    .terms-main { margin-top: -60px; }
                    .terms-card { padding: 30px 20px; border-radius: 20px; }
                    .term-section { padding: 25px 20px; }
                    .term-section h2 { font-size: 1.2rem; }
                    .terms-intro, .term-section p { font-size: 0.95rem; }
                }
            `}</style>

            <section className="terms-hero">
                <div className="terms-hero-content fade-in-up">
                    <h1>Terms & Conditions</h1>
                    <div className="last-updated">
                        <i className="far fa-clock"></i> Last Updated: March 9, 2026
                    </div>
                </div>
            </section>

            <main className="terms-main">
                <div className="terms-card fade-in-up" style={{ transitionDelay: '0.2s' }}>
                    <p className="terms-intro">
                        Welcome to <strong>E Drop</strong>. These terms and conditions outline the rules and regulations for the
                        use of our logistics and delivery platform. By accessing this service, we assume you accept these terms
                        in full.
                    </p>

                    <div className="terms-grid">

                        <div className="term-section fade-in-up" style={{ transitionDelay: '0.1s' }}>
                            <div className="term-header">
                                <div className="term-icon"><i className="fas fa-balance-scale"></i></div>
                                <h2>1. Service Usage</h2>
                            </div>
                            <p>E-Drop is a logistics and delivery management platform. Users must only use the service for legal
                                and permitted items. Illegal, dangerous, or prohibited goods are strictly forbidden to ensure
                                safety and legal compliance.</p>
                        </div>

                        <div className="term-section fade-in-up" style={{ transitionDelay: '0.2s' }}>
                            <div className="term-header">
                                <div className="term-icon"><i className="fas fa-map-marker-alt"></i></div>
                                <h2>2. Order Responsibility</h2>
                            </div>
                            <p>It is the user's responsibility to provide an accurate pickup location, correct delivery address,
                                and precise item details. E-Drop is not liable for delays or losses caused by incorrect
                                information.</p>
                        </div>

                        <div className="term-section fade-in-up" style={{ transitionDelay: '0.3s' }}>
                            <div className="term-header">
                                <div className="term-icon"><i className="fas fa-box-open"></i></div>
                                <h2>3. Item Safety & Packaging</h2>
                            </div>
                            <p>Users must pack items properly. Fragile items must be clearly labeled. E-Drop will not be
                                responsible for any damage resulting from poor packaging.</p>
                        </div>

                        <div className="term-section fade-in-up" style={{ transitionDelay: '0.4s' }}>
                            <div className="term-header">
                                <div className="term-icon"><i className="fas fa-truck-fast"></i></div>
                                <h2>4. Delivery Time</h2>
                            </div>
                            <p>Delivery times are estimates and are not guaranteed. Delays may occur due to traffic, weather
                                conditions, or technical issues.</p>
                        </div>

                        <div className="term-section fade-in-up" style={{ transitionDelay: '0.5s' }}>
                            <div className="term-header">
                                <div className="term-icon"><i className="fas fa-satellite-dish"></i></div>
                                <h2>5. Tracking & Updates</h2>
                            </div>
                            <p>Users will be provided with a tracking ID. While we aim for real-time updates, delays may occur
                                due to network or technical issues.</p>
                        </div>

                        <div className="term-section fade-in-up" style={{ transitionDelay: '0.6s' }}>
                            <div className="term-header">
                                <div className="term-icon"><i className="fas fa-money-bill-wave"></i></div>
                                <h2>6. Payment Terms</h2>
                            </div>
                            <p>Currently, we accept Cash on Delivery (COD). Online payment options may be added in the future.
                                Once an order is placed, charges may become non-refundable.</p>
                        </div>

                        <div className="term-section fade-in-up" style={{ transitionDelay: '0.7s' }}>
                            <div className="term-header">
                                <div className="term-icon"><i className="fas fa-ban"></i></div>
                                <h2>7. Cancellation Policy</h2>
                            </div>
                            <p>Orders can only be cancelled before the pickup. Once the item is picked up, cancellation is not
                                allowed, and charges may apply.</p>
                        </div>

                        <div className="term-section fade-in-up" style={{ transitionDelay: '0.8s' }}>
                            <div className="term-header">
                                <div className="term-icon"><i className="fas fa-shield-virus"></i></div>
                                <h2>8. Limitation of Liability</h2>
                            </div>
                            <p>E-Drop is not fully responsible for losses caused by natural disasters, accidents, or third-party
                                delays beyond our control.</p>
                        </div>

                        <div className="term-section fade-in-up" style={{ transitionDelay: '0.9s' }}>
                            <div className="term-header">
                                <div className="term-icon"><i className="fas fa-user-lock"></i></div>
                                <h2>9. Data Privacy</h2>
                            </div>
                            <p>Your data is secure with us and will never be sold to third parties. Please refer to our Privacy
                                Policy for more details.</p>
                        </div>

                        <div className="term-section fade-in-up" style={{ transitionDelay: '1.0s' }}>
                            <div className="term-header">
                                <div className="term-icon"><i className="fas fa-file-signature"></i></div>
                                <h2>10. Service Modifications</h2>
                            </div>
                            <p>E-Drop reserves the right to modify services, update terms, or add/remove features at any time
                                without prior notice.</p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default TermsConditions;
