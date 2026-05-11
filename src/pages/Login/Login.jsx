import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SignInSignUpSlider from '../../components/Auth/SignInSignUpSlider';
import OtpVerificationForm from '../../components/Auth/OtpVerificationForm';
import MobileLoginForm from '../../components/Auth/MobileLoginForm';
import MobileSignupForm from '../../components/Auth/MobileSignupForm';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './Login.css';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [otpStep, setOtpStep] = useState(false);
  const [pendingUser, setPendingUser] = useState({ name: '', email: '', phone: '', password: '' });
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSignUp, setIsMobileSignUp] = useState(false);
  const { login, register, verifyOtp, signUpWithGoogle, signInWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const returnUrl = queryParams.get("returnUrl") || "/";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSignIn = async (email, password) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (returnUrl.startsWith("http")) {
          window.location.href = returnUrl;
        } else {
          // Nếu chỉ là path nội bộ
          navigate(returnUrl);
        }
      } else {
        setError(result.message || 'Login failed.');
      }
    } catch (error) {
      console.error('[Login] Unexpected error:', error);
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (name, email, phone, password) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await register(name, email, phone, password);
      if (result.success) {
        setPendingUser({ name, email, phone, password });
        setOtpStep(true);
        setError(null);
        setSuccess('Mã xác thực đã được gửi đến email của bạn. Vui lòng kiểm tra và nhập mã.');
      } else {
        setError(result.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('[SignUp] Unexpected error:', error);
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (name, email, otp) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await verifyOtp(name, email, otp);
      const isSuccess = result.success || (result.message && result.message.toLowerCase().includes('thành công'));
      if (isSuccess) {
        setOtpStep(false);
        setPendingUser(null);
        setSuccess('Đăng ký thành công! Vui lòng đăng nhập tài khoản mới.');
        setTimeout(() => {
          setSuccess(null);
          navigate('/login'); // Redirect to login page
        }, 2000);
      } else {
        setError(result.message || 'OTP verification failed.');
      }
    } catch (error) {
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {

      const result = await register(pendingUser.name, pendingUser.email, pendingUser.phone, pendingUser.password);
      if (result.success) {
        setSuccess('OTP resent. Please check your email.');
      } else {
        setError(result.message || 'Failed to resend OTP.');
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async (token) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await signUpWithGoogle(token);
      if (result.success) {
        if (returnUrl.startsWith("http")) {
          window.location.href = returnUrl;
        } else {
          // Nếu chỉ là path nội bộ
          navigate(returnUrl);
        }
      } else {
        setError(result.message || 'sign-up with Google failed.');
      }
    } catch (error) {
      console.error('[handleGoogleSignUp] Unexpected error:', error);
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async (token) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await signInWithGoogle(token);
      if (result.success) {
        if (returnUrl.startsWith("http")) {
          window.location.href = returnUrl;
        } else {
          // Nếu chỉ là path nội bộ
          navigate(returnUrl);
        }
      } else {
        setError(result.message || 'Google Sign-In failed.');
      }
    } catch (error) {
      console.error('[GoogleSignIn] Unexpected error:', error);
      setError('Unexpected error. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (

    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_OAUTH_CLIENTID}>
      <div className="login-container">
        {!isMobile && (
          <>
            <img
              src={process.env.PUBLIC_URL + '/bora192.png'}
              alt="Logo"
              className="login-bg-logo"
              onClick={() => navigate('/')}
            />
          </>
        )}
        <div className="login-wrapper">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}
          {otpStep ? (
            <OtpVerificationForm
              email={pendingUser.email}
              name={pendingUser.name}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              loading={loading}
            />
          ) : isMobile ? (
            isMobileSignUp ? (
              <MobileSignupForm
                onSignUp={handleSignUp}
                onGoogleSignIn={handleGoogleSignUp}
                onSwitchToSignIn={() => setIsMobileSignUp(false)}
                loading={loading}
              />
            ) : (
              <MobileLoginForm
                onSignIn={handleSignIn}
                onGoogleSignIn={handleGoogleSignIn}
                onSwitchToSignUp={() => setIsMobileSignUp(true)}
                loading={loading}
              />
            )
          ) : (
            <SignInSignUpSlider
              onSignIn={handleSignIn}
              onSignUp={handleSignUp}
              onGoogleSignIn={handleGoogleSignIn}
              onGoogleSignUp={handleGoogleSignUp}
              loading={loading}
            />
          )}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
