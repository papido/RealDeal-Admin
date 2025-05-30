import { colors } from "@/src/constants/theme";
import { Router, useSegments } from "expo-router";
import React from "react";
import { Image, Pressable, StyleSheet, Text } from "react-native";
import { ProductType } from "../types";

export const defaultPizzaImage =
  "https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/default.png";

type ProductListItemProps = {
  product: ProductType;
  router: Router;
};

const ProductListItem = ({ product, router }: ProductListItemProps) => {
  const segments = useSegments();
  const handleNavigate = () => {
    if (segments[0] === "(user)" && segments[1] === "menu") {
      router.push(`/(user)/menu/${product.id}`);
    } else {
      router.push(`/(admin)/menu/${product.id}`);
    }
  };

  return (
    <Pressable onPress={handleNavigate} style={styles.container}>
      <Image
        source={{ uri: product.images?.[0]?.uri || defaultPizzaImage }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>{product.price}</Text>
    </Pressable>
  );
};

export default ProductListItem;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    flex: 1,
    maxWidth: "50%",
  },
  image: {
    width: "100%",
    aspectRatio: 1.2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 3,
  },

  price: {
    color: colors.neutral500,
    fontWeight: "bold",
  },
});
