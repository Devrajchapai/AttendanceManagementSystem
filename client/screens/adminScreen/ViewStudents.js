import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, IconButton, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from "react-native-safe-area-context";
import checkTokenAvalibility from '../../tools/checkforToken';
const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const ADMIN_URL = `http://${LOCALHOST}:${SERVERPORT}/admin`;

const ViewStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(false);
    const [updateLoading, setUpdateLoading] = useState(false);

    const [formData, setFormData] = useState({
        _id: '', username: '', email: '', rollNo: '', symbolNo: '', studentId: '',
        phone: '', gender: '', nationality: '', DOB: '', status: '',
        guardianName: '', fatherName: '', fatherPhone: '', motherName: '',
        motherPhone: '', program: '', admittedBatch: '', currentClass: '',
        assignedSubjects: ''
    });

    const fetchStudents = async () => {
        const token = await checkTokenAvalibility();
        try {
            const response = await fetch(`${ADMIN_URL}/retriveStudents`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setStudents(Array.isArray(data) ? data : []);
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
            const response = await fetch(`${ADMIN_URL}/viewStudentProfile/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            
            // Your API returns the student object inside the "data" key
            const s = result.data; 

            if (s) {
                setFormData({
                    _id: s._id,
                    username: s.username || '',
                    email: s.email || '',
                    rollNo: s.rollNo?.toString() || '',
                    symbolNo: s.symbolNo?.toString() || '',
                    studentId: s.studentId || '',
                    phone: s.phone?.toString() || '',
                    gender: s.gender || '',
                    nationality: s.nationality || '',
                    DOB: s.DOB || '',
                    status: s.status || '',
                    guardianName: s.guardianName || '',
                    fatherName: s.fatherName || '',
                    fatherPhone: s.fatherPhone?.toString() || '',
                    motherName: s.motherName || '', 
                    motherPhone: s.motherPhone?.toString() || '',
                    program: s.program || '',
                    admittedBatch: s.admittedBatch?.toString() || '',
                    currentClass: s.currentClass || '',
                    assignedSubjects: s.assignedSubjects ? s.assignedSubjects.join(', ') : ''
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
        
        const updatedBody = {
            ...formData,
            assignedSubjects: formData.assignedSubjects.split(',').map(s => s.trim()).filter(s => s !== "")
        };

        try {
            const response = await fetch(`${ADMIN_URL}/updateStudentProfile/${formData._id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedBody)
            });

            if (response.ok) {
                setModalVisible(false);
                fetchStudents();
            }
        } catch (error) {
            console.error("Update Error:", error);
        } finally {
            setUpdateLoading(false);
        }
    };

    const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

    useEffect(() => { fetchStudents(); }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {loading ? <ActivityIndicator size="large" color="#2563eb" /> : (
                    <FlatList
                        data={students}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <Card style={styles.card} onPress={() => handleOpenProfile(item._id)}>
                                <Card.Title
                                    title={item.username}
                                    subtitle={`Roll No: ${item.rollNo || 'N/A'}`}
                                    left={(props) => <Avatar.Text {...props} label={item.username.charAt(0)} />}
                                    right={() => <Chip style={styles.statusChip}>{item.status}</Chip>}
                                />
                            </Card>
                        )}
                    />
                )}

                <Modal visible={modalVisible} animationType="slide">
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Update Student</Text>
                            <IconButton icon="close" onPress={() => setModalVisible(false)} />
                        </View>

                        {fetchingProfile ? <ActivityIndicator style={{marginTop: 50}} /> : (
                            <ScrollView contentContainerStyle={styles.formContent}>
                                <TextInput mode="outlined" label="Username" value={formData.username} onChangeText={(v) => updateField('username', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Email" value={formData.email} onChangeText={(v) => updateField('email', v)} style={styles.input} />
                                
                                <View style={styles.row}>
                                    <TextInput mode="outlined" label="Roll No" value={formData.rollNo} onChangeText={(v) => updateField('rollNo', v)} style={[styles.input, {flex: 1, marginRight: 5}]} keyboardType="numeric" />
                                    <TextInput mode="outlined" label="Symbol No" value={formData.symbolNo} onChangeText={(v) => updateField('symbolNo', v)} style={[styles.input, {flex: 1}]} keyboardType="numeric" />
                                </View>

                                <TextInput mode="outlined" label="Student ID" value={formData.studentId} onChangeText={(v) => updateField('studentId', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Phone" value={formData.phone} onChangeText={(v) => updateField('phone', v)} style={styles.input} keyboardType="phone-pad" />
                                <TextInput mode="outlined" label="Gender" value={formData.gender} onChangeText={(v) => updateField('gender', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Nationality" value={formData.nationality} onChangeText={(v) => updateField('nationality', v)} style={styles.input} />
                                <TextInput mode="outlined" label="DOB (YYYY-MM-DD)" value={formData.DOB} onChangeText={(v) => updateField('DOB', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Status" value={formData.status} onChangeText={(v) => updateField('status', v)} style={styles.input} />
                                
                                <TextInput mode="outlined" label="Guardian Name" value={formData.guardianName} onChangeText={(v) => updateField('guardianName', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Father Name" value={formData.fatherName} onChangeText={(v) => updateField('fatherName', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Father Phone" value={formData.fatherPhone} onChangeText={(v) => updateField('fatherPhone', v)} style={styles.input} keyboardType="phone-pad" />
                                <TextInput mode="outlined" label="Mother Name" value={formData.motherName} onChangeText={(v) => updateField('motherName', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Mother Phone" value={formData.motherPhone} onChangeText={(v) => updateField('motherPhone', v)} style={styles.input} keyboardType="phone-pad" />
                                
                                <TextInput mode="outlined" label="Program" value={formData.program} onChangeText={(v) => updateField('program', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Admitted Batch" value={formData.admittedBatch} onChangeText={(v) => updateField('admittedBatch', v)} style={styles.input} keyboardType="numeric" />
                                <TextInput mode="outlined" label="Current Class" value={formData.currentClass} onChangeText={(v) => updateField('currentClass', v)} style={styles.input} />
                                <TextInput mode="outlined" label="Assigned Subjects" value={formData.assignedSubjects} onChangeText={(v) => updateField('assignedSubjects', v)} style={styles.input} multiline />

                                <Button mode="contained" onPress={handleUpdateProfile} loading={updateLoading} style={styles.updateBtn}>
                                   <Text>Save Changes</Text> 
                                </Button>
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
    card: { marginBottom: 10, borderRadius: 10, backgroundColor: 'white' },
    statusChip: { marginRight: 10 },
    modalContainer: { flex: 1, backgroundColor: 'white' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    formContent: { padding: 20, paddingBottom: 50 },
    input: { marginBottom: 12, backgroundColor: 'white' },
    row: { flexDirection: 'row' },
    updateBtn: { marginTop: 20, paddingVertical: 5, backgroundColor: '#2563eb' }
});

export default ViewStudents;