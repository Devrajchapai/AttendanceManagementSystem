import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, IconButton, List, Text, TextInput } from 'react-native-paper';
import checkTokenAvalibility from '../../tools/checkforToken';

const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const ADMIN_URL = `http://${LOCALHOST}:${SERVERPORT}/admin`;

const ConfigManagement = () => {
    // 1. Location State
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [range, setRange] = useState('');
    const [locLoading, setLocLoading] = useState(false);

    // 2. Course State
    const [courseName, setCourseName] = useState('');
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(false);

    // 3. Routine State
    const [routineData, setRoutineData] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    // --- LOCATION LOGIC ---
    const getCurrentLocation = async () => {
        setLocLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Permission to access location was denied');
            setLocLoading(false);
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLatitude(location.coords.latitude.toString());
        setLongitude(location.coords.longitude.toString());
        setLocLoading(false);
    };

    const handleLocationUpdate = async () => {
        const token = await checkTokenAvalibility();
        if (!token) return;

        try {
            const response = await fetch(`${ADMIN_URL}/updateCollegeLocation`, {
                method: "POST",
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: parseFloat(latitude), longitude: parseFloat(longitude), range: parseFloat(range) }),
            });
            const data = await response.text();
            if (response.ok) Alert.alert("Success", "Location updated successfully");
            else Alert.alert("Error", data);
        } catch (err) { Alert.alert("Error", "Server connection failed"); }
    };

    // --- COURSE LOGIC ---
    const fetchCourses = async () => {
        setLoadingCourses(true);
        const token = await checkTokenAvalibility();
        try {
            const response = await fetch(`${ADMIN_URL}/viewCourses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const {data} = await response.json();
            setCourses(data.availableCourses || []);
        } catch (err) { console.error(err); }
        setLoadingCourses(false);
    };

    const handleAddCourse = async () => {
    if (!courseName) return Alert.alert("Error", "Enter course name");
    const token = await checkTokenAvalibility();
    try {
        const response = await fetch(`${ADMIN_URL}/updateCourses`, {
            method: "PATCH",
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            // FIX: Backend expects 'listofCourses' as an array
            body: JSON.stringify({ listofCourses: [courseName] }), 
        });

        if (response.ok) {
            setCourseName('');
            fetchCourses();
            Alert.alert("Success", "Course added successfully");
        } else {
            const errorText = await response.text();
            Alert.alert("Error", errorText);
        }
    } catch (err) { 
        Alert.alert("Error", "Failed to add course"); 
    }
};

    const handleDeleteCourse = async (name) => {
    const token = await checkTokenAvalibility();
    try {
        const response = await fetch(`${ADMIN_URL}/deleteCourses`, {
            method: "DELETE",
            headers: { 
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json' 
            },
            // FIX: Backend expects 'courseToRemove' as an array
            body: JSON.stringify({ courseToRemove: [name] }), 
        });

        if (response.ok) {
            Alert.alert("Deleted", `${name} removed`);
            fetchCourses(); // Refresh the list
        } else {
            const errorText = await response.text();
            Alert.alert("Error", errorText);
        }
    } catch (err) { 
        Alert.alert("Error", "Failed to delete course"); 
    }
};
    return (
        <ScrollView style={styles.container}>
            {/* 1. College Location */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>College Location (Geofencing)</Text>
                    <Button 
                        icon="crosshairs-gps" 
                        mode="outlined" 
                        onPress={getCurrentLocation} 
                        loading={locLoading}
                        style={{ marginBottom: 10 }}
                    >
                       <Text>Get Current Location</Text>
                    </Button>
                    <TextInput label="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numeric" mode="outlined" style={styles.input} />
                    <TextInput label="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numeric" mode="outlined" style={styles.input} />
                    <TextInput label="Geofence Range (meters)" value={range} onChangeText={setRange} keyboardType="numeric" mode="outlined" style={styles.input} />
                    
                    <Button mode="contained" onPress={handleLocationUpdate} style={styles.button}>
                       <Text>Update Location</Text> 
                    </Button>
                </Card.Content>
            </Card>

            {/* 2. Course Management */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Course Management</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                        <TextInput 
                            label="New Course" 
                            value={courseName} 
                            onChangeText={setCourseName} 
                            mode="outlined" 
                            style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                        />
                        <IconButton icon="plus-box" size={40} iconColor="#2563eb" onPress={handleAddCourse} />
                    </View>

                    <Text style={styles.subTitle}>Existing Courses:</Text>
                    {loadingCourses ? <ActivityIndicator color="#2563eb" /> : (
                        courses.map((item, index) => (
                            <List.Item
                                key={index}
                                title={item}
                                right={props => <IconButton {...props} icon="delete" iconColor="#dc3545" onPress={() => handleDeleteCourse(item)} />}
                                style={styles.listItem}
                            />
                        ))
                    )}
                </Card.Content>
            </Card>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f1f5f9' },
    card: { marginBottom: 20, elevation: 2, borderRadius: 8 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
    subTitle: { fontSize: 14, fontWeight: '700', color: '#64748b', marginTop: 10 },
    input: { marginBottom: 10, backgroundColor: 'white' },
    button: { marginTop: 10, backgroundColor: '#2563eb' },
    listItem: { backgroundColor: '#fff', marginVertical: 2, borderRadius: 5, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }
});

export default ConfigManagement;