import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuthGate } from '../hooks/useAuthGate';
import RestrictedAccessModal from '../components/RestrictedAccessModal';

const FAQ = ({ onAuthClick }) => {
    const { isAuthAlertOpen, setIsAuthAlertOpen, handleRestrictedClick } = useAuthGate();
    const [isLoading, setIsLoading] = React.useState(true);
    const [activeFaq, setActiveFaq] = React.useState(null); // format: "catIndex-itemIndex"
    const [siteContent, setSiteContent] = React.useState({
        faqGeneralTitle: "General Questions",
        faqSupportTitle: "Support & Help"
    });

    const toggleFaq = (e, catIdx, itemIdx) => {
        if (!handleRestrictedClick(e)) return;
        const key = `${catIdx}-${itemIdx}`;
        setActiveFaq(activeFaq === key ? null : key);
    };

    useEffect(() => {
        window.scrollTo(0, 0);

        // Preloader timeout
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        // Smooth scroll animation observer
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.fade-in-up');
        animatedElements.forEach(el => observer.observe(el));

        // Fetch Dynamic Content
        const fetchContent = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/content');
                if (res.data) {
                    setSiteContent(res.data);
                }
            } catch (err) {
                console.error("Error fetching faq content:", err);
            }
        };
        fetchContent();

        return () => clearTimeout(timer);
    }, []);

    const faqCategories = [
        {
            title: 'General Questions',
            icon: 'fas fa-info-circle',
            delay: '0.1s',
            items: [
                { q: 'What is E Drop?', a: 'E Drop is an integrated logistics and transport platform specifically designed for Kohat, providing Cab, Cargo, and Shipping services in one place.' },
                { q: 'Is E Drop available outside of Kohat?', a: 'Currently, we are focusing on establishing a strong foundation in Kohat, but our vision is to expand throughout the region.' },
                { q: 'What makes E Drop different from other courier services?', a: 'Unlike traditional services, E Drop offers a unified system for both passenger transport (Cabs) and logistics (Cargo) with a focus on modern tech like real-time tracking.' }
            ]
        },
        {
            title: 'Booking & App',
            icon: 'fas fa-mobile-alt',
            delay: '0.2s',
            items: [
                { q: 'Can I book a ride directly from the website?', a: 'No, the website is primarily for information and tracking purposes; all bookings must be made through our dedicated Mobile App.' },
                { q: 'Do I need an account to use E Drop?', a: 'Yes, you must sign up on the mobile app to book services, though you can track shipments on the website without logging in.' },
                { q: 'What happens if I forget my Tracking ID?', a: 'You can view your complete history of bookings and tracking IDs by logging into your account on the mobile app.' }
            ]
        },
        {
            title: 'Cargo & Shipping',
            icon: 'fas fa-box-open',
            delay: '0.3s',
            items: [
                { q: 'What types of items can I ship?', a: 'We specialize in the safe transport of various items, with a specific focus on E-waste management like mobiles, laptops, and batteries.' },
                { q: 'How are the charges calculated for Cargo?', a: 'Fares are dynamically calculated based on two main factors: the total Weight of the package and the total Distance to the destination.' }
            ]
        },
        {
            title: 'Advanced Logistics',
            icon: 'fas fa-truck-loading',
            delay: '0.3s',
            items: [
                { q: 'What happens if my cargo is damaged during transit?', a: 'We take the utmost care of your belongings. However, in the rare event of damage, E Drop has a dispute resolution system. Users can report the issue via the app within 24 hours with photos of the item for an investigation.' },
                { q: 'Is there a minimum or maximum weight limit for Cargo?', a: 'There is no minimum weight, but for very small items, we recommend using the "Mini-Parcel" option. The maximum weight depends on the vehicle type (Loader, Pickup, or Truck) selected during the booking process in the app.' },
                { q: 'Do you provide packaging materials?', a: 'Currently, users are required to pack their items securely. However, for E-waste (Laptops, Mobiles), our collectors provide specialized anti-static bags to ensure electronic safety.' }
            ]
        },
        {
            title: 'Security & Technology',
            icon: 'fas fa-shield-alt',
            delay: '0.4s',
            items: [
                { q: 'How is the "Estimated Time of Arrival" (ETA) calculated?', a: 'Our system uses a combination of distance data and real-time traffic analysis algorithms to provide the most accurate ETA for both Cabs and Cargo.' },
                { q: 'How unique is the Tracking ID?', a: 'Each Tracking ID is a unique alphanumeric code (e.g., ED-KJ892) generated by our backend algorithm. It is indexed in our database for O(1) search complexity, ensuring instant results when you track your package.' },
                { q: 'What if the driver/collector app goes offline during a trip?', a: 'The app is designed to cache location data locally. Once the connection is restored, the data is synced with the main database so that the user\'s tracking screen is updated.' },
                { q: 'Is my personal data safe with E Drop?', a: 'Absolutely. All user data, including names and locations, is stored in a secure database and is never shared with third parties.' }
            ]
        },
        {
            title: 'Payments & Cancellations',
            icon: 'fas fa-money-bill-wave',
            delay: '0.5s',
            items: [
                { q: 'Can I cancel a booking after the driver has arrived?', a: 'Yes, but a small "Cancellation Fee" may apply to compensate the driver for their time and fuel. If cancelled before the driver departs, no fee is charged.' },
                { q: 'Are there any hidden charges in the fare?', a: 'No. The fare shown on the app after calculating weight and distance is final. It includes all service charges and taxes.' }
            ]
        },
        {
            title: 'Local Operations & Future',
            icon: 'fas fa-map-marked-alt',
            delay: '0.6s',
            items: [
                { q: 'Does E Drop operate 24/7 in Kohat?', a: 'Our app is active 24/7. However, the availability of Cabs and Cargo collectors may vary during late-night hours based on driver availability in specific sectors of Kohat.' },
                { q: 'Can I book multiple Cabs or Cargo trucks at once?', a: 'Yes, the app allows users to manage multiple active bookings simultaneously under the "My Bookings" section.' },
                { q: 'What is the \'Future Vision\' of E Drop?', a: 'We aim to pioneer Drone Delivery and autonomous logistics to make transport faster and more efficient in our region.' }
            ]
        }
    ];

    return (
        <div id="faq-page">
            {isLoading && (
                <div id="preloader">
                    <div className="preloader-content">
                        <div className="loader-truck">
                            <img src="/pictures/logo.jpeg" alt="E-Drop Logo" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '50%', boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)' }} />
                        </div>
                        <div className="loader-track"><div className="loader-progress"></div></div>
                        <div className="loader-text">E-DROP</div>
                    </div>
                </div>
            )}

            <style>{`
                #faq-page {
                    background-color: #f4f7f6;
                    color: #2b2d42;
                    min-height: 100vh;
                    font-family: 'Poppins', sans-serif;
                }
                .faq-hero {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                    padding: 80px 20px 150px 20px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                .faq-hero::before {
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
                .faq-hero::after {
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
                .faq-hero-content {
                    position: relative;
                    z-index: 2;
                    max-width: 800px;
                    margin: 0 auto;
                }
                .faq-hero h1 {
                    font-size: 3rem;
                    font-weight: 800;
                    color: #ffffff;
                    margin-bottom: 15px;
                    line-height: 1.2;
                    text-shadow: 0 4px 10px rgba(0,0,0,0.3);
                    text-transform: uppercase;
                }
                .faq-hero .subtitle {
                    font-size: 1.1rem;
                    color: #a0aab2;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .faq-main {
                    max-width: 1000px;
                    margin: -80px auto 80px auto;
                    position: relative;
                    z-index: 5;
                    padding: 0 20px;
                }
                .faq-category {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    padding: 30px 40px;
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.05);
                    border: 1px solid white;
                    margin-bottom: 30px;
                    transition: transform 0.3s ease;
                }
                .faq-category:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
                }
                .category-title {
                    font-size: 1.4rem;
                    color: #2b2d42;
                    margin-bottom: 25px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    border-bottom: 2px solid #f0f0f0;
                    padding-bottom: 15px;
                }
                .category-title i {
                    color: #ff6b35;
                    font-size: 1.5rem;
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
                    .faq-hero { padding: 100px 20px 100px 20px; }
                    .faq-hero h1 { font-size: 2.2rem; }
                    .faq-main { margin-top: -50px; }
                    .faq-category { padding: 25px 20px; }
                }
            `}</style>
            
            <section className="faq-hero">
                <div className="faq-hero-content fade-in-up">
                    <h1>Help Center</h1>
                    <p className="subtitle">Detailed answers to everything you need to know about E Drop's logistics network, tracking, payments, and future vision.</p>
                </div>
            </section>

            <main className="faq-main">
                {faqCategories.map((cat, idx) => (
                    <div key={idx} className="faq-category fade-in-up" style={{ transitionDelay: cat.delay }}>
                        <h3 className="category-title">
                            <i className={cat.icon}></i> {cat.title}
                        </h3>
                        <div className="faq-accordion">
                            {cat.items.map((item, i) => {
                                const isOpen = activeFaq === `${idx}-${i}`;
                                return (
                                    <div key={i} className={`faq-item ${isOpen ? 'active' : ''}`}>
                                        <button className="faq-question" onClick={(e) => toggleFaq(e, idx, i)}>
                                            {item.q}
                                            <i className="fas fa-chevron-down"></i>
                                        </button>
                                        <div className="faq-answer" style={{ maxHeight: isOpen ? '500px' : '0' }}>
                                            <p>{item.a}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </main>

            <RestrictedAccessModal 
                isOpen={isAuthAlertOpen} 
                onClose={() => setIsAuthAlertOpen(false)} 
                onLoginClick={onAuthClick} 
            />
        </div>
    );
};

export default FAQ;
