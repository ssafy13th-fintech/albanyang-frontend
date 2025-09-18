import { useRouter } from 'expo-router';
import { Button, View, Text } from 'react-native';

const routes = [
  { name: '로그인', path: '/Login' },
  { name: '프로필', path: '/profile' },
  { name: '알바 데모 메인페이지', path : '/AlbaMainPage'},
  { name: '사장 메인페이지', path : '/EmployerMainPage' },
  { name: '알바 메인페이지', path : '/EmployeeMainPage' }
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
