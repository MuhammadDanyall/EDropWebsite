import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Header = ({ onAuthClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    // Close menu when route changes
    useEffect(() => {
        closeMenu();
    }, [location]);

    // Check user login state
    useEffect(() => {
        const checkUser = () => {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                try { setUser(JSON.parse(storedUser)); } catch(e){}
            } else {
                setUser(null);
            }
        };
        
        checkUser(); // Initial load
        window.addEventListener('storage', checkUser);
        return () => window.removeEventListener('storage', checkUser);
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        sessionStorage.removeItem('user');
        setUser(null);
        window.dispatchEvent(new Event("storage"));
        navigate('/');
    };

    return (
        <header className="header">
            <nav className="nav">
                <div className="nav-container">
                    <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
                        <img src="/pictures/logo.jpeg" alt="E-DROP Logo" className="logo-img" />
                        <h1> E-DROP</h1>
                    </Link>
                    <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
                        <li><Link to="/" className={location.pathname === '/' && !location.hash ? 'active' : ''}>HOME</Link></li>
                        <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>ABOUT US</Link></li>
                        <li><a href="/#services" className={location.hash === '#services' ? 'active' : ''}>SERVICE</a></li>
                        <li><a href="/#team" className={location.hash === '#team' ? 'active' : ''}>TEAM</a></li>
                        <li><a href="/#testimonials" className={location.hash === '#testimonials' ? 'active' : ''}>REVIEWS</a></li>
                        <li><Link to="/faq" className={location.pathname === '/faq' ? 'active' : ''}>HELP CENTER</Link></li>
                        <li><a href="/#contact" className={location.hash === '#contact' ? 'active' : ''}>CONTACT US</a></li>
                        
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <li><Link to="/admin-panel" style={{ color: '#ff6b35', fontWeight: 'bold' }}>Dashboard</Link></li>
                                )}
                                <li><a href="#" className="user-greeting">Hi, {user.fullName}</a></li>
                                <li><a href="#" onClick={handleLogout}>LOGOUT</a></li>
                            </>
                        ) : (
                            <>
                                <li><a href="#" onClick={(e) => { e.preventDefault(); onAuthClick('login'); }}>LOGIN</a></li>
                                <li><a href="#" onClick={(e) => { e.preventDefault(); onAuthClick('signup'); }}>SIGN UP</a></li>
                            </>
                        )}
                    </ul>
                    <div className={`hamburger ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
