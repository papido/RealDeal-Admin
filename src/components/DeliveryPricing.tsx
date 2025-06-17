import * as Location from "expo-location";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../providers/authProvider";
import { useCart } from "../providers/CartProvider";
import Button from "./Button";

const DELIVERY_RATE_PER_KM = 2.5; // RM 2.50 per km
const BASE_DELIVERY_FEE = 5.0; // RM 5.00 base fee
const STORE_LOCATION = {
  latitude: 3.0738, // Replace with your store's coordinates
  longitude: 101.5183, // Klang, Selangor coordinates as example
};
const MAX_DELIVERY_DISTANCE = 25; // km

interface DeliveryInfo {
  distance: number;
  fee: number;
  isWithinRange: boolean;
}

const DeliveryPricing = () => {
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const { total, items, getLocation, location } = useCart();
  const { user } = useAuth();

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  // Calculate delivery info from coordinates
  const calculateDeliveryInfo = useCallback(
    (coords: Location.LocationObjectCoords): DeliveryInfo => {
      // Validate coordinates before calculation
      if (
        !coords.latitude ||
        !coords.longitude ||
        coords.latitude === 0 ||
        coords.longitude === 0 ||
        Math.abs(coords.latitude) > 90 ||
        Math.abs(coords.longitude) > 180
      ) {
        throw new Error("Invalid coordinates provided");
      }

      const distance = calculateDistance(
        STORE_LOCATION.latitude,
        STORE_LOCATION.longitude,
        coords.latitude,
        coords.longitude
      );

      const isWithinRange = distance <= MAX_DELIVERY_DISTANCE;
      const fee = isWithinRange
        ? BASE_DELIVERY_FEE + distance * DELIVERY_RATE_PER_KM
        : 0;

      return { distance, fee, isWithinRange };
    },
    [calculateDistance]
  );

  // Process location data
  const processLocation = useCallback(
    (locationData: Location.LocationObject) => {
      try {
        setUserLocation(locationData);
        const info = calculateDeliveryInfo(locationData.coords);
        setDeliveryInfo(info);
        setLocationError(null);

        if (!info.isWithinRange) {
          Alert.alert(
            "Delivery Not Available",
            `Sorry, we only deliver within ${MAX_DELIVERY_DISTANCE}km of our store. Your location is ${info.distance.toFixed(2)}km away.`
          );
        }
      } catch (error) {
        console.error("Error processing location:", error);
        setLocationError("Failed to calculate delivery information");
      }
    },
    [calculateDeliveryInfo]
  );

  // Get user's current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Location permission denied");
        Alert.alert(
          "Permission Required",
          "Please allow location access to calculate delivery fees"
        );
        return;
      }

      // Try to use cart's getLocation first, fallback to direct location request
      let locationData: Location.LocationObject;

      if (getLocation) {
        locationData = await getLocation();
      } else {
        locationData = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      processLocation(locationData);
    } catch (error) {
      console.error("Error getting location:", error);
      setLocationError("Failed to get your location");
      Alert.alert(
        "Location Error",
        "Unable to get your current location. Please try again."
      );
    } finally {
      setLocationLoading(false);
    }
  };

  // Initialize with existing location data
  useEffect(() => {
    if (location?.coords && !deliveryInfo) {
      // Only process if we have valid coordinates
      if (location.coords.latitude && location.coords.longitude) {
        processLocation(location);
      }
    }
  }, [location, deliveryInfo, processLocation]);

  const getTotalPrice = (): number => {
    if (!total || !deliveryInfo?.isWithinRange) return total || 0;
    return total + deliveryInfo.fee;
  };

  const hasValidLocation =
    (userLocation?.coords?.latitude && userLocation?.coords?.longitude) ||
    (location?.coords?.latitude && location?.coords?.longitude);
  const shouldShowDeliveryInfo = deliveryInfo && deliveryInfo.isWithinRange;
  const shouldShowLocationButton =
    !hasValidLocation || (!deliveryInfo && hasValidLocation);

  return (
    <>
      {/* Location and Delivery Section */}
      <View style={styles.deliverySection}>
        {shouldShowLocationButton && (
          <Button
            onPress={getCurrentLocation}
            loading={locationLoading}
            style={styles.locationButton}
          >
            <Text style={styles.locationButtonText}>
              {locationLoading
                ? "Getting Location..."
                : "Get Location for Delivery"}
            </Text>
          </Button>
        )}

        {locationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{locationError}</Text>
            <Button
              onPress={getCurrentLocation}
              loading={locationLoading}
              style={styles.retryButton}
            >
              <Text style={styles.locationButtonText}>Retry</Text>
            </Button>
          </View>
        )}

        {shouldShowDeliveryInfo && (
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryText}>
              Distance: {deliveryInfo.distance.toFixed(2)} km
            </Text>
            <Text style={styles.deliveryText}>
              Base delivery fee: RM{BASE_DELIVERY_FEE.toFixed(2)}
            </Text>
            <Text style={styles.deliveryText}>
              Distance charge: RM
              {(deliveryInfo.distance * DELIVERY_RATE_PER_KM).toFixed(2)} (
              {deliveryInfo.distance.toFixed(2)} km × RM{DELIVERY_RATE_PER_KM})
            </Text>
            <Text style={styles.deliveryTotal}>
              Total delivery: RM{deliveryInfo.fee.toFixed(2)}
            </Text>
          </View>
        )}

        {deliveryInfo && !deliveryInfo.isWithinRange && (
          <View style={styles.outOfRangeContainer}>
            <Text style={styles.outOfRangeText}>
              Delivery not available to your location (
              {deliveryInfo.distance.toFixed(2)} km away)
            </Text>
            <Text style={styles.outOfRangeSubtext}>
              We deliver within {MAX_DELIVERY_DISTANCE} km only
            </Text>
          </View>
        )}
      </View>

      {/* Pricing Section */}
      {items && items.length > 0 && (
        <View style={styles.pricingSection}>
          <Text style={styles.itemPrice}>
            Items: RM
            {items
              .reduce(
                (sum, item) => sum + item.productItem.price * item.quantity,
                0
              )
              .toFixed(2)}
          </Text>
          {shouldShowDeliveryInfo && (
            <>
              <Text style={styles.deliveryPrice}>
                Delivery: RM{deliveryInfo.fee.toFixed(2)}
              </Text>
              <Text style={styles.totalPrice}>
                Total: RM{getTotalPrice().toFixed(2)}
              </Text>
            </>
          )}
          {deliveryInfo && !deliveryInfo.isWithinRange && (
            <Text style={styles.pickupOnlyText}>
              Pickup only - delivery not available
            </Text>
          )}
        </View>
      )}
    </>
  );
};

export default DeliveryPricing;

const styles = StyleSheet.create({
  deliverySection: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e4e4e4",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  locationButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 0,
  },
  locationButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#fff5f5",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fed7d7",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  deliveryInfo: {
    gap: 6,
  },
  deliveryText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
  },
  deliveryTotal: {
    textAlign: "right",
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#d0d0d0",
  },
  outOfRangeContainer: {
    backgroundColor: "#fff3cd",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ffeaa7",
  },
  outOfRangeText: {
    color: "#856404",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  outOfRangeSubtext: {
    color: "#856404",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
  pricingSection: {
    padding: 16,
    marginTop: 12,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  itemPrice: {
    fontSize: 15,
    color: "#333",
    marginBottom: 6,
  },
  deliveryPrice: {
    fontSize: 15,
    color: "#333",
    marginBottom: 6,
  },
  totalPrice: {
    textAlign: "right",
    fontSize: 17,
    fontWeight: "700",
    color: "#000",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  pickupOnlyText: {
    fontSize: 14,
    color: "#856404",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
  },
});
