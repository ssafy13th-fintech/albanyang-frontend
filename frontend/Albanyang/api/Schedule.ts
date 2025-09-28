// ../Albanyang/api/Schedule.ts

import { AxiosError } from 'axios';
import { api } from './authorization/AuthHeader';

// 공통 응답 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

// 스케줄 관련 타입 정의
export interface Schedule {
  id: number;
  commuteDate: string;
  workStartTime: string;
  workEndTime: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightShiftHours: number;
  scheduleType: 'NORMAL' | 'SUBSTITUTE';
  editable: boolean;
  storeId: number;
  staffId: number;
  staffNickname: string;
}

export interface CreateScheduleRequest {
  commuteDates: string[];
  workStartTime: string;
  workEndTime: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightShiftHours: number;
  scheduleType: 'NORMAL' | 'SUBSTITUTE';
  editable: boolean;
}

export interface UpdateScheduleRequest {
  commuteDate: string;
  workStartTime: string;
  workEndTime: string;
  workHours: number;
  breakTime: number;
  overtimeHours: number;
  nightShiftHours: number;
  scheduleType: 'NORMAL' | 'SUBSTITUTE';
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

// GET /v1/stores/{store-id}/staffs/{staff-id}/schedules/{schedule-id}
export async function getScheduleById(scheduleId: number) {
  if (scheduleId === undefined || scheduleId === null) throw new Error('scheduleId (required)');
  try {
    const res = await api.get<ApiResponse<Schedule>>(
      `/v1/stores/{store-id}/staffs/{staff-id}/schedules/${scheduleId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// PUT /v1/stores/{store-id}/staffs/{staff-id}/schedules/{schedule-id}
export async function updateSchedule(
  scheduleId: number,
  scheduleData: UpdateScheduleRequest
) {
  if (scheduleId === undefined || scheduleId === null) throw new Error('scheduleId (required)');
  try {
    const res = await api.put<ApiResponse<Schedule>>(
      `/v1/stores/{store-id}/staffs/{staff-id}/schedules/${scheduleId}`,
      scheduleData
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// DELETE /v1/stores/{store-id}/staffs/{staff-id}/schedules/{schedule-id}
export async function deleteSchedule(scheduleId: number) {
  if (scheduleId === undefined || scheduleId === null) throw new Error('scheduleId (required)');
  try {
    const res = await api.delete<ApiResponse<string>>(
      `/v1/stores/{store-id}/staffs/{staff-id}/schedules/${scheduleId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// POST /v1/stores/{store-id}/staffs/{staff-id}/schedules
export async function createSchedule(
  storeId: number,
  staffId: number,
  scheduleData: CreateScheduleRequest
) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (staffId === undefined || staffId === null) throw new Error('staffId (required)');
  try {
    const res = await api.post<ApiResponse<ScheduleListResponse>>(
      `/v1/stores/${storeId}/staffs/${staffId}/schedules`,
      scheduleData
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /v1/stores/{store-id}/schedules
export async function getStoreSchedules(storeId: number, month?: string, date?: string) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  try {
    const params: any = {};
    if (month) params.month = month;
    if (date) params.date = date;

    const res = await api.get<ApiResponse<ScheduleListResponse>>(
      `/v1/stores/${storeId}/schedules`,
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