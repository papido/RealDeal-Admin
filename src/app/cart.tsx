import { useCart } from "@/src/providers/CartProvider";
import { FlatList, Text, View } from "react-native";
import Button from "../components/Button";
import CartListItem from "../components/CartListItem";

const CartScreen = () => {
  const { items, total, checkout, loading } = useCart();

  return (
    <View style={{ padding: 10 }}>
      <FlatList
        data={items}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
        contentContainerStyle={{ gap: 10 }}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40 }}>
            Your cart is empty.
          </Text>
        }
      />

      {items.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 20, fontWeight: "500" }}>
            Total: RM{total.toFixed(2)}
          </Text>
          <Button onPress={checkout} loading={loading}>
            <Text>Checkout</Text>
          </Button>
        </View>
      )}
    </View>
  );
};

export default CartScreen;
