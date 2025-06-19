import { firestore } from "@/config/firebase";
import Button from "@/src/components/Button";
import { useAuth } from "@/src/providers/authProvider";
import { useCart } from "@/src/providers/CartProvider";
import * as Location from "expo-location";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const { logout, user, updateUserData, setUser } = useAuth();
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<
    "username" | "email" | "address" | null
  >(null);
  const [form, setForm] = useState({
    username: user?.username || "",
    email: user?.email || "",
    address: user?.address || "",
  });
  const { getLocation, calculateDeliveryFromAddress, cartItems } = useCart();

  const updateField = async (field: keyof typeof form) => {
    if (!user?.uid) return;
    await firestore()
      .collection("users")
      .doc(user.uid)
      .update({
        [field]: form[field],
      });
    const updated = await updateUserData(user?.uid);
    setUser(updated);
    setEditingField(null);
  };

  const handleEdit = (field: "username" | "email" | "address") => {
    setForm({
      username: user?.username || "",
      email: user?.email || "",
      address: user?.address || "",
    });
    setEditingField(field);
  };

  // Combined function to update address and recalculate delivery
  const updateAddressAndDelivery = async () => {
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

      const location = await getLocation();
      const [address] = await Location.reverseGeocodeAsync(location.coords);
      const fullAddress = `${address.name}, ${address.street}, ${address.postalCode}, ${address.city}, ${address.region}`;

      // Update user address in Firestore
      await firestore().collection("users").doc(user?.uid).update({
        address: fullAddress,
      });

      // Update local user data
      const updated = await updateUserData(user?.uid!);
      setUser(updated);

      // Calculate delivery for the new address
      let deliveryMessage = "Address updated successfully!";

      try {
        await calculateDeliveryFromAddress(fullAddress);

        // Check if user has items in cart to provide appropriate feedback
        if (cartItems && cartItems.length > 0) {
          deliveryMessage +=
            " Delivery information has been calculated for your cart items.";
        } else {
          deliveryMessage +=
            " Delivery rates are ready for when you add items to your cart.";
        }
      } catch (deliveryError) {
        console.error("Error calculating delivery:", deliveryError);
        deliveryMessage +=
          " However, there was an issue calculating delivery rates. You can recalculate them later.";
      }

      Alert.alert("Success", deliveryMessage);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Failed to get location. Please try again.");
    }
    setLocationLoading(false);
  };

  // Function to recalculate delivery for current address
  // const recalculateDeliveryOnly = async () => {
  //   if (user?.address) {
  //     try {
  //       await calculateDeliveryFromAddress(user.address);
  //       Alert.alert("Success", "Delivery information updated!");
  //     } catch (error) {
  //       Alert.alert("Error", "Failed to calculate delivery. Please try again.");
  //     }
  //   } else {
  //     Alert.alert("No Address", "Please set your address first.");
  //   }
  // };

  return (
    <View style={styles.container}>
      {/* Name */}
      <Text style={styles.label}>Name</Text>
      {editingField === "username" ? (
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text })}
          />
          <Button onPress={() => updateField("username")}>
            <Text>Save</Text>
          </Button>
        </View>
      ) : (
        <View style={styles.row}>
          <Text>{user?.username}</Text>
          <TouchableOpacity onPress={() => handleEdit("username")}>
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      {editingField === "email" ? (
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
          />
          <Button onPress={() => updateField("email")}>
            <Text>Save</Text>
          </Button>
        </View>
      ) : (
        <View style={styles.row}>
          <Text>{user?.email}</Text>
          <TouchableOpacity onPress={() => handleEdit("email")}>
            <Text style={styles.edit}>Edit</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Address */}
      <Text style={styles.label}>Address</Text>
      {user?.address ? (
        <View style={styles.row}>
          <Text style={styles.addressInRow}>{user.address}</Text>
          <TouchableOpacity
            onPress={updateAddressAndDelivery}
            disabled={locationLoading}
          >
            <Text style={[styles.edit, locationLoading && styles.editDisabled]}>
              {locationLoading ? "Updating..." : "Update"}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.row}>
          <Text style={styles.noAddressInRow}>No address set</Text>
          <TouchableOpacity
            onPress={updateAddressAndDelivery}
            disabled={locationLoading}
          >
            <Text style={[styles.edit, locationLoading && styles.editDisabled]}>
              {locationLoading ? "Setting..." : "Set Address"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Optional: Keep a separate button for recalculating delivery without updating address
      {user?.address && (
        <TouchableOpacity
          onPress={recalculateDeliveryOnly}
          style={styles.recalculateButton}
        >
          <Text style={styles.recalculateText}>Recalculate Delivery Only</Text>
        </TouchableOpacity>
      )} */}

      <TouchableOpacity
        onPress={logout}
        style={{
          marginTop: 16,
          backgroundColor: "#f44336",
          padding: 15,
          borderRadius: 8,
        }}
      >
        <Text
          style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
        >
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontWeight: "bold",
    marginTop: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    flex: 1,
    marginRight: 8,
    borderRadius: 6,
  },
  edit: {
    color: "#007bff",
    marginLeft: 8,
  },
  editDisabled: {
    color: "#ccc",
  },
  addressInRow: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginRight: 8,
  },
  noAddressInRow: {
    flex: 1,
    fontSize: 16,
    color: "#666",
    fontStyle: "italic",
    marginRight: 8,
  },
  recalculateButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  recalculateText: {
    color: "#28a745",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
