import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { fishIdentificationService, IdentificationResult } from '@/services/fishIdentification';

export default function IdentifyFishScreen() {
  const colorScheme = useColorScheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return cameraPermission.status === 'granted' && mediaLibraryPermission.status === 'granted';
  };

  const takePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library access are required to take photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const pickPhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      Alert.alert(
        'Permissions Required',
        'Photo library access is required to select photos.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const identifyFish = async () => {
    if (!selectedImage) return;

    setIsIdentifying(true);
    try {
      const result: IdentificationResult = await fishIdentificationService.identifyFish(selectedImage);
      
      // Navigate to results screen with the identification result
      router.push({
        pathname: '/identify-results',
        params: { 
          imageUri: selectedImage,
          resultData: JSON.stringify(result)
        }
      });
    } catch (error) {
      console.error('Error identifying fish:', error);
      Alert.alert(
        'Identification Failed',
        'Could not identify the fish. Please try again with a clearer photo.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsIdentifying(false);
    }
  };

  const clearPhoto = () => {
    setSelectedImage(null);
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="xmark" size={20} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Identify Fish</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Photo Section */}
        <View style={styles.photoSection}>
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.selectedImage}
                contentFit="cover"
              />
              <TouchableOpacity style={styles.clearButton} onPress={clearPhoto}>
                <IconSymbol name="xmark.circle.fill" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
              <IconSymbol name="camera.fill" size={48} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
              <ThemedText style={styles.placeholderText}>
                Take or select a photo of your fish
              </ThemedText>
              <ThemedText style={styles.placeholderSubtext}>
                Make sure the fish is clearly visible and well-lit
              </ThemedText>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}
            onPress={takePhoto}
          >
            <IconSymbol name="camera.fill" size={24} color={Colors[colorScheme ?? 'light'].primary} />
            <ThemedText style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Take Photo
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}
            onPress={pickPhoto}
          >
            <IconSymbol name="photo.fill" size={24} color={Colors[colorScheme ?? 'light'].primary} />
            <ThemedText style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Choose Photo
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <ThemedText style={styles.sectionTitle}>Photo Tips</ThemedText>
          <View style={[styles.tipCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
            <View style={styles.tip}>
              <IconSymbol name="lightbulb.fill" size={16} color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.tipText}>Ensure good lighting and clear focus</ThemedText>
            </View>
            <View style={styles.tip}>
              <IconSymbol name="eye.fill" size={16} color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.tipText}>Show the whole fish from the side</ThemedText>
            </View>
            <View style={styles.tip}>
              <IconSymbol name="hand.raised.fill" size={16} color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.tipText}>Hold fish steadily to avoid blur</ThemedText>
            </View>
            <View style={styles.tip}>
              <IconSymbol name="water.waves" size={16} color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.tipText}>Include fins and distinctive features</ThemedText>
            </View>
          </View>
        </View>

        {/* Example Photos */}
        <View style={styles.examplesSection}>
          <ThemedText style={styles.sectionTitle}>Good Examples</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exampleScroll}>
            <View style={[styles.examplePhoto, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <IconSymbol name="fish.fill" size={32} color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.exampleLabel}>Side View</ThemedText>
            </View>
            <View style={[styles.examplePhoto, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <IconSymbol name="fish.fill" size={32} color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.exampleLabel}>Clear Features</ThemedText>
            </View>
            <View style={[styles.examplePhoto, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
              <IconSymbol name="fish.fill" size={32} color={Colors[colorScheme ?? 'light'].primary} />
              <ThemedText style={styles.exampleLabel}>Good Lighting</ThemedText>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Identify Button */}
      {selectedImage && (
        <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
          <TouchableOpacity
            style={[
              styles.identifyButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].primary },
              isIdentifying && styles.identifyButtonDisabled
            ]}
            onPress={identifyFish}
            disabled={isIdentifying}
          >
            {isIdentifying ? (
              <>
                <IconSymbol name="arrow.2.circlepath" size={20} color="#ffffff" />
                <ThemedText style={styles.identifyButtonText}>Identifying...</ThemedText>
              </>
            ) : (
              <>
                <IconSymbol name="sparkles" size={20} color="#ffffff" />
                <ThemedText style={styles.identifyButtonText}>Identify Fish</ThemedText>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    paddingRight: 32,
  },
  headerSpacer: {
    width: 24,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  photoSection: {
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 4,
  },
  photoPlaceholder: {
    height: 240,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(29, 201, 98, 0.3)',
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  placeholderSubtext: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tipsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  tipCard: {
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.8,
  },
  examplesSection: {
    marginBottom: 24,
  },
  exampleScroll: {
    flexDirection: 'row',
  },
  examplePhoto: {
    width: 120,
    height: 120,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    padding: 16,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  identifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 8,
  },
  identifyButtonDisabled: {
    opacity: 0.6,
  },
  identifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});