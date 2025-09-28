import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { databaseService } from '@/services/database';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [clearing, setClearing] = useState(false);

  const handleExportData = () => {
    Alert.alert('Export Data', 'Data export functionality will be implemented soon!');
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your fishing trips and catches. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            setClearing(true);
            try {
              await databaseService.initialize();
              // We could implement a clearAllData method in the database service
              // For now, we'll show an alert
              Alert.alert('Clear Data', 'Clear all data functionality will be implemented soon!');
            } catch (error) {
              console.error('Error clearing data:', error);
              Alert.alert('Error', 'Could not clear data. Please try again.');
            } finally {
              setClearing(false);
            }
          }
        }
      ]
    );
  };

  const SettingItem = ({ 
    title, 
    subtitle, 
    icon, 
    onPress, 
    destructive = false 
  }: {
    title: string;
    subtitle?: string;
    icon: string;
    onPress: () => void;
    destructive?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}
      onPress={onPress}
    >
      <View style={styles.settingItemLeft}>
        <IconSymbol 
          name={icon} 
          size={24} 
          color={destructive ? '#FF6B6B' : Colors[colorScheme ?? 'light'].tint} 
        />
        <View style={styles.settingItemText}>
          <ThemedText 
            type="defaultSemiBold" 
            style={[styles.settingTitle, destructive && { color: '#FF6B6B' }]}
          >
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>
          )}
        </View>
      </View>
      <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Settings
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Manage your fishing log preferences
          </ThemedText>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>
          <View style={[styles.infoCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
            <IconSymbol name="fish.fill" size={32} color="#4A90E2" />
            <View style={styles.infoContent}>
              <ThemedText type="defaultSemiBold" style={styles.appName}>
                Fishing Log
              </ThemedText>
              <ThemedText style={styles.appVersion}>
                Version 1.0.0
              </ThemedText>
              <ThemedText style={styles.appDescription}>
                Track your fishing adventures with ease. Log trips, catches, and view your fishing statistics.
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Data Management
          </ThemedText>
          <View style={styles.settingsGroup}>
            <SettingItem
              title="Export Data"
              subtitle="Export your fishing data as CSV"
              icon="square.and.arrow.up"
              onPress={handleExportData}
            />
            <SettingItem
              title="Clear All Data"
              subtitle="Permanently delete all trips and catches"
              icon="trash"
              onPress={handleClearAllData}
              destructive
            />
          </View>
        </View>

        {/* Features Coming Soon */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Coming Soon
          </ThemedText>
          <View style={[styles.comingSoonCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
            <IconSymbol name="sparkles" size={24} color="#FFD700" />
            <View style={styles.comingSoonContent}>
              <ThemedText type="defaultSemiBold" style={styles.comingSoonTitle}>
                Upcoming Features
              </ThemedText>
              <View style={styles.featuresList}>
                <ThemedText style={styles.featureItem}>• Photo capture for catches</ThemedText>
                <ThemedText style={styles.featureItem}>• Weather integration</ThemedText>
                <ThemedText style={styles.featureItem}>• Advanced statistics</ThemedText>
                <ThemedText style={styles.featureItem}>• Trip sharing</ThemedText>
                <ThemedText style={styles.featureItem}>• Favorite locations</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 16,
  },
  infoContent: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  settingsGroup: {
    gap: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingItemText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  comingSoonCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 16,
  },
  comingSoonContent: {
    flex: 1,
  },
  comingSoonTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  featuresList: {
    gap: 6,
  },
  featureItem: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});
