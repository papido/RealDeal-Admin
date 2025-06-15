import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import Button from "../components/Button";
import TestPushNotification from "./testPushNotification";

const Index = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 10 }}>
      <Button onPress={() => router.push("/(user)/menu")}>
        <Text style={{ color: "white" }}>User</Text>
      </Button>

      <Button onPress={() => router.push("/(admin)")}>
        <Text style={{ color: "white" }}>Admin</Text>
      </Button>

      <Button onPress={() => router.push("/sign-in")}>
        <Text style={{ color: "white" }}>Sign In</Text>
      </Button>

      <TestPushNotification />
    </View>
  );
};

export default Index;
