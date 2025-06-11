import { updateOrder } from "@/services/orderService";
import { useFetchIdOrders } from "@/services/useFetchIdOrder";
import { getPaymentByOrderId } from "@/services/useFetchIdPayment";
import OrderItemListItem from "@/src/components/OrderItemListItem";
import { colors } from "@/src/constants/theme";
import { OrderStatusList, OrderType, PaymentType } from "@/src/types";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, Text, View } from "react-native";

export const defaultPizzaImage =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png";

const OrdersDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { order, fetchOrder } = useFetchIdOrders();
  const [currentOrder, setCurrentOrder] = useState<OrderType | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentType | null>(null);

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
    }
  }, [order]);

  if (!order) {
    return <Text>Order not found</Text>;
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
            <Text style={{ fontWeight: "bold" }}>Status</Text>
            <View style={{ flexDirection: "row", gap: 5 }}>
              {OrderStatusList.map((status) => (
                <Pressable
                  key={status}
                  onPress={async () => {
                    Alert.alert(
                      "Update Status",
                      `Are you sure you want to update the status to ${status}?`,
                      [
                        {
                          text: "Cancel",
                          style: "cancel",
                        },
                        {
                          text: "OK",
                          onPress: async () => {
                            const updatedOrder = {
                              ...currentOrder,
                              status: status,
                            };
                            const result = await updateOrder(updatedOrder);
                            if (result.success) {
                              setCurrentOrder(updatedOrder);
                            } else {
                              console.warn(
                                "Failed to update status:",
                                result.msg
                              );
                            }
                          },
                        },
                      ]
                    );
                  }}
                  style={{
                    borderColor: colors.light.tint,
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 5,
                    marginVertical: 10,
                    backgroundColor:
                      currentOrder?.status === status
                        ? colors.light.tint
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      color: currentOrder?.status === status ? "#fff" : "#000",
                    }}
                  >
                    {status}
                  </Text>
                </Pressable>
              ))}
            </View>
            {paymentData?.imageUrl ? (
              <Image
                source={{ uri: paymentData.imageUrl }}
                style={{ width: "100%", aspectRatio: 1.2, borderRadius: 10 }}
                contentFit="contain"
              />
            ) : (
              <>
                <Text
                  style={{
                    textAlign: "center",
                    marginTop: 30,
                    fontSize: 20,
                    fontWeight: "bold",
                  }}
                >
                  No payment image available.
                </Text>
              </>
            )}
          </>
        )}
      />
    </View>
  );
};

export default OrdersDetailsScreen;
