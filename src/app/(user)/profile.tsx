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
  const { getLocation } = useCart();

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

      const location = await getLocation();
      const [address] = await Location.reverseGeocodeAsync(location.coords);

      const fullAddress = `${address.name}, ${address.street}, ${address.postalCode}, ${address.city}, ${address.region}`;

      await firestore().collection("users").doc(user?.uid).update({
        address: fullAddress,
      });

      const updated = await updateUserData(user?.uid!);
      setUser(updated);
    } catch (error) {
      console.error("Error getting location:", error);
    }
    setLocationLoading(false);
  };

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
        editingField === "address" ? (
          <View style={styles.row}>
            <TextInput
              style={styles.input}
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
            />
            <Button onPress={() => updateField("address")}>
              <Text>Save</Text>
            </Button>
          </View>
        ) : (
          <View style={styles.row}>
            <Text>{user?.address}</Text>
            <TouchableOpacity onPress={() => handleEdit("address")}>
              <Text style={styles.edit}>Edit</Text>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <Button
          onPress={getCurrentLocation}
          loading={locationLoading}
          style={styles.locationButton}
        >
          <Text>Get Location</Text>
        </Button>
      )}

      <Button onPress={logout}>
        <Text>Sign Out</Text>
      </Button>
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
  locationButton: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
});
