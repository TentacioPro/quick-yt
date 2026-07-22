import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DashboardScreen, type VideoItem } from './ui/DashboardScreen';
import { SettingsScreen } from './ui/SettingsScreen';
import { InfoScreen } from './ui/InfoScreen';
import { VideoDetailScreen } from './ui/VideoDetailScreen';
import { useTheme } from 'react-native-paper';

const Drawer = createDrawerNavigator();

export const Navigation = () => {
  const theme = useTheme();
  
  // Mock data – replace with real store later
  const mockVideos: VideoItem[] = [
    { id: '1', title: 'Sample Video 1', url: 'https://youtu.be/xyz1', status: 'complete' },
    { id: '2', title: 'Sample Video 2', url: 'https://youtu.be/xyz2', status: 'processing' },
    { id: '3', title: 'Sample Video 3', url: 'https://youtu.be/xyz3', status: 'pending' },
  ];

  const handleSync = () => {
    console.log('Sync action triggered');
  };
  
  const handleIngest = (url: string, lang: string) => {
    console.log('Ingest request:', url, lang);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={{ ...DarkTheme, colors: { ...DarkTheme.colors, background: theme.colors.background } }}>
        <Drawer.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTintColor: theme.colors.onSurface,
            drawerStyle: { backgroundColor: theme.colors.surface_container },
            drawerActiveTintColor: theme.colors.primary,
            drawerInactiveTintColor: theme.colors.onSurface,
          }}
        >
          <Drawer.Screen name="Dashboard">
            {() => (
              <DashboardScreen
                videoList={mockVideos}
                syncStatus="Connected"
                lastSynced={new Date().toLocaleTimeString()}
                onSync={handleSync}
                onIngest={handleIngest}
              />
            )}
          </Drawer.Screen>
          <Drawer.Screen name="VideoDetail" component={VideoDetailScreen} />
          <Drawer.Screen name="Settings" component={SettingsScreen} />
          <Drawer.Screen name="Info" component={InfoScreen} />
        </Drawer.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
