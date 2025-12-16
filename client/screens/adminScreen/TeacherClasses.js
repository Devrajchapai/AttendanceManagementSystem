import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TeacherClasses = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Teacher Classes</Text>
        <Text style={styles.subtitle}>View assigned classes and take attendance here.</Text>
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

export default TeacherClasses;