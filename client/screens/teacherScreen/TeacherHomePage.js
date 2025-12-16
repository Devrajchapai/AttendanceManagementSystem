import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BookOpen, Calendar, LogOut, User } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, Divider, Paragraph, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import checkTokenAvalibility from '../../tools/checkforToken';
import { LoadingScreen } from '../../tools/loadingScreen';

// Components
import AttendanceStarter from './AttendanceStarter'; // Imported from previous step

// Constants (ensure these are set in your .env or similar config)
const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const BASE_URL = `http://${LOCALHOST}:${SERVERPORT}/teacher`; // Base for teacher-specific routes like /profile and /takeattendance
const ADMIN_URL = `http://${LOCALHOST}:${SERVERPORT}/admin`; // Base for admin routes like /todaysRoutine and /viewRoutine

// Initial state for profile data
const initialProfileState = {
    username: 'Teacher',
    role: 'Teacher',
    department: 'N/A',
    assignedSubjects: [],
    profileImage: null,
};

const TeacherHomePage = () => {
    const navigation = useNavigation();
    const [profile, setProfile] = useState(initialProfileState);
    const [routine, setRoutine] = useState([]);
    const [fullRoutine, setFullRoutine] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleError = (message) => {
        Alert.alert("Error", message || "An unexpected error occurred.");
    };

    // ------------------------------------------------------------------
    // 1. Data Fetching Logic (GET requests) - UNCHANGED
    // ------------------------------------------------------------------

    const fetchData = useCallback(async () => {
        const token = await checkTokenAvalibility();
        if (!token) {
            handleError("Authentication required. Logging out.");
            await handleLogout(false);
            return;
        }

        const headers = { 'Authorization': `Bearer ${token}` };

        // --- Fetch Profile --- (GET)
        try {
            const profileRes = await fetch(`${BASE_URL}/profile`, { 
                method: "GET", 
                headers 
            });
            if (profileRes.ok) {
                const data = await profileRes.json();
                const userData = data.user;
                setProfile({
                    username: userData.username || 'Teacher',
                    role: userData.role || 'Teacher',
                    department: userData.department || 'N/A',
                    assignedSubjects: userData.assignedSubjects || [],
                    profileImage: userData.profileImage,
                });
            } else {
                const errorText = await profileRes.text();
                handleError(`Failed to fetch profile: ${profileRes.status} - ${errorText}`);
            }
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            handleError("Network error while fetching profile.");
        }

        // --- Fetch Today's Routine --- (GET)
        try {
            const routineRes = await fetch(`${ADMIN_URL}/todaysRoutine`, { 
                method: "GET", 
                headers 
            });
            if (routineRes.ok) {
                const data = await routineRes.json();
                const classes = Array.isArray(data) ? data : (data.classes || []);
                setRoutine(classes);
            } else {
                const errorText = await routineRes.text();
                handleError(`Failed to fetch today's routine: ${routineRes.status} - ${errorText}`);
                setRoutine([]);
            }
        } catch (err) {
            console.error("Today's Routine Fetch Error:", err);
            handleError("Network error while fetching today's routine.");
            setRoutine([]);
        }

        // --- Fetch Full Semester Routine (admin/viewRoutine) --- (GET)
        try {
            const fullRoutineRes = await fetch(`${ADMIN_URL}/viewRoutine`, { 
                method: "GET", 
                headers 
            });
            if (fullRoutineRes.ok) {
                const data = await fullRoutineRes.json();
                setFullRoutine(data); 
            } else {
                const errorText = await fullRoutineRes.text();
                handleError(`Failed to fetch full routine: ${fullRoutineRes.status} - ${errorText}`);
                setFullRoutine([]);
            }
        } catch (err) {
            console.error("Full Routine Fetch Error:", err);
            handleError("Network error while fetching full routine.");
            setFullRoutine([]);
        }
    }, []);

    // Load data when component mounts and every time it comes into focus
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setIsLoading(true);
                await fetchData();
                setIsLoading(false);
            };
            loadData();
        }, [fetchData])
    );

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
    }, [fetchData]);

    // ------------------------------------------------------------------
    // 2. Attendance Submission Logic (POST request) - UPDATED
    // ------------------------------------------------------------------

    // UPDATED: Now accepts two parameters: currentSubject and currentClass
    const handleTakeAttendance = useCallback(async (currentSubject, currentClass) => {
        const token = await checkTokenAvalibility();
        if (!token) {
            Alert.alert("Error", "Authentication failed. Please log in again.");
            return false;
        }

        const headers = { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // REQUIRED
        };

        try {
            const response = await fetch(`${BASE_URL}/takeattendance`, {
                method: "POST", 
                headers,
                // UPDATED: Include currentClass in the request body
                body: JSON.stringify({ currentSubject, currentClass }), 
            });

            const responseData = await response.json().catch(() => ({ message: response.statusText }));

            if (response.ok) {
                // Use the success message provided by the backend
                Alert.alert("Success", responseData.message); 
                return true;
            } else {
                // Display the error message from the backend
                Alert.alert("Failed", responseData.message || response.statusText);
                return false;
            }
        } catch (err) {
            console.error("Take Attendance Error:", err);
            Alert.alert("Network Error", "Could not connect to the server to take attendance.");
            return false;
        }
    }, []);


    // ------------------------------------------------------------------
    // 3. Navigation and Utility Functions - UNCHANGED
    // ------------------------------------------------------------------

    const handleLogout = async (showConfirmation = true) => {
        const logoutAction = async () => {
            setIsLoading(true);
            await AsyncStorage.clear();
            navigation.reset({
                index: 0,
                routes: [{ name: 'LoginPage' }],
            });
            setIsLoading(false);
        };

        if (showConfirmation) {
            Alert.alert(
                "Logout",
                "Are you sure you want to log out?",
                [{ text: "Cancel", style: "cancel" }, { text: "Logout", onPress: logoutAction, style: "destructive" }],
                { cancelable: true }
            );
        } else {
            await logoutAction();
        }
    };

    const handleViewFullRoutine = () => {
        if (fullRoutine.length === 0) {
            Alert.alert("Routine Not Available", "Full routine data is not yet loaded or configured.");
            return;
        }
        Alert.alert(
            "Full Routine Fetched", 
            `Successfully fetched routine for ${fullRoutine.length} days. Navigation to the routine screen is required for display.`,
            [
                { text: "OK" },
                { text: "View Data in Console", onPress: () => console.log("Full Routine Data:", fullRoutine) }
            ]
        );
    }

    // ------------------------------------------------------------------
    // 4. UI Rendering - UNCHANGED
    // ------------------------------------------------------------------

    if (isLoading) {
        return <LoadingScreen loadingVisibility={isLoading} />;
    }

    const { username, role, department, assignedSubjects, profileImage } = profile;
    const initial = username.charAt(0);
    const IMAGE_BASE_URL = `http://${LOCALHOST}:${SERVERPORT}/public/upload/teacher/`; 
    const profileUri = profileImage ? { uri: IMAGE_BASE_URL + profileImage } : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView 
                style={styles.container}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <View style={styles.profileInfo}>
                        <Avatar.Text 
                            size={50} 
                            label={profileUri ? '' : initial} 
                            source={profileUri}
                            style={{ backgroundColor: profileUri ? 'transparent' : '#2563eb' }} 
                        />
                        <View style={{ marginLeft: 15 }}>
                            <Title style={styles.greeting}>Welcome, {username.split(' ')[0]}!</Title>
                            <Text style={styles.roleBadge}>{role} - {department}</Text>
                        </View>
                    </View>
                    <Button icon={LogOut} onPress={() => handleLogout()} compact mode="text" labelStyle={{ color: '#dc3545' }}>
                        Logout
                    </Button>
                </View>

                <Divider style={styles.divider} />

                {/* 1. Attendance Management Section - PROP PASSING REMAINS CORRECT */}
                <AttendanceStarter 
                    assignedSubjects={assignedSubjects} 
                    handleTakeAttendance={handleTakeAttendance} 
                />

                {/* 2. Today's Routine */}
                <Text style={styles.sectionHeader}>Today's Routine</Text>
                {routine.length > 0 ? (
                    routine.map((item, index) => (
                        <Card key={index} style={styles.routineCard}>
                            <Card.Content style={styles.routineContent}>
                                <View>
                                    <Paragraph style={styles.routineSubject}>{item.subject}</Paragraph>
                                    <Text style={styles.routineTime}>{item.startTime} - {item.endTime}</Text>
                                    {/* Assuming routine data includes which class it is for (e.g., item.currentClass) */}
                                    {item.currentClass && <Text style={styles.routineClass}>{item.currentClass}</Text>}
                                </View>
                                <Calendar size={20} color="#64748b" />
                            </Card.Content>
                        </Card>
                    ))
                ) : (
                    <Card style={[styles.routineCard, styles.routineEmpty]}>
                        <Card.Content>
                            <Text style={styles.routineEmptyText}>No classes scheduled for today.</Text>
                        </Card.Content>
                    </Card>
                )}

                {/* 3. Quick Actions */}
                <Text style={styles.sectionHeader}>Quick Actions</Text>
                <View style={styles.quickActions}>
                    <Card style={styles.actionCard} onPress={() => navigation.navigate('TeacherProfile')}>
                        <Card.Content style={styles.actionContent}>
                            <User size={24} color="#1e293b" />
                            <Paragraph style={styles.actionText}>View Profile</Paragraph>
                        </Card.Content>
                    </Card>
                    <Card style={styles.actionCard} onPress={() => Alert.alert('Feature Coming Soon', 'Subject history retrieval is not yet implemented.')}>
                        <Card.Content style={styles.actionContent}>
                            <BookOpen size={24} color="#1e293b" />
                            <Paragraph style={styles.actionText}>Subject History</Paragraph>
                        </Card.Content>
                    </Card>
                    {/* View Full Routine Action */}
                    <Card style={styles.actionCard} onPress={handleViewFullRoutine}>
                        <Card.Content style={styles.actionContent}>
                            <Calendar size={24} color="#1e293b" />
                            <Paragraph style={styles.actionText}>Full Routine</Paragraph>
                        </Card.Content>
                    </Card>
                </View>

                <View style={{ height: 50 }} />
                
            </ScrollView>
        </SafeAreaView>
    );
};

