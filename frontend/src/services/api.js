import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const createCrudAPI = (resource) => ({
  getAll: () => api.get(`/${resource}`),
  getOne: (id) => api.get(`/${resource}/${id}`),
  create: (data) => api.post(`/${resource}`, data),
  update: (id, data) => api.put(`/${resource}/${id}`, data),
  delete: (id) => api.delete(`/${resource}/${id}`),
});

export const projectsAPI = createCrudAPI('projects');
export const testCasesAPI = { ...createCrudAPI('test-cases'), generate: (id) => api.post(`/test-cases/${id}/generate`) };
export const testSuitesAPI = createCrudAPI('test-suites');
export const codeAnalysisAPI = { ...createCrudAPI('code-analysis'), analyze: (id) => api.post(`/code-analysis/${id}/analyze`) };
export const bugDetectionAPI = { ...createCrudAPI('bug-detection'), detect: (id) => api.post(`/bug-detection/${id}/detect`) };
export const coverageAPI = createCrudAPI('coverage-analysis');
export const templatesAPI = createCrudAPI('test-templates');
export const teamsAPI = createCrudAPI('teams');
export const executionsAPI = createCrudAPI('test-executions');
export const apiTestingAPI = { ...createCrudAPI('api-testing'), generate: (id) => api.post(`/api-testing/${id}/generate`) };
export const performanceAPI = { ...createCrudAPI('performance-testing'), generate: (id) => api.post(`/performance-testing/${id}/generate`) };
export const securityAPI = { ...createCrudAPI('security-testing'), scan: (id) => api.post(`/security-testing/${id}/scan`) };
export const integrationAPI = { ...createCrudAPI('integration-testing'), generate: (id) => api.post(`/integration-testing/${id}/generate`) };
export const regressionAPI = { ...createCrudAPI('regression-testing'), generate: (id) => api.post(`/regression-testing/${id}/generate`) };
export const reportsAPI = {
  ...createCrudAPI('reports'),
  generate: (id) => api.get(`/reports/${id}/generate`),
  generateHtml: (id) => api.get(`/reports/${id}/generate-html`, { responseType: 'blob' }),
};
export const mutationAPI = {
  score: (id) => api.post(`/test-cases/${id}/mutation-score`),
};
export const uploadCodeAPI = {
  upload: (formData) => api.post('/test-cases/upload-code', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
export const testExecutionsRunAPI = {
  run: (id) => api.post(`/test-executions/${id}/run`),
};

export default api;
