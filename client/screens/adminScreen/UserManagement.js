import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Divider, RadioButton, TextInput, Title } from 'react-native-paper';

const UserManagement = () => {
    const [userType, setUserType] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [statusId, setStatusId] = useState('');
    const [newStatus, setNewStatus] = useState('active');

    // Placeholder for API calls (replace with actual logic)
    const handleRegistration = () => {
        Alert.alert('Register User', `Registering ${userType} ${username} with email ${email}`);
        // Implement POST /admin/registerStudent or /admin/registerTeacher
    };

    const handleStatusUpdate = () => {
        Alert.alert('Update Status', `Updating user ID ${statusId} to ${newStatus}`);
        // Implement PATCH /admin/updateStudentStatus/:userId (or for teacher)
    };

    return (
        <ScrollView style={styles.container}>
            
            {/* 1. Register New User */}
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Register New User</Title>
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
                    
                    <Button mode="contained" onPress={handleRegistration} style={styles.button} labelStyle={{color: 'white'}}>
                        Register {userType.charAt(0).toUpperCase() + userType.slice(1)}
                    </Button>
                </Card.Content>
            </Card>

            <Divider style={styles.divider} />

            {/* 2. Update Student/Teacher Status */}
            <Card style={styles.card}>
                <Card.Content>
                    <Title style={styles.cardTitle}>Update Account Status</Title>
                    <TextInput label="User ID (Student/Teacher ID)" value={statusId} onChangeText={setStatusId} mode="outlined" style={styles.input} />
                    
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

                    <Button mode="contained" onPress={handleStatusUpdate} style={styles.button} labelStyle={{color: 'white'}}>
                        Update Status
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
    radioGroup: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 10,
    },
    radioItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    button: {
        marginTop: 15,
        backgroundColor: '#2563eb',
        paddingVertical: 5,
    },
    divider: {
        marginVertical: 20,
        height: 1,
        backgroundColor: '#cbd5e1',
    }
});

export default UserManagement;