import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme, Button } from 'react-native-paper';

export interface VideoDetailProps {
  video: {
    id: string;
    title: string;
    url: string;
    status: 'pending' | 'processing' | 'complete';
    transcript?: string;
    summary?: string;
  };
  onReIngest?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
}

export const VideoDetailScreen: React.FC<any> = (props) => {
  const theme = useTheme();
  
  // Extract video from route.params if navigated via React Navigation, or fallback to props
  const video = props.video || props.route?.params?.video;
  const { onReIngest, onDelete, onShare } = props;

  if (!video) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.colors.onSurface }}>No video selected.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} contentContainerStyle={{ padding: 16 }}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>{video.title}</Text>
      <Text style={[styles.url, { color: theme.colors.outlineVariant }]}>{video.url}</Text>
      {video.transcript && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Full Transcript</Text>
          <Text style={[styles.body, { color: theme.colors.onSurface }]}>{video.transcript}</Text>
        </View>
      )}
      {video.summary && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>AI Summary</Text>
          <Text style={[styles.body, { color: theme.colors.onSurface }]}>{video.summary}</Text>
        </View>
      )}
      <View style={styles.actions}>
        <Button mode="contained" onPress={onReIngest} style={styles.actionBtn} buttonColor={theme.colors.primary}>Re‑Ingest</Button>
        <Button mode="contained" onPress={onDelete} style={styles.actionBtn} buttonColor={theme.colors.error}>Delete</Button>
        <Button mode="contained" onPress={onShare} style={styles.actionBtn} buttonColor={theme.colors.secondary}>Share</Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontFamily: 'serif', fontSize: 20, fontWeight: '600', marginBottom: 8 },
  url: { fontFamily: 'Inter', fontSize: 14, marginBottom: 12 },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: 'serif', fontSize: 16, fontWeight: '500', marginBottom: 4 },
  body: { fontFamily: 'Inter', fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24 },
  actionBtn: { flex: 1, marginHorizontal: 4 },
});
