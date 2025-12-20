import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, Card } from 'react-native-paper';

/**
 * AttendanceStarter Component
 * @param {string[]} assignedSubjects - List of subjects assigned to the teacher.
 * @param {function(string): Promise<boolean>} handleTakeAttendance - Function from parent to call the POST API (expects subject).
 */
const AttendanceStarter = ({ assignedSubjects, handleTakeAttendance }) => {
    const [currentSubject, setCurrentSubject] = useState(assignedSubjects.length > 0 ? assignedSubjects[0] : null);
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleStartAttendance = async () => {
        if (!currentSubject) {
            Alert.alert("Error", "Please select a subject to start attendance.");
            return;
        }
        
        setIsLoading(true);

        // Pass only the subject to the parent's API handler
        const success = await handleTakeAttendance(currentSubject);
        
        if (success) {
            setIsAttendanceOpen(true);
        } else {
            setIsAttendanceOpen(false); 
        }

        setIsLoading(false);
    };

    const handleStopAttendance = () => {
        setIsAttendanceOpen(false);
        Alert.alert("Attendance Stopped", "The attendance window has been closed.");
    };

    if (assignedSubjects.length === 0) {
        return (
            <Card style={styles.card}>
                <Card.Content>
                    <Text style={styles.headerText}>Attendance Control</Text>
                    <Text style={styles.noSubjectText}>You are not assigned any subjects. Contact Admin.</Text>
                </Card.Content>
            </Card>
        );
    }

    return (
        <Card style={[styles.card, isAttendanceOpen && styles.cardActive]}>
            <Card.Content>
                <Text style={styles.headerText}>Attendance Control</Text>
                
                {/* Subject Selector */}
                <View style={styles.selectorGroup}>
                    <Text style={styles.label}>Select Subject:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={currentSubject}
                            onValueChange={(itemValue) => setCurrentSubject(itemValue)}
                            style={styles.picker}
                            enabled={!isAttendanceOpen && !isLoading}
                        >
                            {assignedSubjects.map((subject) => (
                                <Picker.Item key={subject} label={subject} value={subject} />
                            ))}
                        </Picker>
                    </View>
                </View>

                {isLoading ? (
                    <View style={styles.loadingContainer}>
                           <ActivityIndicator size="small" color="#2563eb" />
                           <Text style={{color: '#2563eb', marginLeft: 10}}>Starting Session...</Text>
                    </View>
                ) : isAttendanceOpen ? (
                    <>
                        <Text style={styles.statusTextActive}>Session Open for: {currentSubject}</Text>
                        <Button 
                            mode="contained" 
                            onPress={handleStopAttendance} 
                            style={styles.stopButton}
                            labelStyle={{color: 'white'}}
                        >
                           <Text>Stop Attendance Session</Text> 
                        </Button>
                    </>
                ) : (
                    <Button 
                        mode="contained" 
                        onPress={handleStartAttendance} 
                        style={styles.startButton}
                        labelStyle={{color: 'white'}}
                    >
                      <Text>Start Attendance Session</Text> 
                    </Button>
                )}
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        marginBottom: 20,
        elevation: 2,
        borderRadius: 10,
        backgroundColor: 'white',
    },
    cardActive: {
        borderWidth: 2,
        borderColor: '#28a745',
        backgroundColor: '#f0fdf4', // Lighter green for active state
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 10,
    },
    selectorGroup: {
        marginBottom: 10,
        padding: 5,
        backgroundColor: '#f8fafc',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    label: {
        fontSize: 14,
        color: '#64748b',
        paddingLeft: 5,
    },
    pickerContainer: {
        height: 50,
        justifyContent: 'center',
    },
    picker: {
        // Platform specific styling can go here
    },
    noSubjectText: {
        color: '#dc3545',
        textAlign: 'center',
        paddingVertical: 10,
    },
    startButton: {
        backgroundColor: '#2563eb',
        marginTop: 10,
        paddingVertical: 5,
    },
    stopButton: {
        backgroundColor: '#dc3545',
        marginTop: 10,
        paddingVertical: 5,
    },
    statusTextActive: {
        textAlign: 'center',
        color: '#166534',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    loadingContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
    }
});

export default AttendanceStarter;