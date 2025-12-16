import { Lock } from 'lucide-react-native';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';

export const PasswordChangeModal = ({ 
    isVisible, 
    setIsModalVisible, 
    currentPassword, 
    setCurrentPassword, 
    newPassword, 
    setNewPassword, 
    confirmNewPassword, 
    setConfirmNewPassword, 
    handlePasswordChange, 
    isSaving 
}) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => setIsModalVisible(false)}
        >
            <View style={modalStyles.modalOverlay}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalTitle}>Change Password</Text>

                    <TextInput
                        label="Current Password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                        mode="outlined"
                        style={modalStyles.input}
                        left={<TextInput.Icon icon={() => <Lock size={20} color="#64748b" />} />}
                    />
                    <TextInput
                        label="New Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                        mode="outlined"
                        style={modalStyles.input}
                        left={<TextInput.Icon icon={() => <Lock size={20} color="#64748b" />} />}
                    />
                    <TextInput
                        label="Confirm New Password"
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        secureTextEntry
                        mode="outlined"
                        style={modalStyles.input}
                        left={<TextInput.Icon icon={() => <Lock size={20} color="#64748b" />} />}
                    />

                    <View style={modalStyles.buttonContainer}>
                        <Button 
                            mode="outlined" 
                            onPress={() => setIsModalVisible(false)}
                            disabled={isSaving}
                            style={modalStyles.cancelButton}
                        >
                            Cancel
                        </Button>
                        <Button 
                            mode="contained" 
                            onPress={handlePasswordChange}
                            loading={isSaving}
                            disabled={isSaving}
                            style={modalStyles.saveButton}
                            labelStyle={{color: 'white'}}
                        >
                            Save New Password
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#1e293b',
    },
    input: {
        width: '100%',
        marginBottom: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        marginRight: 10,
        borderColor: '#dc3545',
        borderWidth: 1,
    },
    saveButton: {
        flex: 1,
        backgroundColor: '#28a745',
    },
});