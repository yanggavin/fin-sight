import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  Switch,
  View 
} from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { databaseService } from '@/services/database';
import { locationService, LocationData } from '@/services/location';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NewTripScreen() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);
  
  // Trip form data
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  const [locationName, setLocationName] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [coordinates, setCoordinates] = useState<LocationData | null>(null);
  
  const [weather, setWeather] = useState('');
  const [temperature, setTemperature] = useState('');
  const [notes, setNotes] = useState('');
  
  const [autoLocationLoading, setAutoLocationLoading] = useState(false);

  useEffect(() => {
    if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, [useCurrentLocation]);

  const getCurrentLocation = async () => {
    setAutoLocationLoading(true);
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        setCoordinates(location);
        const locationName = await locationService.getLocationName(location.latitude, location.longitude);
        setLocationName(locationName);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Location Error', 'Could not get current location. You can enter it manually.');
    } finally {
      setAutoLocationLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSaveTrip = async () => {
    if (!locationName.trim()) {
      Alert.alert('Missing Information', 'Please enter a location name.');
      return;
    }

    setLoading(true);
    
    try {
      const tripData = {
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        startTime: formatTime(startTime),
        endTime: endTime ? formatTime(endTime) : undefined,
        locationName: locationName.trim(),
        latitude: coordinates?.latitude,
        longitude: coordinates?.longitude,
        weather: weather.trim() || undefined,
        temperature: temperature.trim() ? parseFloat(temperature) : undefined,
        notes: notes.trim() || undefined,
      };

      await databaseService.createTrip(tripData);
      
      Alert.alert(
        'Trip Saved!', 
        'Your fishing trip has been logged successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
    } catch (error) {
      console.error('Error saving trip:', error);
      Alert.alert('Error', 'Could not save trip. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setStartTime(selectedTime);
    }
  };

  const onEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setEndTime(selectedTime);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Sticky Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol name="xmark" size={20} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Log Catch</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* Species Selection */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Species</ThemedText>
            <View style={[styles.inputWrapper, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].border 
            }]}>
              <TextInput
                style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
                placeholder="Enter species caught"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={locationName}
                onChangeText={setLocationName}
              />
            </View>
          </View>

          {/* Count */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Count</ThemedText>
            <View style={[styles.inputWrapper, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].border 
            }]}>
              <TextInput
                style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
                placeholder="1"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                keyboardType="numeric"
                defaultValue="1"
              />
            </View>
          </View>

          {/* Weight and Length */}
          <View style={styles.doubleInputContainer}>
            <View style={[styles.section, { flex: 1 }]}>
              <ThemedText style={styles.sectionLabel}>Weight (kg)</ThemedText>
              <View style={[styles.inputWrapper, { 
                backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                borderColor: Colors[colorScheme ?? 'light'].border 
              }]}>
                <TextInput
                  style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
                  placeholder="1.6"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  keyboardType="numeric"
                  value={temperature}
                  onChangeText={setTemperature}
                />
              </View>
            </View>
            <View style={[styles.section, { flex: 1 }]}>
              <ThemedText style={styles.sectionLabel}>Length (in)</ThemedText>
              <View style={[styles.inputWrapper, { 
                backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                borderColor: Colors[colorScheme ?? 'light'].border 
              }]}>
                <TextInput
                  style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
                  placeholder="18"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Location</ThemedText>
            <View style={[styles.inputWrapper, { 
              backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
              borderColor: Colors[colorScheme ?? 'light'].border 
            }]}>
              <TextInput
                style={[styles.input, { color: Colors[colorScheme ?? 'light'].text }]}
                placeholder="Enter fishing location"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={weather}
                onChangeText={setWeather}
              />
            </View>
          </View>

          {/* Auto-Location Toggle */}
          <View style={[styles.toggleContainer, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
            <ThemedText style={styles.sectionLabel}>Use current location</ThemedText>
            <Switch
              value={useCurrentLocation}
              onValueChange={setUseCurrentLocation}
              trackColor={{ false: Colors[colorScheme ?? 'light'].tabIconDefault, true: Colors[colorScheme ?? 'light'].primary }}
              thumbColor={'#ffffff'}
            />
          </View>

          {/* Weather Info */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Weather</ThemedText>
            <View style={[styles.weatherCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
              <View style={styles.weatherRow}>
                <ThemedText style={styles.weatherLabel}>Temperature</ThemedText>
                <ThemedText style={styles.weatherValue}>68°F</ThemedText>
              </View>
              <View style={styles.weatherDivider} />
              <View style={styles.weatherRow}>
                <ThemedText style={styles.weatherLabel}>Wind</ThemedText>
                <ThemedText style={styles.weatherValue}>5 mph</ThemedText>
              </View>
              <View style={styles.weatherDivider} />
              <View style={styles.weatherRow}>
                <ThemedText style={styles.weatherLabel}>Pressure</ThemedText>
                <ThemedText style={styles.weatherValue}>1012 hPa</ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Footer with Save Button */}
        <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].background, borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }, loading && styles.saveButtonDisabled]}
            onPress={handleSaveTrip}
            disabled={loading}
          >
            <ThemedText style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Catch'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Date/Time Pickers */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={onStartTimeChange}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime || new Date()}
          mode="time"
          display="default"
          onChange={onEndTimeChange}
        />
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingTop: 60,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    paddingRight: Spacing.xl, // Compensate for back button
  },
  headerSpacer: {
    width: 24,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  inputWrapper: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  input: {
    height: 48,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    borderWidth: 0,
  },
  doubleInputContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  weatherCard: {
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
  },
  weatherRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  weatherLabel: {
    fontSize: Typography.fontSize.sm,
    opacity: 0.6,
  },
  weatherValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  weatherDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: -Spacing.md,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  saveButton: {
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
});
