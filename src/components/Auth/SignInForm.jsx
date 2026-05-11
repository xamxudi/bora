import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GoogleLogin } from '@react-oauth/google';

const SignInForm = ({ onSubmit, onGoogleSignIn, loading = false }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.email && formData.password) {
      onSubmit(formData.email, formData.password);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      await onGoogleSignIn(credentialResponse.credential);
    } catch (err) {
      console.error('Google Sign-In error:', err);
    }
  };

  const isFormValid = formData.email && formData.password;

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h1>Chào mừng trở lại!</h1>
        <p>Nhập thông tin để truy cập tài khoản của bạn</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Địa chỉ email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Nhập email của bạn"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <div className="password-header">
            <label htmlFor="password">Mật khẩu</label>
            <button type="button" className="forgot-password" disabled={loading}>
              Quên mật khẩu
            </button>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Nhập mật khẩu của bạn"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              disabled={loading}
            />
            <span>Lưu tài khoản đăng nhập</span>
          </label>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={loading || !isFormValid}
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="auth-divider">
        <span>Hoặc</span>
      </div>

      <div className="social-login">
        <GoogleLogin
          text="signin_with"
          onSuccess={handleGoogleLogin}
          onError={() => {
            console.error('Google Sign-In failed');
          }}
        />
      </div>
    </div>
  );
};

SignInForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onGoogleSignIn: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default SignInForm;