import axios, { AxiosError, AxiosInstance } from 'axios';

// Axios 인스턴스
const api: AxiosInstance = axios.create({
  baseURL: 'https://your-api-domain.com', // 실제 환경에 맞게 변경
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

// Notification 관련 타입
export interface NotificationSummary {
  id: number;
  title: string;
}

export interface NotificationDetail {
  id: number;
  title: string;
  content: string;
}

export interface NotificationListResponse {
  infos: NotificationSummary[];
}

export interface CreateNotificationRequest {
  title: string;
  content: string;
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

// GET /api/v1/stores/{store-id}/notifications
export async function getNotifications(storeId: number) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  try {
    const res = await api.get<ApiResponse<NotificationListResponse>>(
      `/api/v1/stores/${storeId}/notifications`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// POST /api/v1/stores/{store-id}/notifications
export async function createNotification(storeId: number, body: CreateNotificationRequest) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (!body?.title || !body?.content) throw new Error('title and content are required');
  try {
    const res = await api.post<ApiResponse<NotificationDetail>>(
      `/api/v1/stores/${storeId}/notifications`,
      body
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /api/v1/stores/{store-id}/notifications/{notification-id}
export async function getNotification(storeId: number, notificationId: number) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (notificationId === undefined || notificationId === null) throw new Error('notificationId (required)');
  try {
    const res = await api.get<ApiResponse<NotificationDetail>>(
      `/api/v1/stores/${storeId}/notifications/${notificationId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// DELETE /api/v1/stores/{store-id}/notifications/{notification-id}
export async function deleteNotification(storeId: number, notificationId: number) {
  if (storeId === undefined || storeId === null) throw new Error('storeId (required)');
  if (notificationId === undefined || notificationId === null) throw new Error('notificationId (required)');
  try {
    const res = await api.delete<ApiResponse<string>>(
      `/api/v1/stores/${storeId}/notifications/${notificationId}`
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export default {
  api,
  getNotifications,
  createNotification,
  getNotification,
  deleteNotification,
};
