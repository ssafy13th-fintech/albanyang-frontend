import axios, { AxiosError, AxiosInstance } from 'axios';

// Base URL for the FinOpen API
const api: AxiosInstance = axios.create({
  baseURL: 'https://finopenapi.ssafy.io',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 공통 응답 타입
export interface ApiResponse<T = any> {
  Header?: any;
  REC?: T;
  code?: string;
  message?: string;
  data?: T;
}


export interface CreateSsafyMemberRequest{
  apiKey :string,
  userId :string
}

export interface SelectSsafyMemberRequest extends CreateSsafyMemberRequest{
}

export interface CreateSsafyMemberResponse{
  userId : string,
  userName :string,
  institutionCode : string,
  userKey :string,
  created : string,
  modified :string
}

export interface SelectSsafyMemberResponse extends CreateSsafyMemberResponse{

}


// Utility: format date/time
function pad(n: number, width = 2) {
  return String(n).padStart(width, '0');
}

function getYMD(date = new Date()) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function getHMS(date = new Date()) {
  return `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

// 기관거래고유번호 생성기
// 기본: yyyymmdd + hhmmss + 6-digit sequence
export function generateInstitutionTransactionUniqueNo(date = new Date()): string {
  const ymd = getYMD(date);
  const hms = getHMS(date);
  const seq = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0');
  return `${ymd}${hms}${seq}`; // length = 8+6+6 = 20
}

// Header 빌더
export interface HeaderOptions {
  apiName: string;
  apiServiceCode?: string;
  userKey?: string;
  apiKey: string; // 필수
  institutionCode?: string; // default '00100'
  fintechAppNo?: string; // default '001'
  institutionTransactionUniqueNo?: string; // optional, will be generated if not provided
  transmissionDate?: string; // optional, will be auto
  transmissionTime?: string; // optional, will be auto
}

export function buildHeader(opts: HeaderOptions) {
  const now = new Date();
  const transmissionDate = opts.transmissionDate ?? getYMD(now);
  const transmissionTime = opts.transmissionTime ?? getHMS(now);
  const institutionTransactionUniqueNo =
    opts.institutionTransactionUniqueNo ?? generateInstitutionTransactionUniqueNo(now);

  return {
    apiName: opts.apiName,
    transmissionDate,
    transmissionTime,
    institutionCode: opts.institutionCode ?? '00100',
    fintechAppNo: opts.fintechAppNo ?? '001',
    apiServiceCode: opts.apiServiceCode ?? opts.apiName,
    institutionTransactionUniqueNo,
    apiKey: opts.apiKey,
    userKey: opts.userKey,
  } as const;
}

// 에러 핸들러
function handleAxiosError(err: unknown): never {
  if ((err as AxiosError).isAxiosError) {
    const axiosErr = err as AxiosError;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;
    throw new Error(`Request failed${status ? ` (status ${status})` : ''}: ${(data && (data as any).message) || axiosErr.message}`);
  }
  throw err;
}

// 1) 발급된 API Key 발급 요청
export async function issueApiKey(managerId: string) {
  if (!managerId) throw new Error('managerId (required)');
  try {
    const res = await api.post<ApiResponse<{ managerId: string; apiKey: string; creationDate: string; expirationDate: string }>>(
      '/ssafy/api/v1/edu/app/issuedApiKey',
      { managerId }
    );
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// 2) 예금(수시입출금) 상품 목록 조회
export async function inquireDemandDepositList(opts: { apiKey: string; userKey?: string; institutionCode?: string; fintechAppNo?: string; }) {
  const header = buildHeader({ apiName: 'inquireDemandDepositList', apiKey: opts.apiKey, userKey: opts.userKey, institutionCode: opts.institutionCode, fintechAppNo: opts.fintechAppNo });
  try {
    const body = { Header: header };
    const res = await api.post<ApiResponse<any>>('/ssafy/api/v1/edu/demandDeposit/inquireDemandDepositList', body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

// 3) 계좌 생성 (상품 고유번호로 생성)
export async function createDemandDepositAccount(params: { apiKey: string; userKey: string; accountTypeUniqueNo: string; institutionCode?: string; fintechAppNo?: string; }) {
  if (!params.accountTypeUniqueNo) throw new Error('accountTypeUniqueNo (required)');
  const header = buildHeader({ apiName: 'createDemandDepositAccount', apiKey: params.apiKey, userKey: params.userKey, institutionCode: params.institutionCode, fintechAppNo: params.fintechAppNo });
  try {
    const body = { Header: header, accountTypeUniqueNo: params.accountTypeUniqueNo };
    const res = await api.post<ApiResponse<any>>('/ssafy/api/v1/edu/demandDeposit/createDemandDepositAccount', body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

/** 
 * 
 * 1원 송금 (계좌 인증 시작)
 *  
 * 
 **/
export async function openAccountAuth(params: { apiKey: string; userKey: string; accountNo: string; authText: string; institutionCode?: string; fintechAppNo?: string; }) {
  if (!params.accountNo) throw new Error('accountNo (required)');
  if (!params.authText) throw new Error('authText (required)');
  const header = buildHeader({ apiName: 'openAccountAuth', apiKey: params.apiKey, userKey: params.userKey, institutionCode: params.institutionCode, fintechAppNo: params.fintechAppNo });
  try {
    const body = { Header: header, accountNo: params.accountNo, authText: params.authText };
    const res = await api.post<ApiResponse<any>>('/ssafy/api/v1/edu/accountAuth/openAccountAuth', body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

/** 
 * 
 * 1원 송금 인증 
 *  
 * 
 **/
export async function checkAuthCode(params: { apiKey: string; userKey: string; accountNo: string; authText: string; authCode: string; institutionCode?: string; fintechAppNo?: string; }) {
  if (!params.accountNo) throw new Error('accountNo (required)');
  if (!params.authText) throw new Error('authText (required)');
  if (!params.authCode) throw new Error('authCode (required)');
  const header = buildHeader({ apiName: 'checkAuthCode', apiKey: params.apiKey, userKey: params.userKey, institutionCode: params.institutionCode, fintechAppNo: params.fintechAppNo });
  try {
    console.log("header :",header)
    const body = { Header: header, accountNo: params.accountNo, authText: params.authText, authCode: params.authCode };
    console.log("body :", body)
    const res = await api.post<ApiResponse<any>>('/ssafy/api/v1/edu/accountAuth/checkAuthCode', body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}

export async function inquireTransactionHistoryList(params: { apiKey: string; userKey: string; accountNo: string; startDate: string; endDate: string; transactionType?: string; orderByType?: string; institutionCode?: string; fintechAppNo?: string; }) {
  const { apiKey, userKey, accountNo, startDate, endDate, transactionType, orderByType, institutionCode, fintechAppNo } = params;
  if (!apiKey) throw new Error('apiKey (required)');
  if (!accountNo) throw new Error('accountNo (required)');
  if (!startDate) throw new Error('startDate (required)');
  if (!endDate) throw new Error('endDate (required)');

  const header = buildHeader({ apiName: 'inquireTransactionHistoryList', apiKey, userKey, institutionCode, fintechAppNo });
  try {
    const body = { Header: header, accountNo, startDate, endDate, transactionType: transactionType ?? 'A', orderByType: orderByType ?? 'ASC' };
    const res = await api.post<ApiResponse<any>>('/ssafy/api/v1/edu/demandDeposit/inquireTransactionHistoryList', body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}



export async function inquireTransactionHistoryByUniqueNo(params: { apiKey: string; userKey: string; accountNo: string; transactionUniqueNo : string; transactionType?: string; institutionCode?: string; fintechAppNo?: string; }) {
  const { apiKey, userKey, accountNo, transactionUniqueNo, transactionType, institutionCode, fintechAppNo } = params;
  if (!apiKey) throw new Error('apiKey (required)');
  if (!accountNo) throw new Error('accountNo (required)');
  if (!transactionUniqueNo) throw new Error('transactionUniqueNo (required)');

  const header = buildHeader({ apiName: 'inquireTransactionHistory', apiKey, userKey, institutionCode, fintechAppNo });
  try {
    const body = { Header: header, accountNo, transactionUniqueNo, transactionType: transactionType ?? 'A' };
    console.log("body : ",body)
    const res = await api.post<ApiResponse<any>>('/ssafy/api/v1/edu/demandDeposit/inquireTransactionHistory', body);
    return res.data;
  } catch (err) {
    handleAxiosError(err);
  }
}





export async function createSsafyMember(body : CreateSsafyMemberRequest){
  console.log("create member : ",body)
    try{
      const res = await api.post<ApiResponse<CreateSsafyMemberResponse>>("/ssafy/api/v1/member",
        body
      )
      return  res.data;
    
    }catch(e:any){
      console.log(" create erro " , e?.response?.data)
      throw e;
    }
}


export async function searchSsafyMember(body : SelectSsafyMemberRequest){
    console.log("search member : ",body)
     try{
      const res = await api.post<ApiResponse<SelectSsafyMemberResponse>>("/ssafy/api/v1/member/search",
        body
      )
      return res.data;
    
    }catch(e : any){
      console.log(e.response.data.responseCode)
        switch(e?.response?.data.responseCode){
          case "E4001":
            throw ["E4001","올바르지 않은 이메일 형식"]
          case "E4002":
            throw  ["E4002","이미 존재하는 ID입니다."]
          case "E4003":
            throw  ["E4003","확인됨."]
        }
        throw e;
    } 
}



export default {
  api,
  generateInstitutionTransactionUniqueNo,
  buildHeader,
  issueApiKey,
  inquireDemandDepositList,
  createDemandDepositAccount,
  openAccountAuth,
  checkAuthCode,
  inquireTransactionHistoryList,
};
