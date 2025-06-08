import { useFetchIdProducts } from "@/services/useFetchIdProduct";
import Loading from "@/src/components/Loading";
import { defaultPizzaImage } from "@/src/components/ProductListItem";
import { useCart } from "@/src/providers/CartProvider";
import { ProductItem } from "@/src/types";
import Button from "@components/Button";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const ProductDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { addItem } = useCart();
  const router = useRouter();
  const { product, loading, fetchProduct } = useFetchIdProducts();
  const [selectedItem, setSelectedItem] = useState<ProductItem>();

  useEffect(() => {
    if (id) {
      fetchProduct(id as string);
    }
  }, [id]);

  const addToCart = () => {
    if (!product || !selectedItem) {
      return;
    }
    addItem(product, selectedItem);
    // router.replace("/cart");
  };

  if (loading) return <Loading />;
  if (!product) {
    return <Text>Product not found</Text>;
  }

  return (
    <View style={styles.container}>
      {product && <Stack.Screen options={{ title: product.name }} />}
      <Image
        source={{ uri: product.images[0].uri || defaultPizzaImage }}
        style={styles.image}
      />

      <Text style={styles.itemsText}>Select an item:</Text>
      <View style={styles.items}>
        {product.items?.map((mapItem) => (
          <Pressable
            onPress={() => setSelectedItem(mapItem)}
            style={[
              styles.item,
              {
                backgroundColor:
                  selectedItem === mapItem ? "gainsboro" : "white",
              },
            ]}
            key={mapItem.name}
          >
            <Text
              style={[
                styles.itemsText,
                { color: selectedItem === mapItem ? "black" : "gray" },
              ]}
            >
              {mapItem.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {selectedItem && (
        <Text style={styles.price}>RM{selectedItem.price.toFixed(2)}</Text>
      )}

      {!selectedItem && product.price && (
        <Text style={styles.price}>{product.price}</Text>
      )}

      <Button onPress={addToCart} loading={loading}>
        <Text>Add to cart</Text>
      </Button>
    </View>
  );
};

export default ProductDetailsScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    flex: 1,
    padding: 10,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: "auto",
  },
  items: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  item: {
    backgroundColor: "gainsboro",
    width: 120,
    aspectRatio: 1.5,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemsText: {
    fontSize: 20,
    fontWeight: "500",
  },
});
