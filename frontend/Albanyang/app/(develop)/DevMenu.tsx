import { useRouter } from 'expo-router';
import { Button, Text, View } from 'react-native';

const routes = [
  { name: '로그인', path: '/login/Login' },
  { name: '프로필', path: '/profile' },
  { name: '메인페이지', path : '/albaMainPage/AlbaMainPage'},
  { name: '급여명세서', path: '/payslip/PayslipDetailOwner'}
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
