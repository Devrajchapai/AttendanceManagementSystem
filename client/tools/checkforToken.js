import AsyncStorage from "@react-native-async-storage/async-storage";

  const checkTokenAvalibility =async()=>{
    const token = await AsyncStorage.getItem('token');
    if(token){
        return 'true';
    }else{
        return 'false';
    }
}

export default checkTokenAvalibility;