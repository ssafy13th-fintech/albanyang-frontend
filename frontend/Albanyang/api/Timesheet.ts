// api/TimeSheet.ts - 스웨거 문서 기준으로 수정

import { AxiosError } from 'axios';
import { api } from './authorization/AuthHeader';

// 공통 응답 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

/**
 * 스웨거 기준 Timesheet 타입
 * - id : Timesheet pk
 * - staffId : 스태프 아이디
 * - nickname : 근무자 닉네임
 * - status : 근무 상태
 * - commuteDate : 일하는 날 (YYYY-MM-DD)
 * - arrivedAt : 출근 시간 (HH:mm:ss)
 * - leftAt : 퇴근 시간 (HH:mm:ss)
 */
export interface TimesheetItem {
  id: number;
  staffId: number;
  nickname: string;
  status: string;
  commuteDate: string; // YYYY-MM-DD
  arrivedAt: string | null;
  leftAt: string | null;
}

export interface TimesheetListResponse {
  timesheets: TimesheetItem[];
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

// GET /api/v1/stores/{store-id}/timesheets/me - 당일/월별 근태 조회
export async function getMyTimesheets(storeId: number, params?: { date?: string; month?: string; }) {
  if (!storeId && storeId !== 0) throw new Error('storeId (required)');
  console.log(params?.date);
  try {
    console.log("store id ", storeId, "param : ", params?.date, params?.month);
    const res = await api.get<ApiResponse<TimesheetListResponse>>(
      `/v1/stores/${storeId}/timesheets/me`,
      { params }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// PATCH /api/v1/stores/{store-id}/timesheets/{timesheet-id}/arrive - 출근 체크 (스웨거 기준)
export async function checkInTimesheet(storeId: number, timesheetId: number) {
  if ((!storeId && storeId !== 0) || (!timesheetId && timesheetId !== 0)) {
    throw new Error('storeId and timesheetId are required');
  }
  try {
    const res = await api.patch<ApiResponse<string>>(
      `/v1/stores/${storeId}/timesheets/${timesheetId}/arrive`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// PATCH /api/v1/stores/{store-id}/timesheets/{timesheet-id}/leave - 퇴근 체크 (스웨거 기준)
export async function checkOutTimesheet(storeId: number, timesheetId: number) {
  if ((!storeId && storeId !== 0) || (!timesheetId && timesheetId !== 0)) {
    throw new Error('storeId and timesheetId are required');
  }
  try {
    const res = await api.patch<ApiResponse<string>>(
      `/v1/stores/${storeId}/timesheets/${timesheetId}/leave`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /api/v1/stores/{store-id}/timesheets?date=YYYY-MM-DD - 사업장 특정 일자 근태 조회
export async function getTimesheetsByDate(storeId: number, date: string) {
  if ((!storeId && storeId !== 0) || !date) throw new Error('storeId and date (required)');
  try {
    console.log("store Id :", storeId, "date :", date);
    const res = await api.get<ApiResponse<TimesheetListResponse>>(
      `/v1/stores/${storeId}/timesheets`,
      { params: { date } }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// 기존 함수들 (호환성을 위해 유지하되 새로운 API로 리다이렉션)
export async function createMyTimesheet(storeId: number) {
  console.warn('createMyTimesheet는 더 이상 사용되지 않습니다. checkInTimesheet를 사용하세요.');
  throw new Error('이 함수는 더 이상 지원되지 않습니다. 스케줄에서 timesheetId를 얻어 checkInTimesheet를 사용하세요.');
}

export async function patchMyTimesheetCheckout(storeId: number, timesheetId: number) {
  console.warn('patchMyTimesheetCheckout는 더 이상 사용되지 않습니다. checkOutTimesheet를 사용하세요.');
  return checkOutTimesheet(storeId, timesheetId);
}

export default {
  api,
  getMyTimesheets,
  checkInTimesheet,
  checkOutTimesheet,
  getTimesheetsByDate,
  // 기존 함수들 (호환성)
  createMyTimesheet,
  patchMyTimesheetCheckout,
};