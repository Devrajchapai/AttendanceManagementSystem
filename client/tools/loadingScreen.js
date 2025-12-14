import { Modal, StyleSheet, View } from "react-native";
import { WaveIndicator } from "react-native-indicators";

export const LoadingScreen = ({loadingVisibility}) => {
  return (
    <Modal
      transparent={true}
      visible={loadingVisibility}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
          <WaveIndicator color="white" count={7} size={100} waveFactor={0.7} waveMode="fill"/>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.78)", 
    justifyContent: "center",
    alignItems: "center",
  }
});
