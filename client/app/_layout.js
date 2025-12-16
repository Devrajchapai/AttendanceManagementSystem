import AsyncStorage from "@react-native-async-storage/async-storage";
import { createStackNavigator } from "@react-navigation/stack";
import { useCallback, useEffect, useState } from "react";
import AdminHomePage from '../screens/adminScreen/AdminHomePage';
import LoginPage from "../screens/credentialsScreen/LoginPage";
import StudentHomePage from "../screens/studentScreen/StudentHomePage";
import StudentProfile from "../screens/studentScreen/StudentProfile";
import TeacherHomePage from "../screens/teacherScreen/TeacherHomePage";
import TeacherProfile from "../screens/teacherScreen/TeacherProfile";
import { LoadingScreen } from "../tools/loadingScreen";

// ❗ NEW PLACEHOLDER IMPORTS for Admin and Teacher screens
import AdminProfile from '../screens/adminScreen/AdminProfile';
import TeacherClasses from '../screens/adminScreen/TeacherClasses';
import ViewStudents from '../screens/adminScreen/ViewStudents';
import ViewTeachers from '../screens/adminScreen/ViewTeachers';

const Stack = createStackNavigator();

const Layout = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");

  const checkAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");

      if (token && role) {
        setIsLoggedIn(true);
        setUserRole(role);
      } else {
        setIsLoggedIn(false);
        setUserRole("");
      }
    } catch (err) {
      console.error("Error reading authentication data:", err);
      setIsLoggedIn(false);
      setUserRole("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const intervalId = setInterval(checkAuth, 60000); 
    return () => clearInterval(intervalId);
  }, [checkAuth]);

  if (isLoading) {
    return <LoadingScreen loadingVisibility={isLoading} />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="LoginPage" component={LoginPage} />
      ) : (
        <>
          {/* ------------------------------------- */}
          {/* ADMIN ROUTES (EXPANDED)               */}
          {/* ------------------------------------- */}
          {userRole === "admin" && (
            <>
              <Stack.Screen name="AdminHomePage" component={AdminHomePage} />
              <Stack.Screen name="AdminProfile" component={AdminProfile} />
              <Stack.Screen name="ViewStudents" component={ViewStudents} />
              <Stack.Screen name="ViewTeachers" component={ViewTeachers} />
              {/* Other Admin screens can be added here */}
            </>
          )}

          {/* ------------------------------------- */}
          {/* TEACHER ROUTES (EXPANDED)             */}
          {/* ------------------------------------- */}
          {userRole === "teacher" && (
            <>
              <Stack.Screen name="TeacherHomePage" component={TeacherHomePage} />
              <Stack.Screen name="TeacherProfile" component={TeacherProfile} />
              <Stack.Screen name="TeacherClasses" component={TeacherClasses} />
              {/* Other Teacher screens can be added here */}
            </>
          )}

          {/* ------------------------------------- */}
          {/* STUDENT ROUTES (EXISTING)             */}
          {/* ------------------------------------- */}
          {userRole === "student" && (
            <>
              <Stack.Screen name="StudentHomePage" component={StudentHomePage} />
              <Stack.Screen name="StudentProfile" component={StudentProfile} />
            </>
          )}
          
          {/* Fallback screen if logged in but role is unknown/null */}
          {userRole === "" && (
            <Stack.Screen name="LoginPage" component={LoginPage} />
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

export default Layout;