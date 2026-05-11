import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './AuthSlider.css';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import LazyVideo from '../ui/LazyVideo';

const SignInSignUpSlider = ({ onSignIn, onSignUp, onGoogleSignIn, onGoogleSignUp, loading = false }) => {
  const [isSignUp, setIsSignUp] = useState(false);

  const handleToggleMode = (mode) => {
    setIsSignUp(mode === 'signup');
  };

  return (
    <div className={`auth-slider-container`}>
      <div
        className="form-slider"
        style={{
          transform: isSignUp ? 'translateX(-50%)' : 'translateX(0%)',
        }}
      >
        <div className="form-panel sign-in-panel">
          <SignInForm onSubmit={onSignIn} onGoogleSignIn={onGoogleSignIn} loading={loading} />
        </div>
        <div className="form-panel sign-up-panel">
          <SignUpForm onSubmit={onSignUp} onGoogleSignUp={onGoogleSignUp} loading={loading} />
        </div>
      </div>
      <div className="overlay-container">
        <div
          className="overlay"
          style={{
            backgroundColor: "#e3e3e3",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <LazyVideo
          src="/3ad370c3-51ac-4ce0-9bac-9a1aa2725058.mp4"                     // video nền
          preview="/4d1568003b1ab344ea0b.jpg"         // ảnh preview
          className="overlay"                        // giữ style overlay
          autoPlay
          loop
          muted
        >
          {!isSignUp ? (
            <div className="overlay-panel overlay-right">
              <button
                className="ghost"
                onClick={() => handleToggleMode('signup')}
                disabled={loading}
              >
                ĐĂNG KÍ
              </button>
            </div>
          ) : (
            <div className="overlay-panel overlay-left">
              <button
                className="ghost"
                onClick={() => handleToggleMode('signin')}
                disabled={loading}
              >
                ĐĂNG NHẬP
              </button>
            </div>
          )}
          </LazyVideo>
        </div>
      </div>
    </div>
  );
};

SignInSignUpSlider.propTypes = {
  onSignIn: PropTypes.func.isRequired,
  onSignUp: PropTypes.func.isRequired,
  onGoogleSignIn: PropTypes.func.isRequired,
  onGoogleSignUp: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default SignInSignUpSlider;