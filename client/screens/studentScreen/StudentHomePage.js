import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { Calendar, CheckSquare } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Button, Card } from "react-native-paper";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import checkTokenAvalibility from "../../tools/checkforToken";

const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const BASE_URL = `http://${LOCALHOST}:${SERVERPORT}/student`;

const StudentHomePage = () => {
    const navigation = useNavigation();

    // 1. STATE MANAGEMENT
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [attendanceData, setAttendanceData] = useState(null);
    const [fetchError, setFetchError] = useState(null);
    
    // Attendance Submission State
    const [isAttendanceAvailable, setIsAttendanceAvailable] = useState(false);
    const [attendanceMessage, setAttendanceMessage] = useState('');
    const [activeSubject, setActiveSubject] = useState('');
    const [showModal, setShowModal] = useState(false); 

    // ----------------------------------------------------
    // 2. FETCHING LOGIC
    // ----------------------------------------------------

    // Optimized for frequent calls (doesn't trigger global isLoading)
    const fetchAttendanceStatus = useCallback(async () => {
        const url = `${BASE_URL}/isAttendanceAvailable`;
        const tokenString = await checkTokenAvalibility();
        if (!tokenString) return;

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: { 'Authorization': `Bearer ${tokenString}` }
            });
            const data = await response.json();
            
            setIsAttendanceAvailable(data.attendanceStatus);
            setAttendanceMessage(data.message || 'Attendance is now open.');
            
            if (data.attendanceStatus && data.activeSubject) {
                setActiveSubject(data.activeSubject);
            } else {
                setActiveSubject('');
            }
            setShowModal(data.status)
        } catch (err) {
            console.error("Background Status Fetch Error:", err);
        }
    }, []);

    const fetchAttendanceHistory = useCallback(async () => {
        const url = `${BASE_URL}/attendaceHistory`;
        const tokenString = await checkTokenAvalibility();
        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${tokenString}` }
            });
            if (!response.ok) throw new Error("Failed to fetch history.");
            const data = await response.json();
            setAttendanceData(data.data);
            setShowModal(data.status) 
        } catch (err) {
            setFetchError(err.message);
        }
    }, []);
    
    const loadAllData = useCallback(async () => {
        setIsLoading(true);
        setFetchError(null);
        await Promise.all([
            fetchAttendanceHistory(),
            fetchAttendanceStatus()
        ]);
        setIsLoading(false);
    }, [fetchAttendanceHistory, fetchAttendanceStatus]);

    // ----------------------------------------------------
    // 3. REAL-TIME EFFECT (Every 1 Second)
    // ----------------------------------------------------
    useEffect(() => {
        loadAllData(); // Run once on mount

        // Setup interval for polling every 1000ms (1 second)

        // Cleanup on unmount to prevent memory leaks
       
    }, [fetchAttendanceStatus]);

    const onRefresh = async () => {
        setIsRefreshing(true);
        await loadAllData();
        setIsRefreshing(false);
    };

    // ----------------------------------------------------
    // 4. SUBMISSION LOGIC
    // ----------------------------------------------------
    const handleSubmission = async () => {
    setShowModal(false);
    setIsLoading(true);
    
    try {
        // 1. Get Location Permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            throw new Error("Location permission denied. Please enable it in settings.");
        }
        
        // 2. Get High Accuracy Position
        let location = await Location.getCurrentPositionAsync({ 
            accuracy: Location.Accuracy.High 
        });
        
        const tokenString = await checkTokenAvalibility();
        
        // 3. Send to Backend
        // Note: Sending only latitude/longitude as per your provided backend code
        const response = await fetch(`${BASE_URL}/submitAttendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenString}`
            },
            body: JSON.stringify({
                latitude: location.coords.latitude,   // Match backend key
                longitude: location.coords.longitude // Match backend key
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            // Your backend sends { status: false, message: "..." }
            Alert.alert("Submission Failed", result.message || "Could not mark attendance.");
        } else {
            // Success!
            Alert.alert("Success!", result.message);
            
            // Immediately stop the 1-second interval checks and refresh history
            setIsAttendanceAvailable(false); 
            setActiveSubject('');
            await loadAllData(); 
        }

    } catch (err) {
        console.error("Submission Error:", err);
        Alert.alert("Error", err.message || "Network request failed.");
    } finally {
        setIsLoading(false);
    }
};

    const summary = attendanceData?.summary;
    const subjectDetails = attendanceData?.subjectDetails || [];

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" />
                
                {/* Modal for Submission */}
                <Modal animationType="fade" transparent visible={showModal} onRequestClose={() => setShowModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Confirm Attendance</Text>
                            <Text style={styles.modalText}>Subject: <Text style={{fontWeight: 'bold', color: 'red'}}>{activeSubject}</Text></Text>
                            <Button icon="map-marker-check" mode="contained" onPress={handleSubmission} style={styles.modalSubmitButton}>Mark Now</Button>
                            <Button mode="text" onPress={() => setShowModal(false)}>Cancel</Button>
                        </View>
                    </View>
                </Modal>

                <View style={styles.headerRow}>
                     <Text style={styles.headerTitle}>Student Portal</Text>
                     <Button icon='account-circle-outline' onPress={() => navigation.navigate('StudentProfile')}>Profile</Button>
                </View>

                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
                >
                    {/* REAL-TIME ATTENDANCE BUTTON */}
                    {isAttendanceAvailable && !isLoading && (
                        <Card style={styles.attendanceBanner}>
                            <Text style={styles.attendancePrompt}>{attendanceMessage}</Text>
                            <Button icon="map-marker-check" mode="contained" buttonColor="#28aa46" onPress={() => setShowModal(true)}>
                                Mark Attendance
                            </Button>
                        </Card>
                    )}

                    {(isLoading && !isRefreshing) && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />}

                    {summary && (
                        <Card style={styles.summaryCard}>
                            <Card.Content>
                                <View style={styles.summaryHeader}>
                                    <Text style={styles.summaryTitle}>Overall Attendance</Text>
                                    <View style={styles.percentageCircle}><Text style={styles.percentageText}>{summary.percentage}%</Text></View>
                                </View>
                                <View style={styles.summaryRow}>
                                    <View style={styles.summaryStat}>
                                        <CheckSquare size={20} color="#28a745" />
                                        <Text style={styles.statValue}>{summary.presentDays}</Text>
                                        <Text style={styles.statLabel}>Present</Text>
                                    </View>
                                    <View style={styles.summaryStat}>
                                        <Calendar size={20} color="#6c757d" />
                                        <Text style={styles.statValue}>{summary.workingDays}</Text>
                                        <Text style={styles.statLabel}>Total</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>
                    )}

                    {subjectDetails.length > 0 && (
                        <View>
                            <Text style={styles.historyHeader}>History</Text>
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
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8fafc' },
    scrollContent: { padding: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', padding: 24, borderRadius: 16, width: '85%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
    modalText: { marginBottom: 20, color: '#64748b' },
    modalSubmitButton: { marginBottom: 8 },
    attendanceBanner: { padding: 16, backgroundColor: '#f0fdf4', borderLeftWidth: 4, borderLeftColor: '#22c55e', marginBottom: 20 },
    attendancePrompt: { fontSize: 16, color: '#166534', fontWeight: 'bold', marginBottom: 12 },
    summaryCard: { marginBottom: 24, borderRadius: 16, elevation: 2 },
    summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    summaryTitle: { fontSize: 18, fontWeight: '600' },
    percentageCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center' },
    percentageText: { color: 'white', fontWeight: 'bold', fontSize: 12 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 16 },
    summaryStat: { alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: 'bold' },
    statLabel: { fontSize: 12, color: '#64748b' },
    historyHeader: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
    itemCard: { marginBottom: 8, borderRadius: 12 },
    itemContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemSubject: { fontSize: 16, fontWeight: '500' },
    statusBadge: (isPresent) => ({ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: isPresent ? '#dcfce7' : '#fee2e2' }),
    statusText: { fontSize: 10, fontWeight: 'bold' }
});

export default StudentHomePage;