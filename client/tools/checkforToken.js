import AsyncStorage from "@react-native-async-storage/async-storage";


  const checkTokenAvalibility =async()=>{
    try{
        const token = await AsyncStorage.getItem('token');
       return token;
        
    }catch(err){
        console.log("error while checking for token")
        return null
    }
}

export default checkTokenAvalibility;