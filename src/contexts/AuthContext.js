import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useMessage } from '../contexts/MessageContext';
import authService from '../services/AuthService';
import { getCookie, setCookie } from '../utils/CookieUtils';

const COOKIE_AUTH = process.env.REACT_APP_COOKIE_AUTH || 'SendEnv_AuthToken';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(getCookie(COOKIE_AUTH));
  const message = useMessage();

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);

      if (response.success) {
        const { token, user } = response.data;
        setToken(token);
        setCurrentUser(user);
        setCookie(COOKIE_AUTH, token);

        message.success('Login successful');
        return { success: true };
      } else {
        message.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      message.error('Login failed. Please try again.');
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (name, email, phone, password) => {
    try {
      const response = await authService.register(name, email, phone, password);
      if (response.success) {
        message.success('Registration initiated. Please check your email for OTP.');
        return { success: true, message: response.message };
      } else if (response.message && response.message.toLowerCase().includes('thành công')) {
        message.success(response.message);
        return { success: true, message: response.message };
      } else {
        message.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      message.error('Registration failed. Please try again.');
      return { success: false, message: 'Registration failed' };
    }
  };

  const verifyOtp = async (name, email, otp) => {
    try {
      const response = await authService.verifyOtp(name, email, otp);
      if (response.success) {
        message.success('Registration successful!');
        return { success: true, message: response.message };
      } else if (response.message && response.message.toLowerCase().includes('thành công')) {
        message.success(response.message);
        return { success: true, message: response.message };
      } else {
        message.error(response.message || 'OTP verification failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      message.error('OTP verification failed. Please try again.');
      return { success: false, message: 'OTP verification failed' };
    }
  };

  const signUpWithGoogle = async (token) => {
    try {
      const response = await authService.signUpWithGoogle(token);
      if (response.userId) {
        message.success('Sign-Up with Google successful!');
        await signInWithGoogle(token);
        return { success: true, message: response.message };
      } else {
        message.error(response.message || 'Sign-Up with Google failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      message.error('Sign-Up with Google failed. Please try again.');
      return { success: false, message: 'Sign-Up with Google failed' };
    }
  };

  const signInWithGoogle = async (token) => {
    try {
      const response = await authService.signInWithGoogle(token);
      if (response.success) {
        const { token, user } = response.data;
        setToken(token);
        setCurrentUser(user);
        setCookie(COOKIE_AUTH, token);

        message.success('Google Sign-In successful!');
        return { success: true, message: response.message };
      } else {
        message.error(response.message || 'Google Sign-In failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      message.error('Google Sign-In failed. Please try again.');
      return { success: false, message: 'Google Sign-In failed' };
    }
  };

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      // ignore
    } finally {
      setCookie(COOKIE_AUTH, null);
      setCurrentUser(null);
    }
  }, []);

  const refreshToken = async () => {
    try {
      const response = await authService.refresh();
      if (response.success) {
        const { token, user } = response.data;
        setToken(token);
        setCurrentUser(user);
        message.success('Token refreshed');
        return { success: true };
      } else {
        message.error('Failed to refresh token');
        logout();
        return { success: false };
      }
    } catch (error) {
      message.error('Failed to refresh token');
      logout();
      return { success: false };
    }
  };
  const refreshUser = async () => {
    try {
      const response = await authService.verifyToken(); 
      if (response.success) {
        setCurrentUser(response.data);
        return { success: true, user: response.data };
      } else {
        logout();
        return { success: false };
      }
    } catch (error) {
      logout();
      return { success: false };
    }
  };

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await authService.verifyToken();
        if (response.success) {
          setCurrentUser(response.data);
        } else {
          logout();
        }
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      verify();
    } else {
      setLoading(false);
    }
  }, [token, logout]);

  const value = {
    currentUser,
    token,
    loading,
    login,
    register,
    verifyOtp,
    signUpWithGoogle,
    signInWithGoogle,
    logout,
    refreshToken,
    refreshUser, // 👈 thêm vào context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
