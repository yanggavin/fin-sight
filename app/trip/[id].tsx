import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { databaseService, FishingTrip, Catch } from '@/services/database';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  
  const [trip, setTrip] = useState<FishingTrip | null>(null);
  const [catches, setCatches] = useState<Catch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTripDetails();
  }, [id]);

  const loadTripDetails = async () => {
    if (!id) return;
    
    try {
      await databaseService.initialize();
      
      const tripId = parseInt(id);
      const [tripData, catchesData] = await Promise.all([
        databaseService.getTripById(tripId),
        databaseService.getCatchesByTripId(tripId),
      ]);
      
      setTrip(tripData);
      setCatches(catchesData);
    } catch (error) {
      console.error('Error loading trip details:', error);
      Alert.alert('Error', 'Could not load trip details. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  const handleEditTrip = () => {
    // TODO: Implement edit trip functionality
    Alert.alert('Edit Trip', 'Edit functionality will be implemented soon!');
  };

  const handleDeleteTrip = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteTrip(parseInt(id!));
              Alert.alert('Trip Deleted', 'The trip has been deleted successfully.', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting trip:', error);
              Alert.alert('Error', 'Could not delete trip. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading trip details...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!trip) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText>Trip not found.</ThemedText>
          <TouchableOpacity onPress={() => router.back()}>
            <ThemedText style={styles.backLink}>Go back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <IconSymbol name="chevron.left" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
            <View>
              <ThemedText type="title" style={styles.locationTitle}>
                {trip.locationName}
              </ThemedText>
              <ThemedText style={styles.dateText}>
                {formatDate(trip.date)}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEditTrip} style={styles.actionButton}>
              <IconSymbol name="pencil" size={20} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDeleteTrip} style={styles.actionButton}>
              <IconSymbol name="trash" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Trip Details */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Trip Details</ThemedText>
          
          <View style={styles.detailRow}>
            <IconSymbol name="clock" size={16} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
            <ThemedText style={styles.detailLabel}>Time:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {trip.startTime}{trip.endTime && ` - ${trip.endTime}`}
            </ThemedText>
          </View>

          {trip.weather && (
            <View style={styles.detailRow}>
              <IconSymbol name="cloud" size={16} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
              <ThemedText style={styles.detailLabel}>Weather:</ThemedText>
              <ThemedText style={styles.detailValue}>
                {trip.weather}{trip.temperature && ` (${trip.temperature}°F)`}
              </ThemedText>
            </View>
          )}

          {trip.latitude && trip.longitude && (
            <View style={styles.detailRow}>
              <IconSymbol name="location" size={16} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
              <ThemedText style={styles.detailLabel}>Coordinates:</ThemedText>
              <ThemedText style={[styles.detailValue, styles.coordinates]}>
                {formatCoordinates(trip.latitude, trip.longitude)}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Notes */}
        {trip.notes && (
          <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Notes</ThemedText>
            <ThemedText style={styles.notesText}>{trip.notes}</ThemedText>
          </View>
        )}

        {/* Catches */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Catches ({catches.length})
            </ThemedText>
            <TouchableOpacity style={styles.addCatchButton} onPress={() => {
              Alert.alert('Add Catch', 'Catch logging functionality will be implemented soon!');
            }}>
              <IconSymbol name="plus" size={16} color="#4A90E2" />
              <ThemedText style={styles.addCatchText}>Add Catch</ThemedText>
            </TouchableOpacity>
          </View>

          {catches.length === 0 ? (
            <View style={styles.emptyCatches}>
              <IconSymbol name="fish" size={32} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
              <ThemedText style={styles.emptyCatchesText}>
                No catches recorded for this trip yet.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.catchesList}>
              {catches.map((catch_, index) => (
                <View key={catch_.id} style={styles.catchCard}>
                  <View style={styles.catchHeader}>
                    <ThemedText type="defaultSemiBold" style={styles.catchSpecies}>
                      {catch_.species}
                    </ThemedText>
                    <ThemedText style={styles.catchTime}>
                      {catch_.time}
                    </ThemedText>
                  </View>
                  
                  <View style={styles.catchDetails}>
                    {catch_.length && (
                      <ThemedText style={styles.catchDetail}>
                        Length: {catch_.length}"
                      </ThemedText>
                    )}
                    {catch_.weight && (
                      <ThemedText style={styles.catchDetail}>
                        Weight: {catch_.weight} kg
                      </ThemedText>
                    )}
                    {catch_.bait && (
                      <ThemedText style={styles.catchDetail}>
                        Bait: {catch_.bait}
                      </ThemedText>
                    )}
                    {catch_.lure && (
                      <ThemedText style={styles.catchDetail}>
                        Lure: {catch_.lure}
                      </ThemedText>
                    )}
                  </View>

                  {catch_.released && (
                    <View style={styles.releasedBadge}>
                      <ThemedText style={styles.releasedText}>Released</ThemedText>
                    </View>
                  )}

                  {catch_.notes && (
                    <ThemedText style={styles.catchNotes}>{catch_.notes}</ThemedText>
                  )}
                </View>
              ))}
            </View>
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
  scrollContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backLink: {
    color: '#4A90E2',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginTop: -8,
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 16,
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
    minWidth: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
  },
  coordinates: {
    fontFamily: 'monospace',
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.9,
  },
  addCatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 16,
  },
  addCatchText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCatches: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyCatchesText: {
    marginTop: 8,
    opacity: 0.6,
    textAlign: 'center',
  },
  catchesList: {
    gap: 12,
  },
  catchCard: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  catchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catchSpecies: {
    fontSize: 16,
  },
  catchTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  catchDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  catchDetail: {
    fontSize: 12,
    opacity: 0.8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  releasedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  releasedText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  catchNotes: {
    fontSize: 14,
    opacity: 0.8,
    fontStyle: 'italic',
  },
});