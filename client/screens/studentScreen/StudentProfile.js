import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { BookOpen, Calendar, Library, Lock, LogOut, MapPin, Monitor, Phone, User } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, TextInput } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import checkTokenAvalibility from "../../tools/checkforToken";
import { LoadingScreen } from '../../tools/loadingScreen';

// Constants
const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const BASE_URL = `http://${LOCALHOST}:${SERVERPORT}/student`;
const AUTH_BASE_URL = `http://${LOCALHOST}:${SERVERPORT}/auth`; 
const USER_ROLE = 'student'; 

// Modal remains outside the main component to prevent keyboard hiding issues
const PasswordChangeModal = ({ isVisible, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmNewPassword, setConfirmNewPassword, handlePasswordChange, isSaving, setIsModalVisible }) => (
    <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={() => setIsModalVisible(false)}
    >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Change Password</Text>
                <TextInput
                    label="Current Password"
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.modalInput}
                />
                <TextInput
                    label="New Password (min 6 chars)"
                    value={newPassword}
                    onChangeText={setNewPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.modalInput}
                />
                <TextInput
                    label="Confirm New Password"
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    mode="outlined"
                    secureTextEntry
                    style={styles.modalInput}
                />
                
                <Button
                    icon="lock-reset"
                    mode="contained"
                    onPress={handlePasswordChange}
                    loading={isSaving}
                    disabled={isSaving || newPassword.length < 6 || newPassword !== confirmNewPassword}
                    style={styles.modalButton}
                >
                    Update Password
                </Button>
                <Button 
                    mode="text" 
                    onPress={() => setIsModalVisible(false)}
                    style={{ marginTop: 10 }}
                >
                    Cancel
                </Button>
            </View>
        </View>
    </Modal>
);

