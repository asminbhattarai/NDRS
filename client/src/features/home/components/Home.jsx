import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Phone, MapPin, Users } from 'lucide-react';
import '../styles/Home.css';

export default function Home() {
  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <AlertTriangle className="hero-icon" />
          <h1 className="hero-title">Nepal Disaster Response System</h1>
          <p className="hero-description">
            Quick and efficient disaster reporting and response system for Nepal
          </p>
          <div className="hero-buttons">
            <Link to="/report-incident" className="primary-button">
              Report an Incident
            </Link>
            <Link to="/incidents" className="secondary-button">
              View Incidents
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <Phone className="feature-icon" />
            <h3 className="feature-title">24/7 Emergency Response</h3>
            <p className="feature-description">
              Immediate response to emergency situations across Nepal
            </p>
          </div>
          <div className="feature-card">
            <MapPin className="feature-icon" />
            <h3 className="feature-title">Location Tracking</h3>
            <p className="feature-description">
              Precise location tracking for accurate emergency response
            </p>
          </div>
          <div className="feature-card">
            <Users className="feature-icon" />
            <h3 className="feature-title">Community Support</h3>
            <p className="feature-description">
              Coordinated community response and support system
            </p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <h4 className="stat-number">1,200+</h4>
            <p className="stat-label">Incidents Reported</p>
          </div>
          <div className="stat-card">
            <h4 className="stat-number">15min</h4>
            <p className="stat-label">Average Response Time</p>
          </div>
          <div className="stat-card">
            <h4 className="stat-number">75</h4>
            <p className="stat-label">Districts Covered</p>
          </div>
        </div>
      </section>
    </div>
  );
}