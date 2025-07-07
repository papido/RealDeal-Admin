import { firestore } from "@/config/firebase";
import { deleteProduct, updateProduct } from "@/services/productService";
import Button from "@/src/components/Button";
import ImageUpload from "@/src/components/ImageUpload";
import { colors } from "@/src/constants/theme";
import { useAuth } from "@/src/providers/authProvider";
import { ProductItem, ProductType } from "@/src/types";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import uuid from "react-native-uuid";

const EditProductScreen = () => {
  const { user } = useAuth();
  const [errors, setErrors] = useState("");
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductType>({
    name: "",
    images: [],
    uid: user?.uid,
    price: "",
    prepTime: "",
    description: "",
    speciality: "",
    items: [],
  });
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const productDoc = await firestore()
          .collection("products")
          .doc(id as string)
          .get();

        if (productDoc.exists()) {
          const productData = productDoc.data();
          setProduct({
            id: productDoc.id,
            ...productData,
            items: productData?.items || [], // Ensure items is always an array
          } as ProductType);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to fetch product");
      } finally {
        setLoading(false);
      }
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

    const res = await updateProduct(product.id!, product);

    setLoading(false);
    if (res.success) {
      router.replace("/(admin)/menu");
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
      router.replace("/(admin)/menu");
    } else {
      Alert.alert("Product", res.msg);
    }
  };

  const showDeleteAlert = () => {
    Alert.alert("Confirm", "Are you sure you want to delete this product?", [
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

  const addNewItem = () => {
    const newItem: ProductItem = {
      id: uuid.v4() as string,
      name: "",
      price: 0,
    };
    setProduct((prev) => ({
      ...prev,
      items: [...(prev.items ?? []), newItem],
    }));
  };

  const removeItem = (itemId: string) => {
    setProduct((prev) => ({
      ...prev,
      items: prev.items?.filter((item) => item.id !== itemId),
    }));
  };

  if (loading && !product.id) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Stack.Screen options={{ title: "Create Product" }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {product.images.length > 0 && (
          <FlatList
            data={product.images}
            keyExtractor={(item) => item.id}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={{ gap: 10, marginBottom: 20 }}
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
        )}

        <Text onPress={pickImage} style={styles.textButton}>
          Select Image
        </Text>
        <Text style={styles.label}>Name</Text>
        <TextInput
          value={product.name}
          onChangeText={(value) => setProduct({ ...product, name: value })}
          placeholder="Product Name"
          placeholderTextColor={"gray"}
          style={styles.input}
        />

        <Text style={styles.label}>Price</Text>
        <TextInput
          value={product.price}
          onChangeText={(value) => setProduct({ ...product, price: value })}
          placeholder="Range Price"
          placeholderTextColor={"gray"}
          style={styles.input}
        />

        <Text style={styles.label}>Preparation Time</Text>
        <TextInput
          value={product.prepTime}
          onChangeText={(value) => setProduct({ ...product, prepTime: value })}
          placeholder="Preparation Time"
          placeholderTextColor={"gray"}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={product.description}
          onChangeText={(value) =>
            setProduct({ ...product, description: value })
          }
          placeholder="Description"
          placeholderTextColor={"gray"}
          style={styles.input}
        />

        <Text style={styles.label}>Speciality</Text>
        <TextInput
          value={product.speciality}
          onChangeText={(value) =>
            setProduct({ ...product, speciality: value })
          }
          placeholder="Speciality"
          placeholderTextColor={"gray"}
          style={styles.input}
        />

        <Text style={styles.label}>Portion</Text>
        <TextInput
          value={product.portion}
          onChangeText={(value) => setProduct({ ...product, portion: value })}
          placeholder="Portion"
          placeholderTextColor={"gray"}
          style={styles.input}
        />

        <View style={styles.itemsHeader}>
          <Text style={styles.label}>Items / Ingredients</Text>
          <Text onPress={addNewItem} style={styles.addButton}>
            Add Item
          </Text>
        </View>

        {(product.items ?? []).map((item, index) => (
          <View key={item.id} style={styles.itemContainer}>
            <TextInput
              value={item.name}
              onChangeText={(value) => {
                const updatedItems = [...(product.items ?? [])];
                updatedItems[index] = { ...updatedItems[index], name: value };
                setProduct({ ...product, items: updatedItems });
              }}
              placeholder="Item name"
              placeholderTextColor={"gray"}
              style={styles.input}
            />
            <TextInput
              value={item.price.toString()}
              onChangeText={(value) => {
                const updatedItems = [...(product.items ?? [])];
                updatedItems[index] = {
                  ...updatedItems[index],
                  price: Number(value) || 0,
                };
                setProduct({ ...product, items: updatedItems });
              }}
              placeholder="Item price"
              placeholderTextColor={"gray"}
              keyboardType="numeric"
              style={styles.input}
            />

            <Text
              onPress={() => removeItem(item.id)}
              style={styles.removeButton}
            >
              Remove
            </Text>
          </View>
        ))}

        <Text style={{ color: "red" }}>{errors}</Text>

        {product.images.length > 5 ? (
          <Text style={{ color: "red" }}>Maximum 5 images allowed!</Text>
        ) : (
          <Button onPress={onSubmit} loading={loading} disabled={loading}>
            <Text style={styles.textButton}>Update</Text>
          </Button>
        )}

        <TouchableOpacity onPress={showDeleteAlert}>
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 20,
    fontSize: 16,
    color: "black",
  },
  label: {
    color: "gray",
    fontSize: 16,
  },
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: colors.black,
    marginVertical: 10,
  },
  deleteButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: "red",
    marginVertical: 10,
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addButton: {
    color: colors.black,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  itemContainer: {
    marginBottom: 10,
  },
  removeButton: {
    color: "red",
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 10,
  },
});
