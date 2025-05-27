import { firestore } from "@/config/firebase";
import { defaultPizzaImage } from "@/src/components/ProductListItem";
import { colors } from "@/src/constants/theme";
import { useCart } from "@/src/providers/CartProvider";
import { PizzaSize, ProductType } from "@/src/types";
import { FontAwesome } from "@expo/vector-icons";
import { Link, Stack, useLocalSearchParams } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const sizes: PizzaSize[] = ["S", "M", "L", "XL"];

const ProductDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<PizzaSize>("M");
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const productDoc = await getDoc(doc(firestore, "products", id as string));
      if (productDoc.exists()) {
        setProduct({ id: productDoc.id, ...productDoc.data() } as ProductType);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  // const addToCart = () => {
  //   if (!product) {
  //     return;
  //   }
  //   addItem(product, selectedSize);
  //   router.push("/cart");
  // };

  // if (!product) {
  //   return <Text>Product not found</Text>;
  // }

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

      <Stack.Screen options={{ title: product?.name }} />
      <Image
        source={{ uri: product?.images[0].uri || defaultPizzaImage }}
        style={styles.image}
      />
      <Text style={styles.title}>{product?.name}</Text>
      <Text style={styles.price}>
        RM{product?.price1}-RM{product?.price2}
      </Text>
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
