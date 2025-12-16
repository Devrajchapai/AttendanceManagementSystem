import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import { LogOut } from 'lucide-react-native';
import { SafeAreaView, StyleSheet } from 'react-native';
import { Button, Title } from 'react-native-paper';
import AdminProfile from './AdminProfile'; // NEW Component (minimal structure)
import ConfigManagement from './ConfigManagement'; // NEW Component
import UserManagement from './UserManagement'; // NEW Component

const Tab = createMaterialTopTabNavigator();

const AdminHomePage = () => {
    const navigation = useNavigation();

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: 'LoginPage' }] });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <Title style={styles.headerTitle}>Admin Dashboard</Title>
            <Button 
                icon={LogOut} 
                onPress={handleLogout} 
                compact 
                mode="contained" 
                style={styles.logoutButton}
                labelStyle={{color: 'white'}}
            >
                Logout
            </Button>
            
            <Tab.Navigator
                initialRouteName="Users"
                screenOptions={{
                    tabBarActiveTintColor: '#2563eb',
                    tabBarInactiveTintColor: '#64748b',
                    tabBarLabelStyle: { fontSize: 13, fontWeight: 'bold' },
                    tabBarIndicatorStyle: { backgroundColor: '#2563eb', height: 3 },
                    tabBarStyle: { backgroundColor: 'white' },
                }}
                style={styles.tabContainer}
            >
                <Tab.Screen name="Users" component={UserManagement} />
                <Tab.Screen name="Config" component={ConfigManagement} />
                <Tab.Screen name="Profile" component={AdminProfile} />
            </Tab.Navigator>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    logoutButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        backgroundColor: '#dc3545',
        paddingVertical: 2,
    },
    tabContainer: {
        flex: 1,
        marginTop: 20,
    }
});

export default AdminHomePage;