import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

export interface LocationAddress {
  street?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  name?: string;
}

class LocationService {
  private hasPermission = false;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting location permissions:', error);
      return false;
    }
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    try {
      if (!this.hasPermission) {
        const permissionGranted = await this.requestPermissions();
        if (!permissionGranted) {
          throw new Error('Location permission not granted');
        }
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeoutInterval: 10000, // 10 seconds timeout
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        altitude: location.coords.altitude || undefined,
        heading: location.coords.heading || undefined,
        speed: location.coords.speed || undefined,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<LocationAddress | null> {
    try {
      if (!this.hasPermission) {
        const permissionGranted = await this.requestPermissions();
        if (!permissionGranted) {
          throw new Error('Location permission not granted');
        }
      }

      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        return {
          street: address.street || undefined,
          city: address.city || undefined,
          region: address.region || undefined,
          postalCode: address.postalCode || undefined,
          country: address.country || undefined,
          name: address.name || undefined,
        };
      }

      return null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  async getLocationName(latitude: number, longitude: number): Promise<string> {
    const address = await this.reverseGeocode(latitude, longitude);
    
    if (!address) {
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }

    const parts = [];
    
    if (address.name) {
      parts.push(address.name);
    } else {
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
    }
    
    if (address.region) parts.push(address.region);
    
    return parts.length > 0 ? parts.join(', ') : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  formatCoordinates(latitude: number, longitude: number): string {
    const formatCoordinate = (value: number, type: 'lat' | 'lng') => {
      const abs = Math.abs(value);
      const degrees = Math.floor(abs);
      const minutes = (abs - degrees) * 60;
      const direction = type === 'lat' 
        ? (value >= 0 ? 'N' : 'S')
        : (value >= 0 ? 'E' : 'W');
      
      return `${degrees}°${minutes.toFixed(4)}'${direction}`;
    };

    return `${formatCoordinate(latitude, 'lat')}, ${formatCoordinate(longitude, 'lng')}`;
  }

  calculateDistance(
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number {
    const R = 6371; // Radius of the Earth in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async watchPosition(
    callback: (location: LocationData) => void,
    errorCallback?: (error: Error) => void
  ): Promise<() => void> {
    try {
      if (!this.hasPermission) {
        const permissionGranted = await this.requestPermissions();
        if (!permissionGranted) {
          throw new Error('Location permission not granted');
        }
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          callback({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            altitude: location.coords.altitude || undefined,
            heading: location.coords.heading || undefined,
            speed: location.coords.speed || undefined,
          });
        }
      );

      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.error('Error watching position:', error);
      if (errorCallback) {
        errorCallback(error instanceof Error ? error : new Error('Unknown error'));
      }
      return () => {}; // Return empty cleanup function
    }
  }

  async checkLocationPermission(): Promise<boolean> {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      this.hasPermission = status === 'granted';
      return this.hasPermission;
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }
}

export const locationService = new LocationService();