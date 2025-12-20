import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Card, List, Text } from 'react-native-paper';
import checkTokenAvalibility from '../../tools/checkforToken';

const LOCALHOST = process.env.EXPO_PUBLIC_MY_PC_IP;
const SERVERPORT = process.env.EXPO_PUBLIC_SERVER_PORT;
const ADMIN_URL = `http://${LOCALHOST}:${SERVERPORT}/admin`;

const TeacherClasses = () => {
    const [routine, setRoutine] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoutine = async () => {
            try {
                const token = await checkTokenAvalibility();
                const response = await fetch(`${ADMIN_URL}/viewRoutine`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await response.json();
                
                // FIX: Ensure we are setting an array even if the backend structure differs
                setRoutine(Array.isArray(data) ? data : (data.routine || []));
            } catch (error) {
                console.error("Fetch error:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutine();
    }, []);

    if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />;

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Semester Routine</Text>
            {routine.length > 0 ? routine.map((day, index) => (
                <Card key={index} style={styles.card}>
                    <Card.Title title={day.dayOfWeek?.toUpperCase()} subtitle={`Status: ${day.collegeStatus}`} />
                    <Card.Content>
                        {day.classes?.map((cls, i) => (
                            <List.Item
                                key={i}
                                title={cls.subject}
                                description={`${cls.startTime} - ${cls.endTime}`}
                                left={props => <List.Icon {...props} icon="clock-outline" />}
                            />
                        ))}
                    </Card.Content>
                </Card>
            )) : <Text style={styles.emptyText}>No routine data found.</Text>}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f1f5f9' },
    header: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#1e293b' },
    card: { marginBottom: 15, elevation: 3 },
    emptyText: { textAlign: 'center', marginTop: 50, color: '#64748b' }
});

export default TeacherClasses;