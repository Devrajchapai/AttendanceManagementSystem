import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, TextInput, Title } from 'react-native-paper';

const ConfigManagement = () => {
    // 1. Location State
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [range, setRange] = useState('');

    // 2. Course State
    const [courseName, setCourseName] = useState('');

    // 3. Routine State (Simplified for a single update field)
    const [routineData, setRoutineData] = useState('');

    const handleLocationUpdate = () => {
        // Implement POST /admin/updateCollegeLocation
        Alert.alert('Location Updated', `Lat: ${latitude}, Lon: ${longitude}, Range: ${range} km`);
    };

    const handleCourseUpdate = () => {
        // Implement PATCH /admin/updateCourses
        Alert.alert('Course Added', `Added course: ${courseName}`);
    };

    const handleRoutineUpdate = () => {
        // Implement POST /admin/updateSemesterRoutine
        Alert.alert('Routine Update', 'Routine data uploaded/updated successfully.');
    };

    return (
        <ScrollView style={styles.container}>
            
            {/* 1. College Location & Geofencing */}
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>College Location (Geofencing)</Title>
                    <TextInput label="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numeric" mode="outlined" style={styles.input} />
                    <TextInput label="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numeric" mode="outlined" style={styles.input} />
                    <TextInput label="Geofence Range (in km)" value={range} onChangeText={setRange} keyboardType="numeric" mode="outlined" style={styles.input} />
                    
                    <Button mode="contained" onPress={handleLocationUpdate} style={styles.button} labelStyle={{color: 'white'}}>
                        Update Location
                    </Button>
                </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* 2. Course Management */}
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Course Management</Title>
                    <TextInput label="New Course Name (e.g., Mobile Computing)" value={courseName} onChangeText={setCourseName} mode="outlined" style={styles.input} />
                    <Button mode="contained" onPress={handleCourseUpdate} style={styles.button} labelStyle={{color: 'white'}}>
                        Add/Update Course
                    </Button>
                    <Button mode="outlined" onPress={() => Alert.alert('View Courses', 'Navigate to course list view')} style={[styles.button, {marginTop: 10}]} labelStyle={{color: '#2563eb'}}>
                        View/Delete Courses
                    </Button>
                </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* 3. Routine Management */}
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Class Routine Update</Title>
                    <TextInput label="Routine Data (e.g., JSON/file upload)" value={routineData} onChangeText={setRoutineData} mode="outlined" multiline style={styles.input} />
                    <Button mode="contained" onPress={handleRoutineUpdate} style={styles.button} labelStyle={{color: 'white'}}>
                        Update Routine
                    </Button>
                </Card.Content>
            </Card>
            <View style={{height: 50}} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: '#f1f5f9',
    },
    card: {
        marginBottom: 20,
        elevation: 2,
        borderRadius: 8,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 15,
    },
    input: {
        marginBottom: 10,
        backgroundColor: 'white',
    },
    button: {
        marginTop: 10,
        backgroundColor: '#2563eb',
        paddingVertical: 5,
    },
    divider: {
        marginVertical: 20,
        height: 1,
        backgroundColor: '#cbd5e1',
    }
});

export default ConfigManagement;