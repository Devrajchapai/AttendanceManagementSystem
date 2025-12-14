import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStackNavigator } from '@react-navigation/stack';
import { useCallback, useEffect, useState } from 'react';
import AdminHomePage from '../screens/adminScreen/AdminHomePage';
import LoginPage from '../screens/credentialsScreen/LoginPage';
import StudentHomePage from '../screens/studentScreen/StudentHomePage';
import TeacherHomePage from '../screens/teacherScreen/TeacherHomePage';
import { LoadingScreen } from '../tools/loadingScreen';

const Stack = createStackNavigator();

const Layout = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userRole, setUserRole] = useState('');

    
    const checkAuth = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const role = await AsyncStorage.getItem('role');

            if (token && role) {
                setIsLoggedIn(true);
                setUserRole(role);
            } else {
                setIsLoggedIn(false);
                setUserRole('');
            }
        } catch (err) {
            console.error("Error reading authentication data:", err);
            setIsLoggedIn(false);
            setUserRole('');
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
        <LoadingScreen loadingVisibility={isLoading}/>
        return null;
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
                <Stack.Screen name="LoginPage" component={LoginPage} />
            ) : (
                
                <>
                    {userRole === 'admin' && (
                        <Stack.Screen name="AdminHomePage" component={AdminHomePage} />
                    )}
                    {userRole === 'teacher' && (
                        <Stack.Screen name="TeacherHomePage" component={TeacherHomePage} />
                    )}
                    {userRole === 'student' && (
                        <Stack.Screen name="StudentHomePage" component={StudentHomePage} />
                    )}
                    {/* Fallback screen if logged in but role is unknown/null */}
                    {/* Add a default logged-in screen or redirect to an error page */}
                </>
            )}
        </Stack.Navigator>
    );
};

export default Layout;