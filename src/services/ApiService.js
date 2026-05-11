import axios from "axios";

const COOKIE_AUTH = process.env.REACT_APP_COOKIE_AUTH || "SendEnv_AuthToken";
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "https://localhost:5472",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
});
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      document.cookie = `${COOKIE_AUTH}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Strict`;
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

const handleError = (error) => {
  console.error("API Error:", error);
  const message =
    error.response?.data?.message ||
    error.response?.data?.Message ||
    error.response?.data ||
    error.message ||
    "Unknown error";
  throw new Error(message);
};
export const LoRAService = {
  async getAll(category = null, searchTerm = null) {
    try {
      const response = await apiClient.get("/api/loras", {
        params: {
          category: category === "ALL" ? null : category,
          search: searchTerm,
        },
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async getById(id) {
    try {
      const response = await apiClient.get(`/api/loras/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
};
export const CheckoutService = {
  async getAll(offset = 0, limit = 10) {
    try {
      const response = await apiClient.get("/api/checkouts", { params: { offset, limit } });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async getById(id) {
    try {
      const response = await apiClient.get(`/api/checkouts/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
};
export const ControlNetService = {
  async getAll(offset = 0, limit = 10) {
    try {
      const response = await apiClient.get("/api/controlnets", { params: { offset, limit } });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async getById(id) {
    try {
      const response = await apiClient.get(`/api/controlnets/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
};
export const VAEsService = {
  async getAll(offset = 0, limit = 10, category = null, searchTerm = null) {
    try {
      const response = await apiClient.get("/api/vaes", {
        params: {
          offset,
          limit,
          category: category === "ALL" ? null : category,
          search: searchTerm,
        },
      });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async getById(id) {
    try {
      const response = await apiClient.get(`/api/vaes/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }
};
export const TaskService = {
  async getById(id) {
    try {
      const response = await apiClient.get(`/api/task/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async getTasks(limit = 20) {
    try {
      const response = await apiClient.get(`/api/task`, { params: { limit } });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async getRecent(limit = 20) {
    try {
      const response = await apiClient.get("/api/task/recent", { params: { limit } });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async getQueueLength() {
    try {
      const response = await apiClient.get("/api/task/queue/length");
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async delete(id) {
    try {
      const response = await apiClient.delete(`/api/task/${id}`);
      return response.status;
    } catch (error) {
      return handleError(error);
    }
  },
};
export const BuildParamService = {
  async getByWorkflowId(workflowId) {
    try {
      const response = await apiClient.get(`/api/workflow/${workflowId}/build-params`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
};
export const StyleService = {
  async getAll(offset = 0, limit = 10) {
    try {
      const response = await apiClient.get("/api/styles", { params: { offset, limit } });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async getById(id) {
    try {
      const response = await apiClient.get(`/api/styles/${id}`);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async create(payload) {
    try {
      const response = await apiClient.post("/api/styles", payload);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async update(id, payload) {
    try {
      const response = await apiClient.patch(`/api/styles/${id}`, payload);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  },
  async delete(id) {
    try {
      const response = await apiClient.delete(`/api/styles/${id}`);
      return response.status;
    } catch (error) {
      return handleError(error);
    }
  },
};

export const APIService = {
  loras: LoRAService,
  checkouts: CheckoutService,
  controlnets: ControlNetService,
  vaes: VAEsService,
  task: TaskService,
  buildParam :BuildParamService,
  styles: StyleService,
};
