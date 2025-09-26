// ../Albanyang/api/Staff.ts

import { AxiosError } from 'axios';
import { api } from './authorization/AuthHeader';

// 공통 응답 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

// 스태프 관련 타입 정의
export interface StaffInvitationRequest {
  storeId: number;
  wage: number;
  email: string;
}

export interface StaffInvitationResponseRequest {
  storeId: number;
  accept: boolean;
}

export interface StaffInfo {
  id: number;
  nickname: string;
  name: string;
  status: 'SCHEDULED' | 'ACTIVE' | string;
}

export interface StaffListResponse {
  staffInfoRes: StaffInfo[];
}

// 직원 상세 조회 응답 타입
export interface StaffDetailResponse {
  id: number;
  name: string;
  nickname: string;
  employmentStatus: 'SCHEDULED' | string;
  taxType: string;
  wage: number;
  weeklyWorkingDay: number;
  workingHours: number;
}

// 직원 수정 요청 타입
export interface StaffUpdateRequest {
  nickname: string;
  status: 'SCHEDULED' | 'ACTIVE' | string;
  taxType: 'FOUR_INSURANCE' | 'THREE_POINT_THREE' | string;
  wage: number;
  weeklyWorkingDay: number;
  workingHours: number;
}

// 직원이 일하는 사업장 조회 응답 타입
export interface StaffStoresResponse {
  stores: {
    id: number;
    name: string;
  }[];
}

// GET /v1/stores/me - 직원이 일하고 있는 모든 사업장 조회
export interface MyStoresResponse {
  stores: {
    id: number;
    name: string;
  }[];
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

// POST /v1/stores/{store-id}/invitation - 직원 초대
export async function sendStaffInvitation(storeId: number, wage: number, email: string) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (wage === undefined || wage === null) throw new Error('wage (required)');
  if (!email) throw new Error('email (required)');

  try {
    const res = await api.post<ApiResponse<string>>(
      `/v1/stores/${storeId}/invitation`,
      null,
      {
        params: {
          wage,
          email
        }
      }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// POST /v1/stores/{store-id}/invitation/response - 초대 응답
export async function respondToStaffInvitation(storeId: number, accept: boolean) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (accept === undefined || accept === null) throw new Error('accept (required)');

  try {
    const res = await api.post<ApiResponse<string>>(
      `/v1/stores/${storeId}/invitation/response`,
      null,
      {
        params: {
          accept
        }
      }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /v1/stores/{store-id}/staffs - 직원 전체 조회
export async function getStaffList(storeId: number) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');

  try {
    const res = await api.get<ApiResponse<StaffListResponse>>(
      `/v1/stores/${storeId}/staffs`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function getMyStores() {
  try {
    const res = await api.get<ApiResponse<MyStoresResponse>>(`/v1/stores/me`);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function updateStaff(
  storeId: number,
  staffId: number,
  body: StaffUpdateRequest
) {
  if (storeId == null) throw new Error('storeId (required)');
  if (staffId == null) throw new Error('staffId (required)');

  try {
    const res = await api.put<ApiResponse<string>>(
      `/v1/stores/${storeId}/staffs/${staffId}`,
      body
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// DELETE /v1/stores/{store-id}/staffs/{staff-id} - 직원 삭제
export async function deleteStaff(storeId: number, staffId: number) {
  if (storeId == null) throw new Error('storeId (required)');
  if (staffId == null) throw new Error('staffId (required)');

  try {
    const res = await api.delete<ApiResponse<string>>(
      `/v1/stores/${storeId}/staffs/${staffId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function getStaffDetail(storeId: number, staffId: number) {
  if (storeId == null) throw new Error('storeId (required)');
  if (staffId == null) throw new Error('staffId (required)');

  try {
    const res = await api.get<ApiResponse<StaffDetailResponse>>(
      `/v1/stores/${storeId}/staffs/${staffId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export default {
  api,
  sendStaffInvitation,
  respondToStaffInvitation,
  getStaffList,
  getStaffDetail,
  updateStaff,
  deleteStaff,
  getMyStores
};
