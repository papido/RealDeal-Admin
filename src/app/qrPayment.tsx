import Button from "@/src/components/Button";
import { useCart } from "@/src/providers/CartProvider";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

const UploadPaymentScreen = () => {
  const [image, setImage] = useState<string | null>(null);

  const { submitPayment, order, loading } = useCart();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const handleUpload = async () => {
    if (!image) return alert("Please fill in all fields.");
    try {
      await submitPayment(image);
      setImage(null);
      router.replace("/(user)/orders");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.label}>Order ID: {order.id}</Text>
        <Text style={styles.label}>Date & Time: {order.deliveryDateTime}</Text>
        <Text style={styles.label}>Scan this QR with Maybank App:</Text>
        <Image
          source={require("@assets/images/exampleQR.jpeg")}
          style={styles.image}
        />
        <Text style={styles.label}>Upload Payment Proof Below:</Text>
        <Button style={styles.button} onPress={pickImage}>
          <Text style={{ color: "white" }}>Pick Transfer Screenshot</Text>
        </Button>
        {image && <Image source={{ uri: image }} style={styles.image} />}
        <Button style={styles.button} onPress={handleUpload} loading={loading}>
          <Text style={{ color: "white" }}>Submit Payment</Text>
        </Button>
      </View>
    </ScrollView>
  );
};

export default UploadPaymentScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: 40,
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 20,
    marginVertical: 10,
    textAlign: "center",
  },
  image: {
    width: 400,
    height: 400,
    marginTop: 10,
    resizeMode: "contain",
  },
  input: { borderBottomWidth: 1, width: "80%", marginVertical: 10 },
  button: { marginTop: 10, width: "50%" },
});
