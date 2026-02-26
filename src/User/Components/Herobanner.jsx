import React from 'react';
import './Herobanner.css';
import { Link } from "react-router-dom";

const HeroBanner = () => {
  return (
    <div className="hb-container">
      
      {/* 1. TEXTURE & BACKGROUND */}
      <div className="hb-texture-grain"></div>

      {/* 2. MOVING STAR FIELD */}
      <div className="hb-star-layer">
        <div className="hb-stars-sm"></div>
        <div className="hb-stars-md"></div>
      </div>

      {/* 3. BACKGROUND IMAGE (RESPONSIVE SWITCHING) */}
      <div className="hb-image-wrapper">
        <picture>
          {/* Mobile Image: Shows when screen is 900px or less */}
          <source media="(max-width: 900px)" srcSet="/kalayanashobha11.png" />
          
          {/* Desktop Image: Default fallback */}
          <img 
            src="/kalyanashobha0.png" 
            alt="Happy Telugu Couple" 
            className="hb-background-img" 
          />
        </picture>
        <div className="hb-overlay-gradient"></div>
      </div>

      {/* 4. CONTENT LAYER */}
      <div className="hb-content">

        {/* Main Title */}
        <h1 className="hb-title">
          <div className="hb-text-mask">
            <span className="hb-reveal hb-delay-1">Where Souls</span>
          </div>
          <div className="hb-text-mask">
            <span className="hb-reveal hb-delay-2 hb-gold-text">Meet Eternity</span>
          </div>
        </h1>

        {/* Subtitle */}
        <div className="hb-text-mask">
          <p className="hb-subtitle hb-reveal hb-delay-3">
            An exclusive journey for those seeking meaningful connections.<br className="hb-desktop-break" />
            Discover a love that transcends time and tradition.
          </p>
        </div>

        {/* Action Button */}
        <div className="hb-action-wrapper hb-fade-in hb-delay-4">
          <Link to="/registration" style={{ textDecoration: 'none' }}>
            <button className="hb-glass-btn">
              <span className="hb-btn-label">Register Now</span>
            </button>
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default HeroBanner;
