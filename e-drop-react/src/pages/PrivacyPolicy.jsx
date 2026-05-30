import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
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
        const heroContent = document.querySelector('.policy-hero-content');
        if (heroContent) {
            setTimeout(() => {
                heroContent.classList.add('visible');
            }, 100);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <div id="privacy-policy-page">
            <style>{`
                :root {
                    --primary-orange: #ff6b35;
                    --primary-gradient: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
                    --bg-color: #f4f7f6;
                    --text-main: #2b2d42;
                    --text-muted: #6c757d;
                    --glass-bg: rgba(255, 255, 255, 0.95);
                }

                #privacy-policy-page {
                    background-color: var(--bg-color);
                    font-family: 'Poppins', sans-serif;
                    color: var(--text-main);
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                }

                .policy-hero {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    padding: 80px 20px 150px 20px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                .policy-hero::before {
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

                .policy-hero::after {
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

                .policy-hero-content {
                    position: relative;
                    z-index: 2;
                    max-width: 800px;
                    margin: 0 auto;
                }

                .policy-hero h1 {
                    font-size: 3rem;
                    font-weight: 800;
                    color: #ffffff;
                    margin-bottom: 15px;
                    line-height: 1.2;
                    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
                }

                .policy-hero .last-updated {
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

                .policy-main {
                    max-width: 850px;
                    margin: -100px auto 80px auto;
                    position: relative;
                    z-index: 5;
                    padding: 0 20px;
                }

                .policy-card {
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 24px;
                    padding: 50px 60px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
                    border: 1px solid white;
                }

                .policy-intro {
                    font-size: 1.15rem;
                    color: var(--text-muted);
                    line-height: 1.8;
                    margin-bottom: 40px;
                    text-align: center;
                    font-weight: 400;
                }

                .policy-section {
                    margin-bottom: 45px;
                    position: relative;
                    padding: 30px;
                    background: #ffffff;
                    border-radius: 16px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                    border: 1px solid #f0f0f0;
                    text-align: left;
                }

                .policy-section:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05);
                    border-color: rgba(255, 107, 53, 0.2);
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                    gap: 15px;
                }

                .icon-box {
                    width: 45px;
                    height: 45px;
                    border-radius: 12px;
                    background: var(--primary-gradient);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 1.2rem;
                    box-shadow: 0 5px 15px rgba(255, 107, 53, 0.3);
                }

                .policy-section h2 {
                    font-size: 1.6rem;
                    font-weight: 700;
                    color: var(--text-main);
                    margin: 0;
                }

                .policy-section p {
                    margin-bottom: 20px;
                    font-size: 1.05rem;
                    color: var(--text-muted);
                    line-height: 1.7;
                    text-align: left;
                }

                .policy-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                    text-align: left;
                }

                .policy-list li {
                    position: relative;
                    padding-left: 35px;
                    margin-bottom: 15px;
                    font-size: 1.05rem;
                    color: var(--text-muted);
                    display: flex;
                    align-items: flex-start;
                }

                .policy-list li::before {
                    content: '\\f00c';
                    font-family: 'Font Awesome 6 Free';
                    font-weight: 900;
                    position: absolute;
                    left: 0;
                    top: 2px;
                    color: var(--primary-orange);
                    font-size: 1.1rem;
                    background: rgba(255, 107, 53, 0.1);
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .policy-list strong {
                    color: var(--text-main);
                    font-weight: 600;
                    margin-right: 5px;
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
                    .policy-hero { padding: 100px 20px 100px 20px; }
                    .policy-hero h1 { font-size: 2.2rem; }
                    .policy-main { margin-top: -60px; }
                    .policy-card { padding: 30px 20px; border-radius: 20px; }
                    .policy-section { padding: 25px 20px; }
                    .policy-section h2 { font-size: 1.4rem; }
                    .policy-intro, .policy-section p, .policy-list li { font-size: 0.95rem; }
                }
            `}</style>

            <section className="policy-hero">
                <div className="policy-hero-content fade-in-up">
                    <h1>Privacy Policy</h1>
                    <div className="last-updated">
                        <i className="far fa-clock"></i> Last Updated: March 9, 2026
                    </div>
                </div>
            </section>

            <main className="policy-main">
                <div className="policy-card fade-in-up" style={{ transitionDelay: '0.2s' }}>
                    <p className="policy-intro">
                        At <strong>E Drop</strong>, we are committed to protecting the privacy and security of our users. This
                        policy outlines how we collect, use, and safeguard your personal information within our modern logistics
                        and transport ecosystem.
                    </p>

                    <div className="policy-section fade-in-up" style={{ transitionDelay: '0.3s' }}>
                        <div className="section-header">
                            <div className="icon-box"><i className="fas fa-database"></i></div>
                            <h2>1. Information We Collect</h2>
                        </div>
                        <p>To provide a seamless experience on our Mobile App and Web Portal, we collect the following data:</p>
                        <ul className="policy-list">
                            <li><strong>Personal Identity:</strong> Name, Email Address, and Phone Number.</li>
                            <li><strong>Logistics Data:</strong> Pickup and Drop-off addresses.</li>
                            <li><strong>Real-time Location:</strong> GPS data to ensure accurate tracking and driver
                                coordination.</li>
                            <li><strong>Transaction Details:</strong> Information required for payment processing and fare
                                calculation (based on Weight and Distance).</li>
                        </ul>
                    </div>

                    <div className="policy-section fade-in-up" style={{ transitionDelay: '0.4s' }}>
                        <div className="section-header">
                            <div className="icon-box"><i className="fas fa-cogs"></i></div>
                            <h2>2. How We Use Your Information</h2>
                        </div>
                        <p>We use the collected data strictly for operational purposes:</p>
                        <ul className="policy-list">
                            <li>To facilitate Cab, Cargo, and Shipping bookings dynamically.</li>
                            <li>To provide Live Tracking updates directly on the website.</li>
                            <li>To calculate dynamic pricing and generate automated notifications.</li>
                            <li>To improve our system's efficiency for the people of Kohat.</li>
                        </ul>
                    </div>

                    <div className="policy-section fade-in-up" style={{ transitionDelay: '0.5s' }}>
                        <div className="section-header">
                            <div className="icon-box"><i className="fas fa-shield-alt"></i></div>
                            <h2>3. Data Storage & Security</h2>
                        </div>
                        <p>Your trust is our greatest asset. We implement state-of-the-art security protocols:</p>
                        <ul className="policy-list">
                            <li><strong>Secure Database:</strong> All personal information is stored in a highly secure,
                                centralized database.</li>
                            <li><strong>Encryption:</strong> Sensitive data (like passwords) is protected using
                                industry-standard hashing (e.g., Bcrypt).</li>
                            <li><strong>Restricted Access:</strong> Only authorized administrators have access to user records
                                for support and monitoring.</li>
                        </ul>
                    </div>

                    <div className="policy-section fade-in-up" style={{ transitionDelay: '0.6s' }}>
                        <div className="section-header">
                            <div className="icon-box"><i className="fas fa-user-lock"></i></div>
                            <h2>4. Third-Party Sharing</h2>
                        </div>
                        <p>We maintain a strict <strong>No-Sharing Policy</strong> to protect your identity.</p>
                        <ul className="policy-list">
                            <li>We never sell, trade, or rent your personal information to outside marketers or third parties.
                            </li>
                            <li>Data is only shared with authorized drivers or collectors strictly within the eDrop network to
                                complete your requested service.</li>
                        </ul>
                    </div>

                    <div className="policy-section fade-in-up" style={{ transitionDelay: '0.7s' }}>
                        <div className="section-header">
                            <div className="icon-box"><i className="fas fa-sync-alt"></i></div>
                            <h2>5. Policy Updates</h2>
                        </div>
                        <p>As we move toward our Future Vision (including Drone services and extensive shipping), this policy
                            may be updated. Users will be formally notified of significant changes through the mobile app or
                            website dashboard.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicy;
