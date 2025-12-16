import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, Title } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const AdminProfile = () => {
    // Replace with actual data fetch from /admin/profile
    const adminData = {
        username: 'Main Administrator',
        email: 'admin@college.edu',
        role: 'Admin',
        collegeName: 'Tech University',
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Title style={styles.title}>My Profile</Title>
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Username:</Text>
                            <Text style={styles.value}>{adminData.username}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.value}>{adminData.email}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Role:</Text>
                            <Text style={[styles.value, styles.roleBadge]}>{adminData.role}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Institution:</Text>
                            <Text style={styles.value}>{adminData.collegeName}</Text>
                        </View>
                        {/* Placeholder for Password Change Button, similar to StudentProfile.js */}
                    </Card.Content>
                </Card>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f1f5f9',
    },
    container: {
        flex: 1,
        padding: 15,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 20,
    },
    card: {
        elevation: 2,
        borderRadius: 8,
        backgroundColor: 'white',
        paddingVertical: 10,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
    },
    label: {
        fontSize: 16,
        color: '#64748b',
    },
    value: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1e293b',
    },
    roleBadge: {
        color: '#2563eb',
    }
});

export default AdminProfile;