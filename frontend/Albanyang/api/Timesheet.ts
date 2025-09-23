import axios, { AxiosError, AxiosInstance } from 'axios';

// Axios 인스턴스 (다른 api 파일들과 동일하게 설정)
const api: AxiosInstance = axios.create({
  baseURL: 'https://your-api-domain.com', // 프로젝트 환경에 맞게 변경
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 공통 응답 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

// Timesheet 타입
export interface TimesheetItem {
  id: number;
  commuteDate: string; // YYYY-MM-DD
  arrivedAt: string | null;
  leftAt: string | null;
  commuteTime: number;
  breakTime: number;
  editable: boolean;
  staffId: number;
  nickname: string;
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

// GET /api/v1/stores/{store-id}/timesheets/me
// 특정 staff의 특정일자 또는 특정 월의 근무 기록 조회
export async function getMyTimesheets(storeId: number, params?: { date?: string; month?: string; }) {
  if (!storeId && storeId !== 0) throw new Error('storeId (required)');
  try {
    const res = await api.get<ApiResponse<TimesheetListResponse>>(
      `/api/v1/stores/${storeId}/timesheets/me`,
      { params }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// POST /api/v1/stores/{store-id}/timesheets/me
// 특정 staff의 근태 기록 생성 (출근 기록)
export async function createMyTimesheet(storeId: number) {
  if (!storeId && storeId !== 0) throw new Error('storeId (required)');
  try {
    const res = await api.post<ApiResponse<string>>(`/api/v1/stores/${storeId}/timesheets/me`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// POST /api/v1/stores/{store-id}/timesheets/me/{timesheet-id}
// 특정 timesheet에 대한 작업 (예: 퇴근 기록 등)
export async function postMyTimesheetAction(storeId: number, timesheetId: number) {
  if ((!storeId && storeId !== 0) || (!timesheetId && timesheetId !== 0)) {
    throw new Error('storeId and timesheetId are required');
  }
  try {
    const res = await api.post<ApiResponse<string>>(
      `/api/v1/stores/${storeId}/timesheets/me/${timesheetId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /api/v1/stores/{store-id}/timesheets?date=YYYY-MM-DD
// 특정 일자에 근무한 모든 staff의 근무 기록 조회
export async function getTimesheetsByDate(storeId: number, date: string) {
  if ((!storeId && storeId !== 0) || !date) throw new Error('storeId and date (required)');
  try {
    const res = await api.get<ApiResponse<TimesheetListResponse>>(
      `/api/v1/stores/${storeId}/timesheets`,
      { params: { date } }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export default {
  api,
  getMyTimesheets,
  createMyTimesheet,
  postMyTimesheetAction,
  getTimesheetsByDate,
};
