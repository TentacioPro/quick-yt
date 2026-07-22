import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, useTheme } from 'react-native-paper';

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  status: 'pending' | 'processing' | 'complete';
}

export const InsightBlock: React.FC<{ title: string; content: string }> = ({ title, content }) => {
  const theme = useTheme();
  return (
    <View style={[styles.insightBlock, { borderLeftColor: theme.colors.primary }]}>
      <Text style={[styles.insightTitle, { color: theme.colors.primary }]}>{title}</Text>
      <Text style={styles.insightContent}>{content}</Text>
    </View>
  );
};

export const DashboardScreen: React.FC<any> = (props) => {
  const { videoList, syncStatus, lastSynced, onSync, onIngest } = props;
  const theme = useTheme() as typeof import('./Theme').EditorialTheme;
  const [url, setUrl] = useState('');
  const [selectedLang, setSelectedLang] = useState('en');

  const handleIngest = () => {
    if (url.trim()) {
      onIngest(url, selectedLang);
      setUrl('');
    }
  };

  const getStatusStyle = (status: VideoItem['status']) => {
    switch (status) {
      case 'complete':
        return { color: '#4edea3', text: 'ARCHIVED' };
      case 'processing':
        return { color: '#e5ba73', text: 'INDEXING' };
      default:
        return { color: '#a0a0a0', text: 'QUEUED' };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView style={[styles.container, { backgroundColor: theme.colors.background, padding: 24 }]}>
        {/* 1. Bento Grid Section: Video Ingestion */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface_container }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Document Ingestion</Text>
          {/* URL Input */}
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface_container_lowest }]}>
            <TextInput
              style={[styles.input, { color: theme.colors.onSurface }]}
              placeholder="Enter YouTube Video URL..."
              placeholderTextColor={theme.colors.outlineVariant}
              value={url}
              onChangeText={setUrl}
            />
          </View>
          {/* Language Select */}
          <Text style={[styles.label, { color: theme.colors.outlineVariant }]}>Select Translation Key</Text>
          <View style={styles.langContainer}>
            {['en', 'es', 'fr', 'de'].map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.langChip,
                  {
                    backgroundColor: selectedLang === lang ? theme.colors.primaryContainer : theme.colors.surface_container_low,
                  },
                ]}
                onPress={() => setSelectedLang(lang)}
              >
                <Text
                  style={[
                    styles.langChipText,
                    {
                      color: selectedLang === lang ? theme.colors.onPrimaryContainer : theme.colors.onSurface,
                    },
                  ]}
                >
                  {lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button
            mode="contained"
            onPress={handleIngest}
            buttonColor={theme.colors.primary}
            textColor={theme.colors.onPrimary}
            style={styles.ingestButton}
            labelStyle={styles.buttonLabel}
          >
            Add to Index
          </Button>
        </View>
        {/* 2. List component for uploaded links */}
        <View style={[styles.sectionCard, { backgroundColor: theme.colors.surface_container }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Indexed Registry</Text>
          {videoList.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.colors.outlineVariant }]}>No indexed documents found.</Text>
          ) : (
            videoList.map((item) => {
              const statusConfig = getStatusStyle(item.status);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.listItem, { backgroundColor: theme.colors.surface_container_low }]}
                  onPress={() => {
                    const nav = (props as any).navigation;
                    if (nav) nav.navigate('VideoDetail', { video: item });
                  }}
                >
                  <View style={styles.listItemHeader}>
                    <Text style={[styles.listItemTitle, { color: theme.colors.onSurface }]}>{item.title}</Text>
                    <Text style={[styles.statusBadge, { color: statusConfig.color }]}>{statusConfig.text}</Text>
                  </View>
                  <Text style={[styles.listItemUrl, { color: theme.colors.outlineVariant }]}>{item.url}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        {/* 3. Insight Block */}
        <InsightBlock
          title="Archivist Notes"
          content="This monorepo registry indexes video transcriptions, generates markdown logs via Gemini generative processing, and stores snapshots under grandfather-father-son versioning."
        />
        {/* 4. Primary Sync Action Button */}
        <Button
          mode="contained"
          onPress={onSync}
          buttonColor={theme.colors.primaryContainer}
          textColor={theme.colors.onPrimaryContainer}
          style={styles.syncButton}
          labelStyle={styles.buttonLabel}
        >
          Sync Registry with Remote Host
        </Button>
        {/* Bottom spacing */}
        <View style={{ height: 48 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionCard: {
    padding: 20,
    borderRadius: 4,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputContainer: {
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  input: {
    fontFamily: 'Inter',
    fontSize: 14,
    padding: 0,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  langContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  langChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  langChipText: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '700',
  },
  ingestButton: {
    borderRadius: 4,
    marginTop: 8,
  },
  buttonLabel: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontStyle: 'italic',
  },
  listItem: {
    padding: 16,
    borderRadius: 4,
    marginBottom: 12,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  listItemTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    fontFamily: 'Inter',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  listItemUrl: {
    fontFamily: 'Inter',
    fontSize: 12,
  },
  insightBlock: {
    borderLeftWidth: 2,
    paddingLeft: 16,
    marginVertical: 8,
    marginBottom: 20,
  },
  insightTitle: {
    fontFamily: 'serif',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightContent: {
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    color: '#c2c6d6',
  },
  syncButton: {
    borderRadius: 4,
    marginVertical: 12,
  },
});

export default DashboardScreen;
