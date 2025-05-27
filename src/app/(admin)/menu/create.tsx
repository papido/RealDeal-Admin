import { firestore } from "@/config/firebase";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/services/productService";
import Button from "@/src/components/Button";
import ImageUpload from "@/src/components/ImageUpload";
import { colors } from "@/src/constants/theme";
import { useAuth } from "@/src/providers/authProvider";
import { ProductType } from "@/src/types";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
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
    uid: user?.uid,
  });
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isUpdating = !!id;

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

  const onSubmit = async () => {
    setErrors("");
    if (!product.name.trim() || product.images.length === 0) {
      setErrors("Please fill all the fields!");
      return;
    }
    setLoading(true);

    let res;
    if (isUpdating) {
      res = await updateProduct(product.id!, product);
    } else {
      res = await createProduct(product);
    }

    setLoading(false);
    if (res.success) {
      router.push("/(admin)/menu");
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

  const onDelete = async () => {
    if (!product?.id) return;
    setLoading(true);
    const res = await deleteProduct(product?.id);
    setLoading(false);
    if (res.success) {
      router.push("/(admin)/menu");
    } else {
      Alert.alert("Product", res.msg);
    }
  };

  const showDeleteAlert = () => {
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
          <View style={{ flex: 1 / 3 }}>
            <ImageUpload
              file={item}
              onSelect={(file) =>
                setProduct((prev) => ({
                  ...prev,
                  images: prev.images.map((img) =>
                    img.id === item.id ? file : img
                  ),
                }))
              }
              onClear={() =>
                setProduct((prev) => ({
                  ...prev,
                  images: prev.images.filter((img) => img.id !== item.id),
                }))
              }
              placeholder="Upload Image"
            />
          </View>
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
        <Button onPress={onSubmit} loading={loading}>
          <Text style={styles.textButton}>
            {isUpdating ? "Update" : "Create"}
          </Text>
        </Button>
      )}
      {isUpdating && !loading && (
        <Text onPress={showDeleteAlert} style={styles.textButton}>
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