const StudentProfile = () => {
    const navigation = useNavigation();

    // ----------------------------------------------------
    // 1. STATE MANAGEMENT
    // ----------------------------------------------------
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [fetchError, setFetchError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false); 

    // Editable fields state
    const [newPhone, setNewPhone] = useState('');
    const [serverImageUrl, setServerImageUrl] = useState(null); 
    
    // Password Change State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    

    // ----------------------------------------------------
    // 2. DATA FETCHING (GET /student/profile)
    // ----------------------------------------------------

    const fetchProfile = useCallback(async () => {
        setFetchError(null);
        const url = `${BASE_URL}/profile`;
        const tokenString = await checkTokenAvalibility(); 

        if (!tokenString) {
            setFetchError("Authentication failed. Please log in.");
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${tokenString}` }
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'Failed to fetch profile.' }));
                throw new Error(errorBody.message || `Server returned status ${response.status}`);
            }

            const { user } = await response.json();
            
            setUserData(user);
            setNewPhone(user.phone ? String(user.phone) : ''); 
            setServerImageUrl(user.profileImage); // This field might be null
            
        } catch (err) {
            console.error("Fetch Profile Error:", err);
            setFetchError(err.message || "Could not load profile. Is the server running?");
        }
    }, []);

    useEffect(() => {
        fetchProfile().finally(() => setIsLoading(false));
    }, [fetchProfile]);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await fetchProfile();
        setIsRefreshing(false);
    };

    // ----------------------------------------------------
    // 3. HANDLERS: UPDATE PROFILE, LOGOUT, CHANGE PASSWORD
    // ----------------------------------------------------
    
    // NOTE: Image handling has been removed as requested. Only phone update remains.
    const handleUpdateProfile = async () => {
        setIsSaving(true);
        const url = `${BASE_URL}/updateProfile`;
        const tokenString = await checkTokenAvalibility();
        
        // Check if phone has changed
        if (userData && String(userData.phone) === newPhone) {
             Alert.alert("No Changes", "Phone number was not modified. Nothing to save.");
             setIsSaving(false);
             return;
        }
        
        try {
            const response = await fetch(url, {
                method: 'POST', 
                headers: {
                    'Authorization': `Bearer ${tokenString}`,
                    'Content-Type': 'application/json', // No image, so use JSON
                },
                body: JSON.stringify({ phone: newPhone }),
            });

            const result = await response.json();

            if (!response.ok) {
                 throw new Error(result.message || "Failed to update profile.");
            }
            
            Alert.alert("Success", result.message);
            await onRefresh(); 

        } catch (err) {
            console.error("Update Profile Error:", err);
            Alert.alert("Error", err.message || "An unknown error occurred while updating.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters long.');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }

        setIsSaving(true);
        const url = `${AUTH_BASE_URL}/passwordChange`; 
        const tokenString = await checkTokenAvalibility();
        
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenString}`,
                    'role': USER_ROLE, 
                },
                body: JSON.stringify({
                    newPassword: newPassword,
                }),
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Password change failed.');
            }
            
            Alert.alert("Success", 'Your password has been updated successfully. Please log in again.');
            setIsModalVisible(false);
            handleLogout(); 
            
        } catch (err) {
            console.error("Password Change Error:", err);
            Alert.alert("Error", err.message || "Failed to change password.");
        } finally {
            setIsSaving(false);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }
    };
    
    const handleLogout = async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('role');
        Alert.alert("Logged Out", "You have been successfully logged out.");
        navigation.replace("LoginPage"); 
    };
    
    // ----------------------------------------------------
    // 4. RENDER COMPONENTS
    // ----------------------------------------------------
    
    if (isLoading || isRefreshing) {
        return <LoadingScreen loadingVisibility={true} />; 
    }
    
    if (fetchError || !userData) {
        return (
            <SafeAreaView style={styles.centerContainer}>
                <Text style={styles.errorText}>Error: {fetchError || "Profile data is missing."}</Text>
                <Button onPress={onRefresh} mode="contained" style={{ marginTop: 10 }}>Reload</Button>
            </SafeAreaView>
        );
    }

    const usernameInitial = userData.username ? userData.username[0].toUpperCase() : '?';

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <PasswordChangeModal 
                    isVisible={isModalVisible}
                    currentPassword={currentPassword}
                    setCurrentPassword={setCurrentPassword}
                    newPassword={newPassword}
                    setNewPassword={setNewPassword}
                    confirmNewPassword={confirmNewPassword}
                    setConfirmNewPassword={setConfirmNewPassword}
                    handlePasswordChange={handlePasswordChange}
                    isSaving={isSaving}
                    setIsModalVisible={setIsModalVisible}
                />
                
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                >
                    <Text style={styles.headerTitle}>My Profile</Text>
                    
                    <Card style={styles.profileCard}>
                        <View style={styles.imageContainer}>
                            {/* NEW: Use Avatar component */}
                            {serverImageUrl ? (
                                <Avatar.Image 
                                    size={150} 
                                    source={{ uri: serverImageUrl }} 
                                    style={styles.profileImage} 
                                />
                            ) : (
                                <Avatar.Text 
                                    size={150} 
                                    label={usernameInitial} 
                                    style={styles.avatarText} 
                                />
                            )}
                            {/* REMOVED: Change Photo button */}
                        </View>
                        
                        <Text style={styles.nameText}>{userData.username || 'N/A'}</Text>
                        <Text style={styles.emailText}>{userData.email}</Text>
                        <View style={styles.badgeContainer}>
                             <View style={styles.statusBadge(userData.status === 'active')}>
                                <Text style={styles.statusText}>{userData.status?.toUpperCase() || 'N/A'}</Text>
                            </View>
                            <View style={styles.roleBadge}>
                                <Text style={styles.statusText}>{userData.role?.toUpperCase() || 'N/A'}</Text>
                            </View>
                        </View>
                    </Card>

                    <Text style={styles.sectionHeader}>Personal Information</Text>
                    
                    <TextInput label="Roll No" value={String(userData.rollNo || 'N/A')} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon={() => <Monitor size={20} color="#6c757d" />} />} />
                    <TextInput label="Student ID" value={String(userData.studentId || 'N/A')} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon={() => <User size={20} color="#6c757d" />} />} />
                    <TextInput label="Symbol No" value={String(userData.symbolNo || 'N/A')} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon={() => <Monitor size={20} color="#6c757d" />} />} />
                    <TextInput label="Program" value={userData.program || 'N/A'} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon={() => <Library size={20} color="#6c757d" />} />} />
                    <TextInput label="Current Class" value={userData.currentClass || 'N/A'} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon={() => <BookOpen size={20} color="#6c757d" />} />} />
                    <TextInput label="Admitted Batch" value={String(userData.admittedBatch || 'N/A')} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon={() => <Calendar size={20} color="#6c757d" />} />} />
                    <TextInput label="Gender" value={userData.gender || 'N/A'} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon="gender-male-female" />} />
                    <TextInput label="Date of Birth" value={userData.DOB || 'N/A'} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon="cake" />} />
                    <TextInput label="Nationality" value={userData.nationality || 'N/A'} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon={() => <MapPin size={20} color="#6c757d" />} />} />

                    <Text style={styles.sectionHeader}>Contact & Guardian Information (Editable)</Text>

                    <TextInput
                        label="Phone Number"
                        value={newPhone}
                        onChangeText={setNewPhone}
                        mode="outlined"
                        style={styles.input}
                        keyboardType="phone-pad"
                        disabled={isSaving}
                        left={<TextInput.Icon icon={() => <Phone size={20} color="#007bff" />} />}
                    />
                    
                    <TextInput label="Guardian Name" value={userData.guardianName || 'N/A'} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon="account-supervisor" />} />
                    <TextInput label="Father's Name" value={userData.fatherName || 'N/A'} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon="account-supervisor" />} />
                    <TextInput label="Father's Phone" value={String(userData.fatherPhone || 'N/A')} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon="phone" />} />
                    <TextInput label="Mother's Name" value={userData.motherName || 'N/A'} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon="account-supervisor" />} />
                    <TextInput label="Mother's Phone" value={String(userData.motherPhone || 'N/A')} mode="outlined" style={styles.input} disabled left={<TextInput.Icon icon="phone" />} />
                    
                    <Button
                        icon="content-save"
                        mode="contained"
                        onPress={handleUpdateProfile}
                        loading={isSaving}
                        disabled={isSaving}
                        style={styles.saveButton}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes (Phone)'}
                    </Button>
                    
                    <Text style={styles.sectionHeader}>Security</Text>

                    <Button
                        icon={() => <Lock size={20} color="#007bff" />}
                        mode="outlined"
                        onPress={() => setIsModalVisible(true)}
                        style={styles.securityButton}
                    >
                        Change Password
                    </Button>

                    <Button
                        icon={() => <LogOut size={20} color="white" />}
                        mode="contained"
                        buttonColor="#dc3545"
                        onPress={handleLogout}
                        style={styles.logoutButton}
                    >
                        Logout
                    </Button>
                    
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

