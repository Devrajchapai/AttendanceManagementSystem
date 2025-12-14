import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { LoadingScreen } from '../../tools/loadingScreen';
import { LoginSchema } from '../../tools/validationSchema';


const { width } = Dimensions.get("screen");

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const submit =async ()=> {
    try{

        await LoginSchema.validate(
          {email,password},
          {abortEarly: false}
        );  
        setLoading(true)
      setErrors({});
      
      
      const res = await fetch('http://192.168.1.5:4000/authRouter/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password, 
          role
        })
      });

      const data = await res.json();

      if(!res.ok){
        throw new Error(data.message || 'Login Failed');
      }

      await AsyncStorage.setItem('token', data.token)
      await AsyncStorage.setItem('role', role)

    }catch(err){
      if (err.name === 'ValidationError') {
        const newErrors = {};
        err.inner.forEach(e => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
      } else {
        console.log('Error', err.message);
      }
    } finally {
      setLoading(false);
    }
    }
  

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

       <LoadingScreen loadingVisibility={loading}/>
      
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.collegeTitle}>Nagarjuna College of IT</Text>
          </View>

    
          <TextInput
            mode='flat'
            label='email'
            value={email}
            onChangeText={text => setEmail(text)}
            placeholder='example@gmail.com'
            left={<TextInput.Icon icon='account' />}
            style={styles.input}
          />
           {errors.email && (
        <Text style={{ color: 'red' }}>{errors.email}</Text>
      )}
          {/* Password */}
          <TextInput
            mode='flat'
            label='Password'
            value={password}
            secureTextEntry={!passwordVisibility}
            onChangeText={text => setPassword(text)}
            placeholder='********'
            left={<TextInput.Icon icon='key' />}
            right={
              <TextInput.Icon
                icon={passwordVisibility ? 'eye' : 'eye-closed'}
                onPress={() => setPasswordVisibility(!passwordVisibility)}
              />
            }
            style={styles.input}
          />
          {errors.password && (
        <Text style={{ color: 'red' }}>{errors.password}</Text>
      )}
          
          <View style={styles.roleContainer}>
            <Button
              mode={role == 'student' ? 'contained-tonal' : 'contained'}
              icon='book-open-page-variant-outline'
              onPress={() => { role == 'student' ? setRole('admin') : setRole('student') }}
              style={styles.roleBtn}
              labelStyle={styles.roleLabel}
            >
              Student
            </Button>

            <Button
              mode={role == 'teacher' ? 'contained-tonal' : 'contained'}
              icon='account-school'
              onPress={() => { role == 'teacher' ? setRole('admin') : setRole('teacher') }}
              style={styles.roleBtn}
              labelStyle={styles.roleLabel}
            >
              Teacher
            </Button>
          </View>

          <Button
            icon='bus-school'
            mode='elevated'
            onPress={submit}
            style={styles.loginBtn}
          >
            LOGIN
          </Button>
          
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 12,
  },


  titleContainer: {
    marginBottom: 25,
    alignItems: "center",
  },

  title: {
    fontSize: 40,
    fontWeight: "900",
    color: "#1e293b",
    letterSpacing: 1,
  },

  collegeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#2563eb",
    letterSpacing: 0.5,
    textAlign: "center",
    paddingHorizontal: 10,
  },


  input: {
    width: "100%",
    backgroundColor: "white",
  },


  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },

  roleBtn: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    paddingVertical: 3,
  },

  roleLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  loginBtn: {
    marginTop: 15,
    borderRadius: 10,
    paddingVertical: 6,
  },
});

export default LoginPage;
