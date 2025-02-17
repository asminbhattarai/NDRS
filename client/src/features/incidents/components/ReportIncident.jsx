import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { AlertTriangle, Upload, X } from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/ReportIncident.css';

const INCIDENT_TYPES = [
  'Earthquake',
  'Flood',
  'Landslide',
  'Fire',
  'Avalanche',
  'Storm',
  'Other'
];

const SEVERITY_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-orange-100 text-orange-800' },
  { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-600 text-white' }
];

const ASSISTANCE_TYPES = [
  'Medical',
  'Rescue',
  'Fire',
  'Police',
  'Shelter',
  'Food',
  'Water',
  'Other'
];

export default function ReportIncident() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    incident_type: '',
    severity_level: 'MEDIUM',
    description: '',
    location: '',
    reporter_name: user?.first_name ? `${user.first_name} ${user.last_name}` : '',
    reporter_phone: user?.phone_number || '',
    reporter_email: user?.email || '',
    affected_people: '',
    casualties: '0',
    assistance_needed: [],
    area_accessible: true,
    gps_coordinates: ''
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

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    const newPhotos = [...photos];
    const newPreviewUrls = [...previewUrls];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        newPhotos.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviewUrls.push(reader.result);
          setPreviewUrls([...newPreviewUrls]);
        };
        reader.readAsDataURL(file);
      }
    });

    setPhotos(newPhotos);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
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
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value);
        }
      });

      photos.forEach(photo => {
        formDataToSend.append('photos', photo);
      });

      const response = await fetch('http://localhost:5000/api/incidents/report', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to report incident');
      }

      toast.success('Incident reported successfully');
      navigate('/incidents');
    } catch (error) {
      console.error('Error reporting incident:', error);
      toast.error(error.message || 'Failed to report incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-incident-container">
      <div className="report-incident-card">
        <div className="card-header">
          <AlertTriangle className="header-icon" />
          <h1 className="header-title">Report an Incident</h1>
          <p className="header-description">
            Please provide accurate information to help us respond effectively
          </p>
        </div>

        <form onSubmit={handleSubmit} className="incident-form">
          {/* Basic Incident Information */}
          <div className="form-section">
            <h2 className="section-title">Incident Details</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Incident Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Brief title describing the incident"
                />
              </div>

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
            </div>

            <div className="form-group">
              <label>Severity Level</label>
              <div className="severity-options">
                {SEVERITY_LEVELS.map(({ value, label, color }) => (
                  <label
                    key={value}
                    className={`severity-option ${
                      formData.severity_level === value ? 'selected' : ''
                    } ${color}`}
                  >
                    <input
                      type="radio"
                      name="severity_level"
                      value={value}
                      checked={formData.severity_level === value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                required
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detailed description of the incident"
                rows="4"
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="form-section">
            <h2 className="section-title">Location Details</h2>
            
            <div className="form-group">
              <label htmlFor="location">Location Description</label>
              <div className="location-input-group">
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  className="form-input"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Detailed location description"
                />
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="location-detect-button"
                >
                  Detect Location
                </button>
              </div>
              {formData.gps_coordinates && (
                <p className="text-sm text-gray-600 mt-1">
                  GPS: {formData.gps_coordinates}
                </p>
              )}
            </div>
          </div>

          {/* Impact Assessment */}
          <div className="form-section">
            <h2 className="section-title">Impact Assessment</h2>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="affected_people">People Affected</label>
                <input
                  type="number"
                  id="affected_people"
                  name="affected_people"
                  className="form-input"
                  value={formData.affected_people}
                  onChange={handleChange}
                  min="0"
                  placeholder="Estimated number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="casualties">Casualties</label>
                <input
                  type="number"
                  id="casualties"
                  name="casualties"
                  className="form-input"
                  value={formData.casualties}
                  onChange={handleChange}
                  min="0"
                  placeholder="Number of casualties"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Assistance Needed</label>
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

            <div className="form-group">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="area_accessible"
                  checked={formData.area_accessible}
                  onChange={handleChange}
                  className="form-checkbox"
                />
                <span>Area is accessible for emergency response</span>
              </label>
            </div>
          </div>

          {/* Reporter Information (if not logged in) */}
          {!token && (
            <div className="form-section">
              <h2 className="section-title">Your Information</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="reporter_name">Full Name</label>
                  <input
                    type="text"
                    id="reporter_name"
                    name="reporter_name"
                    required
                    className="form-input"
                    value={formData.reporter_name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reporter_phone">Phone Number</label>
                  <input
                    type="tel"
                    id="reporter_phone"
                    name="reporter_phone"
                    required
                    className="form-input"
                    value={formData.reporter_phone}
                    onChange={handleChange}
                    pattern="[0-9]{10}"
                    placeholder="10-digit phone number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reporter_email">Email (Optional)</label>
                  <input
                    type="email"
                    id="reporter_email"
                    name="reporter_email"
                    className="form-input"
                    value={formData.reporter_email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload */}
          <div className="form-section">
            <h2 className="section-title">Photos</h2>
            
            <div className="photo-upload-container">
              <div className="photo-preview-grid">
                {previewUrls.map((url, index) => (
                  <div key={index} className="photo-preview">
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="remove-photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {previewUrls.length < 5 && (
                  <label className="photo-upload-button">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6" />
                    <span>Add Photos</span>
                  </label>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Upload up to 5 photos (optional)
              </p>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Submitting...
                </>
              ) : (
                'Report Incident'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}