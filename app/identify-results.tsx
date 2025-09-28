import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IdentificationResult, FishSpecies } from '@/services/fishIdentification';

export default function IdentifyResultsScreen() {
  const colorScheme = useColorScheme();
  const { imageUri, resultData } = useLocalSearchParams<{ 
    imageUri: string; 
    resultData: string; 
  }>();
  
  const [result, setResult] = useState<IdentificationResult | null>(null);

  useEffect(() => {
    if (resultData) {
      try {
        const parsedResult = JSON.parse(resultData);
        setResult(parsedResult);
      } catch (error) {
        console.error('Error parsing result data:', error);
        Alert.alert('Error', 'Could not load identification results.');
        router.back();
      }
    }
  }, [resultData]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#4CAF50'; // Green - High confidence
    if (confidence >= 0.6) return '#FF9800'; // Orange - Medium confidence
    return '#f44336'; // Red - Low confidence
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'Excellent': return '#4CAF50';
      case 'Good': return '#8BC34A';
      case 'Fair': return '#FF9800';
      case 'Poor': return '#f44336';
      default: return Colors[colorScheme ?? 'light'].tabIconDefault;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#f44336';
      default: return Colors[colorScheme ?? 'light'].tabIconDefault;
    }
  };

  const handleLogCatch = () => {
    if (!result) return;
    
    // Navigate to new catch form with pre-filled species data
    Alert.alert(
      'Log This Catch?',
      `Would you like to log a ${result.species.name} to your fishing trips?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Catch',
          onPress: () => {
            router.push({
              pathname: '/new-trip',
              params: {
                prefilledSpecies: result.species.name,
                identifiedImage: imageUri
              }
            });
          }
        }
      ]
    );
  };

  const handleTryAgain = () => {
    router.back();
  };

  if (!result || !imageUri) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText>Loading results...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Identification Results</ThemedText>
        <TouchableOpacity style={styles.shareButton} onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}>
          <IconSymbol name="square.and.arrow.up" size={20} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Photo and Main Result */}
        <View style={styles.mainResult}>
          <Image
            source={{ uri: imageUri }}
            style={styles.resultImage}
            contentFit="cover"
          />
          
          <View style={[styles.resultCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
            <View style={styles.resultHeader}>
              <View style={styles.speciesInfo}>
                <ThemedText style={styles.speciesName}>{result.species.name}</ThemedText>
                <ThemedText style={styles.scientificName}>{result.species.scientificName}</ThemedText>
              </View>
              
              <View style={styles.confidenceContainer}>
                <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(result.confidence) }]}>
                  <ThemedText style={styles.confidenceText}>
                    {Math.round(result.confidence * 100)}%
                  </ThemedText>
                </View>
                <ThemedText style={styles.confidenceLabel}>Confidence</ThemedText>
              </View>
            </View>
            
            {/* Quick Stats */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <IconSymbol name="ruler" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={styles.statText}>{result.species.avgLength}</ThemedText>
              </View>
              <View style={styles.statItem}>
                <IconSymbol name="scalemass" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={styles.statText}>{result.species.avgWeight}</ThemedText>
              </View>
              <View style={styles.statItem}>
                <IconSymbol name="target" size={16} color={getDifficultyColor(result.species.difficulty)} />
                <ThemedText style={styles.statText}>{result.species.difficulty}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Photo Analysis */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
          <ThemedText style={styles.sectionTitle}>Photo Analysis</ThemedText>
          
          <View style={styles.analysisRow}>
            <ThemedText style={styles.analysisLabel}>Image Quality:</ThemedText>
            <View style={styles.analysisValue}>
              <View style={[styles.qualityDot, { backgroundColor: getQualityColor(result.photoAnalysis.imageQuality) }]} />
              <ThemedText style={styles.analysisText}>{result.photoAnalysis.imageQuality}</ThemedText>
            </View>
          </View>
          
          <View style={styles.featuresContainer}>
            <ThemedText style={styles.featuresLabel}>Detected Features:</ThemedText>
            <View style={styles.featuresList}>
              {result.photoAnalysis.detectedFeatures.map((feature, index) => (
                <View key={index} style={[styles.featureTag, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}>
                  <ThemedText style={[styles.featureText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                    {feature}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>

          {result.photoAnalysis.recommendations && (
            <View style={styles.recommendationsContainer}>
              <ThemedText style={styles.recommendationsLabel}>Suggestions for better photos:</ThemedText>
              {result.photoAnalysis.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <IconSymbol name="lightbulb" size={14} color={Colors[colorScheme ?? 'light'].primary} />
                  <ThemedText style={styles.recommendationText}>{rec}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Species Information */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
          <ThemedText style={styles.sectionTitle}>Species Information</ThemedText>
          
          <ThemedText style={styles.description}>{result.species.description}</ThemedText>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Habitat</ThemedText>
              <ThemedText style={styles.infoValue}>{result.species.habitat.join(', ')}</ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Best Seasons</ThemedText>
              <ThemedText style={styles.infoValue}>{result.species.season.join(', ')}</ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <ThemedText style={styles.infoLabel}>Common Names</ThemedText>
              <ThemedText style={styles.infoValue}>{result.species.commonNames.join(', ')}</ThemedText>
            </View>
          </View>
        </View>

        {/* Fishing Tips */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
          <ThemedText style={styles.sectionTitle}>Fishing Tips</ThemedText>
          
          <View style={styles.tipsList}>
            {result.species.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <IconSymbol name="checkmark.circle" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={styles.tipText}>{tip}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Alternative Matches */}
        {result.alternativeMatches && result.alternativeMatches.length > 0 && (
          <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
            <ThemedText style={styles.sectionTitle}>Alternative Matches</ThemedText>
            
            {result.alternativeMatches.map((match, index) => (
              <View key={index} style={styles.alternativeItem}>
                <View style={styles.alternativeInfo}>
                  <ThemedText style={styles.alternativeName}>{match.species.name}</ThemedText>
                  <ThemedText style={styles.alternativeScientific}>{match.species.scientificName}</ThemedText>
                </View>
                <View style={[styles.alternativeConfidence, { backgroundColor: getConfidenceColor(match.confidence) }]}>
                  <ThemedText style={styles.alternativeConfidenceText}>
                    {Math.round(match.confidence * 100)}%
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}
          onPress={handleTryAgain}
        >
          <IconSymbol name="camera.fill" size={20} color={Colors[colorScheme ?? 'light'].primary} />
          <ThemedText style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
            Try Again
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={handleLogCatch}
        >
          <IconSymbol name="plus.circle" size={20} color="#ffffff" />
          <ThemedText style={styles.primaryButtonText}>Log Catch</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  shareButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainResult: {
    marginBottom: 24,
  },
  resultImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
  },
  resultCard: {
    borderRadius: 12,
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  speciesInfo: {
    flex: 1,
  },
  speciesName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 16,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  confidenceText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  confidenceLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  analysisLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  analysisValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qualityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  analysisText: {
    fontSize: 14,
    fontWeight: '500',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featuresLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  featuresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recommendationsContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  recommendationsLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    opacity: 0.9,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 14,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  alternativeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  alternativeInfo: {
    flex: 1,
  },
  alternativeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  alternativeScientific: {
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  alternativeConfidence: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  alternativeConfidenceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});