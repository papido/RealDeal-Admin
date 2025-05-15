import { useCart } from "@/src/providers/CartProvider";
import { FlatList, Text, View } from "react-native";
import Button from "../components/Button";
import CartListItem from "../components/CartListItem";

const CartScreen = () => {
  const { items, total } = useCart();

  return (
    <View style={{ padding: 10 }}>
      <FlatList
        data={items}
        renderItem={({ item }) => <CartListItem cartItem={item} />}
        contentContainerStyle={{ gap: 10 }}
      />

      <Text style={{ marginTop: 20, fontSize: 20, fontWeight: "500" }}>
        Total: RM{total}
      </Text>
      <Button text="Checkout" />
    </View>
  );
};

export default CartScreen;
