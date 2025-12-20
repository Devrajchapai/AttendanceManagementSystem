import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { LogOut } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";

import AdminProfile from './AdminProfile';
import ConfigManagement from './ConfigManagement';
import TeacherClasses from './TeacherClasses';
import UserManagement from './UserManagement';
import ViewStudents from './ViewStudents';
import ViewTeachers from './ViewTeachers';

const Tab = createMaterialTopTabNavigator();

const AdminHomePage = () => {
    const navigation = useNavigation();

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: 'LoginPage' }] });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Admin Panel</Text>
                <Button 
                    icon={() => <LogOut size={16} color="white" />} 
                    onPress={handleLogout} 
                    compact 
                    mode="contained" 
                    style={styles.logoutButton}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </Button>
            </View>
            
            <Tab.Navigator
                initialRouteName="Add User" 
                screenOptions={{
                    tabBarActiveTintColor: '#2563eb',
                    tabBarInactiveTintColor: '#64748b',
                    tabBarLabelStyle: { fontSize: 11, fontWeight: 'bold', textTransform: 'none' },
                    tabBarIndicatorStyle: { backgroundColor: '#2563eb', height: 3 },
                    tabBarStyle: { backgroundColor: 'white' },
                    tabBarScrollEnabled: true, 
                    tabBarItemStyle: { width: 100 }, 
                }}
            >
                <Tab.Screen name="Add User" component={UserManagement} />
                <Tab.Screen name="Students" component={ViewStudents} />
                <Tab.Screen name="Teachers" component={ViewTeachers} />
                <Tab.Screen name="Classes" component={TeacherClasses} />
                <Tab.Screen name="Settings" component={ConfigManagement} />
                <Tab.Screen name="Profile" component={AdminProfile} />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: 'white' },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0'
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
    logoutButton: { backgroundColor: '#ef4444', borderRadius: 8, height: 35, justifyContent: 'center' },
    logoutText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});

export default AdminHomePage;