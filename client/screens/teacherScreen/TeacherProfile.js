import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BookOpen, Lock, LogOut, MapPin, Monitor, Phone, User } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, Divider, Paragraph, TextInput, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import checkTokenAvalibility from '../../tools/checkforToken';
import { LoadingScreen } from '../../tools/loadingScreen';
import { PasswordChangeModal } from '../../tools/PasswordChangeModal'; // Assume you have a reusable PasswordChangeModal

// Constants (ensure these are set in your .env or similar config)
const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const BASE_URL = `http://${LOCALHOST}:${SERVERPORT}/teacher`; // Base for profile fetch and update
const AUTH_BASE_URL = `http://${LOCALHOST}:${SERVERPORT}/authRouter`; // Base for password change

const initialProfileState = {
    username: 'Loading...',
    email: 'loading@example.com',
    role: 'teacher',
    teacherId: 'N/A',
    status: 'inactive',
    mobileNumber: 'N/A',
    department: 'N/A',
    assignedSubjects: [],
    profileImage: null,
};

const TeacherProfile = () => {
    const navigation = useNavigation();
    const [profile, setProfile] = useState(initialProfileState);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    
    // State for update fields (Simplified to just mobileNumber for this example)
    const [mobileNumber, setMobileNumber] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Password Change State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const handleError = (message) => {
        Alert.alert("Error", message || "An unexpected error occurred.");
    };

    // ------------------------------------------------------------------
    // 1. Data Fetching Logic (Profile is the only data needed here)
    // ------------------------------------------------------------------

    const fetchProfileData = useCallback(async () => {
        const token = await checkTokenAvalibility();
        if (!token) {
            handleError("Authentication required. Logging out.");
            // Optionally log out the user here
            return;
        }

        try {
            const response = await fetch(`${BASE_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok && data.user) {
                const userData = data.user;
                setProfile(userData);
                // Initialize the editable state field(s)
                setMobileNumber(userData.mobileNumber || ''); 
            } else {
                handleError(data.message || `Failed to fetch profile: ${response.statusText}`);
            }
        } catch (err) {
            console.error("Profile Fetch Error:", err);
            handleError("Network error while fetching profile.");
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setIsLoading(true);
                await fetchProfileData();
                setIsLoading(false);
            };
            loadData();
        }, [fetchProfileData])
    );

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchProfileData();
        setIsRefreshing(false);
    }, [fetchProfileData]);

    // ------------------------------------------------------------------
    // 2. Profile Update Logic (Placeholder)
    // ------------------------------------------------------------------

    const handleUpdateProfile = async () => {
        setIsSaving(true);
        const token = await checkTokenAvalibility();

        const formData = new FormData();
        formData.append('mobileNumber', mobileNumber);
        // NOTE: If you add image upload, it must be handled here with 'multipart/form-data'

        try {
            const response = await fetch(`${BASE_URL}/updateprofile`, {
                method: 'POST', // Or PUT, matching your router definition
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // IMPORTANT: Do NOT set 'Content-Type': 'application/json' when using FormData for file uploads.
                },
                body: formData,
            });

            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "Profile updated successfully!");
                await fetchProfileData(); // Re-fetch to update state
            } else {
                handleError(data.message || "Failed to update profile.");
            }
        } catch (err) {
            console.error("Profile Update Error:", err);
            handleError("Network error while updating profile.");
        } finally {
            setIsSaving(false);
        }
    };
    
    // ------------------------------------------------------------------
    // 3. Password Change Logic (Simplified)
    // ------------------------------------------------------------------

    const handlePasswordChange = async () => {
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Error", "New password and confirm password do not match.");
            return;
        }

        setIsSaving(true);
        const token = await checkTokenAvalibility();

        try {
            const response = await fetch(`${AUTH_BASE_URL}/passwordChange`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Role': 'teacher', // Must be sent in headers as per your authController.js
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();
            
            if (response.ok) {
                Alert.alert("Success", "Your password has been updated.");
                setIsModalVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
            } else {
                handleError(data.message || "Password change failed.");
            }
        } catch (err) {
            handleError("Network error during password change.");
        } finally {
            setIsSaving(false);
        }
    };

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
    // ------------------------------------------------------------------
    // 4. UI Rendering
    // ------------------------------------------------------------------

    if (isLoading) {
        return <LoadingScreen loadingVisibility={isLoading} />;
    }

    const { username, email, role, teacherId, status, department, assignedSubjects, profileImage } = profile;
    const initial = username.charAt(0);
    const IMAGE_BASE_URL = `http://${LOCALHOST}:${SERVERPORT}/public/upload/teacher/`;
    const profileUri = profileImage ? { uri: IMAGE_BASE_URL + profileImage } : null;

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.header}>
                    <Title style={styles.pageTitle}>My Profile</Title>
                    <Button icon={LogOut} onPress={handleLogout}>
                        Logout
                    </Button>
                </View>

                {/* Profile Card */}
                <Card style={styles.profileCard}>
                    <View style={styles.profileContent}>
                        <Avatar.Text
                            size={80}
                            label={profileUri ? '' : initial}
                            source={profileUri}
                            style={{ backgroundColor: profileUri ? 'transparent' : '#2563eb' }}
                        />
                        <View style={styles.infoContainer}>
                            <Title style={styles.username}>{username}</Title>
                            <View style={styles.badge(status === 'active')}>
                                <Text style={styles.statusText}>{status.toUpperCase()}</Text>
                            </View>
                            <View style={styles.roleBadge}>
                                <Text style={styles.statusText}>{role.toUpperCase()}</Text>
                            </View>
                        </View>
                    </View>
                    <Divider style={styles.divider} />

                    {/* Basic Info */}
                    <View style={styles.detailRow}>
                        <User size={20} color="#64748b" />
                        <Paragraph style={styles.detailText}>Teacher ID: {teacherId}</Paragraph>
                    </View>
                    <View style={styles.detailRow}>
                        <Monitor size={20} color="#64748b" />
                        <Paragraph style={styles.detailText}>Email: {email}</Paragraph>
                    </View>
                    <View style={styles.detailRow}>
                        <MapPin size={20} color="#64748b" />
                        <Paragraph style={styles.detailText}>Department: {department || 'N/A'}</Paragraph>
                    </View>
                </Card>

                {/* Editable/Update Section */}
                <Text style={styles.sectionHeader}>Contact Information</Text>
                <Card style={styles.card}>
                    <TextInput
                        label="Mobile Number"
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="phone-pad"
                        left={<TextInput.Icon icon={Phone} />}
                    />
                    
                    <Button
                        mode="contained"
                        onPress={handleUpdateProfile}
                        loading={isSaving}
                        disabled={isSaving}
                        style={styles.saveButton}
                        labelStyle={{color: 'white'}}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </Card>
                
                {/* Assigned Subjects */}
                <Text style={styles.sectionHeader}>Assigned Subjects</Text>
                <Card style={styles.card}>
                    {assignedSubjects && assignedSubjects.length > 0 ? (
                        assignedSubjects.map((subject, index) => (
                            <View key={index} style={styles.subjectItem}>
                                <BookOpen size={16} color="#2563eb" />
                                <Text style={styles.subjectText}>{subject}</Text>
                            </View>
                        ))
                    ) : (
                        <Paragraph style={styles.noSubjectText}>No subjects currently assigned.</Paragraph>
                    )}
                </Card>

                {/* Security Section */}
                <Text style={styles.sectionHeader}>Security</Text>
                <Card style={styles.card}>
                    <Button
                        mode="outlined"
                        onPress={() => setIsModalVisible(true)}
                        icon={Lock}
                        style={styles.securityButton}
                        labelStyle={{ color: '#007bff' }}
                    >
                        Change Password
                    </Button>
                </Card>
                
                <View style={{ height: 50 }} />

            </ScrollView>

            {/* Password Change Modal */}
            <PasswordChangeModal 
                isVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
                currentPassword={currentPassword}
                setCurrentPassword={setCurrentPassword}
                newPassword={newPassword}
                setNewPassword={setNewPassword}
                confirmNewPassword={confirmNewPassword}
                setConfirmNewPassword={setConfirmNewPassword}
                handlePasswordChange={handlePasswordChange}
                isSaving={isSaving}
            />
        </SafeAreaView>
    );
};

// NOTE: You will need to ensure you have a common 'PasswordChangeModal' 
// component that accepts these props, or implement the modal directly here.

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
    },
    profileCard: {
        marginBottom: 20,
        elevation: 3,
        borderRadius: 12,
        backgroundColor: 'white',
        padding: 15,
    },
    profileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoContainer: {
        marginLeft: 20,
        flex: 1,
        gap: 5,
    },
    username: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1e293b',
        lineHeight: 28,
    },
    badge: (isActive) => ({
        paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20,
        backgroundColor: isActive ? '#e6f7ef' : '#fdebeb',
        borderWidth: 1,
        borderColor: isActive ? '#28a745' : '#dc3545',
        alignSelf: 'flex-start',
    }),
    roleBadge: {
        paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20,
        backgroundColor: '#e0f7ff',
        borderWidth: 1,
        borderColor: '#007bff',
        alignSelf: 'flex-start',
    },
    statusText: { fontSize: 12, fontWeight: 'bold', color: '#343a40' },

    divider: {
        marginVertical: 10,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        gap: 15,
    },
    detailText: {
        fontSize: 16,
        color: '#343a40',
    },

    sectionHeader: { 
        fontSize: 18, 
        fontWeight: 'bold', 
        color: '#343a40', 
        marginTop: 20, 
        marginBottom: 10 
    },
    card: {
        marginBottom: 20,
        elevation: 1,
        borderRadius: 12,
        backgroundColor: 'white',
        padding: 15,
    },
    input: { 
        marginBottom: 10 
    },
    saveButton: { 
        marginTop: 10, 
        paddingVertical: 5, 
        backgroundColor: '#28a745' 
    },
    securityButton: { 
        marginTop: 5, 
        paddingVertical: 5, 
        borderColor: '#007bff', 
        borderWidth: 1 
    },
    subjectItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        gap: 10,
    },
    subjectText: {
        fontSize: 16,
        color: '#1e293b',
    },
    noSubjectText: {
        textAlign: 'center',
        color: '#64748b',
        paddingVertical: 10,
    }
});

export default TeacherProfile;