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

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { databaseService } from '@/services/database';
import { locationService, LocationData } from '@/services/location';
import { Colors } from '@/constants/theme';
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <ThemedView style={styles.header}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
              <IconSymbol name="xmark" size={20} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
            <ThemedText type="title" style={styles.title}>New Fishing Trip</ThemedText>
            <View style={styles.placeholder} />
          </ThemedView>

          {/* Date and Time Section */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>When</ThemedText>
            
            <TouchableOpacity 
              style={[styles.inputContainer, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}
              onPress={() => setShowDatePicker(true)}
            >
              <IconSymbol name="calendar" size={20} color={Colors[colorScheme ?? 'light'].tabIconDefault} />
              <ThemedText style={styles.inputText}>{formatDate(date)}</ThemedText>
            </TouchableOpacity>

            <View style={styles.timeContainer}>
              <TouchableOpacity 
                style={[styles.timeInput, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}
                onPress={() => setShowStartTimePicker(true)}
              >
                <ThemedText style={styles.timeLabel}>Start Time</ThemedText>
                <ThemedText style={styles.inputText}>{formatTime(startTime)}</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.timeInput, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <ThemedText style={styles.timeLabel}>End Time</ThemedText>
                <ThemedText style={styles.inputText}>
                  {endTime ? formatTime(endTime) : 'Optional'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>

          {/* Location Section */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Location</ThemedText>
            
            <View style={styles.locationToggleContainer}>
              <ThemedText>Use current location</ThemedText>
              <Switch
                value={useCurrentLocation}
                onValueChange={setUseCurrentLocation}
                trackColor={{ false: '#767577', true: '#4A90E2' }}
                thumbColor={useCurrentLocation ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            {useCurrentLocation && (
              <TouchableOpacity
                style={[styles.locationButton, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}
                onPress={getCurrentLocation}
                disabled={autoLocationLoading}
              >
                <IconSymbol 
                  name={autoLocationLoading ? "arrow.2.circlepath" : "location"} 
                  size={20} 
                  color={Colors[colorScheme ?? 'light'].tabIconDefault} 
                />
                <ThemedText style={styles.locationButtonText}>
                  {autoLocationLoading ? 'Getting location...' : 'Refresh location'}
                </ThemedText>
              </TouchableOpacity>
            )}

            <TextInput
              style={[styles.textInput, { 
                backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                color: Colors[colorScheme ?? 'light'].text 
              }]}
              placeholder="Enter location name"
              placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
              value={locationName}
              onChangeText={setLocationName}
              multiline
            />

            {coordinates && (
              <ThemedText style={styles.coordinatesText}>
                📍 {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
              </ThemedText>
            )}
          </ThemedView>

          {/* Weather Section */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Weather (Optional)</ThemedText>
            
            <View style={styles.weatherContainer}>
              <TextInput
                style={[styles.textInput, { 
                  flex: 1,
                  backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                  color: Colors[colorScheme ?? 'light'].text 
                }]}
                placeholder="e.g., Sunny, Cloudy, Rainy"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={weather}
                onChangeText={setWeather}
              />

              <TextInput
                style={[styles.temperatureInput, { 
                  backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                  color: Colors[colorScheme ?? 'light'].text 
                }]}
                placeholder="°F"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={temperature}
                onChangeText={setTemperature}
                keyboardType="numeric"
              />
            </View>
          </ThemedView>

          {/* Notes Section */}
          <ThemedView style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Notes (Optional)</ThemedText>
            
            <TextInput
              style={[styles.notesInput, { 
                backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
                color: Colors[colorScheme ?? 'light'].text 
              }]}
              placeholder="Add any notes about this trip..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </ThemedView>
        </ScrollView>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveTrip}
          disabled={loading}
        >
          {loading ? (
            <ThemedText style={styles.saveButtonText}>Saving...</ThemedText>
          ) : (
            <>
              <IconSymbol name="checkmark.circle" size={20} color="#ffffff" />
              <ThemedText style={styles.saveButtonText}>Save Trip</ThemedText>
            </>
          )}
        </TouchableOpacity>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 60,
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 15,
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    gap: 12,
  },
  inputText: {
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
  },
  timeLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  locationToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  locationButtonText: {
    fontSize: 14,
  },
  textInput: {
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    minHeight: 50,
  },
  coordinatesText: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  weatherContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  temperatureInput: {
    width: 80,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  notesInput: {
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});