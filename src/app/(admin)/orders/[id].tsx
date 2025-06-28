import { firestore, storage } from "@/config/firebase";
import { updateOrder } from "@/services/orderService";
import { useDeliveryNotifications } from "@/services/useDeliveryNotifications";
import { useFetchIdOrders } from "@/services/useFetchIdOrder";
import { getPaymentByOrderId } from "@/services/useFetchIdPayment";
import Loading from "@/src/components/Loading";
import OrderItemListItem from "@/src/components/OrderItemListItem";
import { colors } from "@/src/constants/theme";
import {
  OrderStatus,
  OrderStatusList,
  OrderType,
  PaymentType,
} from "@/src/types";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const defaultPizzaImage =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png";

interface CustomerData {
  email: string;
  username: string;
  expoPushToken?: string;
  address?: string;
  [key: string]: any;
}

const OrdersDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { order, fetchOrder, loading: orderLoading } = useFetchIdOrders();
  const [currentOrder, setCurrentOrder] = useState<OrderType | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentType | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pickedImage, setPickedImage] = useState<string | null>(null);

  // Use the delivery notifications hook
  const { sendDeliveryNotification, sending } = useDeliveryNotifications();

  // Initial data loading
  useEffect(() => {
    if (id && typeof id === "string") {
      loadInitialData();
    }
  }, [id]);

  // Update current order when order data changes
  useEffect(() => {
    if (order) {
      setCurrentOrder(order);
      if (order.uid) {
        loadCustomerData(order.uid);
      }
    }
  }, [order]);

  const loadInitialData = async () => {
    if (!id || typeof id !== "string") return;

    try {
      // Load order data
      await fetchOrder(id);

      // Load payment data
      const payment = await getPaymentByOrderId(id);
      setPaymentData(payment);
    } catch (error) {
      console.error("Error loading initial data:", error);
      Alert.alert("Error", "Failed to load order details");
    }
  };

  // Function to load customer data from Firestore
  const loadCustomerData = async (userId: string) => {
    if (!userId) return;

    try {
      setLoadingCustomer(true);
      const userDoc = await firestore().collection("users").doc(userId).get();

      if (userDoc.exists()) {
        const data = userDoc.data() as CustomerData;
        setCustomerData(data);
        console.log("Customer data loaded:", {
          email: data.email,
          hasToken: !!data.expoPushToken,
        });
      } else {
        console.warn("Customer document not found for userId:", userId);
        setCustomerData(null);
      }
    } catch (error) {
      console.error("Error loading customer data:", error);
      Alert.alert("Warning", "Could not load customer information");
    } finally {
      setLoadingCustomer(false);
    }
  };

  const pickImageAndUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access media library is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setPickedImage(imageUri);
      uploadImageToFirebase(imageUri);
    }
  };

  const uploadImageToFirebase = async (imageUri: string) => {
    setUploading(true);
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const filename = `payment_proofs/${order?.uid}_${Date.now()}.jpg`;
      const storageRef = storage().ref(filename);
      await storageRef.put(blob);

      const downloadURL = await storageRef.getDownloadURL();
      console.log("Uploaded image URL:", downloadURL);

      // Optionally update Firestore or your local state with this URL
      setPickedImage(downloadURL); // or save to your database
    } catch (error) {
      console.error("Image upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  // Enhanced status update function with delivery notification
  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!currentOrder) {
      Alert.alert("Error", "Order data not available");
      return;
    }

    Alert.alert(
      "Update Status",
      `Are you sure you want to update the status to ${newStatus}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              // Update order status in database
              const updatedOrder: OrderType = {
                ...currentOrder,
                status: newStatus,
              };

              const result = await updateOrder(updatedOrder);

              if (result.success) {
                setCurrentOrder(updatedOrder);

                // Send delivery notification if status is "Delivered"
                if (newStatus.toLowerCase() === "delivered") {
                  await handleDeliveryNotification(updatedOrder);
                } else {
                  Alert.alert(
                    "Success",
                    `Order status updated to ${newStatus}`
                  );
                }
              } else {
                console.warn("Failed to update status:", result.msg);
                Alert.alert(
                  "Error",
                  result.msg || "Failed to update order status"
                );
              }
            } catch (error) {
              console.error("Error updating order status:", error);
              Alert.alert(
                "Error",
                "Something went wrong while updating the order"
              );
            }
          },
        },
      ]
    );
  };

  // Function to handle delivery notification
  const handleDeliveryNotification = async (order: OrderType) => {
    try {
      // Check if customer data is available
      if (!customerData) {
        Alert.alert(
          "Notice",
          "Order marked as delivered, but customer information is not available."
        );
        return;
      }

      // Check if customer has push token
      if (!customerData.expoPushToken) {
        console.log("Customer doesn't have push token registered");
        Alert.alert(
          "Notice",
          "Order marked as delivered, but customer doesn't have notifications enabled."
        );
        return;
      }

      // Prepare order details for notification
      const orderItems =
        order.orderItems?.map(
          (item) => `${item.quantity}x ${item.productName || "Item"}`
        ) || [];

      console.log("Sending delivery notification for order:", order.id);

      const notificationResult = await sendDeliveryNotification({
        orderId: order.id!,
        customerUid: order.uid!,
        orderDetails: {
          items: orderItems,
          totalAmount: order.total || 0,
          deliveryAddress: customerData.address || "Your address",
        },
      });

      if (notificationResult.success) {
        Alert.alert(
          "Success",
          "Order marked as delivered and customer has been notified!"
        );
      } else {
        console.warn(
          "Failed to send delivery notification:",
          notificationResult.error
        );
        Alert.alert(
          "Warning",
          "Order marked as delivered, but failed to send notification to customer."
        );
      }
    } catch (error) {
      console.error("Error sending delivery notification:", error);
      Alert.alert(
        "Warning",
        "Order marked as delivered, but there was an issue sending the notification."
      );
    }
  };

  // Pull to refresh functionality
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInitialData();
      if (currentOrder?.uid) {
        await loadCustomerData(currentOrder.uid);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [id, currentOrder?.uid]);

  // Render customer info component
  const renderCustomerInfo = () => {
    if (loadingCustomer) {
      return (
        <View style={styles.customerInfoContainer}>
          <ActivityIndicator size="small" color={colors.light.tint} />
          <Text style={styles.loadingText}>Loading customer info...</Text>
        </View>
      );
    }

    if (!customerData) {
      return (
        <View style={[styles.customerInfoContainer, styles.warningContainer]}>
          <Text style={styles.customerInfoTitle}>Customer Info:</Text>
          <Text style={styles.warningText}>
            Customer information not available
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.customerInfoContainer}>
        <Text style={styles.customerInfoTitle}>Customer Info:</Text>
        <Text style={styles.customerInfoText}>Email: {customerData.email}</Text>
        <Text style={styles.customerInfoText}>
          Username: {customerData.username}
        </Text>
        <Text
          style={[
            styles.customerInfoText,
            {
              color: customerData.expoPushToken ? "green" : "orange",
              fontWeight: "500",
            },
          ]}
        >
          Push Notifications:{" "}
          {customerData.expoPushToken ? "Enabled ✓" : "Not Available ⚠️"}
        </Text>
        {customerData.address && (
          <Text style={styles.customerInfoText}>
            Address: {customerData.address}
          </Text>
        )}
      </View>
    );
  };

  // Render payment section
  const renderPaymentSection = () => (
    <>
      <Text style={styles.sectionTitle}>Payment Proof</Text>

      {uploading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.light.tint} />
          <Text style={styles.loadingText}>Uploading image...</Text>
        </View>
      ) : pickedImage || paymentData?.imageUrl ? (
        <Image
          source={{ uri: pickedImage || paymentData?.imageUrl }}
          style={styles.paymentImage}
          contentFit="contain"
          placeholder={require("@assets/images/placeholder.png")}
          transition={500}
        />
      ) : (
        <TouchableOpacity
          onPress={pickImageAndUpload}
          style={styles.uploadButton}
        >
          <Text style={styles.uploadButtonText}>Upload Payment Proof</Text>
        </TouchableOpacity>
      )}

      {/* Show a button to replace the image if already uploaded */}
      {(pickedImage || paymentData?.imageUrl) && (
        <TouchableOpacity
          onPress={pickImageAndUpload}
          style={styles.replaceButton}
        >
          <Text style={styles.replaceButtonText}>Replace Image</Text>
        </TouchableOpacity>
      )}
    </>
  );

  // Show loading screen
  if (orderLoading || !order) {
    return (
      <View style={styles.loadingScreen}>
        <Loading />
        <Text style={styles.loadingScreenText}>Loading order...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: `Order #${id}` }} />
      <FlatList
        data={order.orderItems}
        renderItem={({ item }) => <OrderItemListItem item={item} />}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.light.tint}
          />
        }
        ListFooterComponent={() => (
          <>
            <Text style={styles.sectionTitle}>Order Status</Text>

            {/* Customer Info Display */}
            {renderCustomerInfo()}

            {/* Status Buttons */}
            <View style={styles.statusButtonsContainer}>
              {OrderStatusList.map((status) => {
                const isCurrentStatus = currentOrder?.status === status;
                const isDeliveredButton = status.toLowerCase() === "delivered";
                const isDisabled = sending && isDeliveredButton;

                return (
                  <Pressable
                    key={status}
                    onPress={() => handleStatusUpdate(status)}
                    disabled={isDisabled}
                    style={[
                      styles.statusButton,
                      {
                        backgroundColor: isCurrentStatus
                          ? colors.light.tint
                          : "transparent",
                        opacity: isDisabled ? 0.6 : 1,
                      },
                    ]}
                  >
                    {isDisabled ? (
                      <ActivityIndicator
                        size="small"
                        color={isCurrentStatus ? "#fff" : colors.light.tint}
                      />
                    ) : (
                      <Text
                        style={[
                          styles.statusButtonText,
                          {
                            color: isCurrentStatus ? "#fff" : "#000",
                            fontWeight: isCurrentStatus ? "bold" : "normal",
                          },
                        ]}
                      >
                        {status}
                        {isDeliveredButton && " 📦"}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {/* Payment Section */}
            {renderPaymentSection()}

            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <Text style={styles.summaryText}>Order ID: #{order.id}</Text>
              <Text style={styles.summaryText}>
                Total: ${order.total?.toFixed(2) || "0.00"}
              </Text>
              <Text style={styles.summaryText}>
                Status: {currentOrder?.status || "Unknown"}
              </Text>
              <Text style={styles.summaryText}>
                Items: {order.orderItems?.length || 0}
              </Text>
              {customerData && (
                <Text style={styles.summaryText}>
                  Customer: {customerData.username} ({customerData.email})
                </Text>
              )}
            </View>
          </>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingScreenText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  listContainer: {
    gap: 10,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
  },
  customerInfoContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  warningContainer: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffeaa7",
    borderWidth: 1,
  },
  customerInfoTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 8,
  },
  customerInfoText: {
    fontSize: 14,
    marginBottom: 4,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    justifyContent: "center",
  },
  loadingText: {
    marginLeft: 10,
    color: "#666",
  },
  warningText: {
    color: "#856404",
    fontStyle: "italic",
  },
  statusButtonsContainer: {
    flexDirection: "row",
    gap: 5,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  statusButton: {
    borderColor: colors.light.tint,
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    minWidth: 90,
    alignItems: "center",
  },
  statusButtonText: {
    fontSize: 14,
  },
  paymentImage: {
    width: "100%",
    aspectRatio: 1.2,
    borderRadius: 10,
    marginTop: 10,
  },
  noPaymentContainer: {
    backgroundColor: "#f5f5f5",
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  noPaymentText: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
  },
  summaryContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  uploadButton: {
    padding: 12,
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  uploadButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  replaceButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  replaceButtonText: {
    color: colors.light.tint,
    textDecorationLine: "underline",
  },
});

export default OrdersDetailsScreen;
