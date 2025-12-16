import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import { useState } from "react";
// Import useWindowDimensions instead of Dimensions.get("screen")
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { Button, Snackbar, TextInput } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LoadingScreen } from "../../tools/loadingScreen";
import { LoginSchema } from "../../tools/validationSchema";

const LoginPage = () => {
  // Use useWindowDimensions for responsiveness
  const { width } = useWindowDimensions();
  const BASE_WIDTH = 375; // Standard design width (e.g., iPhone X/11/12/13)
  const scale = (size) => (width / BASE_WIDTH) * size;

  const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
  const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
  const AUTH_URL = `http://${LOCALHOST}:${SERVERPORT}/authRouter/login`;
  const navigation = useNavigation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [errors, setErrors] = useState({}); 
  const [loading, setLoading] = useState(false);

  // ----------------------- Snackbar State -----------------------
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success"); // 'success' or 'error'

  const onDismissSnackBar = () => setSnackbarVisible(false);

  const showSnackbar = (message, type) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setSnackbarVisible(true);
  };
  // --------------------------------------------------------------

  const submit = async () => {
    try {
      // 1. Client-side Validation
      await LoginSchema.validate({ email, password }, { abortEarly: false });
      
      setLoading(true);
      setErrors({}); // Clear validation errors before API call
      setSnackbarVisible(false); // Hide any previous snackbar

      // 2. API Call
      const res = await fetch(AUTH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // API failed (e.g., wrong password, user not found)
        throw new Error(data.message || "Login Failed");
      }

      // 3. Successful Login
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("role", role);
      
      // Success notification
      showSnackbar(`Login successful! Redirecting to ${role} home page...`, 'success');

      // Determine home screen dynamically based on role
      let homePageName;
      if (role === 'admin') {
        homePageName = 'AdminHomePage';
      } else if (role === 'teacher') {
        homePageName = 'TeacherHomePage';
      } else {
        homePageName = 'StudentHomePage';
      }

      // Use a small timeout to allow the success snackbar to be seen before navigating
      setTimeout(() => {
        navigation.replace(homePageName);
      }, 500); 

    } catch (err) {
      if (err.name === "ValidationError") {
        // 1. Handle Yup Validation Errors (show in Snackbar)
        const errorMessages = err.inner.map(e => e.message);
        // Join messages for a single, comprehensive toast
        const aggregatedMessage = "Validation Failed: " + errorMessages.join(" | ");
        
        // Show validation errors in Snackbar
        showSnackbar(aggregatedMessage, 'error'); 
        
        // Clear old inline errors
        setErrors({}); 
      } else {
        // 2. Handle API or Network Errors (show in Snackbar)
        console.log("Login Error:", err.message); 
        showSnackbar(err.message || "Network Error. Check your connection.", 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // Define styles inside the component to use the scaling function
  const styles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: "#f1f5f9",
    },
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: scale(20), // Scaled
      gap: scale(12), // Scaled
    },
    titleContainer: {
      marginBottom: scale(25), // Scaled
      alignItems: "center",
    },
    title: {
      fontSize: scale(40), // Scaled
      fontWeight: "900",
      color: "#1e293b",
      letterSpacing: 1,
    },
    collegeTitle: {
      fontSize: scale(28), // Scaled
      fontWeight: "800",
      color: "#2563eb",
      letterSpacing: 0.5,
      textAlign: "center",
      paddingHorizontal: scale(10), // Scaled
    },
    input: {
      width: "100%",
      backgroundColor: "white",
      fontSize: scale(16), // Added scaling for text input font size
    },
    roleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: "100%",
      marginTop: scale(10), // Scaled
    },
    roleBtn: {
      flex: 1,
      marginHorizontal: scale(5), // Scaled
      borderRadius: scale(10), // Scaled
      paddingVertical: scale(3), // Scaled
    },
    roleLabel: {
      fontSize: scale(10), // Scaled
      fontWeight: "600",
    },
    loginBtn: {
      marginTop: scale(15), // Scaled
      borderRadius: scale(10), // Scaled
      paddingVertical: scale(6), // Scaled
    },
  });


  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <LoadingScreen loadingVisibility={loading} />

          <View style={styles.titleContainer}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.collegeTitle}>Nagarjuna College of IT</Text>
          </View>

          <TextInput
            mode="flat"
            label="email"
            value={email}
            onChangeText={(text) => setEmail(text)}
            placeholder="example@gmail.com"
            left={<TextInput.Icon icon="account" />}
            style={styles.input}
          />
          
          <TextInput
            mode="flat"
            label="Password"
            value={password}
            secureTextEntry={!passwordVisibility}
            onChangeText={(text) => setPassword(text)}
            placeholder="********"
            left={<TextInput.Icon icon="key" />}
            right={
              <TextInput.Icon
                icon={passwordVisibility ? "eye" : "eye-closed"}
                onPress={() => setPasswordVisibility(!passwordVisibility)}
              />
            }
            style={styles.input}
          />
        

          <View style={styles.roleContainer}>
            {/* Button for Student/Admin toggle */}
            <Button
              mode={role === "student" ? "contained-tonal" : "contained"}
              icon="book-open-page-variant-outline"
              onPress={() => setRole(role === "student" ? "admin" : "student")} 
              style={styles.roleBtn}
              labelStyle={styles.roleLabel}
            >
              Student
            </Button>

            {/* Button for Teacher/Admin toggle */}
            <Button
              mode={role === "teacher" ? "contained-tonal" : "contained"}
              icon="account-school"
              onPress={() => setRole(role === "teacher" ? "admin" : "teacher")} 
              style={styles.roleBtn}
              labelStyle={styles.roleLabel}
            >
              Teacher
            </Button>
          </View>

          <Button
            icon="bus-school"
            mode="elevated"
            onPress={submit}
            style={styles.loginBtn}
            disabled={loading}
          >
            LOGIN
          </Button>
        </View>

        {/* ----------------------- Snackbar Component (TOP-ANCHORED) ----------------------- */}
        <Snackbar
          visible={snackbarVisible}
          onDismiss={onDismissSnackBar}
          duration={5000} // Increased duration to 5 seconds for multiline/multiple errors
          style={{ 
            position: 'absolute', 
            top: scale(10), // Scaled position
            left: scale(10), // Scaled position
            right: scale(10), // Scaled position
            backgroundColor: snackbarType === 'success' ? '#28a745' : '#dc3545',
            zIndex: 10,
          }}
          action={{
            label: 'Dismiss',
            onPress: onDismissSnackBar,
            textColor: 'white',
          }}
        >
          {snackbarMessage}
        </Snackbar>
        {/* ------------------------------------------------------------------ */}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default LoginPage;