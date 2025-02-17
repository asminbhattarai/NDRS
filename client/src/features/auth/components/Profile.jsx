import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, ChevronDown, User, Mail, Phone, MapPin, Building2, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { districts } from '../../../data/districts';
import '../styles/Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [profile, setProfile] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    address: '',
    district: 'Kathmandu',
    user_type: '',
    emergency_contact: '',
    blood_group: '',
    specialization: '',
    last_active: new Date().toISOString().split('T')[0],
    total_reports: 0,
    pending_reports: 0,
    completed_reports: 0
  });
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const districtRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setUser(data);
        setProfile(prev => ({
          ...prev,
          first_name: data.first_name || '',
          middle_name: data.middle_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          address: data.address || '',
          user_type: data.user_type || '',
          emergency_contact: data.emergency_contact || '',
          blood_group: data.blood_group || '',
          specialization: data.specialization || '',
          profile_image: data.profile_image || ''
        }));
        if (data.profile_image) {
          setPreviewImage(`http://localhost:5000${data.profile_image}`);
        }
      } catch (error) {
        console.error('Profile error:', error);
        setError('Failed to load profile');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (districtRef.current && !districtRef.current.contains(event.target)) {
        setShowDistrictDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDistricts = districts.filter(district =>
    district.toLowerCase().includes(districtSearch.toLowerCase())
  );

  const handleDistrictSelect = (district) => {
    setProfile(prev => ({ ...prev, district }));
    setDistrictSearch('');
    setShowDistrictDropdown(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      Object.entries(profile).forEach(([key, value]) => {
        if (key !== 'profile_image') {
          formData.append(key, value);
        }
      });
      if (fileInputRef.current && fileInputRef.current.files[0]) {
        formData.append('profile_image', fileInputRef.current.files[0]);
      }

      const response = await fetch('http://localhost:5000/api/auth/profile/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedData = await response.json();
      if (updatedData.profile_image) {
        setPreviewImage(`http://localhost:5000${updatedData.profile_image}`);
      }

      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reset profile image preview if it was changed
    if (user?.profile_image) {
      setPreviewImage(`http://localhost:5000${user.profile_image}`);
    } else {
      setPreviewImage(null);
    }
  };

  const formatName = (firstName, middleName, lastName) => {
    return [firstName, middleName, lastName].filter(Boolean).join(' ');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">
          No profile data available
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className={`profile-image-container ${isEditing ? 'editable' : ''}`} onClick={handleImageClick}>
          {previewImage ? (
            <img src={previewImage} alt="Profile" className="profile-image" />
          ) : (
            <div className="profile-image profile-initials">
              {profile.first_name ? profile.first_name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          {isEditing && (
            <>
              <div className="profile-upload-overlay">
                <Camera className="upload-icon" />
                <span>Change Photo</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="profile-upload-input"
                style={{ display: 'none' }}
              />
            </>
          )}
        </div>
        <h1 className="profile-name">
          {formatName(profile.first_name, profile.middle_name, profile.last_name)}
        </h1>
        <span className="profile-type">{profile.user_type}</span>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-section">
          <h2 className="section-title">Personal Information</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  value={profile.first_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="First Name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={profile.email}
                  disabled={true}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone_number"
                  className="form-input"
                  value={profile.phone_number}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  className="form-input"
                  value={profile.emergency_contact}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={profile.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div>
              <div className="form-group" ref={districtRef}>
                <label>District</label>
                <div className="district-select-container">
                  <div className="district-input-wrapper">
                    <input
                      type="text"
                      className="form-input district-search"
                      placeholder="Search district..."
                      value={isEditing ? districtSearch : profile.district}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      onClick={() => isEditing && setShowDistrictDropdown(true)}
                      readOnly={!isEditing}
                    />
                    {isEditing && (
                      <ChevronDown
                        className={`district-dropdown-icon ${showDistrictDropdown ? 'rotated' : ''}`}
                        onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                      />
                    )}
                  </div>
                  {showDistrictDropdown && isEditing && (
                    <div className="district-dropdown">
                      {filteredDistricts.length > 0 ? (
                        filteredDistricts.map((district) => (
                          <div
                            key={district}
                            className="district-option"
                            onClick={() => handleDistrictSelect(district)}
                          >
                            {district}
                          </div>
                        ))
                      ) : (
                        <div className="no-districts">No districts found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  name="blood_group"
                  className="form-select"
                  value={profile.blood_group}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
              {profile.user_type === 'official' && (
                <div className="form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    className="form-input"
                    value={profile.specialization}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
              )}
            </div>

            <div className="stats-section">
              <div className="stat-card">
                <span className="stat-value">{profile.total_reports}</span>
                <span className="stat-label">Total Reports</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{profile.pending_reports}</span>
                <span className="stat-label">Pending</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{profile.completed_reports}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>

            <div className="button-group">
              {!isEditing ? (
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button type="submit" className="save-button">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                type="button"
                className="logout-button"
                onClick={logout}
              >
                Sign Out
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
