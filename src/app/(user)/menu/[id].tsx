import { useFetchId } from "@/services/useFetchId";
import Loading from "@/src/components/Loading";
import { defaultPizzaImage } from "@/src/components/ProductListItem";
import { useCart } from "@/src/providers/CartProvider";
import { PizzaSize } from "@/src/types";
import Button from "@components/Button";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const sizes: PizzaSize[] = ["S", "M", "L", "XL"];

const ProductDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { addItem } = useCart();
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("M");
  const { product, loading, fetchProduct } = useFetchId();

  useEffect(() => {
    if (id) {
      fetchProduct(id as string);
    }
  }, [id]);

  const addToCart = () => {
    if (!product) {
      return;
    }
    addItem(product, selectedSize);
    router.push("/cart");
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

      <Text>Select size</Text>
      <View style={styles.sizes}>
        {sizes.map((size) => (
          <Pressable
            onPress={() => setSelectedSize(size)}
            style={[
              styles.size,
              {
                backgroundColor: selectedSize === size ? "gainsboro" : "white",
              },
            ]}
            key={size}
          >
            <Text
              style={[
                styles.sizeText,
                { color: selectedSize === size ? "black" : "gray" },
              ]}
            >
              {size}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.price}>RM{product.price1}</Text>
      <Button onPress={addToCart}>
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
  sizes: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 10,
  },
  size: {
    backgroundColor: "gainsboro",
    width: 50,
    aspectRatio: 1,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  sizeText: {
    fontSize: 20,
    fontWeight: "500",
  },
});
