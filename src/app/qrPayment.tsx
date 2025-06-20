import Button from "@/src/components/Button";
import { useCart } from "@/src/providers/CartProvider";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const UploadPaymentScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const { submitPayment, order, loading } = useCart();
  const { showActionSheetWithOptions } = useActionSheet();

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

  const handleSaveImage = async () => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "Cannot save image without permission."
      );
      return;
    }

    try {
      const fileUri = FileSystem.documentDirectory + "qr_image.jpg";
      const assetUri = Image.resolveAssetSource(
        require("@assets/images/exampleQR.jpeg")
      ).uri;

      const downloadResumable = FileSystem.createDownloadResumable(
        assetUri,
        fileUri
      );
      const downloadResult = await downloadResumable.downloadAsync();
      if (!downloadResult?.uri) {
        Alert.alert("Error", "Failed to download image.");
        return;
      }

      await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
      Alert.alert("Success", "QR image saved to your gallery!");
    } catch (error) {
      console.error("Error saving image:", error);
      Alert.alert("Error", "Failed to save image.");
    }
  };

  const onLongPressQR = () => {
    showActionSheetWithOptions(
      {
        options: ["Save Image", "Cancel"],
        cancelButtonIndex: 1,
      },
      async (selectedIndex) => {
        if (selectedIndex === 0) {
          await handleSaveImage();
        }
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.label}>Order ID: {order.id}</Text>
        <Text style={styles.label}>Date & Time: {order.deliveryDateTime}</Text>
        <Text style={styles.label}>Scan this QR with Maybank App:</Text>

        <TouchableWithoutFeedback onLongPress={onLongPressQR}>
          <Image
            source={require("@assets/images/exampleQR.jpeg")}
            style={styles.image}
          />
        </TouchableWithoutFeedback>

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
