import axios from 'axios';

const api = axios.create({
  // Em produção o Nginx encaminha /api para o backend; no desenvolvimento
  // VITE_API_URL pode apontar diretamente para a API local.
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;
