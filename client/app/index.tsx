import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ActivityIndicator, Button, TextInput } from 'react-native-paper'
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import {LinearGradient} from 'expo-linear-gradient'


const index = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisibility, setPasswordVisibility] = useState(false)
  const [role, setRole] = useState('');

  const changePasswordVisibility = () =>{
    setPasswordVisibility(!passwordVisibility);
  }

  const login = () =>{
    //remain404
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      <View style={styles.background}>
        <StatusBar style='dark' translucent={true}/>

          <LinearGradient  colors={['rgba(0,0,0,0.8)', 'transparent']} style={styles.background}/>
          <TextInput 
            label="Username"
            mode='outlined'
            value={username}
            onChangeText={setUsername}
            style = {styles.userInput}
            left = {<TextInput.Icon icon="account"/>}
          />

          <TextInput 
            label="Password"
            mode='outlined'
            value={password}
            secureTextEntry = {passwordVisibility}
            onChangeText={setPassword}
            style = {styles.userInput}
            right = {passwordVisibility?(<TextInput.Icon icon="eye-off" onPress={changePasswordVisibility}/>):(<TextInput.Icon icon="eye" onPress={changePasswordVisibility}/>)}
          />

          <ActivityIndicator animating = {true} color='white' size="large" style ={styles.activityIndicator}/>
          
          <Text style={styles.roleText}>Role Selection </Text>
          <View style={styles.roleButtonLayout}>
            <Button icon="book-open-page-variant" mode='contained' onPress={login} style={styles.roleNormalButton}>STUDENT</Button>
            <Button icon="school" mode='contained' onPress={login} style={styles.roleChoosedButton}>PROFESSOR</Button>
          </View>


          <Button icon="account" mode='contained' onPress={login} >Login</Button>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5ad2d0ff', 
    marginTop: '7%'
  },

  background:{
 
  },


  userInput:{
  
  },

  activityIndicator:{

  },

  roleText:{
    textAlign: 'center',
    fontSize: 20,
    color: 'white',
    marginBottom: '5%'
  },

  roleButtonLayout:{
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: '10%',
    gap: '5%'
  },

  roleNormalButton:{
    backgroundColor: '#983bcaff'
  },

  roleChoosedButton:{
    backgroundColor: '#bb3636ff',
  },

  loginButton:{

  },

})
export default index