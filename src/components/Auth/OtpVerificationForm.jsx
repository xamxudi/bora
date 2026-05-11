import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './OtpVerificationForm.css';

const OTP_LENGTH = 6;

const OtpVerificationForm = ({ email, name, onVerify, onResend, loading = false }) => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [isResending, setIsResending] = useState(false);
  const inputsRef = useRef([]);

  const handleChange = (e, idx) => {
    const { value } = e.target;
    if (!/^[0-9]{0,1}$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[idx] = value;
    setOtp(newOtp);
    if (value && idx < OTP_LENGTH - 1) {
      inputsRef.current[idx + 1].focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      const newOtp = [...otp];
      newOtp[idx - 1] = '';
      setOtp(newOtp);
      inputsRef.current[idx - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (paste.length === OTP_LENGTH) {
      setOtp(paste.split(''));
      inputsRef.current[OTP_LENGTH - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === OTP_LENGTH) {
      onVerify(name, email, code);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend(name, email);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="otp-form-container">
      <div className="auth-form">
        <div className="auth-header">
          <h1>Xác minh Email của bạn</h1>
          <p>Chúng tôi đã gửi mã xác minh đến<b>{email}</b></p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="otp-input-group">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-input"
                value={digit}
                onChange={e => handleChange(e, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                onPaste={handlePaste}
                ref={el => (inputsRef.current[idx] = el)}
                disabled={loading}
                autoFocus={idx === 0}
              />
            ))}
          </div>
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || otp.join('').length !== OTP_LENGTH}
          >
            {loading ? 'Đang xác minh...' : 'Xác minh mã'}
          </button>
        </form>
        <div className="auth-divider">
          <span>Không nhận được mã?</span>
        </div>
        <div className="auth-toggle">
          <button
            type="button"
            className="toggle-link"
            onClick={handleResend}
            disabled={loading || isResending}
          >
            {isResending ? 'Đang gửi lại...' : 'Gửi lại mã'}
          </button>
        </div>
      </div>
    </div>
  );
};

OtpVerificationForm.propTypes = {
  email: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  onVerify: PropTypes.func.isRequired,
  onResend: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default OtpVerificationForm; 