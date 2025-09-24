import { useRouter } from 'expo-router';
import { Button, ScrollView, Text, View } from 'react-native';


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
  { name: '급여명세서(사장)', path: '/payslip/employer/PayslipListOwner'},
  { name: '급여명세서(직원)', path: '/payslip/employee/PayslipListEmployee'},
  { name: '사업자등록', path: '/store/StoreRegistration'},
  { name: '알바 초대', path: '/FindAlba'},
  { name: '송금', path: '/CheckMemberListPage'},
  { name: '공지 쓰기', path: '/WriteNotification'},
  { name: '공지 조회', path: '/ViewNotification'},
  { name: '공지 조회 디테일', path: '/ViewNotificationDetail'},
  { name: '직원 근태 관리', path: '/attendance/EmployeeAttendancePage'},
  { name: '내 근태 관리', path: '/attendance/MyAttendancePage'},
  { name :'직원 근태 수정', path :'/attendance/EmployeeAttendanceInsertPage'},
  { name :'챗봇', path :'/ChatBot'},
  { name :'스캐줄 등록', path :'/Schedule'},
];

export default function DevMenu() {
  const router = useRouter();

  return (
    <ScrollView>
      <Text>🛠 Dev Menu</Text>
      {routes.map(r => (
        <View key={r.path} style={{ marginVertical: 5 }}>
          <Button
            title={r.name}
            onPress={() => router.push(r.path as any)}
          />
        </View>
      ))}
    </ScrollView>
  );
}