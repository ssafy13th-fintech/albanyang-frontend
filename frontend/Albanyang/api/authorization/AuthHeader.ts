import axios from 'axios';
import { loadToken } from './AuthTokenStorage';

const api = axios.create({
  baseURL: 'https://your-api-domain.com',
});

api.interceptors.request.use(async (config) => {
  const token = await loadToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});
