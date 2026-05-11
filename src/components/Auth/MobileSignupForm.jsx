import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import PropTypes from 'prop-types';
import './MobileLoginForm.css';

const MobileSignupForm = ({ onSignUp, onGoogleSignIn, onSwitchToSignIn, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLocalError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }
    onSignUp(formData.name, formData.email, formData.password);
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
      <p className="mobile-subtitle">Tạo tài khoản cho riêng mình</p>

      {localError && (
        <div className="error-message" style={{ position:'static', marginBottom: 12 }}>
          {localError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mobile-input-group">
          <i className="fas fa-user mobile-input-icon"></i>
          <input
            type="text"
            name="name"
            className="mobile-input"
            placeholder="Họ và tên"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

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

        <div className="mobile-input-group">
          <i className="fas fa-lock mobile-input-icon"></i>
          <input
            type="password"
            name="confirmPassword"
            className="mobile-input"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="mobile-login-btn"
          disabled={loading}
        >
          {loading ? 'Đăng tạo tài khoản' : 'Tạo tài khoản'}
        </button>
      </form>
      
      <div className="mobile-divider">
        <span>or</span>
      </div>
      
      <GoogleLogin
        text="signup_with"
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        render={({ onClick }) => (
          <button 
            type="button" 
            className="mobile-social-btn mobile-gmail-btn"
            onClick={onClick}
          >
            <i className="fab fa-google"></i>
            Continue with Google
          </button>
        )}
      />
      
      <p className="mobile-signup-text">
        Bạn đã có tài khoản{' '}
        <button type="button" className="mobile-signup-link" onClick={onSwitchToSignIn}>Đăng nhập</button>
      </p>
    </div>
  );
};

MobileSignupForm.propTypes = {
  onSignUp: PropTypes.func.isRequired,
  onGoogleSignIn: PropTypes.func.isRequired,
  onSwitchToSignIn: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default MobileSignupForm;