import { AxiosError } from 'axios';
import { api, api_noheader } from './authorization/AuthHeader';

// 토큰 등록/해제 유틸 (react-native에서 로그인 토큰을 여기에 설정해서 사용)
// export function setAuthToken(token: string | null) {
//   if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   else delete api.defaults.headers.common['Authorization'];
// }

// 공통 타입
export interface ApiResponse<T = any> {
  code: string;
  message: string;
  data: T;
}

export interface MemberData {
  name: string;
  phone: string;
  email?: string;
  gender?: string | number;
  age?: string;
  account: string |null;
}

// 요청 바디 타입들
export interface UpdateMemberRequest {
  name?: string;
  phone?: string;
  gender?: number;
  age?: number;
}

export interface RegisterRequest {
  email: string; // *r
  password: string; // *r
  name: string; // *r
  phone: string; // *r
  gender?: number;
  age?: number | null;
  role?: number;
  account?: string | null;
  accountPassword? :string | null;
  token?: string;
}

export interface AccountPatchRequest {
  account: string; // *r
}

// 에러 헬퍼
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

// 1) GET /api/v1/members?phone=01012345678
// 전화번호로 회원 정보를 검색합니다. (phone *r)
export async function getMemberByPhone(phone: string) {
  if (!phone) throw new Error('phone (required)');
  try {
    const res = await api.get<ApiResponse<MemberData>>('/api/v1/members', {
      params: { phone },
    });
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// 2) PUT /api/v1/members
// 회원정보를 수정합니다. (Request body 필수 항목은 호출하는 쪽에서 보장하세요)
export async function updateMember(body: UpdateMemberRequest) {
  try {
    console.log("body ",body);
    const res = await api.put<ApiResponse<string>>('/v1/members', body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// 3) POST /api/v1/members
// 회원가입
export async function registerMember(body: RegisterRequest) {
  // 간단한 클라이언트 사이드 검증
  if (!body.email || !body.password || !body.name || !body.phone) {
    throw new Error('email, password, name, phone are required');
  }
  try {
    console.log("body ",body);
        
    const res = await api_noheader.post<ApiResponse<string>>('/v1/members', body);
    return res.data;
  } catch (err) {
    console.error("회원가입 에러! :",err);
    handleAxiosError( err);
  }
}

// 4) DELETE /api/v1/members
// 회원 탈퇴
export async function deleteMember() {
  try {
    const res = await api.delete<ApiResponse<string>>('/api/v1/members');
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// 5) PATCH /api/v1/members/account
// 계좌 번호 수정 (계좌 번호가 없음 저장합니다.)
export async function patchAccount(body: AccountPatchRequest) {
  if (!body.account) throw new Error('account (required)');
  try {
    const res = await api.patch<ApiResponse<string>>(
      '/api/v1/members/account',
      body
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// 6) GET /api/1/members/me
// 내 정보 조회
export async function getMe() {
  try {
    const res = await api.get<ApiResponse<MemberData>>('/v1/members/me');
    return res.data;
  } catch (err) {
    handleAxiosError(err);
    
  }
}

// 편의용 default export
export default {
  api,
  // setAuthToken,
  getMemberByPhone,
  updateMember,
  registerMember,
  deleteMember,
  patchAccount,
  getMe,
};

