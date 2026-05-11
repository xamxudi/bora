import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import PropTypes from 'prop-types';
import './MobileLoginForm.css';

const MobileLoginForm = ({ onSignIn, onGoogleSignIn, onSwitchToSignUp, loading }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSignIn(formData.email, formData.password);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    onGoogleSignIn(credentialResponse.credential);
  };

  const handleGoogleError = () => {
    // Google Sign-In failed silently
  };

  return (
    <div className="mobile-login-form">
      <div className="mobile-logo-container">
        <img 
          src={'/bora192.png'} 
          alt="Logo" 
          className="mobile-logo-icon"
        />
      </div>
      <p className="mobile-subtitle"></p>
      
      <form onSubmit={handleSubmit}>
        <div className="mobile-input-group">
          <i className="fas fa-envelope mobile-input-icon"></i>
          <input
            type="email"
            name="email"
            className="mobile-input"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="mobile-input-group">
          <i className="fas fa-lock mobile-input-icon"></i>
          <input
            type="password"
            name="password"
            className="mobile-input"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="mobile-login-btn"
          disabled={loading}
        >
          {loading ? 'Đang đăng nhập' : 'Đăng nhập'}
        </button>
      </form>
      
      <div className="mobile-divider">
        <span>Hoặc</span>
      </div>
      
      <GoogleLogin
        text="signin_with"
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        render={({ onClick }) => (
          <button 
            type="button" 
            className="mobile-social-btn mobile-gmail-btn"
            onClick={onClick}
          >
            <i className="fab fa-google"></i>
            Gmail
          </button>
        )}
      />
      
      <p className="mobile-signup-text">
        Bạn chưa có tài khoản?{' '}
        <button type="button" className="mobile-signup-link" onClick={onSwitchToSignUp}>Đăng kí</button>
      </p>
    </div>
  );
};

MobileLoginForm.propTypes = {
  onSignIn: PropTypes.func.isRequired,
  onGoogleSignIn: PropTypes.func.isRequired,
  onSwitchToSignUp: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default MobileLoginForm; 