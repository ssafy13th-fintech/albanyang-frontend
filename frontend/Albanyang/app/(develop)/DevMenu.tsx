import { useRouter } from 'expo-router';
import { Button, View, Text } from 'react-native';

const routes = [
  { name: '로그인', path: '/login/Login' },
  { name: '프로필', path: '/profile' },
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
          onPress={() => router.push('/login/Login')} // navigation 활용
        />
      ))}
    </View>
  );
}
