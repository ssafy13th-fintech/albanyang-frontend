// src/services/memberService.ts
import { api, handleResponse } from "../api";

/**
 * role: EMPLOYEE(1), EMPLOYMER(2), ADMIN(100)
 * gender: FEMALE(1), MALE(2)  (optional)
 * age: 10,20,30,40,50,60  (optional)
 */
export type MemberCreateRequest = {
  email: string;      // up to 40 chars (validation on client)
  password: string;
  phone: string;      // e.g. "010-4601-2430"
  role: 1 | 2 | 100;
  gender?: 1 | 2;
  age?: 10 | 20 | 30 | 40 | 50 | 60;
};

export type MemberCreateResponse = {
  // 서버가 반환하는 데이터가 있다면 여기에 기입
  // 예) id: number; email: string; ...
  // 명세에 없어서 any로 둡니다.
  [key: string]: any;
};

export async function createMember(payload: MemberCreateRequest): Promise<MemberCreateResponse> {
  return handleResponse<MemberCreateResponse>(api.post("/api/v1/members", payload));
}
