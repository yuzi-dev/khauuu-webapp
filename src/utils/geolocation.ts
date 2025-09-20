// Utility functions for geolocation and distance calculations

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Get user's current location
export function getCurrentLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}

// Format distance for display
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  }
  return `${distance}km`;
}

// Mock restaurant coordinates (in real app, this would come from database)
export const restaurantCoordinates: Record<string, Coordinates> = {
  "1": { latitude: 27.7172, longitude: 85.3240 }, // Himalayan Delights - Thamel
  "2": { latitude: 27.7129, longitude: 85.3208 }, // Momo Palace
  "3": { latitude: 27.7056, longitude: 85.3171 }, // Heritage Kitchen
  "4": { latitude: 27.7014, longitude: 85.3206 }, // Yak & Yeti
  "5": { latitude: 27.7089, longitude: 85.3162 }, // Thakali Kitchen
  "6": { latitude: 27.7143, longitude: 85.3187 }, // Newari Ghar
};

// Get coordinates for a restaurant by ID
export function getRestaurantCoordinates(restaurantId: string): Coordinates | null {
  return restaurantCoordinates[restaurantId] || null;
}