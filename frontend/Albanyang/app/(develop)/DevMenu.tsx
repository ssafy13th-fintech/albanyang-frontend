import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';


const routes = [
  { name: '로그인', path: '/login/Login' },
  { name: '로그인', path: '/login/Login' },
  { name :'회원가입1', path :'/login/SignUpFirst'},
  { name: '회원가입2', path : '/login/SignUpSecond'},
  { name: '회원가입3', path : '/login/SignUpThird'},
  {name : '회원가입 완료', path : '/login/SignUpComplete'},
  { name: '프로필', path: '/profile' },
  { name: '사장 메인페이지', path : '/EmployerMainPage'},
  { name: '알바 메인페이지', path : '/EployeeMainPage'},
  { name: '급여명세서(사장)', path: '/payslip/PayslipListOwner'},
  { name: '급여명세서(직원)', path: '/payslip/PayslipListEmployee'},
  { name: '사업자등록', path: '/store/StoreRegistration'},
  { name: '메인페이지', path : '/albaMainPage/AlbaMainPage'},
  { name: '급여명세서(사장)', path: '/payslip/PayslipListOwner'},
  { name: '급여명세서(직원)', path: '/payslip/PayslipListEmployee'},
];

export default function DevMenu() {
  const router = useRouter();

  return (
    <View style={{ padding: 20 }}>
      <Text>🛠 Dev Menu</Text>
      {routes.map(r => (
        <Button
          key={r.path}
          title={r.name}
          onPress={() => router.push(r.path as any)} // navigation 활용
        />
      ))}
    </View>
  );
}
