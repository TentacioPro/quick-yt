import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, TextInput, Switch, Button } from 'react-native-paper';
import { EditorialTheme } from './Theme';

export const SettingsScreen = () => {
  const theme = useTheme() as typeof EditorialTheme;
  const [apiKey, setApiKey] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.onSurface }]}>Settings</Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>API Key</Text>
        <TextInput
          mode="outlined"
          placeholder="Enter Gemini API Key"
          value={apiKey}
          onChangeText={setApiKey}
          style={styles.input}
          outlineColor={theme.colors.outline}
          activeOutlineColor={theme.colors.primary}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Language Preference</Text>
        <Button mode="outlined" onPress={() => {}} textColor={theme.colors.primary}>EN</Button>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>Dark Theme</Text>
        <Switch
          value={isDarkTheme}
          onValueChange={setIsDarkTheme}
          color={theme.colors.primary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
});
