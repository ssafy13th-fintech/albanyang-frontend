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

// 챗봇 타입 정의
export interface ChatbotQueryRequest {
  userMessage: string;
}

export interface ChatbotQueryResponse {
  chatbotMessage: string;
}

export interface ChatbotHistory {
  chatbotId: number;
  userMessage: string;
  chatbotMessage: string;
}

export interface ChatbotHistoriesResponse {
  chatbotHistories: ChatbotHistory[];
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

// POST /api/v1/chatbot/queries - 챗봇 질의
export async function sendChatbotQuery(userMessage: string) {
  if (!userMessage) throw new Error('userMessage (required)');
  try {
    const res = await api.post<ApiResponse<ChatbotQueryResponse>>(
      '/v1/chatbot/queries',
      { userMessage }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// GET /api/v1/chatbot/histories - 챗봇 내역 조회
export async function getChatbotHistories(cursorId?: number, size: number = 10) {
  try {
    const params: any = { size };
    if (cursorId !== undefined) params.cursorId = cursorId;
    
    const res = await api.get<ApiResponse<ChatbotHistoriesResponse>>(
      '/v1/chatbot/histories',
      { params }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export default {
  api,
  sendChatbotQuery,
  getChatbotHistories,
};