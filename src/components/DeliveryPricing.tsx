import * as Location from "expo-location";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useCart } from "../providers/CartProvider";
import Button from "./Button";

const DELIVERY_RATE_PER_KM = 2.5; // RM 2.50 per km
const BASE_DELIVERY_FEE = 5.0; // RM 5.00 base fee
const STORE_LOCATION = {
  latitude: 3.0738, // Replace with your store's coordinates
  longitude: 101.5183, // Klang, Selangor coordinates as example
};
const MAX_DELIVERY_DISTANCE = 25; // km

const DeliveryPricing = () => {
  const [userLocation, setUserLocation] =
    useState<Location.LocationObject | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const { total, items } = useCart();

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
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
  };

  // Get user's current location
  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Permission to access location was denied"
        );
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location);

      const calculatedDistance = calculateDistance(
        STORE_LOCATION.latitude,
        STORE_LOCATION.longitude,
        location.coords.latitude,
        location.coords.longitude
      );
      setDistance(calculatedDistance);
      if (calculatedDistance > MAX_DELIVERY_DISTANCE) {
        Alert.alert(
          "Delivery Not Available",
          `Sorry, we only deliver within ${MAX_DELIVERY_DISTANCE}km of our store. Your location is ${calculatedDistance.toFixed(
            2
          )}km away.`
        );
        setLocationLoading(false);
        return;
      }
      const calculatedDeliveryFee =
        BASE_DELIVERY_FEE + calculatedDistance * DELIVERY_RATE_PER_KM;
      setDeliveryFee(calculatedDeliveryFee);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get your location");
    } finally {
      setLocationLoading(false);
    }
  };

  const getTotalPrice = () => {
    if (!total) return 0;
    return total + deliveryFee;
  };
  return (
    <>
      {/* Location and Delivery Section */}
      <View style={styles.deliverySection}>
        {!userLocation && (
          <Button
            onPress={getCurrentLocation}
            loading={locationLoading}
            style={styles.locationButton}
          >
            <Text style={styles.locationButtonText}>
              {userLocation ? "Update Location" : "Get My Location"}
            </Text>
          </Button>
        )}

        {userLocation && (
          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryText}>
              Distance: {distance.toFixed(2)} km
            </Text>
            <Text style={styles.deliveryText}>
              Base delivery fee: RM{BASE_DELIVERY_FEE.toFixed(2)}
            </Text>
            <Text style={styles.deliveryText}>
              Distance charge: RM{(distance * DELIVERY_RATE_PER_KM).toFixed(2)}{" "}
              ({distance.toFixed(2)} km × RM{DELIVERY_RATE_PER_KM})
            </Text>
            <Text style={styles.deliveryTotal}>
              Total delivery: RM{deliveryFee.toFixed(2)}
            </Text>
          </View>
        )}
      </View>

      {/* Pricing Section */}
      {items && items.length > 0 && (
        <View style={styles.pricingSection}>
          <Text style={styles.itemPrice}>
            Item: RM
            {items
              .reduce(
                (sum, item) => sum + item.productItem.price * item.quantity,
                0
              )
              .toFixed(2)}
          </Text>
          {deliveryFee > 0 && (
            <>
              <Text style={styles.deliveryPrice}>
                Delivery: RM{deliveryFee.toFixed(2)}
              </Text>
              <Text style={styles.totalPrice}>
                Total: RM{getTotalPrice().toFixed(2)}
              </Text>
            </>
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
  locationButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
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
});
