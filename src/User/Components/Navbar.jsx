import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  // Check login status
  const isLoggedIn = !!localStorage.getItem('token');

  // Handle Scroll Effect for premium feel
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Lock body scroll when menu is open
    document.body.style.overflow = !isOpen ? 'hidden' : 'auto';
  };

  const closeMenu = () => {
    setIsOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    closeMenu();
    navigate('/');
  };

  return (
    <header className={`ks-header ${scrolled ? 'ks-header--scrolled' : ''}`}>
      <div className="ks-header__container">

        {/* --- Logo Section --- */}
        <div className="ks-header__brand">
          <Link to="/" onClick={closeMenu} className="ks-header__logo-link">
            <img src="/Kalyanashobha.png" alt="Kalyana Shobha" className="ks-logo-img" />
          </Link>
        </div>

        {/* --- Desktop Navigation --- */}
        <nav className="ks-nav">
          <ul className="ks-nav__list">
            <li className="ks-nav__item">
              <Link to="/" className="ks-nav__link">Home</Link>
            </li>

            {/* --- Vendors is now always visible --- */}
            <li className="ks-nav__item">
              <Link to="/vendor" className="ks-nav__link">Vendors</Link>
            </li>
            
            {/* --- Help is always visible --- */}
            <li className="ks-nav__item">
              <Link to="/help" className="ks-nav__link">Help</Link>
            </li>

            {/* Agent: Only if NOT logged in */}
            {!isLoggedIn && (
              <li className="ks-nav__item">
                <Link to="/agent/login" className="ks-nav__link">Agent</Link>
              </li>
            )}

            {/* User Links: Only if logged in */}
            {isLoggedIn && (
              <>
                <li className="ks-nav__item"><Link to="/myprofile" className="ks-nav__link">My Profile</Link></li>
                <li className="ks-nav__item"><Link to="/interests" className="ks-nav__link">Interests</Link></li>
                <li className="ks-nav__item"><Link to="/payments" className="ks-nav__link">Payments</Link></li>
              </>
            )}
          </ul>
        </nav>

        {/* --- Action Buttons (Desktop) --- */}
        <div className="ks-header__actions">
          {isLoggedIn ? (
            <button onClick={handleLogout} className="ks-btn ks-btn--primary">
              Logout
            </button>
          ) : (
            <Link to="/login" className="ks-btn ks-btn--primary">
              Login
            </Link>
          )}
        </div>

        {/* --- Modern Hamburger (Staggered Lines) --- */}
        <button
          className={`ks-hamburger ${isOpen ? 'is-active' : ''}`}
          onClick={toggleMenu}
          aria-label="Menu"
        >
          <span className="ks-hamburger__line line-top"></span>
          <span className="ks-hamburger__line line-middle"></span>
          <span className="ks-hamburger__line line-bottom"></span>
        </button>
      </div>

      {/* --- Mobile Sidebar Overlay --- */}
      <div className={`ks-mobile-menu ${isOpen ? 'is-visible' : ''}`}>
        <div className="ks-mobile-menu__content">
          <ul className="ks-mobile-list">
            <li style={{ '--i': 1 }}><Link to="/" onClick={closeMenu}>Home</Link></li>
            
            {/* --- Vendors always visible on Mobile too --- */}
            <li style={{ '--i': 2 }}><Link to="/vendor" onClick={closeMenu}>Vendors</Link></li>
            
            {/* --- Help always visible on Mobile too --- */}
            <li style={{ '--i': 3 }}><Link to="/help" onClick={closeMenu}>Help</Link></li>

            {!isLoggedIn && (
              <li style={{ '--i': 4 }}><Link to="/agent/login" onClick={closeMenu}>Agent</Link></li>
            )}

            {isLoggedIn && (
              <>
                <li style={{ '--i': 4 }}><Link to="/myprofile" onClick={closeMenu}>My Profile</Link></li>
                <li style={{ '--i': 5 }}><Link to="/interests" onClick={closeMenu}>Interests</Link></li>
                <li style={{ '--i': 6 }}><Link to="/payments" onClick={closeMenu}>Payments</Link></li>
              </>
            )}
          </ul>

          <div className="ks-mobile-actions">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="ks-btn ks-btn--primary full-width">Logout</button>
            ) : (
              <Link to="/login" onClick={closeMenu} className="ks-btn ks-btn--primary full-width">Login</Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
