import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // 1. Added axios for backend connection
import { useAuthGate } from '../hooks/useAuthGate';
import RestrictedAccessModal from '../components/RestrictedAccessModal';
import { API_BASE_URL } from '../config';

const Home = ({ onAuthClick }) => {
    const { user, isAuthAlertOpen, setIsAuthAlertOpen, handleRestrictedClick } = useAuthGate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeFaq, setActiveFaq] = useState(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [error, setError] = useState(false);
    const [isTrackingLoading, setIsTrackingLoading] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackingNumber) return;
        setIsTrackingLoading(true);
        setError(false);
        setTrackingResult(null);

        try {
            // Try Shipping first
            const resShipment = await axios.get(`${API_BASE_URL}/api/shipments/track/${trackingNumber}`);
            if (resShipment.data.success) {
                setTrackingResult({ ...resShipment.data.shipment, type: 'shipping' });
                return;
            }
        } catch (err) {
            // If not found in shipping, try Cargo
            try {
                const resCargo = await axios.get(`${API_BASE_URL}/api/cargo/track/${trackingNumber}`);
                if (resCargo.data.success) {
                    setTrackingResult({ ...resCargo.data.cargo, type: 'cargo' });
                    return;
                }
            } catch (err2) {
                console.error("Tracking Error (Cargo):", err2);
            }
            setError(true);
        } finally {
            setIsTrackingLoading(false);
        }
    };


    // --- 2. CONTACT FORM BACKEND LOGIC (NEW) ---
    const [contactData, setContactData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [formStatus, setFormStatus] = useState({ type: '', msg: '' });

    // --- 3. DYNAMIC SITE CONTENT LOGIC (NEW) ---
    const [siteContent, setSiteContent] = useState({
        heroTitle: "MOVING WAS NEVER\nSO EASY",
        heroSubtitle: "FAST & SECURE MOVE",
        aboutTitle: "TRANSPORT & LOGISTICS",
        aboutDesc1: "E-DROP is committed to revolutionizing transportation and logistics by providing simple, fast, and reliable solutions that connect people and businesses seamlessly. Our mission is to make every journey smooth and stress-free, from the moment you book to the final delivery.",
        aboutDesc2: "We offer innovative services including eCab for quick and comfortable rides, eShip for secure parcel delivery, and eCargo for comprehensive freight and logistics management. With our customer-first approach, we prioritize safety, timeliness, and peace of mind in every interaction.",
        contactPhone: "+92 321-125687",
        contactEmail: "sachdeva@coin.sin",
        contactLocation: "Sadar Bazar, Peshawar, Kpk"
    });



    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/content`);
                if (res.data) {
                    setSiteContent(res.data);
                }
            } catch (err) {
                console.error("Error fetching site content:", err);
            }
        };
        fetchContent();
    }, []);
    // --- END OF DYNAMIC CONTENT LOGIC ---

    const handleContactChange = (e) => {
        setContactData({ ...contactData, [e.target.name]: e.target.value });
    };

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setFormStatus({ type: 'info', msg: 'Sending...' });

        try {
            const res = await axios.post(`${API_BASE_URL}/api/contact/send`, contactData);
            setFormStatus({ type: 'success', msg: res.data.message });
            setContactData({ name: '', email: '', message: '' }); // Clear form
        } catch (err) {
            setFormStatus({ type: 'error', msg: 'Message could not be sent. ❌' });
        }
    };
    // --- END OF BACKEND LOGIC ---

    const testimonials = [
        {
            text: '"E-DROP made our office relocation incredibly smooth. Professional service and timely delivery. Highly recommended!"',
            author: 'JAVEED ASLAM',
            location: 'Lahore',
            image: '/pictures/t_javeed.png'
        },
        {
            text: '"The E-Cab service is fantastic! Clean vehicles, courteous drivers, and always on time. My go-to transportation solution."',
            author: 'NEELAM MUNIR',
            location: 'Peshawar',
            image: '/pictures/t_neelam.png'
        },
        {
            text: '"Their cargo tracking is spot on. I sent a heavy shipment to Karachi and was able to monitor it the whole way. Excellent experience!"',
            author: 'DANYAL',
            location: 'Islamabad',
            image: '/pictures/Muhammad Danyal.jpg'
        },
        {
            text: '"Very impressed by the prompt response and secure handling of fragile items. E-DROP is setting a new standard for logistics in Pakistan."',
            author: 'YASIR',
            location: 'Kohat',
            image: '/pictures/yasir.jpeg'
        },
        {
            text: '"Fast, reliable, and reasonably priced. The customer support team was also very helpful when I needed to update my delivery address."',
            author: 'ALI',
            location: 'Rawalpindi',
            image: 'https://ui-avatars.com/api/?name=Ali&background=ff6b35&color=fff&rounded=true'
        }
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // --- 0. Preloader ---
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);

        // --- 1. Counter Logic ---
        const counters = document.querySelectorAll('.counter-number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            let count = 0;
            const duration = 2000;
            const step = target / (duration / 16);

            const updateCount = () => {
                if (count < target) {
                    count += step;
                    counter.innerText = Math.floor(count);
                    requestAnimationFrame(updateCount);
                } else {
                    counter.innerText = target;
                }
            };

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    updateCount();
                    observer.unobserve(counter);
                }
            }, { threshold: 0.5 });
            observer.observe(counter);
        });

        // --- 2. Scroll Logic (Animations & Progress) ---
        const handleScroll = () => {
            const elements = document.querySelectorAll('.animate-on-scroll');
            elements.forEach((el, index) => {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.9) {
                    if (!el.classList.contains('animate-visible')) {
                        const delay = (index % 6) * 0.1;
                        el.style.transitionDelay = `${delay}s`;
                        el.classList.add('animate-visible');
                    }
                }
            });

            const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (window.pageYOffset / totalHeight) * 100;
            setScrollProgress(progress);

            const scrollToTopBtn = document.querySelector('.scroll-to-top');
            if (scrollToTopBtn) {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('visible');
                } else {
                    scrollToTopBtn.classList.remove('visible');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        setTimeout(handleScroll, 100);

        // --- 3. Magnetic Effects ---
        const magneticElements = document.querySelectorAll('.magnetic');
        magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                el.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) scale(1.05)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate(0, 0) scale(1)';
            });
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, []);

    return (
        <div id="home-page">
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

            {/* Scroll Progress Indicator */}
            <div className="scroll-progress" style={{ display: 'block' }}>
                <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
            </div>

            {/* Scroll to Top Button */}
            <button className="scroll-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ border: 'none', cursor: 'pointer' }}>
                <i className="fas fa-arrow-up"></i>
            </button>

            {/* Hero Section */}
            <section id="home" className="hero">
                <div className="hero-container">
                    <div className="hero-content">
                        <h2 className="hero-subtitle">
                            <span className="subtitle-line"></span>{siteContent.heroSubtitle}
                        </h2>
                        <h1 className="hero-title">
                            {siteContent.heroTitle.split('\n').map((line, index) => (
                                <React.Fragment key={index}>
                                    {line.includes('SO EASY') ? (
                                        <span className="accent-text" style={{ display: 'block' }}>{line}</span>
                                    ) : (
                                        <>
                                            {line}
                                            <br />
                                        </>
                                    )}
                                </React.Fragment>
                            ))}
                        </h1>
                        <div className="hero-btns" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '30px' }}>
                            <a href="#contact" className="cta-button magnetic" style={{ textDecoration: 'none' }}>
                                <span className="cta-text">GET STARTED</span>
                                <span className="cta-arrow"><i className="fas fa-chevron-right"></i></span>
                            </a>
                            <Link to="/eshipping" className="cta-button tracking-btn magnetic" onClick={(e) => !handleRestrictedClick(e) && e.preventDefault()} style={{
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '15px',
                                transition: 'all 0.4s ease',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                            }}>
                                <span className="cta-text" style={{ color: '#fff', fontWeight: '700', fontSize: '0.95rem', letterSpacing: '1px' }}>TRACK SHIPMENT</span>
                                <span className="cta-arrow" style={{ background: 'white', color: '#ff6b35', width: '35px', height: '35px' }}><i className="fas fa-search" style={{ fontSize: '0.9rem' }}></i></span>
                            </Link>
                        </div>
                    </div>
                    {/* Hero Statistics */}
                    <div className="hero-stats-new">
                        <div className="stat-item-new animate-on-scroll fade-in-right">
                            <div className="stat-icon-wrapper"><i className="fas fa-shield-alt"></i></div>
                            <div className="stat-text-wrapper">
                                <div className="stat-label-new">SAFE & SECURE</div>
                                <div className="stat-value-new">
                                    <span className="counter-number" data-target="100">0</span>
                                    <span className="stat-suffix-new">%</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-item-new animate-on-scroll fade-in-right">
                            <div className="stat-icon-wrapper"><i className="fas fa-tag"></i></div>
                            <div className="stat-text-wrapper">
                                <div className="stat-label-new">DYNAMIC PRICING</div>
                                <div className="stat-value-new">
                                    <span className="stat-value-text">BEST RATES</span>
                                </div>
                            </div>
                        </div>
                        <div className="stat-item-new animate-on-scroll fade-in-right">
                            <div className="stat-icon-wrapper"><i className="fas fa-headset"></i></div>
                            <div className="stat-text-wrapper">
                                <div className="stat-label-new">SUPPORT</div>
                                <div className="stat-value-new">
                                    <span className="stat-value-text">24/7 AVAILABLE</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section id="about" className="about animate-on-scroll">
                <div className="about-container">
                    <div className="about-image">
                        <img src="/pictures/Delivery_man.png" alt="E-DROP Delivery Professional" />
                        <div className="experience-badge">
                            <div className="badge-number">23</div>
                            <div className="badge-text">YEARS OF EXPERIENCE</div>
                        </div>
                    </div>
                    <div className="about-content">
                        <div className="section-label">
                            <span className="label-line"></span>
                            <span className="label-text">ABOUT US</span>
                        </div>
                        <h2 className="animate-on-scroll fade-in-up about-title">
                            {siteContent.aboutTitle.split('&').map((part, index) => (
                                <React.Fragment key={index}>
                                    {index === 0 ? part : <> & <span>{part}</span></>}
                                </React.Fragment>
                            ))}
                        </h2>
                        <div className="about-description">
                            <p>{siteContent.aboutDesc1}</p>
                            <p>{siteContent.aboutDesc2}</p>
                        </div>
                        <div className="about-buttons">
                            <Link to="/about" className="cta-button magnetic">LEARN MORE</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="services animate-on-scroll">
                <div className="services-container">
                    <div className="section-label">
                        <span className="label-line"></span>
                        <span className="label-text">OUR SERVICES</span>
                    </div>
                    <h2 className="services-title animate-on-scroll fade-in-left">
                        PRECISE & <span>HARDWORKING</span>
                    </h2>
                    <div className="services-grid">
                        {/* E-CAB */}
                        <div className="service-card magnetic futuristic-card">
                            <div className="service-image">
                                <img src="/pictures/cabe 2.jpeg" alt="E-CAB Taxi" />
                                <div className="service-overlay">
                                    <div className="service-category">Taxi Service</div>
                                </div>
                            </div>
                            <div className="service-content">
                                <h3 className="service-name">E-CABE</h3>
                                <p className="service-description">Professional taxi service for city travel — book a ride anytime, anywhere in the city.</p>
                                <div className="service-actions-futuristic">
                                    <Link to="/ecab" className="cta-button" style={{ padding: '12px 24px', fontSize: '0.9rem' }} onClick={(e) => !handleRestrictedClick(e) && e.preventDefault()}>EXPLORE NOW</Link>
                                </div>
                            </div>
                        </div>

                        {/* E-SHIPPING */}
                        <div className="service-card magnetic futuristic-card">
                            <div className="service-image">
                                <img src="/pictures/2323.jpeg" alt="E-SHIPPING Courier" />
                                <div className="service-overlay">
                                    <div className="service-category">Fast Courier</div>
                                </div>
                            </div>
                            <div className="service-content">
                                <h3 className="service-name">E-SHIPPING</h3>
                                <p className="service-description">Fast and secure door-to-door courier service for your documents and small parcels.</p>
                                <div className="service-actions-futuristic">
                                    <Link to="/eshipping" className="cta-button" style={{ padding: '12px 24px', fontSize: '0.9rem' }} onClick={(e) => !handleRestrictedClick(e) && e.preventDefault()}>BOOK NOW</Link>
                                </div>
                            </div>
                        </div>

                        {/* E-CARGO */}
                        <div className="service-card magnetic futuristic-card">
                            <div className="service-image">
                                <img src="/pictures/cargo.png" alt="E-CARGO Logistics" />
                                <div className="service-overlay">
                                    <div className="service-category">Heavy Logistics</div>
                                </div>
                            </div>
                            <div className="service-content">
                                <h3 className="service-name">E-CARGO</h3>
                                <p className="service-description">Large-scale cargo and logistics solutions for businesses and heavy shipments.</p>
                                <div className="service-actions-futuristic">
                                    <Link to="/ecargo" className="cta-button" style={{ padding: '12px 24px', fontSize: '0.9rem' }} onClick={(e) => !handleRestrictedClick(e) && e.preventDefault()}>BOOK NOW</Link>
                                </div>
                            </div>
                        </div>

                        {/* FUTURE SERVICES */}
                        {/* AI Logistics Optimization */}
                        <div className="service-card magnetic futuristic-card" onClick={handleRestrictedClick}>
                            <div className="service-image">
                                <img src="/pictures/f_ai.png" alt="AI Logistics" />
                                <div className="service-overlay">
                                    <div className="service-category">Coming Soon</div>
                                </div>
                            </div>
                            <div className="service-content">
                                <h3 className="service-name">AI Logistics</h3>
                                <p className="service-description">Using AI to predict demand and optimize delivery routes for maximum efficiency.</p>
                                <div className="service-actions-futuristic">
                                    <button className="cta-button" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>FUTURE PLAN</button>
                                </div>
                            </div>
                        </div>

                        {/* International Expansion */}
                        <div className="service-card magnetic futuristic-card" onClick={handleRestrictedClick}>
                            <div className="service-image">
                                <img src="/pictures/f_intl.png" alt="Global Reach" />
                                <div className="service-overlay">
                                    <div className="service-category">In Progress</div>
                                </div>
                            </div>
                            <div className="service-content">
                                <h3 className="service-name">Global Reach</h3>
                                <p className="service-description">Scaling operations beyond Pakistan into South Asian markets like Bangladesh and Sri Lanka.</p>
                                <div className="service-actions-futuristic">
                                    <button className="cta-button" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>FUTURE PLAN</button>
                                </div>
                            </div>
                        </div>

                        {/* Air Cargo Integration */}
                        <div className="service-card magnetic futuristic-card" onClick={handleRestrictedClick}>
                            <div className="service-image">
                                <img src="/pictures/f_air.png" alt="E-Air Cargo" />
                                <div className="service-overlay">
                                    <div className="service-category">Future Plan</div>
                                </div>
                            </div>
                            <div className="service-content">
                                <h3 className="service-name">E-Air Cargo</h3>
                                <p className="service-description">Introducing "E-Air" to handle time-sensitive shipments via professional air freight services.</p>
                                <div className="service-actions-futuristic">
                                    <button className="cta-button" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>FUTURE PLAN</button>
                                </div>
                            </div>
                        </div>

                        {/* B2B Logistics Services */}
                        <div className="service-card magnetic futuristic-card" onClick={handleRestrictedClick}>
                            <div className="service-image">
                                <img src="/pictures/f_b2b.png" alt="B2B Logistics" />
                                <div className="service-overlay">
                                    <div className="service-category">Coming Soon</div>
                                </div>
                            </div>
                            <div className="service-content">
                                <h3 className="service-name">B2B Logistics</h3>
                                <p className="service-description">Dedicated dashboards and contract pricing for manufacturers and large-scale retailers.</p>
                                <div className="service-actions-futuristic">
                                    <button className="cta-button" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>FUTURE PLAN</button>
                                </div>
                            </div>
                        </div>

                        {/* Electric Vehicle Integration */}
                        <div className="service-card magnetic futuristic-card" onClick={handleRestrictedClick}>
                            <div className="service-image">
                                <img src="/pictures/f_ev.png" alt="Eco-Delivery" />
                                <div className="service-overlay">
                                    <div className="service-category">Green Initiative</div>
                                </div>
                            </div>
                            <div className="service-content">
                                <h3 className="service-name">Eco-Delivery</h3>
                                <p className="service-description">Transitioning to EV-based delivery options to promote sustainable and eco-friendly transport.</p>
                                <div className="service-actions-futuristic">
                                    <button className="cta-button" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>FUTURE PLAN</button>
                                </div>
                            </div>
                        </div>

                        {/* Financial Services */}
                        <div className="service-card magnetic futuristic-card" onClick={handleRestrictedClick}>
                            <div className="service-image">
                                <img src="/pictures/f_finance.png" alt="E-Wallet" />
                                <div className="service-overlay">
                                    <div className="service-category">Coming Soon</div>
                                </div>
                            </div>
                            <div className="service-content">
                                <h3 className="service-name">E-Wallet</h3>
                                <p className="service-description">Integrated digital wallet with insurance and financing options for secure transactions.</p>
                                <div className="service-actions-futuristic">
                                    <button className="cta-button" style={{ padding: '12px 24px', fontSize: '0.9rem' }}>FUTURE PLAN</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials animate-on-scroll">
                <div className="testimonials-container">
                    <div className="testimonials-header">
                        <div className="section-label">
                            <span className="label-line"></span>
                            <span className="label-text">TESTIMONIALS</span>
                        </div>
                        <h2 className="animate-on-scroll fade-in-up testimonials-title">
                            OUR <span>HAPPY</span> CUSTOMERS
                        </h2>
                    </div>
                    <div className="testimonials-content">
                        <div className="testimonials-image">
                            <img src="/pictures/testimonials_bg.png" alt="Testimonials" />
                        </div>
                        <div className="testimonials-carousel">
                            <div className="carousel-container">
                                {testimonials.map((t, i) => (
                                    <div key={i} className={`testimonial-slide ${currentSlide === i ? 'active' : ''}`}>
                                        <div className="testimonial-card">
                                            <div className="testimonial-rating">
                                                {[...Array(5)].map((_, starI) => <i key={starI} className="fas fa-star"></i>)}
                                            </div>
                                            <p className="testimonial-text">{t.text}</p>
                                            <div className="testimonial-author">
                                                <img src={t.image} alt={t.author} />
                                                <div className="author-info">
                                                    <h4>{t.author}</h4>
                                                    <p>{t.location}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="carousel-navigation">
                                <button className="carousel-arrow prev-arrow" onClick={prevSlide}>
                                    <i className="fas fa-chevron-left"></i>
                                </button>
                                <div className="carousel-dots">
                                    {testimonials.map((_, i) => (
                                        <span key={i} className={`dot ${currentSlide === i ? 'active' : ''}`} onClick={() => setCurrentSlide(i)}></span>
                                    ))}
                                </div>
                                <button className="carousel-arrow next-arrow" onClick={nextSlide}>
                                    <i className="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section id="team" className="team animate-on-scroll">
                <div className="team-container">
                    <div className="section-label">
                        <span className="label-line"></span>
                        <span className="label-text">OUR TEAM</span>
                    </div>
                    <h2 className="animate-on-scroll fade-in-up team-title">MEET THE <span>CREATIVE</span> MINDS</h2>
                    <div className="team-grid">
                        {[
                            {
                                name: 'Muhammad Danyal',
                                role: 'Website Developer',
                                desc: 'Full-stack web developer passionate about creating innovative digital solutions and user-friendly interfaces.',
                                img: '/pictures/Muhammad Danyal.jpg',
                                social: {
                                    linkedin: 'https://www.linkedin.com/in/muhammad-danyal-6a3b263a4?utm_source=share_via&utm_content=profile&utm_medium=member_android',
                                    github: 'https://github.com/MuhammadDanyall',
                                    email: 'https://mail.google.com/mail/?view=cm&fs=1&to=mdanyal0077@gmail.com'
                                }
                            },
                            {
                                name: 'Hassan Zeb',
                                role: 'Mobile App Developer',
                                desc: 'Expert mobile app developer specializing in cross-platform solutions and innovative user experiences.',
                                img: '/pictures/Hassan Zeb.jpeg',
                                social: {
                                    linkedin: '#',
                                    github: '#',
                                    email: '#'
                                }
                            },
                            {
                                name: 'Yasir Ktk',
                                role: 'Mobile App Developer',
                                desc: 'Talented app developer focused on creating seamless mobile applications with cutting-edge technology.',
                                img: '/pictures/yasir.jpeg',
                                social: {
                                    linkedin: 'https://www.linkedin.com/in/yasir-ahmad-03b283294?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
                                    github: 'https://github.com/MaverickData114',
                                    email: 'https://mail.google.com/mail/?view=cm&fs=1&to=itzyasir@gmail.com'
                                }
                            }
                        ].map((m, i) => (
                            <div key={i} className="team-member magnetic">
                                <div className="member-image">
                                    <img src={m.img} alt={m.name} />
                                    <div className="member-overlay">
                                        <div className="member-role">{m.role}</div>
                                    </div>
                                </div>
                                <div className="member-content">
                                    <h3 className="member-name">{m.name}</h3>
                                    <p className="member-description">{m.desc}</p>
                                    <div className="member-social">
                                        <a href={m.social?.linkedin || '#'} target={m.social?.linkedin && m.social.linkedin !== '#' ? "_blank" : undefined} rel="noopener noreferrer" className="social-link"><i className="fab fa-linkedin"></i></a>
                                        <a href={m.social?.github || '#'} target={m.social?.github && m.social.github !== '#' ? "_blank" : undefined} rel="noopener noreferrer" className="social-link"><i className="fab fa-github"></i></a>
                                        <a href={m.social?.email || '#'} target={m.social?.email && m.social.email !== '#' ? "_blank" : undefined} rel="noopener noreferrer" className="social-link"><i className="fas fa-envelope"></i></a>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="faq animate-on-scroll">
                <div className="faq-container">
                    <div className="faq-header">
                        <div className="section-label">
                            <span className="label-line"></span>
                            <span className="label-text">HELP CENTER</span>
                        </div>
                        <h2 className="animate-on-scroll fade-in-up faq-title">FREQUENTLY ASKED <span>QUESTIONS</span></h2>
                        <p className="faq-subtitle">Find answers to the most common questions about E Drop services.</p>
                    </div>
                    <div className="faq-grid">
                        <div className="faq-category">
                            <h3 className="category-title"><i className="fas fa-info-circle"></i> General Questions</h3>
                            <div className="faq-accordion">
                                {
                                    [
                                        { q: 'What is E Drop?', a: 'E Drop is an integrated logistics and transport platform specifically designed for Kohat, providing Cab, Cargo, and Shipping services in one place.' },
                                        { q: 'Is E Drop available outside of Kohat?', a: 'Currently, we are focusing on establishing a strong foundation in Kohat, but our vision is to expand throughout the region.' },
                                        { q: 'What makes E Drop different from other courier services?', a: 'Unlike traditional services, E Drop offers a unified system for both passenger transport (Cabs) and logistics (Cargo) with a focus on modern tech like real-time tracking.' }
                                    ].map((item, i) => (
                                        <div key={i} className={`faq-item ${activeFaq === i ? 'active' : ''}`} onClick={handleRestrictedClick}>
                                            <button className="faq-question" onClick={(e) => {
                                                if (handleRestrictedClick(e)) {
                                                    setActiveFaq(activeFaq === i ? null : i);
                                                }
                                            }}>
                                                {item.q}
                                                <i className="fas fa-chevron-down"></i>
                                            </button>
                                            <div className="faq-answer" style={{ maxHeight: activeFaq === i ? '500px' : '0', overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
                                                <p>{item.a}</p>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '40px', gridColumn: '1 / -1' }}>
                            <Link to="/faq" className="cta-button magnetic">
                                View All FAQs <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Download App Section */}
            <section className="animate-on-scroll" style={{ padding: '100px 0', background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '50px' }}>
                        <div className="animate-on-scroll fade-in-left" style={{ flex: 1, minWidth: '300px' }}>
                            <div className="section-label" style={{ justifyContent: 'flex-start' }}>
                                <span className="label-line"></span>
                                <span className="label-text" style={{ color: '#ff6b35' }}>GET THE APP</span>
                            </div>
                            <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: 'white', marginBottom: '20px', letterSpacing: '-1px' }}>Download Our <span style={{ color: '#ff6b35' }}>E-Drop App</span></h2>
                            <p style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.8)', marginBottom: '40px', lineHeight: '1.7' }}>
                                Get the full E-Drop experience on your mobile device. Book rides, ship packages, track cargo, and much more with just a few taps!
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

            {/* Tracking Section */}
            <section id="tracking-home" className="animate-on-scroll" style={{ padding: '100px 0', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', position: 'relative', overflow: 'hidden' }}>
                <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                    <div className="section-label" style={{ justifyContent: 'center' }}>
                        <span className="label-line"></span>
                        <span className="label-text" style={{ color: '#ff6b35' }}>REAL-TIME TRACKING</span>
                    </div>
                    <h2 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: '900', textAlign: 'center', color: '#1a1a1a', letterSpacing: '-1px' }}>Track Your <span style={{ color: '#ff6b35' }}>Cargo & Shipment</span></h2>
                    <p style={{ maxWidth: '650px', margin: '0 auto 50px', color: '#555', fontSize: '1.15rem', textAlign: 'center', lineHeight: '1.6' }}>Enter your tracking reference number (e.g., TI-0001 for shipments, EC-0001 for cargo) to see the current status and location of your package.</p>
                    
                    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#ffffff', padding: '50px', borderRadius: '30px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
                        <form onSubmit={(e) => handleRestrictedClick(e) && handleTrack(e)}>
                            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ flex: '1', minWidth: '250px', position: 'relative' }}>
                                    <i className="fas fa-barcode" style={{ position: 'absolute', left: '25px', top: '50%', transform: 'translateY(-50%)', color: '#ff6b35', fontSize: '1.2rem' }}></i>
                                    <input 
                                        type="text" 
                                        placeholder="Enter Tracking ID (e.g., TI-0001 or EC-0001)" 
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        style={{ 
                                            width: '100%',
                                            padding: '20px 20px 20px 60px', 
                                            borderRadius: '50px', 
                                            border: '2px solid #e9ecef', 
                                            background: '#f8f9fa', 
                                            color: '#333',
                                            fontSize: '1.1rem',
                                            outline: 'none',
                                            transition: 'all 0.3s ease',
                                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = '#ff6b35'}
                                        onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                                        required
                                    />
                                </div>
                                <button type="submit" className="cta-button magnetic" style={{ 
                                    padding: '20px 50px', 
                                    borderRadius: '50px', 
                                    background: 'linear-gradient(135deg, #ff6b35, #ff8c42)', 
                                    color: 'white', 
                                    border: 'none', 
                                    fontWeight: '800', 
                                    cursor: 'pointer',
                                    fontSize: '1.1rem',
                                    boxShadow: '0 10px 25px rgba(255, 107, 53, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '200px'
                                }} disabled={isTrackingLoading}>
                                    {isTrackingLoading ? (
                                        <><i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i> Searching...</>
                                    ) : (
                                        <><i className="fas fa-search" style={{ marginRight: '10px' }}></i> TRACK NOW</>
                                    )}
                                </button>
                            </div>
                        </form>

                        {trackingResult && (
                            <div className="animate-on-scroll fade-in-up animate-visible" style={{ marginTop: '50px', padding: '40px', background: '#f8f9fa', borderRadius: '20px', border: '2px solid #e9ecef', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '0', left: '0', width: '6px', height: '100%', background: '#ff6b35' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {trackingResult.type === 'cargo' ? 'Cargo Tracking ID' : 'Shipment Tracking ID'}
                                        </p>
                                        <h3 style={{ margin: 0, color: '#1a1a1a', fontSize: '1.8rem', fontWeight: '800' }}>{trackingResult.trackingID}</h3>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Status</p>
                                        <h4 style={{ color: '#ff6b35', margin: 0, fontSize: '1.4rem', fontWeight: '800', textTransform: 'uppercase' }}>{trackingResult.status}</h4>
                                    </div>
                                </div>
                                <div style={{ height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden', marginBottom: '15px' }}>
                                    <div style={{ 
                                        width: trackingResult.status === 'Delivered' ? '100%' : 
                                               trackingResult.status === 'In Transit' ? '66%' : 
                                               trackingResult.status === 'Picked Up' ? '33%' : '10%',
                                        height: '100%',
                                        background: 'linear-gradient(90deg, #ff6b35, #ff8c42)',
                                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                        borderRadius: '4px'
                                    }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.85rem', fontWeight: '600' }}>
                                    <span>Processing</span>
                                    <span>Picked Up</span>
                                    <span>In Transit</span>
                                    <span>Delivered</span>
                                </div>
                                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                                    <Link to={trackingResult.type === 'cargo' ? "/ecargo" : "/eshipping"} className="magnetic" style={{ display: 'inline-flex', alignItems: 'center', color: '#ff6b35', textDecoration: 'none', fontWeight: '700', fontSize: '1rem', borderBottom: '2px solid transparent', paddingBottom: '2px', transition: 'all 0.3s ease' }} onMouseOver={(e) => e.target.style.borderBottomColor = '#ff6b35'} onMouseOut={(e) => e.target.style.borderBottomColor = 'transparent'}>
                                        View Full Details <i className="fas fa-arrow-right" style={{ marginLeft: '8px', fontSize: '0.9rem' }}></i>
                                    </Link>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="animate-on-scroll fade-in-up animate-visible" style={{ marginTop: '40px', padding: '30px', background: '#fff5f5', borderRadius: '20px', border: '1px solid #ffe3e3', textAlign: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: '#ff6b35', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: 'white', fontSize: '1.5rem', boxShadow: '0 10px 20px rgba(255, 107, 53, 0.2)' }}>
                                    <i className="fas fa-exclamation"></i>
                                </div>
                                <h4 style={{ color: '#1a1a1a', fontSize: '1.2rem', marginBottom: '10px', fontWeight: '700' }}>Tracking ID Not Found</h4>
                                <p style={{ color: '#666', margin: 0 }}>Please verify your ID (e.g., TI-0001 or EC-0001) and try again.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>


            {/* Contact Section - UPDATED WITH BACKEND Logic */}
            <section id="contact" className="contact animate-on-scroll">
                <div className="contact-container">
                    <div className="contact-content animate-on-scroll fade-in-right">
                        <div className="contact-info">
                            <div className="contact-illustration">
                                <img src="/pictures/contact_us.png" alt="Contact" />
                            </div>
                            <div className="contact-details">
                                <div className="contact-item">
                                    <div className="contact-icon"><i className="fas fa-phone"></i></div>
                                    <div className="contact-text"><h4>Phone</h4><p>{siteContent.contactPhone}</p></div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon"><i className="fas fa-envelope"></i></div>
                                    <div className="contact-text"><h4>Email</h4><p>{siteContent.contactEmail}</p></div>
                                </div>
                                <div className="contact-item">
                                    <div className="contact-icon"><i className="fas fa-map-marker-alt"></i></div>
                                    <div className="contact-text"><h4>Location</h4><p>{siteContent.contactLocation}</p></div>
                                </div>
                            </div>
                        </div>
                        <div className="contact-form">
                            <h2 className="animate-on-scroll fade-in-up contact-title">Get in Touch</h2>
                            <p className="contact-subtitle">Any question or remarks? Let us know!</p>

                            {/* --- SUCCESS/ERROR MESSAGE DISPLAY --- */}
                            {formStatus.msg && (
                                <p style={{
                                    color: formStatus.type === 'success' ? '#2ecc71' : '#ff6b35',
                                    marginBottom: '15px',
                                    fontWeight: 'bold'
                                }}>
                                    {formStatus.msg}
                                </p>
                            )}

                            {/* --- UPDATED FORM TAG --- */}
                            <form id="contactForm" onSubmit={(e) => {
                                e.preventDefault();
                                if (handleRestrictedClick(e)) {
                                    handleContactSubmit(e);
                                }
                            }}>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Enter your name"
                                        value={contactData.name}
                                        onChange={handleContactChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={contactData.email}
                                        onChange={handleContactChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <textarea
                                        name="message"
                                        placeholder="Type your message here"
                                        rows="5"
                                        value={contactData.message}
                                        onChange={handleContactChange}
                                        required
                                    ></textarea>
                                </div>
                                <button type="submit" className="cta-button magnetic" style={{ width: '100%', borderRadius: '12px' }}>Submit</button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Custom Login Required Alert Modal */}
            <RestrictedAccessModal
                isOpen={isAuthAlertOpen}
                onClose={() => setIsAuthAlertOpen(false)}
                onLoginClick={onAuthClick}
            />
        </div>
    );
};

export default Home;
