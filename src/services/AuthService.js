import axios  from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const authService = {
  /**
   * Login user
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  login: async (username, password) => {
    try {
      const response = await api.post("/api/auth/login", {
        userName: username,
        password: password
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return {
          success: false,
          message:
            error.response.data?.message ||
            error.response.data?.Message ||
            "Đăng nhập thất bại."
        };
      }
      throw error;
    }
  },

  /**
   * Register user
   * @param {string} name
   * @param {string} email 
   * @param {string} phone 
   * @param {string} password 
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  register: async (name, email, phone, password) => {
    try {
      const response = await api.post("/api/auth/register", {
        name: name,
        userName: email,
        phone: phone,
        email: email,
        password: password
      });
      if (response.status === 200) {
        return { success: true, message: response.data || "OTP sent" };
      }
      return response.data;
    } catch (error) {
      if (error.response) {
        return {
          success: false,
          message:
            error.response.data?.message ||
            error.response.data?.Message ||
            "Đăng ký thất bại."
        };
      }
      throw error;
    }
  },

  /**
   * Verify OTP for registration
   * @param {string} name
   * @param {string} email 
   * @param {string} otp 
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  verifyOtp: async (name, email, otp) => {
    try {
      const response = await api.post("/api/auth/verify-otp", {
        name: name,
        email: email,
        otp: otp
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return {
          success: false,
          message:
            error.response.data?.message ||
            error.response.data?.Message ||
            "Xác thực OTP thất bại."
        };
      }
      throw error;
    }
  },

  /**
   * Sign-In with Google
   * @param {string} token 
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  signInWithGoogle: async (token) => {
    try {
      const response = await api.post("/api/auth/login-with-google", {
        token: token
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return {
          success: false,
          message:
            error.response.data?.message ||
            "Đăng nhập Google thất bại."
        };
      }
      throw error;
    }
  },

  /**
   * Sign-Up with Google 
   * @param {string} token 
   * @returns {Promise<{success: boolean, data?: any, message?: string}>}
   */
  signUpWithGoogle: async (token) => {
    try {
      const response = await api.post("/api/auth/register-with-google", {
        token: token
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return {
          success: false,
          message:
            error.response.data?.message ||
            "Đắng ký bằng tài khoản Google thất bại."
        };
      }
      throw error;
    }
  },

  /**
   * Verify token
   */
  verifyToken: async () => {
    try {
      const response = await api.get("/api/auth/verify");
      return response.data;
    } catch (error) {
      if (error.response) {
        return {
          success: false,
          message: "Token không hợp lệ hoặc đã hết hạn."
        };
      }
      throw error;
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      const response = await api.post("/api/auth/logout");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Refresh token
   */
  refresh: async () => {
    try {
      const response = await api.post("/api/auth/refresh");
      return response.data;
    } catch (error) {
      if (error.response) {
        return {
          success: false,
          message:
            error.response.data?.message ||
            "Không thể làm mới token."
        };
      }
      throw error;
    }
  }
};

export default authService;
