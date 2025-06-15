import useFetchData from "@/services/useFetchData";
import Loading from "@/src/components/Loading";
import OrderListItem from "@/src/components/OrderListItem";
import { useAuth } from "@/src/providers/authProvider";
import { OrderType } from "@/src/types";
import { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

const ArchiveScreen = () => {
  const { user } = useAuth();
  const { data: orders, loading } = useFetchData<OrderType>(
    "orders",
    (ref) =>
      user?.uid
        ? ref.where("uid", "==", user.uid).orderBy("createdAt", "desc")
        : ref.where("uid", "==", "__INVALID_UID__") // This will return empty results
  );

  const activeOrders = useMemo(() => {
    return orders.filter((order) => order.status === "Delivered");
  }, [orders]);

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      {activeOrders.length > 0 ? (
        <FlatList
          data={activeOrders}
          renderItem={({ item }) => <OrderListItem order={item} />}
          contentContainerStyle={{ gap: 10, padding: 10 }}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.text}>No orders found</Text>
        </View>
      )}
    </View>
  );
};

export default ArchiveScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "stretch",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
