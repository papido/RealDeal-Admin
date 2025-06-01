import { useFetchIdOrders } from "@/services/useFetchIdOrder";
import Loading from "@/src/components/Loading";
import OrderItemListItem from "@/src/components/OrderItemListItem";
import OrderListItem from "@/src/components/OrderListItem";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, Text, View } from "react-native";

const OrdersDetailsScreen = () => {
  const { order, loading, fetchOrder } = useFetchIdOrders();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    if (id) {
      fetchOrder(id as string);
    }
  }, [id]);

  if (loading) return <Loading />;
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
        ListHeaderComponent={() => <OrderListItem order={order} />}
      />
    </View>
  );
};

export default OrdersDetailsScreen;
