import Button from "@/src/components/Button";
import { useCart } from "@/src/providers/CartProvider";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { FontAwesome } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  Linking,
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
  const [buttonTrigger, setButtonTrigger] = useState(false);

  const openWhatsApp = () => {
    let phoneNumber = "+60126878323";
    let message = "This is my qr payment transfer.";

    let url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          alert("Make sure WhatsApp is installed on your device");
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error("An error occurred", err));
    setButtonTrigger(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });

    if (!result.canceled) setImage(result.assets[0].uri);
    setButtonTrigger(true);
  };

  const handleUpload = async () => {
    if (!buttonTrigger) {
      return Alert.alert(
        "Send QR Receipt",
        "Do you want to send the QR receipt on WhatsApp?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => openWhatsApp(),
          },
        ],
        { cancelable: true }
      );
    }
    try {
      await submitPayment(image ?? "");
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
        <Text style={styles.label}>
          Long Press Image Below to Save To Gallery &{"\n"}Scan with Maybank
          App:
        </Text>

        <TouchableWithoutFeedback onLongPress={onLongPressQR}>
          <Image
            source={require("@assets/images/exampleQR.jpeg")}
            style={styles.image}
          />
        </TouchableWithoutFeedback>

        <Text style={styles.label}>
          Upload Payment Proof Below &{"\n"}Press Continue Order:
        </Text>
        <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
          <Button style={styles.imageButton} onPress={pickImage}>
            <Text style={{ color: "white" }}>Pick Transfer Screenshot</Text>
          </Button>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>OR</Text>
          <Button onPress={openWhatsApp} style={styles.whatsappButton}>
            <FontAwesome
              name="whatsapp"
              size={24}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "white", textAlign: "center" }}>
              Send on WhatsApp
            </Text>
          </Button>
        </View>

        {image && <Image source={{ uri: image }} style={styles.image} />}
        <Button style={styles.button} onPress={handleUpload} loading={loading}>
          <Text style={{ color: "white" }}>Continue Order →</Text>
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
  imageButton: {
    alignItems: "center",
    backgroundColor: "brown",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 20,
    elevation: 2,
  },
  whatsappButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#25D366",
    paddingHorizontal: 10,
    borderRadius: 20,
    elevation: 2,
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
