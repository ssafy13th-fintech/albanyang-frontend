import { useMemberStore } from '@/store/useMemberStore';
import axios from 'axios';
import { router } from 'expo-router';
import { deleteToken, loadToken } from './AuthTokenStorage';

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

// 응답 인터셉터: 에러 처리 (간단 로그아웃)
let isHandling401 = false; // 중복 처리 방지
let isHandling403 = false; // 중복 처리 방지

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response } = error;
    if (response && response.status === 401 && response.status === 403) {
      if (!isHandling401 || !isHandling403) {
        isHandling401 = true;
        isHandling403 = true;
        // 토큰 제거 등 클린업
        await deleteToken();
        useMemberStore().resetForm();
        
        // 강제 네비게이션: 로그인 화면으로
        router.replace("/login/Login")
        // 짧게 대기 후 flag 해제
        setTimeout(() => { isHandling401 = false; }, 1000);
      }
    }
    return Promise.reject(error);
  }
);
