import { createProduct } from "@/services/productService";
import Button from "@/src/components/Button";
import { ProductImage } from "@/src/components/ProductImage";
import { colors } from "@/src/constants/theme";
import { useAuth } from "@/src/providers/authProvider";
import { ProductType } from "@/src/types";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import uuid from "react-native-uuid";

const CreateProductScreen = () => {
  const { user } = useAuth();
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductType>({
    name: "",
    images: [],
  });
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isUpdating = !!id;

  const onSubmit = async () => {
    setErrors("");
    if (!product.name.trim() || product.images.length === 0) {
      setErrors("Please fill all the fields!");
      return;
    }

    const data: ProductType = {
      name: product.name,
      images: product.images,
      uid: user?.uid,
    };

    setLoading(true);
    const res = await createProduct(data);
    setLoading(false);
    console.log("result: ", res);
    if (res.success) {
      router.back();
    } else {
      Alert.alert("Product", res.msg);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      const newImage = {
        id: uuid.v4(),
        uri: selectedUri,
      };

      setProduct((prev) => ({
        ...prev,
        images: [...(prev.images || []), newImage],
      }));
    }
  };

  const onDelete = () => {
    console.warn("DELETE!!!!!!");
  };

  const confirmDelete = () => {
    Alert.alert("Confirm", "Are you sure you want to delete this product", [
      {
        text: "Cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: onDelete,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{ title: isUpdating ? "Update Product" : "Create Product" }}
      />
      <FlatList
        data={product.images}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ gap: 10 }}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 10,
          marginBottom: 10,
        }}
        renderItem={({ item }) => (
          <ProductImage uri={item.uri} width={100} height={100} />
        )}
      />
      <Text onPress={pickImage} style={styles.textButton}>
        Select Image
      </Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={product.name}
        onChangeText={(value) => setProduct({ ...product, name: value })}
        placeholder="Name"
        style={styles.input}
      />

      <Text style={{ color: "red" }}>{errors}</Text>
      {product.images.length > 5 ? (
        <Text style={{ color: "red" }}>Maximum 5 images allowed!</Text>
      ) : (
        <Button onPress={onSubmit}>
          <Text style={styles.textButton}>
            {isUpdating ? "Update" : "Create"}
          </Text>
        </Button>
      )}
      {isUpdating && (
        <Text onPress={confirmDelete} style={styles.textButton}>
          Delete
        </Text>
      )}
    </View>
  );
};

export default CreateProductScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    padding: 10,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 20,
  },
  label: {
    color: "gray",
    fontSize: 16,
  },
  image: {
    alignSelf: "center",
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: colors.black,
    marginVertical: 10,
  },
});
