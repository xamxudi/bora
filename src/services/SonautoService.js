// SonautoApiService.js
import axios from "axios";

const COOKIE_AUTH = process.env.REACT_APP_COOKIE_AUTH || "SendEnv_AuthToken";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_MUSIC_API_URL || "http://localhost:5005",
  withCredentials: true, // Nếu API không cần cookie thì để false cho đỡ rắc rối CORS
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.warn("[ApiService] Unauthorized - clearing cookie...");
      document.cookie = `${COOKIE_AUTH}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const handleError = (error) => {
  console.error("API Error:", error);
  // 👉 phân biệt lỗi network/CORS
  if (error.request && !error.response) {
    throw new Error("Không thể kết nối server (mạng hoặc CORS).");
  }
  const data = error?.response?.data;
  const message =
    data?.message ||
    data?.Message ||
    (typeof data === "string" ? data : null) ||
    error?.message ||
    "Unknown error";
  throw new Error(message);
};

export const SonautoService = {
  async generate(payload) {
    try {
      const res = await apiClient.post("/api/sonauto/generate", payload);
      return res.data; // { task_id }
    } catch (err) {
      return handleError(err);
    }
  },

  async getStatus(taskId) {
    try {
      const res = await apiClient.get(
        `/api/sonauto/status/${encodeURIComponent(taskId)}`,
        { params: { _ts: Date.now() } } // 👉 tránh cache
      );
      return res.data; // { status, download_url }
    } catch (err) {
      return handleError(err);
    }
  },

  async getHistory() {
    try {
      const res = await apiClient.get("/api/sonauto/history", {
        params: { _ts: Date.now() }, // 👉 tránh cache
      });
      return res.data;
    } catch (err) {
      return handleError(err);
    }
  },

  // 👉 hỗ trợ AbortController: { intervalMs, timeoutMs, signal }
  async waitForDone(
    taskId,
    { intervalMs = 3000, timeoutMs = 180000, signal } = {}
  ) {
    const start = Date.now();
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (signal?.aborted) throw new Error("Đã hủy");

      const s = await this.getStatus(taskId);
      const st = String(s.status || "").toUpperCase();
      if (st === "SUCCESS" || st === "FAILED") return s;

      if (Date.now() - start > timeoutMs) {
        throw new Error("Đợi quá thời gian cho phép.");
      }
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  },
};
