import * as Location from 'expo-location';
import { Calendar, CheckSquare, MapPin, MessageCircle, TrendingUp } from 'lucide-react-native'; // Added 'User' icon
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Paragraph, Title } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import checkTokenAvalibility from "../../tools/checkforToken";
// *** NEW IMPORT ***
import { useNavigation } from '@react-navigation/native'; // Import navigation hook

// Constants rely on the EXPO_PUBLIC_ prefix in your .env file
const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const BASE_URL = `http://${LOCALHOST}:${SERVERPORT}/student`;

const StudentHomePage = () => {
    // *** NEW HOOK CALL ***
    const navigation = useNavigation();

    // ----------------------------------------------------
    // 1. STATE MANAGEMENT
    // ----------------------------------------------------
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [attendanceData, setAttendanceData] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    
    // Attendance Submission State
    const [isAttendanceAvailable, setIsAttendanceAvailable] = useState(false);
    const [attendanceMessage, setAttendanceMessage] = useState('');
    const [showModal, setShowModal] = useState(false); 

    // ... (fetchAttendanceStatus, fetchAttendanceHistory, loadAllData, onRefresh, handleSubmission functions remain unchanged)

    const fetchAttendanceStatus = useCallback(async () => {
        const url = `${BASE_URL}/isAttendanceAvailable`;
        const tokenString = await checkTokenAvalibility();
        if (!tokenString) return false;

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${tokenString}` }
            });
            
            if (!response.ok) throw new Error("Failed to fetch attendance status.");

            const data = await response.json();
            setIsAttendanceAvailable(data.attendanceStatus);
            setAttendanceMessage(data.message || 'Attendance is now open.');
            return data.attendanceStatus;
        } catch (err) {
            console.error("Error fetching attendance status:", err);
            setIsAttendanceAvailable(false);
            return false;
        }
    }, []);

    const fetchAttendanceHistory = useCallback(async () => {
        const url = `${BASE_URL}/attendaceHistory`;
        const tokenString = await checkTokenAvalibility();
        
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${tokenString}` }
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ message: 'Failed to retrieve history.' }));
                throw new Error(errorBody.message || `Status ${response.status}`);
            }

            const data = await response.json();
            setAttendanceData(data.data); 

        } catch (err) {
            console.error("Error fetching history:", err);
            setFetchError(err.message || "Network request failed. Is the server running?");
        }
    }, []);
    
    const loadAllData = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        if (!LOCALHOST || !SERVERPORT) {
            setFetchError("API config error. Check .env and restart Expo.");
            setIsLoading(false);
            return;
        }
        await Promise.all([
            fetchAttendanceHistory(),
            fetchAttendanceStatus()
        ]);
        setIsLoading(false);
    }, [fetchAttendanceHistory, fetchAttendanceStatus, LOCALHOST, SERVERPORT]);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await loadAllData();
        setIsRefreshing(false);
    };

    useEffect(() => {
        loadAllData();
    }, [loadAllData]);


    const handleSubmission = async () => {
        setShowModal(false);
        setIsLoading(true);
        
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                throw new Error("Location permission denied. Cannot mark attendance.");
            }
            
            let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const { latitude: studentLatitude, longitude: studentLongitude } = location.coords;
            
            const tokenString = await checkTokenAvalibility();
            
            const subjectName = "Current Class (Placeholder)"; 
            
            const response = await fetch(`${BASE_URL}/submitAttendance`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenString}`
                },
                body: JSON.stringify({
                    studentLatitude,
                    studentLongitude,
                    subjectName
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                Alert.alert("Submission Failed", result.message || "Attendance could not be marked.");
            } else {
                Alert.alert("Success!", result.message);
                await loadAllData(); 
            }

        } catch (err) {
            console.error("Submission Error:", err);
            Alert.alert("Error", err.message || "Could not connect to the server or retrieve location.");
        } finally {
            setIsLoading(false);
        }
    };


    const summary = attendanceData?.summary;
    const subjectDetails = attendanceData?.subjectDetails || [];

    const SubmissionModal = () => (
        <Modal 
            animationType="fade"
            transparent={true} 
            visible={showModal}
            onRequestClose={() => setShowModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Title style={styles.modalTitle}>Confirm Attendance</Title>
                    <Text style={styles.modalText}>
                        <MapPin size={16} color="#007bff" /> Your current GPS location will be automatically taken and checked against the college boundary ({summary?.workingDays} days worked).
                    </Text>
                    
                    {attendanceMessage && (
                        <Card style={styles.messageCard}>
                            <MessageCircle size={16} color="#856404" />
                            <Text style={styles.messageText}> {attendanceMessage}</Text>
                        </Card>
                    )}

                    <Button 
                        icon="map-marker-check"
                        mode="contained" 
                        onPress={handleSubmission}
                        style={styles.modalSubmitButton}
                        loading={isLoading}
                        disabled={isLoading}
                    >
                        Mark Attendance Now
                    </Button>
                    <Button 
                        mode="text" 
                        onPress={() => setShowModal(false)}
                        style={{ marginTop: 10 }}
                    >
                        Cancel
                    </Button>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" />
                <SubmissionModal /> 
                
                <View style={styles.headerRow}>
                     <Text style={styles.headerTitle}>Student Dashboard</Text>
                     
                     {/* *** UPDATED BUTTON FOR NAVIGATION *** */}
                     <Button
                        icon='account-circle-outline' // Icon for profile
                        mode="text"
                        textColor='#007bff'
                        onPress={() => navigation.navigate('StudentProfile')} // Navigate to the new screen
                        contentStyle={{ height: 40 }}
                     >
                         Profile
                     </Button>
                </View>

                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
                    }
                >
                    {(isLoading && !isRefreshing) && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />}

                    {/* RENDER 1: ERROR / INITIAL STATE */}
                    {fetchError ? (
                        <View style={styles.errorBox}>
                            <Text style={styles.errorText}>{fetchError}</Text>
                            <Button onPress={onRefresh} icon="refresh" mode="outlined" style={{ marginTop: 10 }}>Try Again</Button>
                        </View>
                    ) : summary && (
                        // RENDER 2: OVERALL STATUS CARD
                        <Card style={styles.summaryCard}>
                            <Card.Content>
                                <View style={styles.summaryHeader}>
                                    <Title style={styles.summaryTitle}>Overall Status</Title>
                                    <View style={styles.percentageCircle}>
                                        <TrendingUp size={24} color="#fff" />
                                        <Text style={styles.percentageText}>{summary.percentage}%</Text>
                                    </View>
                                </View>
                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryStat}>
                                        <CheckSquare size={20} color="#28a745" />
                                        <Paragraph style={styles.statValue}>{summary.presentDays}</Paragraph>
                                        <Text style={styles.statLabel}>Days Present</Text>
                                    </View>
                                    <View style={styles.summaryStat}>
                                        <Calendar size={20} color="#6c757d" />
                                        <Paragraph style={styles.statValue}>{summary.workingDays}</Paragraph>
                                        <Text style={styles.statLabel}>Total Days</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {/* RENDER 3: SUBMIT ATTENDANCE BUTTON (CONDITIONAL) */}
                    {isAttendanceAvailable && !isLoading && (
                        <View style={styles.attendanceButtonContainer}>
                            <Text style={styles.attendancePrompt}>{attendanceMessage}</Text>
                            <Button
                                icon="map-marker-check"
                                mode="contained"
                                buttonColor="#28aa46"
                                onPress={() => setShowModal(true)}
                                disabled={isLoading}
                            >
                                Submit Attendance
                            </Button>
                        </View>
                    )}

                    {/* RENDER 4: DETAILED HISTORY */}
                    {subjectDetails.length > 0 && (
                        <View style={styles.historyContainer}>
                            <Text style={styles.historyHeader}>Detailed Records</Text>
                            {subjectDetails.map((item, index) => (
                                <Card key={index} style={styles.itemCard}>
                                    <Card.Content style={styles.itemContent}>
                                        <Text style={styles.itemSubject}>{item.subject}</Text>
                                        <View style={styles.statusBadge(item.status === 'present')}>
                                            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                                        </View>
                                    </Card.Content>
                                </Card>
                            ))}
                        </View>
                    )}
                    
                    <Text style={styles.footerText}>
                        <Text style={{fontWeight: 'bold'}}>Host:</Text> {BASE_URL}
                    </Text>

                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

// --- STYLESHEETS (Unchanged, except for the new modal styles which are kept) ---
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
    scrollContent: { padding: 15 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },
    headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#343a40' },
    
    // MODAL STYLES
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
        shadowColor: '#000', 
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#007bff' },
    modalText: { fontSize: 16, color: '#6c757d', marginBottom: 15 },
    messageCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff3cd', padding: 10, marginVertical: 10, borderColor: '#ffc107', borderWidth: 1 },
    messageText: { color: '#856404', marginLeft: 8 },
    modalSubmitButton: { marginTop: 15 },
    
    // Summary
    summaryCard: { marginBottom: 25, borderRadius: 12, backgroundColor: '#ffffff', elevation: 4 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    summaryTitle: { fontSize: 18, fontWeight: 'bold', color: '#343a40' },
    percentageCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 8 },
    percentageText: { fontSize: 14, fontWeight: 'bold', color: '#ffffff' },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
    summaryStat: { alignItems: 'center' },
    statValue: { fontSize: 24, fontWeight: '900', color: '#343a40', marginTop: 5 },
    statLabel: { fontSize: 12, color: '#6c757d' },
    
    // Attendance Button Area
    attendanceButtonContainer: { backgroundColor: '#e6f7ef', padding: 15, borderRadius: 10, marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#28a745' },
    attendancePrompt: { fontSize: 16, fontWeight: 'bold', color: '#28a745', marginBottom: 10, textAlign: 'center' },
    
    // History
    historyContainer: { marginBottom: 20 },
    historyHeader: { fontSize: 18, fontWeight: 'bold', color: '#343a40', marginBottom: 10 },
    itemCard: { marginBottom: 10, borderRadius: 8, elevation: 2 },
    itemContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    itemSubject: { fontSize: 16, fontWeight: '600', color: '#343a40' },
    statusBadge: (isPresent) => ({ paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: isPresent ? '#e6f7ef' : '#fdebeb', borderWidth: 1, borderColor: isPresent ? '#28a745' : '#dc3545' }),
    statusText: { fontSize: 12, fontWeight: 'bold', color: '#343a40' },
    
    // Error/Footer
    errorBox: { padding: 20, backgroundColor: '#ffebeb', borderRadius: 8, borderWidth: 1, borderColor: '#dc3545', marginBottom: 20 },
    errorText: { color: '#dc3545', fontSize: 15, textAlign: 'center' },
    footerText: { fontSize: 10, color: '#adb5bd', textAlign: 'center', marginTop: 10 },
});

export default StudentHomePage;