import useFetchData from "@/services/useFetchData";
import Loading from "@/src/components/Loading";
import ProductListItem from "@/src/components/ProductListItem";
import { useAuth } from "@/src/providers/authProvider";
import { ProductType } from "@/src/types";
import { useRouter } from "expo-router";
import { where } from "firebase/firestore";
import React from "react";
import { FlatList } from "react-native";

const MenuScreen = () => {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data: products,
    error,
    loading,
  } = useFetchData<ProductType>("products", [where("uid", "==", user?.uid)]);
  if (loading) return <Loading />;
  return (
    <FlatList
      data={products}
      renderItem={({ item }) => <ProductListItem product={item} />}
      numColumns={2}
      contentContainerStyle={{ gap: 10, padding: 10 }}
      columnWrapperStyle={{ gap: 10 }}
    />
  );
};

export default MenuScreen;
