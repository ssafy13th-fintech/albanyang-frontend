import {
  Image,
  Text,
  TextInput,
  View
} from "react-native";

import { SafeAreaView } from 'react-native-safe-area-context';

export default function Signup() {
    

    return (
        
        <SafeAreaView>
            <Image></Image>
            <Text>회원가입</Text>
            <View>
                <View>
                    <Text>아이디(이메일)</Text>
                    <TextInput placeholder="이메일 주소"></TextInput>
                </View>
                <View>
                    <Text>비밀번호</Text>
                    <TextInput placeholder="비밀번호"></TextInput>
                    <TextInput placeholder="비밀번호확인"></TextInput>
                </View>
            </View>


        </SafeAreaView>


    );
}