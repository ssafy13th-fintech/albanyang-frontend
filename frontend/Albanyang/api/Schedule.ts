// ../Albanyang/api/Schedule.ts

import { AxiosError } from 'axios';
import { api } from './authorization/AuthHeader';

// 공통 응답 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

// ========== 스키마에 맞춘 타입들 ==========
export type ScheduleType = "NORMAL" | "SUBSTITUTE";

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
  commuteDates: string[];       // ["2025-09-28", ...]
  workStartTime: string;
  workEndTime: string;
  breakTime: number;
  scheduleType: ScheduleType;   // NORMAL | SUBSTITUTE
  // 스웨거에 없는 필드는 보내지 않음
}

export interface UpdateScheduleRequest {
  commuteDate: string;          // YYYY-MM-DD
  workStartTime: string;
  workEndTime: string;
  breakTime: number;
  overtimeHours: number;
  scheduleType: ScheduleType;
  // 스웨거에 없는 필드는 보내지 않음
}

export interface ScheduleListResponse {
  schedules: Schedule[];
}

// 에러 처리 유틸
function handleAxiosError(err: unknown): never {
  if ((err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data as any;
    throw new Error(
      `Request failed${status ? ` (status ${status})` : ""}: ${
        (data && data.message) || axiosErr.message
      }`
    );
  }
  throw err;
}

/**
 * GET /api/v1/stores/{store-id}/staffs/{staff-id}/schedules/{schedule-id}
 * 스케줄 단일 조회
 */
export async function getScheduleById(
  storeId: number,
  staffId: number,
  scheduleId: number
) {
  if (storeId == null) throw new Error("storeId (required)");
  if (staffId == null) throw new Error("staffId (required)");
  if (scheduleId == null) throw new Error("scheduleId (required)");
  try {
    const res = await api.get<ApiResponse<Schedule>>(
      `/v1/stores/${storeId}/staffs/${staffId}/schedules/${scheduleId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

/**
 * PUT /api/v1/stores/{store-id}/staffs/{staff-id}/schedules/{schedule-id}
 * 스케줄 수정
 */
export async function updateSchedule(
  storeId: number,
  staffId: number,
  scheduleId: number,
  scheduleData: UpdateScheduleRequest
) {
  if (storeId == null) throw new Error("storeId (required)");
  if (staffId == null) throw new Error("staffId (required)");
  if (scheduleId == null) throw new Error("scheduleId (required)");
  try {
    const res = await api.put<ApiResponse<Schedule>>(
      `/v1/stores/${storeId}/staffs/${staffId}/schedules/${scheduleId}`,
      scheduleData
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

/**
 * DELETE /api/v1/stores/{store-id}/staffs/{staff-id}/schedules/{schedule-id}
 * 스케줄 삭제
 */
export async function deleteSchedule(
  storeId: number,
  staffId: number,
  scheduleId: number
) {
  if (storeId == null) throw new Error("storeId (required)");
  if (staffId == null) throw new Error("staffId (required)");
  if (scheduleId == null) throw new Error("scheduleId (required)");
  try {
    const res = await api.delete<ApiResponse<string>>(
      `/v1/stores/${storeId}/staffs/${staffId}/schedules/${scheduleId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

/**
 * POST /api/v1/stores/{store-id}/staffs/{staff-id}/schedules
 * 스케줄 생성 (다중 날짜)
 */
export async function createSchedule(
  storeId: number,
  staffId: number,
  scheduleData: CreateScheduleRequest
) {
  if (storeId == null) throw new Error("storeId (required)");
  if (staffId == null) throw new Error("staffId (required)");
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

/**
 * GET /api/v1/stores/{store-id}/schedules
 * 월별/일별 스케줄 전체 조회 (사장용)
 */
export async function getStoreSchedules(
  storeId: number,
  month?: string,
  date?: string
) {
  if (storeId == null) throw new Error("storeId (required)");
  try {
    const params: Record<string, any> = {};
    if (month) params.month = month; // "YYYY-MM"
    if (date) params.date = date;   // "YYYY-MM-DD"

    const res = await api.get<ApiResponse<ScheduleListResponse>>(
      `/v1/stores/${storeId}/schedules`,
      { params }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

/**
 * GET /api/v1/stores/{store-id}/schedules/me
 * 내 스케줄 조회 (직원용)
 */
export async function getMySchedules(
  storeId: number,
  month?: string,
  date?: string
) {
  if (storeId == null) throw new Error("storeId (required)");
  try {
    const params: Record<string, any> = {};
    if (month) params.month = month;
    if (date) params.date = date;

    const res = await api.get<ApiResponse<ScheduleListResponse>>(
      `/v1/stores/${storeId}/schedules/me`,
      { params }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}



export default {
  getScheduleById,
  updateSchedule,
  deleteSchedule,
  createSchedule,
  getStoreSchedules,
  getMySchedules,
};