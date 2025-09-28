import React, { useState, useEffect } from 'react';
import { StyleSheet, RefreshControl, TouchableOpacity, Alert, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { databaseService, FishingTrip } from '@/services/database';
import { locationService } from '@/services/location';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalCatches: 0,
    avgCatchesPerTrip: 0,
    favoriteSpecies: null as string | null,
  });
  const [recentTrips, setRecentTrips] = useState<FishingTrip[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      // Ensure database is initialized first
      await databaseService.initialize();
      
      const [statsData, trips] = await Promise.all([
        databaseService.getTripStats(),
        databaseService.getTrips(3), // Get last 3 trips for cleaner UI
      ]);
      
      setStats(statsData);
      setRecentTrips(trips);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleIdentifyFish = () => {
    router.push('/identify-fish');
  };

  const handleLogCatch = async () => {
    // Request location permission if needed
    const hasPermission = await locationService.requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        'Location Permission', 
        'Location access helps automatically log fishing spots. You can still create trips manually.',
        [
          { text: 'Continue', onPress: () => router.push('/new-trip') },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }
    
    router.push('/new-trip');
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <ThemedText style={styles.headerTitle}>FishLog</ThemedText>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/explore')}>
          <IconSymbol name="gearshape.fill" size={20} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContainer} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} 
            onPress={handleIdentifyFish}
          >
            <ThemedText style={styles.primaryButtonText}>Identify Fish</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]} 
            onPress={handleLogCatch}
          >
            <ThemedText style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Log Catch
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Recent Catches Section */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Recent Catches</ThemedText>
          
          {recentTrips.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyImagePlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                <IconSymbol name="fish.fill" size={32} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
              </View>
              <ThemedText style={styles.emptyText}>
                No catches yet
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Start your first fishing trip!
              </ThemedText>
            </View>
          ) : (
            recentTrips.map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={[styles.catchCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}
                onPress={() => router.push(`/trip/${trip.id}`)}
              >
                <View style={[styles.catchImage, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                  <IconSymbol name="fish.fill" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                </View>
                <View style={styles.catchInfo}>
                  <ThemedText style={styles.catchTitle}>{trip.locationName}</ThemedText>
                  <ThemedText style={styles.catchSubtitle}>
                    {new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
              </TouchableOpacity>
            ))
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  actionsContainer: {
    marginTop: 16,
    gap: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionContainer: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  catchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 16,
  },
  catchImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catchInfo: {
    flex: 1,
  },
  catchTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  catchSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
});
