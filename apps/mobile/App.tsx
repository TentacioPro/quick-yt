import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GlobalSnackbar } from './src/ui/GlobalSnackbar';
import { EditorialTheme } from './src/ui/Theme';
import { Navigation } from './src/Navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={EditorialTheme}>
        <Navigation />
        <GlobalSnackbar />
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});
