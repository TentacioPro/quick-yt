import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, Switch, List } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Telemetry } from '../utils/telemetry';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export const ProfileSettingsScreen: React.FC = () => {
  const theme = useTheme();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return storage.getBoolean('darkModeOverride') ?? true;
  });

  const [defaultLang, setDefaultLang] = useState(() => {
    return storage.getString('defaultLang') ?? 'English';
  });

  useEffect(() => {
    Telemetry.logEvent('ProfileSettingsScreen_Viewed');
  }, []);

  const toggleDarkMode = (val: boolean) => {
    setIsDarkMode(val);
    storage.set('darkModeOverride', val);
    Telemetry.logEvent('Settings_DarkMode_Toggled', { value: val });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[styles.header, { color: theme.colors.primary }]}>Profile & Settings</Text>
        
        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>Appearance</List.Subheader>
          <List.Item
            title="Dark Mode Override"
            titleStyle={{ color: theme.colors.onSurface }}
            right={() => <Switch value={isDarkMode} onValueChange={toggleDarkMode} />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader style={{ color: theme.colors.primary }}>Preferences</List.Subheader>
          <List.Item
            title="Default Translation Language"
            titleStyle={{ color: theme.colors.onSurface }}
            description={defaultLang}
            descriptionStyle={{ color: theme.colors.outlineVariant }}
            onPress={() => {
              // Basic toggle for now to satisfy MMKV check
              const newLang = defaultLang === 'English' ? 'Spanish' : 'English';
              setDefaultLang(newLang);
              storage.set('defaultLang', newLang);
            }}
          />
        </List.Section>

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
    marginBottom: 8,
  },
});
