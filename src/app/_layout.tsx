import CartProvider from "@/src/providers/CartProvider";
import { FontAwesome, SimpleLineIcons } from "@expo/vector-icons";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { AuthProvider } from "../providers/authProvider";

const RootLayout = () => {
  useEffect(() => {
    Font.loadAsync({
      ...FontAwesome.font,
      ...SimpleLineIcons.font,
    });
  }, []);
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="(user)" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ presentation: "modal" }} />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
};

export default RootLayout;

const styles = StyleSheet.create({});
