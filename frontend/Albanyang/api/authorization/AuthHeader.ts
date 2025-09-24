import axios from 'axios';
import { loadToken } from './AuthTokenStorage';

export const api = axios.create({
  baseURL: 'https://j13a605.p.ssafy.io',
    timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await loadToken();
  console.log("get header token : ", token)
  if (token) {
    config.headers['Authorization'] = `${token}`;
  }
  return config;
});
