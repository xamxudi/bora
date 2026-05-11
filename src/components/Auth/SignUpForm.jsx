import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { GoogleLogin } from '@react-oauth/google';

const SignUpForm = ({ onSubmit, onGoogleSignUp, loading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
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
    if (formData.name && formData.email && formData.password && formData.confirmPassword && formData.agreeToTerms) {
      if (formData.password === formData.confirmPassword) {
        onSubmit(formData.name, formData.email, formData.phone, formData.password);
      }
    }
  };

  const handleGoogleSignUp = async (credentialResponse) => {
    try {
      await onGoogleSignUp(credentialResponse.credential);
    } catch (err) {
      console.error('Google Sign-In error:', err);
    }
  };

  const isFormValid = formData.name && formData.email && formData.phone && formData.password && formData.confirmPassword && formData.agreeToTerms && (formData.password === formData.confirmPassword);

  return (
    <div className="auth-form">
      <div className="auth-header">
        <h1>Tạo tài khoản</h1>
        <p>Nhập thông tin để tạo tài khoản của bạn</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Họ và tên</label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="Nhập họ và tên của bạn"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Địa chỉ email của bạn</label>
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
          <label htmlFor="phone">Số đi động của bạn</label>
          <input
            type="phone"
            id="phone"
            name="phone"
            placeholder="Nhập số đi động của bạn"
            value={formData.phone}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
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

        <div className="form-group">
          <div className="password-header">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          </div>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu của bạn"
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            required
          />
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              disabled={loading}
            />
            <span>
              Tôi đồng ý với{' '}
              <button type="button" className="terms-link" disabled={loading}>
                Điều khoản và điều kiện
              </button>
            </span>
          </label>
        </div>

        <button
          type="submit"
          className="auth-submit-btn"
          disabled={loading || !isFormValid}
        >
          {loading ? 'Đang tạo tài khoản...' : 'Đăng kí '}
        </button>
      </form>

      <div className="auth-divider">
        <span>Hoặc</span>
      </div>

      <div className="social-login">
        <GoogleLogin
          text="signup_with"
          onSuccess={handleGoogleSignUp}
          onError={() => {
            console.error('Google Sign-In failed');
          }}
        />
      </div> 
    </div>
  );
};

SignUpForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onGoogleSignUp: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default SignUpForm;