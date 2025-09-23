import * as Keychain from 'react-native-keychain';

// ✅ 토큰 저장
export async function saveToken(token: string) {
  await Keychain.setGenericPassword("auth", token); 
  // 첫 번째 인자: username (고정 문자열로 써도 됨)
  // 두 번째 인자: password (여기에 토큰을 저장)
}

// ✅ 토큰 불러오기
export async function loadToken(): Promise<string | null> {
  const credentials = await Keychain.getGenericPassword();
  if (credentials) {
    return credentials.password; // 여기서 password가 곧 token
  }
  return null;
}

// ✅ 토큰 삭제
export async function deleteToken() {
  await Keychain.resetGenericPassword();
}
