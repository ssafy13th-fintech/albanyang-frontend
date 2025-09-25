import { loadToken } from '@/api/authorization/AuthTokenStorage';
import DevMenu from '../(develop)/DevMenu';


  async function GetToken(){
      const gettoken = async() => {
      const token  = await loadToken();
      return token;
      }  
      const token = await gettoken();
      return token;
  }

export default function HomeScreen() {
  const token = GetToken();
  if(token != null){
    console.log(token);
  }
  else{
    console.log("토큰 업슴 ㅋ")
  }
  
  return <DevMenu/>
}


