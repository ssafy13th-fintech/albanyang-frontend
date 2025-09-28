// ===== api/Alarms.ts - 새 파일 =====

import { api } from './authorization/AuthHeader';
import { AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

export interface AlarmInfo {
  id: number;
  messageId: string;
  screen: 'GET_PAYSLIP' | 'DENY_PAYSLIP' | 'ACCEPT_PAYSLIP' | 'GET_INVITATION' | 'DENY_INVITATION' | 'ACCEPT_INVITATION' | 'NOTIFICATION';
  screenId: string;
  storeId: number;
  storeName: string;
  title: string;
  isRead: boolean;
  isResponse: boolean;
  date: string;
}

export interface AlarmListResponse {
  alarmInfos: AlarmInfo[];
}

function handleAxiosError(err: unknown): never {
  if ((err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;
    throw new Error(
      `Request failed${status ? ` (status ${status})` : ''}: ${
        (data && (data as any).message) || axiosErr.message
      }`
    );
  }
  throw err;
}

// GET /api/v1/alarms/me - 내 알람 조회  
export async function getMyAlarms() {
  try {
    const res = await api.get<ApiResponse<AlarmListResponse>>('/v1/alarms/me');
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// PATCH /api/v1/alarms?messageId={messageId} - 알람 읽음 처리
export async function markAlarmAsRead(messageId: string) {
  if (!messageId) throw new Error('messageId (required)');
  try {
    const res = await api.patch<ApiResponse<string>>('/v1/alarms', null, {
      params: { messageId }
    });
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export default {
  getMyAlarms,
  markAlarmAsRead,
};