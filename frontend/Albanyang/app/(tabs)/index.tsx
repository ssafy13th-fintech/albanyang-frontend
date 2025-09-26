import { loadToken, TokenDecodeObject } from '@/api/authorization/AuthTokenStorage';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import DevMenu from '../(develop)/DevMenu';
import EmployeeMainPage from '../(mainPage)/EmployeeMainPage';
import EmployerMainPage from '../(mainPage)/EmployerMainPage';

export default function HomeScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const getToken = async () => {
      try {
        const t = await loadToken(); // string | null 예상
        if (!mounted) return;
        setToken(t);
      } catch (err) {
        console.error('토큰 로드 실패:', err);
        if (mounted) setToken(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    getToken();
    return () => { mounted = false; };
  }, []);

  if (isLoading) {
    // 로딩 스피너나 빈 화면을 반환해도 좋습니다.
    return <DevMenu />; // 로딩 UI로 DevMenu를 쓰고 싶다면 그대로, 아니면 별도 로딩 컴포넌트 권장
  }

  if (!token) {
    // 토큰 없음
    return <DevMenu />;
  }

  try {
    const decoding = jwtDecode<TokenDecodeObject>(token);
    const role = decoding?.role;

    if (role === 'EMPLOYEE') return <EmployeeMainPage />;
    if (role === 'EMPLOYER') return <EmployerMainPage />;

    // role이 예기치 않은 값이면 안전하게 DevMenu로 폴백
    console.warn('알려지지 않은 role:', role);
    return <DevMenu />;
  } catch (err) {
    console.error('JWT 디코딩 실패:', err);
    // 디코딩 실패하면 토큰이 손상되었거나 만료됐을 수 있으므로 DevMenu로
    return <DevMenu />;
  }
}
