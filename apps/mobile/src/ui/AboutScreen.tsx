import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';

export const AboutScreen = () => {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background } ]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>About QuickYT</Text>
      <Text style={[styles.body, { color: theme.colors.outlineVariant }]}>This app demonstrates the Editorial Archive design system.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: 'serif', // Newsreader/EB Garamond fallback
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    fontFamily: 'Inter',
    fontSize: 14,
  },
});
