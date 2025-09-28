import React, { useState, useEffect } from 'react';
import { StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { databaseService, FishingTrip } from '@/services/database';
import { locationService } from '@/services/location';

export default function DashboardScreen() {
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
        databaseService.getTrips(5), // Get last 5 trips
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

  const handleNewTrip = async () => {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#4A90E2', dark: '#2C5282' }}
      headerImage={
        <IconSymbol
          size={150}
          color="#ffffff"
          name="fish.fill"
          style={styles.headerIcon}
        />
      }
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Fishing Log</ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your fishing adventures
        </ThemedText>
      </ThemedView>

      {/* Quick Stats */}
      <ThemedView style={styles.statsContainer}>
        <ThemedView style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.statNumber}>
            {stats.totalTrips}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Trips</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.statNumber}>
            {stats.totalCatches}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Catches</ThemedText>
        </ThemedView>
        <ThemedView style={styles.statBox}>
          <ThemedText type="subtitle" style={styles.statNumber}>
            {stats.avgCatchesPerTrip.toFixed(1)}
          </ThemedText>
          <ThemedText style={styles.statLabel}>Avg/Trip</ThemedText>
        </ThemedView>
      </ThemedView>

      {stats.favoriteSpecies && (
        <ThemedView style={styles.favoriteContainer}>
          <ThemedText type="defaultSemiBold">
            Favorite Species: {stats.favoriteSpecies}
          </ThemedText>
        </ThemedView>
      )}

      {/* New Trip Button */}
      <TouchableOpacity style={styles.newTripButton} onPress={handleNewTrip}>
        <IconSymbol name="plus.circle.fill" size={24} color="#ffffff" />
        <ThemedText style={styles.newTripText}>Start New Trip</ThemedText>
      </TouchableOpacity>

      {/* Recent Trips */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Recent Trips
        </ThemedText>
        {recentTrips.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <IconSymbol name="fish" size={48} color="#999" />
            <ThemedText style={styles.emptyText}>
              No trips recorded yet.
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Start your first fishing trip to begin tracking your adventures!
            </ThemedText>
          </ThemedView>
        ) : (
          recentTrips.map((trip) => (
            <TouchableOpacity
              key={trip.id}
              style={styles.tripCard}
              onPress={() => router.push(`/trip/${trip.id}`)}
            >
              <ThemedView style={styles.tripHeader}>
                <ThemedText type="defaultSemiBold">
                  {trip.locationName}
                </ThemedText>
                <ThemedText style={styles.tripDate}>
                  {formatDate(trip.date)}
                </ThemedText>
              </ThemedView>
              {trip.notes && (
                <ThemedText style={styles.tripNotes} numberOfLines={2}>
                  {trip.notes}
                </ThemedText>
              )}
              <ThemedView style={styles.tripFooter}>
                <ThemedText style={styles.tripTime}>
                  {trip.startTime} {trip.endTime && `- ${trip.endTime}`}
                </ThemedText>
                <IconSymbol name="chevron.right" size={16} color="#999" />
              </ThemedView>
            </TouchableOpacity>
          ))
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 4,
  },
  headerIcon: {
    bottom: -30,
    left: 20,
    position: 'absolute',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  favoriteContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  newTripButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    gap: 8,
  },
  newTripText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
    opacity: 0.6,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    opacity: 0.7,
  },
  tripCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  tripDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  tripNotes: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripTime: {
    fontSize: 12,
    opacity: 0.7,
  },
});
