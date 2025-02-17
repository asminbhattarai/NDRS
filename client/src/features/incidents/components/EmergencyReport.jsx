import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, MapPin } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/EmergencyReport.css';

const INCIDENT_TYPES = ['Earthquake', 'Flood', 'Fire', 'Landslide', 'Avalanche', 'Other'];
const SEVERITY_LEVELS = ['CRITICAL', 'HIGH'];
const ASSISTANCE_TYPES = ['Medical', 'Rescue', 'Fire', 'Police'];

export default function EmergencyReport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phone_number: user?.phone_number || '',
    incident_type: '',
    severity_level: 'CRITICAL',
    location: '',
    gps_coordinates: '',
    assistance_needed: [],
    casualties_reported: 'NO',
    people_affected: '',
    area_accessible: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAssistanceChange = (type) => {
    setFormData(prev => ({
      ...prev,
      assistance_needed: prev.assistance_needed.includes(type)
        ? prev.assistance_needed.filter(t => t !== type)
        : [...prev.assistance_needed, type]
    }));
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            gps_coordinates: `${latitude},${longitude}`
          }));
          toast.success('Location detected');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Could not detect location');
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/incidents/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to report emergency');
      }

      toast.success('Emergency reported successfully');
      navigate('/incidents');
    } catch (error) {
      console.error('Error reporting emergency:', error);
      toast.error(error.message || 'Failed to report emergency');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="emergency-report-container">
      <div className="emergency-form-card">
        <div className="emergency-header">
          <AlertTriangle className="emergency-icon" />
          <h1 className="emergency-title">Emergency Report</h1>
          <p className="emergency-subtitle">Quick report for immediate assistance</p>
        </div>

        <form onSubmit={handleSubmit} className="emergency-form">
          <div className="form-group">
            <label htmlFor="phone_number">Phone Number (Required)</label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              required
              className="form-input"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="incident_type">Incident Type</label>
              <select
                id="incident_type"
                name="incident_type"
                required
                className="form-input"
                value={formData.incident_type}
                onChange={handleChange}
              >
                <option value="">Select Type</option>
                {INCIDENT_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="severity_level">Severity</label>
              <select
                id="severity_level"
                name="severity_level"
                required
                className="form-input"
                value={formData.severity_level}
                onChange={handleChange}
              >
                {SEVERITY_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <div className="location-input-group">
              <input
                type="text"
                name="location"
                required
                className="form-input"
                value={formData.location}
                onChange={handleChange}
                placeholder="Brief location description"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                className="location-detect-button"
              >
                <MapPin className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Help Needed</label>
            <div className="assistance-options">
              {ASSISTANCE_TYPES.map(type => (
                <label
                  key={type}
                  className={`assistance-option ${
                    formData.assistance_needed.includes(type) ? 'selected' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.assistance_needed.includes(type)}
                    onChange={() => handleAssistanceChange(type)}
                    className="hidden"
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Casualties Reported</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="casualties_reported"
                    value="YES"
                    checked={formData.casualties_reported === 'YES'}
                    onChange={handleChange}
                  />
                  Yes
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="casualties_reported"
                    value="NO"
                    checked={formData.casualties_reported === 'NO'}
                    onChange={handleChange}
                  />
                  No
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Area Accessible</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="area_accessible"
                    checked={formData.area_accessible}
                    onChange={() => setFormData(prev => ({ ...prev, area_accessible: true }))}
                  />
                  Yes
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="area_accessible"
                    checked={!formData.area_accessible}
                    onChange={() => setFormData(prev => ({ ...prev, area_accessible: false }))}
                  />
                  No
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? 'Submitting...' : 'Report Emergency'}
          </button>
        </form>
      </div>
    </div>
  );
}