// ... Styles (Clean and updated for new components) ...

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f1f5f9', 
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
    },
    profileInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 1,
    },
    greeting: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    roleBadge: {
        fontSize: 14,
        color: '#2563eb',
        fontWeight: '600',
    },
    divider: {
        marginBottom: 20,
    },
    sectionHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#343a40',
        marginTop: 15,
        marginBottom: 10,
    },
    // Routine Card Styles
    routineCard: {
        elevation: 1,
        backgroundColor: 'white',
        borderRadius: 10,
        marginBottom: 10,
    },
    routineContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    routineSubject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    routineTime: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 2,
    },
    routineClass: {
        fontSize: 12,
        color: '#94a3b8',
    },
    routineEmpty: {
        backgroundColor: '#fffbe6',
    },
    routineEmptyText: {
        textAlign: 'center',
        color: '#ca8a04',
        paddingVertical: 10,
    },
    // Quick Actions Styles
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 20,
        flexWrap: 'wrap',
    },
    actionCard: {
        flex: 1,
        minWidth: '45%',
        elevation: 3,
        borderRadius: 10,
        backgroundColor: 'white',
        marginBottom: 10,
    },
    actionContent: {
        alignItems: 'center',
        paddingVertical: 15,
        gap: 5,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1e293b',
        marginTop: 5,
    },
});

export default TeacherHomePage;