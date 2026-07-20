import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GlobalSnackbar } from './src/ui/GlobalSnackbar';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <View style={styles.container}>
          {/* App screens will be rendered here in subsequent tasks */}
          <StatusBar style="auto" />
        </View>
        {/* GlobalSnackbar must be inside PaperProvider — reads useToastStore */}
        <GlobalSnackbar />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
