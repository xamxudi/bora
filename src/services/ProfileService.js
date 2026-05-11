import axios from "axios";

// Separate axios instance mirroring AuthService configuration
const api = axios.create({
	baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:5000",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

const profileService = {
	/**
	 * Fetch current user's profile
	 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
	 */
	getProfile: async () => {
		try {
			const response = await api.get("/api/User/me");
			return response.data;
		} catch (error) {
			if (error.response) {
				return {
					success: false,
					message:
						error.response.data?.message ||
						error.response.data?.Message ||
						"Không thể tải hồ sơ người dùng.",
				};
			}
			throw error;
		}
	},

	/**
	 * Change password for current user
	 * Backend expects { userId, password }
	 */
	changePassword: async (userId, newPassword) => {
		try {
			const res = await api.post('/api/User/ChangePassword', { userId, password: newPassword });
			return { success: true, data: res.data };
		} catch (error) {
			if (error.response) {
				return { success: false, message: error.response.data?.message || 'Đổi mật khẩu thất bại.' };
			}
			throw error;
		}
	},

	/**
	 * Upload avatar image for current user
	 * @param {File} file
	 */
	uploadAvatar: async (file) => {
		try {
			const formData = new FormData();
			formData.append('file', file);
			const response = await api.post('/api/users/me/avatar', formData, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			return response.data;
		} catch (error) {
			if (error.response) {
				return {
					success: false,
					message:
						error.response.data?.message ||
						error.response.data?.Message ||
						'Không thể tải ảnh đại diện.',
				};
			}
			throw error;
		}
	},

	/**
	 * Update current user's profile
	 * @param {{ fullName: string, email: string, dateOfBirth?: string, citizenId?: string, address?: string }} payload
	 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
	 */
	updateProfile: async (payload) => {
		try {
			const response = await api.put("/api/User/me", payload);
			return response.data;
		} catch (error) {
			if (error.response) {
				return {
					success: false,
					message:
						error.response.data?.message ||
						error.response.data?.Message ||
						"Cập nhật hồ sơ thất bại.",
				};
			}
			throw error;
		}
	},

	/**
	 * Get current subscription plan of logged-in user
	 */
	getSubscriptionPlan: async () => {
		try {
			const res = await api.get('/api/billing/plan');
			return res.data;
		} catch (error) {
			if (error.response) {
				return { success: false, message: error.response.data?.message || 'Không thể lấy gói đăng ký.' };
			}
			throw error;
		}
	},

	/**
	 * Get credit transactions for logged-in user
	 * @param {number} limit
	 */
	getTransactions: async (limit = 20) => {
		try {
			const res = await api.get(`/api/billing/transactions?limit=${encodeURIComponent(limit)}`);
			// API trả về {success: true, data: [...]}
			return res.data;
		} catch (error) {
			if (error.response) {
				return { success: false, message: error.response.data?.message || 'Không thể tải lịch sử giao dịch.' };
			}
			throw error;
		}
	},

	/**
	 * Get user statistics (image count, video count)
	 */
	getUserStats: async () => {
		try {
			const res = await api.get('/api/billing/stats');
			return res.data;
		} catch (error) {
			if (error.response) {
				return { success: false, message: error.response.data?.message || 'Không thể tải thống kê người dùng.' };
			}
			throw error;
		}
	},

	/**
	 * Get credit balance of current user
	 */
	getCreditBalance: async () => {
		try {
			const res = await api.get('/api/billing/credits/balance');
			return res.data;
		} catch (error) {
			if (error.response) {
				return { success: false, message: error.response.data?.message || 'Không thể lấy số dư tín dụng.' };
			}
			throw error;
		}
	},

	/**
	 * Adjust credits (positive to add, negative to deduct)
	 */
	adjustCredits: async (amount, reason) => {
		try {
			const res = await api.post('/api/billing/credits/adjust', { amount, reason });
			return res.data;
		} catch (error) {
			if (error.response) {
				return { success: false, message: error.response.data?.message || 'Điều chỉnh tín dụng thất bại.' };
			}
			throw error;
		}
	},

	/**
	 * Get user creations (images/videos)
	 * @param {string} type - 'all', 'images', or 'videos'
	 * @param {number} limit
	 */
	getUserCreations: async (type = 'all', limit = 20) => {
		try {
			const res = await api.get(`/api/billing/creations?type=${encodeURIComponent(type)}&limit=${encodeURIComponent(limit)}`);
			return res.data;
		} catch (error) {
			if (error.response) {
				return { success: false, message: error.response.data?.message || 'Không thể tải danh sách tác phẩm.' };
			}
			throw error;
		}
	},
};

export default profileService;