// --- STYLESHEETS ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
    scrollContent: { padding: 15, paddingBottom: 50 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
    
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#343a40', marginBottom: 20 },

    profileCard: { marginBottom: 20, padding: 20, alignItems: 'center', borderRadius: 10, elevation: 3 },
    
    imageContainer: { alignItems: 'center', marginBottom: 15 },
    profileImage: { borderColor: '#ccc', borderWidth: 2 }, // For Avatar.Image
    avatarText: { backgroundColor: '#007bff' }, // For Avatar.Text
    
    nameText: { fontSize: 24, fontWeight: 'bold', color: '#007bff', marginTop: 5 },
    emailText: { fontSize: 16, color: '#6c757d' },
    badgeContainer: { flexDirection: 'row', marginTop: 8, gap: 10 },
    statusBadge: (isActive) => ({ 
        paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, 
        backgroundColor: isActive ? '#e6f7ef' : '#fdebeb', 
        borderWidth: 1, 
        borderColor: isActive ? '#28a745' : '#dc3545' 
    }),
    roleBadge: {
        paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, 
        backgroundColor: '#e0f7ff', 
        borderWidth: 1, 
        borderColor: '#007bff'
    },
    statusText: { fontSize: 12, fontWeight: 'bold', color: '#343a40' },


    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#343a40', marginTop: 25, marginBottom: 10 },
    
    input: { marginBottom: 10 },
    
    saveButton: { marginTop: 20, paddingVertical: 5, backgroundColor: '#28a745' },
    securityButton: { marginTop: 10, paddingVertical: 5, borderColor: '#007bff', borderWidth: 1 },
    logoutButton: { marginTop: 20, paddingVertical: 5, marginBottom: 30 },


    // Modal Styles
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        margin: 20,
        borderRadius: 10,
        width: '90%',
        elevation: 10, 
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#007bff' },
    modalInput: { marginBottom: 15 },
    modalButton: { marginTop: 5 },
});

export default StudentProfile;