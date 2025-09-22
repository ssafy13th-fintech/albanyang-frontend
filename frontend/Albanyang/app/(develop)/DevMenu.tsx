import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';


const routes = [
  { name: '로그인', path: '/login/Login' },
  { name :'회원가입1', path :'/login/SignUpFirst'},
  { name: '회원가입2', path : '/login/SignUpSecond'},
  { name: '회원가입3', path : '/login/SignUpThird'},
  { name : '회원가입 완료', path : '/login/SignUpComplete'},
  { name : '마이페이지' , path : '/myPage/MyPage'},
  { name: '내 정보 수정', path: '/myPage/MyInfoInsertionPage' },
  { name :'계좌 추가 및 수정', path :'/myPage/MyAccountInsertionPage'},
  { name : '탈퇴 페이지', path : '/myPage/WithDrawPage'},
  { name : '탈퇴 완료 페이지', path : '/myPage/WithDrawComplete'},
  { name: '사장 메인페이지', path : '/EmployerMainPage'},
  { name: '알바 메인페이지', path : '/EmployeeMainPage'},
  { name: '급여명세서(사장)', path: '/payslip/PayslipListOwner'},
  { name: '급여명세서(직원)', path: '/payslip/PayslipListEmployee'},
  { name: '사업자등록', path: '/store/StoreRegistration'},
  { name: '알바 초대1', path: '/FindAlba'},
  { name: '직원 근태 관리', path: '/attendance/EmployeeAttendancePage'},
  { name: '내 근태 관리', path: '/attendance/MyAttendancePage'},
  { name :'직원 근태 수정', path :'/attendance/EmployeeAttendanceInsertPage'}
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
