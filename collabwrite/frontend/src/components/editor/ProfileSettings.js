import React, { useState, useEffect, useRef } from 'react';
import './ProfileSettings.css';

export default function ProfileSettings({ show, onClose, onSave }) {
  const modalRef = useRef(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: null,
    avatarPreview: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile({
        ...parsed,
        avatar: null
      });
    }
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ avatar: 'File size must be less than 2MB' });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          avatar: file,
          avatarPreview: reader.result
        }));
        setErrors(prev => ({ ...prev, avatar: '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!profile.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      const profileToSave = {
        name: profile.name,
        email: profile.email,
        bio: profile.bio,
        avatarPreview: profile.avatarPreview
      };
      
      localStorage.setItem('userProfile', JSON.stringify(profileToSave));
      onSave(profileToSave);
      onClose();
    }
  };

  const handleReset = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setProfile({
        ...parsed,
        avatar: null
      });
    } else {
      setProfile({
        name: '',
        email: '',
        bio: '',
        avatar: null,
        avatarPreview: null
      });
    }
    setErrors({});
  };

  if (!show) return null;

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal" ref={modalRef}>
        <div className="profile-modal-header">
          <h2>Profile Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="profile-modal-body">
          <div className="avatar-section">
            <div className="avatar-container">
              <img 
                src={profile.avatarPreview || '/photo.png'} 
                alt="Profile" 
                className="avatar-preview"
              />
              <label className="avatar-upload-label">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="avatar-input"
                />
                <span className="upload-icon">📷</span>
              </label>
            </div>
            {errors.avatar && <span className="error">{errors.avatar}</span>}
          </div>

          <div className="form-section">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                className={errors.name ? 'error-input' : ''}
                placeholder="Enter your full name"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                className={errors.email ? 'error-input' : ''}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="4"
                maxLength="500"
              />
              <span className="char-count">{profile.bio.length}/500</span>
            </div>
          </div>
        </div>

        <div className="profile-modal-footer">
          <button className="secondary-button" onClick={handleReset}>
            Reset
          </button>
          <button className="primary-button" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
