import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, IconButton, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import checkTokenAvalibility from '../../tools/checkforToken';
const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const ADMIN_URL = `http://${LOCALHOST}:${SERVERPORT}/admin`;

const ViewTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

    // State for the requested 7 fields
    const [formData, setFormData] = useState({
        _id: '',
        username: '',
        email: '',
        teacherId: '',
        status: '',
        mobileNumber: '',
        department: '',
        assignedSubjects: '' // Will handle as comma-separated string in UI
    });

    const fetchTeachers = async () => {
        const token = await checkTokenAvalibility();
        try {
            const response = await fetch(`${ADMIN_URL}/retriveTeachers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setTeachers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("List Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenProfile = async (id) => {
        setModalVisible(true);
        setFetchingProfile(true);
        const token = await checkTokenAvalibility();
        try {
            const response = await fetch(`${ADMIN_URL}/viewTeacherProfile/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            
            // Accessing nested data: result.user or result.data based on your API structure
            const t = result.user || result.data; 

            if (t) {
                setFormData({
                    _id: t._id,
                    username: t.username || '',
                    email: t.email || '',
                    teacherId: t.teacherId || '',
                    status: t.status || '',
                    mobileNumber: t.mobileNumber?.toString() || '',
                    department: t.department || '',
                    assignedSubjects: t.assignedSubjects ? t.assignedSubjects.join(', ') : ''
                });
            }
        } catch (error) {
            console.error("Profile Fetch Error:", error);
        } finally {
            setFetchingProfile(false);
        }
    };

    const handleUpdateProfile = async () => {
        setUpdateLoading(true);
        const token = await checkTokenAvalibility();
        
        // Convert comma string back to array for backend
        const updatedBody = {
            ...formData,
            assignedSubjects: formData.assignedSubjects.split(',').map(s => s.trim()).filter(s => s !== "")
        };

        try {
            const response = await fetch(`${ADMIN_URL}/updateTeacherProfile/${formData._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedBody)
            });

            if (response.ok) {
                setModalVisible(false);
                fetchTeachers(); // Refresh list
            }
        } catch (error) {
            console.error("Update Error:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    useEffect(() => { fetchTeachers(); }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {loading ? <ActivityIndicator size="large" color="#2563eb" /> : (
                    <FlatList
                        data={teachers}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <Card style={styles.card} onPress={() => handleOpenProfile(item._id)}>
                                <Card.Title
                                    title={item.username}
                                    subtitle={item.department || "General"}
                                    left={(props) => <Avatar.Icon {...props} icon="account-tie" />}
                                    right={() => <Chip style={styles.statusChip}>{item.status || 'Active'}</Chip>}
                                />
                            </Card>
                        )}
                    />
                )}

                <Modal visible={modalVisible} animationType="slide">
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Teacher</Text>
                            <IconButton icon="close" onPress={() => setModalVisible(false)} />
                        </View>

                        {fetchingProfile ? <ActivityIndicator style={{marginTop: 50}} /> : (
                            <ScrollView contentContainerStyle={styles.formContent}>
                                <TextInput mode="outlined" label="Username" value={formData.username} onChangeText={(v) => updateField('username', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Email" value={formData.email} onChangeText={(v) => updateField('email', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Teacher ID" value={formData.teacherId} onChangeText={(v) => updateField('teacherId', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Mobile Number" value={formData.mobileNumber} onChangeText={(v) => updateField('mobileNumber', v)} style={styles.input} keyboardType="phone-pad" />
                                <TextInput mode="outlined" label="Department" value={formData.department} onChangeText={(v) => updateField('department', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Status (active/inactive)" value={formData.status} onChangeText={(v) => updateField('status', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Assigned Subjects (comma separated)" value={formData.assignedSubjects} onChangeText={(v) => updateField('assignedSubjects', v)} style={styles.input} multiline />

                                <Button mode="contained" onPress={handleUpdateProfile} loading={updateLoading} style={styles.updateBtn}>
                                    <Text>Update Profile</Text>
                                </Button>
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        )}
                    </SafeAreaView>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8fafc' },
    container: { flex: 1, padding: 10 },
    card: { marginBottom: 10, backgroundColor: 'white' },
    statusChip: { marginRight: 10 },
    modalContainer: { flex: 1, backgroundColor: 'white' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    formContent: { padding: 20 },
    input: { marginBottom: 15, backgroundColor: 'white' },
    updateBtn: { marginTop: 10, backgroundColor: '#2563eb', paddingVertical: 5 }
});

export default ViewTeachers;