import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Footer = () => {
    const [siteContent, setSiteContent] = useState({
        contactPhone: "+92 321-125687",
        contactEmail: "sachdeva@coin.sin",
        contactLocation: "Sadar Bazar, Peshawar, Kpk",
        facebookLink: "#",
        twitterLink: "#",
        instagramLink: "#",
        linkedinLink: "#"
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await axios.get('http://127.0.0.1:5000/api/content');
                if (res.data) {
                    setSiteContent(res.data);
                }
            } catch (err) {
                console.error("Error fetching footer content:", err.response?.data || err.message);
            }
        };
        fetchContent();
    }, []);

    return (
        <footer className="footer">
            <div className="footer-top">
                <div className="footer-container">
                    <div className="footer-section">
                        <h3>E-DROP</h3>
                        <p>Moving Was Never So Easy</p>
                        <p>Fast & Secure Move</p>
                    </div>
                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/eshipping" style={{ color: '#ff6b35', fontWeight: 'bold' }}>Track Shipment</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><a href="/#services">Services</a></li>
                            <li><a href="/#team">Team</a></li>
                            <li><a href="/#testimonials">Testimonials</a></li>
                            <li><a href="/#contact">Contact</a></li>
                        </ul>
                    </div>
                    <div className="footer-section">
                        <h4>Contact Info</h4>
                        <p><i className="fas fa-phone"></i> {siteContent.contactPhone}</p>
                        <p><i className="fas fa-envelope"></i> {siteContent.contactEmail}</p>
                        <p><i className="fas fa-map-marker-alt"></i> {siteContent.contactLocation}</p>
                        
                        <div className="footer-social-links" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
                            <a href={siteContent.facebookLink} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '1.2rem' }}><i className="fab fa-facebook-f"></i></a>
                            <a href={siteContent.twitterLink} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '1.2rem' }}><i className="fab fa-twitter"></i></a>
                            <a href={siteContent.instagramLink} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '1.2rem' }}><i className="fab fa-instagram"></i></a>
                            <a href={siteContent.linkedinLink} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '1.2rem' }}><i className="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="footer-diagonal"></div>

            <div className="sub-footer" style={{ background: '#111', padding: '25px 20px', borderTop: '1px solid #333', position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '12px' }}>
                    <Link to="/faq" style={{ color: '#bbb', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.3s ease' }}>FAQ</Link>
                    <Link to="/privacy-policy" style={{ color: '#bbb', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.3s ease' }}>Privacy Policy</Link>
                    <Link to="/terms-conditions" style={{ color: '#bbb', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.3s ease' }}>Terms & Conditions</Link>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#777' }}>&copy; 2026 E Drop. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
