import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Camera, ChevronDown, Info, Upload, Search, UserPlus, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { districts } from '../../../data/districts';
import '../styles/Register.css';

const Tooltip = ({ text }) => (
  <div className="group relative inline-block ml-1">
    <Info className="h-4 w-4 text-gray-400 inline" />
    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-sm rounded p-2 absolute z-10 left-1/2 -translate-x-1/2 -top-12 w-48 text-center pointer-events-none">
      {text}
      <div className="border-8 border-transparent border-t-gray-800 absolute left-1/2 -translate-x-1/2 -bottom-4"></div>
    </div>
  </div>
);

const PasswordRequirements = ({ password }) => {
  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains a number', met: /\d/.test(password) },
    { text: 'Contains an uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Contains a lowercase letter', met: /[a-z]/.test(password) },
    { text: 'Contains a special character', met: /[!@#$%^&*]/.test(password) }
  ];

  return (
    <div className="mt-2 space-y-1">
      {requirements.map(({ text, met }, index) => (
        <div key={index} className={`text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
          • {text}
        </div>
      ))}
    </div>
  );
};

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    address: '',
    district: '',
    userType: 'citizen'
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
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
    setFormData(prev => ({ ...prev, district }));
    setDistrictSearch('');
    setShowDistrictDropdown(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Format as 977-XX-XXXXXXX
    if (value.length <= 2) {
      value = `977-${value}`;
    } else if (value.length <= 4) {
      value = `977-${value.slice(2)}`;
    } else {
      value = `977-${value.slice(2, 4)}-${value.slice(4, 11)}`;
    }
    
    setFormData(prev => ({
      ...prev,
      phoneNumber: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      if (profileImage) {
        formDataToSend.append('profileImage', profileImage);
      }

      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Registration successful!');
      login(data.token);
      navigate('/profile');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card max-w-2xl">
        <div className="text-center mb-8">
          <UserPlus className="h-12 w-12 text-indigo-600 mx-auto" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="profile-upload-container">
            <div className="profile-image-wrapper">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile Preview"
                  className="profile-preview"
                />
              ) : (
                <div className="profile-placeholder">
                  <User className="placeholder-icon" />
                </div>
              )}
              <label htmlFor="profileImage" className="upload-overlay">
                <Upload className="upload-icon" />
                <span className="upload-text">Upload Photo</span>
              </label>
            </div>
            <input
              type="file"
              id="profileImage"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden-input"
            />
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                required
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Middle Name
              </label>
              <input
                type="text"
                name="middleName"
                className="form-input"
                placeholder="Optional"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                required
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
                <Tooltip text="This will be your username for login" />
              </label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
                <Tooltip text="Format: 977-XX-XXXXXXX (Nepal)" />
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handlePhoneNumberChange}
                placeholder="977-XX-XXXXXXX"
                className="form-input"
                pattern="977-[0-9]{2}-[0-9]{7}"
                maxLength="13"
                required
              />
            </div>
          </div>

          {/* Location Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                required
                className="form-input"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="form-group district-select-container" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <div className="district-input-wrapper">
                <input
                  type="text"
                  className="form-input district-search"
                  placeholder="Search district..."
                  value={districtSearch || formData.district}
                  onChange={(e) => {
                    setDistrictSearch(e.target.value);
                    setShowDistrictDropdown(true);
                  }}
                  onFocus={() => setShowDistrictDropdown(true)}
                />
                <ChevronDown 
                  className={`district-dropdown-icon ${showDistrictDropdown ? 'rotated' : ''}`}
                  onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                />
              </div>
              {showDistrictDropdown && (
                <div className="district-dropdown">
                  {filteredDistricts.length > 0 ? (
                    filteredDistricts.map(district => (
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

          {/* Account Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Type
            </label>
            <select
              name="userType"
              required
              className="form-input"
              value={formData.userType}
              onChange={handleChange}
            >
              <option value="citizen">Citizen</option>
              <option value="official">Official</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
              <Tooltip text="Create a strong password to secure your account" />
            </label>
            <input
              type="password"
              name="password"
              required
              className="form-input"
              value={formData.password}
              onChange={handleChange}
            />
            <PasswordRequirements password={formData.password} />
          </div>

          <div className="flex items-center justify-between pt-4">
            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
              Already have an account? Sign in
            </Link>
            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
