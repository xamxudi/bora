import axios from "axios";
import cookie from "../utils/CookieUtils";

const COOKIE_AUTH = process.env.REACT_APP_COOKIE_AUTH || "SendEnv_AuthToken";
const BASE_URL = process.env.REACT_APP_AIGEN_API_URL || 'http://localhost:5004';
const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/chat`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${cookie.get(COOKIE_AUTH)}`
  },
});

const handleError = (error) => {
  console.error("ChatService Error:", error);
  const message =
    error.response?.data?.message ||
    error.response?.data?.Message ||
    error.response?.data ||
    error.message ||
    "Unknown error";
  throw { message };
};

export const ChatService = {
  async fetchSessions() {
    try {
      const res = await apiClient.get(`/sessions`);
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async fetchHistory(sessionId) {
    try {
      const res = await apiClient.get(`/history`, {
        params: { sessionId },
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async createNewSession(providerId) {
    try {
      const res = await apiClient.post(`/new-session`, { providerId });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteSession(sessionId) {
    try {
      await apiClient.delete(`/delete-session/${sessionId}`);
      return true;
    } catch (error) {
      return handleError(error);
    }
  },


  async sendMessageToBot({ message, chatId, providerId, modelId }) {
    try {
      const res = await apiClient.post(`/`, {
        message,
        chatId,
        providerId,
        modelId,
      });
      return res.data;
    } catch (error) {
      return handleError(error);
    }
  }
  ,
  async sendMessageStream({ message, chatId, modelId, onData }) {
    const controller = new AbortController();

    try {
      const response = await fetch(`${BASE_URL}/api/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${cookie.get(COOKIE_AUTH)}`
        },
        credentials: 'include',
        body: JSON.stringify({ message, chatId, modelId }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Lỗi phản hồi từ server');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = ''; // Sử dụng buffer để tích lũy dữ liệu

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true }); // quan trọng: { stream: true }

        // Xử lý từng sự kiện SSE. Mỗi sự kiện kết thúc bằng \n\n
        // Split bằng \n\n và giữ lại phần cuối cùng chưa hoàn chỉnh
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || ''; // Giữ lại phần cuối cùng chưa hoàn chỉnh

        for (const part of parts) {
          // Mỗi 'part' có thể chứa nhiều dòng 'data: ...'
          const lines = part.split('\n');
          let dataContent = '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              dataContent += line.substring('data: '.length);
            }
          }

          if (dataContent === '[DONE]') {

            reader.cancel();
            return;
          }

          if (onData && typeof onData === 'function') {
            onData(dataContent);
          }
        }
      }
    } catch (error) {
      if(error.name == "Error")
        throw error;
      else 
        throw new Error("")
    }
  }
  ,
  async fetchProviders() {
    try {
      const res = await apiClient.get(`/providers`);
      return res.data;
    } catch (error) {
      console.error(' [ChatService] Lỗi khi fetchProviders:', error);
      return handleError(error);
    }
  }
  ,
  fetchModels: async () => {
    try {
      const res = await apiClient.get('/models');
      return res.data;
    } catch (err) {
      console.error('Lỗi fetchModels:', err);
      return [];
    }
  },
};