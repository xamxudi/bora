import {apiClient as api} from "./ApiService";

export default async function generateMedia(payload) {
  // Validate đầu vào
  if (!payload || typeof payload !== "object") {
    throw new Error("Options must be a valid object.");
  }

  try {
    const response = await api.post("/api/task/MediaGeneration", payload, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      timeout: 30000
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `${
          typeof error.response.data === "string"
            ? error.response.data
            : JSON.stringify(error.response.data)
        }`
      );
    } else if (error.request) {
      throw new Error("No response received from server.");
    } else {
      throw new Error(error.message);
    }
  }
}
