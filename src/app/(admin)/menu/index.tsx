import useFetchData from "@/services/useFetchData";
import Loading from "@/src/components/Loading";
import ProductListItem from "@/src/components/ProductListItem";
import { useAuth } from "@/src/providers/authProvider";
import { ProductType } from "@/src/types";
import { router } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MenuScreen = () => {
  const { user, logout } = useAuth();

  const { data: products, loading } = useFetchData<ProductType>(
    "products",
    (ref) => {
      if (!user?.uid) return ref; // Or return null to skip the query altogether

      return ref.where("uid", "==", user.uid).orderBy("createdAt", "desc");
    }
  );

  if (loading) return <Loading />;

  return (
    <>
      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
      {products.length > 0 ? (
        <FlatList
          data={products}
          renderItem={({ item }) => (
            <ProductListItem product={item} router={router} />
          )}
          numColumns={2}
          contentContainerStyle={{ gap: 10, padding: 10 }}
          columnWrapperStyle={{ gap: 10 }}
        />
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={styles.text}>No products found</Text>
        </View>
      )}
    </>
  );
};

export default MenuScreen;

const styles = StyleSheet.create({
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: "#f44336",
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  logoutText: {
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
