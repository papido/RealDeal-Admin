import products from "@/assets/data/products";
import { colors } from "@/src/constants/theme";
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

const product = products[1];

const index = () => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>RM{product.price}</Text>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
  },

  price: {
    color: colors.neutral500,
    fontWeight: "bold",
  },
});
