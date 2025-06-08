import { Stack } from "expo-router";
import React from "react";

export default function OrderStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Orders" }} />
      {/* <Stack.Screen
        name="qrPayment"
        options={{ title: "Upload Payment Proof" }}
      /> */}
    </Stack>
  );
}
