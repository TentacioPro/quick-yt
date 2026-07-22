import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, useTheme, DataTable } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Telemetry } from '../utils/telemetry';
// TODO: Hook up actual SQLite queries later

const MOCK_LOGS = [
  { id: '1', action: 'Video Ingested', status: 'SUCCESS', timestamp: '10:00 AM' },
  { id: '2', action: 'API Sync', status: 'ERROR', timestamp: '10:05 AM' },
];

export const LogsGridScreen: React.FC = () => {
  const theme = useTheme();

  useEffect(() => {
    Telemetry.logEvent('LogsGridScreen_Viewed');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <View style={styles.container}>
        <Text style={[styles.header, { color: theme.colors.primary }]}>Audit Logs</Text>
        
        <DataTable style={{ backgroundColor: theme.colors.surface }}>
          <DataTable.Header>
            <DataTable.Title textStyle={{ color: theme.colors.onSurface }}>Action</DataTable.Title>
            <DataTable.Title textStyle={{ color: theme.colors.onSurface }}>Status</DataTable.Title>
            <DataTable.Title numeric textStyle={{ color: theme.colors.onSurface }}>Timestamp</DataTable.Title>
          </DataTable.Header>

          {MOCK_LOGS.map((log) => (
            <DataTable.Row key={log.id}>
              <DataTable.Cell textStyle={{ color: theme.colors.onSurface }}>{log.action}</DataTable.Cell>
              <DataTable.Cell textStyle={{ color: log.status === 'ERROR' ? theme.colors.error : theme.colors.primary }}>{log.status}</DataTable.Cell>
              <DataTable.Cell numeric textStyle={{ color: theme.colors.outlineVariant }}>{log.timestamp}</DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
