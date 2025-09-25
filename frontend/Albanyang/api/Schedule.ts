// ../Albanyang/Schedule.ts

import axios, { AxiosError, AxiosInstance } from 'axios';

// Axios 인스턴스
const api: AxiosInstance = axios.create({
  baseURL: 'http://j13a605.p.ssafy.io:8080',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// 공통 응답 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

// 스케줄 관련 타입 정의
export interface Schedule {
  id: number;
  commuteDate: string; // "2025-09-23" 형식
  workStartTime: string;
  workEndTime: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightShiftHours: number;
  scheduleType: 'NORMAL' | string; // 다른 타입이 있을 수 있음
  editable: boolean;
  storeId: number;
  staffId: number;
  staffNickname: string;
}

export interface CreateScheduleRequest {
  commuteDates: string[]; // ["2025-09-23"] 형식
  workStartTime: string;
  workEndTime: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightShiftHours: number;
  scheduleType: 'NORMAL' | string;
  editable: boolean;
}

export interface UpdateScheduleRequest {
  commuteDate: string; // "2025-09-23" 형식
  workStartTime: string;
  workEndTime: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightShiftHours: number;
  scheduleType: 'NORMAL' | string;
  editable: boolean;
}

export interface ScheduleListResponse {
  schedules: Schedule[];
}

// 에러 처리 유틸
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

// GET /api/v1/stores/{store-id}/staffs/{staff-id}/schedule/{schedule-id} - 특정 스케줄 조회
export async function getScheduleById(storeId: number, staffId: number, scheduleId: number) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (staffId === undefined || staffId === null) throw new Error('staffId (required)');
  if (scheduleId === undefined || scheduleId === null) throw new Error('scheduleId (required)');

  try {
    const res = await api.get<ApiResponse<Schedule>>(
      `/api/v1/stores/${storeId}/staffs/${staffId}/schedule/${scheduleId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// PUT /api/v1/stores/{store-id}/staffs/{staff-id}/schedule/{schedule-id} - 스케줄 수정
export async function updateSchedule(
  storeId: number,
  staffId: number,
  scheduleId: number,
  scheduleData: UpdateScheduleRequest
) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (staffId === undefined || staffId === null) throw new Error('staffId (required)');
  if (scheduleId === undefined || scheduleId === null) throw new Error('scheduleId (required)');

  try {
    const res = await api.put<ApiResponse<Schedule>>(
      `/api/v1/stores/${storeId}/staffs/${staffId}/schedule/${scheduleId}`,
      scheduleData
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// DELETE /api/v1/stores/{store-id}/staffs/{staff-id}/schedule/{schedule-id} - 스케줄 삭제
export async function deleteSchedule(storeId: number, staffId: number, scheduleId: number) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (staffId === undefined || staffId === null) throw new Error('staffId (required)');
  if (scheduleId === undefined || scheduleId === null) throw new Error('scheduleId (required)');

  try {
    const res = await api.delete<ApiResponse<string>>(
      `/api/v1/stores/${storeId}/staffs/${staffId}/schedule/${scheduleId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// POST /api/v1/stores/{store-id}/staffs/{staff-id}/schedule - 스케줄 생성
export async function createSchedule(
  storeId: number,
  staffId: number,
  scheduleData: CreateScheduleRequest
) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (staffId === undefined || staffId === null) throw new Error('staffId (required)');

  try {
    const res = await api.post<ApiResponse<ScheduleListResponse>>(
      `/api/v1/stores/${storeId}/staffs/${staffId}/schedule`,
      scheduleData
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /api/v1/stores/{store-id}/schedule - 매장의 전체 스케줄 조회
export async function getStoreSchedules(storeId: number, month?: string, date?: string) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');

  try {
    const params: any = {};
    if (month) params.month = month;
    if (date) params.date = date;

    const res = await api.get<ApiResponse<ScheduleListResponse>>(
      `/api/v1/stores/${storeId}/schedule`,
      { params }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export default {
  api,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  createSchedule,
  getStoreSchedules,
};