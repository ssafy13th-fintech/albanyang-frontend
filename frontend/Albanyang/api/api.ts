// ../Albanyang/api/Chatbot.ts

import { AxiosError } from 'axios';
import { api } from './authorization/AuthHeader';

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
    
    console.error('Axios Error Details:', {
      status,
      data,
      message: axiosErr.message,
      config: {
        url: axiosErr.config?.url,
        method: axiosErr.config?.method,
        headers: axiosErr.config?.headers
      }
    });
    
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
  
  console.log('Sending chatbot query:', userMessage);
  
  try {
    const res = await api.post<ApiResponse<ChatbotQueryResponse>>(
      '/v1/chatbot/queries',  // /api 제거 (AuthHeader에서 baseURL이 이미 처리)
      { userMessage }
    );
    
    console.log('Chatbot query response:', res.data);
    return res.data;
  } catch (err) {
    console.error('Chatbot query error:', err);
    handleAxiosError(err);
  }
}

// GET /api/v1/chatbot/histories - 챗봇 내역 조회
export async function getChatbotHistories(cursorId?: number, size: number = 10) {
  console.log('Getting chatbot histories:', { cursorId, size });
  
  try {
    const params: any = { size };
    if (cursorId !== undefined) params.cursorId = cursorId;
    
    const res = await api.get<ApiResponse<ChatbotHistoriesResponse>>(
      '/v1/chatbot/histories',  // /api 제거
      { params }
    );
    
    console.log('Chatbot histories response:', res.data);
    return res.data;
  } catch (err) {
    console.error('Chatbot histories error:', err);
    handleAxiosError(err);
  }
}

export default {
  sendChatbotQuery,
  getChatbotHistories,
};