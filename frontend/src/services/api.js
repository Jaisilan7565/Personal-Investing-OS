import axios from "axios";
import { store, logoutSuccess, addToast } from "../store";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Inject JWT token dynamically from localStorage
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("investorOS_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 and parse data
apiClient.interceptors.response.use(
  (response) => {
    // Axios returns the full response object; return the data payload
    return response.data;
  },
  (error) => {
    const { response, config } = error;
    
    // Check if it's a 401 Unauthorized and not the login endpoint
    if (response && response.status === 401 && config.url !== "/auth/login") {
      store.dispatch(logoutSuccess());
      store.dispatch(addToast({ type: "error", message: "Session expired. Please sign in again." }));
    }
    
    // Extract standard error message if available, otherwise fallback
    const message = response?.data?.message || error.message || "Something went wrong with the request.";
    return Promise.reject(new Error(message));
  }
);

/**
 * Reusable core request wrapper for backward compatibility with existing services
 */
export async function request(endpoint, options = {}) {
  // Translate fetch-like options to Axios config
  const config = {
    url: endpoint,
    method: options.method || "GET",
    data: options.body ? JSON.parse(options.body) : undefined,
    headers: options.headers,
  };
  
  return apiClient(config);
}
