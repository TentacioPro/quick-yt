import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Telemetry } from '../utils/telemetry';

export const MetricsScreen: React.FC = () => {
  const theme = useTheme();

  useEffect(() => {
    Telemetry.logEvent('MetricsScreen_Viewed');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.header, { color: theme.colors.primary }]}>System Metrics</Text>
        
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Total Videos Indexed</Text>
            <Text variant="displayMedium" style={{ color: theme.colors.primary }}>42</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Storage Used</Text>
            <Text variant="displayMedium" style={{ color: theme.colors.secondary }}>12 MB</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Pending Transcripts</Text>
            <Text variant="displayMedium" style={{ color: theme.colors.error }}>3</Text>
          </Card.Content>
        </Card>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  header: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
});
