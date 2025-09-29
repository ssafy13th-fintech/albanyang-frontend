import { jwtDecode } from 'jwt-decode';
import * as Keychain from 'react-native-keychain';

export interface TokenDecodeObject{
  id : number,
  role : string,
  email :string,
  iat : string,
  exp  : string
}

interface JwtPayload {
  role?: string;
}


/**
 * 토큰을 저장합니다. 
 *
 * @param token accessToken
 */
export async function saveToken(token: string) {

  console.log("keychain")
  console.log("Keychain",Keychain)
  await Keychain.setGenericPassword("auth", token); 
  // 첫 번째 인자: username (고정 문자열로 써도 됨)
  // 두 번째 인자: password (여기에 토큰을 저장)
}

/**
 * 토큰을 가져옵니다.
 * 
 * @returns 저장된 access 토큰
 */
export async function loadToken(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    return credentials.password; // 여기서 password가 곧 token
  }
  return null;
}

/**
 *  토큰을 삭제합니다.
 */
export async function deleteToken() {
  await Keychain.resetGenericPassword();
}

/**
 * 저장된 베어러 토큰을 디코딩합니다.
 * 
 * @returns  디코드된 토큰
 */
export async function decodeToken() : Promise<TokenDecodeObject>{
  const token = await loadToken();
  if(token) return jwtDecode(token) as Promise<TokenDecodeObject>
  else return {} as Promise<TokenDecodeObject>
}


/**
 * 토큰에서 회원의 역할을 가져옵니다.
 * @returns 토큰에 있는 role (EMPLOYER, EMPLOYEE)
 */
export async function getRoleFromToken(): Promise<string | null> {
  try {
    const token = await loadToken();
    if (!token) return null;

    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role || null;
  } catch (e) {
    
    return null;
  }
}