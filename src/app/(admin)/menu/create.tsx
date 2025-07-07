import { createProduct } from "@/services/productService";
import Button from "@/src/components/Button";
import ImageUpload from "@/src/components/ImageUpload";
import { colors } from "@/src/constants/theme";
import { useAuth } from "@/src/providers/authProvider";
import { ProductItem, ProductType } from "@/src/types";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
    price: "",
    prepTime: "",
    description: "",
    speciality: "",
    items: [],
  });
  const router = useRouter();

  const onSubmit = async () => {
    setErrors("");
    if (!product.name.trim() || product.images.length === 0) {
      setErrors("Please fill all the fields!");
      return;
    }
    setLoading(true);

    const res = await createProduct(product);

    setLoading(false);
    if (res.success) {
      setProduct({
        name: "",
        images: [],
        uid: user?.uid,
        price: "",
        prepTime: "",
        description: "",
        speciality: "",
        items: [],
      });
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
            <Text style={styles.textButton}>Create</Text>
          </Button>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateProductScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  textButton: {
    alignSelf: "center",
    fontWeight: "bold",
    color: colors.black,
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
