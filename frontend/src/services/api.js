import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 180_000,        // 3 min for LLM-backed calls
  withCredentials: true,   // send HttpOnly auth cookie automatically
});

// Response interceptor — unwrap data or throw
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message =
      err.response?.data?.error?.message ||
      err.response?.data?.detail ||
      err.message ||
      "Something went wrong";
    const code = err.response?.data?.error?.code || "NETWORK_ERROR";
    const enhanced = new Error(message);
    enhanced.code = code;
    enhanced.status = err.response?.status;
    return Promise.reject(enhanced);
  }
);

// --- Auth ---
export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const getCurrentUser = () => api.get("/auth/me");

// --- Projects ---
export const createProject = (data) => api.post("/projects", data);
export const listProjects = (params) => api.get("/projects", { params });
export const getProject = (id) => api.get(`/projects/${id}`);
export const renameProject = (id, name) => api.patch(`/projects/${id}`, { name });
export const deleteProject = (id) => api.delete(`/projects/${id}`);

// --- Parse & Generate ---
export const parseApi = (projectId) => api.post("/projects/parse-api", { projectId });
export const generateDocs = (projectId) => api.post("/projects/generate-docs", { projectId });

// --- Endpoints ---
export const getEndpoint = (id) => api.get(`/endpoints/${id}`);

// --- Search ---
export const searchEndpoints = (params) => api.get("/search", { params });

// --- Export ---
export const exportMarkdown = (projectId) =>
  api.get(`/export/${projectId}/markdown`, { responseType: "text" }).then((res) => {
    return typeof res === "string" ? res : res.data;
  });

export default api;
