import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, RefreshControl, View, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { databaseService, FishingTrip } from '@/services/database';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TripsScreen() {
  const colorScheme = useColorScheme();
  const [trips, setTrips] = useState<FishingTrip[]>([]);
  const [filteredTrips, setFilteredTrips] = useState<FishingTrip[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadTrips = async () => {
    try {
      // Ensure database is initialized first
      await databaseService.initialize();
      
      const allTrips = await databaseService.getTrips();
      setTrips(allTrips);
      setFilteredTrips(allTrips);
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reload trips when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTrips(trips);
    } else {
      const filtered = trips.filter(trip =>
        trip.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (trip.notes && trip.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTrips(filtered);
    }
  }, [searchQuery, trips]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTrips();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleTripPress = (tripId: number) => {
    router.push(`/trip/${tripId}`);
  };

  const handleNewTrip = () => {
    router.push('/new-trip');
  };

  const renderTripItem = ({ item: trip }: { item: FishingTrip }) => (
    <TouchableOpacity
      style={[styles.tripCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}
      onPress={() => handleTripPress(trip.id!)}
    >
      <View style={styles.tripHeader}>
        <View style={styles.tripHeaderLeft}>
          <ThemedText type="defaultSemiBold" style={styles.locationText}>
            {trip.locationName}
          </ThemedText>
          <ThemedText style={styles.dateText}>
            {formatDate(trip.date)}
          </ThemedText>
        </View>
        <View style={styles.tripHeaderRight}>
          <ThemedText style={styles.timeText}>
            {trip.startTime}
            {trip.endTime && ` - ${trip.endTime}`}
          </ThemedText>
          <IconSymbol name="chevron.right" size={16} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
        </View>
      </View>
      
      {trip.weather && (
        <View style={styles.weatherContainer}>
          <IconSymbol name="cloud" size={14} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
          <ThemedText style={styles.weatherText}>
            {trip.weather}
            {trip.temperature && ` • ${trip.temperature}°`}
          </ThemedText>
        </View>
      )}
      
      {trip.notes && (
        <ThemedText style={styles.notesText} numberOfLines={2}>
          {trip.notes}
        </ThemedText>
      )}
      
      {trip.latitude && trip.longitude && (
        <View style={styles.coordinatesContainer}>
          <IconSymbol name="location" size={12} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
          <ThemedText style={styles.coordinatesText}>
            {trip.latitude.toFixed(6)}, {trip.longitude.toFixed(6)}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <IconSymbol name="fish" size={64} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
      <ThemedText type="subtitle" style={styles.emptyTitle}>
        No Fishing Trips Yet
      </ThemedText>
      <ThemedText style={styles.emptyDescription}>
        Start tracking your fishing adventures by creating your first trip!
      </ThemedText>
      <TouchableOpacity style={styles.emptyButton} onPress={handleNewTrip}>
        <IconSymbol name="plus" size={20} color="#ffffff" />
        <ThemedText style={styles.emptyButtonText}>Create First Trip</ThemedText>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading trips...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          My Trips
        </ThemedText>
        <TouchableOpacity style={styles.addButton} onPress={handleNewTrip}>
          <IconSymbol name="plus" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
        <IconSymbol name="magnifyingglass" size={20} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
        <TextInput
          style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Search trips by location or notes..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={20} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
          </TouchableOpacity>
        )}
      </View>

      {filteredTrips.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredTrips}
          keyExtractor={(item) => item.id!.toString()}
          renderItem={renderTripItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 5,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  tripCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tripHeaderLeft: {
    flex: 1,
  },
  tripHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  locationText: {
    fontSize: 16,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.7,
  },
  timeText: {
    fontSize: 12,
    opacity: 0.6,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  weatherText: {
    fontSize: 14,
    opacity: 0.8,
  },
  notesText: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
    lineHeight: 20,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coordinatesText: {
    fontSize: 11,
    opacity: 0.6,
    fontFamily: 'monospace',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyDescription: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 30,
    lineHeight: 22,
  },
  emptyButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});