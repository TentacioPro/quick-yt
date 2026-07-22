import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

export const InfoScreen = () => {
  const theme = useTheme();
  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Info</Text>
      <Text style={[styles.body, { color: theme.colors.outlineVariant }]}>
        Quick‑YT is an editorial‑archive style video indexing app. It lets you ingest YouTube URLs, generate AI‑summaries, and store transcripts.
        \n\nFeatures:
        \n- Video ingestion with language selection
        \n- Indexed registry with status badges
        \n- Drawer navigation for Settings, Video Details, and this Info screen
        \n- Dark‑mode ready with a custom Editorial theme
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontFamily: 'serif', fontSize: 24, fontWeight: '600', marginBottom: 12 },
  body: { fontFamily: 'Inter', fontSize: 14, lineHeight: 20 },
});
