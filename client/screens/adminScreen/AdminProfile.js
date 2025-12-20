import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import checkTokenAvalibility from '../../tools/checkforToken';

const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const ADMIN_URL = `http://${LOCALHOST}:${SERVERPORT}/admin`;

const AdminProfile = () => {
    const [adminData, setAdminData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = await checkTokenAvalibility();
                if (!token) return;

                // Note: Ensure your backend has a route for /profile or similar logic 
                // typically found in your admin controller
                const response = await fetch(`${ADMIN_URL}/viewAdminProfile`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                // If your backend returns { user: {...} }, use data.user
                setAdminData(data.user || data); 
            } catch (error) {
                console.error("Error fetching admin profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.container}>
                <Text style={styles.title}>My Profile</Text>
                <Card style={styles.card}>
                    <Card.Content>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Username:</Text>
                            <Text style={styles.value}>{adminData?.username || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.value}>{adminData?.email || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Role:</Text>
                            <Text style={[styles.value, styles.roleBadge]}>{adminData?.role || 'Admin'}</Text>
                        </View>
                        {adminData?.collegeName && (
                            <View style={styles.infoRow}>
                                <Text style={styles.label}>Institution:</Text>
                                <Text style={styles.value}>{adminData.collegeName}</Text>
                            </View>
                        )}
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
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
        paddingVertical: 15,
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
        textTransform: 'capitalize',
        marginRight: 10,
    }
});

export default AdminProfile;