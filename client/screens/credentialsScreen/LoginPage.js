import { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [passwordVisibility, setPasswordVisibility] = useState(true);

  function submit() {
    console.log(role);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>

          
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.collegeTitle}>Nagarjuna College of IT</Text>
          </View>

    
          <TextInput
            mode='flat'
            label='Username'
            value={username}
            onChangeText={text => setUsername(text)}
            placeholder='example@gmail.com'
            left={<TextInput.Icon icon='account' />}
            style={styles.input}
          />

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

          
          <View style={styles.roleContainer}>
            <Button
              mode={role == 'student' ? 'contained-tonal' : 'contained'}
              icon='account-school'
              onPress={() => { role == 'student' ? setRole('admin') : setRole('student') }}
              style={styles.roleBtn}
              labelStyle={styles.roleLabel}
            >
              Student
            </Button>

            <Button
              mode={role == 'teacher' ? 'contained-tonal' : 'contained'}
              icon='cast-education'
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

  /* TITLE STYLES */
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

  /* INPUT STYLES */
  input: {
    width: "100%",
    backgroundColor: "white",
  },

  /* ROLE BUTTONS SIDE BY SIDE */
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

  /* LOGIN BUTTON */
  loginBtn: {
    marginTop: 15,
    borderRadius: 10,
    paddingVertical: 6,
  },
});

export default LoginPage;
