import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Divider, RadioButton, TextInput } from 'react-native-paper';
import checkTokenAvalibility from '../../tools/checkforToken';

const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP; 
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const ADMIN_URL = `http://${LOCALHOST}:${SERVERPORT}/admin`;

const UserManagement = () => {
    const [userType, setUserType] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [statusId, setStatusId] = useState('');
    const [newStatus, setNewStatus] = useState('active');
    const [loading, setLoading] = useState(false);

    // 1. Handle Registration Logic
    const handleRegistration = async () => {
        if (!username || !email || !password) {
            Alert.alert("Error", "Please fill all fields");
            return;
        }

        const token = await checkTokenAvalibility();
        if (!token) {return};

        setLoading(true);
        const endpoint = userType === 'student' ? '/registerStudent' : '/registerTeacher';
        
        try {
            const response = await fetch(`${ADMIN_URL}${endpoint}`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username,
                    email, 
                    password, 
                    role: userType
                }),
            });

            // Parse response as JSON
            const data = await response.json();

            if (response.ok) {
                // Accessing the .message property from your backend res.json
                Alert.alert("Success", data.message || "Account created successfully");
                setUsername('');
                setEmail('');
                setPassword('');
            } else {
                // Error cases (e.g., 400 or 500 status codes)
                Alert.alert("Registration Failed", data.message || "Something went wrong");
            }
        } catch (err) {
            Alert.alert("Network Error", "Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle Status Update Logic
    const handleStatusUpdate = async () => {
        if (!statusId) {
            Alert.alert("Error", "Please enter a User ID");
            return;
        }

        const token = await checkTokenAvalibility();
        if (!token) return;

        setLoading(true);
        try {
            const response = await fetch(`${ADMIN_URL}/updateStudentStatus/${statusId}`, {
                method: "PATCH",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ updatedStatus: newStatus }),
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert("Success", data.message || "Status updated successfully");
                setStatusId('');
            } else {
                Alert.alert("Update Failed", data.message || "Could not update status");
            }
        } catch (err) {
            Alert.alert("Network Error", "Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            {/* 1. Register New User Section */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Register New User</Text>
                    <View style={styles.radioGroup}>
                        <RadioButton.Group onValueChange={newValue => setUserType(newValue)} value={userType}>
                            <View style={styles.radioItem}>
                                <Text>Student</Text>
                                <RadioButton value="student" color="#2563eb" />
                            </View>
                            <View style={styles.radioItem}>
                                <Text>Teacher</Text>
                                <RadioButton value="teacher" color="#2563eb" />
                            </View>
                        </RadioButton.Group>
                    </View>
                    
                    <TextInput label="Username" value={username} onChangeText={setUsername} mode="outlined" style={styles.input} />
                    <TextInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" mode="outlined" style={styles.input} />
                    <TextInput label="Temporary Password" value={password} onChangeText={setPassword} secureTextEntry mode="outlined" style={styles.input} />
                    
                    <Button 
                        mode="contained" 
                        onPress={handleRegistration} 
                        style={styles.button} 
                        loading={loading}
                        disabled={loading}
                    >
                        <Text style={{color: 'white'}}>Register {userType.charAt(0).toUpperCase() + userType.slice(1)}</Text>
                    </Button>
                </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* 2. Update Student Status Section */}
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.cardTitle}>Update Student Account Status</Text>
                    <TextInput 
                        label="Student MongoDB ID" 
                        placeholder="Paste ID here..."
                        value={statusId} 
                        onChangeText={setStatusId} 
                        mode="outlined" 
                        style={styles.input} 
                    />
                    
                    <View style={styles.radioGroup}>
                        <RadioButton.Group onValueChange={newValue => setNewStatus(newValue)} value={newStatus}>
                            <View style={styles.radioItem}>
                                <Text>Active</Text>
                                <RadioButton value="active" color="#28a745" />
                            </View>
                            <View style={styles.radioItem}>
                                <Text>Disable</Text>
                                <RadioButton value="disable" color="#dc3545" />
                            </View>
                        </RadioButton.Group>
                    </View>

                    <Button 
                        mode="contained" 
                        onPress={handleStatusUpdate} 
                        style={styles.button} 
                        loading={loading}
                        disabled={loading}
                    >
                        <Text style={{color: 'white'}}>Update Status</Text>
                    </Button>
                </Card.Content>
            </Card>
            <View style={{height: 50}} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f1f5f9' },
    card: { marginBottom: 20, elevation: 2, borderRadius: 8 },
    cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b', marginBottom: 15 },
    input: { marginBottom: 10, backgroundColor: 'white' },
    radioGroup: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10 },
    radioItem: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
    button: { marginTop: 15, backgroundColor: '#2563eb', paddingVertical: 5 },
    divider: { marginVertical: 20, height: 1, backgroundColor: '#cbd5e1' }
});

export default UserManagement;