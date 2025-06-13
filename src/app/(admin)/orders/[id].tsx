import { firestore } from "@/config/firebase";
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
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

export const defaultPizzaImage =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png";

const OrdersDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { order, fetchOrder } = useFetchIdOrders();
  const [currentOrder, setCurrentOrder] = useState<OrderType | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentType | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);

  // Use the delivery notifications hook
  const { sendDeliveryNotification, sending } = useDeliveryNotifications();

  useEffect(() => {
    const loadPayment = async () => {
      if (id) {
        fetchOrder(id as string);
        const payment = await getPaymentByOrderId(id as string);
        setPaymentData(payment);
      }
    };
    loadPayment();
  }, [id]);

  useEffect(() => {
    if (order) {
      setCurrentOrder(order);
      // Load customer data when order is available
      loadCustomerData(order.uid!);
    }
  }, [order]);

  // Function to load customer data from Firestore
  const loadCustomerData = async (userId: string) => {
    try {
      const userDoc = await firestore().collection("users").doc(userId).get();
      if (userDoc.exists()) {
        setCustomerData(userDoc.data());
      }
    } catch (error) {
      console.error("Error loading customer data:", error);
    }
  };

  // Enhanced status update function with delivery notification
  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!currentOrder) return;

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
              const updatedOrder = {
                ...currentOrder,
                status: newStatus,
              };

              const result = await updateOrder(updatedOrder);

              if (result.success) {
                setCurrentOrder(updatedOrder);

                // Send delivery notification if status is "Delivered"
                if (newStatus.toLowerCase() === "delivered") {
                  await handleDeliveryNotification(updatedOrder);
                }

                Alert.alert(
                  "Success",
                  newStatus.toLowerCase() === "delivered"
                    ? "Order marked as delivered and customer has been notified!"
                    : `Order status updated to ${newStatus}`
                );
              } else {
                console.warn("Failed to update status:", result.msg);
                Alert.alert("Error", "Failed to update order status");
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
      if (!customerData?.expoPushToken) {
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

      const notificationResult = await sendDeliveryNotification({
        orderId: order.id!,
        customerUid: order.uid!,
        orderDetails: {
          items: orderItems,
          totalAmount: order.total || 0,
          deliveryAddress: customerData?.address || "Your address",
        },
      });

      if (!notificationResult.success) {
        console.warn("Failed to send delivery notification");
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

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Loading />
        <Text style={{ marginTop: 10 }}>Loading order...</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 10 }}>
      <Stack.Screen options={{ title: `Order #${id}` }} />
      <FlatList
        data={order.orderItems}
        renderItem={({ item }) => <OrderItemListItem item={item} />}
        contentContainerStyle={{ gap: 10 }}
        ListFooterComponent={() => (
          <>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 20 }}>
              Order Status
            </Text>

            {/* Customer Info Display */}
            {customerData && (
              <View
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: 10,
                  borderRadius: 8,
                  marginVertical: 10,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Customer Info:</Text>
                <Text>Email: {customerData.email}</Text>
                <Text>Username: {customerData.username}</Text>
                <Text
                  style={{
                    color: customerData.expoPushToken ? "green" : "orange",
                  }}
                >
                  Push Notifications:{" "}
                  {customerData.expoPushToken
                    ? "Enabled ✓"
                    : "Not Available ⚠️"}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 5, flexWrap: "wrap" }}>
              {OrderStatusList.map((status) => (
                <Pressable
                  key={status}
                  onPress={() => handleStatusUpdate(status)}
                  disabled={sending}
                  style={{
                    borderColor: colors.light.tint,
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 5,
                    marginVertical: 5,
                    backgroundColor:
                      currentOrder?.status === status
                        ? colors.light.tint
                        : "transparent",
                    opacity: sending ? 0.6 : 1,
                    minWidth: 80,
                    alignItems: "center",
                  }}
                >
                  {sending && status.toLowerCase() === "delivered" ? (
                    <ActivityIndicator
                      size="small"
                      color={
                        currentOrder?.status === status
                          ? "#fff"
                          : colors.light.tint
                      }
                    />
                  ) : (
                    <Text
                      style={{
                        color:
                          currentOrder?.status === status ? "#fff" : "#000",
                        fontWeight:
                          currentOrder?.status === status ? "bold" : "normal",
                      }}
                    >
                      {status}
                      {status.toLowerCase() === "delivered" && " 📦"}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>

            {/* Payment Image Section */}
            <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 20 }}>
              Payment Proof
            </Text>
            {paymentData?.imageUrl ? (
              <Image
                source={{ uri: paymentData.imageUrl }}
                style={{
                  width: "100%",
                  aspectRatio: 1.2,
                  borderRadius: 10,
                  marginTop: 10,
                }}
                contentFit="contain"
                placeholder={require("@assets/images/placeholder.png")}
                transition={500}
              />
            ) : (
              <View
                style={{
                  backgroundColor: "#f5f5f5",
                  padding: 20,
                  borderRadius: 10,
                  marginTop: 10,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    fontSize: 16,
                    color: "#666",
                  }}
                >
                  No payment image available.
                </Text>
              </View>
            )}

            {/* Order Summary */}
            <View
              style={{
                backgroundColor: "#f9f9f9",
                padding: 15,
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <Text
                style={{ fontWeight: "bold", fontSize: 16, marginBottom: 10 }}
              >
                Order Summary
              </Text>
              <Text>Order ID: #{order.id}</Text>
              <Text>Total: ${order.total?.toFixed(2) || "0.00"}</Text>
              <Text>Status: {currentOrder?.status}</Text>
              <Text>Items: {order.orderItems?.length || 0}</Text>
            </View>
          </>
        )}
      />
    </View>
  );
};

export default OrdersDetailsScreen;
