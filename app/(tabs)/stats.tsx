import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { databaseService } from '@/services/database';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TripStats {
  totalTrips: number;
  totalCatches: number;
  avgCatchesPerTrip: number;
  favoriteSpecies: string | null;
}

interface SpeciesStats {
  species: string;
  count: number;
}

export default function StatsScreen() {
  const colorScheme = useColorScheme();
  const [stats, setStats] = useState<TripStats>({
    totalTrips: 0,
    totalCatches: 0,
    avgCatchesPerTrip: 0,
    favoriteSpecies: null,
  });
  const [speciesStats, setSpeciesStats] = useState<SpeciesStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      // Ensure database is initialized first
      await databaseService.initialize();
      
      const [tripStats, speciesData] = await Promise.all([
        databaseService.getTripStats(),
        databaseService.getSpeciesStats(),
      ]);
      
      setStats(tripStats);
      setSpeciesStats(speciesData);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const StatCard = ({ title, value, subtitle, icon }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
      <View style={styles.statCardHeader}>
        <IconSymbol name={icon} size={24} color={Colors[colorScheme ?? 'light'].tint} />
        <ThemedText type="defaultSemiBold" style={styles.statCardTitle}>
          {title}
        </ThemedText>
      </View>
      <ThemedText type="title" style={styles.statCardValue}>
        {value}
      </ThemedText>
      {subtitle && (
        <ThemedText style={styles.statCardSubtitle}>{subtitle}</ThemedText>
      )}
    </View>
  );

  const SpeciesCard = ({ species, count, rank }: {
    species: string;
    count: number;
    rank: number;
  }) => (
    <View style={[styles.speciesCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
      <View style={styles.speciesRank}>
        <ThemedText type="defaultSemiBold" style={styles.rankNumber}>
          #{rank}
        </ThemedText>
      </View>
      <View style={styles.speciesInfo}>
        <ThemedText type="defaultSemiBold" style={styles.speciesName}>
          {species}
        </ThemedText>
        <ThemedText style={styles.speciesCount}>
          {count} {count === 1 ? 'catch' : 'catches'}
        </ThemedText>
      </View>
      <IconSymbol name="fish" size={20} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <IconSymbol name="chart.bar" size={48} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
          <ThemedText style={styles.loadingText}>Loading statistics...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Statistics
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Your fishing insights at a glance
          </ThemedText>
        </View>

        {stats.totalTrips === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="chart.bar" size={64} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
            <ThemedText type="subtitle" style={styles.emptyTitle}>
              No Data Yet
            </ThemedText>
            <ThemedText style={styles.emptyDescription}>
              Start logging fishing trips to see your statistics and insights!
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Overview Stats */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Overview
              </ThemedText>
              <View style={styles.statsGrid}>
                <StatCard
                  title="Total Trips"
                  value={stats.totalTrips}
                  icon="fish.circle"
                />
                <StatCard
                  title="Total Catches"
                  value={stats.totalCatches}
                  icon="fish.fill"
                />
                <StatCard
                  title="Average per Trip"
                  value={stats.avgCatchesPerTrip.toFixed(1)}
                  subtitle="catches per trip"
                  icon="chart.line.uptrend.xyaxis"
                />
                {stats.favoriteSpecies && (
                  <StatCard
                    title="Top Species"
                    value={stats.favoriteSpecies}
                    icon="crown.fill"
                  />
                )}
              </View>
            </View>

            {/* Species Breakdown */}
            {speciesStats.length > 0 && (
              <View style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Species Breakdown
                </ThemedText>
                <View style={styles.speciesList}>
                  {speciesStats.map((species, index) => (
                    <SpeciesCard
                      key={species.species}
                      species={species.species}
                      count={species.count}
                      rank={index + 1}
                    />
                  ))}
                </View>
              </View>
            )}

            {/* Quick Insights */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Quick Insights
              </ThemedText>
              <View style={[styles.insightCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
                <IconSymbol name="lightbulb.fill" size={24} color="#FFD700" />
                <View style={styles.insightContent}>
                  {stats.totalCatches > 0 ? (
                    <>
                      <ThemedText type="defaultSemiBold" style={styles.insightTitle}>
                        Great Progress!
                      </ThemedText>
                      <ThemedText style={styles.insightText}>
                        You've logged {stats.totalTrips} fishing trips with a total of {stats.totalCatches} catches. 
                        {stats.avgCatchesPerTrip > 2 
                          ? " You're having great success on your trips!"
                          : " Keep exploring new spots and techniques to improve your catch rate."
                        }
                      </ThemedText>
                    </>
                  ) : (
                    <>
                      <ThemedText type="defaultSemiBold" style={styles.insightTitle}>
                        Ready to Start Logging Catches?
                      </ThemedText>
                      <ThemedText style={styles.insightText}>
                        Once you start logging individual catches within your trips, you'll see more detailed statistics here!
                      </ThemedText>
                    </>
                  )}
                </View>
              </View>
            </View>
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    opacity: 0.7,
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
    lineHeight: 22,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 18,
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statCardTitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statCardSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  speciesList: {
    gap: 8,
  },
  speciesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  speciesRank: {
    width: 40,
    alignItems: 'center',
  },
  rankNumber: {
    fontSize: 16,
    color: '#666',
  },
  speciesInfo: {
    flex: 1,
    marginLeft: 12,
  },
  speciesName: {
    fontSize: 16,
    marginBottom: 2,
  },
  speciesCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  insightCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    marginBottom: 6,
  },
  insightText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
});