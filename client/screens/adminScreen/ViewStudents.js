import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ViewStudents = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>View Students</Text>
        <Text style={styles.subtitle}>List and management of all student accounts.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f1f5f9' },
    container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#1e293b' },
    subtitle: { fontSize: 16, color: '#64748b' },
});

export default ViewStudents;