import CartProvider from "@/src/providers/CartProvider";
import { FontAwesome, SimpleLineIcons } from "@expo/vector-icons";
import "config/firebase.ts";
import * as Font from "expo-font";
import * as Notifications from "expo-notifications";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { AuthProvider } from "../providers/authProvider";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

//Prevent splash screen from hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded] = Font.useFonts({
    SpaceMono: require("@assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
    ...SimpleLineIcons.font,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }

    // Suppress specific console warnings
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (args[0]?.includes?.("React Native Firebase namespaced API")) {
        return;
      }
      originalWarn(...args);
    };
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(admin)" options={{ headerShown: false }} />
          <Stack.Screen name="(user)" options={{ headerShown: false }} />
          <Stack.Screen
            name="cart"
            options={{ title: "Cart", presentation: "modal" }}
          />
          <Stack.Screen
            name="qrPayment"
            options={{
              title: "Order Summary & Payment",
              presentation: "modal",
              headerLeft: () => null,
              headerBackVisible: false,
            }}
          />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
};

export default RootLayout;
