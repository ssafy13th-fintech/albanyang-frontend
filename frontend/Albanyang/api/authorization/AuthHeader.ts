import axios from 'axios';
import { loadToken } from './AuthTokenStorage';

/**
 * 헤더가 필요 있는 api 호출입니다.
 * 자동으로 interceptor에 의해 token이 호출됩니다.
 */
export const api = axios.create({
  baseURL: 'https://j13a605.p.ssafy.io',
    timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 헤더가 필요 없는 api 호출입니다.
 */
export const api_noheader = axios.create({
  baseURL: 'https://j13a605.p.ssafy.io', // <-- 프로젝트에 맞게 수정
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
