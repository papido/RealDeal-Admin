import { useFetchIdProducts } from "@/services/useFetchProduct";
import Loading from "@/src/components/Loading";
import { defaultPizzaImage } from "@/src/components/ProductListItem";
import { colors } from "@/src/constants/theme";
import { FontAwesome } from "@expo/vector-icons";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const ProductDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { product, loading, fetchProduct } = useFetchIdProducts();

  useEffect(() => {
    if (id) {
      fetchProduct(id as string);
    }
  }, [id]);

  if (loading) return <Loading />;
  if (!product) {
    return <Text>Product not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href={`/menu/create?id=${id}`} asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="pencil"
                    size={25}
                    color={colors.neutral900}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <Stack.Screen options={{ title: product.name }} />
      <Image
        source={{ uri: product.images[0].uri || defaultPizzaImage }}
        style={styles.image}
      />
      <Text style={styles.title}>{product?.name}</Text>
      <Text style={styles.price}>{product.price}</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
